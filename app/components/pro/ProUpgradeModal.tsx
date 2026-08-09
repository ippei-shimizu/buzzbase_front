"use client";

import type { ProFeature } from "@app/types/pro";
import type { ComponentType, SVGProps } from "react";
import {
  ArrowTrendingUpIcon,
  BookOpenIcon,
  CalendarIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  EllipsisHorizontalCircleIcon,
  FireIcon,
  FlagIcon,
  SparklesIcon,
  TrophyIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
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
  FEATURE_GROUPS,
  filterFeatureGroups,
} from "@app/components/pro/proFeatureCatalog";
import { PRO_PLAN_PRICES } from "@app/components/pro/proPricing";
import { useFeatureFlag } from "@app/hooks/featureFlags/useFeatureFlag";
import { useProStatus } from "@app/hooks/pro/useProStatus";

const CHECKOUT_SUSPENDED_MESSAGE =
  "現在、新規のお申し込みを停止しています。再開までしばらくお待ちください。";

const TRIAL_NOTICE =
  "7 日間の無料トライアル期間中に解約すれば料金はかかりません。";

// 年額を先に置いて既定の推奨プランとして読ませる。
const PLAN_ORDER: ProPlan[] = ["yearly", "monthly"];

// グループ見出しのアイコン。mobile 版（Ionicons）の見た目に合わせて選定。
const GROUP_ICONS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  成績分析: ChartBarIcon,
  振り返りレポート: SparklesIcon,
  練習と成績のつながり: ArrowTrendingUpIcon,
  野球ノート: BookOpenIcon,
  練習の記録: ClipboardDocumentListIcon,
  "予定・プラン管理": CalendarIcon,
  目標管理: TrophyIcon,
  課題管理: FlagIcon,
  練習ツール: ClockIcon,
  継続: FireIcon,
  グループ: UsersIcon,
  その他: EllipsisHorizontalCircleIcon,
};

