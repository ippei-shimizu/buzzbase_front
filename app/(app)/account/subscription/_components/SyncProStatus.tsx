"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { syncProStatus } from "@app/(app)/pro/actions";

type SyncResultState = "idle" | "synced" | "failed";

const RESULT_MESSAGES: Record<Exclude<SyncResultState, "idle">, string> = {
  synced: "最新の加入状態を取得しました。",
  failed:
    "加入状態を取得できませんでした。時間をおいて再度お試しください。ご契約の内容は変わっていません。",
};

/**
 * 決済プロバイダ側の状態を取り込み直し、この画面の表示を最新化するボタン。
 *
 * webhook の取りこぼし・遅延で表示が実際の契約とずれたときの復旧手段として、
 * 加入媒体を問わず提供する。back の同期 API は ios / android / web いずれの加入も
 * RevenueCat の subscriber から再構築するため、Stripe 加入者にとっても no-op ではない。
 */
export default function SyncProStatus() {
  const router = useRouter();
  const [result, setResult] = useState<SyncResultState>("idle");
  const [isSyncing, startTransition] = useTransition();

  const handleSync = () => {
    setResult("idle");
    startTransition(async () => {
      const synced = await syncProStatus();
      if (synced === null) {
        setResult("failed");
        return;
      }
      setResult("synced");
      // 同期後の状態は Server Component 側で描画しているので、再取得させる。
      router.refresh();
    });
  };

  return (
    <section aria-label="加入状態の再同期" className="rounded-xl bg-sub p-4">
      <p className="text-sm leading-5 text-zic-300">
        ご加入直後や決済内容の変更直後は、表示への反映に時間がかかる場合があります。実際のご契約と表示が異なるときは再同期してください。
      </p>
      <button
        type="button"
        onClick={handleSync}
        disabled={isSyncing}
        className="mt-3 rounded-lg border border-[#d08000] px-4 py-2 text-sm font-bold text-[#d08000] transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {isSyncing ? "同期中…" : "状態を再同期"}
      </button>
      {result === "idle" ? null : (
        <p
          role="status"
          className={`mt-3 rounded-lg p-3 text-sm leading-5 text-white ${
            result === "failed" ? "bg-[#7f1d1d]" : "bg-[#065f46]"
          }`}
        >
          {RESULT_MESSAGES[result]}
        </p>
      )}
    </section>
  );
}
