const mockOpen = jest.fn();

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: mockOpen, close: jest.fn() }),
}));

jest.mock("@app/lib/analytics", () => ({
  trackEvent: jest.fn(),
}));

// HeroUI の Dropdown は jsdom で開けないため、選択肢をそのままボタンとして描画する。
jest.mock("@app/components/filter/FilterChip", () => ({
  __esModule: true,
  default: ({
    label,
    options,
    onChange,
  }: {
    label: string;
    options: { key: string; label: string }[];
    onChange: (key: string) => void;
  }) => (
    <>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
        >
          {label}: {option.label}
        </button>
      ))}
    </>
  ),
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
import userEvent from "@testing-library/user-event";
import { getProStatus } from "@app/(app)/pro/actions";
import { ProStatusProvider } from "@app/components/pro/ProStatusProvider";
import {
  DEFAULT_PRO_STATUS,
  PRO_FEATURES,
  type Feature,
  type ProFeature,
  type ProStatus,
} from "@app/types/pro";
import {
  getAdditionalStats,
  getBattingTrend,
  getContactQualities,
  getCountSituations,
  getHeadlineStats,
  getHitDirections,
  getHitLocations,
  getPitcherAttributeSummary,
  getPitcherFaceoffs,
  getPitchTypes,
  getPlateAppearanceBreakdown,
  getRunnersSituation,
  getTimingBreakdown,
  type AnalysisInitialData,
} from "../../../analysisActions";
import { AnalysisContainer, type ProAnalysisData } from "../AnalysisContainer";

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

const REFETCHED_COUNT_SITUATIONS = {
  ...REAL_COUNT_SITUATIONS,
  first_pitch: { at_bats: 21, hits: 9, batting_average: 0.429 },
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

const NO_PRO_DATA: ProAnalysisData = {
  countSituations: null,
  pitchTypes: null,
  pitcherFaceoffs: null,
};

const SSR_PRO_DATA: ProAnalysisData = {
  countSituations: REAL_COUNT_SITUATIONS,
  pitchTypes: REAL_PITCH_TYPES,
  pitcherFaceoffs: REAL_PITCHER_FACEOFFS,
};

const ALL_PRO_FEATURES: readonly ProFeature[] = [
  "hit_direction_average",
  "count_situation_average",
  "pitch_type_average",
  "pitcher_faceoff_average",
];

const CTA_NAMES = {
  hitDirection: "Pro プランを見る（方向別の打率）",
  countSituation: "Pro プランを見る（カウント別の打率）",
  pitchType: "Pro プランを見る（球種別の打率）",
  pitcherFaceoff: "Pro プランを見る（対戦投手別）",
};

async function renderContainer({
  initialProData = NO_PRO_DATA,
  initialProFeatures = [],
}: {
  initialProData?: ProAnalysisData;
  initialProFeatures?: readonly ProFeature[];
} = {}) {
  await act(async () => {
    render(
      <ProStatusProvider>
        <AnalysisContainer
          initialData={initialData}
          initialProData={initialProData}
          initialProFeatures={initialProFeatures}
          seasonOptions={[]}
          tournamentOptions={[]}
        />
      </ProStatusProvider>,
    );
  });
}

/** 推移グラフの粒度トグルを押す。 */
async function clickGranularity(label: string) {
  const user = userEvent.setup();
  await act(async () => {
    await user.click(screen.getByRole("button", { name: label }));
  });
}

/** 年度フィルタを「通算」から当年へ切り替える。 */
async function changeYearFilter() {
  const user = userEvent.setup();
  const year = String(new Date().getFullYear());
  await act(async () => {
    await user.click(screen.getByRole("button", { name: `年度: ${year}` }));
  });
}

/** 見出しから該当セクション全体のテキストを取り出す（ブロック単位の表示確認用）。 */
function sectionTextFor(heading: string): string {
  return screen.getByText(heading).closest("section")?.textContent ?? "";
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolveFn) => {
    resolve = resolveFn;
  });
  return { promise, resolve };
}

