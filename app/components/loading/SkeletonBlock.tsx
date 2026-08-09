"use client";

import { Skeleton } from "@heroui/react";

interface SkeletonBlockProps {
  /** 幅・高さ等のサイズ指定（例: "h-24 w-full"）。 */
  className: string;
  rounded?: string;
}

/**
 * サイズ指定した矩形をプレースホルダとして表示する、`loading.tsx` 共通のスケルトン単位。
 * `className` は HeroUI `Skeleton` 本体（flex アイテムとして並ぶ要素）にも渡す。
 * 内側の子要素だけに付けると、`flex-1` 等の兄弟間レイアウトを決めるクラスが
 * 効かず（直接の親は `Skeleton` 内部の非 flex な div のため）、幅が潰れる。
 */
export default function SkeletonBlock({
  className,
  rounded = "rounded-lg",
}: SkeletonBlockProps) {
  return (
    <Skeleton className={`${className} ${rounded}`}>
      <div className={`${className} bg-default-300 ${rounded}`} />
    </Skeleton>
  );
}
