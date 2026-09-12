const SIZE = 260;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TIP_RADIUS = STROKE / 2 + 2;

interface CircularTimerProps {
  /** 現在のインターバル内の進捗（0〜1）。1 周＝素振り 1 本。 */
  sweep: number;
  count: number;
  targetCount: number;
  /** 一時停止中は針を淡くして、動いていないことを色でも示す。 */
  isPaused: boolean;
}

/**
 * インターバル 1 周＝1 本のテンポを可視化する円形タイマー。
 * 進捗は SVG の弧（strokeDashoffset）と先端のドットで表し、中央に現在の本数を出す。
 * 針の位置は毎フレーム経過時間から計算した値を受け取るだけで、内部に時間を持たない。
 */
export default function CircularTimer({
  sweep,
  count,
  targetCount,
  isPaused,
}: CircularTimerProps) {
  const clamped = Math.min(Math.max(sweep, 0), 1);
  // 先端ドットは 12 時（-90°）を起点に時計回りへ進める。
  const angle = clamped * 2 * Math.PI - Math.PI / 2;

  return (
    <div
      className="relative mx-auto"
      style={{ width: SIZE, height: SIZE }}
      role="img"
      aria-label={`${targetCount}本中${count}本`}
    >
      <svg width={SIZE} height={SIZE} aria-hidden focusable="false">
        <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="#424242"
            strokeWidth={STROKE}
            fill="none"
          />
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="#d08000"
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
            opacity={isPaused ? 0.4 : 1}
          />
        </g>
        <circle
          cx={CENTER + RADIUS * Math.cos(angle)}
          cy={CENTER + RADIUS * Math.sin(angle)}
          r={TIP_RADIUS}
          fill="#F4F4F4"
          opacity={isPaused ? 0.4 : 1}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[72px] font-extrabold leading-none text-white tabular-nums">
          {count}
        </span>
        <span className="mt-1 text-[22px] font-semibold text-zinc-400 tabular-nums">
          / {targetCount}
        </span>
      </div>
    </div>
  );
}
