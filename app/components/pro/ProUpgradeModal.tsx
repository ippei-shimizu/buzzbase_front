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
  schedule_copy_next_week: {
    title: "今週のプランを来週にまるごとコピー",
    description:
      "Pro プランなら今週登録した予定をワンタップで来週にコピーでき、プラン作りの手間を省けます。",
  },
  unlimited_menu_sets: {
    title: "メニューセットを無制限に作成",
    description:
      "よく組む練習をセットにして、予定登録や週プランでそのまま使い回せます。",
  },
  unlimited_monthly_goals: {
    title: "個人の期間目標を無制限に設定",
    description:
      "月次・週次・年間の目標を3つ以上、同時に管理できます（無料は合計2つまで）。",
  },
  season_goals: {
    title: "シーズン目標を設定",
    description:
      "1シーズンを通した中長期目標を設定し、月次目標と紐づけて追跡できます。",
  },
  tournament_goals: {
    title: "大会目標を設定",
    description:
      "特定の大会に向けた目標を設定し、その大会の成績で達成を追跡できます。",
  },
  custom_notification_messages: {
    title: "通知メッセージをカスタマイズ",
    description: "練習リマインドや目標達成通知の文言を自分好みに編集できます。",
  },
  detailed_condition_log: {
    title: "コンディションを詳しく記録",
    description:
      "体調・気分・睡眠などを細かく記録し、調子の良し悪しの傾向を把握できます。",
  },
  unlimited_improvement_themes: {
    title: "取り組む課題を無制限に",
    description:
      "複数の課題を同時に設定して、練習やノートをそれぞれの課題に束ねられます。",
  },
  correlation_insights: {
    title: "練習と成績の関係を発見",
    description:
      "素振りや睡眠と打率の傾向を、あなたのデータから自動で読み解きます。",
  },
  unlimited_reflection_templates: {
    title: "振り返りテンプレを自由に作成",
    description:
      "自分専用の問いかけテンプレをいくつでも作って、振り返りの質を高められます。",
  },
  advanced_periodic_review: {
    title: "週次・月次の振り返りレポートを受け取る",
    description:
      "練習量や成績の変化、課題別の取り組み状況、練習と成績のつながりを週末・月末に自動でまとめてお届けします。",
  },
  note_tags: {
    title: "野球ノートにタグを付けて整理",
    description:
      "Pro プランなら野球ノートにタグを付けて、後から振り返りやすく整理できます。",
  },
  multi_game_result_notes: {
    title: "1つのノートに複数の試合を紐付け",
    description:
      "Pro プランなら1つの野球ノートに複数の試合記録を紐付けて振り返れます。",
  },
  multi_improvement_theme_links: {
    title: "1つの記録に複数の課題を紐付け",
    description:
      "Pro プランなら練習記録・野球ノートに複数の課題を同時に紐付けて、取り組みをまとめて振り返れます。",
  },
  practice_menu_trend_detail: {
    title: "メニューごとの推移を詳しく見る",
    description:
      "期間を絞ったグラフや数値の内訳など、メニューごとの詳細な推移をいつでも振り返れます。",
  },
  custom_period_goals: {
    title: "カスタム期間で目標を設定",
    description:
      "「大会前3週間」のように自分で決めた期間で目標を設定し、進み具合を追跡できます。",
  },
  manual_metric_goals: {
    title: "自由指標で目標を設定",
    description:
      "球速や体重など、アプリが自動集計できない自分だけの指標も目標にして手入力で管理できます。",
  },
  shadow_swing_custom_interval: {
    title: "インターバルを自由に設定",
    description:
      "1秒〜20秒の全範囲でインターバルを設定できます。自分のテンポに合わせて素振りを鍛えましょう。",
  },
  shadow_swing_vibration: {
    title: "バイブレーションでテンポを取る",
    description:
      "音を出せない場所でもバイブレーションでインターバルを把握しながら素振りできます。",
  },
  shadow_swing_background: {
    title: "バックグラウンドでも継続実行",
    description:
      "画面ロックやアプリの切り替えで途切れず、素振りの本数と経過時間をそのまま継続できます。",
  },
  schedule_calendar_full_history: {
    title: "カレンダーを全期間閲覧",
    description:
      "先々の予定や過去の練習プランも、月を遡らずカレンダーでいつでも確認できます。",
  },
  unlimited_groups: {
    title: "グループを無制限に作成・参加",
    description:
      "Pro プランなら2つ目以降のグループも自由に作成・参加できます。チームを掛け持ちしているメンバーも安心です。",
  },
  hit_direction_average: {
    title: "方向別の打率",
    description: "打球を打った方向ごとの打率をヒートマップで可視化します。",
  },
  count_situation_average: {
    title: "カウント別の打率",
    description:
      "初球・有利カウント・追い込みなど、カウント状況別の打率がわかります。",
  },
  pitch_type_average: {
    title: "球種別の打率",
    description: "ストレートや変化球など、球種ごとの得意・苦手が分析できます。",
  },
  pitcher_faceoff_average: {
    title: "対戦投手別",
    description: "対戦した投手ごとの打撃成績を一覧で確認できます。",
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
  { icon: "📋", label: "練習メニュー / メニューセット無制限" },
  { icon: "🎯", label: "個人の期間目標（月次/週次/年間）を無制限に設定" },
  { icon: "🏆", label: "シーズン目標・大会目標の設定" },
  { icon: "📊", label: "方向別 / カウント別 / 球種別の打率分析" },
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
                    <p className="text-xs text-gray-400">月あたり ¥248</p>
                  </div>
                  <p className="text-base font-bold text-white">
                    ¥2,980
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
                    ¥300
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
