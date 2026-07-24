import { type Metadata } from "next";
import Header from "@app/components/header/Header";

export const metadata: Metadata = {
  title: "新しいパスワードの設定",
  description: "「BUZZ BASE」の新しいパスワードを設定します。",
};

export default function ResetPasswordLayout({
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
