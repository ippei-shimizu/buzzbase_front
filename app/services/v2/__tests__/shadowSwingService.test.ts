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

import type { ShadowSwingSession } from "@app/types/shadowSwing";
import {
  completeShadowSwingSession,
  getShadowSwingStats,
  startShadowSwingSession,
} from "../shadowSwingService";

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

function requestedUrl(callIndex = 0): string {
  return (global.fetch as jest.Mock).mock.calls[callIndex][0] as string;
}

function requestedInit(callIndex = 0): RequestInit {
  return (global.fetch as jest.Mock).mock.calls[callIndex][1] as RequestInit;
}

function sentBody(callIndex = 0): Record<string, unknown> {
  return JSON.parse(requestedInit(callIndex).body as string) as Record<
    string,
    unknown
  >;
}

function mockJsonResponse(body: unknown, status = 200) {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

const session: ShadowSwingSession = {
  id: 42,
  logged_on: "2026-08-03",
  target_count: 200,
  swing_count: 0,
  completed_at: null,
  practice_log_id: null,
};

describe("v2 素振りカウンター Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
    setupAuthCookies();
  });

  describe("startShadowSwingSession", () => {
    it("目標本数を shadow_swing_session でラップして POST する", async () => {
      mockJsonResponse(session, 201);

      const result = await startShadowSwingSession(200);

      expect(result).toEqual({ ok: true, data: session });
      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/shadow_swing_sessions",
      );
      expect(requestedInit().method).toBe("POST");
      expect(sentBody()).toEqual({
        shadow_swing_session: { target_count: 200 },
      });
    });

    it("失敗時は back のエラーメッセージを返す", async () => {
      mockJsonResponse({ errors: ["目標本数を入力してください"] }, 422);

      const result = await startShadowSwingSession(0);

      expect(result).toEqual({
        ok: false,
        reason: "error",
        errors: ["目標本数を入力してください"],
      });
    });
  });

  describe("completeShadowSwingSession", () => {
    it("セッション id の complete へ本数を POST する", async () => {
      mockJsonResponse({ ...session, swing_count: 180 });

      const result = await completeShadowSwingSession(42, 180);

      expect(result.ok).toBe(true);
      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/shadow_swing_sessions/42/complete",
      );
      expect(requestedInit().method).toBe("POST");
      expect(sentBody()).toEqual({
        shadow_swing_session: { swing_count: 180 },
      });
    });
  });

  describe("getShadowSwingStats", () => {
    it("stats を GET し、0件をそのまま 0 として返す", async () => {
      mockJsonResponse({ today_count: 0, month_count: 0, total_count: 0 });

      const result = await getShadowSwingStats();

      expect(result).toEqual({
        status: "ok",
        data: { today_count: 0, month_count: 0, total_count: 0 },
      });
      expect(requestedUrl()).toBe(
        "http://back:3000/api/v2/shadow_swing_sessions/stats",
      );
    });

    it("取得に失敗したら 0 件へ丸めず error を返す", async () => {
      mockJsonResponse({}, 500);

      expect(await getShadowSwingStats()).toEqual({ status: "error" });
    });
  });
});
