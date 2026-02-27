import type { BattingStats, PitchingStats } from "../actions";

interface StatsOverviewProps {
  battingStats: BattingStats | null;
  pitchingStats: PitchingStats | null;
}

interface StatItem {
  label: string;
  value: string | number;
}

function formatStat(value: number | undefined, decimals: number = 3): string {
  if (value === undefined || value === null) return "-";
  return value.toFixed(decimals);
}

export default function StatsOverview({
  battingStats,
  pitchingStats,
}: StatsOverviewProps) {
  const battingItems: StatItem[] =
    battingStats?.calculated
      ? [
          { label: "打率", value: formatStat(battingStats.calculated.batting_average) },
          { label: "本塁打", value: battingStats.aggregate?.home_run ?? 0 },
          { label: "打点", value: battingStats.aggregate?.runs_batted_in ?? 0 },
          { label: "安打", value: battingStats.aggregate?.hit ?? 0 },
          { label: "盗塁", value: battingStats.aggregate?.stealing_base ?? 0 },
          { label: "出塁率", value: formatStat(battingStats.calculated.on_base_percentage) },
        ]
      : [];

  const pitchingItems: StatItem[] =
    pitchingStats?.calculated
      ? [
          { label: "防御率", value: formatStat(pitchingStats.calculated.era, 2) },
          { label: "勝利", value: pitchingStats.aggregate?.win ?? 0 },
          { label: "セーブ", value: pitchingStats.aggregate?.saves ?? 0 },
          { label: "HP", value: pitchingStats.aggregate?.hold ?? 0 },
          { label: "奪三振", value: pitchingStats.aggregate?.strikeouts ?? 0 },
          { label: "勝率", value: formatStat(pitchingStats.calculated.win_percentage) },
        ]
      : [];

  return (
    <section>
      <h3 className="text-lg font-bold mb-3">通算成績</h3>

      {battingItems.length === 0 && pitchingItems.length === 0 ? (
        <div className="rounded-lg border border-zinc-700 p-6 text-center">
          <p className="text-zinc-400">成績がありません</p>
          <p className="text-zinc-500 text-sm mt-1">
            試合を記録すると成績が表示されます
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {battingItems.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-zinc-400 mb-2">打撃成績</h4>
              <div className="grid grid-cols-3 gap-2">
                {battingItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-zinc-700 p-3 text-center"
                  >
                    <p className="text-xs text-zinc-400">{item.label}</p>
                    <p className="text-lg font-bold mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pitchingItems.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-zinc-400 mb-2">投手成績</h4>
              <div className="grid grid-cols-3 gap-2">
                {pitchingItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-zinc-700 p-3 text-center"
                  >
                    <p className="text-xs text-zinc-400">{item.label}</p>
                    <p className="text-lg font-bold mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
