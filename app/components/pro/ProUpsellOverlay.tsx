"use client";

import type { ProFeature } from "@app/types/pro";
import type { ReactNode } from "react";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";

interface ProUpsellOverlayProps {
  /** 覆う対象の Pro 機能。この entitlement を持つユーザーには children がそのまま見える。 */
  feature: ProFeature;
  children: ReactNode;
  /** ロック時に暗幕の上へ重ねる要素。同一画面で CTA を1箇所に絞りたいときは badge / none にする。 */
  lockedIndicator?: "card" | "badge" | "none";
  /** PRO_PAYWALL_COPY の文言を上書きしたいときに指定する。 */
  title?: string;
  description?: string;
  benefits?: string[];
  ctaLabel?: string;
  /** 暗幕の不透明度（0〜1）。数値を確実に読ませたくない箇所は高めにする。 */
  scrimOpacity?: number;
  className?: string;
}

const DEFAULT_SCRIM_OPACITY = 0.68;

/**
 * 無料ユーザーに見せたくない実データや、Pro 機能のサンプル UI を暗幕で覆い、
 * 上に Pro 訴求（カード / バッジ）を重ねる。entitlement を持つ場合は children を素通しする。
 */
export function ProUpsellOverlay({
  feature,
  children,
  lockedIndicator = "card",
  title,
  description,
  benefits,
  ctaLabel,
  scrimOpacity = DEFAULT_SCRIM_OPACITY,
  className,
}: ProUpsellOverlayProps) {
  const { hasEntitlement, isLoading } = useEntitlement();

  if (hasEntitlement(feature)) return <>{children}</>;

  // 判定確定前は暗幕だけの中立表示にして、Pro へ倒れた瞬間に訴求が一瞬見えるのを防ぐ。
  const indicator = isLoading ? "none" : lockedIndicator;

  return (
    <div
      className={`relative overflow-hidden rounded-lg ${indicator === "card" ? "min-h-[200px]" : ""} ${className ?? ""}`}
    >
      {/* 暗幕の裏に残る実データをスクリーンリーダー・キーボード操作からも切り離す。 */}
      <div inert aria-hidden="true" className="pointer-events-none select-none">
        {children}
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{ backgroundColor: `rgba(26, 26, 26, ${scrimOpacity})` }}
      />
      {indicator === "card" ? (
        <div className="absolute inset-0 flex items-center justify-center p-3">
          <ProUpsellCard
            feature={feature}
            title={title}
            description={description}
            benefits={benefits}
            ctaLabel={ctaLabel}
            appearance="translucent"
            className="w-full max-w-sm"
          />
        </div>
      ) : null}
      {indicator === "badge" ? (
        <div className="absolute inset-0 flex items-center justify-center p-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#3A3A3A]/90 px-2.5 py-1 text-[11px] font-bold text-white">
            <LockClosedIcon className="h-3 w-3 shrink-0" aria-hidden />
            Pro限定
          </span>
        </div>
      ) : null}
    </div>
  );
}