function mockNonProAnalysisActions() {
  (getHeadlineStats as jest.Mock).mockResolvedValue(null);
  (getRunnersSituation as jest.Mock).mockResolvedValue(null);
  (getAdditionalStats as jest.Mock).mockResolvedValue(null);
  (getHitLocations as jest.Mock).mockResolvedValue({ points: [] });
  (getHitDirections as jest.Mock).mockResolvedValue(initialData.hitDirections);
  (getPlateAppearanceBreakdown as jest.Mock).mockResolvedValue([]);
  (getContactQualities as jest.Mock).mockResolvedValue({
    breakdown: [],
    total: 0,
  });
  (getTimingBreakdown as jest.Mock).mockResolvedValue({
    breakdown: [],
    total: 0,
  });
  (getPitcherAttributeSummary as jest.Mock).mockResolvedValue(
    initialData.pitcherAttributes,
  );
  (getBattingTrend as jest.Mock).mockResolvedValue({
    status: "ok",
    data: { granularity: "game", points: [] },
  });
}

describe("AnalysisContainer の Pro 出し分け", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthCookies();
    mockNonProAnalysisActions();
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

    it("SSR 済みの実データをそのまま表示し、クライアントで取り直さない", async () => {
      await renderContainer({
        initialProData: SSR_PRO_DATA,
        initialProFeatures: ALL_PRO_FEATURES,
      });

      expect(screen.getByText("20打数 8安打")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /ナックル/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /実データ投手/ }),
      ).toBeInTheDocument();
      // 方向別は無料開放の hit_directions レスポンスをそのまま実データとして描画する。
      expect(screen.getByText("方向別の打率")).toBeInTheDocument();
      expect(screen.getByText(".333")).toBeInTheDocument();

      expect(mockGetCountSituations).not.toHaveBeenCalled();
      expect(mockGetPitchTypes).not.toHaveBeenCalled();
      expect(mockGetPitcherFaceoffs).not.toHaveBeenCalled();
    });

    it("クライアントの Pro 判定を待つ間も「対象データなし」を挟まない", async () => {
      // Pro 状態のクライアント取得を宙吊りにし、判定確定前の描画だけを観察する。
      mockGetProStatus.mockReturnValue(new Promise(() => {}));

      await renderContainer({
        initialProData: SSR_PRO_DATA,
        initialProFeatures: ALL_PRO_FEATURES,
      });

      expect(sectionTextFor("カウント別の打率")).not.toContain(
        "対象データなし",
      );
      expect(sectionTextFor("球種別の打率")).not.toContain("対象データなし");
      expect(sectionTextFor("対戦投手別")).not.toContain("対戦データなし");
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByText("20打数 8安打")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /実データ投手/ }),
      ).toBeInTheDocument();
    });

    it("アップセルもサンプルデータも表示しない", async () => {
      await renderContainer({
        initialProData: SSR_PRO_DATA,
        initialProFeatures: ALL_PRO_FEATURES,
      });

      expect(
        screen.queryByRole("button", { name: /Pro プランを見る/ }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/サンプルデータ（実際の記録ではありません）/),
      ).not.toBeInTheDocument();
      expect(screen.queryByText("投手 A")).not.toBeInTheDocument();
    });

    it("フィルタ変更時に Pro 限定3種をそれぞれ1回だけ再取得する", async () => {
      mockGetCountSituations.mockResolvedValue({
        status: "ok",
        data: REFETCHED_COUNT_SITUATIONS,
      });

      await renderContainer({
        initialProData: SSR_PRO_DATA,
        initialProFeatures: ALL_PRO_FEATURES,
      });
      await changeYearFilter();

      await waitFor(() => {
        expect(screen.getByText("21打数 9安打")).toBeInTheDocument();
      });
      expect(mockGetCountSituations).toHaveBeenCalledTimes(1);
      expect(mockGetPitchTypes).toHaveBeenCalledTimes(1);
      expect(mockGetPitcherFaceoffs).toHaveBeenCalledTimes(1);
    });

    it("サーバーで Pro 判定できなかった場合は読み込み中を出してから実データに差し替える", async () => {
      const pending = deferred<{
        status: "ok";
        data: typeof REAL_COUNT_SITUATIONS;
      }>();
      mockGetCountSituations.mockReturnValue(pending.promise);

      await renderContainer();

      expect(
        screen.getByText("カウント別の打率を読み込み中"),
      ).toBeInTheDocument();
      // 空データのカードにも Paywall にも倒さず、読み込み中のまま待つ。
      expect(screen.queryByText("カウント別の打率")).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: CTA_NAMES.countSituation }),
      ).not.toBeInTheDocument();

      await act(async () => {
        pending.resolve({ status: "ok", data: REAL_COUNT_SITUATIONS });
      });

      expect(screen.getByText("20打数 8安打")).toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(mockGetCountSituations).toHaveBeenCalledTimes(1);
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

      expect(await screen.findByText("18打数 6安打")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /ストレート/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /投手 A/ }),
      ).toBeInTheDocument();
      expect(screen.queryByText("20打数 8安打")).not.toBeInTheDocument();
    });

    it("方向別を含む4ブロックすべてでサンプルであることを明示する", async () => {
      await renderContainer();

      expect(
        await screen.findAllByText(
          "サンプルデータ（実際の記録ではありません）",
        ),
      ).toHaveLength(4);
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

    it("フィルタを変えても Pro 限定 API を呼ばない", async () => {
      await renderContainer();
      await changeYearFilter();

      expect(mockGetCountSituations).not.toHaveBeenCalled();
      expect(mockGetPitchTypes).not.toHaveBeenCalled();
      expect(mockGetPitcherFaceoffs).not.toHaveBeenCalled();
    });
  });

  describe("サーバーが 403 を返したとき", () => {
    beforeEach(() => {
      setAuthCookies();
      mockGetProStatus.mockResolvedValue(makeProStatus());
    });

    it("その機能だけ Paywall に切り替え、他機能を巻き込んで取り直さない", async () => {
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
      expect(mockGetPitchTypes).toHaveBeenCalledTimes(1);
      expect(mockGetCountSituations).toHaveBeenCalledTimes(1);
      expect(mockGetPitcherFaceoffs).toHaveBeenCalledTimes(1);
    });

    it("SSR で 403 だった機能は判定確定まで Paywall のままにする", async () => {
      // クライアントの Pro 判定を宙吊りにして、SSR の 403 判断が効く区間を観察する。
      mockGetProStatus.mockReturnValue(new Promise(() => {}));

      await renderContainer({
        initialProData: { ...SSR_PRO_DATA, pitchTypes: null },
        initialProFeatures: ALL_PRO_FEATURES.filter(
          (feature) => feature !== "pitch_type_average",
        ),
      });

      expect(
        screen.getByRole("button", { name: CTA_NAMES.pitchType }),
      ).toBeInTheDocument();
      expect(mockGetPitchTypes).not.toHaveBeenCalled();
      // 他2種は SSR 済みなので取得もプレースホルダーも発生しない。
      expect(screen.getByText("20打数 8安打")).toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("フィルタを変えても 403 の機能はロックしたままにする", async () => {
      mockGetPitchTypes.mockResolvedValue({ status: "pro_required" });

      await renderContainer();
      expect(
        await screen.findByRole("button", { name: CTA_NAMES.pitchType }),
      ).toBeInTheDocument();

      await changeYearFilter();

      await waitFor(() => {
        expect(mockGetCountSituations).toHaveBeenCalledTimes(2);
      });
      expect(
        screen.getByRole("button", { name: CTA_NAMES.pitchType }),
      ).toBeInTheDocument();
      expect(mockGetPitchTypes).toHaveBeenCalledTimes(1);
    });
  });
});

