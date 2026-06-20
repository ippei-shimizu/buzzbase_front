"use client";
import type { DetailState } from "./detailState";
import type {
  AppearanceSituationMaster,
  ContactQualityMaster,
  PitchTypeMaster,
  TimingMaster,
} from "@app/interface/plateAppearanceMasters";
import { useEffect, useState } from "react";
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

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-bg_sub p-4 flex flex-col gap-y-4">
      <div>
        <h3 className="text-base font-bold">{title}</h3>
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
      <Card title="打席の状況" subtitle="打席時の状況を記録します">
        <CountBSOSelector
          balls={detail.finalBalls}
          strikes={detail.finalStrikes}
          outs={detail.finalOuts}
          onChange={(key, value) => setDetail({ [key]: value })}
        />
        <FirstPitchSwingToggle
          value={detail.firstPitchSwing}
          onChange={(value) => setDetail({ firstPitchSwing: value })}
        />
        <RunnersStateSelector
          value={detail.runnersState}
          onChange={(value) => setDetail({ runnersState: value })}
        />
        <InningStepper
          value={detail.inning}
          onChange={(value) => setDetail({ inning: value })}
        />
      </Card>

      <Card title="打球" subtitle="打球の質感や対応した球種を記録します">
        <MasterChipSelector
          label="打球の質"
          options={contactQualities}
          value={detail.contactQualityId}
          onChange={(id) => setDetail({ contactQualityId: id })}
        />
        <MasterChipSelector
          label="タイミング"
          options={timings}
          value={detail.timingId}
          onChange={(id) => setDetail({ timingId: id })}
        />
        <MasterChipSelector
          label="球種"
          options={pitchTypes}
          value={detail.pitchTypeId}
          onChange={(id) => setDetail({ pitchTypeId: id })}
        />
      </Card>

      <Card title="相手投手" subtitle="自分が記録した投手のみ表示されます">
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
        />
      </Card>

      <Card title="メモ" subtitle="次の打席に活かしたい振り返り">
        <MemoTextArea
          value={detail.selfAnalysisMemo}
          onChange={(text) => setDetail({ selfAnalysisMemo: text || null })}
        />
      </Card>
    </div>
  );
}
