import type { Metadata } from "next";
import { Toaster } from "sonner";
import AdsenseScript from "@app/components/ad/AdsenseScript";
import Footer from "@app/components/footer/Footer";
import NavigationMenu from "@app/components/header/NavigationMenu";
import ProStatusBanners from "@app/components/pro/ProStatusBanners";
import { ProStatusProvider } from "@app/components/pro/ProStatusProvider";
import { AuthProvider } from "@app/contexts/useAuthContext";
import { UserProvider } from "@app/contexts/userContext";
import { Providers } from "@app/providers";
import GameRecordStorageCleanup from "./_components/GameRecordStorageCleanup";
import SmartAppBanner from "./_components/SmartAppBanner";

export const metadata: Metadata = {
  title: {
    template: "%s - BUZZ BASE",
    default: "BUZZ BASE | 野球の個人成績をランキング形式で共有できるアプリ",
  },
  description: "BUZZ BASE - 野球の個人成績をランキング形式で共有できるアプリ",
};

// Pro 状態の取得は ProStatusProvider 側（クライアント）に任せ、ここでは cookies() を読まない。
// 読むと配下 105 ルートすべてが dynamic 扱いになり、コラム記事やツールなど
// データ取得のない静的ページまでビルド時プリレンダリングを失う。
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UserProvider>
        <Providers>
          <ProStatusProvider>
            <AdsenseScript />
            <SmartAppBanner />
            <ProStatusBanners />
            <GameRecordStorageCleanup />
            {children}
            <NavigationMenu />
            <Footer />
            <Toaster position="top-right" richColors />
          </ProStatusProvider>
        </Providers>
      </UserProvider>
    </AuthProvider>
  );
}
