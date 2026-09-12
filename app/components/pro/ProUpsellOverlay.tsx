"use client";

import type { ProPlan } from "@app/(app)/pro/actions";
import type { ProFeature } from "@app/types/pro";
import type { ReactNode } from "react";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";

interface ProUpsellOverlayProps {
  /** 覆う対象の Pro 機能。この entitlement を持つユーザーには children がそのまま見える。 */
  feature: ProFeature;
  children: ReactNode;
  /**
   * ロックを解除するかどうか。省略時は feature の entitlement 判定に従う。
   * バックエンド未実装の機能をサンプル UI で先出しする間は false を明示し、
   * entitlement を持つ Pro ユーザーにも未完成の実 UI を見せないようにする。
   */
  unlocked?: boolean;
  /** ロック時に暗幕の上へ重ねる要素。同一画面で CTA を1箇所に絞りたいときは badge / none にする。 */
  lockedIndicator?: "card" | "badge" | "none";
  /** PRO_PAYWALL_COPY の文言を上書きしたいときに指定する。 */
  title?: string;
  description?: string;
  benefits?: string[];
  ctaLabel?: string;
  /** CTA 押下時の挙動を差し替える。省略時は ProUpgradeModal を feature 付きで開く。 */
  onCtaClick?: () => void;
  /** ProUpgradeModal を開いたときに初期選択させる料金プラン。 */
  defaultPlan?: ProPlan;
  /** 暗幕の不透明度（0〜1）。数値を確実に読ませたくない箇所は高めにする。 */
  scrimOpacity?: number;
  className?: string;
}

const DEFAULT_SCRIM_OPACITY = 0.68;

const LOCKED_BADGE = (
  <div className="absolute inset-0 flex items-center justify-center p-3">
    <span className="inline-flex items-center gap-1 rounded-full bg-[#3A3A3A]/90 px-2.5 py-1 text-[11px] font-bold text-white">
      <LockClosedIcon className="h-3 w-3 shrink-0" aria-hidden />
      Pro限定
    </span>
  </div>
);

// children も暗幕も aria-hidden なので、視覚的な指標を出さない場合は
// これを置かないと支援技術には理由のない空領域になる。
const LOCKED_SCREEN_READER_NOTICE = (
  <p className="sr-only">この内容は Pro プラン限定です</p>
);

/**
 * 無料ユーザーに見せたくない実データや、Pro 機能のサンプル UI を暗幕で覆い、
 * 上に Pro 訴求（カード / バッジ）を重ねる。ロックが解除されている場合は children を素通しする。
 */
export function ProUpsellOverlay({
  feature,
  children,
  unlocked,
  lockedIndicator = "card",
  title,
  description,
  benefits,
  ctaLabel,
  onCtaClick,
  defaultPlan,
  scrimOpacity = DEFAULT_SCRIM_OPACITY,
  className,
}: ProUpsellOverlayProps) {
  const { hasEntitlement, isLoading } = useEntitlement();

  if (unlocked ?? hasEntitlement(feature)) return <>{children}</>;

  // unlocked が明示されていれば entitlement を参照しないため、判定の確定を待つ必要はない。
  const isResolvingEntitlement = unlocked === undefined && isLoading;
  // 判定確定前は暗幕だけの中立表示にして、Pro へ倒れた瞬間に訴求が一瞬見えるのを防ぐ。
  const indicator = isResolvingEntitlement ? "none" : lockedIndicator;

  return (
    <div
      // 高さは判定確定前後で変えない。indicator ではなく lockedIndicator を見ることで
      // 訴求カードの出現時にレイアウトシフトが起きないようにする。
      className={`relative overflow-hidden rounded-lg ${lockedIndicator === "card" ? "min-h-[200px]" : ""} ${className ?? ""}`}
    >
      {/* 暗幕の裏に残る実データをスクリーンリーダー・キーボード操作からも切り離す。 */}
      <div inert aria-hidden="true" className="pointer-events-none select-none">
        {children}
      </div>
      <div
        data-testid="pro-upsell-scrim"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 backdrop-blur-[2px]"
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
            onCtaClick={onCtaClick}
            defaultPlan={defaultPlan}
            appearance="translucent"
            className="w-full max-w-sm"
          />
        </div>
      ) : null}
      {indicator === "badge" ? LOCKED_BADGE : null}
      {indicator === "none" && !isResolvingEntitlement
        ? LOCKED_SCREEN_READER_NOTICE
        : null}
    </div>
  );
}
