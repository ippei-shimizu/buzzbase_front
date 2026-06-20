"use client";
import type {
  BreakdownData,
  CountSituation,
  CountSituations,
  RunnersSituationSummary,
} from "../../analysisActions";
import { formatRate } from "@app/utils/formatStats";
import { BreakdownBars } from "./BreakdownBars";

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl bg-bg_sub p-4 flex flex-col gap-y-3">
      <h3 className="text-sm font-bold">{title}</h3>
      {children}
    </section>
  );
}

export function ContactQualityCard({ data }: { data: BreakdownData }) {
  return (
    <Card title="打球の質">
      <BreakdownBars breakdown={data.breakdown} />
    </Card>
  );
}

export function TimingCard({ data }: { data: BreakdownData }) {
  return (
    <Card title="タイミング">
      <BreakdownBars breakdown={data.breakdown} />
    </Card>
  );
}

export function OutTypeCard({ data }: { data: BreakdownData }) {
  return (
    <Card title="アウトの内訳">
      <BreakdownBars breakdown={data.breakdown} />
    </Card>
  );
}

function SituationCell({
  label,
  situation,
}: {
  label: string;
  situation: CountSituation;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-zinc-800 py-3">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className="text-xl font-bold text-yellow-500">
        {formatRate(situation.batting_average)}
      </span>
      <span className="text-xs text-zinc-400">
        {situation.hits}/{situation.at_bats}
      </span>
    </div>
  );
}

export function CountSituationCards({ data }: { data: CountSituations }) {
  return (
    <Card title="カウント別打率">
      {data.total_target_pa === 0 ? (
        <p className="text-sm text-zinc-500">対象データがありません。</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          <SituationCell label="初球" situation={data.first_pitch} />
          <SituationCell
            label="有利カウント"
            situation={data.favorable_count}
          />
          <SituationCell label="追い込み" situation={data.pinch_count} />
        </div>
      )}
    </Card>
  );
}

export function RunnersSituationCard({
  data,
}: {
  data: RunnersSituationSummary;
}) {
  return (
    <Card title="得点圏">
      {data.at_bats === 0 ? (
        <p className="text-sm text-zinc-500">対象データがありません。</p>
      ) : (
        <div className="flex items-end gap-x-3">
          <span className="text-3xl font-bold text-yellow-500">
            {formatRate(data.batting_average)}
          </span>
          <span className="text-sm text-zinc-400">
            {data.hits}安打 / {data.at_bats}打数（本塁打{data.home_run}）
          </span>
        </div>
      )}
    </Card>
  );
}
