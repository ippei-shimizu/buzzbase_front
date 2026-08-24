"use client";
import type { RunnersState } from "@app/interface/plateAppearanceV2";
import {
  RUNNERS_STATE_OPTIONS,
  basesToRunnersState,
  runnersStateToBases,
  type RunnersBases,
} from "@app/constants/runnersState";

interface RunnersDiamondProps {
  value: RunnersState | null;
  /** 未指定なら表示専用モード（支援技術にはラベル文字列のみを公開する）。 */
  onChange?: (value: RunnersState | null) => void;
}

const RUNNERS_STATE_LABELS: Record<string, string> = Object.fromEntries(
  RUNNERS_STATE_OPTIONS.map((option) => [option.key, option.label]),
);

// 下=本塁（装飾のみ）/ 右=一塁 / 上=二塁 / 左=三塁 の空間配置。
const BASES: ReadonlyArray<{
  key: keyof RunnersBases;
  label: string;
  positionClass: string;
}> = [
  {
    key: "second",
    label: "二塁",
    positionClass: "top-0 left-1/2 -translate-x-1/2",
  },
  {
    key: "third",
    label: "三塁",
    positionClass: "top-1/2 left-0 -translate-y-1/2",
  },
  {
    key: "first",
    label: "一塁",
    positionClass: "top-1/2 right-0 -translate-y-1/2",
  },
];

// 占有塁は塗り + 内側の白丸で示し、色だけに依存しない。
function BaseMarker({ occupied }: { occupied: boolean }) {
  return (
    <span
      className={`flex h-7 w-7 rotate-45 items-center justify-center rounded-[3px] border-2 transition-colors ${
        occupied
          ? "border-[#d08000] bg-[#d08000]"
          : "border-zinc-500 bg-transparent"
      }`}
    >
      {occupied ? (
        <span className="block h-2.5 w-2.5 rounded-full bg-white" />
      ) : null}
    </span>
  );
}

const HOME_PLATE = (
  <svg
    aria-hidden="true"
    width="22"
    height="20"
    viewBox="0 0 22 20"
    className="absolute bottom-0 left-1/2 -translate-x-1/2"
  >
    <polygon
      points="1,1 21,1 21,9 11,19 1,9"
      fill="none"
      stroke="#71717a"
      strokeWidth="2"
    />
  </svg>
);

/**
 * ランナー状況を各塁のタップでトグルするダイヤモンド UI。
 * - 初期値 null は全塁 OFF + キャプション「未入力」
 * - 最後の 1 塁を OFF にしたら no_runner（明示的な操作 = 無走者を記録した）
 * - 「未入力に戻す」で null へ戻せる
 * onChange 未指定時は表示専用（role=img）として描画する。
 */
export function RunnersDiamond({ value, onChange }: RunnersDiamondProps) {
  const bases = runnersStateToBases(value);
  const caption = value === null ? "未入力" : RUNNERS_STATE_LABELS[value];
  const isInteractive = onChange !== undefined;

  const handleToggle = (key: keyof RunnersBases) => {
    if (!onChange) return;
    const next = { ...bases, [key]: !bases[key] };
    onChange(basesToRunnersState(next));
  };

  const diamond = (
    <div className="relative mx-auto h-[132px] w-[152px]">
      {BASES.map((base) =>
        isInteractive ? (
          <button
            key={base.key}
            type="button"
            aria-label={base.label}
            aria-pressed={bases[base.key]}
            className={`absolute flex h-11 w-11 items-center justify-center ${base.positionClass}`}
            onClick={() => handleToggle(base.key)}
          >
            <BaseMarker occupied={bases[base.key]} />
          </button>
        ) : (
          <span
            key={base.key}
            className={`absolute flex h-11 w-11 items-center justify-center ${base.positionClass}`}
          >
            <BaseMarker occupied={bases[base.key]} />
          </span>
        ),
      )}
      {HOME_PLATE}
    </div>
  );

  if (!isInteractive) {
    return (
      <div role="img" aria-label={`ランナー状況: ${caption}`}>
        <div aria-hidden="true">{diamond}</div>
        <p
          aria-hidden="true"
          className="mt-1 text-center text-xs text-zinc-400"
        >
          {caption}
        </p>
      </div>
    );
  }

  return (
    <div role="group" aria-label="ランナー状況">
      {diamond}
      <p aria-live="polite" className="mt-1 text-center text-xs text-zinc-400">
        {caption}
      </p>
      {value !== null ? (
        <button
          type="button"
          className="mx-auto mt-1 block text-xs text-zinc-400 underline"
          onClick={() => onChange?.(null)}
        >
          未入力に戻す
        </button>
      ) : null}
    </div>
  );
}
