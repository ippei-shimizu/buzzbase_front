"use client";

import type { FollowButtonProps, FollowStatus } from "@app/interface";
import { Button } from "@heroui/react";
import { useState } from "react";
import { useAuthContext } from "@app/contexts/useAuthContext";
import { userFollow, userUnFollow } from "@app/services/userService";

export default function FollowButton({
  userId,
  initialFollowStatus,
  isPrivate,
  setErrorsWithTimeout,
}: FollowButtonProps) {
  const [followStatus, setFollowStatus] =
    useState<FollowStatus>(initialFollowStatus);
  const { isLoggedIn } = useAuthContext();

  const handleFollow = async () => {
    if (!isLoggedIn) {
      setErrorsWithTimeout(["ログインしてください"]);
      return;
    }
    if (followStatus === "following" || followStatus === "pending") {
      await userUnFollow(userId);
      setFollowStatus("none");
    } else {
      const response = await userFollow(userId);
      if (isPrivate || response?.follow_status === "pending") {
        setFollowStatus("pending");
      } else {
        setFollowStatus("following");
      }
    }
  };

  const buttonLabel = () => {
    switch (followStatus) {
      case "following":
        return "フォロー中";
      case "pending":
        return "リクエスト済み";
      default:
        return "フォローする";
    }
  };

  const buttonStyle = () => {
    switch (followStatus) {
      case "following":
        return "text-zinc-300 bg-transparent rounded-full text-xs border-1 border-zinc-400 w-full h-auto p-1.5 font-bold flex-1";
      case "pending":
        return "text-zinc-300 bg-transparent rounded-full text-xs border-1 border-yellow-500 w-full h-auto p-1.5 font-bold flex-1";
      default:
        return "text-main bg-zinc-200 rounded-full text-xs border-1 border-zinc-400 w-full h-auto p-1.5 font-bold flex-1";
    }
  };

  return (
    <Button onPress={handleFollow} className={buttonStyle()}>
      {buttonLabel()}
    </Button>
  );
}
