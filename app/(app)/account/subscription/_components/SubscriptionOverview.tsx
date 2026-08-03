import type { ProSubscription, SubscriptionStatus } from "@app/types/pro";
import Link from "next/link";
import BillingIssueGuide from "./BillingIssueGuide";
import CancelGuide from "./CancelGuide";
import PlanChangeGuide from "./PlanChangeGuide";
import SubscriptionStatusCard from "./SubscriptionStatusCard";
import SyncProStatus from "./SyncProStatus";

const JOINABLE_STATUSES: SubscriptionStatus[] = ["free", "expired"];

/**
 * 加入状態カード・再同期・加入 CTA・支払い更新案内・プラン変更・解約案内をまとめた本体表示。
 */
export default function SubscriptionOverview({
  subscription,
}: {
  subscription: ProSubscription;
}) {
  return (
    <div className="flex flex-col gap-4">
      <SubscriptionStatusCard subscription={subscription} />
      <SyncProStatus />
      <BillingIssueGuide subscription={subscription} />
      <PlanChangeGuide subscription={subscription} />
      {JOINABLE_STATUSES.includes(subscription.status) ? (
        <Link
          href="/pro"
          className="rounded-lg bg-[#d08000] px-4 py-3 text-center text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          Pro に加入する
        </Link>
      ) : null}
      <CancelGuide subscription={subscription} />
    </div>
  );
}
