import CheckCircleIcon from "@heroicons/react/24/outline/CheckCircleIcon";
import MegaphoneIcon from "@heroicons/react/24/outline/MegaphoneIcon";
import UserGroupIcon from "@heroicons/react/24/outline/UserGroupIcon";
import UserPlusIcon from "@heroicons/react/24/outline/UserPlusIcon";

// アイコンと通知種別の対応はモバイルアプリの通知一覧と揃えている
const EVENT_ICONS = {
  followed: { Icon: UserPlusIcon, label: "フォロー" },
  follow_request: { Icon: UserPlusIcon, label: "フォローリクエスト" },
  follow_request_accepted: {
    Icon: CheckCircleIcon,
    label: "フォローリクエスト承認",
  },
  group_invitation: { Icon: UserGroupIcon, label: "グループ招待" },
  management_notice: { Icon: MegaphoneIcon, label: "運営からのお知らせ" },
} as const;

interface NotificationEventIconProps {
  eventType: string;
  className?: string;
}

/**
 * 通知種別ごとのアイコンを描画する。
 * 未知の種別ではアイコンを出さない（文言だけで意味が通るため）。
 */
export default function NotificationEventIcon({
  eventType,
  className = "w-3.5 h-3.5 text-zinc-400",
}: NotificationEventIconProps) {
  const entry = EVENT_ICONS[eventType as keyof typeof EVENT_ICONS];
  if (!entry) return null;

  const { Icon, label } = entry;
  return <Icon role="img" aria-label={label} className={className} />;
}
