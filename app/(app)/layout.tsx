import type { Metadata } from "next";
import Footer from "@app/components/footer/Footer";
import NavigationMenu from "@app/components/header/NavigationMenu";
import { AuthProvider } from "@app/contexts/useAuthContext";
import { UserProvider } from "@app/contexts/userContext";
import { Providers } from "@app/providers";

export const metadata: Metadata = {
  title: {
    template: "%s - BUZZ BASE",
    default: "BUZZ BASE | 野球の個人成績をランキング形式で共有できるアプリ",
  },
  description: "BUZZ BASE - 野球の個人成績をランキング形式で共有できるアプリ",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UserProvider>
        <Providers>
          {children}
          <NavigationMenu />
          <Footer />
        </Providers>
      </UserProvider>
    </AuthProvider>
  );
}
