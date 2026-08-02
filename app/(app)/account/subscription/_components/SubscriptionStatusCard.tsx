import type {
  PlanType,
  ProSubscription,
  SubscriptionStatus,
} from "@app/types/pro";

interface StatusContent {
  label: string;
  description: string;
  badgeClass: string;
}

const STATUS_CONTENT: Record<SubscriptionStatus, StatusContent> = {
  free: {
    label: "無料プラン",
    description: "Pro に加入するとすべての機能を利用できます。",
    badgeClass: "bg-[#6b7280]",
  },
  trial: {
    label: "無料トライアル中",
    description: "期間中はいつでも解約できます。",
    badgeClass: "bg-[#3b82f6]",
  },
  active: {
    label: "Pro 加入中",
    description: "Pro 機能をすべてご利用いただけます。",
    badgeClass: "bg-[#10b981]",
  },
  cancelled: {
    label: "解約済み（期間内）",
    description: "次回更新日まで Pro 機能を利用できます。",
    badgeClass: "bg-[#f59e0b]",
  },
  billing_issue: {
    // モバイルは App Store 固定の文言だが、Web には Stripe 加入者も来るため媒体を限定しない。
    label: "決済に問題があります",
    description: "お支払い情報を更新してください。",
    badgeClass: "bg-[#ef4444]",
  },
  expired: {
    label: "Pro 期間終了",
    description: "再加入すると過去のデータも引き続き閲覧できます。",
    badgeClass: "bg-[#6b7280]",
  },
  pending: {
    label: "処理中",
    description: "決済処理が完了するまでお待ちください。",
    badgeClass: "bg-[#6b7280]",
  },
};

const PLAN_LABEL: Record<PlanType, string> = {
  monthly: "月額プラン",
  yearly: "年額プラン",
};

// 期限を過ぎた状態では「次に課金される日」ではなく「いつまで使えたか」を示す。
const EXPIRY_META_STATUSES: SubscriptionStatus[] = ["cancelled", "expired"];

const EMPTY_VALUE = "—";

// サーバー側のタイムゾーンに依存せず、モバイル（端末ローカル = JST 想定）と同じ日付を出す。
const DATE_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

function formatDate(iso: string | null): string {
  if (!iso) return EMPTY_VALUE;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return EMPTY_VALUE;

  return DATE_FORMATTER.format(date);
}

/**
 * Pro 加入状態を表示するカード。
 * status ごとにバッジ色・見出し・説明文を出し分け、期限日と残り日数を添える。
 */
export default function SubscriptionStatusCard({
  subscription,
}: {
  subscription: ProSubscription;
}) {
  const content = STATUS_CONTENT[subscription.status];
  const planLabel = subscription.plan_type
    ? PLAN_LABEL[subscription.plan_type]
    : null;
  const metaLabel = EXPIRY_META_STATUSES.includes(subscription.status)
    ? "利用期限"
    : "次回更新日";

  return (
    <section
      aria-label="サブスクリプション状態"
      className="rounded-xl bg-sub p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold text-white ${content.badgeClass}`}
        >
          {content.label}
        </span>
        {planLabel ? (
          <span className="text-sm font-semibold text-zic-300">
            {planLabel}
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm leading-5 text-zic-300">
        {content.description}
      </p>

      <dl className="mt-3 border-t border-zinc-600 pt-2 text-sm">
        <div className="flex items-center justify-between py-1">
          <dt className="text-xs text-zic-400">{metaLabel}</dt>
          <dd className="font-semibold text-white">
            {formatDate(subscription.expires_at)}
          </dd>
        </div>
        {subscription.days_remaining !== null ? (
          <div className="flex items-center justify-between py-1">
            <dt className="text-xs text-zic-400">残り日数</dt>
            <dd className="font-semibold text-white">
              残り{subscription.days_remaining}日
            </dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
