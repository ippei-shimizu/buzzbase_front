const mockHasEntitlement = jest.fn();
const mockIsEntitlementLoading = jest.fn(() => false);

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: () => ({
    isPro: mockHasEntitlement("grass_full_history"),
    inTrial: false,
    inGracePeriod: false,
    isLoading: mockIsEntitlementLoading(),
    hasEntitlement: mockHasEntitlement,
  }),
}));

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: jest.fn(), close: jest.fn() }),
}));

jest.mock("@app/lib/analytics", () => ({
  trackEvent: jest.fn(),
}));

import type { FetchResult } from "@app/services/v2/requests";
import type {
  ActivityHeatmap,
  ActivityLog,
  ShadowSwingStats,
} from "@app/types/activity";
import { render, screen } from "@testing-library/react";
import {
  EMPTY_MESSAGE,
  LOAD_ERROR,
  PAYWALL_RANGE_NOTICE,
  PAYWALL_TITLE,
} from "../activityCopy";
import ActivityGrassSection from "../ActivityGrassSection";

// 2026-08-03 は月曜。1 年ぶんを要求した想定。
const TODAY = "2026-08-03";
const REQUESTED_FROM = "2025-08-04";
// back が無料プランでクランプしたときの開始日（直近30日）。
const CLAMPED_FROM = "2026-07-05";

const log = (overrides: Partial<ActivityLog> = {}): ActivityLog => ({
  activity_date: TODAY,
  intensity_level: 2,
  has_game: false,
  total_swing_count: 0,
  practice_menu_count: 0,
  ...overrides,
});

const heatmapResult = (
  overrides: Partial<ActivityHeatmap> = {},
): FetchResult<ActivityHeatmap> => ({
  status: "ok",
  data: {
    from: REQUESTED_FROM,
    to: TODAY,
    current_streak_days: 3,
    longest_streak_days: 12,
    total_active_days: 40,
    data: [log()],
    ...overrides,
  },
});

const swingResult = (total: number): FetchResult<ShadowSwingStats> => ({
  status: "ok",
  data: { today_count: 0, month_count: 0, total_count: total },
});

const renderSection = (
  heatmap: FetchResult<ActivityHeatmap> = heatmapResult(),
  swingStats: FetchResult<ShadowSwingStats> = { status: "error" },
) =>
  render(
    <ActivityGrassSection
      today={TODAY}
      requestedFrom={REQUESTED_FROM}
      heatmap={heatmap}
      swingStats={swingStats}
    />,
  );

