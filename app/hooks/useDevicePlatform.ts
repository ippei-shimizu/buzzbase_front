"use client";

import { useEffect, useState } from "react";
import { detectPlatform, type DevicePlatform } from "@app/utils/devicePlatform";

/**
 * 端末プラットフォーム（ios / android / desktop）を返す。
 * SSR とクライアントの初期値を揃えるためマウント後に判定する（初期値は null）。
 * null の間は呼び出し側で全端末に安全なデフォルト（Web 導線）を表示する。
 */
export function useDevicePlatform(): DevicePlatform | null {
  const [platform, setPlatform] = useState<DevicePlatform | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlatform(detectPlatform(navigator.userAgent));
  }, []);

  return platform;
}
