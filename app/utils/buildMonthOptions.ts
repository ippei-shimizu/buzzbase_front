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
