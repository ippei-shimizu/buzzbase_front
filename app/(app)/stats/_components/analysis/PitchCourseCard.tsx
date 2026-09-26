"use client";
import type {
  PitchCourseData,
  PitchCoursePitchTypeData,
  PitchCourseZone,
  PitchCourseZoneSummary,
  PitcherFaceoffCourseData,
} from "../../analysisActions";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PitchCourseGrid } from "@app/components/baseball/PitchCourseGrid";
import { PITCH_COURSES, STRIKE_ZONE_COURSES } from "@app/constants/pitchCourse";
import {
  PITCH_COURSE_GRANULARITIES,
  PITCH_COURSE_GRID3_TRACK_FRACTIONS,
  PITCH_COURSE_METRICS,
  foldToGrid3,
  foldToHeightAndSide,
  foldToStrikeAndBallZone,
  formatStrikeoutBreakdown,
  readPitchCourseMetric,
  reliabilityNote,
  sumPitchCourseCounts,
  type FoldedPitchCourseCell,
  type PitchCourseCounts,
  type PitchCourseGranularity,
  type PitchCourseMetric,
  type PitchCourseMetricReading,
} from "./pitchCourseMetrics";

interface PitchCourseCardProps {
  data: PitchCourseData;
  /**
   * 「球種別」タブを最初に開いたときに呼ぶ遅延ローダ。
   * クロス集計は最大 250 セルと大きいため常時取得しない。未指定ならタブ自体を出さない。
   */
  loadPitchTypeCross?: () => Promise<PitchCoursePitchTypeData | null>;
  /**
   * 「投手別」タブを最初に開いたときに呼ぶ遅延ローダ。
   * 投手数×25 セルと大きいため常時取得しない。未指定ならタブ自体を出さない。
   */
  loadPitcherCross?: () => Promise<PitcherFaceoffCourseData | null>;
}

type PitchCourseTab = "course" | "pitch_type" | "pitcher";

interface LazyCross<T> {
  data: T | null;
  isLoading: boolean;
  load: () => void;
}

function useLazyCross<T>(
  loader: (() => Promise<T | null>) | undefined,
  onLoaded: (data: T) => void,
): LazyCross<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const load = () => {
    if (data !== null || isLoading || !loader) return;
    setIsLoading(true);
    void loader()
      .then((result) => {
        setData(result);
        if (result) onLoaded(result);
      })
      .catch(() => setData(null))
      .finally(() => setIsLoading(false));
  };
  return { data, isLoading, load };
}

function MetricCell({
  reading,
  label,
  isStrikeZone = true,
}: {
  reading: PitchCourseMetricReading;
  label?: string;
  isStrikeZone?: boolean;
}) {
  const labelNode = label ? (
    <span className="text-[11px] text-white/90">{label}</span>
  ) : null;
  if (reading.color === null) {
    return (
      <div
        className={`flex h-full w-full flex-col items-center justify-center rounded-[2px] ${
          isStrikeZone ? "bg-[#3f3f3f]" : "bg-[#2f2f2f]"
        }`}
      >
        {labelNode}
        <span className="text-[10px] text-[#71717A]">{reading.value}</span>
      </div>
    );
  }
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center rounded-[2px]"
      style={{
        backgroundColor: reading.color,
        opacity: reading.isReliable ? 1 : 0.5,
      }}
    >
      {labelNode}
      <span
        className={`font-bold text-white ${label ? "text-base" : "text-[11px]"}`}
      >
        {reading.value}
      </span>
      {reading.detail ? (
        <span className="text-[9px] text-white/90">{reading.detail}</span>
      ) : null}
    </div>
  );
}

const SIDE_LABELS = (
  <div
    aria-hidden="true"
    className="flex justify-around pt-1 text-[10px] text-[#71717A]"
  >
    <span>三塁側</span>
    <span>真ん中</span>
    <span>一塁側</span>
  </div>
);

const GRID3_TRACK_TEMPLATE = PITCH_COURSE_GRID3_TRACK_FRACTIONS.map(
  (fraction) => `${fraction}fr`,
).join(" ");

