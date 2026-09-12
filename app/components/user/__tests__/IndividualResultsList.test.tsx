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

jest.mock("@app/services/v2/dashboardStatsService", () => ({
  getDashboardBattingStats: jest.fn(),
  getDashboardPitchingStats: jest.fn(),
  getUserStatsFilterOptions: jest.fn(),
}));

import type {
  BattingStats,
  PitchingStats,
} from "@app/interface/dashboardStats";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  getDashboardBattingStats,
  getDashboardPitchingStats,
  getUserStatsFilterOptions,
} from "@app/services/v2/dashboardStatsService";
import IndividualResultsList from "../IndividualResultsList";

const mockBattingStats = getDashboardBattingStats as jest.MockedFunction<
  typeof getDashboardBattingStats
>;
const mockPitchingStats = getDashboardPitchingStats as jest.MockedFunction<
  typeof getDashboardPitchingStats
>;
const mockFilterOptions = getUserStatsFilterOptions as jest.MockedFunction<
  typeof getUserStatsFilterOptions
>;

const USER_ID = 42;

const battingStats: BattingStats = {
  aggregate: {
    number_of_matches: 12,
    hit: 21,
    two_base_hit: 5,
    three_base_hit: 2,
    home_run: 3,
    total_bases: 39,
    runs_batted_in: 17,
    run: 14,
    stealing_base: 6,
    caught_stealing: 1,
    times_at_bat: 60,
    at_bats: 52,
    base_on_balls: 7,
    hit_by_pitch: 1,
    sacrifice_hit: 4,
    sacrifice_fly: 2,
    strike_out: 9,
    error: 3,
  },
  calculated: {
    batting_average: 0.404,
    on_base_percentage: 0.467,
    slugging_percentage: 0.75,
    ops: 1.217,
    iso: 0.346,
    bb_per_k: 0.778,
    isod: 0.063,
  },
};

const pitchingStats: PitchingStats = {
  aggregate: {
    number_of_appearances: 8,
    win: 5,
    loss: 2,
    complete_games: 3,
    shutouts: 1,
    saves: 4,
    hold: 6,
    innings_pitched: 45.2,
    hits_allowed: 33,
    home_runs_hit: 2,
    strikeouts: 51,
    base_on_balls: 12,
    hit_by_pitch: 3,
    run_allowed: 18,
    earned_run: 15,
    number_of_pitches: 720,
  },
  calculated: {
    era: 2.96,
    win_percentage: 0.714,
    whip: 0.99,
    k_per_nine: 10.05,
    bb_per_nine: 2.37,
    k_bb: 4.25,
  },
};

const emptyBatting: BattingStats = { aggregate: null, calculated: null };
const emptyPitching: PitchingStats = { aggregate: null, calculated: null };

/** ラベルセルと同じ行にある値セルのテキストを返す。 */
function statValue(label: string): string {
  const labelCell = screen.getByText(label, { selector: "p, button" });
  return labelCell.parentElement?.querySelector("span")?.textContent ?? "";
}

/** セクション内のラベルセルを DOM の並び順で返す。 */
function statLabels(heading: string, expected: string[]): string[] {
  const section = screen
    .getByRole("heading", { name: heading })
    .closest("section");
  if (!section) throw new Error(`section not found: ${heading}`);
  return Array.from(section.querySelectorAll("p, button"))
    .map((element) => element.textContent ?? "")
    .filter((text) => expected.includes(text));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockFilterOptions.mockResolvedValue({
    years: [
      { key: "2024", label: "2024" },
      { key: "2023", label: "2023" },
    ],
    matchTypes: [{ key: "regular", label: "公式戦" }],
    seasons: [{ key: "3", label: "2024年春" }],
  });
  mockBattingStats.mockResolvedValue({ status: "ok", data: battingStats });
  mockPitchingStats.mockResolvedValue({ status: "ok", data: pitchingStats });
});

