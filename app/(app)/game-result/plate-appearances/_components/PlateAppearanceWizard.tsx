"use client";
import type {
  HitTypeOption,
  OutTypeOption,
  PlateResultId,
} from "@app/constants/plateResults";
import type {
  HitType,
  OutType,
  SwingType,
} from "@app/interface/plateAppearanceV2";
import { Button } from "@heroui/react";
import { useState } from "react";
import { NextArrowIcon } from "@app/components/icon/NextArrowIcon";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { createPlateAppearanceV2 } from "@app/services/v2/plateAppearanceService";
import { roundHitLocation, type Point } from "@app/utils/groundZoneDetector";
import { DetailDataForm } from "./detail/DetailDataForm";
import { EMPTY_DETAIL, type DetailState } from "./detail/detailState";
import { GroundTapField } from "./GroundTapField";
import { HitTypeModal } from "./HitTypeModal";
import { OutTypeModal } from "./OutTypeModal";
import { PlateResultButtons } from "./PlateResultButtons";
import { ScoreCounterInput, type ScoreCounterKey } from "./ScoreCounterInput";

interface PlateAppearanceWizardProps {
  gameResultId: number;
  batterBoxNumber: number;
  onCompleted: () => void;
  onCancel?: () => void;
  defaultTeamId?: number | null;
}

type WizardStep = "result" | "score" | "detail";

/**
 * 1 打席分の記録ウィザード。
 * Step1: グラウンドで打球方向を選び、打席結果を確定する。
 * Step2: 打点・得点・盗塁・盗塁死を入力して保存する（POST /api/v2/plate_appearances）。
 */
