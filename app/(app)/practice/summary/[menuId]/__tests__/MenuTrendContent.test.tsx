jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: jest.fn(), close: jest.fn() }),
}));

jest.mock("@app/lib/analytics", () => ({
  trackEvent: jest.fn(),
}));

import type { MenuTrend, MenuTrendBucket } from "@app/types/practice";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MenuTrendContent from "../_components/MenuTrendContent";

const SAMPLE_LABEL = "サンプルデータ（実際の記録ではありません）";
const DAY_LIMIT_NOTICE = "日別は記録のある直近60日分までの表示です";

const pad2 = (value: number) => String(value).padStart(2, "0");

const monthBuckets = (count: number): MenuTrendBucket[] =>
  Array.from({ length: count }, (_, index) => ({
    period: `2026-${pad2(12 - index)}`,
    total_amount: 100 + index,
    total_volume: 1000 + index,
    days_count: 3,
  }));

const dayBuckets = (count: number): MenuTrendBucket[] =>
  Array.from({ length: count }, (_, index) => ({
    period: `2026-08-${pad2(30 - index)}`,
    total_amount: 10 + index,
    total_volume: 100 + index,
    days_count: 1,
  }));

const buildTrend = (overrides: Partial<MenuTrend> = {}): MenuTrend => ({
  menu: {
    id: 1,
    name: "素振り",
    unit: "count",
    unit_label: "本",
    is_weight_reps: false,
  },
  by_year: [
    { period: "2026", total_amount: 1200, total_volume: 0, days_count: 40 },
    { period: "2025", total_amount: 900, total_volume: 0, days_count: 30 },
    { period: "2024", total_amount: 600, total_volume: 0, days_count: 20 },
    { period: "2023", total_amount: 300, total_volume: 0, days_count: 10 },
  ],
  by_month: monthBuckets(12),
  by_day: dayBuckets(20),
  ...overrides,
});

const renderTrend = (trend: MenuTrend = buildTrend()) =>
  render(<MenuTrendContent view={{ kind: "trend", trend }} />);

const rangeGroup = () => screen.getByRole("group", { name: "表示レンジ" });

const activeRangeLabel = () =>
  within(rangeGroup())
    .getAllByRole("button")
    .find((button) => button.getAttribute("aria-pressed") === "true")
    ?.textContent;

const rangeLabels = () =>
  within(rangeGroup())
    .getAllByRole("button")
    .map((button) => button.textContent);

const bucketRows = () => screen.getAllByRole("listitem");

