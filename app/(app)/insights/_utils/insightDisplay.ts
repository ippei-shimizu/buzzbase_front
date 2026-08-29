import type {
  CorrelationInsight,
  InsightCombinationInput,
  InsightDirection,
} from "@app/types/insight";
import { PRACTICE_MENU_INPUT_TYPE } from "@app/constants/insight";

/**
 * カードに出す傾向の向き。
 *
 * sufficient:false のカードは上位群 / 下位群への分割自体が成立しておらず、差の向きに
 * 意味が無い。back も unknown を返すが、片側だけの担保だと将来の実装差で
 * 「データ不足なのに上昇の矢印」が出てしまうため、表示側でも必ず unknown へ倒す。
 */
export function insightDirection(
  insight: CorrelationInsight,
): InsightDirection {
  return insight.sufficient ? insight.direction : "unknown";
}

/**
 * データ不足カードの本文。back の Insights::CardText と同じ文面にそろえる。
 * 差の数値や「高い / 低い」を含めないことがこの関数の目的。
 */
export function insufficientInsightBody(title: string): string {
  return `${title}の関係は、もう少しデータが集まると分かります。`;
}

/**
 * カード本文。
 * sufficient:false のときは back の body をそのまま出さず、データ不足を伝える文に差し替える。
 * body には差の数値が入りうるため、フラグを信頼して素通しすると
 * 「まだ分からない差」を断定的に見せてしまう。
 */
export function insightBody(insight: CorrelationInsight): string {
  return insight.sufficient
    ? insight.body
    : insufficientInsightBody(insight.title);
}

/**
 * カード下部のメタ文言。
 * 相関であって因果ではないため、十分なデータがある場合も「必ずそうとは限りません」を必ず添える。
 * データ不足のときは週数を出さない（何週分あるかを見せると傾向の裏付けと誤読される）。
 */
export function insightMeta(insight: CorrelationInsight): string {
  return insight.sufficient
    ? `直近${insight.sample_weeks}週の傾向（必ずそうとは限りません）`
    : "データが集まると分かります";
}

/** おすすめ（プリセット）かどうか。組み合わせレコードを持たないので削除できない。 */
export function isPresetInsight(insight: CorrelationInsight): boolean {
  return insight.id === null;
}

/** 一覧を「自作」と「おすすめ」に分ける。back の並び順（おすすめ → 自作）は各配列内で保つ。 */
export function splitInsights(insights: CorrelationInsight[]): {
  customs: CorrelationInsight[];
  presets: CorrelationInsight[];
} {
  return {
    customs: insights.filter((insight) => !isPresetInsight(insight)),
    presets: insights.filter((insight) => isPresetInsight(insight)),
  };
}

/**
 * すでに同じ組み合わせのカードがあるか。
 *
 * back は user_id × input_type × practice_menu_id × metric の一意制約で重複を弾くが、
 * 練習メニュー入力はカードから対象メニューを特定できないため、ここでは判定しない
 * （固定入力だけ先回りして無駄なリクエストとエラー表示を防ぐ）。
 */
export function isDuplicateInsightCombination(
  customs: CorrelationInsight[],
  input: InsightCombinationInput,
): boolean {
  if (input.input_type === PRACTICE_MENU_INPUT_TYPE) return false;
  return customs.some(
    (insight) =>
      insight.dimension === input.input_type && insight.metric === input.metric,
  );
}
