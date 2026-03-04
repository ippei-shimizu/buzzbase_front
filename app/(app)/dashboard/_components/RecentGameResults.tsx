import type { RecentGameResult } from "../actions";
import Link from "next/link";

interface RecentGameResultsProps {
  results: RecentGameResult[];
}

function formatDate(dateStr: string): string {
  const datePart = dateStr.split("T")[0];
  const [, month, day] = datePart.split("-");
  return `${parseInt(month)}/${parseInt(day)}`;
}

function matchTypeLabel(matchType: string): string {
  switch (matchType) {
    case "regular":
      return "公式戦";
    case "open":
      return "オープン戦";
    default:
      return matchType;
  }
}

export default function RecentGameResults({ results }: RecentGameResultsProps) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold">直近の試合結果</h3>
        <Link
          href="/game-result/lists"
          className="text-sm text-yellow-500 hover:underline"
        >
          すべて見る
        </Link>
      </div>

      {results.length === 0 ? (
        <div className="rounded-lg border border-zinc-700 p-6 text-center">
          <p className="text-zinc-400">試合記録がありません</p>
          <p className="text-zinc-500 text-sm mt-1">
            「試合を記録する」ボタンから記録を始めましょう
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((result) => (
            <Link
              key={result.id}
              href={`/game-result/summary/${result.id}`}
              className="block rounded-lg border border-zinc-700 p-3 transition-colors hover:border-zinc-500"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-zinc-400">
                    {formatDate(result.date)}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-300">
                    {matchTypeLabel(result.match_type)}
                  </span>
                </div>
                <span className="text-sm text-zinc-400">
                  vs {result.opponent_team_name ?? "不明"}
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 mb-2">
                <span
                  className={`text-2xl font-bold ${
                    result.my_team_score > result.opponent_team_score
                      ? "text-yellow-500"
                      : result.my_team_score < result.opponent_team_score
                        ? "text-zinc-400"
                        : "text-zinc-300"
                  }`}
                >
                  {result.my_team_score}
                </span>
                <span className="text-zinc-500">-</span>
                <span className="text-2xl font-bold text-zinc-300">
                  {result.opponent_team_score}
                </span>
              </div>

              <div className="flex gap-4 text-sm">
                {result.batting_average && (
                  <div className="flex gap-3 text-zinc-300">
                    <span>
                      {result.batting_average.hit}/
                      {result.batting_average.at_bats}
                    </span>
                    {result.batting_average.home_run > 0 && (
                      <span>HR {result.batting_average.home_run}</span>
                    )}
                    {result.batting_average.runs_batted_in > 0 && (
                      <span>打点 {result.batting_average.runs_batted_in}</span>
                    )}
                  </div>
                )}
                {result.pitching_result && (
                  <div className="flex gap-3 text-zinc-300">
                    <span>{result.pitching_result.innings_pitched}回</span>
                    <span>{result.pitching_result.strikeouts}K</span>
                    <span>自責{result.pitching_result.earned_run}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
