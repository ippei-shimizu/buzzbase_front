"use client";
import type { Notifications } from "@app/interface";
import { Divider, Spinner } from "@heroui/react";
import Link from "next/link";
import NotificationFollowed from "@app/components/notification/NotificationFollowed";
import NotificationFollowRequest from "@app/components/notification/NotificationFollowRequest";
import NotificationGroup from "@app/components/notification/NotificationGroup";
import NotificationManagementNotice from "@app/components/notification/NotificationManagementNotice";
import useRequireAuth from "@app/hooks/auth/useRequireAuth";
import { useNotifications } from "@app/hooks/notification/getNotifications";
import { readNotification } from "@app/services/notificationsService";

export default function NotificationItem() {
  const { notifications, isError, isLoading } = useNotifications();
  useRequireAuth();
  if (isLoading) {
    return (
      <div className="flex justify-center pt-12">
        <Spinner color="primary" />
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col w-full min-h-screen mt-6">
        <p className="text-base text-red-500 text-center mb-4">
          通知の読み込みに失敗しました。
        </p>
        <p className="text-sm text-zinc-400 text-center leading-6 mb-2">
          ユーザーIDが未設定の可能性があります。
          <br />
          以下のリンク先の内容をご確認ください。
        </p>
        <Link
          href="/notice-from-management/notice-2024-03-12"
          className="text-sm text-yellow-500 text-center border-b-1 border-yellow-500 w-fit mx-auto"
        >
          ユーザーID未設定による不具合について
        </Link>
      </div>
    );
  }

  const handleRead = async (id: number | string) => {
    if (typeof id !== "number") return;
    try {
      await readNotification(id);
    } catch (_error) {}
  };

  const renderNotification = (notice: Notifications) => {
    if (notice.event_type === "management_notice") {
      return <NotificationManagementNotice notice={notice} />;
    }
    if (
      notice.event_type === "group_invitation" &&
      notice.group_invitation === "pending"
    ) {
      return <NotificationGroup notice={notice} />;
    }
    if (notice.event_type === "follow_request") {
      return <NotificationFollowRequest notice={notice} />;
    }
    if (
      notice.event_type === "followed" ||
      notice.event_type === "follow_request_accepted"
    ) {
      return <NotificationFollowed notice={notice} onRead={handleRead} />;
    }
    return null;
  };

  return (
    <>
      <div className="py-5 pb-24 grid gap-y-5 bg-main lg:pb-6">
        {notifications?.length > 0 ? (
          notifications?.map((notice: Notifications) => {
            const content = renderNotification(notice);
            if (!content) return null;
            return (
              <div key={notice.id}>
                {content}
                <Divider className="mt-3" />
              </div>
            );
          })
        ) : (
          <>
            <p className="text-zinc-400 text-center pt-2 text-sm">
              通知はありません
            </p>
          </>
        )}
      </div>
    </>
  );
}
