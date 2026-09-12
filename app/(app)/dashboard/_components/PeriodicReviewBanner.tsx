import type { FetchResult } from "@app/services/v2/requests";
import type { PeriodicReview } from "@app/types/periodicReview";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import ExclamationCircleIcon from "@heroicons/react/24/outline/ExclamationCircleIcon";
import SparklesIcon from "@heroicons/react/24/solid/SparklesIcon";
import Link from "next/link";
import {
  BANNER_ERROR_SUB,
  BANNER_ERROR_TITLE,
  BANNER_TITLE,
  bannerUnreadLabel,
} from "@app/(app)/review/_components/periodicReviewCopy";
import { unreadReviewIds } from "@app/(app)/review/_utils/periodicReviewFormat";

interface PeriodicReviewBannerProps {
  result: FetchResult<PeriodicReview[]>;
}

const REVIEW_PATH = "/review";

/**
 * 未読の週次 / 月次レポートがあるときだけ出す誘導バナー。
 *
 * back は entitlement を持たないユーザーへ空配列を返すため、未読が存在するのは Pro のみ。
 * ここで entitlement を再判定する必要はない（無料ユーザーには件数が届かない）。
 * 取得失敗は「未読なし」と同一視せず、一覧へ行ける控えめなバナーを出す。
 */
export default function PeriodicReviewBanner({
  result,
}: PeriodicReviewBannerProps) {
  if (result.status === "error") {
    return (
      <Link
        href={REVIEW_PATH}
        className="flex items-center gap-2.5 rounded-[10px] bg-sub p-3.5 transition-opacity hover:opacity-90"
      >
        <ExclamationCircleIcon
          className="h-5 w-5 shrink-0 text-zinc-400"
          aria-hidden
        />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-zinc-300">
            {BANNER_ERROR_TITLE}
          </span>
          <span className="mt-0.5 block text-xs text-[#d08000]">
            {BANNER_ERROR_SUB}
          </span>
        </span>
      </Link>
    );
  }

  if (result.status !== "ok") return null;

  const unreadCount = unreadReviewIds(result.data).length;
  if (unreadCount === 0) return null;

  return (
    <Link
      href={REVIEW_PATH}
      className="flex items-center gap-2.5 rounded-[10px] bg-[#d08000] p-3.5 transition-opacity hover:opacity-90"
    >
      <SparklesIcon className="h-5 w-5 shrink-0 text-white" aria-hidden />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-white">
          {BANNER_TITLE}
        </span>
        <span className="mt-0.5 block text-xs text-white">
          {bannerUnreadLabel(unreadCount)}
        </span>
      </span>
      <ChevronRightIcon className="h-5 w-5 shrink-0 text-white" aria-hidden />
    </Link>
  );
}
