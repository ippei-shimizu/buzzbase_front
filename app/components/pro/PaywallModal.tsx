"use client";

import type { Feature, ProFeature } from "@app/types/pro";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
} from "@heroui/react";
import Link from "next/link";

interface PaywallCopy {
  title: string;
  description: string;
}

// Pro 機能ごとの paywall コピー。各機能 Issue で文言を最終調整する想定。
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
  title: "Pro 加入で BUZZ BASE をフル活用",
  description: "Pro プランで全機能のロックを解除できます。",
};

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: Feature;
}

/**
 * Pro 機能への加入を促すモーダル。
 * Pro 機能の feature を渡すと、その機能に最適化された訴求コピーを表示する。
 * 無料機能を誤って渡された場合は汎用コピーで表示する。
 */
export default function PaywallModal({
  isOpen,
  onClose,
  feature,
}: PaywallModalProps) {
  const copy =
    (PRO_PAYWALL_COPY as Record<string, PaywallCopy>)[feature] ?? DEFAULT_COPY;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      className="buzz-dark"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-white">
          {copy.title}
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-gray-200">{copy.description}</p>
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={onClose}
            className="text-white"
          >
            閉じる
          </Button>
          {/* Link を Button の中身として使うことで、Next.js の prefetch を効かせる。 */}
          <Button color="primary" as={Link} href="/pro" onPress={onClose}>
            Pro プランを見る
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
