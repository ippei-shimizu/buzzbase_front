"use client";

import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BackIcon } from "@app/components/icon/BackIcon";

interface HeaderDetailActionsProps {
  /** 戻り先。省略すると履歴を1つ戻る。 */
  backHref?: string;
  /** 編集先のパス。モーダルなどページ遷移しない編集は onEditClick を使う。 */
  editHref?: string;
  onEditClick?: () => void;
  editLabel: string;
  deleteLabel: string;
  onDeleteClick: () => void;
  isDeleting?: boolean;
}

/**
 * 詳細画面のヘッダーバー。戻る（左）、編集・削除（右）を並べる。
 *
 * 削除の確認モーダルは画面ごとに文言も後処理も違うため持たず、呼び出し元に任せる。
 */
export default function HeaderDetailActions({
  backHref,
  editHref,
  onEditClick,
  editLabel,
  deleteLabel,
  onDeleteClick,
  isDeleting = false,
}: HeaderDetailActionsProps) {
  const router = useRouter();

  return (
    <header className="py-2 px-3 border-b border-b-zinc-500 fixed inset-x-0 top-[var(--top-banner-offset,0px)] bg-main z-50">
      <div className="flex items-center justify-between h-full max-w-[692px] mx-auto lg:m-[0_auto_0_28%]">
        {backHref ? (
          <Link href={backHref} aria-label="戻る">
            <BackIcon width="24" height="24" fill="" stroke="white" />
          </Link>
        ) : (
          <button type="button" onClick={() => router.back()} aria-label="戻る">
            <BackIcon width="24" height="24" fill="" stroke="white" />
          </button>
        )}
        <div className="flex items-center gap-4">
          {editHref ? (
            <Link href={editHref} aria-label={editLabel}>
              <PencilSquareIcon className="h-6 w-6 text-white" aria-hidden />
            </Link>
          ) : (
            <button type="button" onClick={onEditClick} aria-label={editLabel}>
              <PencilSquareIcon className="h-6 w-6 text-white" aria-hidden />
            </button>
          )}
          <button
            type="button"
            onClick={onDeleteClick}
            aria-label={deleteLabel}
            disabled={isDeleting}
          >
            <TrashIcon className="h-6 w-6 text-danger" aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
}
