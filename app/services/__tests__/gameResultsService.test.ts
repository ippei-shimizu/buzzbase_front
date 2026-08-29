const mockAxiosGet = jest.fn();

jest.mock("@app/utils/axiosInstance", () => ({
  __esModule: true,
  default: { get: (...args: unknown[]) => mockAxiosGet(...args) },
}));

import {
  getFilterGameResultsUserIdV2,
  getFilterGameResultsV2,
} from "../gameResultsService";

function requestedUrl(): string {
  return mockAxiosGet.mock.calls[0][0] as string;
}

describe("試合一覧の絞り込み取得（v2）", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosGet.mockResolvedValue({
      data: { data: [], pagination: null },
    });
  });

  it("絞り込みが無ければクエリを付けない", async () => {
    await getFilterGameResultsV2();

    expect(requestedUrl()).toBe("/api/v2/game_results/filtered_index");
  });

  it("大会と月範囲をクエリパラメータに載せる", async () => {
    await getFilterGameResultsV2({
      year: "2026",
      matchType: "regular",
      seasonId: "3",
      tournamentId: "7",
      startMonth: "2026-04",
      endMonth: "2026-06",
      page: 2,
    });

    const url = requestedUrl();
    expect(url).toContain("year=2026");
    expect(url).toContain("match_type=regular");
    expect(url).toContain("season_id=3");
    expect(url).toContain("tournament_id=7");
    expect(url).toContain("start_month=2026-04");
    expect(url).toContain("end_month=2026-06");
    expect(url).toContain("page=2");
  });

  it("指定ユーザー版も大会と月範囲を送る", async () => {
    await getFilterGameResultsUserIdV2(12, {
      tournamentId: "7",
      startMonth: "2026-04",
      endMonth: "2026-06",
    });

    const url = requestedUrl();
    expect(url).toContain("/api/v2/game_results/filtered_user/12");
    expect(url).toContain("tournament_id=7");
    expect(url).toContain("start_month=2026-04");
    expect(url).toContain("end_month=2026-06");
  });

  it("検索語はエンコードして送る", async () => {
    await getFilterGameResultsV2({ search: "巨人 ＆ 阪神" });

    const query = new URLSearchParams(requestedUrl().split("?")[1]);
    expect(query.get("search")).toBe("巨人 ＆ 阪神");
  });
});
