const KEYPAD_ROWS = [0, 1, 2];
const KEYPAD_COLUMNS = [0, 1, 2];

/**
 * 「打席入力 → 自動計算」を表すイラスト。電卓本体と、算出された主要指標バッジを描く。
 * 画像素材確定後に差し替え可能な仮ビジュアル。
 */
export default function AutoCalcIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      aria-hidden="true"
      className="h-full w-full"
    >
      <rect x="34" y="22" width="92" height="156" rx="14" fill="#27272a" />
      <rect
        x="34"
        y="22"
        width="92"
        height="156"
        rx="14"
        stroke="#424242"
        strokeWidth="2"
      />
      <rect x="46" y="36" width="68" height="30" rx="6" fill="#1f1f22" />
      <text
        x="108"
        y="58"
        fill="#d08000"
        fontSize="18"
        fontWeight="bold"
        textAnchor="end"
      >
        .333
      </text>
      {KEYPAD_ROWS.map((row) =>
        KEYPAD_COLUMNS.map((col) => (
          <rect
            key={`${row}-${col}`}
            x={46 + col * 24}
            y={80 + row * 24}
            width="18"
            height="18"
            rx="5"
            fill="#424242"
          />
        )),
      )}
      <g>
        <circle cx="150" cy="70" r="22" fill="#d08000" />
        <text
          x="150"
          y="66"
          fill="#2E2E2E"
          fontSize="11"
          fontWeight="bold"
          textAnchor="middle"
        >
          OPS
        </text>
        <text
          x="150"
          y="80"
          fill="#2E2E2E"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
        >
          .900
        </text>
      </g>
      <g>
        <circle
          cx="158"
          cy="128"
          r="20"
          fill="#27272a"
          stroke="#d08000"
          strokeWidth="2"
        />
        <text x="158" y="124" fill="#A1A1AA" fontSize="9" textAnchor="middle">
          防御率
        </text>
        <text
          x="158"
          y="138"
          fill="#F4F4F4"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
        >
          2.50
        </text>
      </g>
      <path
        d="M128 96 L142 84"
        stroke="#d08000"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
