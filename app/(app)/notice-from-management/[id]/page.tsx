import { notFound } from "next/navigation";
import NoticeBreadcrumb from "@app/(app)/notice-from-management/notice-breadcrumb";
import Header from "@app/components/header/Header";
import { getPublishedNotice } from "../actions";
import NoticeDetailContent from "./_components/NoticeDetailContent";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NoticeDetailPage(props: PageProps) {
  const { id } = await props.params;
  const noticeId = parseInt(id, 10);

  if (isNaN(noticeId)) {
    notFound();
  }

  const notice = await getPublishedNotice(noticeId);

  if (!notice) {
    notFound();
  }

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <div className="h-full bg-main">
        <Header />
        <main className="h-full pb-16 w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
          <div className="px-4 pt-20 lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:px-6 lg:pb-10">
            <NoticeBreadcrumb />
            <NoticeDetailContent
              title={notice.title}
              body={notice.body}
              publishedAt={notice.published_at}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
