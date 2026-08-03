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

import type { FetchResult } from "@app/services/v2/requests";
import type { ShadowSwingStats } from "@app/types/shadowSwing";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  BACKGROUND_WEB_NOTICE,
  INTERVAL_PENDING_HINT,
  STATS_ERROR_MESSAGE,
  VIBRATION_LOCKED_HINT,
  VIBRATION_UNSUPPORTED_HINT,
  WAKE_LOCK_UNSUPPORTED_NOTICE,
} from "../_components/shadowSwingCopy";
import ShadowSwingSetup from "../_components/ShadowSwingSetup";

const mockUseEntitlement = useEntitlement as jest.MockedFunction<
  typeof useEntitlement
>;

const OK_STATS: FetchResult<ShadowSwingStats> = {
  status: "ok",
  data: { today_count: 0, month_count: 0, total_count: 0 },
};

function mockEntitlement({
  granted = false,
  isLoading = false,
}: { granted?: boolean; isLoading?: boolean } = {}) {
  mockUseEntitlement.mockReturnValue({
    isPro: granted,
    inTrial: false,
    inGracePeriod: false,
    isLoading,
    hasEntitlement: jest.fn(() => granted),
  });
}

function renderSetup({
  statsResult = OK_STATS,
  isVibrationSupported = true,
  isWakeLockSupported = true,
}: {
  statsResult?: FetchResult<ShadowSwingStats>;
  isVibrationSupported?: boolean;
  isWakeLockSupported?: boolean;
} = {}) {
  const onStart = jest.fn();
  render(
    <ShadowSwingSetup
      statsResult={statsResult}
      isStarting={false}
      startError={null}
      onStart={onStart}
      isVibrationSupported={isVibrationSupported}
      isWakeLockSupported={isWakeLockSupported}
    />,
  );
  return { onStart, user: userEvent.setup() };
}

const intervalGroup = () => screen.getByRole("group", { name: "インターバル" });

beforeEach(() => {
  jest.clearAllMocks();
  mockEntitlement();
});

describe("インターバルの制限", () => {
  it("無料ユーザーは5〜10秒の外を選べず、Pro 訴求が開く", async () => {
    const { onStart, user } = renderSetup();

    await user.click(
      within(intervalGroup()).getByRole("button", { name: "1.0秒" }),
    );

    expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
      trigger: "shadow_swing_custom_interval",
    });
    // 選択は既定値（5秒）のまま変わらない。
    expect(
      within(intervalGroup()).getByRole("button", { name: "5.0秒" }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "開始する" }));
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ intervalSeconds: 5 }),
    );
  });

  it("無料ユーザーは10秒より長いインターバルも選べない", async () => {
    const { onStart, user } = renderSetup();

    await user.click(
      within(intervalGroup()).getByRole("button", { name: "20.0秒" }),
    );
    await user.click(screen.getByRole("button", { name: "開始する" }));

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ intervalSeconds: 5 }),
    );
  });

  it("無料ユーザーでも境界の10秒は選べる", async () => {
    const { onStart, user } = renderSetup();

    await user.click(
      within(intervalGroup()).getByRole("button", { name: "10.0秒" }),
    );
    await user.click(screen.getByRole("button", { name: "開始する" }));

    expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ intervalSeconds: 10 }),
    );
  });

  it("Pro ユーザーは1.0〜20秒を選べる", async () => {
    mockEntitlement({ granted: true });
    const { onStart, user } = renderSetup();

    await user.click(
      within(intervalGroup()).getByRole("button", { name: "1.0秒" }),
    );
    await user.click(screen.getByRole("button", { name: "開始する" }));

    expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ intervalSeconds: 1 }),
    );
  });

  it("Pro 判定が未確定の間は Pro 前提の値を選べない", async () => {
    mockEntitlement({ granted: true, isLoading: true });
    const { onStart, user } = renderSetup();

    expect(screen.getByText(INTERVAL_PENDING_HINT)).toBeInTheDocument();

    await user.click(
      within(intervalGroup()).getByRole("button", { name: "1.5秒" }),
    );
    await user.click(screen.getByRole("button", { name: "開始する" }));

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ intervalSeconds: 5 }),
    );
  });
});

describe("笛の音とカウント読み上げ", () => {
  it("既定は笛の音のみ有効", () => {
    renderSetup();

    const whistle = screen.getByRole("group", { name: "笛の音" });
    const speech = screen.getByRole("group", { name: "カウント読み上げ" });
    expect(
      within(whistle).getByRole("button", { name: "あり" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(speech).getByRole("button", { name: "なし" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("読み上げを有効にすると笛が無効になる（排他）", async () => {
    const { onStart, user } = renderSetup();

    await user.click(
      within(screen.getByRole("group", { name: "カウント読み上げ" })).getByRole(
        "button",
        { name: "あり" },
      ),
    );

    expect(
      within(screen.getByRole("group", { name: "笛の音" })).getByRole(
        "button",
        {
          name: "なし",
        },
      ),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "開始する" }));
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ cue: { whistle: false, speech: true } }),
    );
  });

  it("笛を有効に戻すと読み上げが無効になる（排他）", async () => {
    const { onStart, user } = renderSetup();

    await user.click(
      within(screen.getByRole("group", { name: "カウント読み上げ" })).getByRole(
        "button",
        { name: "あり" },
      ),
    );
    await user.click(
      within(screen.getByRole("group", { name: "笛の音" })).getByRole(
        "button",
        {
          name: "あり",
        },
      ),
    );

    await user.click(screen.getByRole("button", { name: "開始する" }));
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ cue: { whistle: true, speech: false } }),
    );
  });
});

