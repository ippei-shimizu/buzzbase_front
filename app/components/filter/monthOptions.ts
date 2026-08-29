import type { FilterOption } from "./filterTypes";

/**
 * 記録のある年月（バックエンドの available_months。"YYYY-MM" の降順）を
 * 月範囲チップの選択肢に変換する。
 *
 * 記録の無い月を選べてしまわないよう、選択肢は渡された年月だけに絞り、
 * 全12ヶ月を機械的に並べることはしない。「全て」（未選択 = 開放端）は
 * チップ側が自前で持つため、ここには含めない。
 *
 * @param months 記録のある年月（例 ["2026-06", "2026-05"]）
 */
export function monthOptionsFromRecorded(months: string[]): FilterOption[] {
  return months.map((month) => {
    const [year, monthNumber] = month.split("-");
    return { key: month, label: `${Number(year)}年${Number(monthNumber)}月` };
  });
}
