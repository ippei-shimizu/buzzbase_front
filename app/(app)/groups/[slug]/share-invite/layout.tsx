import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "グループ招待コード",
  description:
    "招待コードを共有して友達をグループに招待することができます。コードをコピーまたはLINEなどで共有して、相手がアプリで入力するとグループに参加できます。",
};

interface ShareInviteLayoutProps {
  children: React.ReactNode;
}

const ShareInviteLayout = ({ children }: ShareInviteLayoutProps) => {
  return <>{children}</>;
};

export default ShareInviteLayout;
