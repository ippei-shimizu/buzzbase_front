"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { useProStatus } from "@app/hooks/pro/useProStatus";
import BillingIssueAlert from "./BillingIssueAlert";
import TrialExpiringBanner from "./TrialExpiringBanner";

// 固定ヘッダーの top と body の padding-top が参照する高さ。globals.css の定義と対。
const HEIGHT_VAR = "--pro-banner-height";

// 両バナーの遷移先。このページ上では自分自身へのリンクになり、
// より詳しい SubscriptionStatusCard / BillingIssueGuide と内容も重複する。
const BANNER_LINK_PATH = "/account/subscription";

/**
 * トライアル終了予告と課金失敗の警告を全ページ共通で出す常設バナー領域。
 *
 * ProStatusProvider（クライアント解決）から状態を取る。(app)/layout.tsx で
 * cookies() を読むと配下の静的ページがすべて dynamic に落ちるため、
 * サーバー側で加入状態を読んではならない。
 *
 * 実測した高さを CSS 変数へ書き出し、固定ヘッダーとページ本文を押し下げる。
 * 高さを決め打ちにすると、文言が折り返す幅でヘッダーに重なる。
 */
export default function ProStatusBanners() {
  const { proStatus, isLoading } = useProStatus();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const { subscription } = proStatus;

  const applyHeight = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    document.documentElement.style.setProperty(
      HEIGHT_VAR,
      `${container.offsetHeight}px`,
    );
  }, []);

  // 画面幅の変化やフォント読み込みで折り返しが変わり、高さも変わる。
  // 描画内容の入れ替わりは下の効果が同期的に反映するため、こちらは reflow 専用。
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(applyHeight);
    observer.observe(container);

    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty(HEIGHT_VAR, "0px");
    };
  }, [applyHeight]);

  // 判定が確定するまでは出さない。先に無料状態で描画すると、加入者に
  // バナーが一瞬見えて消える。未認証は DEFAULT_PRO_STATUS（status: free）で
  // 確定するため、どちらの表示条件にも合致しない。
  const shouldRenderBanners = !isLoading && pathname !== BANNER_LINK_PATH;

  // バナーの出現・消滅による高さ変化まで ResizeObserver に委ねると、
  // 通知が届くまでの間だけ固定ヘッダーがバナーに重なって描画される。
  useEffect(() => {
    applyHeight();
  }, [
    applyHeight,
    shouldRenderBanners,
    subscription.status,
    subscription.in_trial,
    subscription.days_remaining,
  ]);

  return (
    <div
      ref={containerRef}
      className="fixed left-0 right-0 top-[var(--smart-app-banner-height,0px)] z-[60]"
    >
      {shouldRenderBanners ? (
        <>
          <BillingIssueAlert subscription={subscription} />
          <TrialExpiringBanner subscription={subscription} />
        </>
      ) : null}
    </div>
  );
}
