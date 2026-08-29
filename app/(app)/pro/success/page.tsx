import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ProActivationWaiter from "./_components/ProActivationWaiter";

export const metadata: Metadata = {
  title: "Pro 加入手続きを受け付けました — BUZZ BASE",
  robots: { index: false },
};

// ハイドレーション前に描画される静的な骨組み。ProActivationWaiter が useSearchParams() を
// 使うため Suspense 境界が必須で、ここを省くとルート全体が dynamic に落ちる。
const WAITER_FALLBACK = (
  <>
    <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl">
      Pro 加入手続きを受け付けました
    </h1>
    <p className="mb-8 text-sm leading-relaxed text-gray-200">
      決済の確定後、自動的に Pro 機能がご利用いただけるようになります。
    </p>
    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
      <Link
        href="/account/subscription"
        className="inline-block rounded-lg bg-[#d08000] px-6 py-3 font-bold text-white transition hover:bg-[#b66c00]"
      >
        加入状態を確認する
      </Link>
    </div>
  </>
);

// session_id は page の searchParams ではなくクライアント側で読む。
// searchParams を受け取るとこのルートが dynamic になり、静的プリレンダリングを失う。
export default function ProSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#2E2E2E] px-6 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-700 bg-[#424242] p-8 text-center shadow-xl">
        <Suspense fallback={WAITER_FALLBACK}>
          <ProActivationWaiter />
        </Suspense>
      </div>
    </main>
  );
}
