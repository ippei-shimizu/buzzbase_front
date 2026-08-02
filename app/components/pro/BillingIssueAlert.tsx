import type { ProSubscription } from "@app/types/pro";
import Link from "next/link";

/**
 * 課金失敗（billing_issue）のときだけ表示する警告バナー。
 * 放置すると Pro が失効するため、加入媒体に関わらず全ページで出し続ける。
 *
 * 媒体ごとの具体的な更新手順は遷移先の BillingIssueGuide が持つ。
 * Web には Stripe 加入者と iOS 加入者の両方が来るため、ここでは
 * mobile のような App Store 前提の文言にはしない。
 *
 * role は alert（assertive）にしない。常設かつ閉じる手段がないため、
 * ページを開くたびに他の読み上げを中断してしまう。緊急度は配色で伝え、
 * 支援技術には名前付きの region として一度だけ位置を知らせる。
 */
export default function BillingIssueAlert({
  subscription,
}: {
  subscription: ProSubscription;
}) {
  if (subscription.status !== "billing_issue") return null;

  return (
    <div
      role="region"
      aria-label="課金に関する重要なお知らせ"
      className="bg-[#7f1d1d]"
    >
      <Link
        href="/account/subscription"
        // 見出しと本文を丸ごと読み上げる長い名前になるため、要点と遷移先だけを名前にする。
        aria-label="決済情報の更新が必要です。サブスクリプション管理を開く"
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
