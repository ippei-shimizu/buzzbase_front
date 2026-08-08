/**
 * 練習メニュー登録後に戻り先へリダイレクトするための `returnTo` クエリを検証する。
 * `/` 始まりのアプリ内相対パスのみを許可し、外部ドメインへ飛ばすオープンリダイレクトを防ぐ
 * （`//evil.com` のようなプロトコル相対 URL もブラウザ上は外部遷移になるため拒否する）。
 */
export function resolveReturnTo(value: string | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}
