// シーズン名は「2026年 春季大会」のようにユーザーが自由に付けるため、
// 「4/12」「5月」といった他粒度のラベルより長く、X 軸で隣と重なりやすい。
const MAX_SEASON_LABEL_CHARS = 6;

/** シーズン粒度で X 軸に出すラベルの最大本数（他粒度より少なく間引く）。 */
export const MAX_SEASON_X_LABELS = 4;

/**
 * シーズン名を X 軸に収まる長さへ丸める。丸めた場合は末尾を省略記号にする。
 * シーズン名はユーザーの自由入力で絵文字を含みうるため、String#slice ではなく
 * コードポイント単位で切り、サロゲートペアを分断しない。
 */
export function toSeasonAxisLabel(label: string): string {
  const chars = Array.from(label);
  return chars.length > MAX_SEASON_LABEL_CHARS
    ? `${chars.slice(0, MAX_SEASON_LABEL_CHARS).join("").trimEnd()}…`
    : label;
}
