import type { GameSummary } from "../../gameSummaryTypes";
import { MonthlyGameChart } from "./MonthlyGameChart";
import { OpponentRecordList } from "./OpponentRecordList";
import { RecentForm } from "./RecentForm";
import { ScoringStats } from "./ScoringStats";
import { WinLossCards } from "./WinLossCards";

interface GameResultSummaryProps {
  summary: GameSummary;
}

/** 試合結果サマリーの5セクション（勝敗 / 得失点 / 直近 / 月別 / 対戦相手別）を縦に並べる。 */
export function GameResultSummary({ summary }: GameResultSummaryProps) {
  if (summary.win_loss.total === 0) {
    return (
      <p className="py-10 text-center text-sm text-[#A1A1AA]">
        試合結果はありません。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-y-4">
      <WinLossCards summary={summary.win_loss} />
      <ScoringStats scoring={summary.scoring} />
      <RecentForm games={summary.recent_form} />
      <MonthlyGameChart games={summary.monthly_games} />
      <OpponentRecordList records={summary.opponent_records} />
    </div>
  );
}
