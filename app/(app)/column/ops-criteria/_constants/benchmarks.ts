export type OpsLevelKey = "S" | "A" | "B" | "C" | "D";

export type OpsBenchmark = {
  key: OpsLevelKey;
  level: string;
  /** 数値帯の表示用文字列 */
  ops: string;
  /** この帯に入る下限値。判定 UI で使う */
  min: number;
  pro: string;
  high: string;
  middle: string;
  color: string;
};

/**
 * カテゴリ別 OPS 目安テーブル。目安記事の表と判定 UI で同じ値を参照するため 1 箇所で持つ。
 * 閾値は計算ツールの結果カード（S: 1.000 / A: .900 / B: .800 / C: .700）と揃えている。
 */
export const OPS_BENCHMARKS: OpsBenchmark[] = [
  {
    key: "S",
    level: "S（超一流）",
    ops: "1.000以上",
    min: 1.0,
    pro: "NPB・MLB ともMVP / 首位打者争い",
    high: "甲子園を主導するスラッガー",
    middle: "全国大会で上位を狙える強打者",
    color: "text-amber-400",
  },
  {
    key: "A",
    level: "A（中心打者）",
    ops: ".900〜.999",
    min: 0.9,
    pro: "リーグ代表クラスのクリーンアップ",
    high: "強豪校の主軸打者",
    middle: "シニア・ボーイズ全国レベルの4番",
    color: "text-yellow-400",
  },
  {
    key: "B",
    level: "B（好打者）",
    ops: ".800〜.899",
    min: 0.8,
    pro: "クリーンアップを任される好打者",
    high: "強豪校レギュラー上位／地方大会の主軸",
    middle: "シニア・ボーイズの主軸打者",
    color: "text-yellow-500",
  },
  {
    key: "C",
    level: "C（平均）",
    ops: ".700〜.799",
    min: 0.7,
    pro: "リーグ平均前後・安定したレギュラー",
    high: "公立校でも十分レギュラーレベル",
    middle: "シニア・ボーイズで安定したレギュラー",
    color: "text-zinc-300",
  },
  {
    key: "D",
    level: "D（要改善）",
    ops: ".700未満",
    min: 0,
    pro: "出場機会が減るリスクあり",
    high: "出塁・長打のどちらかを伸ばす必要",
    middle: "個別の課題（打撃フォーム等）を見直し",
    color: "text-zinc-500",
  },
];

/**
 * OPS の値からカテゴリ別目安の行を返す。
 * @param ops 判定したい OPS。負数や NaN は D 扱いにせず null を返す
 */
export function findOpsBenchmark(ops: number): OpsBenchmark | null {
  if (Number.isNaN(ops) || ops < 0) return null;
  return OPS_BENCHMARKS.find((row) => ops >= row.min) ?? null;
}
