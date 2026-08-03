"use client";

import type { ProFeature } from "@app/types/pro";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
} from "@heroui/react";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { startProCheckout, type ProPlan } from "@app/(app)/pro/actions";
import AvailabilityBadge from "@app/components/pro/AvailabilityBadge";
import {
  DEFAULT_PAYWALL_COPY,
  PRO_PAYWALL_COPY,
} from "@app/components/pro/paywallCopy";
import {
  FEATURE_COMPARISONS,
  PLAN_HIGHLIGHT_FEATURES,
} from "@app/components/pro/proFeatureCatalog";
import { PRO_PLAN_PRICES } from "@app/components/pro/proPricing";
import { useFeatureFlag } from "@app/hooks/featureFlags/useFeatureFlag";

const CHECKOUT_SUSPENDED_MESSAGE =
  "現在、新規のお申し込みを停止しています。再開までしばらくお待ちください。";

// 年額を先に置いて既定の推奨プランとして読ませる。
const PLAN_ORDER: ProPlan[] = ["yearly", "monthly"];

// 訴求文言は ProFeature から引き、素の文字列で持たない。
// キーが PRO_FEATURES から消えたときに、対応する機能が無い訴求だけが残るのを防ぐ。
const FEATURE_HIGHLIGHTS = PLAN_HIGHLIGHT_FEATURES.map((feature) => ({
  feature,
  label: PRO_PAYWALL_COPY[feature].title,
  availability: FEATURE_COMPARISONS[feature].availability,
}));

const NOTICES = [
  "7 日間の無料トライアル期間中に解約すれば料金はかかりません。",
  "アプリを削除しても支払い情報は残ります。",
  "契約期間は開始日から月額（月額プラン）または1年（年額プラン）ごとに自動更新されます。",
  "解約手続き後は次回課金日まで Pro 機能を利用できます。それ以降は Pro 限定機能の表示が制限されます。",
] as const;

interface ProUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * 指定された場合、モーダル上部に「[機能名] を使うには Pro 加入が必要です」相当の
   * コンテキスト訴求を出す。未指定なら汎用文言。
   */
  trigger?: ProFeature;
  /** 初期選択させたい料金プラン。未指定なら年額。 */
  defaultPlan?: ProPlan;
}

/**
 * Pro 加入を促す共通モーダル。
 * デスクトップは中央 max-w-2xl、モバイルは bottom sheet 風に表示する。
 * CTA で Stripe Checkout（または Apple IAP / Google Play）へ遷移する。
 */
