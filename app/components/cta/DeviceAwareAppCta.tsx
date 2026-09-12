"use client";

import AppStoreLink from "@app/components/cta/AppStoreLink";
import AppStoreQr from "@app/components/cta/AppStoreQr";
import WebSignupLink from "@app/components/cta/WebSignupLink";
import { useDevicePlatform } from "@app/hooks/useDevicePlatform";

type Props = {
  /** GA4 `cta_location` および App Store `ct=` キャンペーン名 */
  ctaLocation: string;
  /** ツール slug。GA4 に `source_tool` として付与される */
  sourceTool?: string;
};

/**
 * 端末に応じてアプリ訴求 CTA を出し分けるクライアントコンポーネント。
 * - iOS: App Store バッジ（モバイルアプリでの登録へ）
 * - Android: Web 登録(/signup)。アプリ未提供のため必ず Web 導線にする（App Store は行き止まり）
 * - Desktop: Web 登録 ＋ App Store QR（手元の iPhone へ橋渡し）
 * 判定確定前（null）は全端末で安全な Web 導線を表示する。
 */
export default function DeviceAwareAppCta({ ctaLocation, sourceTool }: Props) {
  const platform = useDevicePlatform();

  return (
    <>
      {platform === "ios" ? (
        <AppStoreLink
          ctaLocation={ctaLocation}
          className="inline-block"
          extraEventParams={
            sourceTool ? { source_tool: sourceTool } : undefined
          }
        />
      ) : (
        <WebSignupLink
          ctaLocation={ctaLocation}
          sourceTool={sourceTool}
          className="inline-flex items-center justify-center rounded-lg bg-yellow-500 px-6 py-3 text-sm font-bold text-zinc-900 transition-colors hover:bg-yellow-400"
        />
      )}

      {platform === "desktop" ? (
        <div className="mt-3">
          <AppStoreQr />
        </div>
      ) : null}
    </>
  );
}
