import { pitchingStats } from "@app/data/baseball-stats/pitching-stats";
import StatCard from "./StatCard";

export default function PitchingStatsSection() {
  return (
    <section id="pitching" className="mt-12">
      <h2 className="text-lg font-bold mb-3">投手成績</h2>
      <div className="grid gap-y-6">
        {pitchingStats.map((item) => (
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