function TilePair({
  cells,
  read,
}: {
  cells: FoldedPitchCourseCell[];
  read: (
    counts: PitchCourseCounts,
    courseCount: number,
  ) => PitchCourseMetricReading;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {cells.map((cell) => (
        <div key={cell.key} className="h-[84px]">
          <MetricCell
            reading={read(cell.counts, cell.courseCount)}
            label={cell.label}
          />
        </div>
      ))}
    </div>
  );
}

function CourseHeatmap({
  zones,
  minAtBats,
  metric,
  granularity,
}: {
  zones: PitchCourseZone[];
  minAtBats: number;
  metric: PitchCourseMetric;
  granularity: PitchCourseGranularity;
}) {
  const total = sumPitchCourseCounts(zones);
  const read = (counts: PitchCourseCounts, courseCount: number) =>
    readPitchCourseMetric(metric, counts, {
      minAtBats,
      totalPlateAppearances: total.plate_appearances,
      courseCount,
    });

  const renderView = () => {
    switch (granularity) {
      case "grid5": {
        const zoneByCourse = new Map(zones.map((zone) => [zone.course, zone]));
        return (
          <>
            <div className="h-[280px]">
              <PitchCourseGrid
                className="h-full"
                renderCell={(course, isStrikeZone) => {
                  const zone = zoneByCourse.get(course);
                  return zone ? (
                    <MetricCell
                      reading={read(zone, 1)}
                      isStrikeZone={isStrikeZone}
                    />
                  ) : null;
                }}
              />
            </div>
            {SIDE_LABELS}
          </>
        );
      }
      case "grid3":
        return (
          <>
            <div
              className="grid h-[280px] gap-px"
              style={{
                gridTemplateColumns: GRID3_TRACK_TEMPLATE,
                gridTemplateRows: GRID3_TRACK_TEMPLATE,
              }}
            >
              {foldToGrid3(zones).map((cell) => (
                <div key={cell.key}>
                  <MetricCell reading={read(cell.counts, cell.courseCount)} />
                </div>
              ))}
            </div>
            {SIDE_LABELS}
          </>
        );
      case "split4": {
        const { height, side } = foldToHeightAndSide(zones);
        return (
          <div className="flex flex-col gap-y-3">
            <div>
              <p className="mb-1 text-[11px] text-[#A1A1AA]">高低</p>
              <TilePair cells={height} read={read} />
            </div>
            <div>
              <p className="mb-1 text-[11px] text-[#A1A1AA]">内外</p>
              <TilePair cells={side} read={read} />
            </div>
            <p className="text-[11px] text-[#71717A]">
              真ん中の1行・1列はどちらにも含めていません
            </p>
          </div>
        );
      }
      case "zone":
        return <TilePair cells={foldToStrikeAndBallZone(zones)} read={read} />;
    }
  };

  const strikeoutBreakdown =
    metric === "strikeout_rate" ? formatStrikeoutBreakdown(total) : null;

  return (
    <div className="mx-auto w-full max-w-[300px]">
      {renderView()}
      {strikeoutBreakdown ? (
        <p className="mt-2 text-center text-[11px] text-[#A1A1AA]">
          {strikeoutBreakdown}
        </p>
      ) : null}
    </div>
  );
}

function ZoneSummaryTile({
  label,
  reading,
}: {
  label: string;
  reading: PitchCourseMetricReading;
}) {
  return (
    <div className="rounded-lg bg-[#27272A] px-3 py-2">
      <p className="text-[11px] text-[#A1A1AA]">{label}</p>
      <p className="text-lg font-extrabold text-[#F4F4F4]">{reading.value}</p>
      {reading.detail ? (
        <p className="text-[11px] text-[#71717A]">{reading.detail}</p>
      ) : null}
    </div>
  );
}

/** ヒートマップ下の注記。参考値の閾値は指標ごとに変わる（打率・長打率は back の min_at_bats）。 */
function Notes({
  metric,
  minAtBats,
  children,
}: {
  metric: PitchCourseMetric;
  minAtBats: number;
  children?: ReactNode;
}) {
  const note = reliabilityNote(metric, minAtBats);
  return (
    <div className="mt-3 flex flex-col gap-y-0.5">
      {note ? <p className="text-[11px] text-[#71717A]">{note}</p> : null}
      <p className="text-[11px] text-[#71717A]">捕手目線で表示しています</p>
      {children}
    </div>
  );
}

