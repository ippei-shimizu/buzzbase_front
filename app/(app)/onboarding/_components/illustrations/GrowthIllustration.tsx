const POINTS = "40,150 72,128 104,138 136,96 168,58";
const GRID_LINE_Y = [60, 100, 140];

/**
 * 「成長を1枚のグラフで」を表すイラスト。上昇する成績推移の折れ線グラフを描く。
 * 画像素材確定後に差し替え可能な仮ビジュアル。
 */
export default function GrowthIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      className="h-full w-full"
    >
      <line x1="36" y1="34" x2="36" y2="166" stroke="#424242" strokeWidth="2" />
      <line
        x1="36"
        y1="166"
        x2="176"
        y2="166"
        stroke="#424242"
        strokeWidth="2"
      />
      {GRID_LINE_Y.map((y) => (
        <line
          key={y}
          x1="36"
          y1={y}
          x2="176"
          y2={y}
          stroke="#27272a"
          strokeWidth="1"
        />
      ))}
      <path
        d="M40 150 L72 128 L104 138 L136 96 L168 58 L168 166 L40 166 Z"
        fill="#d08000"
        fillOpacity="0.15"
      />
      <polyline
        points={POINTS}
        fill="none"
        stroke="#d08000"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {POINTS.split(" ").map((point) => {
        const [x, y] = point.split(",").map(Number);
        return <circle key={point} cx={x} cy={y} r="5" fill="#d08000" />;
      })}
    </svg>
  );
}
