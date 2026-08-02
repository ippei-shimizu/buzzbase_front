import type {
  Platform,
  ProSubscription,
  SubscriptionStatus,
} from "@app/types/pro";
import Link from "next/link";

interface CancelGuideContent {
  description: string;
  steps: string[];
  link: { href: string; label: string };
}

// 解約手続きは加入した媒体でしか行えない。ストア課金の解約 UI は Web から呼び出せないため、
// それぞれの管理画面へ誘導する。
const CANCEL_GUIDE: Record<Platform, CancelGuideContent> = {
  web: {
    description:
      "Web（クレジットカード）でご加入中です。この画面からの解約手続きは現在準備中のため、解約をご希望の場合はお問い合わせください。",
    steps: [],
    link: { href: "/contact", label: "お問い合わせ" },
  },
  ios: {
    description:
      "iOS アプリ内課金でご加入中のため、Web からは解約できません。iPhone / iPad の設定から手続きしてください。",
    steps: [
      "「設定」アプリを開く",
      "上部のあなたの名前（Apple ID）をタップ",
      "「サブスクリプション」をタップ",
      "「BUZZ BASE Pro」を選び、解約を完了",
    ],
    link: {
      href: "https://apps.apple.com/account/subscriptions",
      label: "Apple のサブスクリプション管理を開く",
    },
  },
  android: {
    description:
      "Google Play でご加入中のため、Web からは解約できません。Google Play の定期購入から手続きしてください。",
    steps: [
      "Google Play ストアを開く",
      "右上のプロフィールアイコンをタップ",
      "「お支払いと定期購入」→「定期購入」をタップ",
      "「BUZZ BASE Pro」を選び、解約を完了",
    ],
    link: {
      href: "https://play.google.com/store/account/subscriptions",
      label: "Google Play の定期購入を開く",
    },
  },
};

// 解約できるのは期間内の加入状態のときだけ。解約済み・期限切れには案内を出さない。
const CANCELLABLE_STATUSES: SubscriptionStatus[] = ["trial", "active"];

/**
 * 加入媒体ごとの解約手順を案内するセクション。
 * 解約可能な状態かつ加入媒体が判明しているときだけ描画する。
 */
export default function CancelGuide({
  subscription,
}: {
  subscription: ProSubscription;
}) {
  const { platform, status } = subscription;
  if (platform === null || !CANCELLABLE_STATUSES.includes(status)) return null;

  const content = CANCEL_GUIDE[platform];
  const isExternal = content.link.href.startsWith("http");

  return (
    <section aria-label="解約について" className="rounded-xl bg-sub p-4">
      <h2 className="text-sm font-bold text-white">解約について</h2>
      <p className="mt-2 text-sm leading-5 text-zic-300">
        {content.description}
      </p>
      {content.steps.length > 0 ? (
        <ol className="mt-3 list-decimal space-y-1 rounded-lg bg-main p-3 pl-7 text-sm text-zic-200">
          {content.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
      <Link
        href={content.link.href}
        className="mt-3 inline-block text-sm font-semibold text-[#d08000] underline"
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {content.link.label}
      </Link>
    </section>
  );
}
