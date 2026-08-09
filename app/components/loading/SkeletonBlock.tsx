"use client";

import { Skeleton } from "@heroui/react";

interface SkeletonBlockProps {
  /**
   * 幅・高さ等のサイズ指定のみ（例: "h-24 w-full"）。
   * `flex-1` や `mt-*` 等のレイアウト・間隔クラスは渡さないこと。
   * `className` は HeroUI `Skeleton` 本体と内側の子要素の両方に適用されるため、
   * `mt-*` を渡すと内側でも二重にオフセットがかかり `overflow-hidden` で
   * 見切れる。兄弟間の位置調整をしたい場合は呼び出し側で親 div にラップし、
   * そちらへ `flex-1` / `mt-*` 等を付与すること。
   */
  className: string;
  rounded?: string;
}

/** サイズ指定した矩形をプレースホルダとして表示する、`loading.tsx` 共通のスケルトン単位。 */
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
