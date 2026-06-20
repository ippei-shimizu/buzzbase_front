"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import {
  type AdditionalStats,
  type AnalysisFilters as Filters,
  getAdditionalStats,
  getHeadlineStats,
  getHitDirections,
  getHitLocations,
  type HeadlineStats,
  type HitDirectionData,
  type HitLocationData,
} from "../../analysisActions";
import { AdditionalStatsCard } from "./AdditionalStatsCard";
import { AnalysisFilters } from "./AnalysisFilters";
import { HeadlineStatsCard } from "./HeadlineStatsCard";
import { HitDirectionTable } from "./HitDirectionTable";
import { SprayChart } from "./SprayChart";

function buildYears(): string[] {
  const currentYear = new Date().getFullYear();
  const years = ["通算"];
  for (let offset = 0; offset < 6; offset += 1) {
    years.push(String(currentYear - offset));
  }
  return years;
}

/** 打撃成績分析（基本指標 + 打球チャート + 打球方向）のコンテナ。 */
export function AnalysisContainer() {
  const [filters, setFilters] = useState<Filters>({
    year: "通算",
    matchType: "",
  });
  const [headline, setHeadline] = useState<HeadlineStats | null>(null);
  const [additional, setAdditional] = useState<AdditionalStats | null>(null);
  const [hitLocations, setHitLocations] = useState<HitLocationData>({
    points: [],
  });
  const [hitDirections, setHitDirections] = useState<HitDirectionData>({
    directions: [],
    home_runs: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const years = buildYears();

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);
    Promise.all([
      getHeadlineStats(filters),
      getAdditionalStats(filters),
      getHitLocations(filters),
      getHitDirections(filters),
    ]).then(([headlineData, additionalData, locations, directions]) => {
      if (!active) return;
      setHeadline(headlineData);
      setAdditional(additionalData);
      setHitLocations(locations);
      setHitDirections(directions);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [filters]);

  return (
    <div className="flex flex-col gap-y-5">
      <AnalysisFilters filters={filters} onChange={setFilters} years={years} />
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <HeadlineStatsCard stats={headline} />
          <section className="rounded-xl bg-bg_sub p-4 flex flex-col gap-y-3">
            <h3 className="text-sm font-bold">打球チャート</h3>
            <SprayChart points={hitLocations.points} />
          </section>
          <section className="rounded-xl bg-bg_sub p-4 flex flex-col gap-y-3">
            <h3 className="text-sm font-bold">打球方向</h3>
            <HitDirectionTable directions={hitDirections.directions} />
          </section>
          <AdditionalStatsCard stats={additional} />
        </>
      )}
    </div>
  );
}
