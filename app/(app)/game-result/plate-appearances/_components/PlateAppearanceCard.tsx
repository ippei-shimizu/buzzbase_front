"use client";
import type { PlateAppearanceV2 } from "@app/interface/plateAppearanceV2";
import { NextArrowIcon } from "@app/components/icon/NextArrowIcon";
import { getBattingResultColor } from "@app/utils/battingResultColor";
import {
  buildPitchAndPitcherChips,
  buildSituationChips,
} from "@app/utils/plateAppearanceChips";

interface PlateAppearanceCardProps {
  plateAppearance: PlateAppearanceV2;
  onEdit: () => void;
}

interface MetaItem {
  label: string;
  value: number;
}

const buildMetaItems = (pa: PlateAppearanceV2): MetaItem[] => {
  const items: MetaItem[] = [];
  if ((pa.rbi ?? 0) > 0) items.push({ label: "打点", value: pa.rbi as number });
  if ((pa.run_scored ?? 0) > 0)
    items.push({ label: "得点", value: pa.run_scored as number });
  if ((pa.stolen_bases ?? 0) > 0)
    items.push({ label: "盗塁", value: pa.stolen_bases as number });
  if ((pa.caught_stealing ?? 0) > 0)
    items.push({ label: "盗塁死", value: pa.caught_stealing as number });
  return items;
};

/**
 * 打席リストの1件カード。タップで編集、ゴミ箱で削除する。
 * 上段: 第N打席 + 結果（安打=赤/犠打犠飛=青）。
 * 中段: 打点・得点・盗塁・盗塁死（1以上）+ 詳細未入力バッジ。
 * 下段: 状況チップ / 打球・投手チップ（入力済みのみ）。
 */
export function PlateAppearanceCard({
  plateAppearance,
  onEdit,
}: PlateAppearanceCardProps) {
  const resultText = plateAppearance.batting_result || "未入力";
  const resultColor = getBattingResultColor(resultText);
  const metaItems = buildMetaItems(plateAppearance);
  const situationChips = buildSituationChips(plateAppearance);
  const pitchChips = buildPitchAndPitcherChips(plateAppearance);
  const hasDetail = plateAppearance.has_detail_data;
  const showMetaRow = metaItems.length > 0 || !hasDetail;

  return (
    <button
      type="button"
      className="flex w-full items-center gap-x-2 rounded-xl bg-bg_sub px-4 py-3 text-left"
      onClick={onEdit}
    >
      <div className="flex-1 flex flex-col gap-y-1.5">
        <div className="flex items-center gap-x-2.5">
          <span className="text-xs text-zinc-400 shrink-0">
            第{plateAppearance.batter_box_number}打席
          </span>
          <span className="text-base font-bold" style={{ color: resultColor }}>
            {resultText}
          </span>
        </div>

        {showMetaRow && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {metaItems.map((item) => (
              <span key={item.label} className="text-[13px] text-zinc-300">
                {item.label} {item.value}
              </span>
            ))}
            {!hasDetail && (
              <span className="rounded bg-zinc-600 px-1.5 py-0.5 text-[11px] text-zinc-100">
                詳細未入力
              </span>
            )}
          </div>
        )}

        {situationChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {situationChips.map((chip) => (
              <span
                key={`s-${chip}`}
                className="rounded-md bg-[#424242] px-2 py-0.5 text-[11px] text-zinc-300"
              >
                {chip}
              </span>
            ))}
          </div>
        )}

        {pitchChips.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pitchChips.map((chip) => (
              <span
                key={`p-${chip}`}
                className="rounded-md border border-[#d08000] bg-[#3a3024] px-2 py-0.5 text-[11px] text-zinc-100"
              >
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>
      <NextArrowIcon stroke="#A1A1AA" />
    </button>
  );
}
