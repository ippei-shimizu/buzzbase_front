"use client";

import { useEffect, useRef } from "react";
import { useSWRConfig } from "swr";
import { NOTIFICATION_COUNT_KEY } from "@app/hooks/notification/useNotificationCount";
import { markManagementNoticesRead } from "@app/services/notificationsService";

/**
 * 運営お知らせを既読化し、ヘッダーの未読バッジを再検証する副作用専用コンポーネント。
 * 描画対象を持たないため、既読化したい画面に配置するだけでよい。
 */
export default function MarkNoticesRead() {
  const { mutate } = useSWRConfig();
  const hasRequested = useRef(false);

  useEffect(() => {
    // Strict Mode の再マウントや mutate の参照変化で二重に POST しない
    if (hasRequested.current) return;
    hasRequested.current = true;

    markManagementNoticesRead()
      .then(() => mutate(NOTIFICATION_COUNT_KEY))
      .catch(() => {
        // ログインしていない場合は無視
      });
  }, [mutate]);

  return null;
}