// ヒートマップのマス（日付を読み上げるボタン）だけを数える。ペイウォールの CTA は含めない。
const cellCount = (): number =>
  screen.queryAllByRole("button", { name: /年\d+月\d+日\(/ }).length;

beforeEach(() => {
  mockHasEntitlement.mockReset();
  mockHasEntitlement.mockReturnValue(true);
  mockIsEntitlementLoading.mockReturnValue(false);
});

describe("ActivityGrassSection", () => {
  describe("Streak", () => {
    it("連続日数と最長日数をそれぞれ表示する", () => {
      renderSection(
        heatmapResult({ current_streak_days: 5, longest_streak_days: 21 }),
      );

      expect(screen.getByText("連続 5日")).toBeInTheDocument();
      expect(screen.getByText("最長 21日")).toBeInTheDocument();
    });

    it("通算日数を表示する", () => {
      renderSection(heatmapResult({ total_active_days: 40 }));

      expect(screen.getByText("通算 40日")).toBeInTheDocument();
    });
  });

  describe("行動ナッジ", () => {
    it("今日未記録で最長を超えるときだけ自己ベスト更新と誘う", () => {
      renderSection(
        heatmapResult({
          current_streak_days: 11,
          longest_streak_days: 11,
          data: [log({ activity_date: "2026-08-02" })],
        }),
      );

      expect(
        screen.getByText("今日記録すれば自己ベスト更新の12日連続"),
      ).toBeInTheDocument();
    });

    it("自己ベスト更新にならないときは更新を名乗らない", () => {
      renderSection(
        heatmapResult({
          current_streak_days: 3,
          longest_streak_days: 30,
          data: [log({ activity_date: "2026-08-02" })],
        }),
      );

      expect(screen.getByText("今日記録すれば4日連続")).toBeInTheDocument();
      expect(screen.queryByText(/自己ベスト更新/)).not.toBeInTheDocument();
    });

    it("今日すでに記録済みなら記録済みとして伝える", () => {
      renderSection(
        heatmapResult({ current_streak_days: 3, longest_streak_days: 30 }),
      );

      expect(screen.getByText("3日連続中！今日も記録済み")).toBeInTheDocument();
    });
  });

  describe("マイルストーン", () => {
    it("節目の 1 日前は残り 1 日と伝える", () => {
      renderSection(heatmapResult({ total_active_days: 9 }));

      expect(screen.getByText("通算10日まであと1日")).toBeInTheDocument();
    });

    it("節目ちょうどの日は次の節目に切り替える", () => {
      renderSection(heatmapResult({ total_active_days: 10 }));

      expect(screen.getByText("通算30日まであと20日")).toBeInTheDocument();
      expect(screen.queryByText(/通算10日/)).not.toBeInTheDocument();
    });

    it("素振り累計が取れたら節目を表示する", () => {
      renderSection(heatmapResult(), swingResult(1200));

      expect(
        screen.getByText("素振り累計5,000本まであと3,800本"),
      ).toBeInTheDocument();
    });

    it("素振り累計が取れなくても他の表示は壊れない", () => {
      renderSection(heatmapResult({ total_active_days: 9 }), {
        status: "error",
      });

      expect(screen.queryByText(/素振り累計/)).not.toBeInTheDocument();
      expect(screen.getByText("通算10日まであと1日")).toBeInTheDocument();
    });

    it("素振りの記録が 0 本なら節目を出さない", () => {
      renderSection(heatmapResult(), swingResult(0));

      expect(screen.queryByText(/素振り累計/)).not.toBeInTheDocument();
    });
  });

  describe("無料プランの範囲外", () => {
    it("クランプされた期間はペイウォールを出し、空のマスで埋めない", () => {
      mockHasEntitlement.mockReturnValue(false);
      renderSection(heatmapResult({ from: CLAMPED_FROM, data: [] }));

      expect(screen.getByText(PAYWALL_TITLE)).toBeInTheDocument();
      expect(screen.getByText(PAYWALL_RANGE_NOTICE)).toBeInTheDocument();
      // 直近30日ぶんのマスだけを描き、取得できていない日は描かない。
      expect(cellCount()).toBe(30);
      expect(
        screen.queryByRole("button", { name: /2026年6月30日/ }),
      ).not.toBeInTheDocument();
    });

    it("Pro なら全期間のマスを描き、ペイウォールを出さない", () => {
      mockHasEntitlement.mockReturnValue(true);
      renderSection(heatmapResult());

      expect(screen.queryByText(PAYWALL_TITLE)).not.toBeInTheDocument();
      expect(cellCount()).toBe(365);
      expect(
        screen.getByRole("button", { name: /2025年8月4日/ }),
      ).toBeInTheDocument();
    });

    it("Pro 判定が未確定の間はペイウォールを出さない", () => {
      mockIsEntitlementLoading.mockReturnValue(true);
      mockHasEntitlement.mockReturnValue(false);
      renderSection(heatmapResult({ from: CLAMPED_FROM, data: [] }));

      expect(screen.queryByText(PAYWALL_TITLE)).not.toBeInTheDocument();
    });

    it("Pro 判定が未確定でも取得できた日は範囲外扱いにしない", () => {
      mockIsEntitlementLoading.mockReturnValue(true);
      mockHasEntitlement.mockReturnValue(false);
      renderSection(heatmapResult({ from: CLAMPED_FROM, data: [] }));

      expect(cellCount()).toBe(30);
      expect(
        screen.getByRole("button", { name: /2026年7月5日/ }),
      ).toBeInTheDocument();
    });

    it("クランプされていなければ無料ユーザーでもペイウォールを出さない", () => {
      mockHasEntitlement.mockReturnValue(false);
      renderSection(heatmapResult());

      expect(screen.queryByText(PAYWALL_TITLE)).not.toBeInTheDocument();
    });
  });

  describe("0 件と取得失敗", () => {
    it("記録が 0 件ならマップと案内を出す", () => {
      renderSection(heatmapResult({ data: [] }));

      expect(screen.getByText(EMPTY_MESSAGE)).toBeInTheDocument();
      expect(screen.queryByText(LOAD_ERROR)).not.toBeInTheDocument();
      expect(cellCount()).toBe(365);
    });

    it("取得に失敗したらエラーを伝え、0 件として描かない", () => {
      renderSection({ status: "error" });

      expect(screen.getByText(LOAD_ERROR)).toBeInTheDocument();
      expect(screen.queryByText(EMPTY_MESSAGE)).not.toBeInTheDocument();
      expect(cellCount()).toBe(0);
    });
  });
});
