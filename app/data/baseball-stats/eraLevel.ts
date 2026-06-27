/**
 * 防御率（ERA）のレベル評価ヘルパー。
 * `/column/era-criteria` のレベルテーブルと一致させて、ツール (EraResultCard) と
 * OG 画像生成 (/api/og/era-card) の閾値を一元管理する。
 */

export type EraLevelKey = "S" | "A" | "B" | "C" | "D";

export type EraLevel = {
  key: EraLevelKey;
  /** バッジ表示用の短いラベル */
  label: string;
  /** 結果カードに表示する説明文 */
  comment: string;
  /** OG 画像で塗るバッジ色 (16進カラー) */
  ogColor: string;
};

/**
 * /column/era-criteria の benchmarks テーブルと同じ区分:
 * - S: 〜0.99 (歴代級)
 * - A: 1.00〜1.99 (エース)
 * - B: 2.00〜2.99 (好投手)
 * - C: 3.00〜3.99 (平均)
 * - D: 4.00〜  (要改善)
 */
export function classifyEra(era: number): EraLevel {
  if (era < 1.0) {
    return {
      key: "S",
      label: "歴代級",
      comment:
        "防御率 1.00 未満。沢村賞・MVP 級の歴史的シーズン水準。NPB でも歴代でも数えるほどの偉業。",
      ogColor: "#f59e0b",
    };
  }
  if (era < 2.0) {
    return {
      key: "A",
      label: "エース",
      comment:
        "防御率 1 点台。最優秀防御率タイトル獲得圏。リーグを代表するエース。",
      ogColor: "#fbbf24",
    };
  }
  if (era < 3.0) {
    return {
      key: "B",
      label: "好投手",
      comment: "防御率 2 点台。ローテーションの柱・タイトル争いに絡む水準。",
      ogColor: "#facc15",
    };
  }
  if (era < 4.0) {
    return {
      key: "C",
      label: "平均",
      comment:
        "防御率 3 点台。NPB のリーグ平均前後。先発ローテーション維持のライン。",
      ogColor: "#a3a3a3",
    };
  }
  return {
    key: "D",
    label: "要改善",
    comment:
      "防御率 4 点台以上。先発降格 / 二軍調整のリスクあり。球種・制球力の改善余地。",
    ogColor: "#737373",
  };
}
