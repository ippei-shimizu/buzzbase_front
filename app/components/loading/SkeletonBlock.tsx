"use client";

import { Skeleton } from "@heroui/react";

interface SkeletonBlockProps {
  /** 幅・高さ等のサイズ指定（例: "h-24 w-full"）。 */
  className: string;
  rounded?: string;
}

/** サイズ指定した矩形をプレースホルダとして表示する、`loading.tsx` 共通のスケルトン単位。 */
export default function SkeletonBlock({
  className,
  rounded = "rounded-lg",
}: SkeletonBlockProps) {
  return (
    <Skeleton className={rounded}>
      <div className={`${className} bg-default-300 ${rounded}`} />
    </Skeleton>
  );
}
