import type { OnboardingIllustration } from "@app/constants/onboarding";
import type { ComponentType } from "react";
import AutoCalcIllustration from "./AutoCalcIllustration";
import GrowthIllustration from "./GrowthIllustration";
import RankingIllustration from "./RankingIllustration";

const ILLUSTRATIONS: Record<OnboardingIllustration, ComponentType> = {
  autoCalc: AutoCalcIllustration,
  ranking: RankingIllustration,
  growth: GrowthIllustration,
};

interface Props {
  name: OnboardingIllustration;
}

/**
 * ステップ名から対応するイラストを描画する。
 * 外部リクエストを増やさないため、画像ではなくインライン SVG で持つ。
 */
export default function OnboardingIllustrationView({ name }: Props) {
  const Illustration = ILLUSTRATIONS[name];
  return <Illustration />;
}