describe("粒度タブ", () => {
  it("既定は月別で、直近1年ぶんを表示する", async () => {
    renderTrend();

    expect(screen.getByRole("button", { name: "月別" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(activeRangeLabel()).toBe("1年");
    expect(bucketRows()).toHaveLength(12);
  });

  it("年別へ切り替えるとレンジの選択肢と既定が年のものになる", async () => {
    const user = userEvent.setup();
    renderTrend();

    await user.click(screen.getByRole("button", { name: "年別" }));

    expect(rangeLabels()).toEqual(["3年", "5年", "全期間"]);
    expect(activeRangeLabel()).toBe("全期間");
    expect(bucketRows()).toHaveLength(4);
    expect(within(bucketRows()[0]).getByText("2026年")).toBeInTheDocument();
  });

  it("日別へ切り替えるとレンジの選択肢と既定が日のものになる", async () => {
    const user = userEvent.setup();
    renderTrend();

    await user.click(screen.getByRole("button", { name: "日別" }));

    expect(rangeLabels()).toEqual(["2週間", "1ヶ月", "3ヶ月", "全期間"]);
    expect(activeRangeLabel()).toBe("1ヶ月");
    expect(within(bucketRows()[0]).getByText("8/30")).toBeInTheDocument();
  });

  it("月別のレンジは 6ヶ月 / 1年 / 2年 / 全期間", async () => {
    renderTrend();

    expect(rangeLabels()).toEqual(["6ヶ月", "1年", "2年", "全期間"]);
  });
});

describe("表示レンジ", () => {
  it("選んだレンジの件数だけ新しい順に表示する", async () => {
    const user = userEvent.setup();
    renderTrend();

    await user.click(screen.getByRole("button", { name: "6ヶ月" }));

    expect(bucketRows()).toHaveLength(6);
    expect(within(bucketRows()[0]).getByText("2026/12")).toBeInTheDocument();
  });

  it("年別の3年は直近3件に絞る", async () => {
    const user = userEvent.setup();
    renderTrend();

    await user.click(screen.getByRole("button", { name: "年別" }));
    await user.click(screen.getByRole("button", { name: "3年" }));

    expect(bucketRows()).toHaveLength(3);
    expect(within(bucketRows()[2]).getByText("2024年")).toBeInTheDocument();
  });
});

describe("日別の上限", () => {
  it("60件返ってきたら上限の注記を出す", async () => {
    const user = userEvent.setup();
    renderTrend(buildTrend({ by_day: dayBuckets(60) }));

    await user.click(screen.getByRole("button", { name: "日別" }));

    expect(screen.getByText(DAY_LIMIT_NOTICE)).toBeInTheDocument();
  });

  it("上限未満なら注記を出さない", async () => {
    const user = userEvent.setup();
    renderTrend(buildTrend({ by_day: dayBuckets(59) }));

    await user.click(screen.getByRole("button", { name: "日別" }));

    expect(screen.queryByText(DAY_LIMIT_NOTICE)).not.toBeInTheDocument();
  });

  it("月別では日別の注記を出さない", () => {
    renderTrend(buildTrend({ by_day: dayBuckets(60) }));

    expect(screen.queryByText(DAY_LIMIT_NOTICE)).not.toBeInTheDocument();
  });
});

describe("表示単位", () => {
  it("通常メニューは量を単位ラベル付きで出す", () => {
    renderTrend();

    expect(within(bucketRows()[0]).getByText("100本")).toBeInTheDocument();
    expect(within(bucketRows()[0]).getByText("3日")).toBeInTheDocument();
  });

  it("weight_reps は総挙上重量で出す", () => {
    renderTrend(
      buildTrend({
        menu: {
          id: 2,
          name: "ベンチプレス",
          unit: "weight_reps",
          unit_label: "回",
          is_weight_reps: true,
        },
        by_month: [
          {
            period: "2026-08",
            total_amount: 620,
            total_volume: 8200,
            days_count: 12,
          },
        ],
      }),
    );

    expect(within(bucketRows()[0]).getByText("8.2t")).toBeInTheDocument();
    expect(screen.queryByText("620回")).not.toBeInTheDocument();
  });
});

describe("サンプル表示", () => {
  it("サンプルには SampleDataLabel と Pro 訴求を添える", () => {
    render(<MenuTrendContent view={{ kind: "sample", trend: buildTrend() }} />);

    expect(screen.getByText(SAMPLE_LABEL)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "メニューごとの推移を詳しく見る" }),
    ).toBeInTheDocument();
  });

  it("実データにはサンプルの断り書きを付けない", () => {
    renderTrend();

    expect(screen.queryByText(SAMPLE_LABEL)).not.toBeInTheDocument();
  });
});

describe("0件と取得失敗", () => {
  it("バケットが空なら記録なしの案内を出し、レンジ切替は出さない", () => {
    renderTrend(buildTrend({ by_year: [], by_month: [], by_day: [] }));

    expect(screen.getByText("まだ記録がありません")).toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "表示レンジ" }),
    ).not.toBeInTheDocument();
  });

  it("取得失敗は記録なしと別の文言にする", () => {
    render(<MenuTrendContent view={{ kind: "error" }} />);

    expect(screen.getByText(/推移を取得できませんでした/)).toBeInTheDocument();
    expect(screen.queryByText("まだ記録がありません")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "集計の粒度" }),
    ).not.toBeInTheDocument();
  });
});
