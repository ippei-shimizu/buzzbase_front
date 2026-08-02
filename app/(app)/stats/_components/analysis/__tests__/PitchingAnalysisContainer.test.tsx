const mockOpen = jest.fn();

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({ open: mockOpen, close: jest.fn() }),
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
  getEraTrend: jest.fn(),
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
import { getEraTrend } from "../../../analysisActions";
import { PitchingAnalysisContainer } from "../PitchingAnalysisContainer";

const mockGetProStatus = getProStatus as jest.MockedFunction<
  typeof getProStatus
>;
const mockGetEraTrend = getEraTrend as jest.MockedFunction<typeof getEraTrend>;

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

const MONTH_POINTS = [
  { key: "month-04", label: "4月", era: 2.5 },
  { key: "month-05", label: "5月", era: 3.75 },
];

const SEASON_POINTS = [
  { key: "season-1", label: "2025秋季", era: 4.2 },
  { key: "season-2", label: "2026春季", era: 1.85 },
];

async function renderContainer({
  initialProFeatures = [],
}: { initialProFeatures?: readonly ProFeature[] } = {}) {
  await act(async () => {
    render(
      <ProStatusProvider>
        <PitchingAnalysisContainer
          initialEraTrend={MONTH_POINTS}
          initialProFeatures={initialProFeatures}
          seasonOptions={[]}
          tournamentOptions={[]}
        />
      </ProStatusProvider>,
    );
  });
}

async function clickGranularity(label: string) {
  const user = userEvent.setup();
  await act(async () => {
    await user.click(screen.getByRole("button", { name: label }));
  });
}

/** モック化した FilterChip が並べる選択肢ボタンを押す（例: "年度: 2025"）。 */
async function clickFilter(name: string) {
  const user = userEvent.setup();
  await act(async () => {
    await user.click(screen.getByRole("button", { name }));
  });
}

function activeGranularityLabel(): string | undefined {
  return screen
    .getAllByRole("button", { pressed: true })
    .map((button) => button.textContent ?? "")
    .at(0);
}

