"use client";

import { useEffect } from "react";
import { markManagementNoticesRead } from "@app/services/notificationsService";

export default function MarkNoticesRead() {
  useEffect(() => {
    markManagementNoticesRead().catch(() => {
      // ログインしていない場合は無視
    });
  }, []);

  return null;
}
