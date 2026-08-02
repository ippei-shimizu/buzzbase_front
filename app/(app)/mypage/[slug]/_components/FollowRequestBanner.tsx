"use client";

import type { FollowRequestBannerProps } from "@app/interface";
import { Button } from "@heroui/react";
import * as Sentry from "@sentry/nextjs";
import { useState } from "react";
import {
  acceptFollowRequest,
  rejectFollowRequest,
} from "@app/services/userService";

type BannerState = "idle" | "processing" | "accepted" | "rejected";

/**
 * 閲覧中のプロフィールの持ち主から自分宛に届いているフォローリクエストを
 * 承認 / 拒否するバナー。
 *
 * @param followRequestId 承認・拒否の対象となる relationship の ID
 * @param actorName リクエストを送ったユーザーの表示名
 * @param onHandled 処理成功後に呼ばれる。プロフィールの再検証に利用する
 */
export default function FollowRequestBanner({
  followRequestId,
  actorName,
  onHandled,
}: FollowRequestBannerProps) {
  const [bannerState, setBannerState] = useState<BannerState>("idle");

  const handleAccept = async () => {
    setBannerState("processing");
    try {
      await acceptFollowRequest(followRequestId);
      setBannerState("accepted");
      onHandled();
    } catch (error) {
      setBannerState("idle");
      Sentry.captureException(error, {
        tags: { source: "profile-follow-request-banner", action: "accept" },
      });
    }
  };

  const handleReject = async () => {
    setBannerState("processing");
    try {
      await rejectFollowRequest(followRequestId);
      setBannerState("rejected");
      onHandled();
    } catch (error) {
      setBannerState("idle");
      Sentry.captureException(error, {
        tags: { source: "profile-follow-request-banner", action: "reject" },
      });
    }
  };

  if (bannerState === "rejected") {
    return null;
  }

  if (bannerState === "accepted") {
    return (
      <div className="mb-4 rounded-lg bg-sub p-3.5">
        <p className="text-sm text-zinc-400">
          {actorName}さんのフォローリクエストを承認しました
        </p>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-lg border-1 border-yellow-500/40 bg-yellow-500/10 p-3.5">
      <p className="text-sm text-white font-bold">
        {actorName}さんからフォローリクエストが届いています
      </p>
      <div className="flex gap-x-4 mt-3">
        <Button
          size="sm"
          color="primary"
          isDisabled={bannerState === "processing"}
          onPress={handleAccept}
        >
          承認する
        </Button>
        <Button
          size="sm"
          color="danger"
          isDisabled={bannerState === "processing"}
          onPress={handleReject}
        >
          拒否する
        </Button>
      </div>
    </div>
  );
}
