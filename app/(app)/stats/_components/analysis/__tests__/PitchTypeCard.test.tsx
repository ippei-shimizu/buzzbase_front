import type { PitchTypeRow } from "../../../analysisActions";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PitchTypeCard } from "../PitchTypeCard";

const buildRow = (id: number, label: string): PitchTypeRow => ({
  id,
  label,
  plate_appearances: 10,
  at_bats: 9,
  hits: 3,
  total_bases: 4,
  base_on_balls: 1,
  hit_by_pitch: 0,
  sacrifice_fly: 0,
  batting_average: 0.333,
  on_base_percentage: 0.4,
  slugging_percentage: 0.444,
  ops: 0.844,
  result_counts: [],
});

const buildCard = (rows: PitchTypeRow[]) => (
  <PitchTypeCard rows={rows} totalTargetPa={20} />
);

const renderCard = (
  rows: PitchTypeRow[] = [buildRow(1, "ストレート"), buildRow(2, "カーブ")],
) => render(buildCard(rows));

const toggleOf = (label: string) =>
  screen.getByRole("button", { name: new RegExp(label) });

describe("PitchTypeCard", () => {
  it("複数の球種のトグルを同時に開ける", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(toggleOf("ストレート"));
    await user.click(toggleOf("カーブ"));

    expect(toggleOf("ストレート")).toHaveAttribute("aria-expanded", "true");
    expect(toggleOf("カーブ")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByText("出塁率")).toHaveLength(2);
  });

  it("開いている球種を再度押すとその球種だけ閉じる", async () => {
    const user = userEvent.setup();
    renderCard();

    await user.click(toggleOf("ストレート"));
    await user.click(toggleOf("カーブ"));
    await user.click(toggleOf("ストレート"));

    expect(toggleOf("ストレート")).toHaveAttribute("aria-expanded", "false");
    expect(toggleOf("カーブ")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByText("出塁率")).toHaveLength(1);
  });

  // rows の差し替えは再フェッチでも起きるため、展開状態は意図的に持ち越す。
  it("rows が差し替わっても開いている球種の展開状態を保つ", async () => {
    const user = userEvent.setup();
    const { rerender } = renderCard();

    await user.click(toggleOf("ストレート"));
    rerender(buildCard([buildRow(1, "ストレート"), buildRow(3, "スライダー")]));

    expect(toggleOf("ストレート")).toHaveAttribute("aria-expanded", "true");
    expect(toggleOf("スライダー")).toHaveAttribute("aria-expanded", "false");
    expect(screen.getAllByText("出塁率")).toHaveLength(1);
  });

  it("開閉記号を読み上げ対象から外す", () => {
    renderCard();

    expect(toggleOf("ストレート")).not.toHaveAccessibleName(/▶/);
  });
});
