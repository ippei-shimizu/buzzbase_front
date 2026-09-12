import type { ProSubscription, SubscriptionStatus } from "@app/types/pro";
import ChangeWebPlan from "./ChangeWebPlan";
import GuideSection, { type GuideContent } from "./GuideSection";

// 方向によらず成り立つ説明だけを置き、月額→年額 / 年額→月額 で異なる差額の扱いは
// 変更先が確定する確認ダイアログ側で説明する。
const PLAN_CHANGE_GUIDE: GuideContent = {
  description:
    "月額プランと年額プランはいつでも切り替えられます。切り替えた時点で請求サイクルが新しいプランの周期に変わり、お支払い済みの未使用期間分は日割りで差額に反映されます（現金でのご返金は行いません）。",
  steps: [],
  link: null,
};

// 課金が正常に継続している状態でだけ切り替えを提案する。
// trial は Stripe が日割りを行わず（トライアル終了時に新プランで課金される）説明と挙動が食い違い、
// cancelled は解約申請済み、billing_issue は決済の復旧が先で、いずれも切り替えを促す状態ではない。
const CHANGEABLE_STATUSES: SubscriptionStatus[] = ["active"];

/**
 * 月額↔年額の切り替えを案内するセクション。
 * Stripe サブスクリプションを持つ Web 加入者だけが back のプラン変更 API を使えるため、
 * ストア課金・媒体不明・現プラン不明のときは描画しない。
 */
export default function PlanChangeGuide({
  subscription,
}: {
  subscription: ProSubscription;
}) {
  const { platform, plan_type, pro_active, status } = subscription;

  if (platform !== "web") return null;
  if (!pro_active) return null;
  if (!CHANGEABLE_STATUSES.includes(status)) return null;
  // 変更先は現プランの反対側に決まるので、現プランが分からないと切り替え先を提示できない。
  if (!plan_type) return null;

  return (
    <GuideSection title="プラン変更について" content={PLAN_CHANGE_GUIDE}>
      <ChangeWebPlan currentPlan={plan_type} />
    </GuideSection>
  );
}
