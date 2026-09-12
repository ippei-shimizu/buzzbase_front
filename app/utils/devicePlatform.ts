export type DevicePlatform = "ios" | "android" | "desktop";

/**
 * UA 文字列から端末プラットフォームを判定する。
 * iPadOS 13+ はデスクトップ級 UA（Macintosh）を返すため desktop 扱いになる（許容）。
 */
export function detectPlatform(userAgent: string): DevicePlatform {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "desktop";
}
