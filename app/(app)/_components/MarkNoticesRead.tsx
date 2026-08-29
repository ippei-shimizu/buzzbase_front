"use client";

import * as Sentry from "@sentry/nextjs";
import { isAxiosError } from "axios";
import { useEffect, useRef } from "react";
import { useSWRConfig } from "swr";
import { markManagementNoticesRead } from "@app/services/notificationsService";

const NOTIFICATION_KEY_PREFIX = "/api/v1/notifications";

/**
 * 運営お知らせを既読化し、通知系の SWR キャッシュを再検証する副作用専用コンポーネント。
 * 描画対象を持たないため、既読化したい画面に配置するだけでよい。
 *
 * Header は layout ではなく各 page.tsx が個別に描画するため、遷移しても
 * NotificationBadge が remount される保証がない。Server Component 側で既読化しても
 * SWR は再フェッチせずバッジが残るため、クライアントからの明示的な mutate が必須。
 */
export default function MarkNoticesRead() {
  const { mutate } = useSWRConfig();
  const hasRequested = useRef(false);

  useEffect(() => {
    // dev の Strict Mode で effect が二重実行されるため、POST は一度だけに絞る
    if (hasRequested.current) return;
    hasRequested.current = true;

    markManagementNoticesRead()
      .then(() =>
        // 未読件数だけを再検証すると、バッジ 0 と一覧の未読表示が食い違うため
        // 通知系のキーをまとめて再検証する
        mutate(
          (key) =>
            typeof key === "string" && key.startsWith(NOTIFICATION_KEY_PREFIX),
        ),
      )
      .catch((error) => {
        if (isAxiosError(error) && error.response?.status === 401) return;
        Sentry.captureException(error, {
          tags: { source: "mark-notices-read" },
        });
      });
  }, [mutate]);

  return null;
}
