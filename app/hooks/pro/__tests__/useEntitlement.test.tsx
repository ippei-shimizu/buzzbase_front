import { renderHook } from "@testing-library/react";
import { type ReactNode } from "react";
import { ProStatusProvider } from "@app/components/pro/ProStatusProvider";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { DEFAULT_PRO_STATUS, type ProStatus } from "@app/types/pro";

// Server Action はテストでは呼ばれないが、モジュール解決のためにモック
jest.mock("@app/(app)/pro/actions", () => ({
  getProStatus: jest.fn(),
}));

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

function wrapperWith(initialValue: ProStatus | null) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <ProStatusProvider initialValue={initialValue}>
      {children}
    </ProStatusProvider>
  );
  Wrapper.displayName = "TestProStatusWrapper";
  return Wrapper;
}

describe("useEntitlement", () => {
  describe("Provider が無い場合", () => {
    it("無料機能には true、Pro 機能には false を返す", () => {
      const { result } = renderHook(() => useEntitlement());

      expect(result.current.hasEntitlement("basic_game_record")).toBe(true);
      expect(result.current.hasEntitlement("season_transition_graph")).toBe(
        false,
      );
      expect(result.current.isPro).toBe(false);
    });
  });

  describe("無料ユーザー (status: free)", () => {
    it("無料機能には true、Pro 機能には false を返す", () => {
      const { result } = renderHook(() => useEntitlement(), {
        wrapper: wrapperWith(null),
      });

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

    it("無料機能・Pro 機能のいずれも true を返す", () => {
      const { result } = renderHook(() => useEntitlement(), {
        wrapper: wrapperWith(proStatus),
      });

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

    it("entitlements に含まれない Pro 機能には false を返す", () => {
      const { result } = renderHook(() => useEntitlement(), {
        wrapper: wrapperWith(proStatus),
      });

      // proStatus.entitlements には 'detailed_condition_log' が含まれていない
      expect(result.current.hasEntitlement("detailed_condition_log")).toBe(
        false,
      );
    });
  });

  describe("トライアル中ユーザー", () => {
    it("inTrial: true、isPro: true を返す", () => {
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

      const { result } = renderHook(() => useEntitlement(), {
        wrapper: wrapperWith(trialStatus),
      });

      expect(result.current.isPro).toBe(true);
      expect(result.current.inTrial).toBe(true);
      expect(result.current.inGracePeriod).toBe(false);
    });
  });

  describe("グレースピリオド中ユーザー (cancelled)", () => {
    it("inGracePeriod: true、isPro: true を返す", () => {
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

      const { result } = renderHook(() => useEntitlement(), {
        wrapper: wrapperWith(cancelledStatus),
      });

      expect(result.current.isPro).toBe(true);
      expect(result.current.inGracePeriod).toBe(true);
    });
  });
});
