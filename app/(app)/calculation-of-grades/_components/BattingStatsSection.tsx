import { battingStats } from "@app/data/baseball-stats/batting-stats";
import StatCard from "./StatCard";

export default function BattingStatsSection() {
  return (
    <section id="batting">
      <h2 className="text-lg font-bold mb-3">打撃成績</h2>
      <div className="grid gap-y-6">
        {battingStats.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            equation={item.equation}
            descriptions={item.descriptions}
            slug={item.slug}
          />
        ))}
      </div>
    </section>
  );
}
