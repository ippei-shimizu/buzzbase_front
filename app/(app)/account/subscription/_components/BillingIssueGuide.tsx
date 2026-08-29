import type { Platform, ProSubscription } from "@app/types/pro";
import GuideSection, { type GuideContent } from "./GuideSection";

// 支払い方法を保持しているのは決済プロバイダ側なので、更新手続きは媒体ごとの管理画面で行う。
const PAYMENT_UPDATE_GUIDE: Record<Platform, GuideContent> = {
  web: {
    description:
      "クレジットカードの決済に失敗しています。決済サービス（Stripe）からお送りしているお支払い手続きのご案内メールから、カード情報を更新してください。",
    steps: [
      "「BUZZ BASE のお支払いに関するお知らせ」メールを開く",
      "メール内のお支払いページのリンクを開く",
      "有効なクレジットカード情報を入力して支払いを完了",
    ],
    link: { href: "/contact", label: "メールが見つからない場合はお問い合わせ" },
  },
  ios: {
    description:
      "Apple ID の決済に失敗しています。iPhone / iPad の設定からお支払い情報を更新してください。",
    steps: [
      "「設定」アプリを開く",
      "上部のあなたの名前（Apple ID）をタップ",
      "「お支払いと配送先」をタップ",
      "有効なお支払い方法に更新",
    ],
    link: {
      href: "https://apps.apple.com/account/billing",
      label: "Apple のお支払い情報を開く",
    },
  },
  android: {
    description:
      "Google Play の決済に失敗しています。Google Play のお支払い方法を更新してください。",
    steps: [
      "Google Play ストアを開く",
      "右上のプロフィールアイコンをタップ",
      "「お支払いと定期購入」→「お支払い方法」をタップ",
      "有効なお支払い方法に更新",
    ],
    link: {
      href: "https://play.google.com/store/paymentmethods",
      label: "Google Play のお支払い方法を開く",
    },
  },
};

const UNKNOWN_PLATFORM_GUIDE: GuideContent = {
  description:
    "お支払いを確認できませんでした。ご加入の媒体を判別できないため、お手続き方法をご案内できません。お問い合わせください。",
  steps: [],
  link: { href: "/contact", label: "お問い合わせ" },
};

/**
 * billing_issue のときに、加入媒体ごとの支払い情報の更新先を案内するセクション。
 * 放置すると Pro が失効するため、最優先の導線として状態カードの直下に置く。
 */
export default function BillingIssueGuide({
  subscription,
}: {
  subscription: ProSubscription;
}) {
  if (subscription.status !== "billing_issue") return null;

  const { platform } = subscription;
  const content = platform
    ? PAYMENT_UPDATE_GUIDE[platform]
    : UNKNOWN_PLATFORM_GUIDE;

  return <GuideSection title="お支払い情報の更新" content={content} />;
}
