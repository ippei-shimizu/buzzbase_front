import { type Metadata } from "next";
import { Suspense } from "react";
import OnboardingWalkthroughGate from "./_components/OnboardingWalkthroughGate";

export const metadata: Metadata = {
  title: "はじめかた",
  description: "BUZZ BASE でできることを3ステップで紹介します。",
  robots: {
    index: false,
  },
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingWalkthroughGate />
    </Suspense>
  );
}
