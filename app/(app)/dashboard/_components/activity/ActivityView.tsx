import type { ActivityData } from "../../_utils/homeData";
import { adSlots } from "@app/components/ad/adConfig";
import AdInFeed from "@app/components/ad/AdInFeed";
import PeriodicReviewBanner from "../PeriodicReviewBanner";
import CurrentThemeSection from "./CurrentThemeSection";
import GoalSection from "./GoalSection";
import ImprovementToolsSection from "./ImprovementToolsSection";
import MonthlySummarySection from "./MonthlySummarySection";
import RecentPracticeSection from "./RecentPracticeSection";
import RecordButtonsSection from "./RecordButtonsSection";

interface ActivityViewProps {
  data: ActivityData;
  /** Asia/Tokyo の今日（`YYYY-MM-DD`）。日付の相対表記の基準として下へ渡す。 */
  today: string;
}

/**
 * ホーム >「練習・活動」面。継続ループの司令塔として、
 * 「記録する → 何に取り組むか → 進捗 → 振り返り → 積み上げ → 直近の実績」の順に積む
 * （mobile のホーム活動面と同じ並び）。
 *
 * 未実装の機能（草グラフ・Streak / 素振りカウンター / 練習と成績のつながり / 今日のやること）は
 * 枠だけ置かず、実装 PR がこの並びの該当位置に SectionCard を差し込む。
 */
export default function ActivityView({ data, today }: ActivityViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <RecordButtonsSection />
      <CurrentThemeSection themesResult={data.themes} />
      <GoalSection goalsResult={data.goals} />
      <PeriodicReviewBanner result={data.reviews} />
      <ImprovementToolsSection />
      <MonthlySummarySection summariesResult={data.summaries} />
      <RecentPracticeSection
        sessionsResult={data.sessions}
        notesResult={data.notes}
        menusResult={data.menus}
        today={today}
      />
      <AdInFeed slot={adSlots.dashboardInFeed} layoutKey="-6t+ed+2i-1n-4w" />
    </div>
  );
}
