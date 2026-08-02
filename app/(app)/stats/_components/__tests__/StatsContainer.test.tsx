// HeroUI の Dropdown は jsdom で開けないため、選択肢をそのままボタンとして描画する。
jest.mock("@app/components/filter/FilterChip", () => ({
  __esModule: true,
  default: ({
    label,
    options,
    onChange,
  }: {
    label: string;
    options: { key: string; label: string }[];
    onChange: (key: string) => void;
  }) => (
    <>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
        >
          {label}: {option.label}
        </button>
      ))}
    </>
  ),
}));

jest.mock("../../actions", () => ({
  getBattingStats: jest.fn(),
  getPitchingStats: jest.fn(),
}));

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { monthOptionsFromRecorded } from "@app/components/filter/monthOptions";
import { getBattingStats } from "../../actions";
import StatsContainer from "../StatsContainer";

const mockGetBattingStats = getBattingStats as jest.MockedFunction<
  typeof getBattingStats
>;

const CURRENT_YEAR = String(new Date().getFullYear());

function renderContainer() {
  render(
    <StatsContainer
      initialRows={[]}
      analysisSlot={null}
      pitchingAnalysisSlot={null}
      seasonOptions={[]}
      tournamentOptions={[{ key: "7", label: "県大会" }]}
      monthOptions={monthOptionsFromRecorded(["2026-06", "2026-04"])}
    />,
  );
}

/** 月/日表示に切り替えないとテーブル専用フィルタが出ないため、先に「月」を選ぶ。 */
async function switchToMonthlyPeriod(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "月" }));
  await waitFor(() => expect(mockGetBattingStats).toHaveBeenCalled());
  mockGetBattingStats.mockClear();
}

describe("StatsContainer のテーブルフィルタ", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetBattingStats.mockResolvedValue([]);
  });

  it("大会を選ぶと tournamentId 付きで再取得する", async () => {
    const user = userEvent.setup();
    renderContainer();
    await switchToMonthlyPeriod(user);

    await user.click(screen.getByRole("button", { name: "大会: 県大会" }));

    await waitFor(() =>
      expect(mockGetBattingStats).toHaveBeenCalledWith(
        "monthly",
        expect.objectContaining({ tournamentId: "7" }),
      ),
    );
  });

  it("月範囲を選ぶと start_month / end_month 付きで再取得し、年度は外れる", async () => {
    const user = userEvent.setup();
    renderContainer();
    await switchToMonthlyPeriod(user);

    await user.click(screen.getByRole("button", { name: "開始: 2026年4月" }));
    await user.click(screen.getByRole("button", { name: "終了: 2026年6月" }));

    await waitFor(() =>
      expect(mockGetBattingStats).toHaveBeenLastCalledWith("monthly", {
        startMonth: "2026-04",
        endMonth: "2026-06",
        year: undefined,
      }),
    );
  });

  it("記録のない月は選択肢に出ない", async () => {
    const user = userEvent.setup();
    renderContainer();
    await switchToMonthlyPeriod(user);

    expect(
      screen.queryByRole("button", { name: "開始: 2026年5月" }),
    ).not.toBeInTheDocument();
  });

  // 全期間の月別テーブルは煩雑なので、月/日表示のクリアは「当年」に戻す（全解除にしない）。
  it("クリアで大会・月範囲が外れ、当年の絞り込みに戻る", async () => {
    const user = userEvent.setup();
    renderContainer();
    await switchToMonthlyPeriod(user);

    await user.click(screen.getByRole("button", { name: "大会: 県大会" }));
    await user.click(screen.getByRole("button", { name: "開始: 2026年4月" }));
    await user.click(
      screen.getByRole("button", { name: "フィルターをクリア" }),
    );

    await waitFor(() =>
      expect(mockGetBattingStats).toHaveBeenLastCalledWith("monthly", {
        year: CURRENT_YEAR,
      }),
    );
  });

  // 当年で絞った状態は自動設定であってユーザー操作ではないため、クリアは出さない。
  it("月表示にしただけではクリアボタンを出さない", async () => {
    const user = userEvent.setup();
    renderContainer();
    await switchToMonthlyPeriod(user);

    expect(
      screen.queryByRole("button", { name: "フィルターをクリア" }),
    ).not.toBeInTheDocument();
  });

  it("絞り込みを足すとクリアボタンが出る", async () => {
    const user = userEvent.setup();
    renderContainer();
    await switchToMonthlyPeriod(user);

    await user.click(screen.getByRole("button", { name: "大会: 県大会" }));

    expect(
      screen.getByRole("button", { name: "フィルターをクリア" }),
    ).toBeInTheDocument();
  });

  it("月表示に切り替えたときは当年で絞る", async () => {
    const user = userEvent.setup();
    renderContainer();

    await user.click(screen.getByRole("button", { name: "月" }));

    await waitFor(() =>
      expect(mockGetBattingStats).toHaveBeenCalledWith("monthly", {
        year: CURRENT_YEAR,
      }),
    );
  });
});
