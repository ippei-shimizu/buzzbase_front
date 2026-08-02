// シーズン名は「2026年 春季大会」のようにユーザーが自由に付けるため、
// 「4/12」「5月」といった他粒度のラベルより長く、X 軸で隣と重なりやすい。
const MAX_SEASON_LABEL_CHARS = 6;

/** シーズン粒度で X 軸に出すラベルの最大本数（他粒度より少なく間引く）。 */
export const MAX_SEASON_X_LABELS = 4;

/** シーズン名を X 軸に収まる長さへ丸める。丸めた場合は末尾を省略記号にする。 */
export function toSeasonAxisLabel(label: string): string {
  return label.length > MAX_SEASON_LABEL_CHARS
    ? `${label.slice(0, MAX_SEASON_LABEL_CHARS).trimEnd()}…`
    : label;
}
