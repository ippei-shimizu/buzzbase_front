"use client";
import type { SwingType } from "@app/interface/plateAppearanceV2";
import { Button } from "@heroui/react";
import { NextArrowIcon } from "@app/components/icon/NextArrowIcon";
import {
  DIRECTION_ONLY_RESULT_OPTIONS,
  NO_DIRECTION_RESULT_OPTIONS,
  PLATE_RESULT_IDS,
  type PlateResultId,
} from "@app/constants/plateResults";

interface PlateResultButtonsProps {
  hasHitLocation: boolean;
  selectedPlateResultId?: PlateResultId | null;
  selectedSwingType?: SwingType | null;
  onSelectNoDirection: (
    plateResultId: PlateResultId,
    swingType?: SwingType,
  ) => void;
  onSelectOut: () => void;
  onSelectHit: () => void;
  onSelectDirectionOnly: (plateResultId: PlateResultId) => void;
}

// mobile に合わせた 2 階調配色。HeroUI のテーマ依存（primary が環境で青に解決される）を
// 避けるため、リテラルの Tailwind クラスで色を固定する。
// オレンジ #d08000: ヒット / 失策 / 野選 / 犠打 / 犠飛 / 四球 / 死球 / 打撃妨害
// 赤 #f31260: アウト / 空振り三振 / 見逃し三振 / 振り逃げ
const ORANGE = "#d08000";
const RED = "#f31260";
const ORANGE_BORDER = "border-2 border-[#d08000] bg-transparent text-[#d08000]";
const ORANGE_SOLID = "border-2 border-[#d08000] bg-[#d08000] text-white";
const RED_BORDER = "border-2 border-[#f31260] bg-transparent text-[#f31260]";
const RED_SOLID = "border-2 border-[#f31260] bg-[#f31260] text-white";

// out 系（赤）で表示する plate_result_id（アウト/三振/振り逃げ）。それ以外はオレンジ。
const OUT_COLORED_IDS: readonly number[] = [
  PLATE_RESULT_IDS.GROUND_OUT,
  PLATE_RESULT_IDS.FLY_OUT,
  PLATE_RESULT_IDS.FOUL_FLY,
  PLATE_RESULT_IDS.LINE_OUT,
  PLATE_RESULT_IDS.DOUBLE_PLAY,
  PLATE_RESULT_IDS.STRIKEOUT,
  PLATE_RESULT_IDS.STRIKEOUT_REACHED,
];

const toneFor = (plateResultId: number): "orange" | "red" =>
  OUT_COLORED_IDS.includes(plateResultId) ? "red" : "orange";

const toneClass = (tone: "orange" | "red", selected: boolean): string => {
  if (tone === "red") return selected ? RED_SOLID : RED_BORDER;
  return selected ? ORANGE_SOLID : ORANGE_BORDER;
};

/**
 * 打席結果ボタン群。打球方向あり系（アウト/ヒット/失策/野選/犠打/犠飛）はグラウンド
 * クリック後のみ活性。打球方向なし系（三振/四球/死球/打撃妨害/振り逃げ）は未クリック時のみ活性。
 */
export function PlateResultButtons({
  hasHitLocation,
  selectedPlateResultId,
  selectedSwingType,
  onSelectNoDirection,
  onSelectOut,
  onSelectHit,
  onSelectDirectionOnly,
}: PlateResultButtonsProps) {
  return (
    <div className="flex flex-col gap-y-5">
      <section className="flex flex-col gap-y-2">
        <p className="text-sm text-zinc-400">
          打球方向あり（グラウンドをクリック）
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="bordered"
            radius="sm"
            className={`font-bold justify-between ${RED_BORDER}`}
            isDisabled={!hasHitLocation}
            onPress={onSelectOut}
            endContent={<NextArrowIcon stroke={RED} />}
          >
            アウト
          </Button>
          <Button
            variant="bordered"
            radius="sm"
            className={`font-bold justify-between ${ORANGE_BORDER}`}
            isDisabled={!hasHitLocation}
            onPress={onSelectHit}
            endContent={<NextArrowIcon stroke={ORANGE} />}
          >
            ヒット
          </Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {DIRECTION_ONLY_RESULT_OPTIONS.map((option) => {
            const isSelected = selectedPlateResultId === option.plate_result_id;
            return (
              <Button
                key={option.plate_result_id}
                variant="bordered"
                radius="sm"
                className={`font-bold min-w-0 px-0 ${toneClass(
                  "orange",
                  isSelected,
                )}`}
                isDisabled={!hasHitLocation}
                onPress={() => onSelectDirectionOnly(option.plate_result_id)}
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-y-2">
        <p className="text-sm text-zinc-400">打球方向なし</p>
        <div className="grid grid-cols-2 gap-2">
          {NO_DIRECTION_RESULT_OPTIONS.map((option) => {
            const isSelected =
              selectedPlateResultId === option.plate_result_id &&
              (option.swing_type == null ||
                option.swing_type === selectedSwingType);
            return (
              <Button
                key={`${option.plate_result_id}-${option.label}`}
                variant="bordered"
                radius="sm"
                className={`font-bold ${toneClass(
                  toneFor(option.plate_result_id),
                  isSelected,
                )}`}
                isDisabled={hasHitLocation}
                onPress={() =>
                  onSelectNoDirection(option.plate_result_id, option.swing_type)
                }
              >
                {option.label}
              </Button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
