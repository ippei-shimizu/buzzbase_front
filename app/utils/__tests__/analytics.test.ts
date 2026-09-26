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

const PLATE_APPEARANCE_COMPLETED_PROPERTIES = {
  is_edit: false,
  has_hit_direction: true,
  has_detail: true,
  has_pitcher: true,
  has_count: false,
  has_situation: true,
  has_first_pitch_swing: false,
  has_contact_quality: true,
  has_timing: false,
  has_pitch_type: true,
  has_pitch_course: true,
  has_memo: false,
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
    properties: PLATE_APPEARANCE_COMPLETED_PROPERTIES,
    run: (a) =>
      a.trackPlateAppearanceCompleted(PLATE_APPEARANCE_COMPLETED_PROPERTIES),
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
  {
    event: "goal created",
    properties: { period_type: "monthly", kind: "numeric" },
    run: (a) => a.trackGoalCreated({ period_type: "monthly", kind: "numeric" }),
  },
  {
    event: "practice record created",
    properties: { menu_count: 3, has_condition: true, is_edit: false },
    run: (a) =>
      a.trackPracticeRecordCreated({
        menu_count: 3,
        has_condition: true,
        is_edit: false,
      }),
  },
  {
    event: "note created",
    properties: { has_reflection: true },
    run: (a) => a.trackNoteCreated({ has_reflection: true }),
  },
  {
    event: "theme created",
    properties: undefined,
    run: (a) => a.trackThemeCreated(),
  },
  {
    event: "practice schedule created",
    properties: { event_type: "self_practice", recurring: false },
    run: (a) =>
      a.trackPracticeScheduleCreated({
        event_type: "self_practice",
        recurring: false,
      }),
  },
  {
    event: "review completed",
    properties: { answer_count: 2 },
    run: (a) => a.trackReviewCompleted({ answer_count: 2 }),
  },
  {
    event: "shadow swing completed",
    properties: { swing_count: 120 },
    run: (a) => a.trackShadowSwingCompleted({ swing_count: 120 }),
  },
  {
    event: "paywall viewed",
    properties: { trigger: "unlimited_monthly_goals" },
    run: (a) => a.trackPaywallViewed("unlimited_monthly_goals"),
  },
  {
    event: "upgrade started",
    properties: { plan_type: "yearly", trigger: "general" },
    run: (a) =>
      a.trackUpgradeStarted({ plan_type: "yearly", trigger: "general" }),
  },
  {
    event: "purchase completed",
    properties: { plan_type: "monthly", platform: "web", is_trial: true },
    run: (a) =>
      a.trackPurchaseCompleted({
        plan_type: "monthly",
        platform: "web",
        is_trial: true,
      }),
  },
  {
    event: "purchase failed",
    properties: { reason: "stripe_api_error", plan_type: "yearly" },
    run: (a) =>
      a.trackPurchaseFailed({
        reason: "stripe_api_error",
        plan_type: "yearly",
      }),
  },
  {
    event: "free limit reached",
    properties: { feature: "unlimited_practice_menus" },
    run: (a) => a.trackFreeLimitReached("unlimited_practice_menus"),
  },
  {
    event: "onboarding step viewed",
    properties: { step_index: 1, illustration: "ranking" },
    run: (a) =>
      a.trackOnboardingStepViewed({ step_index: 1, illustration: "ranking" }),
  },
  {
    event: "onboarding completed",
    properties: { skipped: true, last_step_index: 0 },
    run: (a) =>
      a.trackOnboardingCompleted({ skipped: true, last_step_index: 0 }),
  },
  {
    event: "profile setup viewed",
    properties: undefined,
    run: (a) => a.trackProfileSetupViewed(),
  },
  {
    event: "profile setup completed",
    properties: { skipped: false, has_team: true, position_count: 2 },
    run: (a) =>
      a.trackProfileSetupCompleted({
        skipped: false,
        has_team: true,
        position_count: 2,
      }),
  },
];

/**
 * front だけが送る追加プロパティを含むケース。mobile の同名イベントには
 * source / detection が無いため、MOBILE_EVENT_CASES とは分けて持つ。
 * mobile へ同期したらこの配列から MOBILE_EVENT_CASES へ移すこと。
 */
const FRONT_ONLY_EVENT_CASES: typeof MOBILE_EVENT_CASES = [
  {
    event: "free limit reached",
    properties: {
      feature: "unlimited_groups",
      source: "group_create",
      detection: "server",
    },
    run: (a) =>
      a.trackFreeLimitReached("unlimited_groups", {
        source: "group_create",
        detection: "server",
      }),
  },
];

/** 送信そのものの振る舞い（有効化・失敗時の握り潰しなど）を確認する全ケース。 */
const ALL_EVENT_CASES = [...MOBILE_EVENT_CASES, ...FRONT_ONLY_EVENT_CASES];

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
        GOAL_CREATED: "goal created",
        PRACTICE_RECORD_CREATED: "practice record created",
        NOTE_CREATED: "note created",
        THEME_CREATED: "theme created",
        PRACTICE_SCHEDULE_CREATED: "practice schedule created",
        REVIEW_COMPLETED: "review completed",
        SHADOW_SWING_COMPLETED: "shadow swing completed",
        PAYWALL_VIEWED: "paywall viewed",
        UPGRADE_STARTED: "upgrade started",
        PURCHASE_COMPLETED: "purchase completed",
        PURCHASE_FAILED: "purchase failed",
        FREE_LIMIT_REACHED: "free limit reached",
        ONBOARDING_STEP_VIEWED: "onboarding step viewed",
        ONBOARDING_COMPLETED: "onboarding completed",
        PROFILE_SETUP_VIEWED: "profile setup viewed",
        PROFILE_SETUP_COMPLETED: "profile setup completed",
      });
    });

    // MOBILE_EVENT_CASES は「この表に載っているものだけ」を検証するため、
    // 新しい trackXxx を足して ANALYTICS_EVENTS にだけ追記すると、プロパティ名・型が
    // 一度も検証されないまま通ってしまう。表の網羅性そのものを固定する。
    it("MOBILE_EVENT_CASES が ANALYTICS_EVENTS を網羅している", async () => {
      const { analytics } = await loadModules("phc_test");

      // 同じイベントに複数ケースを置くことはある（値の型違いなど）ため集合で比べる。
      const coveredEvents = Array.from(
        new Set(MOBILE_EVENT_CASES.map((c) => c.event)),
      );

      expect(coveredEvents.sort()).toEqual(
        Object.values(analytics.ANALYTICS_EVENTS).sort(),
      );
    });

    it.each(ALL_EVENT_CASES)(
      "$event を定義どおりのプロパティで送る",
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

      for (const testCase of ALL_EVENT_CASES) {
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

      for (const testCase of ALL_EVENT_CASES) {
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
