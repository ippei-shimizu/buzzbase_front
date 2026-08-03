const mockOpenProUpgradeModal = jest.fn();

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: () => ({
    open: mockOpenProUpgradeModal,
    close: jest.fn(),
  }),
}));

jest.mock("@app/hooks/pro/useEntitlement", () => ({
  useEntitlement: jest.fn(),
}));

jest.mock("@app/services/v2/shadowSwingService", () => ({
  startShadowSwingSession: jest.fn(),
  completeShadowSwingSession: jest.fn(),
  getShadowSwingStats: jest.fn(),
}));

import type { FetchResult } from "@app/services/v2/requests";
import type { ShadowSwingStats } from "@app/types/shadowSwing";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  completeShadowSwingSession,
  getShadowSwingStats,
  startShadowSwingSession,
} from "@app/services/v2/shadowSwingService";
import ShadowSwingContent from "../_components/ShadowSwingContent";
import {
  AUTO_PAUSED_BY_HIDDEN,
  NO_SWING_MESSAGE,
  SAVE_FAILED_TITLE,
  SAVED_MESSAGE,
  STATS_ERROR_MESSAGE,
  VIBRATION_UNSUPPORTED_HINT,
} from "../_components/shadowSwingCopy";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
>;
const mockStart = startShadowSwingSession as jest.MockedFunction<
  typeof startShadowSwingSession
>;
const mockComplete = completeShadowSwingSession as jest.MockedFunction<
  typeof completeShadowSwingSession
>;
const mockGetStats = getShadowSwingStats as jest.MockedFunction<
  typeof getShadowSwingStats
>;

const SESSION_ID = 77;

/* --- ブラウザ API のモック（jsdom には Web Audio / SpeechSynthesis / vibrate が無い） --- */

const startedOscillators: { start: jest.Mock; stop: jest.Mock }[] = [];
const resume = jest.fn();
const speak = jest.fn();
const cancel = jest.fn();
const vibrate = jest.fn(() => true);

class MockAudioContext {
  state = "suspended";
  currentTime = 0;
  destination = {};

  resume = async () => {
    this.state = "running";
    resume();
  };

  close = async () => {};

  createOscillator = () => {
    const oscillator = {
      type: "sine",
      frequency: { setValueAtTime: jest.fn() },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
    };
    startedOscillators.push(oscillator);
    return oscillator;
  };

  createGain = () => ({
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
    },
    connect: jest.fn(),
  });
}

class MockUtterance {
  lang = "";
  volume = 1;
  constructor(public text: string) {}
}

function installBrowserApis({
  vibration = true,
}: { vibration?: boolean } = {}) {
  (window as unknown as Record<string, unknown>).AudioContext =
    MockAudioContext;
  (window as unknown as Record<string, unknown>).SpeechSynthesisUtterance =
    MockUtterance;
  Object.defineProperty(window, "speechSynthesis", {
    value: { speak, cancel },
    configurable: true,
    writable: true,
  });
  Object.defineProperty(navigator, "wakeLock", {
    value: {
      request: jest.fn().mockResolvedValue({
        released: false,
        release: jest.fn().mockResolvedValue(undefined),
      }),
    },
    configurable: true,
    writable: true,
  });
  if (vibration) {
    Object.defineProperty(navigator, "vibrate", {
      value: vibrate,
      configurable: true,
      writable: true,
    });
  }
}

function removeBrowserApis() {
  delete (window as unknown as Record<string, unknown>).AudioContext;
  delete (window as unknown as Record<string, unknown>)
    .SpeechSynthesisUtterance;
  Reflect.deleteProperty(window, "speechSynthesis");
  Reflect.deleteProperty(navigator, "vibrate");
  Reflect.deleteProperty(navigator, "wakeLock");
}

