"use client";
import type {
  PitcherAttributeBucket,
  PitcherAttributeSummaryData,
} from "../../analysisActions";
import { useState } from "react";
import { formatBattingAverage } from "@app/utils/formatStats";
import { PitcherStatsDetailGrid } from "./PitcherStatsDetailGrid";

interface PitcherAttributeSummaryProps {
  data: PitcherAttributeSummaryData | null;
}

type AxisKey =
  | "by_throw_hand"
  | "by_arm_angle"
  | "by_velocity_zone"
  | "by_pitcher_style";

interface Section {
  axis: AxisKey;
  title: string;
  buckets: PitcherAttributeBucket[];
}

type Tier = "strong" | "mid" | "weak" | "unset";

const TIER_STYLES: Record<
  Tier,
  { bg: string; border: string; accent: string; subtle?: boolean }
> = {
  strong: {
    bg: "rgba(23, 201, 100, 0.18)",
    border: "rgba(23, 201, 100, 0.55)",
    accent: "#17C964",
  },
  mid: {
    bg: "rgba(208, 128, 0, 0.16)",
    border: "rgba(208, 128, 0, 0.55)",
    accent: "#d08000",
  },
  weak: {
    bg: "rgba(243, 18, 96, 0.15)",
    border: "rgba(243, 18, 96, 0.5)",
    accent: "#F31260",
  },
  unset: {
    bg: "rgba(82, 82, 91, 0.25)",
    border: "rgba(82, 82, 91, 0.5)",
    accent: "#A1A1AA",
    subtle: true,
  },
};

const STRONG_THRESHOLD = 0.35;
const WEAK_THRESHOLD = 0.2;

const tierFor = (bucket: PitcherAttributeBucket): Tier => {
  if (bucket.at_bats === 0) return "unset";
  if (bucket.batting_average >= STRONG_THRESHOLD) return "strong";
  if (bucket.batting_average < WEAK_THRESHOLD) return "weak";
  return "mid";
};

// (axis, key) ペアでチップを一意に識別する。null キーも JSON.stringify で安定化する。
const chipId = (axis: AxisKey, key: PitcherAttributeBucket["key"]): string =>
  `${axis}:${JSON.stringify(key)}`;

/**
 * 投手属性4軸（利き手 / 腕の角度 / 球速帯 / 投手タイプ）の打率を、打率帯（得意/普通/苦手）で
 * 色分けしたチップで横並びに見せるカード。チップタップで詳細グリッドを展開する。
 */
export function PitcherAttributeSummary({
  data,
}: PitcherAttributeSummaryProps) {
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  if (!data) return null;

  const sections: Section[] = [
    { axis: "by_throw_hand", title: "利き手", buckets: data.by_throw_hand },
    { axis: "by_arm_angle", title: "腕の角度", buckets: data.by_arm_angle },
    {
      axis: "by_velocity_zone",
      title: "球速帯",
      buckets: data.by_velocity_zone,
    },
    {
      axis: "by_pitcher_style",
      title: "投手タイプ",
      buckets: data.by_pitcher_style,
    },
  ];

  const hasAnyData = sections.some((section) => section.buckets.length > 0);
  if (!hasAnyData) {
    return (
      <section className="rounded-xl bg-[#3A3A3A] p-4">
        <h3 className="text-base font-bold text-[#F4F4F4]">投手タイプ別</h3>
        <div className="flex flex-col items-center py-6">
          <p className="mb-1 text-sm font-semibold text-[#A1A1AA]">
            対戦データなし
          </p>
          <p className="px-4 text-center text-[11px] text-[#71717A]">
            新仕様で記録した打席（投手情報付き）が対象です
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl bg-[#3A3A3A] p-4">
      <div className="mb-3.5 flex items-center justify-between">
        <h3 className="text-base font-bold text-[#F4F4F4]">投手タイプ別</h3>
        <div className="flex items-center gap-2.5">
          <LegendDot color={TIER_STYLES.strong.accent} label="得意" />
          <LegendDot color={TIER_STYLES.mid.accent} label="普通" />
          <LegendDot color={TIER_STYLES.weak.accent} label="苦手" />
        </div>
      </div>
      {sections.map((section) => (
        <AttributeSection
          key={section.axis}
          section={section}
          selectedChip={selectedChip}
          onToggle={(id) =>
            setSelectedChip((prev) => (id === prev ? null : id))
          }
        />
      ))}
    </section>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span
        className="h-[7px] w-[7px] rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] font-semibold text-[#A1A1AA]">{label}</span>
    </div>
  );
}

function AttributeSection({
  section,
  selectedChip,
  onToggle,
}: {
  section: Section;
  selectedChip: string | null;
  onToggle: (id: string) => void;
}) {
  if (section.buckets.length === 0) {
    return (
      <div className="mb-3.5">
        <p className="mb-2 text-xs font-semibold text-[#A1A1AA]">
          {section.title}
        </p>
        <p className="text-[11px] text-[#71717A]">データなし</p>
      </div>
    );
  }

  const selectedBucket = section.buckets.find(
    (bucket) => chipId(section.axis, bucket.key) === selectedChip,
  );

  return (
    <div className="mb-3.5">
      <p className="mb-2 text-xs font-semibold text-[#A1A1AA]">
        {section.title}
      </p>
      <div className="flex flex-wrap gap-2">
        {section.buckets.map((bucket) => {
          const id = chipId(section.axis, bucket.key);
          return (
            <AttributeChip
              key={id}
              bucket={bucket}
              isSelected={id === selectedChip}
              onPress={() => onToggle(id)}
            />
          );
        })}
      </div>
      {selectedBucket ? (
        <div className="mt-2.5">
          <PitcherStatsDetailGrid
            plateAppearances={selectedBucket.plate_appearances}
            atBats={selectedBucket.at_bats}
            hits={selectedBucket.hits}
            baseOnBalls={selectedBucket.base_on_balls}
            hitByPitch={selectedBucket.hit_by_pitch}
            sacrificeFly={selectedBucket.sacrifice_fly}
            battingAverage={selectedBucket.batting_average}
            onBasePercentage={selectedBucket.on_base_percentage}
            sluggingPercentage={selectedBucket.slugging_percentage}
            ops={selectedBucket.ops}
            resultCounts={selectedBucket.result_counts}
          />
        </div>
      ) : null}
    </div>
  );
}

function AttributeChip({
  bucket,
  isSelected,
  onPress,
}: {
  bucket: PitcherAttributeBucket;
  isSelected: boolean;
  onPress: () => void;
}) {
  const tier = tierFor(bucket);
  const tierStyle = TIER_STYLES[tier];

  return (
    <button
      type="button"
      onClick={onPress}
      aria-pressed={isSelected}
      className="flex min-w-[92px] flex-col items-start rounded-lg px-2.5 py-2"
      style={{
        backgroundColor: tierStyle.bg,
        borderColor: isSelected ? tierStyle.accent : tierStyle.border,
        borderWidth: isSelected ? 2 : 1,
      }}
    >
      <span
        className={`mb-0.5 truncate text-[11px] font-semibold ${
          tierStyle.subtle ? "text-[#A1A1AA]" : "text-[#F4F4F4]"
        }`}
      >
        {bucket.label}
      </span>
      <span
        className="text-lg font-extrabold leading-[22px]"
        style={{ color: tierStyle.subtle ? "#A1A1AA" : tierStyle.accent }}
      >
        {formatBattingAverage(bucket.batting_average, bucket.at_bats)}
      </span>
      <span className="mt-0.5 text-[10px] text-[#A1A1AA]">
        {bucket.at_bats}-{bucket.hits}
      </span>
    </button>
  );
}
