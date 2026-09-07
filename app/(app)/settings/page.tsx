import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Header from "@app/components/header/Header";
import { MailIcon } from "@app/components/icon/MailIcon";
import { NoteIcon } from "@app/components/icon/NoteIcon";
import { StatsIcon } from "@app/components/icon/StatsIcon";
import AccountSection from "./_components/AccountSection";
import DangerZone from "./_components/DangerZone";
import SettingsItem from "./_components/SettingsItem";
import SettingsSection from "./_components/SettingsSection";

export const metadata: Metadata = {
  title: "設定",
  robots: { index: false },
};

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const hasAuthCookies =
    Boolean(cookieStore.get("access-token")) &&
    Boolean(cookieStore.get("client")) &&
    Boolean(cookieStore.get("uid"));
  if (!hasAuthCookies) {
    redirect("/signup?auth_required=true");
  }

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <h1 className="text-2xl font-bold text-white">設定</h1>
            <div className="mt-6 flex flex-col gap-6">
              <AccountSection />
              <SettingsSection title="ヘルプ">
                <SettingsItem
                  href="/calculation-of-grades"
                  icon={<StatsIcon fill="#F4F4F4" width="20" height="20" />}
                  title="成績の算出方法"
                  description="打率・防御率などの計算方法について"
                />
              </SettingsSection>
              <SettingsSection title="その他">
                <SettingsItem
                  href="/contact"
                  icon={<MailIcon fill="#F4F4F4" width="20" height="20" />}
                  title="お問い合わせ"
                  description="ご意見・改善案の送付"
                />
                <SettingsItem
                  href="/privacypolicy"
                  icon={<NoteIcon fill="#F4F4F4" width="20" height="20" />}
                  title="プライバシーポリシー"
                />
                <SettingsItem
                  href="/termsofservice"
                  icon={<NoteIcon fill="#F4F4F4" width="20" height="20" />}
                  title="利用規約"
                />
                <SettingsItem
                  href="/tokushoho"
                  icon={<NoteIcon fill="#F4F4F4" width="20" height="20" />}
                  title="特定商取引法に基づく表記"
                />
              </SettingsSection>
              <DangerZone />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
