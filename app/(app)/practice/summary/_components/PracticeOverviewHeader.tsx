import type { PracticeOverview } from "@app/types/practice";
import { formatTotalAmount, formatVolume } from "@app/constants/practice";

interface PracticeOverviewHeaderProps {
  overview: PracticeOverview;
}

function KpiTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] bg-main px-3 py-2.5">
      <p className="text-[11px] font-semibold text-zinc-400">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-white">{value}</p>
    </div>
  );
}

/**
 * 練習全体の KPI ヘッダ（GET /api/v2/practice_overview）。
 * メニュー別カードの前に「全体でどれだけ積み上がったか」を置き、
 * カードは個々のメニューの内訳として読めるようにする。
 */
export default function PracticeOverviewHeader({
  overview,
}: PracticeOverviewHeaderProps) {
  return (
    <section
      aria-label="練習全体の積み上げ"
      className="rounded-xl bg-sub p-3.5"
    >
      <div className="grid grid-cols-2 gap-2.5">
        <KpiTile
          label="累計練習日数"
          value={`${overview.total_practice_days.toLocaleString("ja-JP")}日`}
        />
        <KpiTile
          label="今月の練習日数"
          value={`${overview.this_month_practice_days.toLocaleString("ja-JP")}日`}
        />
        <KpiTile
          label="総挙上重量"
          value={formatVolume(overview.total_volume)}
        />
        <KpiTile
          label="素振り累計"
          value={formatTotalAmount(overview.total_swing_count, "本")}
        />
      </div>
      <p className="mt-2.5 text-xs text-zinc-400">
        登録中のメニュー {overview.total_menus}件
      </p>
    </section>
  );
}
