/**
 * K/BB（奪三振 ÷ 与四球）のレベル評価ヘルパー。
 * `/tools/k-bb` の結果カード (KBBResultCard) と OG 画像生成の閾値を一元管理する。
 */

export type KbbLevelKey = "S" | "A" | "B" | "C" | "D";

export type KbbLevel = {
  key: KbbLevelKey;
  /** バッジ表示用の短いラベル */
  label: string;
  /** 結果カードに表示する説明文 */
  comment: string;
  /** OG 画像で塗るバッジ色 (16進カラー) */
  ogColor: string;
};

/**
 * NPB 基準のレベル区分。
 * NPB 平均はおおむね 2.50 前後。
 * - S: 5.00〜 (リーグトップクラス)
 * - A: 4.00〜4.99 (一流)
 * - B: 3.00〜3.99 (優秀)
 * - C: 2.00〜2.99 (リーグ平均前後)
 * - D: 〜1.99 (要改善)
 */
export function classifyKbb(kbb: number): KbbLevel {
  if (kbb >= 5.0) {
    return {
      key: "S",
      label: "リーグトップ",
      comment:
        "K/BB 5.00 以上。NPB でも数えるほどの制球力と奪三振能力。最多奪三振・最優秀防御率の主役級。",
      ogColor: "#f59e0b",
    };
  }
  if (kbb >= 4.0) {
    return {
      key: "A",
      label: "一流",
      comment:
        "K/BB 4.00 以上。三振を量産しながら四球が極めて少ない。リーグを代表するエース格の制球力。",
      ogColor: "#fbbf24",
    };
  }
  if (kbb >= 3.0) {
    return {
      key: "B",
      label: "優秀",
      comment:
        "K/BB 3.00 以上。ローテーションの柱として安定して投げられる制球力。タイトル争いに絡む水準。",
      ogColor: "#facc15",
    };
  }
  if (kbb >= 2.0) {
    return {
      key: "C",
      label: "平均",
      comment:
        "K/BB 2.00 以上。NPB のリーグ平均前後。先発ローテーション維持のライン。",
      ogColor: "#a3a3a3",
    };
  }
  return {
    key: "D",
    label: "要改善",
    comment:
      "K/BB 2.00 未満。四球が多く制球力に課題あり。コントロール改善でランナー数を減らしたい。",
    ogColor: "#737373",
  };
}
