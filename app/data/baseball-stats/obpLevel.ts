/**
 * 出塁率（OBP）のレベル評価ヘルパー。
 * `/column/obp-criteria` のレベルテーブルと一致させて、ツール (ObpResultCard) と
 * OG 画像生成 (/api/og/obp-card) の閾値を一元管理する。
 */

export type ObpLevelKey = "S" | "A" | "B" | "C" | "D";

export type ObpLevel = {
  key: ObpLevelKey;
  /** バッジ表示用の短いラベル */
  label: string;
  /** 結果カードに表示する説明文 */
  comment: string;
  /** OG 画像で塗るバッジ色 (16進カラー) */
  ogColor: string;
};

/**
 * NPB 基準のレベル区分。
 * 出塁率は打率より概ね .050〜.100 高い数値帯になる。
 * - S: .420〜  (歴代級)
 * - A: .380〜.419 (好打者上位・最高出塁率タイトル候補)
 * - B: .350〜.379 (中堅レギュラー上位)
 * - C: .310〜.349 (リーグ平均前後)
 * - D: 〜.309 (要改善)
 */
export function classifyObp(obp: number): ObpLevel {
  if (obp >= 0.42) {
    return {
      key: "S",
      label: "歴代級",
      comment:
        "出塁率 .420 以上。年間 0〜数人レベルの歴代級。MVP・首位打者・最高出塁率の主役。",
      ogColor: "#f59e0b",
    };
  }
  if (obp >= 0.38) {
    return {
      key: "A",
      label: "好打者上位",
      comment:
        "出塁率 .380 以上。最高出塁率タイトル争い。リードオフマンや 2 番打者として価値最高。",
      ogColor: "#fbbf24",
    };
  }
  if (obp >= 0.35) {
    return {
      key: "B",
      label: "中堅レギュラー上位",
      comment:
        "出塁率 .350 以上。リーグ平均より上、選球眼が安定している中堅レギュラー水準。",
      ogColor: "#facc15",
    };
  }
  if (obp >= 0.31) {
    return {
      key: "C",
      label: "平均",
      comment:
        "出塁率 .310 以上。NPB のリーグ平均前後。レギュラーとして標準的な出塁能力。",
      ogColor: "#a3a3a3",
    };
  }
  return {
    key: "D",
    label: "要改善",
    comment:
      "出塁率 .310 未満。選球眼または接触率の改善が必要。守備・走塁での補完が求められる。",
    ogColor: "#737373",
  };
}
