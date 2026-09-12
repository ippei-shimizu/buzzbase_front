import { CrownIcon } from "@app/components/icon/CrownIcon";
import { UserIcon } from "@app/components/icon/UserIcon";
import ProPlanSettingsItem from "./ProPlanSettingsItem";
import SettingsItem from "./SettingsItem";
import SettingsSection from "./SettingsSection";

export default function AccountSection() {
  return (
    <SettingsSection title="アカウント">
      <SettingsItem
        href="/mypage/edit"
        icon={<UserIcon fill="#F4F4F4" width="20" height="20" />}
        title="プロフィール編集"
        description="公開設定・名前・チーム・ポジションなどを変更"
      />
      <ProPlanSettingsItem />
      <SettingsItem
        href="/account/subscription"
        icon={<CrownIcon fill="#d08000" width="20" height="20" />}
        title="サブスクリプション管理"
        description="Proプランの加入状態・解約方法を確認"
      />
    </SettingsSection>
  );
}
