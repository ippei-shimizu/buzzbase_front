import { type Metadata } from "next";
import { Suspense } from "react";
import ProfileSetup from "./_components/ProfileSetup";

export const metadata: Metadata = {
  title: "プロフィール設定",
  description: "所属チームやポジションを登録して、試合の記録をはじめましょう。",
  robots: {
    index: false,
  },
};

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={null}>
      <ProfileSetup />
    </Suspense>
  );
}
