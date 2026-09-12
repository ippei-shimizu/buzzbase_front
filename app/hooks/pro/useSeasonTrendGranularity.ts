"use client";

import type { ProFeature, ProGatedResult } from "@app/types/pro";
import { useCallback, useEffect, useRef, useState } from "react";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { useProGatedFeatures } from "@app/hooks/pro/useProGatedFeatures";

/**
 * シーズン跨ぎ比較を表す粒度キーと、それに必要な entitlement。
 * 打撃 / 防御率どちらの推移も back の粒度名が `season` で揃っているため、
 * キーだけ差し替えられて entitlement とずれることが無いよう組にして固定する。
 */
const SEASON_KEY = "season";
const SEASON_TREND_FEATURE: ProFeature = "season_transition_graph";

interface UseSeasonTrendGranularityOptions<G extends string> {
  /** 無料で使える既定の粒度。初期値と、403 で拒否されたときの戻り先を兼ねる。 */
  freeKey: G;
  /**
   * SSR で閲覧可と判定された Pro 機能。クライアントの Pro 判定が確定するまでの
   * 判定に使い、Pro ユーザーの選択が一瞬 Paywall に倒れるのを防ぐ。
   */
  initialGranted: readonly ProFeature[];
}

interface UseSeasonTrendGranularityReturn<G extends string> {
  granularity: G;
  /** 粒度切替の要求。シーズン粒度を持たないユーザーには Paywall を出し、切替を行わない。 */
  requestGranularity: (next: G) => void;
  /**
   * 推移データ取得結果をデータに落とす。シーズン粒度で 403 なら無料粒度へ戻して
   * Paywall を出し、以降シーズン粒度をロックする。
   */
  resolveTrend: <T>(result: ProGatedResult<T>) => T | null;
}

/**
 * 推移グラフの粒度切替を Pro ゲート付きで管理する。
 *
 * シーズン粒度は `season_transition_graph` を持つユーザーだけが選べる。無料ユーザーが
 * 選ぼうとしても state を進めないため、403 になるリクエストがそもそも飛ばない。
 * クライアントの entitlement がサーバーと食い違って 403 を踏んだ場合は、無料粒度へ
 * 戻したうえで Paywall を出す（グラフが空のまま無言で止まるのを避ける）。
 */
export function useSeasonTrendGranularity<G extends string>({
  freeKey,
  initialGranted,
}: UseSeasonTrendGranularityOptions<G>): UseSeasonTrendGranularityReturn<G> {
  const [granularity, setGranularity] = useState<G>(freeKey);
  const { canView, unwrap } = useProGatedFeatures(initialGranted);
  const { open } = useProUpgradeModal();

  const canViewSeason = canView(SEASON_TREND_FEATURE);

  const openPaywall = useCallback(
    () => open({ trigger: SEASON_TREND_FEATURE }),
    [open],
  );

  const requestGranularity = useCallback(
    (next: G) => {
      if (next === SEASON_KEY && !canViewSeason) {
        openPaywall();
        return;
      }
      setGranularity(next);
    },
    [canViewSeason, openPaywall],
  );

  // resolveTrend は取得完了後に呼ばれる。identity が変わると呼び出し側の effect が
  // 張り直されて進行中のレスポンスが捨てられるため、最新の値は ref 経由で読む。
  const latestRef = useRef({ unwrap, openPaywall, granularity });
  useEffect(() => {
    latestRef.current = { unwrap, openPaywall, granularity };
  });

  const resolveTrend = useCallback(
    <T>(result: ProGatedResult<T>): T | null => {
      if (result.status === "ok") return result.data;
      // シーズン粒度以外の 403 は season_transition_graph の拒否ではない。
      // 無関係な粒度で無料粒度へ戻したり Paywall を出したりしないよう打ち切る。
      if (latestRef.current.granularity !== SEASON_KEY) return null;
      latestRef.current.unwrap(SEASON_TREND_FEATURE, result);
      setGranularity(freeKey);
      latestRef.current.openPaywall();
      return null;
    },
    [freeKey],
  );

  return { granularity, requestGranularity, resolveTrend };
}
