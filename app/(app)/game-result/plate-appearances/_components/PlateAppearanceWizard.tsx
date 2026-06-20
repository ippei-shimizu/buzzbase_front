"use client";
import type {
  HitTypeOption,
  OutTypeOption,
  PlateResultId,
} from "@app/constants/plateResults";
import type {
  HitType,
  OutType,
  PlateAppearanceV2,
  SwingType,
} from "@app/interface/plateAppearanceV2";
import { Button } from "@heroui/react";
import { useState } from "react";
import { NextArrowIcon } from "@app/components/icon/NextArrowIcon";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import {
  createPlateAppearanceV2,
  updatePlateAppearanceV2,
} from "@app/services/v2/plateAppearanceService";
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
  // 指定時は編集モード（PATCH /api/v2/plate_appearances/:id）。
  editingPlateAppearance?: PlateAppearanceV2 | null;
}

type WizardStep = "result" | "score" | "detail";

const detailFromPlateAppearance = (pa: PlateAppearanceV2): DetailState => ({
  finalBalls: pa.final_balls,
  finalStrikes: pa.final_strikes,
  finalOuts: pa.final_outs,
  firstPitchSwing: pa.first_pitch_swing,
  runnersState: pa.runners_state,
  inning: pa.inning,
  contactQualityId: pa.contact_quality?.id ?? null,
  timingId: pa.timing?.id ?? null,
  pitchTypeId: pa.pitch_type?.id ?? null,
  selfAnalysisMemo: pa.self_analysis_memo,
  pitcherId: pa.pitcher?.id ?? null,
  appearanceSituationId: pa.appearance_situation?.id ?? null,
});

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
  editingPlateAppearance,
}: PlateAppearanceWizardProps) {
  const isEdit = !!editingPlateAppearance;
  const initialHitLocation: Point | null =
    editingPlateAppearance?.hit_location_x != null &&
    editingPlateAppearance?.hit_location_y != null
      ? {
          x: Number(editingPlateAppearance.hit_location_x),
          y: Number(editingPlateAppearance.hit_location_y),
        }
      : null;
  const [step, setStep] = useState<WizardStep>("result");
  const [hitLocation, setHitLocation] = useState<Point | null>(
    initialHitLocation,
  );
  const [directionId, setDirectionId] = useState<number | null>(
    editingPlateAppearance?.hit_direction_id ?? null,
  );
  const [plateResultId, setPlateResultId] = useState<PlateResultId | null>(
    (editingPlateAppearance?.plate_result_id as PlateResultId) ?? null,
  );
  const [outType, setOutType] = useState<OutType | null>(
    editingPlateAppearance?.out_type ?? null,
  );
  const [hitType, setHitType] = useState<HitType | null>(
    editingPlateAppearance?.hit_type ?? null,
  );
  const [swingType, setSwingType] = useState<SwingType | null>(
    editingPlateAppearance?.swing_type ?? null,
  );
  const [scores, setScores] = useState({
    rbi: editingPlateAppearance?.rbi ?? 0,
    runScored: editingPlateAppearance?.run_scored ?? 0,
    stolenBases: editingPlateAppearance?.stolen_bases ?? 0,
    caughtStealing: editingPlateAppearance?.caught_stealing ?? 0,
  });
  const [detail, setDetailState] = useState<DetailState>(
    editingPlateAppearance
      ? detailFromPlateAppearance(editingPlateAppearance)
      : EMPTY_DETAIL,
  );
  const [isOutModalOpen, setIsOutModalOpen] = useState(false);
  const [isHitModalOpen, setIsHitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const setDetail = (patch: Partial<DetailState>) =>
    setDetailState((prev) => ({ ...prev, ...patch }));

  // 編集モードはタブで自由に切り替えるため、結果選択での自動遷移はしない。
  const goToScore = () => {
    if (!isEdit) setStep("score");
  };

  const EDIT_TABS: { step: WizardStep; label: string }[] = [
    { step: "result", label: "打席結果" },
    { step: "score", label: "打点・得点" },
    { step: "detail", label: "詳細" },
  ];

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
    const input = {
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
    };
    const result =
      isEdit && editingPlateAppearance
        ? await updatePlateAppearanceV2(editingPlateAppearance.id, input)
        : await createPlateAppearanceV2(input);
    if (result.ok) {
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

      {isEdit && (
        <div className="flex border-b border-zinc-700">
          {EDIT_TABS.map((tab) => (
            <button
              key={tab.step}
              type="button"
              className={`flex-1 pb-2 text-sm font-medium border-b-2 transition-colors ${
                step === tab.step
                  ? "border-primary text-primary"
                  : "border-transparent text-zinc-400"
              }`}
              onClick={() => setStep(tab.step)}
            >
              {tab.label}
            </button>
          ))}
        </div>
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
          <p className="text-center text-base font-medium">打点・得点を入力</p>
          <ScoreCounterInput
            rbi={scores.rbi}
            runScored={scores.runScored}
            stolenBases={scores.stolenBases}
            caughtStealing={scores.caughtStealing}
            onChange={handleScoreChange}
          />
          {!isEdit && (
            <>
              <Button
                variant="light"
                radius="sm"
                className="self-start text-zinc-400"
                onPress={() => setStep("result")}
                isDisabled={isSubmitting}
              >
                打席結果に戻る
              </Button>
              <div className="flex flex-col gap-y-2">
                <Button
                  color="primary"
                  variant="bordered"
                  radius="sm"
                  className="font-bold"
                  onPress={() => setStep("detail")}
                  isDisabled={isSubmitting}
                >
                  詳細を入力する
                </Button>
                <Button
                  color="primary"
                  radius="sm"
                  className="font-bold"
                  onPress={handleSubmit}
                  endContent={<NextArrowIcon stroke="#F4F4F4" />}
                  isDisabled={isSubmitting}
                >
                  スキップして保存
                </Button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <p className="text-center text-base font-medium">詳細データを入力</p>
          <DetailDataForm
            detail={detail}
            setDetail={setDetail}
            defaultTeamId={defaultTeamId}
          />
          {!isEdit && (
            <>
              <Button
                variant="light"
                radius="sm"
                className="self-start text-zinc-400"
                onPress={() => setStep("score")}
                isDisabled={isSubmitting}
              >
                打点・得点に戻る
              </Button>
              <Button
                color="primary"
                radius="sm"
                className="font-bold"
                onPress={handleSubmit}
                endContent={<NextArrowIcon stroke="#F4F4F4" />}
                isDisabled={isSubmitting}
              >
                この打席を保存
              </Button>
            </>
          )}
        </>
      )}

      {isEdit && (
        <Button
          color="primary"
          radius="sm"
          className="font-bold"
          onPress={handleSubmit}
          isDisabled={isSubmitting}
        >
          この打席を更新
        </Button>
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
