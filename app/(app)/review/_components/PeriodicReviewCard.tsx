import type { GoalMetricKey } from "@app/types/goal";
import type {
  PeriodicReview,
  PeriodicReviewGoal,
} from "@app/types/periodicReview";
import { formatMetricValue, metricLabel } from "@app/constants/goal";
import { parseDecimal } from "@app/constants/practice";
import {
  MISSING_VALUE,
  formatCount,
  formatDelta,
  formatFixed,
  formatPeriodDate,
  formatRatio,
  periodicReviewTitle,
} from "../_utils/periodicReviewFormat";

interface PeriodicReviewCardProps {
  review: PeriodicReview;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-[10px] bg-main px-2 py-3 text-center">
      <p className="text-lg font-bold text-[#d08000]">{value}</p>
      <p className="mt-1 text-[11px] text-zinc-400">{label}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[72px] flex-1 rounded-[10px] bg-main px-2 py-2.5 text-center">
      <p className="text-base font-bold text-white">{value}</p>
      <p className="mt-0.5 text-[11px] text-zinc-400">{label}</p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-2 mt-4 text-xs font-bold text-zinc-400">{children}</h4>
  );
}

/** 目標1件。kind ごとに現在値の意味が違うため、値の見せ方を分岐する。 */
function GoalRow({ goal }: { goal: PeriodicReviewGoal }) {
  const percent = parseDecimal(goal.progress_percent);
  const progress =
    goal.kind === "qualitative"
      ? null
      : goalValueLabel(goal) +
        (percent === null ? "" : `（${Math.round(percent)}%）`);

  return (
    <li className="flex items-center justify-between gap-2">
      <span className="min-w-0 flex-1 truncate">{goal.title}</span>
      {goal.achieved ? (
        <span className="shrink-0 rounded-full bg-[#d08000]/20 px-2 py-0.5 text-[11px] font-bold text-[#d08000]">
          達成
        </span>
      ) : null}
      {progress ? (
        <span className="shrink-0 text-xs text-zinc-400">{progress}</span>
      ) : null}
    </li>
  );
}

/**
 * 目標の「現在値 / 目標値」表示。numeric は指標定義の整形（打率 .320 等）を使い、
 * manual はユーザー定義ラベルの実数、qualitative は数値を持たないため空にする。
 */
function goalValueLabel(goal: PeriodicReviewGoal): string {
  if (goal.kind === "qualitative") return "";
  if (goal.kind === "manual") {
    const current = formatCount(goal.current_value);
    const target = formatCount(goal.target_value);
    const label = goal.custom_metric_label ?? "";
    return `${label} ${current} / ${target}`;
  }
  const key = (goal.metric_key ?? null) as GoalMetricKey | null;
  const current =
    goal.current_value == null
      ? MISSING_VALUE
      : formatMetricValue(key, goal.current_value);
  const target = formatMetricValue(key, goal.target_value);
  return `${metricLabel(key)} ${current} / ${target}`;
}

/**
 * 週次 / 月次レポート1件のカード。
 *
 * 指標を追加する前に生成された古いレポートには summary のキー自体が無いため、
 * 欠損値はすべて「-」で描く（0 と表示すると「成績が 0 だった」と誤読される）。
 * 課題別内訳・コンディション・メニュー別内訳・目標・インサイトは
 * summary に含まれるときだけ描画する。
 */
