/**
 * 練習メニュー登録後に戻り先へリダイレクトするための `returnTo` クエリを検証する。
 * `/` 始まりのアプリ内相対パスのみを許可し、外部ドメインへ飛ばすオープンリダイレクトを防ぐ
 * （`//evil.com` のようなプロトコル相対 URL もブラウザ上は外部遷移になるため拒否する）。
 *
 * WHATWG URL パーサーは http/https 等の special scheme で `\` を `/` と同一視するため、
 * `/\evil.com` のようなバックスラッシュ始まりの値も `//evil.com` 相当に解決されてしまう。
 * チェック前に `\` を `/` へ正規化して同じ判定に載せる。
 */
export function resolveReturnTo(value: string | undefined): string | null {
  if (!value) return null;
  const normalized = value.replace(/\\/g, "/");
  if (!normalized.startsWith("/") || normalized.startsWith("//")) return null;
  return value;
}
