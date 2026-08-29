import type { PeriodicReview } from "@app/types/periodicReview";
import {
  formatCount,
  formatDelta,
  formatFixed,
  formatPeriodDate,
  formatRatio,
} from "../_utils/periodicReviewFormat";

interface PeriodicReviewCardProps {
  review: PeriodicReview;
}

const periodLabel = (review: PeriodicReview): string =>
  review.period_type === "monthly" ? "今月の振り返り" : "今週の振り返り";

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

/**
 * 週次 / 月次レポート1件のカード。
 *
 * 指標を追加する前に生成された古いレポートには summary のキー自体が無いため、
 * 欠損値はすべて「-」で描く（0 と表示すると「成績が 0 だった」と誤読される）。
 * 課題別内訳・インサイトは summary に含まれるときだけ描画する。
 */
export default function PeriodicReviewCard({
  review,
}: PeriodicReviewCardProps) {
  const { summary } = review;
  const batting = summary.batting;
  const pitching = summary.pitching;
  const themes = summary.theme_breakdown ?? [];
  // 登板が無い期間は各値 null で返るため、投手ブロックごと出さない。
  const hasPitching =
    !!pitching &&
    [pitching.era, pitching.whip, pitching.k_per_9].some(
      (value) => value !== null && value !== undefined,
    );
  const delta = formatDelta(batting?.delta);

  return (
    <article className="rounded-[10px] bg-sub p-4">
      <h3 className="text-base font-bold text-white">{periodLabel(review)}</h3>
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
          </div>
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
