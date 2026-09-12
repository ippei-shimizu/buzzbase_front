"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getProStatusResult } from "@app/(app)/pro/actions";

// Stripe Checkout 完了から Webhook がローカルの Subscription を更新するまでの待ち時間。
// 上限を設けないと Webhook が落ちた場合にタブを開いている限り叩き続けるため、
// 「体感で待てる長さ」と「Webhook の通常到達時間」の妥協点として 2 秒 × 10 回とする。
const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 10;

const SUBSCRIPTION_PATH = "/account/subscription";

type WaitState = "idle" | "polling" | "activated" | "timeout" | "unauthorized";

const CARD_LINK_CLASS =
  "inline-block rounded-lg bg-[#d08000] px-6 py-3 font-bold text-white transition hover:bg-[#b66c00]";
const CARD_SUBLINK_CLASS =
  "inline-block rounded-lg border border-gray-600 px-6 py-3 font-bold text-gray-200 transition hover:bg-[#2E2E2E]";

// 打ち切り時の文言。どちらも決済自体は成立しているので、失敗と受け取られない書き方に揃える。
const TIMEOUT_MESSAGES = {
  pending:
    "反映に時間がかかっています。決済は完了していますので、時間をおいて加入状態をご確認ください。",
  error:
    "加入状態を確認できませんでした。決済は完了していますので、時間をおいて加入状態をご確認ください。",
} as const;

/**
 * Checkout からの復帰直後に Pro 反映を待ち、反映され次第サブスクリプション管理画面へ送る。
 *
 * ポーリングは読み取り専用の getProStatusResult() だけで行い、syncProStatus() は呼ばない。
 * back の同期 API は RevenueCat の subscriber を唯一の入力とするため、RevenueCat が
 * Stripe の加入をまだ取り込んでいないこの時間帯に叩くと entitlement 無しと判定され、
 * ローカルの status を free / expired へ確定させてしまう。
 */
export default function ProActivationWaiter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Checkout 経由でのみ session_id が付く。直接開かれたときに待たせても反映される
  // 決済が存在しないため、その場合はポーリングせず案内だけ出す。
  const hasCheckoutSession = Boolean(searchParams.get("session_id"));

  const [state, setState] = useState<WaitState>(
    hasCheckoutSession ? "polling" : "idle",
  );
  // 打ち切り時に「まだ反映されていない」のか「状態を確認できなかった」のかを区別するために持つ。
  // 途中で復旧したなら通信は問題ないので、最後の試行の結果だけを反映させる。
  const [lastAttemptFailed, setLastAttemptFailed] = useState(false);

  useEffect(() => {
    if (!hasCheckoutSession) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async (attempt: number) => {
      const result = await getProStatusResult();
      if (cancelled) return;

      if (result.status === "unauthorized") {
        setState("unauthorized");
        return;
      }
      setLastAttemptFailed(result.status === "error");

      if (result.status === "ok" && result.proStatus.subscription.pro_active) {
        setState("activated");
        // 戻る操作でこの待機画面へ戻さない。決済は完了済みで再度待つ意味がない。
        router.replace(SUBSCRIPTION_PATH);
        return;
      }
      if (attempt >= MAX_ATTEMPTS) {
        setState("timeout");
        return;
      }

      timer = setTimeout(() => void poll(attempt + 1), POLL_INTERVAL_MS);
    };

    void poll(1);

    return () => {
      cancelled = true;
      if (timer !== undefined) clearTimeout(timer);
    };
  }, [hasCheckoutSession, router]);

  if (state === "activated") {
    return (
      <>
        <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          Pro 機能が使えるようになりました
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-gray-200" role="status">
          加入状態の画面へ移動します。
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href={SUBSCRIPTION_PATH} className={CARD_LINK_CLASS}>
            加入状態を確認する
          </Link>
        </div>
      </>
    );
  }

  if (state === "unauthorized") {
    return (
      <>
        <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl">
          Pro 加入手続きを受け付けました
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-gray-200" role="status">
          ログインの有効期限が切れているため、加入状態を確認できませんでした。決済は完了しています。再度ログインしてご確認ください。
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/signin" className={CARD_LINK_CLASS}>
            ログインする
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <p className="mb-3 inline-block rounded-full bg-[#d08000]/20 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#d08000]">
        ありがとうございます
      </p>
      <h1 className="mb-4 text-2xl font-bold text-white md:text-3xl">
        Pro 加入手続きを受け付けました
      </h1>

      {/* 打ち切りまで文言が入れ替わるので、live region 自体は状態をまたいで同じ要素に保つ。 */}
      <div role="status" aria-live="polite">
        {state === "polling" ? (
          <p className="mb-8 text-sm leading-relaxed text-gray-200">
            決済の反映を確認しています。そのままお待ちください。
          </p>
        ) : (
          <>
            <p className="mb-2 text-sm leading-relaxed text-gray-200">
              決済の確定後、自動的に Pro 機能がご利用いただけるようになります。
            </p>
            <p className="mb-8 text-xs text-gray-400">
              {state === "timeout"
                ? TIMEOUT_MESSAGES[lastAttemptFailed ? "error" : "pending"]
                : "反映には数分かかる場合があります。マイページから加入状態をご確認ください。"}
            </p>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href={SUBSCRIPTION_PATH} className={CARD_LINK_CLASS}>
          加入状態を確認する
        </Link>
        <Link href="/dashboard" className={CARD_SUBLINK_CLASS}>
          ダッシュボードへ
        </Link>
      </div>
    </>
  );
}
