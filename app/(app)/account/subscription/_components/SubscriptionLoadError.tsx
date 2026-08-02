"use client";

import { useRouter } from "next/navigation";

/**
 * Pro 状態の取得に失敗したときの表示。
 * 無料プランとして描画すると課金中のユーザーに解約されたと誤認させるため、
 * 取得できなかったことを明示して再試行だけを促す。
 */
export default function SubscriptionLoadError() {
  const router = useRouter();

  return (
    <section role="alert" className="rounded-xl bg-sub p-4">
      <h2 className="text-sm font-bold text-white">
        加入状態を取得できませんでした
      </h2>
      <p className="mt-2 text-sm leading-5 text-zic-300">
        通信環境をご確認のうえ、再試行してください。ご加入内容が変更されたわけではありません。
      </p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="mt-3 rounded-lg bg-[#d08000] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
      >
        再試行
      </button>
    </section>
  );
}
