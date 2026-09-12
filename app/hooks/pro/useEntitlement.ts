"use client";

import { useCallback } from "react";
import { useProStatus } from "@app/hooks/pro/useProStatus";
import { FREE_FEATURES, type Feature } from "@app/types/pro";

interface UseEntitlementReturn {
  isPro: boolean;
  inTrial: boolean;
  inGracePeriod: boolean;
  /** Pro 判定が未確定の間だけ true。ロック UI のちらつきを避ける判断に使う。 */
  isLoading: boolean;
  hasEntitlement: (feature: Feature) => boolean;
}

/**
 * 機能アクセス権（Entitlement）をクライアント側で判定するフック。
 * 無料機能は常に true、Pro 機能は subscription.entitlements に含まれていれば true。
 * back の Entitlement#has_entitlement? と同じロジックを表現する。
 */
export function useEntitlement(): UseEntitlementReturn {
  const { proStatus, isPro, isLoading } = useProStatus();

  const hasEntitlement = useCallback(
    (feature: Feature): boolean => {
      if ((FREE_FEATURES as readonly string[]).includes(feature)) return true;
      return proStatus.entitlements.includes(feature);
    },
    [proStatus.entitlements],
  );

  return {
    isPro,
    inTrial: proStatus.subscription.in_trial,
    inGracePeriod: proStatus.subscription.in_grace_period,
    isLoading,
    hasEntitlement,
  };
}
