import type { Goal } from "@app/types/goal";
import { formatMetricValue, metricLabel } from "@app/constants/goal";
import { progressBarWidth } from "../_utils/goalList";

/**
 * 進捗の表示に使う値。
 * 現在値・目標値は back が返す文字列/数値どちらでも同じ見た目になるよう整形して返す。
 */
export function goalDisplayValues(goal: Goal): {
  metricText: string;
  currentText: string;
  targetText: string;
  remainingText: string;
} {
  const isManual = goal.kind === "manual";
  // 単位はユーザーが定義した自由指標だけが持つ。自動集計の指標は指標名（meta 行）で判別できる。
  const unit = isManual ? (goal.custom_unit ?? "") : "";

  const metricText = isManual
    ? (goal.custom_metric_label ?? "")
    : goal.metric_key === "menu_practice_days" && goal.practice_menu_name
      ? `${goal.practice_menu_name} 継続日数`
      : metricLabel(goal.metric_key);

  return {
    metricText,
    currentText: `${formatMetricValue(goal.metric_key, goal.current_value)}${unit}`,
    targetText: `${formatMetricValue(goal.metric_key, goal.target_value)}${unit}${
      goal.comparison_type === "less_than" ? " 以下" : ""
    }`,
    remainingText: goal.is_finalized
      ? "確定済み"
      : `残り${goal.days_remaining}日`,
  };
}

/**
 * 目標1件の進捗表示（Presentational）。
 * 定性目標は数値を持たないため、バーではなく達成/未達成のチップで表す。
 */
export default function GoalProgressBar({ goal }: { goal: Goal }) {
  const { metricText, currentText, targetText, remainingText } =
    goalDisplayValues(goal);

  if (goal.kind === "qualitative") {
    return (
      <div className="w-full">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-white">{goal.title}</p>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${
              goal.is_achieved
                ? "bg-[#d08000] text-white"
                : "bg-main text-zinc-400"
            }`}
          >
            {goal.is_achieved ? "達成" : "未達成"}
          </span>
        </div>
        <p className="mt-1.5 text-xs text-zinc-400">{remainingText}</p>
      </div>
    );
  }

  const width = progressBarWidth(goal.progress_percent);

  return (
    <div className="w-full">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-white">{goal.title}</p>
        <span className="shrink-0 text-sm font-bold text-[#d08000]">
          {Math.round(goal.progress_percent)}%
        </span>
      </div>
      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#424242]"
        role="progressbar"
        aria-label={`${goal.title}の進捗`}
        aria-valuenow={width}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-2 rounded-full bg-[#d08000]"
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="mt-2 flex items-baseline gap-2 text-sm">
        <span className="text-xs text-zinc-400">現在</span>
        <span className="font-bold text-white">{currentText}</span>
        <span aria-hidden className="text-zinc-500">
          →
        </span>
        <span className="text-xs text-zinc-400">目標</span>
        <span className="font-extrabold text-[#d08000]">{targetText}</span>
      </div>
      <p className="mt-1.5 text-xs text-zinc-400">
        {metricText} ・ {remainingText}
      </p>
    </div>
  );
}
