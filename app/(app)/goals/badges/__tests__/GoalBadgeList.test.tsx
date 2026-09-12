import type { GoalBadge } from "@app/types/goal";
import { render, screen } from "@testing-library/react";
import GoalBadgeList from "../_components/GoalBadgeList";

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

describe("GoalBadgeList", () => {
  it("バッジ名・元の目標・付与日を並べる", () => {
    render(<GoalBadgeList badges={[buildBadge()]} />);

    expect(screen.getByText("月間目標達成")).toBeInTheDocument();
    expect(screen.getByText("月20日練習")).toBeInTheDocument();
    expect(screen.getByText("2026/8/1")).toBeInTheDocument();
  });

  it("渡された順（back の付与日降順）をそのまま保つ", () => {
    render(
      <GoalBadgeList
        badges={[
          buildBadge({ id: 1, badge_name: "シーズン目標達成" }),
          buildBadge({ id: 2, badge_name: "大会目標達成" }),
        ]}
      />,
    );

    const names = screen
      .getAllByRole("listitem")
      .map((item) => item.textContent);
    expect(names[0]).toContain("シーズン目標達成");
    expect(names[1]).toContain("大会目標達成");
  });

  it("バッジが 0 件なら空状態を出す", () => {
    render(<GoalBadgeList badges={[]} />);

    expect(screen.getByText("まだ達成バッジはありません")).toBeInTheDocument();
    expect(
      screen.getByText("目標を達成すると、ここにバッジが並びます"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("付与日時が Asia/Tokyo で日をまたぐ値でも東京の日付で表示する", () => {
    render(
      <GoalBadgeList
        badges={[buildBadge({ awarded_at: "2026-07-31T15:30:00Z" })]}
      />,
    );

    expect(screen.getByText("2026/8/1")).toBeInTheDocument();
  });
});
