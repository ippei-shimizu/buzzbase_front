"use client";

import type { ProFeature } from "@app/types/pro";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { PRO_PAYWALL_COPY } from "@app/components/pro/paywallCopy";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";

/**
 * 訴求文言の指定方法。feature を渡せば PRO_PAYWALL_COPY から引き、個別に上書きもできる。
 * entitlement キーを持たない未実装機能では feature を省略でき、その場合 title が必須になる。
 */
type ProUpsellCopyProps =
  | {
      feature: ProFeature;
      title?: string;
      description?: string;
      benefits?: string[];
    }
  | {
      feature?: undefined;
      title: string;
      description?: string;
      benefits?: string[];
    };

export type ProUpsellCardProps = ProUpsellCopyProps & {
  /** CTA ボタンの文言。 */
  ctaLabel?: string;
  /** solid: 単独設置 / translucent: ProUpsellOverlay の暗幕の上に重ねる。 */
  appearance?: "solid" | "translucent";
  className?: string;
};

const DEFAULT_CTA_LABEL = "Pro プランを見る";

const APPEARANCE_CLASS = {
  solid: "bg-sub",
  translucent: "bg-[#3A3A3A]/90 backdrop-blur-sm",
} as const;

/**
 * Pro 専用機能の訴求カード（鍵アイコン付き見出し + メリット + CTA）。
 * 単独カードとしても、ProUpsellOverlay の中で実 UI / サンプル UI の上に重ねる形でも使う。
 * CTA は ProUpgradeModalProvider が常設しているモーダルを feature 付きで開く。
 */
export function ProUpsellCard({
  feature,
  title,
  description,
  benefits,
  ctaLabel = DEFAULT_CTA_LABEL,
  appearance = "solid",
  className,
}: ProUpsellCardProps) {
  const { open } = useProUpgradeModal();

  const copy = feature ? PRO_PAYWALL_COPY[feature] : undefined;
  const resolvedTitle = title ?? copy?.title ?? "";
  const resolvedBenefits = benefits ?? copy?.benefits ?? [];
  const resolvedDescription = description ?? copy?.description;

  return (
    <section
      className={`flex flex-col items-center gap-2 rounded-[10px] p-3.5 text-center ${APPEARANCE_CLASS[appearance]} ${className ?? ""}`}
    >
      <h3 className="flex items-center gap-1.5 text-sm font-bold text-white">
        <LockClosedIcon
          className="h-4 w-4 shrink-0 text-[#d08000]"
          aria-hidden
        />
        {resolvedTitle}
      </h3>
      {resolvedBenefits.length > 0 ? (
        <ul className="w-full space-y-1 text-left text-xs leading-[18px] text-zic-300">
          {resolvedBenefits.map((benefit) => (
            <li key={benefit} className="flex gap-1">
              <span aria-hidden>・</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      ) : resolvedDescription ? (
        <p className="text-left text-xs leading-[18px] text-zic-300">
          {resolvedDescription}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => open({ trigger: feature })}
        className="mt-1 inline-flex items-center gap-1.5 rounded-[10px] bg-[#d08000] px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000] focus-visible:ring-offset-2 focus-visible:ring-offset-main"
      >
        <LockClosedIcon className="h-4 w-4 shrink-0" aria-hidden />
        {ctaLabel}
      </button>
    </section>
  );
}
