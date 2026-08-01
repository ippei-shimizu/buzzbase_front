"use client";

import type { ProFeature, ProGatedResult } from "@app/types/pro";
import { useCallback, useState } from "react";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";

interface UseProGatedFeaturesReturn {
  /** Pro 判定が未確定の間だけ true。ロック UI も実データも描かない判断に使う。 */
  isResolving: boolean;
  /** entitlement を持ち、かつサーバーに 403 で拒否されていない機能だけ true。 */
  canView: (feature: ProFeature) => boolean;
  /**
   * Pro 限定 Server Action の戻り値をデータに落とす。
   * 403 なら feature をロック側へ倒し（以降 canView が false）、fallback を返す。
   */
  unwrap: <T>(feature: ProFeature, result: ProGatedResult<T>, fallback: T) => T;
}

/**
 * Pro 限定 API を叩く画面の共通アクセス判定。
 * クライアントの entitlement は解約直後や別端末での状態変化でサーバーと食い違うため、
 * back が 403 を返した機能はその場でロック扱いにして Paywall を出せるようにする。
 */
export function useProGatedFeatures(): UseProGatedFeaturesReturn {
  const { hasEntitlement, isLoading } = useEntitlement();
  const [deniedFeatures, setDeniedFeatures] = useState<readonly ProFeature[]>(
    [],
  );

  const canView = useCallback(
    (feature: ProFeature): boolean =>
      hasEntitlement(feature) && !deniedFeatures.includes(feature),
    [hasEntitlement, deniedFeatures],
  );

  const unwrap = useCallback(
    <T>(feature: ProFeature, result: ProGatedResult<T>, fallback: T): T => {
      if (result.status === "ok") return result.data;
      setDeniedFeatures((prev) =>
        prev.includes(feature) ? prev : [...prev, feature],
      );
      return fallback;
    },
    [],
  );

  return { isResolving: isLoading, canView, unwrap };
}