describe("PitchingAnalysisContainer の防御率推移", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthCookies();
    setAuthCookies();
    mockGetEraTrend.mockResolvedValue({
      status: "ok",
      data: { granularity: "season", points: SEASON_POINTS },
    });
  });

  it("SSR 済みの月別データをそのまま描画し、マウント時に取り直さない", async () => {
    mockGetProStatus.mockResolvedValue(makeProStatus());

    await renderContainer({ initialProFeatures: ["season_transition_graph"] });

    expect(screen.getByText("4月")).toBeInTheDocument();
    expect(activeGranularityLabel()).toBe("月");
    expect(mockGetEraTrend).not.toHaveBeenCalled();
  });

  describe("season_transition_graph を持つとき", () => {
    beforeEach(() => {
      mockGetProStatus.mockResolvedValue(makeProStatus());
    });

    it("シーズンを選ぶと season 粒度で取得して描画する", async () => {
      await renderContainer({
        initialProFeatures: ["season_transition_graph"],
      });

      await clickGranularity("シーズン");

      expect(mockGetEraTrend).toHaveBeenCalledWith(expect.anything(), "season");
      expect(await screen.findByText("2026春季")).toBeInTheDocument();
      expect(screen.getByText("1.85")).toBeInTheDocument();
      expect(activeGranularityLabel()).toBe("シーズン");
      expect(mockOpen).not.toHaveBeenCalled();
    });

    it("シーズンから月へ戻せる", async () => {
      await renderContainer({
        initialProFeatures: ["season_transition_graph"],
      });

      await clickGranularity("シーズン");
      mockGetEraTrend.mockResolvedValue({
        status: "ok",
        data: { granularity: "month", points: MONTH_POINTS },
      });
      await clickGranularity("月");

      expect(mockGetEraTrend).toHaveBeenLastCalledWith(
        expect.anything(),
        "month",
      );
      expect(await screen.findByText("4月")).toBeInTheDocument();
      expect(activeGranularityLabel()).toBe("月");
    });

    it("長いシーズン名は X 軸で丸めて描く", async () => {
      mockGetEraTrend.mockResolvedValue({
        status: "ok",
        data: {
          granularity: "season",
          points: [
            { key: "season-1", label: "2025秋季リーグ戦", era: 2.1 },
            { key: "season-2", label: "2026春季リーグ戦", era: 3.2 },
          ],
        },
      });

      await renderContainer({
        initialProFeatures: ["season_transition_graph"],
      });
      await clickGranularity("シーズン");

      expect(await screen.findByText("2026春季…")).toBeInTheDocument();
      expect(screen.getByText("2025秋季…")).toBeInTheDocument();
      expect(screen.queryByText("2026春季リーグ戦")).not.toBeInTheDocument();
    });

    // シーズン数が多いユーザーほど点の間隔が狭くなる。X 軸ラベルだけ間引いても
    // 値ラベルが全点に出ていると 4 桁の数値同士が重なって読めなくなる。
    it("シーズン数が多いときは値ラベルも X 軸と同じ本数に間引く", async () => {
      const manySeasons = Array.from({ length: 8 }, (_, index) => ({
        key: `season-${index}`,
        label: `S${index}`,
        era: Number((index + 1).toFixed(2)),
      }));
      mockGetEraTrend.mockResolvedValue({
        status: "ok",
        data: { granularity: "season", points: manySeasons },
      });

      await renderContainer({
        initialProFeatures: ["season_transition_graph"],
      });
      await clickGranularity("シーズン");

      // stride は ceil(8 / MAX_SEASON_X_LABELS) = 2。末尾は常に描く。
      expect(await screen.findByText("1.00")).toBeInTheDocument();
      expect(screen.getByText("3.00")).toBeInTheDocument();
      expect(screen.getByText("8.00")).toBeInTheDocument();
      expect(screen.queryByText("2.00")).not.toBeInTheDocument();
      expect(screen.queryByText("4.00")).not.toBeInTheDocument();
      expect(screen.queryByText("6.00")).not.toBeInTheDocument();
    });

    // back が将来 season 以外の粒度にも 403 を足したとき、無関係な粒度で
    // 「月粒度へ戻す + シーズンの Paywall」が出ないことを担保する。
    it("月粒度で 403 が返っても Paywall を出さない", async () => {
      mockGetEraTrend.mockResolvedValue({ status: "pro_required" });

      await renderContainer({
        initialProFeatures: ["season_transition_graph"],
      });
      await clickFilter("年度: 2025");

      await waitFor(() => {
        expect(mockGetEraTrend).toHaveBeenCalledWith(
          expect.anything(),
          "month",
        );
      });
      expect(mockOpen).not.toHaveBeenCalled();
      expect(activeGranularityLabel()).toBe("月");
      expect(screen.getByText("4月")).toBeInTheDocument();
    });

    it("月粒度の 403 でシーズン粒度をロックしない", async () => {
      mockGetEraTrend.mockResolvedValueOnce({ status: "pro_required" });
      mockGetEraTrend.mockResolvedValue({
        status: "ok",
        data: { granularity: "season", points: SEASON_POINTS },
      });

      await renderContainer({
        initialProFeatures: ["season_transition_graph"],
      });
      await clickFilter("年度: 2025");
      await clickGranularity("シーズン");

      expect(mockGetEraTrend).toHaveBeenLastCalledWith(
        expect.anything(),
        "season",
      );
      expect(await screen.findByText("2026春季")).toBeInTheDocument();
      expect(mockOpen).not.toHaveBeenCalled();
    });

    it("クライアントの Pro 判定を待つ間もシーズンを選べる", async () => {
      // Pro 状態のクライアント取得を宙吊りにし、SSR 済みの判定だけで操作させる。
      mockGetProStatus.mockReturnValue(new Promise(() => {}));

      await renderContainer({
        initialProFeatures: ["season_transition_graph"],
      });
      await clickGranularity("シーズン");

      expect(mockGetEraTrend).toHaveBeenCalledWith(expect.anything(), "season");
      expect(mockOpen).not.toHaveBeenCalled();
    });

    it("サーバーに 403 で拒否されたら月粒度へ戻し Paywall を出す", async () => {
      mockGetEraTrend.mockResolvedValueOnce({ status: "pro_required" });
      mockGetEraTrend.mockResolvedValue({
        status: "ok",
        data: { granularity: "month", points: MONTH_POINTS },
      });

      await renderContainer({
        initialProFeatures: ["season_transition_graph"],
      });
      await clickGranularity("シーズン");

      await waitFor(() => {
        expect(activeGranularityLabel()).toBe("月");
      });
      expect(mockOpen).toHaveBeenCalledWith({
        trigger: "season_transition_graph",
      });
      expect(mockGetEraTrend).toHaveBeenLastCalledWith(
        expect.anything(),
        "month",
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
      expect(mockGetEraTrend).not.toHaveBeenCalled();
      expect(activeGranularityLabel()).toBe("月");
      expect(screen.getByText("4月")).toBeInTheDocument();
    });

    it("Pro 判定が確定する前でもシーズン粒度の API を叩かない", async () => {
      mockGetProStatus.mockReturnValue(new Promise(() => {}));

      await renderContainer();
      await clickGranularity("シーズン");

      expect(mockGetEraTrend).not.toHaveBeenCalled();
      expect(mockOpen).toHaveBeenCalledWith({
        trigger: "season_transition_graph",
      });
    });
  });

  it("データが空でも粒度トグルは残す（選び直せなくならない）", async () => {
    mockGetProStatus.mockResolvedValue(makeProStatus());
    mockGetEraTrend.mockResolvedValue({
      status: "ok",
      data: { granularity: "season", points: [] },
    });

    await renderContainer({ initialProFeatures: ["season_transition_graph"] });
    await clickGranularity("シーズン");

    expect(await screen.findByText("対象データなし")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "月" })).toBeInTheDocument();
  });
});
