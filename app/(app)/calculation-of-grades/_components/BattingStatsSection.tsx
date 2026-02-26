import { battingStats } from "@app/data/baseball-stats/batting-stats";
import StatCard from "./StatCard";

export default function BattingStatsSection() {
  return (
    <section id="batting">
      <h2 className="text-lg font-bold mb-3">打撃成績</h2>
      <div className="grid gap-y-6">
        {battingStats.map((item, index) => (
          <StatCard
            key={index}
            title={item.title}
            equation={item.equation}
            description={item.description}
            slug={item.slug}
          />
        ))}
      </div>
    </section>
  );
}