export function PlateAppearanceWizard({
  gameResultId,
  batterBoxNumber,
  onCompleted,
  onCancel,
  defaultTeamId,
}: PlateAppearanceWizardProps) {
  const [step, setStep] = useState<WizardStep>("result");
  const [hitLocation, setHitLocation] = useState<Point | null>(null);
  const [directionId, setDirectionId] = useState<number | null>(null);
  const [plateResultId, setPlateResultId] = useState<PlateResultId | null>(
    null,
  );
  const [outType, setOutType] = useState<OutType | null>(null);
  const [hitType, setHitType] = useState<HitType | null>(null);
  const [swingType, setSwingType] = useState<SwingType | null>(null);
  const [scores, setScores] = useState({
    rbi: 0,
    runScored: 0,
    stolenBases: 0,
    caughtStealing: 0,
  });
  const [detail, setDetailState] = useState<DetailState>(EMPTY_DETAIL);
  const [isOutModalOpen, setIsOutModalOpen] = useState(false);
  const [isHitModalOpen, setIsHitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const setDetail = (patch: Partial<DetailState>) =>
    setDetailState((prev) => ({ ...prev, ...patch }));

  const goToScore = () => setStep("score");

  const handleGroundSelect = (args: {
    x: number;
    y: number;
    directionId: number | null;
  }) => {
    setHitLocation({ x: args.x, y: args.y });
    setDirectionId(args.directionId);
  };

  const handleSelectOutOption = (option: OutTypeOption) => {
    setPlateResultId(option.plate_result_id);
    setOutType(option.out_type);
    setHitType(null);
    setSwingType(null);
    setIsOutModalOpen(false);
    goToScore();
  };

  const handleSelectHitOption = (option: HitTypeOption) => {
    setPlateResultId(option.plate_result_id);
    setHitType(option.hit_type);
    setOutType(null);
    setSwingType(null);
    setIsHitModalOpen(false);
    goToScore();
  };

  const handleSelectDirectionOnly = (id: PlateResultId) => {
    setPlateResultId(id);
    setOutType(null);
    setHitType(null);
    setSwingType(null);
    goToScore();
  };

  const handleSelectNoDirection = (
    id: PlateResultId,
    selectedSwingType?: SwingType,
  ) => {
    // 打球方向なしの結果は座標・方向を持たない。
    setHitLocation(null);
    setDirectionId(null);
    setPlateResultId(id);
    setOutType(null);
    setHitType(null);
    setSwingType(selectedSwingType ?? null);
    goToScore();
  };

  const handleScoreChange = (key: ScoreCounterKey, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (plateResultId === null || isSubmitting) return;
    setIsSubmitting(true);
    setErrors([]);
    const result = await createPlateAppearanceV2({
      game_result_id: gameResultId,
      batter_box_number: batterBoxNumber,
      plate_result_id: plateResultId,
      hit_direction_id: directionId,
      out_type: outType,
      hit_type: hitType,
      swing_type: swingType,
      hit_location_x: hitLocation ? roundHitLocation(hitLocation.x) : null,
      hit_location_y: hitLocation ? roundHitLocation(hitLocation.y) : null,
      rbi: scores.rbi,
      run_scored: scores.runScored,
      stolen_bases: scores.stolenBases,
      caught_stealing: scores.caughtStealing,
      final_balls: detail.finalBalls,
      final_strikes: detail.finalStrikes,
      final_outs: detail.finalOuts,
      first_pitch_swing: detail.firstPitchSwing,
      runners_state: detail.runnersState,
      inning: detail.inning,
      contact_quality_id: detail.contactQualityId,
      timing_id: detail.timingId,
      pitch_type_id: detail.pitchTypeId,
      self_analysis_memo: detail.selfAnalysisMemo,
      pitcher_id: detail.pitcherId,
      appearance_situation_id: detail.appearanceSituationId,
    });
    if (result.ok) {
      // onCompleted が遷移しなかった場合でもボタンが永続 disabled にならないよう先に解除する。
      setIsSubmitting(false);
      onCompleted();
    } else {
      setErrors(result.errors);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-6">
      {isSubmitting && <LoadingSpinner />}
      {errors.length > 0 && (
        <ul className="text-red-500 text-sm list-disc pl-5">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      {step === "result" ? (
        <>
          <p className="text-center text-base font-medium">
            第{batterBoxNumber}打席の結果を入力
          </p>
          <GroundTapField
            hitLocation={hitLocation}
            onSelect={handleGroundSelect}
          />
          <PlateResultButtons
            hasHitLocation={hitLocation !== null}
            selectedPlateResultId={plateResultId}
            selectedSwingType={swingType}
            onSelectOut={() => setIsOutModalOpen(true)}
            onSelectHit={() => setIsHitModalOpen(true)}
            onSelectDirectionOnly={handleSelectDirectionOnly}
            onSelectNoDirection={handleSelectNoDirection}
          />
          {onCancel && (
            <Button
              variant="light"
              radius="sm"
              className="self-center text-zinc-400"
              onPress={onCancel}
            >
              記録を中断する
            </Button>
          )}
        </>
      ) : step === "score" ? (
        <>
          <p className="text-center text-base font-medium">
            第{batterBoxNumber}打席 打点・得点を入力
          </p>
          <ScoreCounterInput
            rbi={scores.rbi}
            runScored={scores.runScored}
            stolenBases={scores.stolenBases}
            caughtStealing={scores.caughtStealing}
            onChange={handleScoreChange}
          />
          <div className="flex flex-col gap-y-3">
            <Button
              variant="bordered"
              radius="sm"
              className="w-full font-bold border-2 border-[#d08000] bg-transparent text-[#d08000]"
              onPress={() => setStep("result")}
              isDisabled={isSubmitting}
            >
              打席結果に戻る
            </Button>
            <Button
              radius="sm"
              className="w-full font-bold bg-[#d08000] text-white"
              onPress={() => setStep("detail")}
              endContent={<NextArrowIcon stroke="#F4F4F4" />}
              isDisabled={isSubmitting}
            >
              詳細を入力する
            </Button>
            <Button
              variant="light"
              radius="sm"
              className="w-full font-bold text-[#d08000] underline"
              onPress={handleSubmit}
              isDisabled={isSubmitting}
            >
              スキップして保存
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-base font-bold">
              第{batterBoxNumber}打席の詳細（すべて任意）
            </p>
            <Button
              variant="light"
              radius="sm"
              className="text-[#d08000] underline"
              onPress={handleSubmit}
              isDisabled={isSubmitting}
            >
              スキップして完了
            </Button>
          </div>
          <DetailDataForm
            detail={detail}
            setDetail={setDetail}
            defaultTeamId={defaultTeamId}
          />
          <div className="flex flex-col gap-y-3">
            <Button
              variant="bordered"
              radius="sm"
              className="w-full font-bold border-2 border-[#d08000] bg-transparent text-[#d08000]"
              onPress={() => setStep("score")}
              isDisabled={isSubmitting}
            >
              打点・得点に戻る
            </Button>
            <Button
              radius="sm"
              className="w-full font-bold bg-[#d08000] text-white"
              onPress={handleSubmit}
              endContent={<NextArrowIcon stroke="#F4F4F4" />}
              isDisabled={isSubmitting}
            >
              この打席を保存
            </Button>
          </div>
        </>
      )}

      <OutTypeModal
        isOpen={isOutModalOpen}
        onSelect={handleSelectOutOption}
        onClose={() => setIsOutModalOpen(false)}
      />
      <HitTypeModal
        isOpen={isHitModalOpen}
        onSelect={handleSelectHitOption}
        onClose={() => setIsHitModalOpen(false)}
      />
    </div>
  );
}
