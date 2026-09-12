/** ウォークスルー完了後の遷移先が指定されていないときの既定。 */
export const DEFAULT_NEXT_PATH = "/dashboard";

/**
 * クエリで渡された遷移先を、自サイト内の絶対パスに限って採用する。
 * `//evil.com` や `https://evil.com` を弾かないとオープンリダイレクトになるため、
 * 先頭が `/` かつ 2 文字目がパス区切りでないものだけを通す。
 *
 * @param raw クエリから取得した生の値
 * @returns 遷移先パス。妥当でなければ既定値。
 */
export function resolveNextPath(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/")) return DEFAULT_NEXT_PATH;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return DEFAULT_NEXT_PATH;
  return raw;
}
