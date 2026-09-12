"use client";

import { useEffect, useRef } from "react";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import { isAdsenseEnabled } from "./adConfig";

/**
 * AdSense の広告枠を描画してよいかを判定し、描画するときだけ広告リクエストを push する。
 *
 * Pro 判定が確定するまでは描画しない。ProStatusProvider はクライアントで Pro 状態を
 * 解決するため、確定前は hasEntitlement("no_ads") が無料扱いの false を返す。
 * そのまま描画すると Pro 加入者に広告が一瞬見えてから消える。
 * 未認証（大多数の閲覧者）は Server Action を呼ばずに即確定するため、この待機は
 * ハイドレーション直後の 1 レンダー分しか発生しない。
 *
 * @param slot AdSense の広告ユニット ID。空文字なら未設定の枠として描画しない。
 * @returns 広告枠を描画してよいなら true
 */
export function useAdSlot(slot: string): boolean {
  const { hasEntitlement, isLoading } = useEntitlement();
  const isAdRequested = useRef(false);

  const canRenderAd =
    isAdsenseEnabled && !!slot && !isLoading && !hasEntitlement("no_ads");

  useEffect(() => {
    if (!canRenderAd || isAdRequested.current) return;

    try {
      ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle ||
        []).push({});
      isAdRequested.current = true;
    } catch {
      // AdSense script not loaded
    }
  }, [canRenderAd, slot]);

  return canRenderAd;
}
