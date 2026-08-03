const mockGet = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn(() => Promise.resolve({ get: mockGet })),
}));

jest.mock("@app/constants/api", () => ({
  RAILS_API_URL: "http://back:3000",
}));

jest.mock("../../../../lib/sentry-helpers", () => ({
  captureServerActionError: jest.fn(),
}));

import { getPlanCalendar } from "../planService";

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

const requestedUrl = (): string =>
  (global.fetch as jest.Mock).mock.calls[0][0] as string;

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  setupAuthCookies();
});

describe("getPlanCalendar", () => {
  it("from / to をクエリに付けて calendar を叩く", async () => {
    mockResponse(200, { entries: [] });

    await getPlanCalendar("2026-07-27", "2026-09-06");

    expect(requestedUrl()).toBe(
      "http://back:3000/api/v2/plans/calendar?from=2026-07-27&to=2026-09-06",
    );
  });

  it("エントリをそのまま返す", async () => {
    mockResponse(200, {
      entries: [
        {
          date: "2026-08-03",
          event_type: "game",
          title: "練習試合",
          schedule_id: 7,
        },
      ],
    });

    const result = await getPlanCalendar("2026-08-01", "2026-08-31");

    expect(result).toEqual({
      status: "ok",
      data: {
        entries: [
          {
            date: "2026-08-03",
            event_type: "game",
            title: "練習試合",
            schedule_id: 7,
          },
        ],
      },
    });
  });

  it("from / to が不正で back が 422 を返したら error にする", async () => {
    mockResponse(422, { error: "from / to が不正です" });

    await expect(getPlanCalendar("2026-08-10", "2026-08-01")).resolves.toEqual({
      status: "error",
    });
  });

  it("認証 Cookie が無ければリクエストせず error を返す", async () => {
    mockGet.mockReturnValue(undefined);

    await expect(getPlanCalendar("2026-08-01", "2026-08-31")).resolves.toEqual({
      status: "error",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
