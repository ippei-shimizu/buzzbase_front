import type { WinLossSummary } from "../../gameSummaryTypes";
import { formatRate } from "@app/utils/formatStats";

interface WinLossCardsProps {
  summary: WinLossSummary;
}

interface ResultCard {
  label: string;
  value: number;
  color: string;
}

interface BarSegment {
  key: string;
  pct: number;
  color: string;
}

/** 勝/敗/分の3カードと勝率、勝敗比率の横積みバーを表示する。 */
export function WinLossCards({ summary }: WinLossCardsProps) {
  const total = summary.wins + summary.losses + summary.draws;
  const cards: ResultCard[] = [
    { label: "勝利", value: summary.wins, color: "#f31260" },
    { label: "敗北", value: summary.losses, color: "#006fee" },
    { label: "引分", value: summary.draws, color: "#6b7280" },
  ];
  const segments: BarSegment[] = [
    {
      key: "win",
      pct: total > 0 ? (summary.wins / total) * 100 : 0,
      color: "#f31260",
    },
    {
      key: "loss",
      pct: total > 0 ? (summary.losses / total) * 100 : 0,
      color: "#006fee",
    },
    {
      key: "draw",
      pct: total > 0 ? (summary.draws / total) * 100 : 0,
      color: "#6b7280",
    },
  ];

  return (
    <section className="rounded-xl bg-bg_sub p-4">
      <div className="grid grid-cols-3 gap-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className="flex flex-col items-center rounded-xl bg-[#3A3A3A] p-3"
          >
            <span className="text-sm text-[#A1A1AA]">{card.label}</span>
            <span
              className="text-[22px] font-bold"
              style={{ color: card.color }}
            >
              {card.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm text-[#A1A1AA]">{total}試合 / 勝率</span>
        <span className="text-sm font-bold text-[#d08000]">
          {formatRate(summary.win_rate)}
        </span>
      </div>
      <div className="mt-1 flex h-1.5 overflow-hidden rounded bg-[#424242]">
        {segments.map((segment) =>
          segment.pct > 0 ? (
            <div
              key={segment.key}
              className="h-full"
              style={{
                width: `${segment.pct}%`,
                backgroundColor: segment.color,
              }}
            />
          ) : null,
        )}
      </div>
    </section>
  );
}
