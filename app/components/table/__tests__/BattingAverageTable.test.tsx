import type {
  BattingStatsAggregate,
  BattingStatsCalculated,
} from "@app/interface/dashboardStats";
import { render, screen, within } from "@testing-library/react";
import BattingAverageTable from "../BattingAverageTable";

const aggregate: BattingStatsAggregate = {
  number_of_matches: 10,
  hit: 12,
  two_base_hit: 3,
  three_base_hit: 1,
  home_run: 2,
  total_bases: 23,
  runs_batted_in: 8,
  run: 6,
  stealing_base: 2,
  caught_stealing: 1,
  times_at_bat: 45,
  at_bats: 40,
  base_on_balls: 4,
  hit_by_pitch: 1,
  sacrifice_hit: 0,
  sacrifice_fly: 0,
  strike_out: 9,
  error: 1,
};

const buildCalculated = (
  overrides: Partial<BattingStatsCalculated> = {},
): BattingStatsCalculated => ({
  batting_average: 0.3,
  on_base_percentage: 0.356,
  slugging_percentage: 0.575,
  ops: 0.931,
  scoring_position_batting_average: 0.25,
  iso: 0.275,
  bb_per_k: 0.444,
  isod: 0.056,
  ...overrides,
});

const scoringPositionCell = () => {
  const cell = screen.getByRole("button", { name: "得点圏打率" }).parentElement;
  if (!cell) throw new Error("得点圏打率のセルが見つかりません");
  return cell;
};

const scoringPositionValue = () =>
  within(scoringPositionCell()).getByText(/^(\.\d{3}|-)$/).textContent;

describe("BattingAverageTable", () => {
  it("得点圏打率を他の率系と同じ表記で表示する", () => {
    render(
      <BattingAverageTable
        aggregate={aggregate}
        calculated={buildCalculated()}
      />,
    );

    expect(scoringPositionValue()).toBe(".250");
  });

  it("得点圏打率が 0 のときは .000 と表示する", () => {
    render(
      <BattingAverageTable
        aggregate={aggregate}
        calculated={buildCalculated({ scoring_position_batting_average: 0 })}
      />,
    );

    expect(scoringPositionValue()).toBe(".000");
  });

  it("得点圏での打数が 0（null）のときは - を表示する", () => {
    render(
      <BattingAverageTable
        aggregate={aggregate}
        calculated={buildCalculated({ scoring_position_batting_average: null })}
      />,
    );

    expect(scoringPositionValue()).toBe("-");
  });

  it("古いバックエンドでキー自体が無いときも - を表示する", () => {
    const { scoring_position_batting_average: _omitted, ...calculated } =
      buildCalculated();
    render(
      <BattingAverageTable aggregate={aggregate} calculated={calculated} />,
    );

    expect(scoringPositionValue()).toBe("-");
  });
});
