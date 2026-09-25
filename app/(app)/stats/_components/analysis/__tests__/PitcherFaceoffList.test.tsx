import type { PitcherFaceoff } from "../../../analysisActions";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PitcherFaceoffList } from "../PitcherFaceoffList";

const buildRow = (pitcherId: number, pitcherName: string): PitcherFaceoff => ({
  pitcher_id: pitcherId,
  pitcher_name: pitcherName,
  team_name: null,
  throw_hand: null,
  pitcher_style: null,
  velocity_zone: null,
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
  top_result: "ヒット",
  result_counts: [],
});

const renderList = () =>
  render(
    <PitcherFaceoffList
      rows={[buildRow(1, "投手A"), buildRow(2, "投手B")]}
      minPlateAppearances={3}
      totalTargetPa={20}
    />,
  );

const toggleOf = (pitcherName: string) =>
  screen.getByRole("button", { name: new RegExp(pitcherName) });

describe("PitcherFaceoffList", () => {
  it("複数の投手のトグルを同時に開ける", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(toggleOf("投手A"));
    await user.click(toggleOf("投手B"));

    expect(toggleOf("投手A")).toHaveAttribute("aria-expanded", "true");
    expect(toggleOf("投手B")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByText("出塁率")).toHaveLength(2);
  });

  it("開いている投手を再度押すとその投手だけ閉じる", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(toggleOf("投手A"));
    await user.click(toggleOf("投手B"));
    await user.click(toggleOf("投手A"));

    expect(toggleOf("投手A")).toHaveAttribute("aria-expanded", "false");
    expect(toggleOf("投手B")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByText("出塁率")).toHaveLength(1);
  });
});