const SEASON_TREND = {
  granularity: "season" as const,
  points: [
    {
      key: "season-1",
      label: "2026春季",
      batting_average: 0.412,
      on_base_percentage: 0.45,
      slugging_percentage: 0.6,
      ops: 1.05,
      at_bats_in_period: 34,
      cumulative_at_bats: 34,
    },
  ],
};

const GRANULARITY_NOTES = {
  game: "開幕からの累積",
  season: "シーズンごとの成績（シーズン跨ぎ比較）",
};

/** 粒度トグルの選択状態を読む（データが無くてもトグルは出るため常に使える）。 */
function activeGranularityLabel(): string | undefined {
  return screen
    .getAllByRole("button", { pressed: true })
    .map((button) => button.textContent ?? "")
    .at(0);
}

describe("打撃推移のシーズン粒度", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthCookies();
    setAuthCookies();
    mockNonProAnalysisActions();
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

  describe("season_transition_graph を持つとき", () => {
    beforeEach(() => {
      mockGetProStatus.mockResolvedValue(makeProStatus());
      (getBattingTrend as jest.Mock).mockResolvedValue({
        status: "ok",
        data: SEASON_TREND,
      });
    });

    it("シーズンを選ぶと season 粒度で取得して描画する", async () => {
      await renderContainer({
        initialProFeatures: ["season_transition_graph"],
      });

      await clickGranularity("シーズン");

      expect(getBattingTrend).toHaveBeenCalledWith(expect.anything(), "season");
      expect(
        await screen.findByText(GRANULARITY_NOTES.season),
      ).toBeInTheDocument();
      expect(screen.getByText("2026春季")).toBeInTheDocument();
      expect(mockOpen).not.toHaveBeenCalled();
    });

    it("シーズン数が多いときは X 軸ラベルを間引く", async () => {
      (getBattingTrend as jest.Mock).mockResolvedValue({
        status: "ok",
        data: {
          granularity: "season",
          points: Array.from({ length: 12 }, (_, index) => ({
            ...SEASON_TREND.points[0],
            key: `season-${index + 1}`,
            label: `S${String(index + 1).padStart(2, "0")}`,
          })),
        },
      });

      await renderContainer({
        initialProFeatures: ["season_transition_graph"],
      });
      await clickGranularity("シーズン");

      // 12 シーズンなら 3 つおき + 最終シーズンだけをラベルにする。
      expect(await screen.findByText("S01")).toBeInTheDocument();
      expect(screen.getByText("S04")).toBeInTheDocument();
      expect(screen.getByText("S12")).toBeInTheDocument();
      expect(screen.queryByText("S03")).not.toBeInTheDocument();
    });

    it("クライアントの Pro 判定を待つ間もシーズンを選べる", async () => {
      // Pro 状態のクライアント取得を宙吊りにし、SSR 済みの判定だけで操作させる。
      mockGetProStatus.mockReturnValue(new Promise(() => {}));

      await renderContainer({
        initialProFeatures: ["season_transition_graph"],
      });
      await clickGranularity("シーズン");

      expect(getBattingTrend).toHaveBeenCalledWith(expect.anything(), "season");
      expect(mockOpen).not.toHaveBeenCalled();
    });

    it("サーバーに 403 で拒否されたら試合粒度へ戻し Paywall を出す", async () => {
      (getBattingTrend as jest.Mock).mockResolvedValueOnce({
        status: "pro_required",
      });

      await renderContainer({
        initialProFeatures: ["season_transition_graph"],
      });
      await clickGranularity("シーズン");

      await waitFor(() => {
        expect(activeGranularityLabel()).toBe("試合");
      });
      expect(mockOpen).toHaveBeenCalledWith({
        trigger: "season_transition_graph",
      });
      expect(getBattingTrend).toHaveBeenLastCalledWith(
        expect.anything(),
        "game",
      );
    });
  });

  describe("無料ユーザー", () => {
    beforeEach(() => {
      mockGetProStatus.mockResolvedValue(DEFAULT_PRO_STATUS);
    });

    it("シーズンを選んでも切り替えず、Paywall を出して API も叩かない", async () => {
      await renderContainer();

      await clickGranularity("シーズン");

      expect(mockOpen).toHaveBeenCalledWith({
        trigger: "season_transition_graph",
      });
      expect(getBattingTrend).not.toHaveBeenCalled();
      expect(activeGranularityLabel()).toBe("試合");
    });

    it("Pro 判定が確定する前でもシーズン粒度の API を叩かない", async () => {
      mockGetProStatus.mockReturnValue(new Promise(() => {}));

      await renderContainer();
      await clickGranularity("シーズン");

      expect(getBattingTrend).not.toHaveBeenCalled();
      expect(mockOpen).toHaveBeenCalledWith({
        trigger: "season_transition_graph",
      });
    });

    it("シーズン以外の粒度は従来どおり切り替えられる", async () => {
      await renderContainer();

      await clickGranularity("月");

      expect(getBattingTrend).toHaveBeenCalledWith(expect.anything(), "month");
      expect(mockOpen).not.toHaveBeenCalled();
    });
  });
});
