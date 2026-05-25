import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FAQ from "./_components/FAQ";
import FeatureComparisonTable from "./_components/FeatureComparisonTable";
import FinalCTA from "./_components/FinalCTA";
import HeroSection from "./_components/HeroSection";
import PricingCards from "./_components/PricingCards";
import Screenshots from "./_components/Screenshots";
import Testimonials from "./_components/Testimonials";
import { getProStatus } from "./actions";

export const metadata: Metadata = {
  title: "BUZZ BASE Pro — 記録を、成長へ。",
  description:
    "BUZZ BASE Pro で広告なし・メディア無制限・シーズン跨ぎ成績推移グラフなど全機能を解放。7 日間の無料トライアル付き。",
};

export default async function ProLandingPage() {
  const status = await getProStatus();
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
