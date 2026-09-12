/**
 * 「練習と成績のつながり」で選べる入力・成績の定義。
 *
 * キーは back/app/services/insights/catalog.rb（Insights::Catalog）が唯一の正で、
 * ずれると InsightCombination の inclusion バリデーションで作成が弾かれる。
 * 並び順とラベルも mobile（constants/insight.ts）と揃える。
 */

/**
 * 練習メニューを入力に選ぶときの input_type。
 * 固定入力と違い、どのメニューかを practice_menu_id で指定する。
 */
export const PRACTICE_MENU_INPUT_TYPE = "practice_menu";

/** 固定入力（コンディション・練習量）。back の Insights::Catalog::INPUTS と一致させる。 */
export const INSIGHT_INPUT_OPTIONS: ReadonlyArray<{
  key: string;
  label: string;
}> = [
  { key: "total_swings", label: "素振りの本数" },
  { key: "practice_days", label: "練習した日数" },
  { key: "sleep_hours", label: "睡眠時間" },
  { key: "physical_level", label: "体調の良さ" },
  { key: "energy_level", label: "元気さ（疲れの少なさ）" },
];

/** 成績指標。back の Insights::Catalog::METRICS と一致させる。 */
export const INSIGHT_METRIC_OPTIONS: ReadonlyArray<{
  key: string;
  label: string;
  side: "batting" | "pitching";
}> = [
  { key: "batting_average", label: "打率", side: "batting" },
  { key: "on_base_percentage", label: "出塁率", side: "batting" },
  { key: "slugging_percentage", label: "長打率", side: "batting" },
  { key: "ops", label: "OPS", side: "batting" },
  { key: "era", label: "防御率", side: "pitching" },
  { key: "whip", label: "WHIP", side: "pitching" },
  { key: "bb_per9", label: "与四球率", side: "pitching" },
];

/**
 * 自作カードの上限。back/app/models/concerns/plan_limits.rb の
 * INSIGHT_COMBINATION_LIMIT と一致させる。
 * 機能自体が Pro 限定なので、これは「無料枠」ではなく Pro 内での件数上限であり、
 * 超過は 403 ではなく 422 で返る。
 */
export const INSIGHT_COMBINATION_LIMIT = 20;

/**
 * 作成 API が理由を返さなかったときのメッセージ。
 * 同じ組み合わせの再作成は DB の一意制約で弾かれ、本文を伴わないことがあるため
 * 重複と上限の両方を示唆する文言にしている。
 */
export const INSIGHT_COMBINATION_CREATE_FALLBACK =
  "組み合わせを作成できませんでした。同じ組み合わせがすでにあるか、上限に達している可能性があります。";

/** 削除 API が理由を返さなかったときのメッセージ。 */
export const INSIGHT_COMBINATION_DELETE_FALLBACK =
  "組み合わせを削除できませんでした。時間を置いて再度お試しください。";
