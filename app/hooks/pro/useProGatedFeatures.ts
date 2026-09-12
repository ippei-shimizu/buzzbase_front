"use client";

import type { Feature, ProFeature, ProGatedResult } from "@app/types/pro";
import { useCallback, useState } from "react";
import { useProStatus } from "@app/hooks/pro/useProStatus";

interface UseProGatedFeaturesReturn {
  /** entitlement を持ち、かつサーバーに 403 で拒否されていない機能だけ true。 */
  canView: (feature: ProFeature) => boolean;
  /**
   * Pro 限定 Server Action の戻り値をデータに落とす。
   * 403 なら feature をロック側へ倒し（以降 canView が false）、null を返す。
   */
  unwrap: <T>(feature: ProFeature, result: ProGatedResult<T>) => T | null;
}

/**
 * 403 で拒否された機能を、その根拠となった entitlements の identity と組で持つ。
 * 加入・解約・ユーザー切替では entitlements 配列ごと差し替わるため、identity が
 * 変われば過去の 403 は前提を失ったものとして捨て、ロックを解除できる。
 */
interface DeniedState {
  entitlements: Feature[] | null;
  features: readonly ProFeature[];
}

const NO_FEATURES: readonly ProFeature[] = [];

/**
 * Pro 限定 API を叩く画面の共通アクセス判定。
 *
 * クライアントの entitlement は解約直後や別端末での状態変化でサーバーと食い違うため、
 * back が 403 を返した機能はその場でロック扱いにして Paywall を出せるようにする。
 *
 * @param initialGranted サーバーで解決済みの閲覧可能な機能。クライアントの Pro 状態が
 *   確定するまでの判定に使い、SSR 済みブロックが一瞬ロック UI へ倒れるのを防ぐ。
 */
export function useProGatedFeatures(
  initialGranted: readonly ProFeature[] = NO_FEATURES,
): UseProGatedFeaturesReturn {
  const { proStatus, isLoading } = useProStatus();
  const [denied, setDenied] = useState<DeniedState>({
    entitlements: null,
    features: NO_FEATURES,
  });

  const entitlements = proStatus.entitlements;
  const deniedFeatures =
    denied.entitlements === entitlements ? denied.features : NO_FEATURES;

  const canView = useCallback(
    (feature: ProFeature): boolean => {
      // ProFeature は FREE_FEATURES に含まれないため entitlements の有無だけで判定できる。
      const granted = isLoading
        ? initialGranted.includes(feature)
        : entitlements.includes(feature);
      return granted && !deniedFeatures.includes(feature);
    },
    [isLoading, initialGranted, entitlements, deniedFeatures],
  );

  const unwrap = useCallback(
    <T>(feature: ProFeature, result: ProGatedResult<T>): T | null => {
      if (result.status === "ok") return result.data;
      setDenied((prev) => {
        const isSameSnapshot = prev.entitlements === entitlements;
        if (isSameSnapshot && prev.features.includes(feature)) return prev;
        const base = isSameSnapshot ? prev.features : NO_FEATURES;
        return { entitlements, features: [...base, feature] };
      });
      return null;
    },
    [entitlements],
  );

  return { canView, unwrap };
}
