/**
 * 長打率（SLG）のレベル評価ヘルパー。
 * `/column/slg-criteria` のレベルテーブルと一致させて、ツール (SlgResultCard) と
 * OG 画像生成 (/api/og/slg-card) の閾値を一元管理する。
 */

export type SlgLevelKey = "S" | "A" | "B" | "C" | "D";

export type SlgLevel = {
  key: SlgLevelKey;
  /** バッジ表示用の短いラベル */
  label: string;
  /** 結果カードに表示する説明文 */
  comment: string;
  /** OG 画像で塗るバッジ色 (16進カラー) */
  ogColor: string;
};

/**
 * NPB 基準のレベル区分。
 * 長打率は打率より概ね .100〜.200 高い数値帯になり、本塁打 / 二塁打の比率に強く影響される。
 * - S: .550〜  (歴代級・本塁打王・MVP 候補)
 * - A: .500〜.549 (中心打者・主軸クリーンアップ)
 * - B: .450〜.499 (好打者・上位レギュラー)
 * - C: .380〜.449 (リーグ平均前後)
 * - D: 〜.379 (要改善・長打力不足)
 */
export function classifySlg(slg: number): SlgLevel {
  if (slg >= 0.55) {
    return {
      key: "S",
      label: "歴代級",
      comment:
        "長打率 .550 以上。本塁打王・MVP を狙えるリーグトップクラスの長打力。",
      ogColor: "#f59e0b",
    };
  }
  if (slg >= 0.5) {
    return {
      key: "A",
      label: "中心打者",
      comment:
        "長打率 .500 以上。クリーンアップを任される強打者の標準値。年間 20 本塁打以上が見える長打力。",
      ogColor: "#fbbf24",
    };
  }
  if (slg >= 0.45) {
    return {
      key: "B",
      label: "好打者",
      comment:
        "長打率 .450 以上。上位レギュラーの長打力。アベレージと長打のバランスが取れた打者。",
      ogColor: "#facc15",
    };
  }
  if (slg >= 0.38) {
    return {
      key: "C",
      label: "平均",
      comment:
        "長打率 .380 以上。NPB のリーグ平均前後。レギュラーとして標準的な長打力。",
      ogColor: "#a3a3a3",
    };
  }
  return {
    key: "D",
    label: "要改善",
    comment:
      "長打率 .380 未満。長打力の不足。打率を維持しながら長打を増やす技術改善が求められる。",
    ogColor: "#737373",
  };
}
