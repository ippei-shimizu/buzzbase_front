"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Pro 状態の取得に失敗したときの表示。
 * 無料プランとして描画すると課金中のユーザーに解約されたと誤認させるため、
 * 取得できなかったことを明示する。
 *
 * トークン失効（unauthorized）のときは router.refresh() しても同じ失効 cookie を送るだけで
 * 復帰できないため、再試行ではなく再ログインへ誘導する。
 */
export default function SubscriptionLoadError({
  reason,
}: {
  reason: "unauthorized" | "error";
}) {
  const router = useRouter();

  if (reason === "unauthorized") {
    return (
      <section role="alert" className="rounded-xl bg-sub p-4">
        <h2 className="text-sm font-bold text-white">
          加入状態を取得できませんでした
        </h2>
        <p className="mt-2 text-sm leading-5 text-zic-300">
          ログインの有効期限が切れています。再度ログインしてください。ご加入内容が変更されたわけではありません。
        </p>
        <Link
          href="/signin"
          className="mt-3 inline-block rounded-lg bg-[#d08000] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          ログインし直す
        </Link>
      </section>
    );
  }

  return (
    <section role="alert" className="rounded-xl bg-sub p-4">
      <h2 className="text-sm font-bold text-white">
        加入状態を取得できませんでした
      </h2>
      <p className="mt-2 text-sm leading-5 text-zic-300">
        通信環境をご確認のうえ、再試行してください。ご加入内容が変更されたわけではありません。
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => router.refresh()}
          className="rounded-lg bg-[#d08000] px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
        >
          再試行
        </button>
        <Link
          href="/signin"
          className="text-sm font-semibold text-[#d08000] underline"
        >
          ログインし直す
        </Link>
      </div>
    </section>
  );
}
