import type { Goal, GoalBadge } from "@app/types/goal";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToStaticMarkup } from "react-dom/server";
import { achievementSummaryShownKey } from "@app/constants/goal";
import AchievementSummaryModal from "../_components/AchievementSummaryModal";

const MONTH_KEY = "2026-07";
const NEXT_MONTH_KEY = "2026-08";

function buildGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 1,
    title: "月20日練習",
    kind: "numeric",
    period_type: "monthly",
    season_id: null,
    tournament_id: null,
    month_start: "2026-07-01",
    deadline: "2026-07-31",
    metric_key: "practice_days",
    target_value: 20,
    comparison_type: "greater_than",
    practice_menu_id: null,
    practice_menu_name: null,
    custom_metric_label: null,
    custom_unit: null,
    manual_current_value: 0,
    is_achieved: true,
    is_finalized: true,
    achieved_value: 20,
    current_value: 20,
    progress_percent: 100,
    days_remaining: 0,
    ...overrides,
  };
}

function buildBadge(overrides: Partial<GoalBadge> = {}): GoalBadge {
  return {
    id: 1,
    badge_type: "monthly_achieved",
    badge_name: "月間目標達成",
    awarded_at: "2026-08-01T00:05:00.000+09:00",
    goal_id: 1,
    goal_title: "月20日練習",
    ...overrides,
  };
}

const HISTORY = [
  buildGoal({ id: 1, is_achieved: true }),
  buildGoal({ id: 2, is_achieved: false }),
];

const summaryText = () => screen.queryByText(/期限を迎えた目標/);

describe("AchievementSummaryModal", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it("前月に期限を迎えた目標があれば、達成件数付きの振り返りを表示する", () => {
    render(
      <AchievementSummaryModal
        monthKey={MONTH_KEY}
        history={HISTORY}
        badges={[]}
      />,
    );

    expect(screen.getByText("2026年7月の振り返り")).toBeInTheDocument();
    expect(screen.getByText(/期限を迎えた目標2件中/)).toBeInTheDocument();
    expect(screen.getByText("1件達成")).toBeInTheDocument();
  });

  it("前月に付与されたバッジの個数を表示する", () => {
    render(
      <AchievementSummaryModal
        monthKey={MONTH_KEY}
        history={HISTORY}
        badges={[
          buildBadge({ id: 1, awarded_at: "2026-07-05T10:00:00.000+09:00" }),
          buildBadge({ id: 2, awarded_at: "2026-07-31T10:00:00.000+09:00" }),
          buildBadge({ id: 3, awarded_at: "2026-08-01T10:00:00.000+09:00" }),
        ]}
      />,
    );

    expect(
      screen.getByText("新しいバッジを2個獲得しました"),
    ).toBeInTheDocument();
  });

  it("バッジが 0 個のときは獲得の文言を出さない", () => {
    render(
      <AchievementSummaryModal
        monthKey={MONTH_KEY}
        history={[buildGoal({ is_achieved: false })]}
        badges={[]}
      />,
    );

    expect(screen.getByText(/期限を迎えた目標1件中/)).toBeInTheDocument();
    expect(screen.queryByText(/新しいバッジ/)).not.toBeInTheDocument();
  });

  it("前月に期限を迎えた目標が無ければ表示しない", () => {
    render(
      <AchievementSummaryModal
        monthKey={MONTH_KEY}
        history={[buildGoal({ deadline: "2026-08-31" })]}
        badges={[]}
      />,
    );

    expect(summaryText()).not.toBeInTheDocument();
  });

  it("フラグの読み込みが確定するまで表示しない", () => {
    const html = renderToStaticMarkup(
      <AchievementSummaryModal
        monthKey={MONTH_KEY}
        history={HISTORY}
        badges={[]}
      />,
    );

    expect(html).not.toContain("期限を迎えた目標");
  });

  it("閉じると表示済みを保存し、同じ月の再訪では表示しない", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <AchievementSummaryModal
        monthKey={MONTH_KEY}
        history={HISTORY}
        badges={[]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "閉じる" }));
    expect(summaryText()).not.toBeInTheDocument();
    expect(localStorage.getItem(achievementSummaryShownKey(MONTH_KEY))).toBe(
      "1",
    );

    unmount();
    render(
      <AchievementSummaryModal
        monthKey={MONTH_KEY}
        history={HISTORY}
        badges={[]}
      />,
    );

    expect(summaryText()).not.toBeInTheDocument();
  });

  it("前月を表示済みでも、翌月分は改めて表示する", async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <AchievementSummaryModal
        monthKey={MONTH_KEY}
        history={HISTORY}
        badges={[]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "閉じる" }));
    unmount();

    render(
      <AchievementSummaryModal
        monthKey={NEXT_MONTH_KEY}
        history={[buildGoal({ deadline: "2026-08-31" })]}
        badges={[]}
      />,
    );

    expect(screen.getByText("2026年8月の振り返り")).toBeInTheDocument();
  });

  it("バッジを見るはバッジ一覧へのリンクで、押すと表示済みになる", async () => {
    const user = userEvent.setup();
    render(
      <AchievementSummaryModal
        monthKey={MONTH_KEY}
        history={HISTORY}
        badges={[]}
      />,
    );

    // HeroUI の Button は as={Link} でも role="button" の a 要素を描画する。
    const link = screen.getByRole("button", { name: "バッジを見る" });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/goals/badges");

    await user.click(link);

    expect(localStorage.getItem(achievementSummaryShownKey(MONTH_KEY))).toBe(
      "1",
    );
  });

  it("localStorage の読み込みが例外でも落ちず、表示済み扱いにする", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    expect(() =>
      render(
        <AchievementSummaryModal
          monthKey={MONTH_KEY}
          history={HISTORY}
          badges={[]}
        />,
      ),
    ).not.toThrow();
    expect(summaryText()).not.toBeInTheDocument();
  });

  it("localStorage の保存が例外でも落ちず、その場では閉じられる", async () => {
    const user = userEvent.setup();
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    render(
      <AchievementSummaryModal
        monthKey={MONTH_KEY}
        history={HISTORY}
        badges={[]}
      />,
    );

    await expect(
      user.click(screen.getByRole("button", { name: "閉じる" })),
    ).resolves.not.toThrow();
    expect(summaryText()).not.toBeInTheDocument();
  });
});
