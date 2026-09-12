"use client";

import type { PlanType } from "@app/types/pro";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { syncProStatus } from "@app/(app)/pro/actions";
import { changeProPlan, type ChangeProPlanError } from "../actions";

// 課金に関わる操作なので、どの失敗でも現状維持であることを毎回明示する。
// いずれの分岐も back がプラン変更を実行する前か Stripe が拒否したあとで、
// 契約は元のまま残っている。
const ERROR_MESSAGES: Record<ChangeProPlanError, string> = {
  unauthorized:
    "ログインの有効期限が切れています。再度ログインしてからお試しください。プランは変更されていません。",
  no_active_subscription:
    "変更できるご契約が見つかりませんでした。すでに解約手続きが完了しているか、別の媒体でご加入の可能性があります。プランは変更されていません。",
  // 送信できるのは現プランの反対側だけなので、この分岐は契約データの不整合でしか起きない。
  // 再試行しても同じ結果になるため、再試行ではなく問い合わせへ倒す。
  invalid_plan:
    "このプランへは変更できません。お手数ですがお問い合わせください。プランは変更されていません。",
  stripe_api_error:
    "決済サービスとの通信に失敗しました。時間をおいて再度お試しください。プランは変更されていません。",
  unknown:
    "プラン変更に失敗しました。時間をおいて再度お試しください。プランは変更されていません。",
};

interface PlanChangeContent {
  buttonLabel: string;
  dialogTitle: string;
  /**
   * 確認ダイアログで日割りの扱いを説明する文言。
   * 課金周期が変わる変更なので Stripe は請求日を変更時点にリセットし、新プランを即時請求する。
   * proration_behavior: create_prorations により差額は「返金」ではなく
   * クレジット（請求への充当）として処理されるため、増額方向と減額方向で説明が変わる。
   */
  description: string;
}

// 金額は /pro の料金表を単一の情報源とし、ここでは重複させない（改定時の食い違いを避ける）。
const PLAN_CHANGE_CONTENT: Record<PlanType, PlanChangeContent> = {
  yearly: {
    buttonLabel: "年額プランに変更する",
    dialogTitle: "年額プランに変更",
    description:
      "年額プランに変更すると、請求サイクルが変更時点から 1 年周期に切り替わり、年額料金がすぐに請求されます。お支払い済みの月額プランの未使用期間分は日割りで計算され、その請求から差し引かれます。",
  },
  monthly: {
    buttonLabel: "月額プランに変更する",
    dialogTitle: "月額プランに変更",
    description:
      "月額プランに変更すると、請求サイクルが変更時点から 1 か月周期に切り替わります。お支払い済みの年額プランの未使用期間分は日割りでクレジットとして計上され、次回以降のお支払いに充当されます（現金でのご返金は行いません）。クレジットを使い切るまでは請求額が 0 円になる場合があります。",
  },
};

/**
 * Web（Stripe）加入者がこの画面から月額↔年額を切り替えるためのボタンと確認ダイアログ。
 * 変更先は現在のプランの反対側に一意に決まるため、選択 UI は持たない。
 */
export default function ChangeWebPlan({
  currentPlan,
}: {
  currentPlan: PlanType;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isSyncPending, setIsSyncPending] = useState(false);
  const [error, setError] = useState<ChangeProPlanError | null>(null);
  const [isChanging, startTransition] = useTransition();

  const targetPlan: PlanType = currentPlan === "monthly" ? "yearly" : "monthly";
  const content = PLAN_CHANGE_CONTENT[targetPlan];

  const openDialog = () => {
    setIsDone(false);
    setIsSyncPending(false);
    setError(null);
    setIsOpen(true);
  };

  const closeDialog = () => {
    if (isChanging) return;
    setIsOpen(false);
  };

  const handleChange = () => {
    setError(null);
    startTransition(async () => {
      const result = await changeProPlan(targetPlan);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // back のプラン変更 API は Stripe に委譲するだけでローカルの expires_at を
      // 書き戻さない。周期が変わると次回更新日も動くため、同期しないと旧プランの
      // 期限のまま pro_active が落ち、支払い済みの Pro 機能を失う。
      const synced = await syncProStatus();
      setIsSyncPending(synced === null);
      setIsDone(true);
      // Stripe 側は受理済み。反映済みの加入状態を Server Component 側から取り直す。
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="mt-3 rounded-lg border border-[#d08000] px-4 py-2 text-sm font-bold text-[#d08000] transition-opacity hover:opacity-80"
      >
        {content.buttonLabel}
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
              isDone ? "プラン変更を受け付けました" : content.dialogTitle
            }
            className="w-full max-w-[400px] rounded-xl bg-main p-6"
          >
            {isDone ? (
              <>
                <h3 className="text-base font-bold text-white">
                  プラン変更を受け付けました
                </h3>
                <p className="mt-3 text-sm leading-6 text-zic-300">
                  日割りの差額は決済サービスから届く請求書メールでご確認ください。
                </p>
                {isSyncPending ? (
                  <p className="mt-3 text-sm leading-6 text-zic-300">
                    この画面の表示に反映されるまで少し時間がかかる場合があります。
                  </p>
                ) : null}
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
                  {content.dialogTitle}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zic-300">
                  {content.description}
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
                    disabled={isChanging}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    閉じる
                  </button>
                  <button
                    type="button"
                    onClick={handleChange}
                    disabled={isChanging}
                    className="rounded-lg bg-[#d08000] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {isChanging ? "変更手続き中…" : "変更する"}
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
