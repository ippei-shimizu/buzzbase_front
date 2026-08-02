"use client";

import { useEffect, useRef } from "react";
import { useProStatus } from "@app/hooks/pro/useProStatus";
import BillingIssueAlert from "./BillingIssueAlert";
import TrialExpiringBanner from "./TrialExpiringBanner";

// 固定ヘッダーの top と body の padding-top が参照する高さ。globals.css の定義と対。
const HEIGHT_VAR = "--pro-banner-height";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const { subscription } = proStatus;

  // 状態が入れ替わったときの高さ変化は ResizeObserver が拾うため、
  // この効果は初回マウント時の設置だけを担う。
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const applyHeight = () => {
      document.documentElement.style.setProperty(
        HEIGHT_VAR,
        `${container.offsetHeight}px`,
      );
    };
    applyHeight();

    // 画面幅の変化やフォント読み込みで折り返しが変わり、高さも変わる。
    const observer = new ResizeObserver(applyHeight);
    observer.observe(container);

    return () => {
      observer.disconnect();
      document.documentElement.style.setProperty(HEIGHT_VAR, "0px");
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed left-0 right-0 top-[var(--smart-app-banner-height,0px)] z-[60]"
    >
      {/* 判定が確定するまでは出さない。先に無料状態で描画すると、加入者に
          バナーが一瞬見えて消える。未認証は DEFAULT_PRO_STATUS（status: free）で
          確定するため、どちらの表示条件にも合致しない。 */}
      {isLoading ? null : (
        <>
          <BillingIssueAlert subscription={subscription} />
          <TrialExpiringBanner subscription={subscription} />
        </>
      )}
    </div>
  );
}
