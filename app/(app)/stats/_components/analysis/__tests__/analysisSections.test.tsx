jest.mock("@app/(app)/pro/proStatus", () => ({
  getCachedProStatus: jest.fn(),
}));

jest.mock("../../../filterOptions", () => ({
  getStatsFilterOptions: jest.fn(),
}));

jest.mock("../../../analysisActions", () => ({
  getInitialAnalysisData: jest.fn(),
  getCountSituations: jest.fn(),
  getPitchTypes: jest.fn(),
  getPitcherFaceoffs: jest.fn(),
  getEraTrend: jest.fn(),
}));

// Server Component の配線だけを見たいので、渡し先の Client Component は空実装にする。
jest.mock("../AnalysisContainer", () => ({
  AnalysisContainer: () => null,
}));

jest.mock("../PitchingAnalysisContainer", () => ({
  PitchingAnalysisContainer: () => null,
}));

import type { ReactElement } from "react";
import { getCachedProStatus } from "@app/(app)/pro/proStatus";
import {
  DEFAULT_PRO_STATUS,
  type Feature,
  type ProFeature,
  type ProStatus,
} from "@app/types/pro";
import {
  getCountSituations,
  getEraTrend,
  getInitialAnalysisData,
  getPitcherFaceoffs,
  getPitchTypes,
} from "../../../analysisActions";
import { getStatsFilterOptions } from "../../../filterOptions";
import { AnalysisSection } from "../AnalysisSection";
import { PitchingAnalysisSection } from "../PitchingAnalysisSection";

const mockGetCachedProStatus = getCachedProStatus as jest.MockedFunction<
  typeof getCachedProStatus
>;
const mockGetStatsFilterOptions = getStatsFilterOptions as jest.MockedFunction<
  typeof getStatsFilterOptions
>;
const mockGetInitialAnalysisData =
  getInitialAnalysisData as jest.MockedFunction<typeof getInitialAnalysisData>;
const mockGetCountSituations = getCountSituations as jest.MockedFunction<
  typeof getCountSituations
>;
const mockGetPitchTypes = getPitchTypes as jest.MockedFunction<
  typeof getPitchTypes
>;
const mockGetPitcherFaceoffs = getPitcherFaceoffs as jest.MockedFunction<
  typeof getPitcherFaceoffs
>;
const mockGetEraTrend = getEraTrend as jest.MockedFunction<typeof getEraTrend>;

const MONTH_POINTS = [
  { key: "month-04", label: "4月", era: 2.5 },
  { key: "month-05", label: "5月", era: 3.75 },
];

interface ContainerProps {
  initialProFeatures: readonly ProFeature[];
}

interface PitchingContainerProps extends ContainerProps {
  initialEraTrend: { key: string; label: string; era: number }[];
}

/**
 * `<Suspense>` でラップされた非同期 Server Component を実行し、
 * 渡し先 Client Component に与えられた props を取り出す。
 */
async function resolveSectionProps<P>(section: ReactElement): Promise<P> {
  const { children } = section.props as { children: ReactElement };
  const dataProvider = children.type as () => Promise<ReactElement>;
  const rendered = await dataProvider();
  return rendered.props as P;
}

function makeProStatus(entitlements: Feature[]): ProStatus {
  return {
    ...DEFAULT_PRO_STATUS,
    entitlements: [...DEFAULT_PRO_STATUS.entitlements, ...entitlements],
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetStatsFilterOptions.mockResolvedValue({
    seasonOptions: [],
    tournamentOptions: [],
    monthOptions: [],
  });
  mockGetEraTrend.mockResolvedValue({
    status: "ok",
    data: { granularity: "month", points: MONTH_POINTS },
  });
});

describe("PitchingAnalysisSection の SSR 配線", () => {
  it("SSR で判定した Pro 機能とデフォルト粒度のデータをコンテナへ渡す", async () => {
    mockGetCachedProStatus.mockResolvedValue(
      makeProStatus(["season_transition_graph"]),
    );

    const props = await resolveSectionProps<PitchingContainerProps>(
      PitchingAnalysisSection(),
    );

    expect(props.initialProFeatures).toEqual(["season_transition_graph"]);
    expect(props.initialEraTrend).toEqual(MONTH_POINTS);
  });

  it("entitlement の無いユーザーにはシーズン粒度を許可しない", async () => {
    mockGetCachedProStatus.mockResolvedValue(DEFAULT_PRO_STATUS);

    const props = await resolveSectionProps<PitchingContainerProps>(
      PitchingAnalysisSection(),
    );

    expect(props.initialProFeatures).toEqual([]);
  });
});

describe("AnalysisSection の SSR 配線", () => {
  beforeEach(() => {
    mockGetInitialAnalysisData.mockResolvedValue({
      headline: null,
      runnersSituation: null,
      additional: null,
      hitLocations: { points: [] },
      hitDirections: { directions: [], home_runs: [] },
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
    });
    mockGetCountSituations.mockResolvedValue({ status: "pro_required" });
    mockGetPitchTypes.mockResolvedValue({ status: "pro_required" });
    mockGetPitcherFaceoffs.mockResolvedValue({ status: "pro_required" });
  });

  // SSR で取得しない機能（シーズン粒度）も閲覧可否だけは渡す必要がある。
  // 落とすと Pro ユーザーがクライアント判定を待つ間だけ Paywall に倒れる。
  it("SSR で取得しないシーズン粒度も閲覧可否として渡す", async () => {
    mockGetCachedProStatus.mockResolvedValue(
      makeProStatus(["season_transition_graph"]),
    );

    const props = await resolveSectionProps<ContainerProps>(AnalysisSection());

    expect(props.initialProFeatures).toContain("season_transition_graph");
  });

  it("entitlement の無いユーザーにはシーズン粒度を許可しない", async () => {
    mockGetCachedProStatus.mockResolvedValue(DEFAULT_PRO_STATUS);

    const props = await resolveSectionProps<ContainerProps>(AnalysisSection());

    expect(props.initialProFeatures).not.toContain("season_transition_graph");
  });
});
