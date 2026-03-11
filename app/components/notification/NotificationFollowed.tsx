"use client";

import type { Notifications } from "@app/interface";
import { Avatar } from "@heroui/react";
import Link from "next/link";

interface NotificationFollowedProps {
  notice: Notifications;
  onRead: (id: number | string) => void;
}

export default function NotificationFollowed({
  notice,
  onRead,
}: NotificationFollowedProps) {
  return (
    <div
      className={`grid grid-cols-[28px_1fr] gap-x-3 ${
        notice.read_at ? "opacity-30" : ""
      }`}
    >
      <Link
        href={`/mypage/${notice.actor_user_id}`}
        onClick={() => onRead(notice.id)}
      >
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
      <div className="flex flex-col items-start gap-y-1">
        <p className="text-sm text-zinc-400">
          <Link
            href={`/mypage/${notice.actor_user_id}`}
            className="text-base text-white font-bold"
            onClick={() => onRead(notice.id)}
          >
            {notice.actor_name}
          </Link>
          さんから
          <span className="text-base text-white font-bold">
            {notice.group_name}
          </span>
          {notice.event_type === "follow_request_accepted"
            ? "フォローリクエストが承認されました"
            : "フォローされました"}
        </p>
      </div>
    </div>
  );
}
