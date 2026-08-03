import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCachedFeatureFlagDecision } from "@app/featureFlags/cachedFeatureFlags";
import FAQ from "./_components/FAQ";
import FeatureComparisonTable from "./_components/FeatureComparisonTable";
import FeatureHighlights from "./_components/FeatureHighlights";
import FinalCTA from "./_components/FinalCTA";
import HeroSection from "./_components/HeroSection";
import PricingCards from "./_components/PricingCards";
import { getCachedProStatus } from "./proStatus";

export const metadata: Metadata = {
  title: "BUZZ BASE Pro — 記録を、成長へ。",
  description:
    "BUZZ BASE Pro で方向別・カウント別・球種別・対戦投手別の打率、シーズン跨ぎの成績推移、練習と成績の相関、週次・月次レポートを解放。7 日間の無料トライアル付き。",
};

export default async function ProLandingPage() {
  // 互いに依存しないので並列で取る。どちらも cookies() 経由でこのルートは元から dynamic。
  const [proFeatures, status] = await Promise.all([
    getCachedFeatureFlagDecision("pro_features"),
    getCachedProStatus(),
  ]);

  // このページは公開マーケティング LP なので、判定不能（未認証 / cookie が届かない）では畳まない。
  // kill switch の目的は Pro を売るのを止めることであり、実際の課金経路は startProCheckout 側で
  // 改めて flag を検証している。ここで畳むのは「無効」と確定したビューアだけに限る。
  if (proFeatures === "disabled") {
    redirect("/");
  }

  if (status?.subscription.pro_active) {
    redirect("/account/subscription");
  }

  return (
    <main className="min-h-screen bg-[#2E2E2E]">
      <HeroSection />
      <PricingCards />
      <FeatureHighlights />
      <FeatureComparisonTable />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
