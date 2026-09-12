/**
 * WHIP（1イニングあたりの被安打＋与四球）のレベル評価ヘルパー。
 * `/tools/whip` の結果カード (WhipResultCard) と OG 画像生成の閾値を一元管理する。
 */

export type WhipLevelKey = "S" | "A" | "B" | "C" | "D";

export type WhipLevel = {
  key: WhipLevelKey;
  /** バッジ表示用の短いラベル */
  label: string;
  /** 結果カードに表示する説明文 */
  comment: string;
  /** OG 画像で塗るバッジ色 (16進カラー) */
  ogColor: string;
};

/**
 * NPB 基準のレベル区分。値が低いほど優秀（走者を許さない）。
 * - S: 〜0.99 (歴代級)
 * - A: 1.00〜1.09 (エース)
 * - B: 1.10〜1.24 (好投手)
 * - C: 1.25〜1.39 (リーグ平均前後)
 * - D: 1.40〜 (要改善)
 */
export function classifyWhip(whip: number): WhipLevel {
  if (whip < 1.0) {
    return {
      key: "S",
      label: "歴代級",
      comment:
        "WHIP 1.00 未満。1イニングあたりの走者数が1人を切る歴代級。沢村賞・MVP 候補水準。",
      ogColor: "#f59e0b",
    };
  }
  if (whip < 1.1) {
    return {
      key: "A",
      label: "エース",
      comment:
        "WHIP 1.00 台前半。安定して走者を出さない。リーグを代表するエースの数値。",
      ogColor: "#fbbf24",
    };
  }
  if (whip < 1.25) {
    return {
      key: "B",
      label: "好投手",
      comment: "WHIP 1.10〜1.24。ローテーションの柱として計算できる安定感。",
      ogColor: "#facc15",
    };
  }
  if (whip < 1.4) {
    return {
      key: "C",
      label: "平均",
      comment:
        "WHIP 1.25〜1.39。NPB のリーグ平均前後。先発ローテーション維持のライン。",
      ogColor: "#a3a3a3",
    };
  }
  return {
    key: "D",
    label: "要改善",
    comment:
      "WHIP 1.40 以上。被安打または与四球が多くランナーを背負いやすい。失点リスクが高い。",
    ogColor: "#737373",
  };
}
