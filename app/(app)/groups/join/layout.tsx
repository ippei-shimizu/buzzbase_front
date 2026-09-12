import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "招待コードで参加",
  description:
    "受け取った招待コードを入力して、グループに参加することができます。",
};

interface JoinLayoutProps {
  children: React.ReactNode;
}

const JoinLayout = ({ children }: JoinLayoutProps) => {
  return <>{children}</>;
};

export default JoinLayout;
