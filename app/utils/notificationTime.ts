const MINUTE_MS = 1000 * 60;
const HOUR_MS = MINUTE_MS * 60;
const DAY_MS = HOUR_MS * 24;

/**
 * 通知の日時を相対時刻の文言に変換する。
 * しきい値・文言・日付フォーマットはモバイルアプリの通知一覧と一致させている。
 *
 * @param value バックエンドが返す ISO8601 文字列（タイムゾーンオフセット付き）または Date
 * @param now 比較の基準時刻。省略時は呼び出し時点の現在時刻
 * @returns 「たった今」/「N分前」/「N時間前」/「N日前」/「YYYY/MM/DD」。日時として解釈できない場合は空文字
 */
export function formatNotificationTime(
  value: string | Date,
  now: Date = new Date(),
): string {
  const date =
    value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / MINUTE_MS);
  const diffHours = Math.floor(diffMs / HOUR_MS);
  const diffDays = Math.floor(diffMs / DAY_MS);

  if (diffMinutes < 1) return "たった今";
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;

  // 7日以上前は閲覧者のローカルタイムゾーンの暦日で表示する（UTC の暦日ではない）
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}/${month}/${day}`;
}