export default function PeriodicReviewCard({
  review,
}: PeriodicReviewCardProps) {
  const { summary } = review;
  const batting = summary.batting;
  const pitching = summary.pitching;
  const condition = summary.condition;
  const themes = summary.theme_breakdown ?? [];
  const practiceMenus = summary.practice_menus?.items ?? [];
  const practiceMenuOthers =
    parseDecimal(summary.practice_menus?.other_count) ?? 0;
  const goals = summary.goals ?? [];
  const scoring = batting?.scoring_position;
  // 登板が無い期間は各値 null / 0 で返るため、投手ブロックごと出さない。
  const hasPitching =
    !!pitching &&
    ([pitching.era, pitching.whip, pitching.k_per_9].some(
      (value) => value !== null && value !== undefined,
    ) ||
      (parseDecimal(pitching.appearances) ?? 0) > 0);
  const delta = formatDelta(batting?.delta);
  // 母数 0（旧データのみ等で得点圏の新フォーマット打席が無い）は back が打率 null で
  // 保存するため、そのまま「-」に落ちる。
  const scoringAverage = formatRatio(scoring?.batting_average);

  return (
    <article className="rounded-[10px] bg-sub p-4">
      <h3 className="text-base font-bold text-white">
        {periodicReviewTitle(review)}
      </h3>
      <p className="mt-1 text-xs text-zinc-400">
        {formatPeriodDate(review.period_start)} 〜{" "}
        {formatPeriodDate(review.period_end)}
      </p>

      <div className="mt-3.5 flex gap-2">
        <Stat
          label="練習日数"
          value={formatCount(summary.practice_days, "日")}
        />
        <Stat label="素振り" value={formatCount(summary.total_swings)} />
        <Stat label="連続" value={formatCount(summary.streak_current, "日")} />
      </div>

      {batting ? (
        <>
          <SectionLabel>打撃</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <Metric label="打率" value={formatRatio(batting.batting_average)} />
            <Metric
              label="出塁率"
              value={formatRatio(batting.on_base_percentage)}
            />
            <Metric
              label="長打率"
              value={formatRatio(batting.slugging_percentage)}
            />
            <Metric label="OPS" value={formatRatio(batting.ops)} />
            <Metric label="得点圏打率" value={scoringAverage} />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Metric label="安打" value={formatCount(batting.hits)} />
            <Metric label="二塁打" value={formatCount(batting.two_base_hits)} />
            <Metric
              label="三塁打"
              value={formatCount(batting.three_base_hits)}
            />
            <Metric label="本塁打" value={formatCount(batting.home_runs)} />
            <Metric label="盗塁" value={formatCount(batting.stolen_bases)} />
            <Metric label="三振" value={formatCount(batting.strikeouts)} />
          </div>
          {delta ? (
            <p className="mt-2 text-xs text-zinc-400">打率 前期間比 {delta}</p>
          ) : null}
        </>
      ) : null}

      {hasPitching ? (
        <>
          <SectionLabel>投手</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <Metric label="防御率" value={formatFixed(pitching?.era, 2)} />
            <Metric label="WHIP" value={formatFixed(pitching?.whip, 2)} />
            <Metric label="K/9" value={formatFixed(pitching?.k_per_9, 1)} />
            <Metric label="登板" value={formatCount(pitching?.appearances)} />
            <Metric label="奪三振" value={formatCount(pitching?.strikeouts)} />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Metric
              label="与四球"
              value={formatCount(pitching?.base_on_balls)}
            />
            <Metric
              label="与死球"
              value={formatCount(pitching?.hit_by_pitch)}
            />
            <Metric
              label="被安打"
              value={formatCount(pitching?.hits_allowed)}
            />
            <Metric
              label="被本塁打"
              value={formatCount(pitching?.home_runs_allowed)}
            />
            <Metric label="失点" value={formatCount(pitching?.runs_allowed)} />
            <Metric label="自責点" value={formatCount(pitching?.earned_runs)} />
          </div>
        </>
      ) : null}

      {practiceMenus.length > 0 ? (
        <>
          <SectionLabel>練習メニュー別</SectionLabel>
          <ul className="space-y-1 text-sm text-white">
            {practiceMenus.map((menu) => (
              <li
                key={menu.name}
                className="flex items-center justify-between gap-2"
              >
                <span className="min-w-0 flex-1 truncate">{menu.name}</span>
                <span className="shrink-0 text-xs text-zinc-400">
                  {formatCount(menu.count, "回")}
                  {parseDecimal(menu.total_amount) ? (
                    <>
                      ・{formatCount(menu.total_amount)}
                      {menu.unit_label ?? ""}
                    </>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
          {practiceMenuOthers > 0 ? (
            <p className="mt-1 text-xs text-zinc-500">
              他 {practiceMenuOthers} 件のメニュー
            </p>
          ) : null}
        </>
      ) : null}

      {condition ? (
        <>
          <SectionLabel>コンディション</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <Metric
              label="平均睡眠"
              value={
                parseDecimal(condition.sleep_hours_avg) === null
                  ? MISSING_VALUE
                  : `${formatFixed(condition.sleep_hours_avg, 1)}h`
              }
            />
            <Metric
              label="平均疲労度"
              value={formatFixed(condition.fatigue_level_avg, 1)}
            />
            <Metric
              label="平均体調"
              value={formatFixed(condition.physical_level_avg, 1)}
            />
          </div>
        </>
      ) : null}

      {summary.note_days !== undefined && summary.note_days !== null ? (
        <>
          <SectionLabel>野球ノート</SectionLabel>
          <p className="text-sm text-white">
            記録した日数 {formatCount(summary.note_days, "日")}
          </p>
        </>
      ) : null}

      {goals.length > 0 ? (
        <>
          <SectionLabel>目標の進捗</SectionLabel>
          <ul className="space-y-1.5 text-sm text-white">
            {goals.map((goal) => (
              <GoalRow key={goal.id} goal={goal} />
            ))}
          </ul>
        </>
      ) : null}

      {themes.length > 0 ? (
        <>
          <SectionLabel>課題</SectionLabel>
          <ul className="space-y-1 text-sm text-white">
            {themes.map((theme) => (
              <li key={theme.id}>
                {theme.title}（{formatCount(theme.practice_count, "回")}）
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {summary.insight ? (
        <>
          <SectionLabel>インサイト</SectionLabel>
          <p className="text-sm leading-5 text-white">{summary.insight.body}</p>
        </>
      ) : null}
    </article>
  );
}
