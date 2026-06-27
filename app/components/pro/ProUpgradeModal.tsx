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
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { startProCheckout, type ProPlan } from "@app/(app)/pro/actions";

interface PaywallCopy {
  title: string;
  description: string;
}

// trigger に応じた「なぜこのモーダルを開いたか」のコンテキスト訴求。
// PaywallModal 時代に画面ごとに最適化していたコピーをそのまま流用。
const PRO_PAYWALL_COPY: Record<ProFeature, PaywallCopy> = {
  no_ads: {
    title: "広告を非表示にして集中する",
    description:
      "Pro プランに加入すると、アプリ内のすべての広告が非表示になります。",
  },
  season_transition_graph: {
    title: "シーズンを跨いだ成長を可視化",
    description:
      "過去複数シーズンの成績を折れ線グラフで比較して、長期的な成長を確認できます。",
  },
  grass_full_history: {
    title: "練習履歴を全期間で確認",
    description:
      "草機能のヒートマップを全期間で表示。継続の積み重ねを実感できます。",
  },
  unlimited_practice_menus: {
    title: "練習メニューを無制限に登録",
    description:
      "Pro プランなら4つ目以降の練習メニューも自由に登録・編集できます。",
  },
  unlimited_media_uploads: {
    title: "動画・画像を無制限にアップロード",
    description: "月3点までの制限を撤廃。練習映像をいくらでも保存できます。",
  },
  media_long_term_storage: {
    title: "動画・画像を長期保管",
    description: "31日以上前にアップロードしたメディアもいつでも閲覧可能です。",
  },
  unlimited_schedules: {
    title: "自主練スケジュールを無制限に作成",
    description: "複数のメニューを並行管理して、計画的に練習できます。",
  },
  unlimited_monthly_goals: {
    title: "月次目標を複数管理",
    description: "打撃・投手・走塁など複数の目標を同時に追跡できます。",
  },
  season_goals: {
    title: "シーズン目標を設定",
    description:
      "1シーズンを通した中長期目標を設定し、月次目標と紐づけて追跡できます。",
  },
  custom_notification_messages: {
    title: "通知メッセージをカスタマイズ",
    description: "練習リマインドや目標達成通知の文言を自分好みに編集できます。",
  },
  advanced_goal_tracking: {
    title: "目標達成度を詳細に追跡",
    description:
      "達成率の推移グラフや改善ポイントの提示で、目標到達を後押しします。",
  },
  detailed_condition_log: {
    title: "コンディションを詳しく記録",
    description:
      "体調・気分・睡眠などを細かく記録し、調子の良し悪しの傾向を把握できます。",
  },
};

const DEFAULT_COPY: PaywallCopy = {
  title: "BUZZ BASE Pro でもっと深く野球を",
  description: "Pro プランで全機能のロックを解除できます。",
};

const FEATURE_HIGHLIGHTS = [
  { icon: "🚫", label: "広告非表示" },
  { icon: "📈", label: "シーズン跨ぎ成績推移グラフ" },
  { icon: "🌱", label: "草機能の全期間ヒートマップ" },
  { icon: "🎥", label: "動画・画像アップロード無制限" },
  { icon: "💾", label: "メディア長期保管" },
  { icon: "📋", label: "練習メニュー / 自主練スケジュール無制限" },
  { icon: "🎯", label: "月次目標・シーズン目標無制限" },
  { icon: "🔔", label: "カスタム通知メッセージ" },
] as const;

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

  const copy = (trigger && PRO_PAYWALL_COPY[trigger]) ?? DEFAULT_COPY;

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
              {FEATURE_HIGHLIGHTS.map((feature) => (
                <li key={feature.label} className="flex items-start gap-2">
                  <span aria-hidden>{feature.icon}</span>
                  <span>{feature.label}</span>
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
              <Radio value="yearly" className="max-w-full">
                <div className="flex w-full items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">
                      年額プラン{" "}
                      <span className="ml-1 rounded-full bg-[#d08000] px-2 py-0.5 text-[10px] font-bold text-white">
                        2 ヶ月分お得
                      </span>
                    </p>
                    <p className="text-xs text-gray-400">月あたり ¥817</p>
                  </div>
                  <p className="text-base font-bold text-white">
                    ¥9,800
                    <span className="text-xs font-normal text-gray-400">
                      {" "}
                      / 年
                    </span>
                  </p>
                </div>
              </Radio>
              <Radio value="monthly" className="max-w-full">
                <div className="flex w-full items-center justify-between gap-3">
                  <p className="font-bold text-white">月額プラン</p>
                  <p className="text-base font-bold text-white">
                    ¥980
                    <span className="text-xs font-normal text-gray-400">
                      {" "}
                      / 月
                    </span>
                  </p>
                </div>
              </Radio>
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
          </section>
        </ModalBody>

        <ModalFooter className="flex-col gap-2">
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
