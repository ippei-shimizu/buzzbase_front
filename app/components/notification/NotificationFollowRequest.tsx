"use client";

import type { Notifications } from "@app/interface";
import { Avatar, Button } from "@heroui/react";
import Link from "next/link";
import { useState } from "react";
import { deleteNotification } from "@app/services/notificationsService";
import {
  acceptFollowRequest,
  rejectFollowRequest,
} from "@app/services/userService";

interface NotificationFollowRequestProps {
  notice: Notifications;
}

export default function NotificationFollowRequest({
  notice,
}: NotificationFollowRequestProps) {
  const [handled, setHandled] = useState(false);
  const [handledType, setHandledType] = useState<"accepted" | "rejected">();

  const handleAccept = async () => {
    if (!notice.follow_request_id) return;
    try {
      await acceptFollowRequest(notice.follow_request_id);
      await deleteNotification(notice.id);
      setHandled(true);
      setHandledType("accepted");
    } catch (_error) {}
  };

  const handleReject = async () => {
    if (!notice.follow_request_id) return;
    try {
      await rejectFollowRequest(notice.follow_request_id);
      await deleteNotification(notice.id);
      setHandled(true);
      setHandledType("rejected");
    } catch (_error) {}
  };

  if (handled) {
    return (
      <div className="grid grid-cols-[28px_1fr] gap-x-3 opacity-50">
        <Avatar
          src={
            process.env.NODE_ENV === "production"
              ? `${notice.actor_icon.url}`
              : `${process.env.NEXT_PUBLIC_API_URL}${notice.actor_icon.url}`
          }
          size="sm"
          isBordered
          className="min-w-[28px] max-w-[28px] min-h-[28px] max-h-[28px]"
        />
        <p className="text-sm text-zinc-400">
          <span className="text-base text-white font-bold">
            {notice.actor_name}
          </span>
          さんのフォローリクエストを
          {handledType === "accepted" ? "承認しました" : "拒否しました"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[28px_1fr] gap-x-3">
      <Link href={`/mypage/${notice.actor_user_id}`}>
        <Avatar
          src={
            process.env.NODE_ENV === "production"
              ? `${notice.actor_icon.url}`
              : `${process.env.NEXT_PUBLIC_API_URL}${notice.actor_icon.url}`
          }
          size="sm"
          isBordered
          className="min-w-[28px] max-w-[28px] min-h-[28px] max-h-[28px]"
        />
      </Link>
      <div className="flex flex-col items-start gap-y-1 pt-1">
        <p className="text-sm text-zinc-400">
          <Link
            href={`/mypage/${notice.actor_user_id}`}
            className="text-base text-white font-bold"
          >
            {notice.actor_name}
          </Link>
          さんからフォローリクエストが届いています
        </p>
        <div className="flex justify-start gap-x-5 w-full mt-2">
          <Button size="sm" color="primary" onPress={handleAccept}>
            承認する
          </Button>
          <Button size="sm" color="danger" onPress={handleReject}>
            拒否する
          </Button>
        </div>
      </div>
    </div>
  );
}
