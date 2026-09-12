/**
 * 「練習と成績のつながり」（相関インサイト）の型定義。
 * back/app/services/insights/correlation_builder.rb が返すカードと、
 * back/app/controllers/api/v2/insight_combinations_controller.rb のリクエストに対応する。
 * キー名は back の JSON をそのまま使う（snake_case のまま扱い、変換しない）。
 */

/**
 * 傾向の向き。back は「成績が良くなる側か」で判定する（防御率は下がるほど positive）。
 * サンプル週が足りないカードでは必ず "unknown" になる。
 */
export type InsightDirection = "positive" | "negative" | "unknown";

/** インサイトカード1件。おすすめ（プリセット）と自作の両方がこの形で返る。 */
export interface CorrelationInsight {
  key: string;
  /** 自作カードは組み合わせ id を持つ（削除できる）。おすすめ（プリセット）は null。 */
  id: number | null;
  title: string;
  body: string;
  /** 成績指標のキー（Insights::Catalog::METRICS）。 */
  metric: string;
  /** 入力のキー（Insights::Catalog::INPUTS もしくは "practice_menu"）。 */
  dimension: string;
  direction: InsightDirection;
  strength: string;
  /** 入力と成績が両方そろった週数。 */
  sample_weeks: number;
  /**
   * 傾向を語れるだけの週数がそろっているか。
   * false のカードは差分も向きも意味を持たないため、数値・傾向を一切表示してはならない。
   */
  sufficient: boolean;
}

/** GET /api/v2/correlation_insights のレスポンス。 */
export interface CorrelationInsightsResponse {
  insights: CorrelationInsight[];
}

/** POST /api/v2/insight_combinations に送る `insight_combination` の中身。 */
export interface InsightCombinationInput {
  input_type: string;
  /** input_type が "practice_menu" のときだけ必須。それ以外は null を送る。 */
  practice_menu_id?: number | null;
  metric: string;
}
