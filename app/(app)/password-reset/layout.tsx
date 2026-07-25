import { type Metadata } from "next";
import Header from "@app/components/header/Header";

export const metadata: Metadata = {
  title: "パスワードの再設定",
  description: "「BUZZ BASE」のパスワード再設定用のメールを送信します。",
  robots: {
    index: false,
  },
};

export default function PasswordResetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="h-full buzz-dark flex flex-col w-full min-h-screen bg-main">
        <main className="h-full">{children}</main>
      </div>
    </>
  );
}
