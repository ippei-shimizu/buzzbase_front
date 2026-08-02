const mockAxiosGet = jest.fn();

jest.mock("@app/utils/axiosInstance", () => ({
  __esModule: true,
  default: { get: (...args: unknown[]) => mockAxiosGet(...args) },
}));

import { getGroupDetail } from "../groupService";

function requestedQuery(): URLSearchParams {
  const url = mockAxiosGet.mock.calls[0][0] as string;
  return new URLSearchParams(url.split("?")[1] ?? "");
}

describe("getGroupDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosGet.mockResolvedValue({ data: {} });
  });

  it("絞り込みが無ければクエリを付けない", async () => {
    await getGroupDetail(1);

    expect(mockAxiosGet).toHaveBeenCalledWith("/api/v1/groups/1");
  });

  it("大会と月範囲をクエリパラメータに載せる", async () => {
    await getGroupDetail(1, {
      year: "2026",
      matchType: "regular",
      tournamentId: "7",
      startMonth: "2026-04",
      endMonth: "2026-06",
    });

    const query = requestedQuery();
    expect(query.get("year")).toBe("2026");
    expect(query.get("match_type")).toBe("regular");
    expect(query.get("tournament_id")).toBe("7");
    expect(query.get("start_month")).toBe("2026-04");
    expect(query.get("end_month")).toBe("2026-06");
  });

  it("未指定の絞り込みはクエリに含めない", async () => {
    await getGroupDetail(1, { tournamentId: "7" });

    const query = requestedQuery();
    expect(query.get("tournament_id")).toBe("7");
    expect(query.has("year")).toBe(false);
    expect(query.has("start_month")).toBe(false);
    expect(query.has("end_month")).toBe(false);
  });
});
