const mockAxiosGet = jest.fn();

jest.mock("@app/utils/axiosInstance", () => ({
  __esModule: true,
  default: { get: (...args: unknown[]) => mockAxiosGet(...args) },
}));

import { getAvailableMonths } from "../matchResultsService";

function requestedUrl(): string {
  return mockAxiosGet.mock.calls[0][0] as string;
}

describe("getAvailableMonths", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosGet.mockResolvedValue({ data: ["2026-06", "2026-04"] });
  });

  it("記録のある年月をそのまま返す", async () => {
    await expect(getAvailableMonths()).resolves.toEqual(["2026-06", "2026-04"]);
  });

  it("ユーザー未指定ならクエリを付けない（back が current_user にフォールバックする）", async () => {
    await getAvailableMonths();

    expect(requestedUrl()).toBe("/api/v1/match_results/available_months");
  });

  it("ユーザー指定時は user_id を送る", async () => {
    await getAvailableMonths(12);

    expect(requestedUrl()).toBe(
      "/api/v1/match_results/available_months?user_id=12",
    );
  });

  it("失敗時は空配列に畳んで throw しない（チップだけ消えて画面は壊れない）", async () => {
    mockAxiosGet.mockRejectedValue(new Error("network"));

    await expect(getAvailableMonths(12)).resolves.toEqual([]);
  });
});
