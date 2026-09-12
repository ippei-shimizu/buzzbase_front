const ROWS = [
  { rank: 1, width: 120, fill: "#d08000", textFill: "#2E2E2E" },
  { rank: 2, width: 96, fill: "#424242", textFill: "#F4F4F4" },
  { rank: 3, width: 72, fill: "#424242", textFill: "#F4F4F4" },
];

/**
 * 「チームメイトとランキングで競う」を表すイラスト。順位バーと先頭の王冠を描く。
 * 画像素材確定後に差し替え可能な仮ビジュアル。
 */
export default function RankingIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      className="h-full w-full"
    >
      <path
        d="M84 28 L92 42 L100 26 L108 42 L116 28 L113 54 L87 54 Z"
        fill="#d08000"
      />
      {ROWS.map((row, index) => {
        const y = 70 + index * 36;
        return (
          <g key={row.rank}>
            <circle
              cx="34"
              cy={y + 11}
              r="13"
              fill="#27272a"
              stroke="#424242"
              strokeWidth="2"
            />
            <text
              x="34"
              y={y + 15}
              fill="#F4F4F4"
              fontSize="13"
              fontWeight="bold"
              textAnchor="middle"
            >
              {row.rank}
            </text>
            <rect
              x="54"
              y={y}
              width={row.width}
              height="22"
              rx="11"
              fill={row.fill}
            />
            <text
              x={54 + row.width - 12}
              y={y + 16}
              fill={row.textFill}
              fontSize="12"
              fontWeight="bold"
              textAnchor="end"
            >
              {(0.38 - index * 0.02).toFixed(3).replace(/^0/, "")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
