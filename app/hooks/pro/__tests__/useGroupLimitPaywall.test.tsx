/**
 * グループ無料枠上限の扱い（計測 + 理由の提示 + Pro 訴求）をまとめたフックの振る舞いテスト。
 * 3 経路がこのフックを共有するため、副作用の契約はここ 1 箇所で固定する。
 */
import { renderHook } from "@testing-library/react";
import { toast } from "sonner";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { useGroupLimitPaywall } from "@app/hooks/pro/useGroupLimitPaywall";
import { trackFreeLimitReached } from "@app/utils/analytics";
import { GROUP_FREE_LIMIT_MESSAGE } from "@app/utils/pro/groupLimit";

jest.mock("@app/contexts/proUpgradeModalContext", () => ({
  useProUpgradeModal: jest.fn(),
}));

jest.mock("@app/utils/analytics", () => ({
  trackFreeLimitReached: jest.fn(),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn() },
}));

const mockOpen = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (useProUpgradeModal as jest.Mock).mockReturnValue({
    open: mockOpen,
    close: jest.fn(),
  });
});

describe("useGroupLimitPaywall", () => {
  it("計測・エラー文言の提示・Pro 訴求の 3 つを行う", () => {
    const { result } = renderHook(() => useGroupLimitPaywall("group_create"));

    result.current();

    expect(trackFreeLimitReached).toHaveBeenCalledWith("unlimited_groups", {
      source: "group_create",
      detection: "server",
    });
    expect(toast.error).toHaveBeenCalledWith(GROUP_FREE_LIMIT_MESSAGE);
    expect(mockOpen).toHaveBeenCalledWith({ trigger: "unlimited_groups" });
  });

  it("呼び出し元の導線を source としてそのまま送る", () => {
    const { result } = renderHook(() =>
      useGroupLimitPaywall("group_join_link"),
    );

    result.current();

    expect(trackFreeLimitReached).toHaveBeenCalledWith(
      "unlimited_groups",
      expect.objectContaining({ source: "group_join_link" }),
    );
  });

  // Web は事前ゲートを持たずサーバーの 403 でのみ上限を知るため、detection は固定値。
  it("detection は常に server を送る", () => {
    const { result } = renderHook(() =>
      useGroupLimitPaywall("group_invitation"),
    );

    result.current();

    expect(trackFreeLimitReached).toHaveBeenCalledWith(
      "unlimited_groups",
      expect.objectContaining({ detection: "server" }),
    );
  });
});