function setVisibility(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", {
    value: state,
    configurable: true,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

/* --- ヘルパー --- */

const okStats = (
  stats: Partial<ShadowSwingStats> = {},
): FetchResult<ShadowSwingStats> => ({
  status: "ok",
  data: { today_count: 0, month_count: 0, total_count: 0, ...stats },
});

function mockEntitlement({ granted = false } = {}) {
  mockUseEntitlement.mockReturnValue({
    isPro: granted,
    inTrial: false,
    inGracePeriod: false,
    isLoading: false,
    hasEntitlement: jest.fn(() => granted),
  });
}

function setupUser() {
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
}

/** 設定画面で設定を入れて開始し、カウント画面が出るまで待つ。 */
async function startCounting(
  user: ReturnType<typeof setupUser>,
  { target = 10, speech = false, vibration = false } = {},
) {
  const input = screen.getByLabelText("目標本数");
  await user.clear(input);
  await user.type(input, String(target));

  if (speech) {
    await user.click(
      within(screen.getByRole("group", { name: "カウント読み上げ" })).getByRole(
        "button",
        { name: "あり" },
      ),
    );
  }
  if (vibration) {
    await user.click(
      within(screen.getByRole("group", { name: "バイブレーション" })).getByRole(
        "button",
        { name: "あり" },
      ),
    );
  }

  await user.click(screen.getByRole("button", { name: "開始する" }));
  await screen.findByRole("progressbar");
}

/** 実時間を進めて requestAnimationFrame のループを回す。 */
async function advance(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

const swingCount = (target: number, count: number) =>
  screen.getByRole("img", { name: `${target}本中${count}本` });

/** 実際に読み上げた本数。解禁用の無音発話（空文字）は除く。 */
const spokenCounts = (): string[] =>
  speak.mock.calls
    .map((call) => (call[0] as MockUtterance).text)
    .filter((text) => text !== "");

beforeEach(() => {
  jest.clearAllMocks();
  startedOscillators.length = 0;
  jest.useFakeTimers();
  installBrowserApis();
  setVisibility("visible");
  mockEntitlement();
  mockStart.mockResolvedValue({
    ok: true,
    data: {
      id: SESSION_ID,
      logged_on: "2026-08-03",
      target_count: 10,
      swing_count: 0,
      completed_at: null,
      practice_log_id: null,
    },
  });
  mockComplete.mockResolvedValue({
    ok: true,
    data: {
      id: SESSION_ID,
      logged_on: "2026-08-03",
      target_count: 10,
      swing_count: 10,
      completed_at: "2026-08-03T10:00:00+09:00",
      practice_log_id: 3,
    },
  });
  mockGetStats.mockResolvedValue(
    okStats({ today_count: 10, month_count: 10, total_count: 10 }),
  );
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
  removeBrowserApis();
});

describe("カウントの進み方", () => {
  it("インターバルごとに1本ずつ増える", async () => {
    const user = setupUser();
    render(<ShadowSwingContent initialStatsResult={okStats()} />);

    await startCounting(user, { target: 10 });
    expect(swingCount(10, 0)).toBeInTheDocument();

    // 既定インターバルは5秒。境界の直前では増えない。
    await advance(4900);
    expect(swingCount(10, 0)).toBeInTheDocument();

    await advance(200);
    expect(swingCount(10, 1)).toBeInTheDocument();

    await advance(10_100);
    expect(swingCount(10, 3)).toBeInTheDocument();
  });

  it("一時停止中は時間が進んでも増えず、再開すると続きから増える", async () => {
    const user = setupUser();
    render(<ShadowSwingContent initialStatsResult={okStats()} />);

    await startCounting(user, { target: 10 });
    await advance(12_100);
    expect(swingCount(10, 2)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "一時停止" }));
    await advance(60_000);
    expect(swingCount(10, 2)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "再開" }));
    // 停止前に 2 秒ぶん進んでいるので、3 秒で 3 本目になる。
    await advance(3000);
    expect(swingCount(10, 3)).toBeInTheDocument();
  });

  it("タブが隠れたら自動で一時停止し、戻ってもカウントが飛ばない", async () => {
    const user = setupUser();
    render(<ShadowSwingContent initialStatsResult={okStats()} />);

    await startCounting(user, { target: 10 });
    await advance(12_100);

    await act(async () => {
      setVisibility("hidden");
    });
    expect(screen.getByText(AUTO_PAUSED_BY_HIDDEN)).toBeInTheDocument();

    // 裏で 10 分経ってもカウントは進まない（本来なら 120 本ぶんの時間）。
    await advance(600_000);
    await act(async () => {
      setVisibility("visible");
    });
    expect(swingCount(10, 2)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "再開" }));
    await advance(3000);
    expect(swingCount(10, 3)).toBeInTheDocument();
  });
});

describe("合図", () => {
  it("開始ボタンの押下で AudioContext を解禁する", async () => {
    const user = setupUser();
    render(<ShadowSwingContent initialStatsResult={okStats()} />);

    await startCounting(user, { target: 10 });

    expect(resume).toHaveBeenCalled();
  });

  it("笛を選ぶと1本ごとに鳴り、読み上げはしない", async () => {
    const user = setupUser();
    render(<ShadowSwingContent initialStatsResult={okStats()} />);

    await startCounting(user, { target: 10 });
    await advance(15_100);

    expect(startedOscillators).toHaveLength(3);
    expect(spokenCounts()).toEqual([]);
  });

  it("読み上げを選ぶと本数を読み上げ、笛は鳴らない（排他）", async () => {
    const user = setupUser();
    render(<ShadowSwingContent initialStatsResult={okStats()} />);

    await startCounting(user, { target: 10, speech: true });
    await advance(15_100);

    expect(startedOscillators).toHaveLength(0);
    expect(spokenCounts()).toEqual(["1", "2", "3"]);
  });

  it("バイブレーションを選んだ Pro ユーザーは1本ごとに振動する", async () => {
    mockEntitlement({ granted: true });
    const user = setupUser();
    render(<ShadowSwingContent initialStatsResult={okStats()} />);

    await startCounting(user, { target: 10, vibration: true });
    await advance(15_100);

    expect(vibrate).toHaveBeenCalledTimes(3);
    expect(vibrate).toHaveBeenCalledWith(40);
  });

  it("navigator.vibrate 非対応の環境では有効化できず振動もしない", async () => {
    mockEntitlement({ granted: true });
    removeBrowserApis();
    installBrowserApis({ vibration: false });
    const user = setupUser();
    render(<ShadowSwingContent initialStatsResult={okStats()} />);

    // 設定画面では非対応の理由を出し、「あり」を押しても有効にならない。
    expect(screen.getByText(VIBRATION_UNSUPPORTED_HINT)).toBeInTheDocument();
    expect(
      within(screen.getByRole("group", { name: "バイブレーション" })).getByRole(
        "button",
        { name: "なし" },
      ),
    ).toHaveAttribute("aria-pressed", "true");

    await startCounting(user, { target: 10, vibration: true });
    await advance(15_100);

    expect(vibrate).not.toHaveBeenCalled();
  });
});

