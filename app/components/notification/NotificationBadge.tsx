"use client";

import { Badge } from "@heroui/react";
import Link from "next/link";
import { NotificationIcon } from "@app/components/icon/NotificationIcon";
import { useNotificationCount } from "@app/hooks/notification/useNotificationCount";

export default function NotificationBadge() {
  const { notificationCount, isLoading, isError } = useNotificationCount();
  if (isLoading) {
    <></>;
  }
  if (isError) {
    <></>;
  }
  return (
    <>
      {notificationCount?.count ? (
        <>
          <Badge
            color="danger"
            content={notificationCount?.count}
            isInvisible={false}
            shape="circle"
            size="sm"
          >
            <Link href="/mypage/notifications">
              <NotificationIcon size={24} />
            </Link>
          </Badge>
        </>
      ) : (
        <>
          <Link href="/mypage/notifications">
            <NotificationIcon size={24} />
          </Link>
        </>
      )}
    </>
  );
}
