const mockInit = jest.fn();
const mockCapture = jest.fn();
const mockIdentify = jest.fn();
const mockReset = jest.fn();

jest.mock("posthog-js", () => ({
  __esModule: true,
  default: {
    init: (...args: unknown[]) => mockInit(...args),
    capture: (...args: unknown[]) => mockCapture(...args),
    identify: (...args: unknown[]) => mockIdentify(...args),
    reset: (...args: unknown[]) => mockReset(...args),
  },
}));

import type * as AnalyticsNamespace from "@app/utils/analytics";
import type * as PostHogNamespace from "@app/utils/posthog";

type AnalyticsModule = typeof AnalyticsNamespace;
type PostHogModule = typeof PostHogNamespace;

const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * 環境変数を差し替えたうえでモジュールを読み込み直す。
 * key を渡さない場合はキー未設定の環境（開発 / CI / preview）を再現する。
 */
const loadModules = async (
  key?: string,
): Promise<{ analytics: AnalyticsModule; posthog: PostHogModule }> => {
  jest.resetModules();
  if (key) process.env.NEXT_PUBLIC_POSTHOG_KEY = key;
  else delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthog: PostHogModule = await import("@app/utils/posthog");
  const analytics: AnalyticsModule = await import("@app/utils/analytics");
  posthog.initPostHog();
  await flushMicrotasks();
  return { analytics, posthog };
};

/**
 * mobile（buzzbase_mobile/utils/analytics.ts）が送っているイベント名とプロパティ。
 * Web / アプリでファネルを横断集計するため、この表からずれてはならない。
 */
const MOBILE_EVENT_CASES: {
  event: string;
  properties: Record<string, unknown> | undefined;
  run: (analytics: AnalyticsModule) => void;
}[] = [
  {
    event: "sign up completed",
    properties: { login_type: "google" },
    run: (a) => a.trackSignUpCompleted("google"),
  },
  {
    event: "user logged in",
    properties: { login_type: "email" },
    run: (a) => a.trackUserLoggedIn("email"),
  },
  {
    event: "game record step viewed",
    properties: { step: 2 },
    run: (a) => a.trackGameRecordStepViewed(2),
  },
  {
    event: "game record step viewed",
    properties: { step: "summary" },
    run: (a) => a.trackGameRecordStepViewed("summary"),
  },
  {
    event: "game record completed",
    properties: {
      match_type: "regular",
      appearance_type: "starter",
      has_pitching: true,
    },
    run: (a) =>
      a.trackGameRecordCompleted({
        match_type: "regular",
        appearance_type: "starter",
        has_pitching: true,
      }),
  },
  {
    event: "plate appearance completed",
    properties: { is_edit: false, has_pitcher: true, has_detail: false },
    run: (a) =>
      a.trackPlateAppearanceCompleted({
        is_edit: false,
        has_pitcher: true,
        has_detail: false,
      }),
  },
  {
    event: "plate appearance canceled",
    properties: { is_edit: true },
    run: (a) => a.trackPlateAppearanceCanceled({ is_edit: true }),
  },
  {
    event: "group created",
    properties: { group_id: 12 },
    run: (a) => a.trackGroupCreated(12),
  },
  {
    event: "group joined",
    properties: { group_id: 34 },
    run: (a) => a.trackGroupJoined(34),
  },
  {
    event: "user followed",
    properties: { followed_user_id: 56 },
    run: (a) => a.trackUserFollowed(56),
  },
  {
    event: "profile updated",
    properties: undefined,
    run: (a) => a.trackProfileUpdated(),
  },
  {
    event: "stats filter changed",
    properties: { filter_key: "year", filter_value: "2026" },
    run: (a) =>
      a.trackStatsFilterChanged({ filter_key: "year", filter_value: "2026" }),
  },
  {
    event: "batting trend granularity changed",
    properties: { granularity: "season" },
    run: (a) => a.trackBattingTrendGranularityChanged("season"),
  },
  {
    event: "era trend granularity changed",
    properties: { granularity: "season" },
    run: (a) => a.trackEraTrendGranularityChanged("season"),
  },
  {
    event: "pro feature tapped",
    properties: { feature: "hit_direction_average" },
    run: (a) => a.trackProFeatureTapped("hit_direction_average"),
  },
];

