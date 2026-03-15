import type { Metadata } from "next";
import { RAILS_API_URL } from "@app/constants/api";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const res = await fetch(
      `${RAILS_API_URL}/api/v1/users/show_user_id_data?user_id=${slug}`,
      { next: { revalidate: 3600 } },
    );
    if (res.ok) {
      const data = await res.json();
      return {
        title: `${data.user.name}さんの成績`,
        openGraph: {
          title: `${data.user.name}さんの成績 | BUZZ BASE`,
          images: [
            {
              url: `/api/og/stats-card?userId=${slug}`,
              width: 1200,
              height: 630,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          images: [`/api/og/stats-card?userId=${slug}`],
        },
      };
    }
  } catch {
    // Fall through to default metadata
  }

  return { title: "プロフィール" };
}

interface MyPageLayoutProps {
  children: React.ReactNode;
}

const MyPageLayout = ({ children }: MyPageLayoutProps) => {
  return <div className="bg-main min-h-screen">{children}</div>;
};

export default MyPageLayout;
