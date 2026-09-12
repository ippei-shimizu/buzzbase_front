"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  cancelWebSubscription,
  type CancelWebSubscriptionError,
} from "../actions";

const ERROR_MESSAGES: Record<CancelWebSubscriptionError, string> = {
  unauthorized:
    "ログインの有効期限が切れています。再度ログインしてからお試しください。",
  no_active_subscription:
    "解約できるご契約が見つかりませんでした。すでに解約手続きが完了しているか、別の媒体でご加入の可能性があります。",
  stripe_api_error:
    "決済サービスとの通信に失敗しました。時間をおいて再度お試しください。課金は継続しています。",
  unknown: "解約手続きに失敗しました。時間をおいて再度お試しください。",
};

/**
 * Web（Stripe）加入者がこの画面から解約するためのボタンと確認ダイアログ。
 * back は cancel_at_period_end で受け付けるため、解約後も次回更新日までは Pro 機能を使える。
 * その旨を確認時と完了時の両方で明示する。
 */
export default function CancelWebSubscription() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<CancelWebSubscriptionError | null>(null);
  const [isCancelling, startTransition] = useTransition();

  const openDialog = () => {
    setIsDone(false);
    setError(null);
    setIsOpen(true);
  };

  const closeDialog = () => {
    if (isCancelling) return;
    setIsOpen(false);
  };

  const handleCancel = () => {
    setError(null);
    startTransition(async () => {
      const result = await cancelWebSubscription();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setIsDone(true);
      // 解約申請は Stripe 側で受理済み。反映済みの加入状態を Server Component 側から取り直す。
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="mt-3 rounded-lg border border-[#ef4444] px-4 py-2 text-sm font-bold text-[#ef4444] transition-opacity hover:opacity-80"
      >
        この画面で解約する
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onKeyDown={(event) => {
            if (event.key === "Escape") closeDialog();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={
              isDone ? "解約申請を受け付けました" : "Pro プランの解約"
            }
            className="w-full max-w-[400px] rounded-xl bg-main p-6"
          >
            {isDone ? (
              <>
                <h3 className="text-base font-bold text-white">
                  解約申請を受け付けました
                </h3>
                <p className="mt-3 text-sm leading-6 text-zic-300">
                  次回更新日まで引き続き Pro 機能をご利用いただけます。
                </p>
                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="rounded-lg bg-[#d08000] px-4 py-2 text-sm font-bold text-white"
                  >
                    閉じる
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-white">
                  Pro プランの解約
                </h3>
                <p className="mt-3 text-sm leading-6 text-zic-300">
                  解約すると次回更新日以降は Pro
                  機能が利用できなくなります。次回更新日までは引き続きご利用いただけます（日割りでの返金は行いません）。
                </p>
                {error ? (
                  <p
                    role="alert"
                    className="mt-3 rounded-lg bg-[#7f1d1d] p-3 text-sm leading-5 text-white"
                  >
                    {ERROR_MESSAGES[error]}
                  </p>
                ) : null}
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeDialog}
                    disabled={isCancelling}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    閉じる
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isCancelling}
                    className="rounded-lg bg-[#d08000] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {isCancelling ? "解約手続き中…" : "解約する"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
