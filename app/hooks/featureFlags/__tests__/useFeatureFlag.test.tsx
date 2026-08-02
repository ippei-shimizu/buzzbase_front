const mockGetFeatureFlagDecisions = jest.fn();

jest.mock("@app/featureFlags/actions", () => ({
  getFeatureFlagDecisions: (keys: string[]) =>
    mockGetFeatureFlagDecisions(keys),
}));

import { act, renderHook, type RenderHookResult } from "@testing-library/react";
import { type FeatureFlagDecision } from "@app/types/featureFlags";
import { useFeatureFlag } from "../useFeatureFlag";

function setAuthCookies(uid: string) {
  document.cookie = "access-token=test-access-token";
  document.cookie = "client=test-client";
  document.cookie = `uid=${encodeURIComponent(uid)}`;
}

function clearAuthCookies() {
  for (const name of ["access-token", "client", "uid"]) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

// flag はマウント後に Server Action で解決されるため、非同期 act で確定まで進める
async function renderFlag(options?: { skip?: boolean }) {
  let rendered!: RenderHookResult<FeatureFlagDecision, void>;
  await act(async () => {
    rendered = renderHook(() => useFeatureFlag("pro_features", options));
  });

  return rendered;
}

describe("useFeatureFlag", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthCookies();
  });

  it("有効と確定したら enabled を返す", async () => {
    setAuthCookies("user@example.com");
    mockGetFeatureFlagDecisions.mockResolvedValue({ pro_features: "enabled" });

    const { result } = await renderFlag();

    expect(result.current).toBe("enabled");
    expect(mockGetFeatureFlagDecisions).toHaveBeenCalledWith(["pro_features"]);
  });

  it("無効と確定したら disabled を返す", async () => {
    setAuthCookies("user@example.com");
    mockGetFeatureFlagDecisions.mockResolvedValue({ pro_features: "disabled" });

    const { result } = await renderFlag();

    expect(result.current).toBe("disabled");
  });

  it("サーバー側で判定できなかったときは disabled と断定しない", async () => {
    setAuthCookies("user@example.com");
    mockGetFeatureFlagDecisions.mockResolvedValue({
      pro_features: "indeterminate",
    });

    const { result } = await renderFlag();

    expect(result.current).toBe("indeterminate");
  });

  it("未認証では問い合わせず indeterminate のままにする", async () => {
    const { result } = await renderFlag();

    expect(result.current).toBe("indeterminate");
    expect(mockGetFeatureFlagDecisions).not.toHaveBeenCalled();
  });

  it("3点セットが揃わない cookie は未認証として扱う", async () => {
    document.cookie = "uid=user@example.com";

    const { result } = await renderFlag();

    expect(result.current).toBe("indeterminate");
    expect(mockGetFeatureFlagDecisions).not.toHaveBeenCalled();
  });

  it("確定するまでは indeterminate", async () => {
    setAuthCookies("user@example.com");
    mockGetFeatureFlagDecisions.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useFeatureFlag("pro_features"));

    expect(result.current).toBe("indeterminate");
  });

  it("取得に失敗しても disabled と断定しない", async () => {
    setAuthCookies("user@example.com");
    mockGetFeatureFlagDecisions.mockRejectedValue(new Error("network"));

    const { result } = await renderFlag();

    expect(result.current).toBe("indeterminate");
  });

  it("skip の間は問い合わせない", async () => {
    setAuthCookies("user@example.com");
    mockGetFeatureFlagDecisions.mockResolvedValue({ pro_features: "disabled" });

    const { result } = await renderFlag({ skip: true });

    expect(result.current).toBe("indeterminate");
    expect(mockGetFeatureFlagDecisions).not.toHaveBeenCalled();
  });

  it("skip が解除されたら評価する", async () => {
    setAuthCookies("user@example.com");
    mockGetFeatureFlagDecisions.mockResolvedValue({ pro_features: "disabled" });

    const { result, rerender } = renderHook(
      ({ skip }: { skip: boolean }) => useFeatureFlag("pro_features", { skip }),
      { initialProps: { skip: true } },
    );
    expect(mockGetFeatureFlagDecisions).not.toHaveBeenCalled();

    await act(async () => {
      rerender({ skip: false });
    });

    expect(result.current).toBe("disabled");
  });

  it("ユーザー切替直後は前ユーザーの判定を持ち越さない", async () => {
    setAuthCookies("flag-on@example.com");
    mockGetFeatureFlagDecisions.mockResolvedValue({ pro_features: "enabled" });

    const { result, rerender } = await renderFlag();
    expect(result.current).toBe("enabled");

    setAuthCookies("another@example.com");
    mockGetFeatureFlagDecisions.mockReturnValue(new Promise(() => {}));
    await act(async () => {
      rerender();
    });

    expect(result.current).toBe("indeterminate");
  });

  it("別ユーザーでログインし直すとその判定に切り替わる", async () => {
    setAuthCookies("flag-off@example.com");
    mockGetFeatureFlagDecisions.mockResolvedValue({ pro_features: "disabled" });

    const { result, rerender } = await renderFlag();
    expect(result.current).toBe("disabled");

    setAuthCookies("flag-on@example.com");
    mockGetFeatureFlagDecisions.mockResolvedValue({ pro_features: "enabled" });
    await act(async () => {
      rerender();
    });

    expect(result.current).toBe("enabled");
  });
});
