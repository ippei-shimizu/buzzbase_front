import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedFeatureFlag } from "@app/featureFlags/cachedFeatureFlags";
import FAQ from "./_components/FAQ";
import FeatureComparisonTable from "./_components/FeatureComparisonTable";
import FinalCTA from "./_components/FinalCTA";
import HeroSection from "./_components/HeroSection";
import PricingCards from "./_components/PricingCards";
import Screenshots from "./_components/Screenshots";
import Testimonials from "./_components/Testimonials";
import { getCachedProStatus } from "./proStatus";

export const metadata: Metadata = {
  title: "BUZZ BASE Pro — 記録を、成長へ。",
  description:
    "BUZZ BASE Pro で広告なし・メディア無制限・シーズン跨ぎ成績推移グラフなど全機能を解放。7 日間の無料トライアル付き。",
};

export default async function ProLandingPage() {
  // 互いに依存しないので並列で取る。どちらも cookies() 経由でこのルートは元から dynamic。
  const [proFeaturesEnabled, status] = await Promise.all([
    getCachedFeatureFlag("pro_features"),
    getCachedProStatus(),
  ]);

  // kill switch が落ちている環境では LP ごと畳む。ここを通さないと Stripe Checkout の
  // 導線（CheckoutButton → ProUpgradeModal）だけが生き残ってしまう。
  // back の flag API は認証必須のため、未ログインからの閲覧もここで弾かれる。
  if (!proFeaturesEnabled) {
    redirect("/");
  }

  if (status?.subscription.pro_active) {
    redirect("/account/subscription");
  }

  return (
    <main className="min-h-screen bg-[#2E2E2E]">
      <HeroSection />
      <PricingCards />
      <FeatureComparisonTable />
      <Screenshots />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