const NOTICES_AFTER_TRIAL = [
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
  // back の trial_days_calculator と同じ判定（has_used_trial）。既に使い切ったユーザーに
  // 「7日間無料」と誤案内しないため、CTA まわりの文言はここで出し分ける。
  // 判定確定前（isLoading）は DEFAULT_PRO_STATUS（has_used_trial: false）にフォールバックし
  // isTrialEligible が常に true になるため、確定するまではトライアル訴求を一切出さない。
  const { proStatus, isLoading: isProStatusLoading } = useProStatus();
  const isTrialEligible =
    !isProStatusLoading && !proStatus.subscription.has_used_trial;

  const copy = (trigger && PRO_PAYWALL_COPY[trigger]) ?? DEFAULT_PAYWALL_COPY;
  // ハイライトカードで既に訴求している機能を比較表でも繰り返さない。
  const visibleGroups = filterFeatureGroups(FEATURE_GROUPS, trigger);

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
      size={isMobile ? undefined : "2xl"}
      scrollBehavior="inside"
      // モバイル下部タブバー（NavigationMenu.tsx、z-100）より上に重ねないと
      // フッターの CTA ボタンが隠れてしまう。
      classNames={{ wrapper: "z-[110]" }}
      className={
        isMobile
          ? "buzz-dark z-[110] m-0 h-[92dvh] max-h-[92dvh] w-full max-w-full rounded-b-none rounded-t-2xl"
          : "buzz-dark z-[110]"
      }
      hideCloseButton
      data-testid="pro-upgrade-modal"
    >
      <ModalContent>
        <ModalBody className="pt-6 text-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-wide text-white">
              BUZZ BASE
            </span>
            <span className="rounded-md bg-[#d08000] px-2.5 py-1 text-sm font-extrabold text-white">
              PRO
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="閉じる"
              className="ml-auto rounded-full p-1 text-gray-300 hover:bg-white/10"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-[#d08000]/40 bg-[#d08000]/10 p-4">
            <p className="mb-1.5 text-sm font-bold text-white">{copy.title}</p>
            <p className="text-sm leading-relaxed text-gray-200">
              {copy.description}
            </p>
          </div>

          <p className="mt-3 text-sm text-gray-400">
            すべての機能が使い放題になります
          </p>

          <section className="mt-2">
            <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wider text-gray-400">
              PRO でできること
            </h3>
            <div className="space-y-4">
              {visibleGroups.map((group) => {
                const GroupIcon = GROUP_ICONS[group.title];
                return (
                  <div key={group.title}>
                    <div className="mb-2 flex items-center gap-1.5">
                      {GroupIcon ? (
                        <GroupIcon className="h-4 w-4 text-[#d08000]" />
                      ) : null}
                      <h4 className="text-sm font-bold text-white">
                        {group.title}
                      </h4>
                    </div>
                    <div className="overflow-hidden rounded-xl bg-[#3A3A3A]">
                      <div className="flex items-center border-b border-[#4A4A4A] px-3 pb-1.5 pt-2.5">
                        <span className="flex-[1.6]" />
                        <span className="flex-[0.65] text-center text-[11px] font-bold text-gray-400">
                          無料
                        </span>
                        <span className="flex-[0.75] text-center text-[11px] font-bold text-[#d08000]">
                          PRO
                        </span>
                      </div>
                      {group.keys.map((key, index) => (
                        <div
                          key={key}
                          className={`flex items-center px-3 py-2.5 ${
                            index === group.keys.length - 1
                              ? ""
                              : "border-b border-[#333333]"
                          }`}
                        >
                          <span className="flex flex-[1.6] flex-wrap items-center gap-1.5 pr-1.5 text-sm text-gray-200">
                            {PRO_PAYWALL_COPY[key].title}
                            <AvailabilityBadge
                              availability={
                                FEATURE_COMPARISONS[key].availability
                              }
                            />
                          </span>
                          <span className="flex-[0.65] text-center text-sm text-gray-400">
                            {FEATURE_COMPARISONS[key].free}
                          </span>
                          <span className="flex-[0.75] text-center text-sm font-bold text-[#d08000]">
                            {FEATURE_COMPARISONS[key].pro}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-4 w-full">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              プランを選択
            </h3>
            <div
              role="radiogroup"
              aria-label="Pro プラン選択"
              className="flex flex-col gap-2.5"
            >
              {PLAN_ORDER.map((planType) => {
                const price = PRO_PLAN_PRICES[planType];
                const isSelected = plan === planType;
                return (
                  <button
                    key={planType}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setPlan(planType)}
                    className={`flex items-center gap-3 rounded-xl border p-3.5 text-left ${
                      isSelected
                        ? "border-[#d08000] bg-[#d08000]/10"
                        : "border-zinc-500 bg-[#424242]"
                    }`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#d08000]">
                      {isSelected ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-[#d08000]" />
                      ) : null}
                    </span>
                    <span className="flex flex-1 flex-wrap items-center gap-2">
                      <span className="text-[15px] font-bold text-white">
                        {price.name}
                      </span>
                      {price.badge ? (
                        <span className="rounded-full bg-[#d08000] px-2 py-0.5 text-[13px] font-bold text-white">
                          {price.badge}
                        </span>
                      ) : null}
                      {price.note ? (
                        <span className="w-full text-xs text-gray-400">
                          {price.note}
                        </span>
                      ) : null}
                    </span>
                    <span className="ml-2 text-base font-extrabold text-white">
                      {price.amount}
                      <span className="text-xs font-normal text-gray-400">
                        {" "}
                        {price.period}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-4">
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              注意事項
            </h3>
            <ul className="space-y-1.5 text-xs leading-relaxed text-gray-300">
              {(isTrialEligible
                ? [TRIAL_NOTICE, ...NOTICES_AFTER_TRIAL]
                : NOTICES_AFTER_TRIAL
              ).map((notice) => (
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
            <>
              {isTrialEligible ? (
                <p className="text-center text-xs text-gray-400">
                  7 日間の無料トライアル期間中に解約すれば料金はかかりません
                </p>
              ) : null}
              <Button
                color="primary"
                onPress={handleCheckout}
                isDisabled={ctaBusy}
                isLoading={ctaBusy}
                fullWidth
                className="font-bold"
                data-testid="pro-upgrade-cta"
              >
                {isProStatusLoading
                  ? "PROを始める"
                  : isTrialEligible
                    ? "7日間無料で試す"
                    : "Proに加入する"}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