describe("analytics", () => {
  const originalKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    if (originalKey) process.env.NEXT_PUBLIC_POSTHOG_KEY = originalKey;
    else delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
  });

  describe("イベント名（mobile と共通）", () => {
    it("mobile の utils/analytics.ts と同じイベント名を使う", async () => {
      const { analytics } = await loadModules("phc_test");

      expect(analytics.ANALYTICS_EVENTS).toEqual({
        SIGN_UP_COMPLETED: "sign up completed",
        USER_LOGGED_IN: "user logged in",
        GAME_RECORD_STEP_VIEWED: "game record step viewed",
        GAME_RECORD_COMPLETED: "game record completed",
        PLATE_APPEARANCE_COMPLETED: "plate appearance completed",
        PLATE_APPEARANCE_CANCELED: "plate appearance canceled",
        GROUP_CREATED: "group created",
        GROUP_JOINED: "group joined",
        USER_FOLLOWED: "user followed",
        PROFILE_UPDATED: "profile updated",
        STATS_FILTER_CHANGED: "stats filter changed",
        BATTING_TREND_GRANULARITY_CHANGED: "batting trend granularity changed",
        ERA_TREND_GRANULARITY_CHANGED: "era trend granularity changed",
        PRO_FEATURE_TAPPED: "pro feature tapped",
      });
    });

    it.each(MOBILE_EVENT_CASES)(
      "$event を mobile と同じプロパティで送る",
      async ({ event, properties, run }) => {
        const { analytics } = await loadModules("phc_test");

        run(analytics);

        expect(mockCapture).toHaveBeenCalledTimes(1);
        expect(mockCapture).toHaveBeenCalledWith(event, properties);
      },
    );
  });

  describe("環境変数が未設定のとき", () => {
    it("計測が無効になる", async () => {
      const { posthog } = await loadModules();

      expect(posthog.isPostHogEnabled()).toBe(false);
    });

    it("キーがあれば計測が有効になる", async () => {
      const { posthog } = await loadModules("phc_test");

      expect(posthog.isPostHogEnabled()).toBe(true);
    });

    it("PostHog を初期化せず、外部通信も発生させない", async () => {
      await loadModules();

      expect(mockInit).not.toHaveBeenCalled();
    });

    it("無効な間に呼ばれた計測は、後から有効化されても送らない", async () => {
      const { analytics, posthog } = await loadModules();

      analytics.trackGroupJoined(1);

      process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test";
      posthog.initPostHog();
      await flushMicrotasks();

      expect(mockCapture).not.toHaveBeenCalled();
    });

    it("計測を呼んでもエラーにならず、イベントも送らない", async () => {
      const { analytics, posthog } = await loadModules();

      for (const testCase of MOBILE_EVENT_CASES) {
        expect(() => testCase.run(analytics)).not.toThrow();
      }
      expect(() => posthog.identifyUser(1)).not.toThrow();
      expect(() => posthog.resetUser()).not.toThrow();

      expect(mockCapture).not.toHaveBeenCalled();
      expect(mockIdentify).not.toHaveBeenCalled();
      expect(mockReset).not.toHaveBeenCalled();
    });
  });

  describe("計測が失敗したとき", () => {
    it("例外を投げず、呼び出し元の処理を止めない", async () => {
      const { analytics } = await loadModules("phc_test");
      mockCapture.mockImplementation(() => {
        throw new Error("network down");
      });

      let continued = false;
      expect(() => {
        analytics.trackGroupCreated(1);
        continued = true;
      }).not.toThrow();

      expect(continued).toBe(true);
      mockCapture.mockReset();
    });

    it("identify / reset が失敗しても例外を投げない", async () => {
      const { posthog } = await loadModules("phc_test");
      mockIdentify.mockImplementation(() => {
        throw new Error("boom");
      });
      mockReset.mockImplementation(() => {
        throw new Error("boom");
      });

      expect(() => posthog.identifyUser(7)).not.toThrow();
      expect(() => posthog.resetUser()).not.toThrow();

      mockIdentify.mockReset();
      mockReset.mockReset();
    });
  });

  describe("個人情報", () => {
    const FORBIDDEN_KEY = /mail|password|token|birth|phone|address|^name$/i;

    it("イベントプロパティに個人情報を含めない", async () => {
      const { analytics } = await loadModules("phc_test");

      for (const testCase of MOBILE_EVENT_CASES) {
        mockCapture.mockClear();
        testCase.run(analytics);
        const [, properties] = mockCapture.mock.calls[0] as [
          string,
          Record<string, unknown> | undefined,
        ];
        for (const [key, value] of Object.entries(properties ?? {})) {
          expect(key).not.toMatch(FORBIDDEN_KEY);
          // オブジェクトを丸ごと載せると意図せず個人情報が混ざるため、スカラーのみ許容する
          expect(["string", "number", "boolean"]).toContain(
            value === null ? "string" : typeof value,
          );
        }
      }
    });

    it("ユーザー識別には不可逆な内部 ID だけを渡す", async () => {
      const { posthog } = await loadModules("phc_test");

      posthog.identifyUser(42);

      expect(mockIdentify).toHaveBeenCalledWith("42");
      expect(mockIdentify).toHaveBeenCalledTimes(1);
    });
  });

  describe("初期化前のイベント", () => {
    it("posthog-js のロード完了前に発生したイベントも取りこぼさない", async () => {
      jest.resetModules();
      process.env.NEXT_PUBLIC_POSTHOG_KEY = "phc_test";
      const posthog: PostHogModule = await import("@app/utils/posthog");
      const analytics: AnalyticsModule = await import("@app/utils/analytics");

      analytics.trackGameRecordStepViewed(1);
      expect(mockCapture).not.toHaveBeenCalled();

      posthog.initPostHog();
      await flushMicrotasks();

      expect(mockCapture).toHaveBeenCalledWith("game record step viewed", {
        step: 1,
      });
    });
  });

  describe("初期化", () => {
    it("PII を収集する自動計測を無効にして初期化する", async () => {
      await loadModules("phc_test");

      expect(mockInit).toHaveBeenCalledTimes(1);
      const [apiKey, config] = mockInit.mock.calls[0] as [
        string,
        Record<string, unknown>,
      ];
      expect(apiKey).toBe("phc_test");
      expect(config.autocapture).toBe(false);
      expect(config.disable_session_recording).toBe(true);
    });
  });
});
