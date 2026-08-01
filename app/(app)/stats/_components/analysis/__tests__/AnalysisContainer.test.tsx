const mockOpen = jest.fn();

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: mockOpen, close: jest.fn() }),
}));

jest.mock("@app/lib/analytics", () => ({
  trackEvent: jest.fn(),
}));

jest.mock("@app/(app)/pro/actions", () => ({
  getProStatus: jest.fn(),
}));

jest.mock("../../../analysisActions", () => ({
  getHeadlineStats: jest.fn(),
  getRunnersSituation: jest.fn(),
  getAdditionalStats: jest.fn(),
  getHitLocations: jest.fn(),
  getHitDirections: jest.fn(),
  getPlateAppearanceBreakdown: jest.fn(),
  getContactQualities: jest.fn(),
  getTimingBreakdown: jest.fn(),
  getPitcherAttributeSummary: jest.fn(),
  getBattingTrend: jest.fn(),
  getCountSituations: jest.fn(),
  getPitchTypes: jest.fn(),
  getPitcherFaceoffs: jest.fn(),
}));

import { act, render, screen, waitFor } from "@testing-library/react";
import { getProStatus } from "@app/(app)/pro/actions";
import { ProStatusProvider } from "@app/components/pro/ProStatusProvider";
import {
  DEFAULT_PRO_STATUS,
  PRO_FEATURES,
  type Feature,
  type ProStatus,
} from "@app/types/pro";
import {
  getCountSituations,
  getPitcherFaceoffs,
  getPitchTypes,
  type AnalysisInitialData,
} from "../../../analysisActions";
import { AnalysisContainer } from "../AnalysisContainer";

const mockGetProStatus = getProStatus as jest.MockedFunction<
  typeof getProStatus
>;
const mockGetCountSituations = getCountSituations as jest.MockedFunction<
  typeof getCountSituations
>;
const mockGetPitchTypes = getPitchTypes as jest.MockedFunction<
  typeof getPitchTypes
>;
const mockGetPitcherFaceoffs = getPitcherFaceoffs as jest.MockedFunction<
  typeof getPitcherFaceoffs
>;

function setAuthCookies() {
  document.cookie = "access-token=test-access-token";
  document.cookie = "client=test-client";
  document.cookie = "uid=user@example.com";
}

