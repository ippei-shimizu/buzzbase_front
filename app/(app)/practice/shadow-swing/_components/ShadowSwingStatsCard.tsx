import type { FetchResult } from "@app/services/v2/requests";
import type { ShadowSwingStats } from "@app/types/shadowSwing";
import { STATS_ERROR_MESSAGE } from "./shadowSwingCopy";

const NUMBER_LOCALE = "ja-JP";

interface ShadowSwingStatsCardProps {
  result: FetchResult<ShadowSwingStats>;
  /** 完了直後の再取得中など、前回値を出したまま更新を待つときに立てる。 */
  isRefreshing?: boolean;
}

const ROWS: ReadonlyArray<{ key: keyof ShadowSwingStats; label: string }> = [
  { key: "today_count", label: "今日" },
  { key: "month_count", label: "今月" },
  { key: "total_count", label: "通算" },
];

/**
 * 今日・今月・通算の素振り本数を表示する。
 * 取得に失敗した場合は 0 本と区別できるよう、数値を出さずに失敗した旨を表示する
 * （0 に丸めると「まだ振っていない」と誤解され、積み上げが消えたように見えてしまう）。
 */
export default function ShadowSwingStatsCard({
  result,
  isRefreshing = false,
}: ShadowSwingStatsCardProps) {
  if (result.status !== "ok") {
    return (
      <p className="rounded-[10px] bg-sub px-4 py-3 text-sm text-zinc-400">
        {STATS_ERROR_MESSAGE}
      </p>
    );
  }

  return (
    <dl
      className="space-y-2.5 rounded-[10px] bg-sub px-4 py-3.5"
      aria-busy={isRefreshing}
    >
      {ROWS.map((row) => (
        <div key={row.key} className="flex items-center justify-between">
          <dt className="text-sm text-zinc-400">{row.label}</dt>
          <dd className="text-[15px] font-bold text-white tabular-nums">
            {result.data[row.key].toLocaleString(NUMBER_LOCALE)}本
          </dd>
        </div>
      ))}
    </dl>
  );
}
