"use client";
import type { DetailState } from "./detailState";
import type {
  AppearanceSituationMaster,
  ContactQualityMaster,
  PitchTypeMaster,
  TimingMaster,
} from "@app/interface/plateAppearanceMasters";
import {
  FlagIcon,
  PencilSquareIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { BallIcon } from "@app/components/icon/BallIcon";
import {
  getAppearanceSituations,
  getContactQualities,
  getPitchTypes,
  getTimings,
} from "@app/services/v2/masterService";
import { CountBSOSelector } from "./CountBSOSelector";
import {
  FirstPitchSwingToggle,
  InningStepper,
  MemoTextArea,
  RunnersStateSelector,
} from "./DetailFields";
import { MasterChipSelector } from "./MasterChipSelector";
import { PitcherSelector } from "./PitcherSelector";

interface DetailDataFormProps {
  detail: DetailState;
  setDetail: (patch: Partial<DetailState>) => void;
  defaultTeamId?: number | null;
}

// mobile と同様、各項目に1文の説明を出す。文言は1箇所に集約する。
const SECTION_DESCRIPTIONS = {
  finalCount: "打席が終わった時点のボール・ストライク・アウトのカウント",
  firstPitchSwing: "1球目を打って打席結果が決まったかどうか",
  runnersState: "打席結果が出たタイミングのランナー位置",
  inning: "この打席が何回（イニング）目に発生したか",
  contactQuality: "ボールがバットのどこに当たった感触か",
  timing: "ピッチャーの球に対するスイングのタイミング",
  pitchType: "打席結果が決まった最後の1球の球種",
  selfAnalysisMemo: "打席を振り返って、自分の良かった点・課題を書き残す",
  appearanceSituation: "投手の登板タイミング（試合終盤の対戦成績の分析に使う）",
} as const;

function Card({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-bg_sub p-4 flex flex-col gap-y-4">
      <div>
        <div className="flex items-center gap-x-2">
          <span className="text-[#d08000]">{icon}</span>
          <h3 className="text-base font-bold">{title}</h3>
        </div>
        <p className="text-xs text-zinc-400">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

/**
 * 打席詳細入力（Step3）の本体。打席の状況 / 打球 / 相手投手 / メモ の4カードに分け、
 * すべて任意入力。マスタはサーバーアクションで取得する。
 */
export function DetailDataForm({
  detail,
  setDetail,
  defaultTeamId,
}: DetailDataFormProps) {
  const [contactQualities, setContactQualities] = useState<
    ContactQualityMaster[]
  >([]);
  const [timings, setTimings] = useState<TimingMaster[]>([]);
  const [pitchTypes, setPitchTypes] = useState<PitchTypeMaster[]>([]);
  const [appearanceSituations, setAppearanceSituations] = useState<
    AppearanceSituationMaster[]
  >([]);

  useEffect(() => {
    getContactQualities().then(setContactQualities);
    getTimings().then(setTimings);
    getPitchTypes().then(setPitchTypes);
    getAppearanceSituations().then(setAppearanceSituations);
  }, []);

  return (
    <div className="flex flex-col gap-y-4">
      <Card
        title="打席の状況"
        subtitle="打席時の状況を記録します"
        icon={<FlagIcon className="h-5 w-5" />}
      >
        <CountBSOSelector
          balls={detail.finalBalls}
          strikes={detail.finalStrikes}
          outs={detail.finalOuts}
          onChange={(key, value) => setDetail({ [key]: value })}
          description={SECTION_DESCRIPTIONS.finalCount}
        />
        <FirstPitchSwingToggle
          value={detail.firstPitchSwing}
          onChange={(value) => setDetail({ firstPitchSwing: value })}
          description={SECTION_DESCRIPTIONS.firstPitchSwing}
        />
        <RunnersStateSelector
          value={detail.runnersState}
          onChange={(value) => setDetail({ runnersState: value })}
          description={SECTION_DESCRIPTIONS.runnersState}
        />
        <InningStepper
          value={detail.inning}
          onChange={(value) => setDetail({ inning: value })}
          description={SECTION_DESCRIPTIONS.inning}
        />
      </Card>

      <Card
        title="打球"
        subtitle="打球の質感や対応した球種を記録します"
        icon={<BallIcon width="20" height="20" fill="#d08000" />}
      >
        <MasterChipSelector
          label="打球の質"
          options={contactQualities}
          value={detail.contactQualityId}
          onChange={(id) => setDetail({ contactQualityId: id })}
          description={SECTION_DESCRIPTIONS.contactQuality}
        />
        <MasterChipSelector
          label="タイミング"
          options={timings}
          value={detail.timingId}
          onChange={(id) => setDetail({ timingId: id })}
          description={SECTION_DESCRIPTIONS.timing}
        />
        <MasterChipSelector
          label="球種"
          options={pitchTypes}
          value={detail.pitchTypeId}
          onChange={(id) => setDetail({ pitchTypeId: id })}
          description={SECTION_DESCRIPTIONS.pitchType}
        />
      </Card>

      <Card
        title="相手投手"
        subtitle="対戦した投手を選択 / 新規追加すると、投手別の成績が見られる"
        icon={<UserIcon className="h-5 w-5" />}
      >
        <PitcherSelector
          value={detail.pitcherId}
          onChange={(id) => setDetail({ pitcherId: id })}
          defaultTeamId={defaultTeamId}
        />
        <MasterChipSelector
          label="登板状況"
          options={appearanceSituations}
          value={detail.appearanceSituationId}
          onChange={(id) => setDetail({ appearanceSituationId: id })}
          description={SECTION_DESCRIPTIONS.appearanceSituation}
        />
      </Card>

      <Card
        title="メモ"
        subtitle="次の打席に活かしたい振り返り"
        icon={<PencilSquareIcon className="h-5 w-5" />}
      >
        <MemoTextArea
          value={detail.selfAnalysisMemo}
          onChange={(text) => setDetail({ selfAnalysisMemo: text || null })}
          description={SECTION_DESCRIPTIONS.selfAnalysisMemo}
        />
      </Card>
    </div>
  );
}
