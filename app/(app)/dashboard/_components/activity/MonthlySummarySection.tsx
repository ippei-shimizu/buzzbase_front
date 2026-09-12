import type { FetchResult } from "@app/services/v2/requests";
import type { MenuSummary } from "@app/types/practice";
import ChevronRightIcon from "@heroicons/react/24/outline/ChevronRightIcon";
import Link from "next/link";
import {
  isWeightRepsSummary,
  summaryMonthText,
} from "@app/(app)/practice/summary/_utils/menuSummaryDisplay";
import {
  MONTHLY_SUMMARY_LOAD_ERROR,
  MONTHLY_SUMMARY_MORE_LABEL,
  MONTHLY_SUMMARY_TITLE,
} from "./activityCopy";
import SectionCard, { SectionError } from "./SectionCard";

interface MonthlySummarySectionProps {
  summariesResult: FetchResult<MenuSummary[]>;
}

/** ハイライトに出す件数。上位だけを出して面全体のスキャンを妨げないようにする。 */
const TOP_COUNT = 3;

/**
 * 並べ替えに使う今月の量。
 * 筋トレ（重さ×回数）は回数ではなく総挙上重量で比べる（回数だけだと軽い種目が上位に来る）。
 */
const monthValue = (summary: MenuSummary): number =>
  isWeightRepsSummary(summary)
    ? (summary.this_month_volume ?? 0)
    : summary.this_month_amount;

/**
 * 今月のメニュー別積み上げハイライト（上位3件）。
 *
 * 今月の記録が1件も無ければセクションごと出さない（0 が並ぶだけで情報が無く、
 * 月初は必ずそうなるため、面の先頭付近を空カードで埋めない）。
 * ただし取得失敗は 0 件と区別してエラーを出す。
 */
export default function MonthlySummarySection({
  summariesResult,
}: MonthlySummarySectionProps) {
  if (summariesResult.status !== "ok") {
    return (
      <SectionCard title={MONTHLY_SUMMARY_TITLE}>
        <SectionError message={MONTHLY_SUMMARY_LOAD_ERROR} />
      </SectionCard>
    );
  }

  const top = summariesResult.data
    .filter((summary) => monthValue(summary) > 0)
    .sort((a, b) => monthValue(b) - monthValue(a))
    .slice(0, TOP_COUNT);

  if (top.length === 0) return null;

  return (
    <SectionCard title={MONTHLY_SUMMARY_TITLE}>
      <ul>
        {top.map((summary) => (
          <li
            key={summary.practice_menu_id ?? `name:${summary.menu_name}`}
            className="flex items-center justify-between gap-3 py-1.5"
          >
            <span className="min-w-0 flex-1 truncate text-sm text-white">
              {summary.menu_name}
            </span>
            <span className="shrink-0 text-[15px] font-extrabold text-[#d08000]">
              {summaryMonthText(summary)}
            </span>
          </li>
        ))}
      </ul>
      <Link
        href="/practice/summary"
        className="mt-3 flex items-center justify-center gap-1 text-[13px] font-semibold text-[#d08000]"
      >
        {MONTHLY_SUMMARY_MORE_LABEL}
        <ChevronRightIcon className="h-4 w-4 shrink-0" aria-hidden />
      </Link>
    </SectionCard>
  );
}
