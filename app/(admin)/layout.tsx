import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "BUZZ BASE Admin Dashboard",
    template: "%s - BUZZ BASE Admin",
  },
  description: "BUZZ BASE管理画面 - ユーザー管理とデータ分析",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    nosnippet: true,
    noimageindex: true,
    noarchive: true,
  },
  other: {
    "googlebot": "noindex, nofollow, nosnippet, noarchive, noimageindex",
    "bingbot": "noindex, nofollow, nosnippet, noarchive, noimageindex",
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {children}
    </div>
  );
}