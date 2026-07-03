export interface MonthOption {
  key: string;
  label: string;
}

/**
 * 期間フィルタ用の「指定なし」選択肢（= 未指定 / 開放端）。
 * key は空文字にしない: 共有 FilterChip の onChange が falsy な key を無視するため、
 * 空文字だと「指定なし」に戻せなくなる。非空のセンチネル値を使う。
 */
export const UNSET_MONTH_OPTION: MonthOption = {
  key: "none",
  label: "指定なし",
};

/**
 * 期間フィルタ（開始年月 / 終了年月）のセレクタに渡す "YYYY-MM" 選択肢を生成する。
 * 対象年の範囲は available_years（API 由来）を優先し、無ければ当年から6年分にフォールバックする。
 * 直近の月が先頭に来るよう降順で並べ、当年は当月までしか出さない（未来月を選ばせない）。
 *
 * @param years データが存在する年のリスト（省略時は当年から過去6年）
 * @returns 先頭が「指定なし」、以降が新しい順の年月選択肢
 */
/**
 * 実際に試合を記録した年月（"YYYY-MM" の降順リスト、バックエンドの available_months）から
 * 期間フィルタの選択肢を作る。記録のある年月だけを候補に出したい画面で使う。
 * 先頭は「指定なし」。入力の並び順（新しい順）をそのまま保つ。
 *
 * @param months 記録のある年月（例 ["2026-06", "2026-05"]）
 */
export function monthOptionsFromRecorded(months: string[]): MonthOption[] {
  const options: MonthOption[] = [UNSET_MONTH_OPTION];
  for (const month of months) {
    const [year, monthNumber] = month.split("-");
    options.push({
      key: month,
      label: `${Number(year)}年${Number(monthNumber)}月`,
    });
  }
  return options;
}

export function buildMonthOptions(years?: number[]): MonthOption[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const baseYears =
    years && years.length > 0
      ? years
      : Array.from({ length: 6 }, (_, index) => currentYear - index);

  const maxYear = Math.max(...baseYears, currentYear);
  const minYear = Math.min(...baseYears, currentYear);

  const options: MonthOption[] = [UNSET_MONTH_OPTION];
  for (let year = maxYear; year >= minYear; year--) {
    const lastMonth = year >= currentYear ? currentMonth : 12;
    for (let month = lastMonth; month >= 1; month--) {
      const key = `${year}-${String(month).padStart(2, "0")}`;
      options.push({ key, label: `${year}年${month}月` });
    }
  }
  return options;
}
