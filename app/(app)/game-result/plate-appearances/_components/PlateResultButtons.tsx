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

// out 系（赤）で表示する plate_result_id（アウト/三振/振り逃げ）。それ以外は primary。
const OUT_COLORED_IDS: readonly number[] = [
  PLATE_RESULT_IDS.GROUND_OUT,
  PLATE_RESULT_IDS.FLY_OUT,
  PLATE_RESULT_IDS.FOUL_FLY,
  PLATE_RESULT_IDS.LINE_OUT,
  PLATE_RESULT_IDS.DOUBLE_PLAY,
  PLATE_RESULT_IDS.STRIKEOUT,
  PLATE_RESULT_IDS.STRIKEOUT_REACHED,
];

const colorFor = (plateResultId: number): "danger" | "primary" =>
  OUT_COLORED_IDS.includes(plateResultId) ? "danger" : "primary";

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
            color="danger"
            variant="bordered"
            radius="sm"
            className="font-bold justify-between"
            isDisabled={!hasHitLocation}
            onPress={onSelectOut}
            endContent={<NextArrowIcon stroke="#f31260" />}
          >
            アウト
          </Button>
          <Button
            color="primary"
            variant="bordered"
            radius="sm"
            className="font-bold justify-between"
            isDisabled={!hasHitLocation}
            onPress={onSelectHit}
            endContent={<NextArrowIcon stroke="#d08000" />}
          >
            ヒット
          </Button>
          {DIRECTION_ONLY_RESULT_OPTIONS.map((option) => {
            const isSelected = selectedPlateResultId === option.plate_result_id;
            return (
              <Button
                key={option.plate_result_id}
                color="primary"
                variant={isSelected ? "solid" : "bordered"}
                radius="sm"
                className="font-bold"
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
                color={colorFor(option.plate_result_id)}
                variant={isSelected ? "solid" : "bordered"}
                radius="sm"
                className="font-bold"
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