function SegmentSelector<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: ReadonlyArray<{ key: T; label: string }>;
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex gap-x-1 rounded-lg border border-[#27272A] p-0.5"
    >
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          aria-pressed={value === option.key}
          className={`flex-1 rounded-md py-1 text-[11px] font-semibold transition-colors ${
            value === option.key
              ? "bg-[#52525B] text-white"
              : "text-[#A1A1AA] hover:text-[#F4F4F4]"
          }`}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * コース別分析カード（Pro）。コース別 / 球種別 / 投手別の3タブに共通の指標・粒度切替を持ち、
 * 球種別・投手別のクロス集計はタブを開いたときにだけ取得する。
 */
export function PitchCourseCard({
  data,
  loadPitchTypeCross,
  loadPitcherCross,
}: PitchCourseCardProps) {
  const [tab, setTab] = useState<PitchCourseTab>("course");
  const [metric, setMetric] = useState<PitchCourseMetric>("batting_average");
  const [granularity, setGranularity] =
    useState<PitchCourseGranularity>("grid5");
  const [selectedPitchTypeId, setSelectedPitchTypeId] = useState<number | null>(
    null,
  );
  const [selectedPitcherId, setSelectedPitcherId] = useState<number | null>(
    null,
  );
  const pitchTypeCross = useLazyCross(loadPitchTypeCross, (result) => {
    const firstActive = result.rows.find((row) => row.plate_appearances > 0);
    setSelectedPitchTypeId(firstActive?.id ?? result.rows[0]?.id ?? null);
  });
  const pitcherCross = useLazyCross(loadPitcherCross, (result) => {
    setSelectedPitcherId(result.rows[0]?.id ?? null);
  });

  if (data.total_target_pa === 0) {
    return (
      <section className="rounded-xl bg-[#3A3A3A] p-4">
        <h3 className="text-base font-bold text-[#F4F4F4]">コース別分析</h3>
        <div className="flex flex-col items-center gap-y-2 py-8">
          <p className="text-sm font-semibold text-[#A1A1AA]">
            詳細記録でコースを入力すると分析が表示されます
          </p>
          <Link
            href="/game-result/lists"
            className="text-xs text-[#d08000] underline"
          >
            試合を記録する
          </Link>
        </div>
      </section>
    );
  }

  const handleTabChange = (next: PitchCourseTab) => {
    setTab(next);
    if (next === "pitch_type") pitchTypeCross.load();
    if (next === "pitcher") pitcherCross.load();
  };

  const cross = pitchTypeCross.data;
  const selectedRow =
    cross?.rows.find((row) => row.id === selectedPitchTypeId) ?? null;
  const pitchers = pitcherCross.data;
  const selectedPitcherRow =
    pitchers?.rows.find((row) => row.id === selectedPitcherId) ?? null;
  const tabs = [
    { key: "course", label: "コース別", isAvailable: true },
    {
      key: "pitch_type",
      label: "球種別",
      isAvailable: loadPitchTypeCross !== undefined,
    },
    {
      key: "pitcher",
      label: "投手別",
      isAvailable: loadPitcherCross !== undefined,
    },
  ] as const;
  const availableTabs = tabs.filter((item) => item.isAvailable);
  const readSummary = (summary: PitchCourseZoneSummary, courseCount: number) =>
    readPitchCourseMetric(metric, summary, {
      minAtBats: data.min_at_bats,
      totalPlateAppearances:
        data.strike_zone.plate_appearances + data.ball_zone.plate_appearances,
      courseCount,
    });

  return (
    <section className="rounded-xl bg-[#3A3A3A] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#F4F4F4]">コース別分析</h3>
        <span className="text-[11px] text-[#71717A]">
          対象 {data.total_target_pa} 打席
        </span>
      </div>
      {availableTabs.length > 1 ? (
        <div className="mt-3 flex gap-x-1 rounded-lg bg-[#27272A] p-1">
          {availableTabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={tab === key}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
                tab === key
                  ? "bg-[#d08000] text-white"
                  : "text-[#A1A1AA] hover:text-[#F4F4F4]"
              }`}
              onClick={() => handleTabChange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-3 flex flex-col gap-y-1.5">
        <SegmentSelector
          label="指標"
          options={PITCH_COURSE_METRICS}
          value={metric}
          onChange={setMetric}
        />
        <SegmentSelector
          label="粒度"
          options={PITCH_COURSE_GRANULARITIES}
          value={granularity}
          onChange={setGranularity}
        />
      </div>

      {tab === "course" ? (
        <div className="mt-4">
          <CourseHeatmap
            zones={data.zones}
            minAtBats={data.min_at_bats}
            metric={metric}
            granularity={granularity}
          />
          {granularity === "zone" ? null : (
            <div className="mt-3 grid grid-cols-2 gap-x-3">
              <ZoneSummaryTile
                label="ストライクゾーン"
                reading={readSummary(
                  data.strike_zone,
                  STRIKE_ZONE_COURSES.length,
                )}
              />
              <ZoneSummaryTile
                label="ボールゾーン"
                reading={readSummary(
                  data.ball_zone,
                  PITCH_COURSES.length - STRIKE_ZONE_COURSES.length,
                )}
              />
            </div>
          )}
          <Notes metric={metric} minAtBats={data.min_at_bats} />
        </div>
      ) : tab === "pitch_type" ? (
        <div className="mt-4">
          {pitchTypeCross.isLoading ? (
            <p className="py-8 text-center text-sm text-[#A1A1AA]">
              読み込み中...
            </p>
          ) : cross === null || cross.rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#A1A1AA]">
              球種別のデータを取得できませんでした
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-1.5">
                {cross.rows.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    aria-pressed={row.id === selectedPitchTypeId}
                    className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                      row.id === selectedPitchTypeId
                        ? "border-[#d08000] bg-[#d08000] text-white"
                        : "border-zinc-500 text-zinc-300"
                    }`}
                    onClick={() => setSelectedPitchTypeId(row.id)}
                  >
                    {row.label}
                    {row.plate_appearances > 0
                      ? ` (${row.plate_appearances})`
                      : ""}
                  </button>
                ))}
              </div>
              {selectedRow ? (
                <div className="mt-3">
                  <CourseHeatmap
                    zones={selectedRow.zones}
                    minAtBats={cross.min_at_bats}
                    metric={metric}
                    granularity={granularity}
                  />
                </div>
              ) : null}
              <Notes metric={metric} minAtBats={cross.min_at_bats} />
            </>
          )}
        </div>
      ) : (
        <div className="mt-4">
          {pitcherCross.isLoading ? (
            <p className="py-8 text-center text-sm text-[#A1A1AA]">
              読み込み中...
            </p>
          ) : pitchers === null ? (
            <p className="py-8 text-center text-sm text-[#A1A1AA]">
              投手別のデータを取得できませんでした
            </p>
          ) : pitchers.rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#A1A1AA]">
              コースを記録した対戦が{pitchers.min_plate_appearances}
              打席以上の投手がいません
            </p>
          ) : (
            <>
              <select
                aria-label="対戦投手"
                className="w-full rounded-lg border border-zinc-500 bg-[#27272A] px-3 py-2 text-sm text-[#F4F4F4] outline-none focus:border-[#d08000]"
                value={selectedPitcherId ?? ""}
                onChange={(event) =>
                  setSelectedPitcherId(Number(event.target.value))
                }
              >
                {pitchers.rows.map((row) => (
                  <option key={row.id} value={row.id}>
                    {row.team_name
                      ? `${row.label}（${row.team_name}）`
                      : row.label}
                    {` ${row.plate_appearances}打席`}
                  </option>
                ))}
              </select>
              {selectedPitcherRow ? (
                <div className="mt-3">
                  <CourseHeatmap
                    zones={selectedPitcherRow.zones}
                    minAtBats={pitchers.min_at_bats}
                    metric={metric}
                    granularity={granularity}
                  />
                </div>
              ) : null}
              <Notes metric={metric} minAtBats={pitchers.min_at_bats}>
                <p className="text-[11px] text-[#71717A]">
                  コースを記録した対戦が{pitchers.min_plate_appearances}
                  打席以上の投手のみ表示しています
                </p>
              </Notes>
            </>
          )}
        </div>
      )}
    </section>
  );
}
