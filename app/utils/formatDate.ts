/**
 * "YYYY-MM-DD" を "YYYY年M月D日" 表記に変換する。
 * 月・日はゼロ埋めしない。パースできない文字列はそのまま返す（mobile の formatJaFullDate と同じ挙動）。
 */
export function formatJaFullDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${year}年${month}月${day}日`;
}

/** 日付入力（`type="date"`）が要求する `YYYY-MM-DD` をローカル時刻で組み立てる。 */
export function todayString(now: Date = new Date()): string {
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}
