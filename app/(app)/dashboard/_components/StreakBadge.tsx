import FireIcon from "@heroicons/react/24/solid/FireIcon";

interface StreakBadgeProps {
  /** 現在の連続日数。 */
  current: number;
  /** これまでの最長連続日数。 */
  longest: number;
}

/** Streak（連続記録）のバッジ。現在の連続日数を主役に、最長を並記する。 */
export default function StreakBadge({ current, longest }: StreakBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <FireIcon className="h-5 w-5 shrink-0 text-[#d08000]" aria-hidden />
      <p className="text-lg font-extrabold text-white">連続 {current}日</p>
      <p className="text-sm text-zic-300">最長 {longest}日</p>
    </div>
  );
}
