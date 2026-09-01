"use client";
import type {
  PitchCourseData,
  PitchCoursePitchTypeData,
  PitchCourseZone,
} from "../../analysisActions";
import Link from "next/link";
import { useState } from "react";
import { PitchCourseGrid } from "@app/components/baseball/PitchCourseGrid";
import { formatBattingAverage } from "@app/utils/formatStats";

interface PitchCourseCardProps {
  data: PitchCourseData;
  /**
   * 「球種別」タブを最初に開いたときに呼ぶ遅延ローダ。
   * クロス集計は最大 250 セルと大きいため常時取得しない。未指定ならタブ自体を出さない。
   */
  loadPitchTypeCross?: () => Promise<PitchCoursePitchTypeData | null>;
}

type PitchCourseTab = "course" | "pitch_type";

/**
 * 固定閾値の色スケール。データ内 min/max の相対スケールにすると、フィルタを
 * 変えるたびに同じ打率のセルの色が変わって比較できなくなるため固定にする。
 */
const colorForAverage = (average: number): string => {
  if (average >= 0.45) return "#d64545";
  if (average >= 0.35) return "#d98236";
  if (average >= 0.25) return "#c9a227";
  if (average >= 0.15) return "#4f9e6b";
  return "#4173b3";
};

function ZoneCell({
  zone,
  minAtBats,
}: {
  zone: PitchCourseZone;
  minAtBats: number;
}) {
  if (zone.at_bats === 0) {
    // 打数 0 は色スケールの対象外（無彩色 + "-"）。
    return (
      <div
        className={`flex h-full w-full items-center justify-center rounded-[2px] ${
          zone.is_strike_zone ? "bg-[#3f3f3f]" : "bg-[#2f2f2f]"
        }`}
      >
        <span className="text-[10px] text-[#71717A]">-</span>
      </div>
    );
  }
  const isReliable = zone.at_bats >= minAtBats;
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center rounded-[2px]"
      style={{
        backgroundColor: colorForAverage(zone.batting_average),
        opacity: isReliable ? 1 : 0.5,
      }}
    >
      <span className="text-[11px] font-bold text-white">
        {formatBattingAverage(zone.batting_average, zone.at_bats)}
      </span>
      {isReliable ? null : (
        <span className="text-[9px] text-white/90">({zone.at_bats}打数)</span>
      )}
    </div>
  );
}

function ZoneHeatmap({
  zones,
  minAtBats,
}: {
  zones: PitchCourseZone[];
  minAtBats: number;
}) {
  const zoneByCourse = new Map(zones.map((zone) => [zone.course, zone]));
  return (
    <div className="mx-auto w-full max-w-[300px]">
      <div className="h-[280px]">
        <PitchCourseGrid
          className="h-full"
          renderCell={(course) => {
            const zone = zoneByCourse.get(course);
            return zone ? <ZoneCell zone={zone} minAtBats={minAtBats} /> : null;
          }}
        />
      </div>
      <div
        aria-hidden="true"
        className="flex justify-around pt-1 text-[10px] text-[#71717A]"
      >
        <span>三塁側</span>
        <span>真ん中</span>
        <span>一塁側</span>
      </div>
    </div>
  );
}

/** ヒートマップ下の注記。参考値の閾値は back が返す min_at_bats に合わせる。 */
function Notes({ minAtBats }: { minAtBats: number }) {
  return (
    <div className="mt-3 flex flex-col gap-y-0.5">
      <p className="text-[11px] text-[#71717A]">
        打数が{minAtBats}未満のコースは参考値です
      </p>
      <p className="text-[11px] text-[#71717A]">捕手目線で表示しています</p>
    </div>
  );
}

/**
 * コース別の打率カード（Pro）。コース別 / 球種別の2タブ構成で、
 * 球種別のクロス集計はタブを開いたときにだけ取得する。
 */
export function PitchCourseCard({
  data,
  loadPitchTypeCross,
}: PitchCourseCardProps) {
  const [tab, setTab] = useState<PitchCourseTab>("course");
  const [cross, setCross] = useState<PitchCoursePitchTypeData | null>(null);
  const [isCrossLoading, setIsCrossLoading] = useState(false);
  const [selectedPitchTypeId, setSelectedPitchTypeId] = useState<number | null>(
    null,
  );

  if (data.total_target_pa === 0) {
    return (
      <section className="rounded-xl bg-[#3A3A3A] p-4">
        <h3 className="text-base font-bold text-[#F4F4F4]">コース別の打率</h3>
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
    if (
      next === "pitch_type" &&
      cross === null &&
      !isCrossLoading &&
      loadPitchTypeCross
    ) {
      setIsCrossLoading(true);
      void loadPitchTypeCross().then((result) => {
        setCross(result);
        if (result) {
          const firstActive = result.rows.find(
            (row) => row.plate_appearances > 0,
          );
          setSelectedPitchTypeId(firstActive?.id ?? result.rows[0]?.id ?? null);
        }
        setIsCrossLoading(false);
      });
    }
  };

  const selectedRow =
    cross?.rows.find((row) => row.id === selectedPitchTypeId) ?? null;

  return (
    <section className="rounded-xl bg-[#3A3A3A] p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#F4F4F4]">コース別の打率</h3>
        <span className="text-[11px] text-[#71717A]">
          対象 {data.total_target_pa} 打席
        </span>
      </div>
      {loadPitchTypeCross ? (
        <div className="mt-3 flex gap-x-1 rounded-lg bg-[#27272A] p-1">
          {(
            [
              { key: "course", label: "コース別" },
              { key: "pitch_type", label: "球種別" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
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

      {tab === "course" ? (
        <div className="mt-4">
          <ZoneHeatmap zones={data.zones} minAtBats={data.min_at_bats} />
          <div className="mt-3 grid grid-cols-2 gap-x-3">
            <div className="rounded-lg bg-[#27272A] px-3 py-2">
              <p className="text-[11px] text-[#A1A1AA]">ストライクゾーン</p>
              <p className="text-lg font-extrabold text-[#F4F4F4]">
                {formatBattingAverage(
                  data.strike_zone.batting_average,
                  data.strike_zone.at_bats,
                )}
              </p>
              <p className="text-[11px] text-[#71717A]">
                ({data.strike_zone.at_bats}-{data.strike_zone.hits})
              </p>
            </div>
            <div className="rounded-lg bg-[#27272A] px-3 py-2">
              <p className="text-[11px] text-[#A1A1AA]">ボールゾーン</p>
              <p className="text-lg font-extrabold text-[#F4F4F4]">
                {formatBattingAverage(
                  data.ball_zone.batting_average,
                  data.ball_zone.at_bats,
                )}
              </p>
              <p className="text-[11px] text-[#71717A]">
                ({data.ball_zone.at_bats}-{data.ball_zone.hits})
              </p>
            </div>
          </div>
          <Notes minAtBats={data.min_at_bats} />
        </div>
      ) : (
        <div className="mt-4">
          {isCrossLoading ? (
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
                  <ZoneHeatmap
                    zones={selectedRow.zones}
                    minAtBats={cross.min_at_bats}
                  />
                </div>
              ) : null}
              <Notes minAtBats={cross.min_at_bats} />
            </>
          )}
        </div>
      )}
    </section>
  );
}
