"use client";

import type { FollowRequestBannerProps } from "@app/interface";
import { Button } from "@heroui/react";
import * as Sentry from "@sentry/nextjs";
import { useState } from "react";
import {
  acceptFollowRequest,
  rejectFollowRequest,
} from "@app/services/userService";

type BannerState = "idle" | "accepting" | "rejecting" | "accepted" | "rejected";

/**
 * 閲覧中のプロフィールの持ち主から自分宛に届いているフォローリクエストを
 * 承認 / 拒否するバナー。
 *
 * @param followRequestId 承認・拒否の対象となる relationship の ID
 * @param actorName リクエストを送ったユーザーの表示名
 * @param onHandled 承認・拒否が成功したときに呼ばれる
 * @param onFailed 承認・拒否が失敗したときに呼ばれる
 * @param setErrorsWithTimeout 失敗理由をページ上部のエラー表示に流す
 */
export default function FollowRequestBanner({
  followRequestId,
  actorName,
  onHandled,
  onFailed,
  setErrorsWithTimeout,
}: FollowRequestBannerProps) {
  const [bannerState, setBannerState] = useState<BannerState>("idle");

  const handleAccept = async () => {
    if (bannerState !== "idle") return;
    setBannerState("accepting");
    try {
      await acceptFollowRequest(followRequestId);
      setBannerState("accepted");
      onHandled();
    } catch (error) {
      setBannerState("idle");
      setErrorsWithTimeout(["フォローリクエストの承認に失敗しました"]);
      // 別画面で処理済みのリクエストは back が 404 を返すため、再検証で
      // バナー自体を消してもらう
      onFailed();
      Sentry.captureException(error, {
        tags: { source: "profile-follow-request-banner", action: "accept" },
      });
    }
  };

  const handleReject = async () => {
    if (bannerState !== "idle") return;
    setBannerState("rejecting");
    try {
      await rejectFollowRequest(followRequestId);
      setBannerState("rejected");
      onHandled();
    } catch (error) {
      setBannerState("idle");
      setErrorsWithTimeout(["フォローリクエストの拒否に失敗しました"]);
      onFailed();
      Sentry.captureException(error, {
        tags: { source: "profile-follow-request-banner", action: "reject" },
      });
    }
  };

  const isAccepting = bannerState === "accepting";
  const isRejecting = bannerState === "rejecting";
  const isProcessing = isAccepting || isRejecting;
  const isHandled = bannerState === "accepted" || bannerState === "rejected";

  const handledMessage = isHandled
    ? `${actorName}さんのフォローリクエストを${
        bannerState === "accepted" ? "承認しました" : "拒否しました"
      }`
    : "";

  return (
    <div
      className={
        isHandled
          ? "mb-4 rounded-lg bg-sub p-3.5"
          : "mb-4 rounded-lg border-1 border-yellow-500/40 bg-yellow-500/10 p-3.5"
      }
    >
      {/* 完了時にテキストを差し込むだけで支援技術に通知させたいので、
          ライブリージョンは idle のうちから DOM に置いておく */}
      <p role="status" aria-live="polite" className="text-sm text-zinc-400">
        {handledMessage}
      </p>
      {isHandled ? null : (
        <>
          <p className="text-sm text-white font-bold">
            {actorName}さんからフォローリクエストが届いています
          </p>
          {/* isLoading 中は HeroUI の Spinner が aria-label="Loading" を差し込んで
              アクセシブル名が変わるため、aria-label で固定する */}
          <div className="flex gap-x-4 mt-3">
            <Button
              size="sm"
              color="primary"
              aria-label="承認する"
              aria-busy={isAccepting}
              isLoading={isAccepting}
              isDisabled={isProcessing}
              onPress={handleAccept}
            >
              承認する
            </Button>
            <Button
              size="sm"
              color="danger"
              aria-label="拒否する"
              aria-busy={isRejecting}
              isLoading={isRejecting}
              isDisabled={isProcessing}
              onPress={handleReject}
            >
              拒否する
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
