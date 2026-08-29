const mockGet = jest.fn();
const mockCookieStore = { get: mockGet };

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}));

jest.mock("../../../constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

import { getStatsFilterOptions } from "../filterOptions";

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

const SEASONS = [{ id: 3, name: "春季" }];
const TOURNAMENTS = [{ id: 7, name: "県大会" }];
const MONTHS = ["2026-06", "2026-04"];

function jsonResponse(body: unknown) {
  return { ok: true, status: 200, json: async () => body };
}

function errorResponse(status: number) {
  return { ok: false, status, json: async () => ({}) };
}

/**
 * 3本の fetch を URL で振り分ける。`Promise.all` の解決順に依存しないよう、
 * 呼び出し順ではなくパスで応答を決める。
 */
function respondByPath(
  responses: Partial<
    Record<"seasons" | "tournaments" | "months", unknown | Error>
  > = {},
) {
  (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
    const resolve = (key: "seasons" | "tournaments" | "months") => {
      const configured = responses[key];
      if (configured instanceof Error) throw configured;
      return configured ?? errorResponse(500);
    };
    if (url.includes("/api/v1/seasons")) return resolve("seasons");
    if (url.includes("/api/v1/tournaments/user_tournaments"))
      return resolve("tournaments");
    if (url.includes("/api/v1/match_results/available_months"))
      return resolve("months");
    throw new Error(`予期しないリクエスト: ${url}`);
  });
}

function requestedUrls(): string[] {
  return (global.fetch as jest.Mock).mock.calls.map(
    (call) => call[0] as string,
  );
}

describe("getStatsFilterOptions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  it("シーズン・大会・記録のある年月を選択肢に変換する", async () => {
    respondByPath({
      seasons: jsonResponse(SEASONS),
      tournaments: jsonResponse(TOURNAMENTS),
      months: jsonResponse(MONTHS),
    });

    await expect(getStatsFilterOptions()).resolves.toEqual({
      seasonOptions: [{ key: "3", label: "春季" }],
      tournamentOptions: [{ key: "7", label: "県大会" }],
      monthOptions: [
        { key: "2026-06", label: "2026年6月" },
        { key: "2026-04", label: "2026年4月" },
      ],
    });
  });

  it("大会は全大会ではなくユーザーの試合に紐づくものを取りにいく", async () => {
    respondByPath({
      seasons: jsonResponse(SEASONS),
      tournaments: jsonResponse(TOURNAMENTS),
      months: jsonResponse(MONTHS),
    });

    await getStatsFilterOptions();

    const urls = requestedUrls();
    expect(urls).toContain(
      "http://back:3000/api/v1/tournaments/user_tournaments",
    );
    expect(urls).not.toContain("http://back:3000/api/v1/tournaments");
  });

  it("3本を認証ヘッダー付き・キャッシュ無しで取得する", async () => {
    respondByPath({
      seasons: jsonResponse(SEASONS),
      tournaments: jsonResponse(TOURNAMENTS),
      months: jsonResponse(MONTHS),
    });

    await getStatsFilterOptions();

    expect(requestedUrls()).toEqual(
      expect.arrayContaining([
        "http://back:3000/api/v1/seasons",
        "http://back:3000/api/v1/tournaments/user_tournaments",
        "http://back:3000/api/v1/match_results/available_months",
      ]),
    );
    for (const call of (global.fetch as jest.Mock).mock.calls) {
      expect(call[1]).toEqual(
        expect.objectContaining({
          cache: "no-store",
          headers: expect.objectContaining({
            "access-token": "test-access-token",
            client: "test-client",
            uid: "test-uid",
          }),
        }),
      );
    }
  });

  it("年月が空なら月の選択肢も空になる", async () => {
    respondByPath({
      seasons: jsonResponse(SEASONS),
      tournaments: jsonResponse(TOURNAMENTS),
      months: jsonResponse([]),
    });

    const options = await getStatsFilterOptions();

    expect(options.monthOptions).toEqual([]);
    expect(options.tournamentOptions).toHaveLength(1);
  });

  // 1本の失敗で全チップが消えないことを担保する（部分縮退）。
  it("年月の取得だけ失敗してもシーズンと大会は返す", async () => {
    respondByPath({
      seasons: jsonResponse(SEASONS),
      tournaments: jsonResponse(TOURNAMENTS),
      months: errorResponse(500),
    });

    const options = await getStatsFilterOptions();

    expect(options.monthOptions).toEqual([]);
    expect(options.seasonOptions).toEqual([{ key: "3", label: "春季" }]);
    expect(options.tournamentOptions).toEqual([{ key: "7", label: "県大会" }]);
  });

  it("大会の取得が例外で落ちてもシーズンと年月は返す", async () => {
    respondByPath({
      seasons: jsonResponse(SEASONS),
      tournaments: new Error("network"),
      months: jsonResponse(MONTHS),
    });

    const options = await getStatsFilterOptions();

    expect(options.tournamentOptions).toEqual([]);
    expect(options.seasonOptions).toEqual([{ key: "3", label: "春季" }]);
    expect(options.monthOptions).toHaveLength(2);
  });

  it("未認証なら API を叩かず空の選択肢を返す", async () => {
    mockGet.mockReturnValue(undefined);

    await expect(getStatsFilterOptions()).resolves.toEqual({
      seasonOptions: [],
      tournamentOptions: [],
      monthOptions: [],
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
