import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pro 加入手続きを中断しました — BUZZ BASE",
};

export default function ProCancelPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#2E2E2E] px-6 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-700 bg-[#424242] p-8 text-center shadow-xl">
        <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          Pro 加入手続きを中断しました
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-gray-200">
          まだ料金は発生していません。
          <br />7
          日間の無料トライアル付きなので、いつでもお気軽にお試しください。
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/pro"
            className="inline-block rounded-lg bg-[#d08000] px-6 py-3 font-bold text-white transition hover:bg-[#b66c00]"
          >
            プランをもう一度見る
          </Link>
          <Link
            href="/dashboard"
            className="inline-block rounded-lg border border-gray-600 px-6 py-3 font-bold text-gray-200 transition hover:bg-[#2E2E2E]"
          >
            ダッシュボードへ
          </Link>
        </div>
      </div>
    </main>
  );
}
