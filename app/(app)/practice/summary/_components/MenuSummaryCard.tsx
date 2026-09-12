import type { MenuSummaryCard as MenuSummaryCardData } from "../_utils/menuSummaryDisplay";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import Link from "next/link";
import {
  PRACTICE_CATEGORY_ICONS,
  SHADOW_SWING_ICON,
  formatTotalAmount,
} from "@app/constants/practice";
import {
  formatLastLoggedOn,
  isWeightRepsSummary,
  summaryMonthText,
  summaryTotalLabel,
  summaryTotalText,
} from "../_utils/menuSummaryDisplay";
import { ARCHIVED_MENU_NOTE, NOT_RECORDED_LABEL } from "./practiceSummaryCopy";

interface MenuSummaryCardProps {
  card: MenuSummaryCardData;
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-[10px] bg-main px-3 py-2.5">
      <p className="text-[11px] font-semibold text-zinc-400">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-[#d08000]">{value}</p>
    </div>
  );
}

/**
 * メニュー1件の積み上げカード（累計 / 今月 + 補足）。
 * 筋トレ（重さ×回数）は総挙上重量を主役にし、補足へ累計回数を回す。
 * それ以外は量そのもの（本 / 分 / km など）を主役にする。
 */
export default function MenuSummaryCard({ card }: MenuSummaryCardProps) {
  const { summary, category, href, isShadowSwing } = card;
  const Icon = isShadowSwing
    ? SHADOW_SWING_ICON
    : (PRACTICE_CATEGORY_ICONS[category ?? "other"] ??
      PRACTICE_CATEGORY_ICONS.other);
  const isWeightReps = isWeightRepsSummary(summary);
  const hasRecords = summary.days_count > 0;

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="h-5 w-5 shrink-0 text-[#d08000]" aria-hidden />
          <span className="truncate text-[15px] font-bold text-white">
            {summary.menu_name}
          </span>
        </div>
        {href ? (
          <ChevronRightIcon
            className="h-4 w-4 shrink-0 text-zinc-400"
            aria-hidden
          />
        ) : null}
      </div>

      <div className="mt-3 flex gap-2.5">
        <StatTile
          label={summaryTotalLabel(summary)}
          value={summaryTotalText(summary)}
        />
        <StatTile label="今月" value={summaryMonthText(summary)} />
      </div>

      {hasRecords ? (
        <p className="mt-2.5 text-xs text-zinc-400">
          {isWeightReps
            ? `累計 ${formatTotalAmount(summary.total_amount, "回")} ・ 記録 ${summary.days_count}日 ・ 最終 ${formatLastLoggedOn(summary.last_logged_on)}`
            : `記録 ${summary.days_count}日 ・ 最終 ${formatLastLoggedOn(summary.last_logged_on)}`}
        </p>
      ) : (
        <p className="mt-2.5 text-xs text-zinc-400">{NOT_RECORDED_LABEL}</p>
      )}

      {href === null ? (
        <p className="mt-1 text-[11px] text-zinc-500">{ARCHIVED_MENU_NOTE}</p>
      ) : null}
    </>
  );

  if (!href) {
    return <div className="rounded-xl bg-sub p-3.5">{body}</div>;
  }

  return (
    <Link
      href={href}
      aria-label={`${summary.menu_name}の推移を見る`}
      className="block rounded-xl bg-sub p-3.5 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d08000]"
    >
      {body}
    </Link>
  );
}