export default function ProUpgradeModal({
  isOpen,
  onClose,
  trigger,
  defaultPlan,
}: ProUpgradeModalProps) {
  // 初期値 false を明示することで、ハイドレーション直後の placement フラッシュを防ぐ。
  const isMobile = useMediaQuery("(max-width: 640px)", false);
  // defaultPlan は「初回マウント時の初期値」としてのみ扱う。呼び出し元（Provider）が open ごとに
  // key を変えて remount するため、再 open のたびに defaultPlan が再評価される。
  const [plan, setPlan] = useState<ProPlan>(defaultPlan ?? "yearly");
  const [isPending, startTransition] = useTransition();
  const [isRedirecting, setIsRedirecting] = useState(false);
  // このモーダルは全ページに常設されているため、開くまでは flag を引かない。
  const proFeatures = useFeatureFlag("pro_features", { skip: !isOpen });

  const copy = (trigger && PRO_PAYWALL_COPY[trigger]) ?? DEFAULT_PAYWALL_COPY;
  // 見出しで既に訴求している機能を一覧でも繰り返さない。
  const highlights = FEATURE_HIGHLIGHTS.filter(
    (highlight) => highlight.feature !== trigger,
  );

  const handleCheckout = () => {
    startTransition(async () => {
      const result = await startProCheckout({ plan });

      if (result.ok) {
        setIsRedirecting(true);
        window.location.assign(result.checkoutUrl);
        return;
      }

      const messages: Record<typeof result.error, string> = {
        unauthorized: "ログインしてからお試しください",
        feature_disabled: CHECKOUT_SUSPENDED_MESSAGE,
        already_subscribed: "すでに Pro に加入済みです",
        invalid_plan: "プランの指定が不正です",
        stripe_api_error:
          "決済サービスとの通信に失敗しました。しばらく経ってから再度お試しください",
        unknown: "予期せぬエラーが発生しました。時間を置いて再度お試しください",
      };
      toast.error(messages[result.error]);
    });
  };

  const ctaBusy = isPending || isRedirecting;
  // 「判定不能」で CTA を隠すと、cookie が届かないだけのユーザーに販売停止を誤って告知する。
  // 実際の決済は startProCheckout 側で改めて flag を検証しているので、ここは確定時のみ畳む。
  const isCheckoutSuspended = proFeatures === "disabled";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement={isMobile ? "bottom" : "center"}
      size={isMobile ? "full" : "2xl"}
      scrollBehavior="inside"
      className="buzz-dark"
      data-testid="pro-upgrade-modal"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-white">
          <span className="inline-block self-start rounded-full bg-[#d08000]/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-[#d08000]">
            BUZZ BASE Pro
          </span>
          <span className="text-lg">{copy.title}</span>
        </ModalHeader>

        <ModalBody className="text-gray-100">
          <p className="text-sm leading-relaxed text-gray-200">
            {copy.description}
          </p>

          <section className="mt-2">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              Pro で使える機能
            </h3>
            <ul className="space-y-2 text-sm">
              {highlights.map((highlight) => (
                <li key={highlight.feature} className="flex items-start gap-2">
                  <span>{highlight.label}</span>
                  <AvailabilityBadge availability={highlight.availability} />
                  <span className="ml-auto text-[#d08000]">✓</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              プランを選ぶ
            </h3>
            <RadioGroup
              value={plan}
              onValueChange={(value) => setPlan(value as ProPlan)}
              aria-label="Pro プラン選択"
            >
              {PLAN_ORDER.map((planType) => {
                const price = PRO_PLAN_PRICES[planType];
                return (
                  <Radio key={planType} value={planType} className="max-w-full">
                    <div className="flex w-full items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-white">
                          {price.name}
                          {price.badge ? (
                            <span className="ml-1 rounded-full bg-[#d08000] px-2 py-0.5 text-[10px] font-bold text-white">
                              {price.badge}
                            </span>
                          ) : null}
                        </p>
                        {price.note ? (
                          <p className="text-xs text-gray-400">{price.note}</p>
                        ) : null}
                      </div>
                      <p className="text-base font-bold text-white">
                        {price.amount}
                        <span className="text-xs font-normal text-gray-400">
                          {" "}
                          {price.period}
                        </span>
                      </p>
                    </div>
                  </Radio>
                );
              })}
            </RadioGroup>
          </section>

          <section className="mt-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              注意事項
            </h3>
            <ul className="space-y-1.5 text-xs leading-relaxed text-gray-300">
              {NOTICES.map((notice) => (
                <li key={notice} className="flex gap-2">
                  <span className="text-gray-500">•</span>
                  <span>{notice}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
              ご購入にあたっては
              <Link href="/termsofservice" className="text-blue-400 underline">
                利用規約
              </Link>
              、
              <Link href="/privacypolicy" className="text-blue-400 underline">
                プライバシーポリシー
              </Link>
              、
              <Link href="/tokushoho" className="text-blue-400 underline">
                特定商取引法に基づく表記
              </Link>
              をご確認ください。
            </p>
          </section>
        </ModalBody>

        <ModalFooter className="flex-col gap-2">
          {isCheckoutSuspended ? (
            <p
              role="status"
              className="w-full rounded-medium bg-sub px-3 py-3 text-center text-sm text-gray-200"
            >
              {CHECKOUT_SUSPENDED_MESSAGE}
            </p>
          ) : (
            <Button
              color="primary"
              onPress={handleCheckout}
              isDisabled={ctaBusy}
              isLoading={ctaBusy}
              fullWidth
              className="font-bold"
              data-testid="pro-upgrade-cta"
            >
              7 日間の無料トライアルを始める
            </Button>
          )}
          <Button
            variant="light"
            onPress={onClose}
            fullWidth
            className="text-white"
          >
            閉じる
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
