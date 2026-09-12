import type { PlanType } from "@app/types/pro";

export interface ProPlanPrice {
  name: string;
  /** 表示用の税込価格。 */
  amount: string;
  /** 価格に続けて表示する課金周期。 */
  period: string;
  /** 月あたり換算などの補足。補足が無いプランは null。 */
  note: string | null;
  /** 割安さを示すバッジ。付けないプランは null。 */
  badge: string | null;
}

/**
 * Web（Stripe）で販売する Pro の料金。
 * /pro の料金表と ProUpgradeModal が同じ値を参照するため、価格改定はここだけを直せば足りる。
 * ストア課金（App Store / Google Play）の表示価格は各ストアが返す値を使うので、ここには含めない。
 */
export const PRO_PLAN_PRICES: Record<PlanType, ProPlanPrice> = {
  monthly: {
    name: "月額プラン",
    amount: "¥480",
    period: "/ 月",
    note: null,
    badge: null,
  },
  yearly: {
    name: "年額プラン",
    amount: "¥4,800",
    period: "/ 年",
    note: "月あたり ¥400",
    badge: "2 ヶ月分お得",
  },
};
