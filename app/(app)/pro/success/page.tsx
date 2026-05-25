import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pro 加入手続きを受け付けました — BUZZ BASE",
  robots: { index: false },
};

export default function ProSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#2E2E2E] px-6 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-700 bg-[#424242] p-8 text-center shadow-xl">
        <p className="mb-3 inline-block rounded-full bg-[#d08000]/20 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#d08000]">
          ありがとうございます
        </p>
        <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          Pro 加入手続きを受け付けました
        </h1>
        <p className="mb-2 text-sm leading-relaxed text-gray-200">
          決済の確定後、自動的に Pro 機能がご利用いただけるようになります。
        </p>
        <p className="mb-8 text-xs text-gray-400">
          反映には数分かかる場合があります。マイページから加入状態をご確認ください。
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/account/subscription"
            className="inline-block rounded-lg bg-[#d08000] px-6 py-3 font-bold text-white transition hover:bg-[#b66c00]"
          >
            加入状態を確認する
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
