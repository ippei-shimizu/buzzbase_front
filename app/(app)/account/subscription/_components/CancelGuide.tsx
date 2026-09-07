import type {
  Platform,
  ProSubscription,
  SubscriptionStatus,
} from "@app/types/pro";
import CancelWebSubscription from "./CancelWebSubscription";
import GuideSection, { type GuideContent } from "./GuideSection";

// ストア課金の解約 UI は Web から呼び出せないため、それぞれの管理画面へ誘導する。
// Web（Stripe）だけは back の DELETE /api/v1/pro/subscription でこの画面から完結できる。
const CANCEL_GUIDE: Record<Platform, GuideContent> = {
  web: {
    description:
      "Web（クレジットカード）でご加入中です。この画面からいつでも解約できます。解約後も次回更新日までは Pro 機能をご利用いただけます。",
    steps: [],
    link: null,
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

// back は Stripe Checkout 完了時点では platform を保存せず、決済プロバイダの webhook 到達で
// 初めて確定する。未登録 product の場合は恒久的に null のままにもなりうるため、
// 「媒体不明」を無表示にせず問い合わせ導線へ倒す。
const UNKNOWN_PLATFORM_GUIDE: GuideContent = {
  description:
    "ご加入の媒体を判別できませんでした。ご加入直後は反映までお時間がかかる場合があります。時間をおいても変わらない場合や解約をご希望の場合はお問い合わせください。",
  steps: [],
  link: { href: "/contact", label: "お問い合わせ" },
};

// 解約できるのは期間内の加入状態のときだけ。解約済み・期限切れには案内を出さない。
const CANCELLABLE_STATUSES: SubscriptionStatus[] = ["trial", "active"];

/**
 * 加入媒体ごとの解約手段を案内するセクション。
 * 解約可能な状態のときだけ描画し、Web 加入者にはこの画面で完結する解約ボタンを出す。
 */
export default function CancelGuide({
  subscription,
}: {
  subscription: ProSubscription;
}) {
  const { platform, status } = subscription;
  if (!CANCELLABLE_STATUSES.includes(status)) return null;

  const content = platform ? CANCEL_GUIDE[platform] : UNKNOWN_PLATFORM_GUIDE;

  return (
    <GuideSection title="解約について" content={content}>
      {platform === "web" ? <CancelWebSubscription /> : null}
    </GuideSection>
  );
}
