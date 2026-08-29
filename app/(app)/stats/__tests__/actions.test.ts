const mockGet = jest.fn();
const mockCookieStore = { get: mockGet };

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve(mockCookieStore)),
}));

jest.mock("../../../constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

import { getBattingStats, getPitchingStats } from "../actions";

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

function mockRows() {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => ({ rows: [] }),
  });
}

function calledUrl(): string {
  return (global.fetch as jest.Mock).mock.calls[0][0] as string;
}

describe("成績テーブルの Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  it("絞り込みが無ければ period だけを送る", async () => {
    mockRows();

    await getBattingStats("yearly");

    expect(calledUrl()).toBe(
      "http://back:3000/api/v2/stats/batting?period=yearly",
    );
  });

  it("打撃テーブルに大会と月範囲を反映する", async () => {
    mockRows();

    await getBattingStats("monthly", {
      year: "2026",
      seasonId: "3",
      tournamentId: "7",
      startMonth: "2026-04",
      endMonth: "2026-06",
    });

    const url = calledUrl();
    expect(url).toContain("period=monthly");
    expect(url).toContain("year=2026");
    expect(url).toContain("season_id=3");
    expect(url).toContain("tournament_id=7");
    expect(url).toContain("start_month=2026-04");
    expect(url).toContain("end_month=2026-06");
  });

  it("投球テーブルにも大会と月範囲を反映する", async () => {
    mockRows();

    await getPitchingStats("daily", {
      tournamentId: "7",
      startMonth: "2026-04",
      endMonth: "2026-06",
    });

    const url = calledUrl();
    expect(url).toContain("/api/v2/stats/pitching");
    expect(url).toContain("tournament_id=7");
    expect(url).toContain("start_month=2026-04");
    expect(url).toContain("end_month=2026-06");
  });

  it("未認証なら API を叩かず空配列を返す", async () => {
    mockGet.mockReturnValue(undefined);

    await expect(getBattingStats("yearly")).resolves.toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
