import type { RecentFormGame } from "../../gameSummaryTypes";

interface RecentFormProps {
  games: RecentFormGame[];
}

const RESULT_DISPLAY: Record<string, { mark: string; color: string }> = {
  win: { mark: "○", color: "#f31260" },
  loss: { mark: "×", color: "#006fee" },
  draw: { mark: "△", color: "#6b7280" },
};

const MATCH_TYPE_LABELS: Record<string, string> = {
  regular: "公式戦",
  open: "オープン戦",
};

/** match_type の DB 値を日本語ラベルに変換する。null / 未知の値はそのまま扱う。 */
function matchTypeLabel(value: string | null): string | null {
  if (value == null) return null;
  return MATCH_TYPE_LABELS[value] ?? value;
}

/** 直近5試合を勝敗記号・種別・スコア・対戦相手で一覧表示する。 */
export function RecentForm({ games }: RecentFormProps) {
  if (games.length === 0) return null;

  return (
    <section className="rounded-xl bg-bg_sub p-4">
      <h3 className="mb-3 text-base font-bold text-[#F4F4F4]">直近の試合</h3>
      <div className="flex flex-col gap-2">
        {games.map((game) => {
          const display = RESULT_DISPLAY[game.result] ?? RESULT_DISPLAY.draw;
          const typeLabel = matchTypeLabel(game.match_type);
          return (
            <div
              key={game.game_result_id}
              className="flex items-center gap-3 rounded-xl bg-[#3A3A3A] px-3 py-2.5"
            >
              {typeLabel ? (
                <span className="w-16 shrink-0 truncate rounded bg-[#4A4A4A] px-1 py-0.5 text-center text-xs text-[#A1A1AA]">
                  {typeLabel}
                </span>
              ) : (
                <span className="w-16 shrink-0" />
              )}
              <span className="text-[13px] text-[#A1A1AA]">{game.date}</span>
              <span
                className="w-6 text-center text-xl font-bold"
                style={{ color: display.color }}
              >
                {display.mark}
              </span>
              <span className="text-sm font-semibold text-[#F4F4F4]">
                {game.my_score}-{game.opponent_score}
              </span>
              <span className="flex-1 truncate text-[13px] text-[#F4F4F4]">
                vs {game.opponent}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
