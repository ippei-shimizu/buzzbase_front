import ListBulletIcon from "@heroicons/react/24/outline/ListBulletIcon";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import Link from "next/link";
import { BallIcon } from "@app/components/icon/BallIcon";
import {
  RECORD_LIST_LABEL,
  RECORD_NOTE_LABEL,
  RECORD_PRACTICE_LABEL,
} from "./activityCopy";

const PRIMARY_CLASS =
  "flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#d08000] py-3.5 text-sm font-bold text-white";

/**
 * 面の最上段に固定する主記録導線（練習 / 野球ノート）。
 * 毎日ここから記録を始めるため、セクションカードで囲わず一番押しやすい位置に置く。
 */
export default function RecordButtonsSection() {
  return (
    <div>
      <div className="flex gap-2">
        <Link href="/practice/record" className={PRIMARY_CLASS}>
          <BallIcon fill="currentColor" width="20" height="20" />
          {RECORD_PRACTICE_LABEL}
        </Link>
        <Link href="/note/new" className={PRIMARY_CLASS}>
          <PencilSquareIcon className="h-5 w-5 shrink-0" aria-hidden />
          {RECORD_NOTE_LABEL}
        </Link>
      </div>
      <Link
        href="/practice/records"
        className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-[#d08000] bg-[#d08000]/10 py-2.5 text-[13px] font-bold text-[#d08000]"
      >
        <ListBulletIcon className="h-4 w-4 shrink-0" aria-hidden />
        {RECORD_LIST_LABEL}
      </Link>
    </div>
  );
}
