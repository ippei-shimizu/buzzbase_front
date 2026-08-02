import type { ProSubscription } from "@app/types/pro";
import Link from "next/link";

/**
 * 課金失敗（billing_issue）のときだけ表示する警告バナー。
 * 放置すると Pro が失効するため、加入媒体に関わらず全ページで出し続ける。
 *
 * 媒体ごとの具体的な更新手順は遷移先の BillingIssueGuide が持つ。
 * Web には Stripe 加入者と iOS 加入者の両方が来るため、ここでは
 * mobile のような App Store 前提の文言にはしない。
 */
export default function BillingIssueAlert({
  subscription,
}: {
  subscription: ProSubscription;
}) {
  if (subscription.status !== "billing_issue") return null;

  return (
    <div role="alert" className="bg-[#7f1d1d]">
      <Link
        href="/account/subscription"
        className="block px-4 py-2 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#fecaca]"
      >
        <p className="text-[13px] font-bold text-white">
          決済情報の更新が必要です
        </p>
        <p className="mt-0.5 text-xs leading-4 text-[#fecaca]">
          お支払いを確認できませんでした。このままでは Pro
          機能が利用できなくなります。決済情報を更新してください。
        </p>
      </Link>
    </div>
  );
}
