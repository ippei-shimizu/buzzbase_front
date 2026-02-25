import { Metadata } from "next";
import NoticeContent from "./_components/NoticeContent";

export const metadata: Metadata = {
  title: "ユーザーID未設定による不具合",
  description:
    "ユーザーIDが未設定の場合に、「マイページ画面」「通知一覧画面」が表示されない不具合が発生しております。",
};

export default function Page() {
  return <NoticeContent />;
}
