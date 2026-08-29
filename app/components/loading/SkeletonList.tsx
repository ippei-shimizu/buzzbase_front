import SkeletonBlock from "./SkeletonBlock";

interface SkeletonListProps {
  count: number;
  /** 1件あたりのサイズ指定（例: "h-20 w-full"）。 */
  itemClassName: string;
  gapClassName?: string;
  rounded?: string;
}

/** 同じ高さの `SkeletonBlock` を縦に並べる、カードリスト系ページ用のスケルトン。 */
export default function SkeletonList({
  count,
  itemClassName,
  gapClassName = "gap-4",
  rounded,
}: SkeletonListProps) {
  return (
    <div className={`flex flex-col ${gapClassName}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonBlock
          key={index}
          className={itemClassName}
          rounded={rounded}
        />
      ))}
    </div>
  );
}