describe("バイブレーション", () => {
  const vibrationGroup = () =>
    screen.getByRole("group", { name: "バイブレーション" });

  it("navigator.vibrate 非対応の環境では有効にできず、理由を表示する", async () => {
    mockEntitlement({ granted: true });
    const { onStart, user } = renderSetup({ isVibrationSupported: false });

    expect(screen.getByText(VIBRATION_UNSUPPORTED_HINT)).toBeInTheDocument();

    await user.click(
      within(vibrationGroup()).getByRole("button", { name: "あり" }),
    );

    expect(
      within(vibrationGroup()).getByRole("button", { name: "なし" }),
    ).toHaveAttribute("aria-pressed", "true");
    // 端末側の制約なので Pro 訴求は出さない。
    expect(mockOpenProUpgradeModal).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "開始する" }));
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ vibration: false }),
    );
  });

  it("対応環境の無料ユーザーは有効にできず Pro 訴求が開く", async () => {
    const { onStart, user } = renderSetup({ isVibrationSupported: true });

    expect(screen.getByText(VIBRATION_LOCKED_HINT)).toBeInTheDocument();

    await user.click(
      within(vibrationGroup()).getByRole("button", { name: "あり" }),
    );

    expect(mockOpenProUpgradeModal).toHaveBeenCalledWith({
      trigger: "shadow_swing_vibration",
    });

    await user.click(screen.getByRole("button", { name: "開始する" }));
    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ vibration: false }),
    );
  });

  it("対応環境の Pro ユーザーは有効にできる", async () => {
    mockEntitlement({ granted: true });
    const { onStart, user } = renderSetup({ isVibrationSupported: true });

    await user.click(
      within(vibrationGroup()).getByRole("button", { name: "あり" }),
    );
    await user.click(screen.getByRole("button", { name: "開始する" }));

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ vibration: true }),
    );
  });

  it("Pro 判定が未確定の間は有効にできない", async () => {
    mockEntitlement({ granted: true, isLoading: true });
    const { onStart, user } = renderSetup({ isVibrationSupported: true });

    await user.click(
      within(vibrationGroup()).getByRole("button", { name: "あり" }),
    );
    await user.click(screen.getByRole("button", { name: "開始する" }));

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ vibration: false }),
    );
  });
});

describe("バックグラウンド継続実行（Web 非提供）", () => {
  it("トグルを出さず、アプリ版のみの機能であることを明示する", () => {
    mockEntitlement({ granted: true });
    renderSetup();

    expect(screen.getByText(BACKGROUND_WEB_NOTICE)).toBeInTheDocument();
    expect(BACKGROUND_WEB_NOTICE).toContain("アプリ版のみ");

    // 設定できる項目はインターバル・笛の音・読み上げ・バイブレーションの4つだけ。
    expect(screen.getAllByRole("group")).toHaveLength(4);
    expect(
      screen.queryByRole("group", { name: /バックグラウンド/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /バックグラウンド/ }),
    ).not.toBeInTheDocument();
  });
});

describe("Screen Wake Lock", () => {
  it("非対応環境では画面が消えることを注意書きする", () => {
    renderSetup({ isWakeLockSupported: false });
    expect(screen.getByText(WAKE_LOCK_UNSUPPORTED_NOTICE)).toBeInTheDocument();
  });

  it("対応環境では注意書きを出さない", () => {
    renderSetup({ isWakeLockSupported: true });
    expect(
      screen.queryByText(WAKE_LOCK_UNSUPPORTED_NOTICE),
    ).not.toBeInTheDocument();
  });
});

describe("目標本数", () => {
  it("空欄では開始しない", async () => {
    const { onStart, user } = renderSetup();

    await user.clear(screen.getByLabelText("目標本数"));
    await user.click(screen.getByRole("button", { name: "開始する" }));

    expect(onStart).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "目標本数を入力してください",
    );
  });

  it("入力した本数で開始する", async () => {
    const { onStart, user } = renderSetup();

    const input = screen.getByLabelText("目標本数");
    await user.clear(input);
    await user.type(input, "50");
    await user.click(screen.getByRole("button", { name: "開始する" }));

    expect(onStart).toHaveBeenCalledWith(
      expect.objectContaining({ targetCount: 50 }),
    );
  });
});

describe("積み上げ本数", () => {
  it("0件は0本として表示する", () => {
    renderSetup({ statsResult: OK_STATS });

    expect(screen.getByText("通算").nextSibling).toHaveTextContent("0本");
    expect(screen.queryByText(STATS_ERROR_MESSAGE)).not.toBeInTheDocument();
  });

  it("取得失敗は0本と区別して表示する", () => {
    renderSetup({ statsResult: { status: "error" } });

    expect(screen.getByText(STATS_ERROR_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText("通算")).not.toBeInTheDocument();
  });
});
