/**
 * 率系の成績値（打率・出塁率・OPS等）をフォーマットする
 * 1未満の場合は先頭の0を除去（例: 0.583 → .583）
 */
export function formatRate(value: number): string {
  const formatted = value.toFixed(3);
  if (value !== 0 && value < 1 && value > -1) {
    return formatted.replace(/^0/, "");
  }
  return formatted;
}

/**
 * 勝率など小数2桁の率系成績値をフォーマットする
 * 1未満の場合は先頭の0を除去（例: 0.67 → .67）
 */
export function formatRate2(value: number): string {
  const formatted = value.toFixed(2);
  if (value !== 0 && value < 1 && value > -1) {
    return formatted.replace(/^0/, "");
  }
  return formatted;
}

/**
 * 防御率・WHIP・K/9等の投手指標をフォーマットする
 * 先頭の0を除去しない（例: 0.50 → 0.50）
 */
export function formatEra(value: number): string {
  return value.toFixed(2);
}

/**
 * 打率・長打率などを野球慣用の「.XXX」表示にする。
 * at_bats が 0 のときは未計算を示す ".---" を返す。
 * 例: formatBattingAverage(0.333, 6) → ".333" / formatBattingAverage(1.0, 4) → "1.000"
 */
export function formatBattingAverage(ratio: number, atBats: number): string {
  if (atBats === 0) return ".---";
  return ratio.toFixed(3).replace(/^0\./, ".");
}

/**
 * 率系指標を母数ガード付きで「.XXX」表示にする。
 * 母数が 0 以下のときは ".---" を返す（出塁率の母数 AB+BB+HBP+SF など）。
 */
export function formatStatRate(value: number, denominator: number): string {
  if (denominator <= 0) return ".---";
  return value.toFixed(3).replace(/^0\./, ".");
}
