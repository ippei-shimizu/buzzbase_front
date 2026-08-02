import type { ProSubscription } from "@app/types/pro";
import Link from "next/link";

// 残り日数がこの値以下になったら予告を出す。mobile の TrialExpiringBanner と同じ閾値。
const TRIAL_WARN_DAYS = 3;

/**
 * トライアル終了が近いときだけ表示する予告バナー。
 * 自動課金が始まることの認識合わせと、解約導線への入口を担う。
 */
export default function TrialExpiringBanner({
  subscription,
}: {
  subscription: ProSubscription;
}) {
  if (!subscription.in_trial) return null;

  // days_remaining は expires_at が無ければ null になる。終了日が分からない状態で
  // 「あと N 日」と予告はできないため、確定するまでは何も出さない。
  const days = subscription.days_remaining;
  if (days === null || days > TRIAL_WARN_DAYS) return null;

  const headline =
    days === 0
      ? "無料トライアルは本日で終了します"
      : `無料トライアルはあと${days}日で終了します`;

  return (
    <div role="status" className="bg-[#78350f]">
      <Link
        href="/account/subscription"
        // 見出しと本文を丸ごと読み上げる長い名前になるため、要点と遷移先だけを名前にする。
        aria-label={`${headline}。サブスクリプション管理を開く`}
        className="block px-4 py-2 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#fed7aa]"
      >
        <p className="text-[13px] font-bold text-white">{headline}</p>
        <p className="mt-0.5 text-xs leading-4 text-[#fed7aa]">
          終了後は自動で有料プランに切り替わります。プランの確認と解約はサブスクリプション管理から行えます。
        </p>
      </Link>
    </div>
  );
}
