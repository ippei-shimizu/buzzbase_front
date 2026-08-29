import { trackFilterChanges } from "../trackFilterChange";

const mockCapture = jest.fn();
jest.mock("@app/utils/posthog", () => ({
  capture: (...args: unknown[]) => mockCapture(...args),
}));

describe("trackFilterChanges", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("変更されたキーだけ stats filter changed を送る", () => {
    trackFilterChanges({ year: "2025" }, { year: "2026" });

    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledWith("stats filter changed", {
      filter_key: "year",
      filter_value: "2026",
    });
  });

  it("絞り込みの解除は値 null で送る", () => {
    trackFilterChanges({ matchType: "regular" }, {});

    expect(mockCapture).toHaveBeenCalledWith("stats filter changed", {
      filter_key: "matchType",
      filter_value: null,
    });
  });

  it("複数のキーが変わればその分だけ送る", () => {
    trackFilterChanges(
      {},
      { seasonId: "3", tournamentId: "9", startMonth: "2026-04" },
    );

    expect(mockCapture).toHaveBeenCalledTimes(3);
  });

  it("値が変わっていなければ送らない", () => {
    trackFilterChanges({ year: "2026" }, { year: "2026" });

    expect(mockCapture).not.toHaveBeenCalled();
  });
});
