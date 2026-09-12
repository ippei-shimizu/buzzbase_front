const mockGet = jest.fn();
const mockCookieStore = { get: mockGet };

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}));

jest.mock("../../../../constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

import { getGameSummary } from "../gameSummaryActions";

function setupAuthCookies() {
  mockGet.mockImplementation((key: string) => {
    const values: Record<string, { value: string }> = {
      "access-token": { value: "test-access-token" },
      client: { value: "test-client" },
      uid: { value: "test-uid" },
    };
    return values[key];
  });
}

const sampleSummary = {
  win_loss: { wins: 1, losses: 0, draws: 0, total: 1, win_rate: 1.0 },
  scoring: {
    runs_for: 5,
    runs_against: 3,
    run_differential: 2,
    avg_runs_for: 5.0,
    avg_runs_against: 3.0,
  },
  recent_form: [],
  monthly_games: [],
  opponent_records: [],
};

describe("getGameSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("認証済みなら status:ok でサマリーを返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => sampleSummary,
    });

    const result = await getGameSummary();

    expect(result).toEqual({ status: "ok", data: sampleSummary });
    expect(global.fetch).toHaveBeenCalledWith(
      "http://back:3000/api/v2/stats/game_summary",
      expect.objectContaining({
        headers: expect.objectContaining({
          "access-token": "test-access-token",
          client: "test-client",
          uid: "test-uid",
        }),
        cache: "no-store",
      }),
    );
  });

  it("フィルタをクエリパラメータに反映する", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => sampleSummary,
    });

    await getGameSummary({
      year: "2025",
      matchType: "regular",
      seasonId: "3",
      tournamentId: "7",
    });

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain("year=2025");
    expect(calledUrl).toContain("match_type=regular");
    expect(calledUrl).toContain("season_id=3");
    expect(calledUrl).toContain("tournament_id=7");
  });

  it("月範囲を start_month / end_month として送る", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => sampleSummary,
    });

    await getGameSummary({ startMonth: "2026-04", endMonth: "2026-06" });

    const query = new URLSearchParams(
      ((global.fetch as jest.Mock).mock.calls[0][0] as string).split("?")[1],
    );
    expect(query.get("start_month")).toBe("2026-04");
    expect(query.get("end_month")).toBe("2026-06");
  });

  it("未指定・空文字のフィルタはクエリに含めない", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => sampleSummary,
    });

    await getGameSummary({ year: undefined, matchType: "", tournamentId: "7" });

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain("tournament_id=7");
    expect(calledUrl).not.toContain("year=");
    expect(calledUrl).not.toContain("match_type=");
    expect(calledUrl).not.toContain("start_month");
    expect(calledUrl).not.toContain("end_month");
  });

  it("403 なら status:forbidden を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: "このアカウントは非公開です" }),
    });

    const result = await getGameSummary();

    expect(result).toEqual({ status: "forbidden" });
  });

  it("認証トークンが無ければ status:unauthenticated を返す", async () => {
    mockGet.mockReturnValue(undefined);

    const result = await getGameSummary();

    expect(result).toEqual({ status: "unauthenticated" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("その他の失敗レスポンスは status:error を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    const result = await getGameSummary();

    expect(result).toEqual({ status: "error" });
  });

  it("fetch が例外を投げたら status:error を返す", async () => {
    setupAuthCookies();
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("network"));

    const result = await getGameSummary();

    expect(result).toEqual({ status: "error" });
  });
});