describe("完了と保存", () => {
  it("目標到達で自動的に完了し、本数を保存して統計を更新する", async () => {
    const user = setupUser();
    render(<ShadowSwingContent initialStatsResult={okStats()} />);

    await startCounting(user, { target: 3 });
    await advance(15_100);

    expect(mockComplete).toHaveBeenCalledWith(SESSION_ID, 3);
    expect(screen.getByText("3本 達成！")).toBeInTheDocument();
    expect(await screen.findByText(SAVED_MESSAGE)).toBeInTheDocument();
    expect(mockGetStats).toHaveBeenCalled();
    expect(screen.getByText("通算").nextSibling).toHaveTextContent("10本");
  });

  it("目標より手前で終了しても、その時点の本数を保存する", async () => {
    const user = setupUser();
    render(<ShadowSwingContent initialStatsResult={okStats()} />);

    await startCounting(user, { target: 10 });
    await advance(12_100);
    await user.click(screen.getByRole("button", { name: "終了する" }));

    expect(mockComplete).toHaveBeenCalledWith(SESSION_ID, 2);
    expect(screen.getByText("2本 達成！")).toBeInTheDocument();
  });

  it("保存に失敗してもカウント結果を失わず、再試行で保存できる", async () => {
    mockComplete.mockResolvedValueOnce({
      ok: false,
      reason: "error",
      errors: ["ネットワークエラー"],
    });
    const user = setupUser();
    render(<ShadowSwingContent initialStatsResult={okStats()} />);

    await startCounting(user, { target: 3 });
    await advance(15_100);

    expect(screen.getByText("3本 達成！")).toBeInTheDocument();
    expect(await screen.findByText(SAVE_FAILED_TITLE)).toBeInTheDocument();
    expect(screen.getByText("ネットワークエラー")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "再試行" }));

    expect(await screen.findByText(SAVED_MESSAGE)).toBeInTheDocument();
    expect(mockComplete).toHaveBeenCalledTimes(2);
    expect(mockComplete).toHaveBeenLastCalledWith(SESSION_ID, 3);
    expect(screen.getByText("3本 達成！")).toBeInTheDocument();
  });

  it("1本もカウントせずに終了したら保存しない（0本の練習ログを作らない）", async () => {
    const user = setupUser();
    render(<ShadowSwingContent initialStatsResult={okStats()} />);

    await startCounting(user, { target: 10 });
    await user.click(screen.getByRole("button", { name: "終了する" }));

    expect(mockComplete).not.toHaveBeenCalled();
    expect(screen.getByText(NO_SWING_MESSAGE)).toBeInTheDocument();
  });

  it("完了後の統計取得に失敗したら、0本ではなく取得失敗として表示する", async () => {
    mockGetStats.mockResolvedValue({ status: "error" });
    const user = setupUser();
    render(<ShadowSwingContent initialStatsResult={okStats()} />);

    await startCounting(user, { target: 3 });
    await advance(15_100);

    expect(await screen.findByText(STATS_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText("通算")).not.toBeInTheDocument();
  });
});

describe("開始の失敗", () => {
  it("セッションを作れなかったらカウント画面へ進まない", async () => {
    mockStart.mockResolvedValue({
      ok: false,
      reason: "error",
      errors: ["素振りを開始できませんでした"],
    });
    const user = setupUser();
    render(<ShadowSwingContent initialStatsResult={okStats()} />);

    const input = screen.getByLabelText("目標本数");
    await user.clear(input);
    await user.type(input, "10");
    await user.click(screen.getByRole("button", { name: "開始する" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "素振りを開始できませんでした",
    );
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "開始する" }),
    ).toBeInTheDocument();
  });
});

describe("完了画面からのやり直し", () => {
  it("もう一度で設定画面に戻れる", async () => {
    const user = setupUser();
    render(<ShadowSwingContent initialStatsResult={okStats()} />);

    await startCounting(user, { target: 3 });
    await advance(15_100);
    await screen.findByText(SAVED_MESSAGE);

    await user.click(screen.getByRole("button", { name: "もう一度" }));

    expect(screen.getByLabelText("目標本数")).toBeInTheDocument();
  });
});
