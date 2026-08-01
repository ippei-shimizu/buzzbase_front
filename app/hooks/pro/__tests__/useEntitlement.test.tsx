import { act, renderHook, type RenderHookResult } from "@testing-library/react";
import { type ReactNode } from "react";
import { getProStatus } from "@app/(app)/pro/actions";
import { ProStatusProvider } from "@app/components/pro/ProStatusProvider";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { DEFAULT_PRO_STATUS, type ProStatus } from "@app/types/pro";

jest.mock("@app/(app)/pro/actions", () => ({
  getProStatus: jest.fn(),
}));

const mockGetProStatus = getProStatus as jest.MockedFunction<
  typeof getProStatus
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

function makeProActiveStatus(): ProStatus {
  return {
    subscription: {
      status: "active",
      plan_type: "monthly",
      platform: "ios",
      started_at: "2026-04-01T00:00:00+09:00",
      expires_at: "2026-06-01T00:00:00+09:00",
      pro_active: true,
      in_trial: false,
      in_grace_period: false,
      days_remaining: 14,
      is_early_subscriber: false,
      has_used_trial: true,
    },
    entitlements: [
      ...DEFAULT_PRO_STATUS.entitlements,
      "no_ads",
      "season_transition_graph",
      "unlimited_practice_menus",
    ],
  };
}

const Wrapper = ({ children }: { children: ReactNode }) => (
  <ProStatusProvider>{children}</ProStatusProvider>
);
Wrapper.displayName = "TestProStatusWrapper";

// Pro 状態はマウント後に Server Action で解決されるため、非同期 act で確定まで進める
async function renderEntitlement(proStatus: ProStatus | null) {
  if (proStatus) {
    setAuthCookies();
    mockGetProStatus.mockResolvedValue(proStatus);
  }

  let rendered!: RenderHookResult<ReturnType<typeof useEntitlement>, unknown>;
  await act(async () => {
    rendered = renderHook(() => useEntitlement(), { wrapper: Wrapper });
  });

  expect(rendered.result.current.isLoading).toBe(false);

  return rendered.result;
}

describe("useEntitlement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAuthCookies();
  });

  describe("Provider が無い場合", () => {
    it("無料機能には true、Pro 機能には false を返す", () => {
      const { result } = renderHook(() => useEntitlement());

      expect(result.current.hasEntitlement("basic_game_record")).toBe(true);
      expect(result.current.hasEntitlement("season_transition_graph")).toBe(
        false,
      );
      expect(result.current.isPro).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("Pro 状態が未解決の場合", () => {
    it("isLoading: true のまま無料状態を返す", async () => {
      setAuthCookies();
      mockGetProStatus.mockReturnValue(new Promise(() => {}));

      let rendered!: RenderHookResult<
        ReturnType<typeof useEntitlement>,
        unknown
      >;
      await act(async () => {
        rendered = renderHook(() => useEntitlement(), { wrapper: Wrapper });
      });

      expect(rendered.result.current.isLoading).toBe(true);
      expect(rendered.result.current.isPro).toBe(false);
    });
  });

  describe("認証 cookie が揃っていない場合", () => {
    it("Server Action を呼ばずに無料状態で確定する", async () => {
      document.cookie = "uid=user@example.com";

      let rendered!: RenderHookResult<
        ReturnType<typeof useEntitlement>,
        unknown
      >;
      await act(async () => {
        rendered = renderHook(() => useEntitlement(), { wrapper: Wrapper });
      });

      expect(mockGetProStatus).not.toHaveBeenCalled();
      expect(rendered.result.current.isLoading).toBe(false);
      expect(rendered.result.current.isPro).toBe(false);
    });
  });

  describe("無料ユーザー (status: free)", () => {
    it("無料機能には true、Pro 機能には false を返す", async () => {
      const result = await renderEntitlement(null);

      expect(result.current.hasEntitlement("basic_game_record")).toBe(true);
      expect(result.current.hasEntitlement("calculation_tools")).toBe(true);
      expect(result.current.hasEntitlement("no_ads")).toBe(false);
      expect(result.current.hasEntitlement("unlimited_practice_menus")).toBe(
        false,
      );
      expect(result.current.isPro).toBe(false);
    });
  });

  describe("Pro ユーザー (status: active)", () => {
    const proStatus = makeProActiveStatus();

    it("無料機能・Pro 機能のいずれも true を返す", async () => {
      const result = await renderEntitlement(proStatus);

      expect(result.current.hasEntitlement("basic_game_record")).toBe(true);
      expect(result.current.hasEntitlement("no_ads")).toBe(true);
      expect(result.current.hasEntitlement("season_transition_graph")).toBe(
        true,
      );
      expect(result.current.hasEntitlement("unlimited_practice_menus")).toBe(
        true,
      );
      expect(result.current.isPro).toBe(true);
    });

    it("entitlements に含まれない Pro 機能には false を返す", async () => {
      const result = await renderEntitlement(proStatus);

      // proStatus.entitlements には 'detailed_condition_log' が含まれていない
      expect(result.current.hasEntitlement("detailed_condition_log")).toBe(
        false,
      );
    });
  });

  describe("トライアル中ユーザー", () => {
    it("inTrial: true、isPro: true を返す", async () => {
      const trialStatus: ProStatus = {
        subscription: {
          ...DEFAULT_PRO_STATUS.subscription,
          status: "trial",
          pro_active: true,
          in_trial: true,
          expires_at: "2026-06-01T00:00:00+09:00",
          days_remaining: 7,
        },
        entitlements: [...DEFAULT_PRO_STATUS.entitlements, "no_ads"],
      };

      const result = await renderEntitlement(trialStatus);

      expect(result.current.isPro).toBe(true);
      expect(result.current.inTrial).toBe(true);
      expect(result.current.inGracePeriod).toBe(false);
    });
  });

  describe("グレースピリオド中ユーザー (cancelled)", () => {
    it("inGracePeriod: true、isPro: true を返す", async () => {
      const cancelledStatus: ProStatus = {
        subscription: {
          ...DEFAULT_PRO_STATUS.subscription,
          status: "cancelled",
          pro_active: true,
          in_grace_period: true,
          expires_at: "2026-06-01T00:00:00+09:00",
          days_remaining: 5,
        },
        entitlements: [...DEFAULT_PRO_STATUS.entitlements, "no_ads"],
      };

      const result = await renderEntitlement(cancelledStatus);

      expect(result.current.isPro).toBe(true);
      expect(result.current.inGracePeriod).toBe(true);
    });
  });
});
