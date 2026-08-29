interface Props {
  count: number;
  activeIndex: number;
}

/**
 * ウォークスルーの現在位置を示すドット。
 * 現在地はドットの見た目だけでなく aria-current でも公開する。
 */
export default function PageIndicator({ count, activeIndex }: Props) {
  return (
    <ol
      aria-label="ウォークスルーの進捗"
      className="flex items-center justify-center gap-x-2"
    >
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === activeIndex;
        return (
          <li
            key={index}
            aria-current={isActive ? "step" : undefined}
            className="flex items-center"
          >
            <span className="sr-only">{`${index + 1}ページ目`}</span>
            <span
              aria-hidden="true"
              className={`h-2 rounded-full transition-all ${
                isActive ? "w-6 bg-[#d08000]" : "w-2 bg-sub"
              }`}
            />
          </li>
        );
      })}
    </ol>
  );
}
