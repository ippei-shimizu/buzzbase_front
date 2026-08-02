const mockGet = jest.fn();
const mockCookieStore = { get: mockGet };

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}));

jest.mock("../../../constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

import {
  getCountSituations,
  getEraTrend,
  getHitDirections,
  getPitcherFaceoffs,
  getPitchTypes,
} from "../analysisActions";
import {
  EMPTY_COUNT_SITUATIONS,
  EMPTY_PITCH_TYPES,
  EMPTY_PITCHER_FACEOFFS,
} from "../analysisFallbacks";

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

function mockResponse(status: number, body: unknown) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

const proForbiddenBody = { error: "この機能は Pro プラン限定です" };

const countSituations = {
  first_pitch: { at_bats: 9, hits: 3, batting_average: 0.333 },
  favorable_count: { at_bats: 14, hits: 4, batting_average: 0.286 },
  pinch_count: { at_bats: 28, hits: 6, batting_average: 0.214 },
  total_target_pa: 62,
};

describe("Pro 限定の分析 Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("成功時は status:ok でデータを返す", async () => {
    mockResponse(200, countSituations);

    await expect(getCountSituations()).resolves.toEqual({
      status: "ok",
      data: countSituations,
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("http://back:3000/api/v2/stats/count_situations"),
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it.each([
    ["getCountSituations", getCountSituations],
    ["getPitchTypes", getPitchTypes],
    ["getPitcherFaceoffs", getPitcherFaceoffs],
  ])("%s は 403 なら status:pro_required を返す", async (_name, action) => {
    mockResponse(403, proForbiddenBody);

    await expect(action()).resolves.toEqual({ status: "pro_required" });
  });

  it.each([
    ["getCountSituations", getCountSituations, EMPTY_COUNT_SITUATIONS],
    ["getPitchTypes", getPitchTypes, EMPTY_PITCH_TYPES],
    ["getPitcherFaceoffs", getPitcherFaceoffs, EMPTY_PITCHER_FACEOFFS],
  ])(
    "%s は 403 以外の失敗なら status:ok + 空データに畳む",
    async (_name, action, fallback) => {
      mockResponse(500, {});

      await expect(action()).resolves.toEqual({ status: "ok", data: fallback });
    },
  );

  it("未認証なら API を叩かず status:ok + 空データを返す", async () => {
    mockGet.mockReturnValue(undefined);

    await expect(getCountSituations()).resolves.toEqual({
      status: "ok",
      data: EMPTY_COUNT_SITUATIONS,
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("フィルタをクエリパラメータに反映する", async () => {
    mockResponse(200, countSituations);

    await getCountSituations({ year: "2026", matchType: "regular" });

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain("year=2026");
    expect(calledUrl).toContain("match_type=regular");
  });

  it("大会と月範囲をクエリパラメータに反映する", async () => {
    mockResponse(200, countSituations);

    await getCountSituations({
      tournamentId: "7",
      startMonth: "2026-04",
      endMonth: "2026-06",
    });

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain("tournament_id=7");
    expect(calledUrl).toContain("start_month=2026-04");
    expect(calledUrl).toContain("end_month=2026-06");
  });

  it("月範囲が未指定なら start_month / end_month を送らない", async () => {
    mockResponse(200, countSituations);

    await getCountSituations({ year: "2026" });

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).not.toContain("start_month");
    expect(calledUrl).not.toContain("end_month");
  });

  it("防御率推移も月範囲で絞り込める（種別は送らない）", async () => {
    mockResponse(200, { trend: [] });

    await getEraTrend({
      matchType: "regular",
      startMonth: "2026-04",
      endMonth: "2026-06",
    });

    const calledUrl = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(calledUrl).toContain("start_month=2026-04");
    expect(calledUrl).toContain("end_month=2026-06");
    expect(calledUrl).not.toContain("match_type");
  });

  it("Pro ゲートの無いエンドポイントは 403 でも空データを返す（判別ユニオンにしない）", async () => {
    mockResponse(403, { error: "このアカウントは非公開です" });

    await expect(getHitDirections()).resolves.toEqual({
      directions: [],
      home_runs: [],
    });
  });
});
