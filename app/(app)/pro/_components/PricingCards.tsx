import type { PlanType } from "@app/types/pro";
import Link from "next/link";
import AvailabilityBadge from "@app/components/pro/AvailabilityBadge";
import { PRO_PAYWALL_COPY } from "@app/components/pro/paywallCopy";
import {
  FEATURE_COMPARISONS,
  PLAN_HIGHLIGHT_FEATURES,
} from "@app/components/pro/proFeatureCatalog";
import { PRO_PLAN_PRICES } from "@app/components/pro/proPricing";
import CheckoutButton from "./CheckoutButton";

const HIGHLIGHTS = PLAN_HIGHLIGHT_FEATURES.map((feature) => ({
  feature,
  title: PRO_PAYWALL_COPY[feature].title,
  availability: FEATURE_COMPARISONS[feature].availability,
}));

function PlanCard({ plan }: { plan: PlanType }) {
  const price = PRO_PLAN_PRICES[plan];
  // バッジの有無をそのまま「推したいプラン」の印として使い、強調用のフラグを別に持たない。
  const isFeatured = price.badge !== null;

  return (
    <article
      className={
        isFeatured
          ? "relative rounded-2xl border-2 border-[#d08000] bg-[#424242] p-6 shadow-xl"
          : "relative rounded-2xl border border-gray-700 bg-[#424242] p-6 shadow-lg"
      }
    >
      {price.badge ? (
        <span className="absolute -top-3 right-4 rounded-full bg-[#d08000] px-3 py-0.5 text-xs font-bold text-white">
          {price.badge}
        </span>
      ) : null}
      <header className="mb-4">
        <h3 className="text-lg font-bold text-white">{price.name}</h3>
        <p className="mt-2 text-3xl font-bold text-white">
          {price.amount}
          <span className="text-base font-normal text-gray-400">
            {" "}
            {price.period}
          </span>
        </p>
        {price.note ? (
          <p className="mt-1 text-xs text-gray-400">{price.note}</p>
        ) : null}
      </header>
      <ul className="mb-6 space-y-2 text-sm text-gray-200">
        {HIGHLIGHTS.map((highlight) => (
          <li key={highlight.feature} className="flex items-start gap-2">
            <span className="text-[#d08000]">✓</span>
            <span>{highlight.title}</span>
            <AvailabilityBadge availability={highlight.availability} />
          </li>
        ))}
      </ul>
      <CheckoutButton
        label="7 日間の無料トライアルを始める"
        defaultPlan={plan}
        fullWidth
      />
    </article>
  );
}

export default function PricingCards() {
  return (
    <section id="pricing" className="bg-[#2E2E2E] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-2 text-center text-2xl font-bold text-white md:text-3xl">
          プランを選ぶ
        </h2>
        <p className="mb-10 text-center text-sm text-gray-400">
          月額・年額のどちらも使える機能は同じです。7
          日間の無料トライアル付きで、期間中はいつでも解約できます。
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <PlanCard plan="monthly" />
          <PlanCard plan="yearly" />
        </div>

        <p className="mt-8 text-center text-sm leading-relaxed text-gray-400">
          Pro は Web
          版とアプリ版で共通の1つの契約です。「アプリ版」と付いた機能は、現在アプリ版でのみご利用いただけます。
          <Link
            href="#feature-comparison"
            className="ml-1 inline-block text-[#d08000] underline"
          >
            全機能の比較を見る
          </Link>
        </p>
      </div>
    </section>
  );
}
