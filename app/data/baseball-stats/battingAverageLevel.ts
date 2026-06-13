/**
 * 打率（AVG）のレベル評価ヘルパー。
 * `/column/batting-average-criteria` のレベルテーブルと一致させて、ツール
 * (BattingAverageResultCard) と OG 画像生成 (/api/og/batting-average-card) の
 * 閾値を一元管理する。
 */

export type BattingAverageLevelKey = "S" | "A" | "B" | "C" | "D";

export type BattingAverageLevel = {
  key: BattingAverageLevelKey;
  /** バッジ表示用の短いラベル */
  label: string;
  /** 結果カードに表示する説明文 */
  comment: string;
  /** OG 画像で塗るバッジ色 (16進カラー) */
  ogColor: string;
};

/**
 * NPB 基準のレベル区分。
 * - S: .350〜 (首位打者・歴代級)
 * - A: .300〜.349 (好打者・クリーンアップ)
 * - B: .280〜.299 (中堅レギュラー)
 * - C: .250〜.279 (リーグ平均)
 * - D: 〜.249 (要改善)
 */
export function classifyBattingAverage(avg: number): BattingAverageLevel {
  if (avg >= 0.35) {
    return {
      key: "S",
      label: "歴代級",
      comment:
        "打率 .350 以上。首位打者の最上位ライン。シーズン通算で達成できるのは数年に数人レベルの偉業。",
      ogColor: "#f59e0b",
    };
  }
  if (avg >= 0.3) {
    return {
      key: "A",
      label: "好打者",
      comment:
        "打率 .300 以上。3 割打者の証。クリーンアップを任せられる一流レベル。",
      ogColor: "#fbbf24",
    };
  }
  if (avg >= 0.28) {
    return {
      key: "B",
      label: "中堅レギュラー",
      comment: "打率 .280 以上。リーグ平均より上の中堅レギュラー水準。",
      ogColor: "#facc15",
    };
  }
  if (avg >= 0.25) {
    return {
      key: "C",
      label: "平均",
      comment: "打率 .250 以上。NPB のリーグ平均前後。レギュラーとして標準的。",
      ogColor: "#a3a3a3",
    };
  }
  return {
    key: "D",
    label: "要改善",
    comment:
      "打率 .250 未満。打撃面での貢献が低く、守備・走塁での補完が求められる水準。",
    ogColor: "#737373",
  };
}
