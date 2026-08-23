import type { RunnersState } from "@app/interface/plateAppearanceV2";
import {
  RUNNERS_STATE_OPTIONS,
  basesToRunnersState,
  runnersStateToBases,
} from "@app/constants/runnersState";

describe("runnersStateToBases / basesToRunnersState", () => {
  const CASES: Array<{
    state: RunnersState;
    bases: { first: boolean; second: boolean; third: boolean };
  }> = [
    { state: "no_runner", bases: { first: false, second: false, third: false } },
    { state: "first", bases: { first: true, second: false, third: false } },
    { state: "second", bases: { first: false, second: true, third: false } },
    { state: "third", bases: { first: false, second: false, third: true } },
    {
      state: "first_second",
      bases: { first: true, second: true, third: false },
    },
    { state: "first_third", bases: { first: true, second: false, third: true } },
    {
      state: "second_third",
      bases: { first: false, second: true, third: true },
    },
    { state: "bases_loaded", bases: { first: true, second: true, third: true } },
  ];

  it.each(CASES)("$state は塁フラグと相互変換できる", ({ state, bases }) => {
    expect(runnersStateToBases(state)).toEqual(bases);
    expect(basesToRunnersState(bases)).toBe(state);
  });

  it("全 8 enum を網羅している", () => {
    expect(CASES.map((c) => c.state).sort()).toEqual(
      RUNNERS_STATE_OPTIONS.map((o) => o.key).sort(),
    );
  });

  it("null（未記録）は全塁 OFF になる", () => {
    expect(runnersStateToBases(null)).toEqual({
      first: false,
      second: false,
      third: false,
    });
  });

  it("全塁 OFF は no_runner（無走者を記録した）と解釈する", () => {
    expect(
      basesToRunnersState({ first: false, second: false, third: false }),
    ).toBe("no_runner");
  });
});