describe("IndividualResultsList", () => {
  describe("v2 レスポンスの描画", () => {
    it("打撃成績を calculated / aggregate の正しいキーで表示する", async () => {
      render(<IndividualResultsList userId={USER_ID} />);

      expect(await screen.findByText("打撃成績")).toBeInTheDocument();

      expect(statValue("打率")).toBe(".404");
      expect(statValue("試合")).toBe("12");
      expect(statValue("打席")).toBe("60");
      expect(statValue("打数")).toBe("52");
      expect(statValue("安打")).toBe("21");
      expect(statValue("二塁打")).toBe("5");
      expect(statValue("三塁打")).toBe("2");
      expect(statValue("本塁打")).toBe("3");
      expect(statValue("塁打")).toBe("39");
      expect(statValue("打点")).toBe("17");
      expect(statValue("得点")).toBe("14");
      expect(statValue("三振")).toBe("9");
      expect(statValue("四球")).toBe("7");
      expect(statValue("死球")).toBe("1");
      expect(statValue("犠打")).toBe("4");
      expect(statValue("犠飛")).toBe("2");
      expect(statValue("盗塁")).toBe("6");
      expect(statValue("盗塁死")).toBe("1");
      expect(statValue("出塁率")).toBe(".467");
      expect(statValue("長打率")).toBe(".750");
      expect(statValue("OPS")).toBe("1.217");
      expect(statValue("ISO")).toBe(".346");
      expect(statValue("ISOD")).toBe(".063");
      expect(statValue("BB/K")).toBe(".778");
    });

    it("打撃のヘッドラインを表示する", async () => {
      render(<IndividualResultsList userId={USER_ID} />);

      expect(await screen.findByText("打撃成績")).toBeInTheDocument();
      expect(screen.getByText("12試合").parentElement?.textContent).toBe(
        "打率.40412試合",
      );
      expect(
        screen.getByText("60打席 52打数 21安打 / 17打点 3本塁打"),
      ).toBeInTheDocument();
    });

    it("投手成績を calculated / aggregate の正しいキーで表示する", async () => {
      render(<IndividualResultsList userId={USER_ID} />);

      expect(await screen.findByText("投手成績")).toBeInTheDocument();

      expect(statValue("防御率")).toBe("2.96");
      expect(statValue("登板")).toBe("8");
      expect(statValue("勝")).toBe("5");
      expect(statValue("敗")).toBe("2");
      expect(statValue("投球回")).toBe("45.2");
      expect(statValue("完投")).toBe("3");
      expect(statValue("完封")).toBe("1");
      expect(statValue("セーブ")).toBe("4");
      expect(statValue("ホールド")).toBe("6");
      expect(statValue("奪三振")).toBe("51");
      expect(statValue("与四球")).toBe("12");
      expect(statValue("与死球")).toBe("3");
      expect(statValue("被安打")).toBe("33");
      expect(statValue("被本塁打")).toBe("2");
      expect(statValue("失点")).toBe("18");
      expect(statValue("自責点")).toBe("15");
      expect(statValue("勝率")).toBe(".714");
      expect(statValue("WHIP")).toBe("0.99");
      expect(statValue("K/9")).toBe("10.05");
      expect(statValue("BB/9")).toBe("2.37");
      expect(statValue("K/BB")).toBe("4.25");
      expect(statValue("総投球数")).toBe("720");
    });

    it("投手のヘッドラインを表示する", async () => {
      render(<IndividualResultsList userId={USER_ID} />);

      expect(await screen.findByText("投手成績")).toBeInTheDocument();
      expect(screen.getByText("8登板").parentElement?.textContent).toBe(
        "防御率2.968登板",
      );
      expect(screen.getByText("5勝 2敗 / 45.2回 51奪三振")).toBeInTheDocument();
    });

    it("mobile の ProfileStatsTab と同じ項目・並びで表示する", async () => {
      render(<IndividualResultsList userId={USER_ID} />);

      expect(await screen.findByText("打撃成績")).toBeInTheDocument();

      const battingLabels = [
        "打率",
        "打席",
        "安打",
        "三塁打",
        "塁打",
        "得点",
        "四球",
        "犠打",
        "盗塁",
        "出塁率",
        "OPS",
        "ISOD",
        "試合",
        "打数",
        "二塁打",
        "本塁打",
        "打点",
        "三振",
        "死球",
        "犠飛",
        "盗塁死",
        "長打率",
        "ISO",
        "BB/K",
      ];
      expect(statLabels("打撃成績", battingLabels)).toEqual(battingLabels);

      const pitchingLabels = [
        "防御率",
        "勝",
        "投球回",
        "完封",
        "ホールド",
        "与四球",
        "被安打",
        "失点",
        "勝率",
        "K/9",
        "K/BB",
        "登板",
        "敗",
        "完投",
        "セーブ",
        "奪三振",
        "与死球",
        "被本塁打",
        "自責点",
        "WHIP",
        "BB/9",
        "総投球数",
      ];
      expect(statLabels("投手成績", pitchingLabels)).toEqual(pitchingLabels);
    });
  });

  describe("非公開アカウント（403）", () => {
    beforeEach(() => {
      mockBattingStats.mockResolvedValue({ status: "forbidden" });
      mockPitchingStats.mockResolvedValue({ status: "forbidden" });
    });

    it("専用メッセージを表示し、成績を 0 として描画しない", async () => {
      render(<IndividualResultsList userId={USER_ID} />);

      expect(
        await screen.findByText("このアカウントは非公開です"),
      ).toBeInTheDocument();

      expect(screen.queryByText("打撃成績")).not.toBeInTheDocument();
      expect(screen.queryByText("投手成績")).not.toBeInTheDocument();
      expect(
        screen.queryByText("成績データがありません"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("0")).not.toBeInTheDocument();
      expect(screen.queryByText(".000")).not.toBeInTheDocument();
    });

    it("打撃だけが 403 でも非公開として扱う", async () => {
      mockPitchingStats.mockResolvedValue({
        status: "ok",
        data: emptyPitching,
      });

      render(<IndividualResultsList userId={USER_ID} />);

      expect(
        await screen.findByText("このアカウントは非公開です"),
      ).toBeInTheDocument();
      expect(screen.queryByText("打撃成績")).not.toBeInTheDocument();
    });
  });

  describe("取得失敗", () => {
    it("エラーメッセージを表示し、0 を描画しない", async () => {
      mockBattingStats.mockResolvedValue({ status: "error" });
      mockPitchingStats.mockResolvedValue({ status: "error" });

      render(<IndividualResultsList userId={USER_ID} />);

      expect(
        await screen.findByText(
          "成績の取得に失敗しました。時間をおいて再度お試しください。",
        ),
      ).toBeInTheDocument();

      expect(screen.queryByText("打撃成績")).not.toBeInTheDocument();
      expect(screen.queryByText("投手成績")).not.toBeInTheDocument();
      expect(
        screen.queryByText("成績データがありません"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("0")).not.toBeInTheDocument();
      expect(screen.queryByText("-")).not.toBeInTheDocument();
    });

    it("片方だけ失敗した場合も成績を描画しない", async () => {
      mockPitchingStats.mockResolvedValue({ status: "error" });

      render(<IndividualResultsList userId={USER_ID} />);

      expect(
        await screen.findByText(
          "成績の取得に失敗しました。時間をおいて再度お試しください。",
        ),
      ).toBeInTheDocument();
      expect(screen.queryByText("打撃成績")).not.toBeInTheDocument();
    });
  });

  describe("成績が 0 件", () => {
    it("空状態を表示する", async () => {
      mockBattingStats.mockResolvedValue({ status: "ok", data: emptyBatting });
      mockPitchingStats.mockResolvedValue({
        status: "ok",
        data: emptyPitching,
      });

      render(<IndividualResultsList userId={USER_ID} />);

      expect(
        await screen.findByText("成績データがありません"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("試合結果を記録すると、ここに成績が表示されます"),
      ).toBeInTheDocument();
      expect(screen.queryByText("打撃成績")).not.toBeInTheDocument();
      expect(screen.queryByText("投手成績")).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          "成績の取得に失敗しました。時間をおいて再度お試しください。",
        ),
      ).not.toBeInTheDocument();
    });

    it("打撃のみ記録がある場合は投手セクションを出さない", async () => {
      mockPitchingStats.mockResolvedValue({
        status: "ok",
        data: emptyPitching,
      });

      render(<IndividualResultsList userId={USER_ID} />);

      expect(await screen.findByText("打撃成績")).toBeInTheDocument();
      expect(screen.queryByText("投手成績")).not.toBeInTheDocument();
      expect(
        screen.queryByText("成績データがありません"),
      ).not.toBeInTheDocument();
    });
  });

  describe("絞り込み", () => {
    it("初期表示では絞り込み無しで対象ユーザーの成績を取得する", async () => {
      render(<IndividualResultsList userId={USER_ID} />);

      await waitFor(() => expect(mockBattingStats).toHaveBeenCalled());
      expect(mockBattingStats).toHaveBeenCalledWith(USER_ID, {});
      expect(mockPitchingStats).toHaveBeenCalledWith(USER_ID, {});
      expect(mockFilterOptions).toHaveBeenCalledWith(USER_ID);
    });

    it("年度を変えると年度付きで打撃・投手の両方を取り直す", async () => {
      const user = userEvent.setup();
      render(<IndividualResultsList userId={USER_ID} />);

      await user.click(
        await screen.findByRole("button", { name: "年度: 2024" }),
      );

      await waitFor(() =>
        expect(mockBattingStats).toHaveBeenCalledWith(
          USER_ID,
          expect.objectContaining({ year: "2024" }),
        ),
      );
      expect(mockPitchingStats).toHaveBeenCalledWith(
        USER_ID,
        expect.objectContaining({ year: "2024" }),
      );
    });

    it("試合種別を変えると match_type 相当の値付きで取り直す", async () => {
      const user = userEvent.setup();
      render(<IndividualResultsList userId={USER_ID} />);

      await user.click(
        await screen.findByRole("button", { name: "種別: 公式戦" }),
      );

      await waitFor(() =>
        expect(mockBattingStats).toHaveBeenCalledWith(
          USER_ID,
          expect.objectContaining({ matchType: "regular" }),
        ),
      );
      expect(mockPitchingStats).toHaveBeenCalledWith(
        USER_ID,
        expect.objectContaining({ matchType: "regular" }),
      );
    });

    it("シーズンを変えるとシーズン ID 付きで取り直す", async () => {
      const user = userEvent.setup();
      render(<IndividualResultsList userId={USER_ID} />);

      await user.click(
        await screen.findByRole("button", { name: "シーズン: 2024年春" }),
      );

      await waitFor(() =>
        expect(mockBattingStats).toHaveBeenCalledWith(
          USER_ID,
          expect.objectContaining({ seasonId: "3" }),
        ),
      );
      expect(mockPitchingStats).toHaveBeenCalledWith(
        USER_ID,
        expect.objectContaining({ seasonId: "3" }),
      );
    });
  });
});
