import type { DashboardData } from "../../actions";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { INVITE_CARD_DISMISSED_STORAGE_KEY } from "@app/constants/onboarding";
import DashboardWelcome from "../DashboardWelcome";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const RECORD_TITLE = "BUZZ BASEへようこそ";
const INVITE_TITLE = "チームメイトと競い合おう";

const emptyData: DashboardData = {
  recent_game_results: [],
  batting_stats: { aggregate: null, calculated: null },
  pitching_stats: { aggregate: null, calculated: null },
  group_rankings: [],
  available_years: [],
};

const buildData = (overrides: Partial<DashboardData>): DashboardData => ({
  ...emptyData,
  ...overrides,
});

const gameResult = {
  id: 1,
  date: "2026-04-01",
  opponent_team_name: "対戦チーム",
  my_team_score: 3,
  opponent_team_score: 1,
  match_type: "公式戦",
  batting_average: null,
  pitching_result: null,
};

const groupRanking = {
  group_id: 1,
  group_name: "チームA",
  group_icon: null,
  total_members: 5,
  batting_rankings: [],
  pitching_rankings: [],
};

const recordedData = buildData({ recent_game_results: [gameResult] });

describe("DashboardWelcome", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  describe("段階的オンボーディング", () => {
    it("未記録なら記録カードだけを出す", () => {
      render(<DashboardWelcome data={emptyData} />);

      expect(screen.getByText(RECORD_TITLE)).toBeInTheDocument();
      expect(screen.queryByText(INVITE_TITLE)).not.toBeInTheDocument();
    });

    it("記録済みでグループ未所属なら招待カードだけを出す", () => {
      render(<DashboardWelcome data={recordedData} />);

      expect(screen.getByText(INVITE_TITLE)).toBeInTheDocument();
      expect(screen.queryByText(RECORD_TITLE)).not.toBeInTheDocument();
    });

    it("記録済みでグループ所属済みならどちらも出さない", () => {
      render(
        <DashboardWelcome
          data={buildData({
            recent_game_results: [gameResult],
            group_rankings: [groupRanking],
          })}
        />,
      );

      expect(screen.queryByText(RECORD_TITLE)).not.toBeInTheDocument();
      expect(screen.queryByText(INVITE_TITLE)).not.toBeInTheDocument();
    });

    it("試合一覧が空でも打撃成績があれば記録済みとして扱う", () => {
      render(
        <DashboardWelcome
          data={buildData({
            batting_stats: {
              aggregate: { ...emptyData.batting_stats.aggregate },
              calculated: null,
            } as DashboardData["batting_stats"],
          })}
        />,
      );

      expect(screen.getByText(INVITE_TITLE)).toBeInTheDocument();
    });

    it("試合一覧が空でも投手成績があれば記録済みとして扱う", () => {
      render(
        <DashboardWelcome
          data={buildData({
            pitching_stats: {
              aggregate: { ...emptyData.pitching_stats.aggregate },
              calculated: null,
            } as DashboardData["pitching_stats"],
          })}
        />,
      );

      expect(screen.getByText(INVITE_TITLE)).toBeInTheDocument();
    });

    it("グループ未所属でもデータ取得に失敗していれば何も出さない", () => {
      render(<DashboardWelcome data={null} />);

      expect(screen.queryByText(RECORD_TITLE)).not.toBeInTheDocument();
      expect(screen.queryByText(INVITE_TITLE)).not.toBeInTheDocument();
    });
  });

  describe("招待カードの表示内容", () => {
    it("ランキングプレビューとグループ作成への導線を持つ", () => {
      render(<DashboardWelcome data={recordedData} />);

      expect(screen.getByText("グループ内ランキング")).toBeInTheDocument();
      expect(screen.getByText(".380")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "友達を招待する" }),
      ).toHaveAttribute("href", "/groups/new");
    });

    it("記録カードは成績プレビューと記録開始ボタンを持つ", () => {
      render(<DashboardWelcome data={emptyData} />);

      expect(
        screen.getByText("記録するとこう計算されます"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "最初の試合を記録する" }),
      ).toBeInTheDocument();
    });

    it("記録カードには閉じるボタンがない", () => {
      render(<DashboardWelcome data={emptyData} />);

      expect(
        screen.queryByRole("button", { name: "このカードを閉じる" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("招待カードの dismiss", () => {
    it("× で閉じるとその場で消え、再訪問しても出ない", async () => {
      const user = userEvent.setup();
      const { unmount } = render(<DashboardWelcome data={recordedData} />);

      await user.click(
        screen.getByRole("button", { name: "このカードを閉じる" }),
      );
      expect(screen.queryByText(INVITE_TITLE)).not.toBeInTheDocument();

      unmount();
      render(<DashboardWelcome data={recordedData} />);

      expect(screen.queryByText(INVITE_TITLE)).not.toBeInTheDocument();
    });

    it("dismiss 済みフラグが保存されていれば最初から出ない", () => {
      localStorage.setItem(INVITE_CARD_DISMISSED_STORAGE_KEY, "1");

      render(<DashboardWelcome data={recordedData} />);

      expect(screen.queryByText(INVITE_TITLE)).not.toBeInTheDocument();
    });

    it("dismiss しても記録カードの表示条件には影響しない", () => {
      localStorage.setItem(INVITE_CARD_DISMISSED_STORAGE_KEY, "1");

      render(<DashboardWelcome data={emptyData} />);

      expect(screen.getByText(RECORD_TITLE)).toBeInTheDocument();
    });
  });

  describe("ちらつき防止と localStorage 障害", () => {
    it("SSR 時点では招待カードを描画しない", () => {
      const html = renderToStaticMarkup(
        <DashboardWelcome data={recordedData} />,
      );

      expect(html).not.toContain(INVITE_TITLE);
    });

    it("localStorage が例外を投げても招待カードは出さずクラッシュしない", () => {
      jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("SecurityError");
      });

      expect(() =>
        render(<DashboardWelcome data={recordedData} />),
      ).not.toThrow();
      expect(screen.queryByText(INVITE_TITLE)).not.toBeInTheDocument();
    });

    it("保存に失敗しても閉じた直後は非表示のままになる", async () => {
      const user = userEvent.setup();
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      render(<DashboardWelcome data={recordedData} />);
      await user.click(
        screen.getByRole("button", { name: "このカードを閉じる" }),
      );

      expect(screen.queryByText(INVITE_TITLE)).not.toBeInTheDocument();
    });
  });
});