function clearAuthCookies() {
  for (const name of ["access-token", "client", "uid"]) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

function makeProStatus(): ProStatus {
  return {
    subscription: {
      status: "active",
      plan_type: "yearly",
      platform: "web",
      started_at: "2026-04-01T00:00:00+09:00",
      expires_at: "2027-04-01T00:00:00+09:00",
      pro_active: true,
      in_trial: false,
      in_grace_period: false,
      days_remaining: 200,
      is_early_subscriber: false,
      has_used_trial: true,
    },
    entitlements: [
      ...DEFAULT_PRO_STATUS.entitlements,
      ...PRO_FEATURES,
    ] as Feature[],
  };
}

// 実 API 由来と判別できるよう、サンプルデータとは重ならない値にしている。
const REAL_COUNT_SITUATIONS = {
  first_pitch: { at_bats: 20, hits: 8, batting_average: 0.4 },
  favorable_count: { at_bats: 30, hits: 9, batting_average: 0.3 },
  pinch_count: { at_bats: 40, hits: 8, batting_average: 0.2 },
  total_target_pa: 77,
};

const REAL_PITCH_TYPES = {
  rows: [
    {
      id: 91,
      label: "ナックル",
      plate_appearances: 20,
      at_bats: 18,
      hits: 9,
      total_bases: 12,
      base_on_balls: 2,
      hit_by_pitch: 0,
      sacrifice_fly: 0,
      batting_average: 0.5,
      on_base_percentage: 0.55,
      slugging_percentage: 0.667,
      ops: 1.217,
      result_counts: [],
    },
  ],
  total_target_pa: 55,
};

const REAL_PITCHER_FACEOFFS = {
  rows: [
    {
      pitcher_id: 91,
      pitcher_name: "実データ投手",
      team_name: null,
      throw_hand: "right" as const,
      pitcher_style: null,
      velocity_zone: null,
      plate_appearances: 8,
      at_bats: 8,
      hits: 4,
      total_bases: 5,
      base_on_balls: 0,
      hit_by_pitch: 0,
      sacrifice_fly: 0,
      batting_average: 0.5,
      on_base_percentage: 0.5,
      slugging_percentage: 0.625,
      ops: 1.125,
      top_result: "単打",
      result_counts: [],
    },
  ],
  min_plate_appearances: 3,
  total_target_pa: 44,
};

const initialData: AnalysisInitialData = {
  headline: null,
  runnersSituation: null,
  additional: null,
  hitLocations: { points: [] },
  hitDirections: {
    directions: [
      {
        id: 10,
        label: "中",
        count: 33,
        top_category: "フライ",
        at_bats: 33,
        hits: 11,
        two_base_hit: 0,
        three_base_hit: 0,
        home_run: 0,
        total_bases: 11,
      },
    ],
    home_runs: [],
  },
  plateBreakdown: [],
  contactQualities: { breakdown: [], total: 0 },
  timingBreakdown: { breakdown: [], total: 0 },
  pitcherAttributes: {
    by_throw_hand: [],
    by_arm_angle: [],
    by_velocity_zone: [],
    by_pitcher_style: [],
  },
  battingTrend: { granularity: "game", points: [] },
};

const CTA_NAMES = {
  hitDirection: "Pro プランを見る（方向別の打率）",
  countSituation: "Pro プランを見る（カウント別の打率）",
  pitchType: "Pro プランを見る（球種別の打率）",
  pitcherFaceoff: "Pro プランを見る（対戦投手別）",
};

async function renderContainer() {
  await act(async () => {
    render(
      <ProStatusProvider>
        <AnalysisContainer
          initialData={initialData}
          seasonOptions={[]}
          tournamentOptions={[]}
        />
      </ProStatusProvider>,
    );
  });
}

describe("AnalysisContainer の Pro 出し分け", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthCookies();
    mockGetCountSituations.mockResolvedValue({
      status: "ok",
      data: REAL_COUNT_SITUATIONS,
    });
    mockGetPitchTypes.mockResolvedValue({
      status: "ok",
      data: REAL_PITCH_TYPES,
    });
    mockGetPitcherFaceoffs.mockResolvedValue({
      status: "ok",
      data: REAL_PITCHER_FACEOFFS,
    });
  });

  describe("Pro 加入者", () => {
    beforeEach(() => {
      setAuthCookies();
      mockGetProStatus.mockResolvedValue(makeProStatus());
    });

    it("4機能とも実データを表示し、Pro 限定 API を呼ぶ", async () => {
      await renderContainer();

      await waitFor(() => {
        expect(mockGetCountSituations).toHaveBeenCalledTimes(1);
      });
      expect(mockGetPitchTypes).toHaveBeenCalledTimes(1);
      expect(mockGetPitcherFaceoffs).toHaveBeenCalledTimes(1);

      expect(await screen.findByText("20打数 8安打")).toBeInTheDocument();
      expect(
        await screen.findByRole("button", { name: /ナックル/ }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole("button", { name: /実データ投手/ }),
      ).toBeInTheDocument();
      // 方向別は無料開放の hit_directions レスポンスをそのまま実データとして描画する。
      expect(screen.getByText("方向別の打率")).toBeInTheDocument();
      expect(screen.getByText(".333")).toBeInTheDocument();
    });

    it("アップセルもサンプルデータも表示しない", async () => {
      await renderContainer();

      await waitFor(() => {
        expect(mockGetCountSituations).toHaveBeenCalled();
      });

      expect(
        screen.queryByRole("button", { name: /Pro プランを見る/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/サンプルデータ（実際の記録ではありません）/),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("投手 A")).not.toBeInTheDocument();
    });
  });

  describe("無料ユーザー", () => {
    beforeEach(() => {
      setAuthCookies();
      mockGetProStatus.mockResolvedValue(DEFAULT_PRO_STATUS);
    });

    it("Pro 限定 API を呼ばない", async () => {
      await renderContainer();

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: CTA_NAMES.countSituation }),
        ).toBeInTheDocument();
      });
      expect(mockGetCountSituations).not.toHaveBeenCalled();
      expect(mockGetPitchTypes).not.toHaveBeenCalled();
      expect(mockGetPitcherFaceoffs).not.toHaveBeenCalled();
    });

    it("サンプルデータを実コンポーネントに流し込んで表示する", async () => {
      await renderContainer();

      expect(await screen.findByText("9打数 3安打")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /ストレート/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /投手 A/ }),
      ).toBeInTheDocument();
      expect(
        screen.getAllByText("サンプルデータ（実際の記録ではありません）"),
      ).toHaveLength(3);
      expect(screen.queryByText("20打数 8安打")).not.toBeInTheDocument();
    });

    it("4つの CTA をスクリーンリーダーで読み分けられる", async () => {
      await renderContainer();

      const ctaNames = Object.values(CTA_NAMES);
      for (const name of ctaNames) {
        expect(await screen.findByRole("button", { name })).toBeInTheDocument();
      }
      expect(
        screen.getAllByRole("button", { name: /Pro プランを見る/ }),
      ).toHaveLength(ctaNames.length);
    });
  });

  describe("Pro 判定が未確定の間", () => {
    it("ロック UI もサンプルデータも表示しない", async () => {
      setAuthCookies();
      mockGetProStatus.mockReturnValue(new Promise(() => {}));

      await renderContainer();

      expect(
        screen.queryByRole("button", { name: /Pro プランを見る/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("サンプルデータ（実際の記録ではありません）"),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("投手 A")).not.toBeInTheDocument();
      expect(screen.queryByText("方向別の打率")).not.toBeInTheDocument();
      expect(mockGetCountSituations).not.toHaveBeenCalled();
    });
  });

  describe("サーバーが 403 を返したとき", () => {
    it("その機能だけ Paywall に切り替える", async () => {
      setAuthCookies();
      mockGetProStatus.mockResolvedValue(makeProStatus());
      mockGetPitchTypes.mockResolvedValue({ status: "pro_required" });

      await renderContainer();

      expect(
        await screen.findByRole("button", { name: CTA_NAMES.pitchType }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /ストレート/ }),
      ).toBeInTheDocument();
      // 403 を返していない機能は実データのまま。
      expect(screen.getByText("20打数 8安打")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: CTA_NAMES.countSituation }),
      ).not.toBeInTheDocument();
      // ロック側へ倒したあとに取得を繰り返さない。
      expect(mockGetPitchTypes).toHaveBeenCalledTimes(1);
    });
  });
});
