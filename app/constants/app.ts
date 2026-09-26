export const SITE_URL = "https://buzzbase.jp";

export const APP_STORE_APP_ID = "6761011816";

/**
 * App Store Connect の「キャンペーンリンクを作成」が発行するリンクに含まれるプロバイダトークン。
 * `pt` が無いと `ct` が App Analytics のキャンペーンとして集計されない。
 */
export const APP_STORE_PROVIDER_TOKEN = "128690561";

/**
 * App Store Connect が発行するキャンペーンリンクと同じ形式の App Store URL を返す。
 * App Analytics の「獲得」→「キャンペーン」で集計するため、CTA 配置箇所ごとにユニークな campaign 名を渡す。
 * `public/images/app-store-qr.svg` は campaign="tool_qr" の戻り値を焼き込んだ静的 QR のため、出力形式を変えたら作り直す。
 *
 * @param campaign 例: "cta_banner" / "smart_banner" / "tool_calculator" / "auth_overlay" など
 */
export function buildAppStoreUrl(campaign: string): string {
  return `https://apps.apple.com/app/apple-store/id${APP_STORE_APP_ID}?pt=${APP_STORE_PROVIDER_TOKEN}&ct=${encodeURIComponent(campaign)}&mt=8`;
}
