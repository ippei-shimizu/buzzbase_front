import type { Scoring } from "../../gameSummaryTypes";

interface ScoringStatsProps {
  scoring: Scoring;
}

/** 総得点 / 総失点 / 得失点差の3カードを表示する。得失点差は符号で色分けする。 */
export function ScoringStats({ scoring }: ScoringStatsProps) {
  const diffColor =
    scoring.run_differential > 0
      ? "#f31260"
      : scoring.run_differential < 0
        ? "#006fee"
        : "#6b7280";
  const diffPrefix = scoring.run_differential > 0 ? "+" : "";

  return (
    <section className="rounded-xl bg-bg_sub p-4">
      <h3 className="mb-3 text-base font-bold text-[#F4F4F4]">得失点</h3>
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center rounded-xl bg-[#3A3A3A] p-3">
          <span className="text-sm text-[#A1A1AA]">総得点</span>
          <span className="text-xl font-bold text-[#f31260]">
            {scoring.runs_for}
          </span>
          <span className="mt-0.5 text-[13px] text-[#A1A1AA]">
            平均 {scoring.avg_runs_for}
          </span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-[#3A3A3A] p-3">
          <span className="text-sm text-[#A1A1AA]">総失点</span>
          <span className="text-xl font-bold text-[#006fee]">
            {scoring.runs_against}
          </span>
          <span className="mt-0.5 text-[13px] text-[#A1A1AA]">
            平均 {scoring.avg_runs_against}
          </span>
        </div>
        <div className="flex flex-col items-center rounded-xl bg-[#3A3A3A] p-3">
          <span className="text-sm text-[#A1A1AA]">得失点差</span>
          <span className="text-xl font-bold" style={{ color: diffColor }}>
            {diffPrefix}
            {scoring.run_differential}
          </span>
        </div>
      </div>
    </section>
  );
}
