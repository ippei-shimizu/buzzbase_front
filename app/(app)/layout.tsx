import type { Metadata } from "next";
import { Toaster } from "sonner";
import Footer from "@app/components/footer/Footer";
import NavigationMenu from "@app/components/header/NavigationMenu";
import { ProStatusProvider } from "@app/components/pro/ProStatusProvider";
import { AuthProvider } from "@app/contexts/useAuthContext";
import { UserProvider } from "@app/contexts/userContext";
import { Providers } from "@app/providers";
import SmartAppBanner from "./_components/SmartAppBanner";
import { getCachedProStatus, getProIdentityKey } from "./pro/proStatus";

export const metadata: Metadata = {
  title: {
    template: "%s - BUZZ BASE",
    default: "BUZZ BASE | 野球の個人成績をランキング形式で共有できるアプリ",
  },
  description: "BUZZ BASE - 野球の個人成績をランキング形式で共有できるアプリ",
};

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [proStatus, proIdentityKey] = await Promise.all([
    getCachedProStatus(),
    getProIdentityKey(),
  ]);

  return (
    <AuthProvider>
      <UserProvider>
        <Providers>
          {/* key を identity に紐付け、ログイン/ログアウト後の再レンダーで Provider ごと作り直す */}
          <ProStatusProvider key={proIdentityKey} initialValue={proStatus}>
            <SmartAppBanner />
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
