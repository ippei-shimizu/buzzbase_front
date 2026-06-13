export const SITE_URL = "https://buzzbase.jp";

export const APP_STORE_URL =
  "https://apps.apple.com/jp/app/buzz-base/id6761011816";

/**
 * App Store URL に Apple 公式の `ct=` キャンペーンパラメータを付与する。
 * App Store Connect の App Analytics → Sources → Campaigns で集計するため、
 * CTA 配置箇所ごとにユニークな campaign 名を渡す。
 *
 * @param campaign 例: "cta_banner" / "smart_banner" / "tool_calculator" / "auth_overlay" など
 */
export function buildAppStoreUrl(campaign: string): string {
  return `${APP_STORE_URL}?ct=${encodeURIComponent(campaign)}`;
}
