"use client";

import type { SeasonData, TournamentData } from "@app/interface";
import type { Goal, GoalKind, GoalPeriodType } from "@app/types/goal";
import type { PracticeMenu } from "@app/types/practice";
import LockClosedIcon from "@heroicons/react/24/solid/LockClosedIcon";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useState } from "react";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import {
  GOAL_COMPARISON_LABELS,
  GOAL_KIND_DESCRIPTIONS,
  GOAL_KIND_LABELS,
  GOAL_METRIC_CATEGORIES,
  GOAL_PERIOD_LABELS,
  GOAL_PERIOD_ORDER,
  metricExample,
  metricFor,
  metricsInCategory,
} from "@app/constants/goal";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  goalPeriodGateFeature,
  lockedGoalFeature,
} from "../_utils/goalEntitlement";
import {
  type GoalFormValues,
  hasAutoRange,
  initialGoalFormValues,
  isMenuMetric,
  validateGoalForm,
} from "../_utils/goalForm";
import {
  AUTO_RANGE_HINTS,
  IMMUTABLE_FIELDS_NOTICE,
  MANUAL_CURRENT_VALUE_HINT,
  MENU_METRIC_HINT,
  NO_PRACTICE_MENU_MESSAGE,
  NO_SEASON_MESSAGE,
  NO_TOURNAMENT_MESSAGE,
} from "./goalCopy";

const KIND_ORDER: readonly GoalKind[] = ["numeric", "qualitative", "manual"];

interface GoalFormModalProps {
  /** 編集対象。null なら新規作成。 */
  goal: Goal | null;
  seasons: SeasonData[];
  tournaments: TournamentData[];
  menus: PracticeMenu[];
  today: string;
  isSaving: boolean;
  serverErrors: string[];
  onClose: () => void;
  onSubmit: (values: GoalFormValues) => void;
}

function ChoiceChip({
  label,
  isActive,
  isDisabled,
  onSelect,
}: {
  label: string;
  isActive: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      disabled={isDisabled}
      onClick={onSelect}
      className={`rounded-full px-3.5 py-2 text-xs font-bold transition-colors disabled:cursor-not-allowed ${
        isActive
          ? "bg-[#d08000] text-white"
          : "bg-sub text-zinc-400 hover:text-white disabled:opacity-40"
      }`}
    >
      {label}
    </button>
  );
}

/**
 * 目標の作成・編集フォーム。
 *
 * 入力値の保持と必須チェックだけを担い、API 呼び出しは呼び出し元（Container）に委ねる。
 * 開くたびに呼び出し元が key を変えて再マウントするため、初期値の同期に useEffect は使わない。
 *
 * 編集では back が更新を許可しない属性（種類・期間・シーズン・大会・指標・条件・対象メニュー）を
 * すべて disabled にする。触れてしまうと「変更できたのに保存されない」状態になるため。
 */
export default function GoalFormModal({
  goal,
  seasons,
  tournaments,
  menus,
  today,
  isSaving,
  serverErrors,
  onClose,
  onSubmit,
}: GoalFormModalProps) {
  const [values, setValues] = useState<GoalFormValues>(() =>
    initialGoalFormValues(goal, today),
  );
  const [errors, setErrors] = useState<string[]>([]);
  const { hasEntitlement, isLoading: isEntitlementLoading } = useEntitlement();

  const isEditing = goal !== null;
  const update = (patch: Partial<GoalFormValues>) =>
    setValues((prev) => ({ ...prev, ...patch }));

  // Pro 判定が未確定の間はロック表示を出さない（Pro 加入者にロックが一瞬見える方が実害が大きい）。
  // 代わりに保存を無効化するので、誤った entitlement のまま送信されることはない。
  const grantedWhileLoading = (feature: Parameters<typeof hasEntitlement>[0]) =>
    isEntitlementLoading || hasEntitlement(feature);

  // 編集では種類も期間も変更できないため、既存の目標に鍵をかけない
  // （Pro 解約後も既存目標のタイトル・目標値は編集できる必要がある）。
  const lockedFeature = isEditing
    ? null
    : lockedGoalFeature(
        { kind: values.kind, periodType: values.periodType },
        grantedWhileLoading,
      );

  const metric = metricFor(values.metricKey);
  const isQualitative = values.kind === "qualitative";
  const isManual = values.kind === "manual";
  const menuMetricSelected = isMenuMetric(values);
  const periodGate = goalPeriodGateFeature(values.periodType);
  const showPeriodUpsell =
    !isEditing && periodGate !== null && !grantedWhileLoading(periodGate);
  const showManualUpsell =
    !isEditing && isManual && !grantedWhileLoading("manual_metric_goals");

  const handleSubmit = () => {
    const validationErrors = validateGoalForm(values);
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;
    onSubmit(values);
  };

  const renderDeadline = () => (
    <Input
      type="date"
      variant="bordered"
      label="期限"
      labelPlacement="outside"
      value={values.deadline}
      onChange={(event) => update({ deadline: event.target.value })}
    />
  );

  return (
    <Modal
      isOpen
      onClose={onClose}
      placement="center"
      scrollBehavior="inside"
      className="buzz-dark"
      size="lg"
    >
      <ModalContent>
        <ModalHeader className="text-white">
          {isEditing ? "目標を編集" : "新しい目標"}
        </ModalHeader>
        <ModalBody className="gap-4">
          {isEditing ? (
            <p className="rounded-lg bg-sub p-3 text-xs leading-5 text-zinc-300">
              {IMMUTABLE_FIELDS_NOTICE}
            </p>
          ) : null}

          <div>
            <p className="mb-1.5 text-sm text-white">目標タイプ</p>
            <div className="flex gap-2" role="group" aria-label="目標タイプ">
              {KIND_ORDER.map((kind) => {
                const isActive = values.kind === kind;
                const showLock =
                  !isEditing &&
                  kind === "manual" &&
                  !grantedWhileLoading("manual_metric_goals");
                return (
                  <button
                    key={kind}
                    type="button"
                    aria-pressed={isActive}
                    disabled={isEditing}
                    onClick={() => update({ kind })}
                    className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed ${
                      isActive
                        ? "bg-[#d08000] text-white"
                        : "bg-sub text-zinc-400 disabled:opacity-40"
                    }`}
                  >
                    {showLock ? (
                      <LockClosedIcon className="h-3.5 w-3.5" aria-hidden />
                    ) : null}
                    {GOAL_KIND_LABELS[kind]}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 rounded-lg bg-sub px-3 py-2.5 text-xs leading-5 text-zinc-300">
              {GOAL_KIND_DESCRIPTIONS[values.kind]}
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-sm text-white">期間</p>
            <div
              className="flex flex-wrap gap-2"
              role="group"
              aria-label="期間"
            >
              {GOAL_PERIOD_ORDER.map((periodType: GoalPeriodType) => (
                <ChoiceChip
                  key={periodType}
                  label={GOAL_PERIOD_LABELS[periodType]}
                  isActive={values.periodType === periodType}
                  isDisabled={isEditing}
                  onSelect={() => update({ periodType })}
                />
              ))}
            </div>
          </div>

          {showPeriodUpsell && periodGate !== null ? (
            <ProUpsellCard feature={periodGate} />
          ) : null}

          {hasAutoRange(values.periodType) ? (
            <p className="text-xs text-zinc-500">
              {
                AUTO_RANGE_HINTS[
                  values.periodType as keyof typeof AUTO_RANGE_HINTS
                ]
              }
            </p>
          ) : null}

          {values.periodType === "custom" ? (
            <>
              <Input
                type="date"
                variant="bordered"
                label="開始日"
                labelPlacement="outside"
                value={values.startDate}
                onChange={(event) => update({ startDate: event.target.value })}
              />
              {renderDeadline()}
            </>
          ) : null}

          {values.periodType === "season" ? (
            <>
              <div>
                <p className="mb-1.5 text-sm text-white">シーズン</p>
                {seasons.length === 0 ? (
                  <p className="rounded-lg bg-sub p-3 text-xs text-zinc-400">
                    {NO_SEASON_MESSAGE}
                  </p>
                ) : (
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="シーズン"
                  >
                    {seasons.map((season) => (
                      <ChoiceChip
                        key={season.id}
                        label={season.name}
                        isActive={values.seasonId === season.id}
                        isDisabled={isEditing}
                        onSelect={() => update({ seasonId: season.id })}
                      />
                    ))}
                  </div>
                )}
              </div>
              {renderDeadline()}
            </>
          ) : null}

          {values.periodType === "tournament" ? (
            <>
              <div>
                <p className="mb-1.5 text-sm text-white">大会</p>
                {tournaments.length === 0 ? (
                  <p className="rounded-lg bg-sub p-3 text-xs text-zinc-400">
                    {NO_TOURNAMENT_MESSAGE}
                  </p>
                ) : (
                  <div
                    className="flex flex-wrap gap-2"
                    role="group"
                    aria-label="大会"
                  >
                    {tournaments.map((tournament) => (
                      <ChoiceChip
                        key={tournament.id}
                        label={tournament.name}
                        isActive={values.tournamentId === tournament.id}
                        isDisabled={isEditing}
                        onSelect={() => update({ tournamentId: tournament.id })}
                      />
                    ))}
                  </div>
                )}
              </div>
              {renderDeadline()}
            </>
          ) : null}

          {values.kind === "numeric" ? (
            <>
              <div>
                <p className="mb-1.5 text-sm text-white">指標</p>
                <div className="space-y-3">
                  {GOAL_METRIC_CATEGORIES.map((category) => (
                    <div key={category.key}>
                      <p className="mb-1.5 text-xs font-bold text-zinc-500">
                        {category.label}
                      </p>
                      <div
                        className="flex flex-wrap gap-2"
                        role="group"
                        aria-label={category.label}
                      >
                        {metricsInCategory(category.keys).map((item) => (
                          <ChoiceChip
                            key={item.key}
                            label={item.label}
                            isActive={values.metricKey === item.key}
                            isDisabled={isEditing}
                            onSelect={() => update({ metricKey: item.key })}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {menuMetricSelected ? (
                <div>
                  <p className="mb-1.5 text-sm text-white">
                    対象の練習メニュー
                  </p>
                  {menus.length === 0 ? (
                    <p className="rounded-lg bg-sub p-3 text-xs text-zinc-400">
                      {NO_PRACTICE_MENU_MESSAGE}
                    </p>
                  ) : (
                    <div
                      className="flex flex-wrap gap-2"
                      role="group"
                      aria-label="対象の練習メニュー"
                    >
                      {menus.map((menu) => (
                        <ChoiceChip
                          key={menu.id}
                          label={menu.name}
                          isActive={values.practiceMenuId === menu.id}
                          isDisabled={isEditing}
                          onSelect={() => update({ practiceMenuId: menu.id })}
                        />
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-zinc-500">
                    {MENU_METRIC_HINT}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">
                  条件: {GOAL_COMPARISON_LABELS[metric.comparison]}
                </p>
              )}
            </>
          ) : null}

          {showManualUpsell ? (
            <ProUpsellCard feature="manual_metric_goals" />
          ) : null}

          {isManual && !showManualUpsell ? (
            <>
              <Input
                type="text"
                variant="bordered"
                label="指標名"
                labelPlacement="outside"
                isRequired
                placeholder="例: 球速 / 遠投距離 / 体重"
                value={values.customMetricLabel}
                onChange={(event) =>
                  update({ customMetricLabel: event.target.value })
                }
              />
              <Input
                type="text"
                variant="bordered"
                label="単位（任意）"
                labelPlacement="outside"
                placeholder="例: km/h"
                value={values.customUnit}
                onChange={(event) => update({ customUnit: event.target.value })}
              />
              <div>
                <p className="mb-1.5 text-sm text-white">条件</p>
                <div className="flex gap-2" role="group" aria-label="条件">
                  {(["greater_than", "less_than"] as const).map(
                    (comparison) => (
                      <ChoiceChip
                        key={comparison}
                        label={GOAL_COMPARISON_LABELS[comparison]}
                        isActive={values.comparison === comparison}
                        isDisabled={isEditing}
                        onSelect={() => update({ comparison })}
                      />
                    ),
                  )}
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  {MANUAL_CURRENT_VALUE_HINT}
                </p>
              </div>
            </>
          ) : null}

          {isQualitative ? null : (
            <>
              <Input
                type="number"
                variant="bordered"
                label="目標値"
                labelPlacement="outside"
                isRequired
                placeholder={metric.decimal ? "例: 0.300" : "例: 20"}
                value={values.targetValue}
                onChange={(event) =>
                  update({ targetValue: event.target.value })
                }
              />
              {isManual && !showManualUpsell ? (
                <Input
                  type="number"
                  variant="bordered"
                  label="現在値"
                  labelPlacement="outside"
                  placeholder="例: 125"
                  value={values.manualCurrentValue}
                  onChange={(event) =>
                    update({ manualCurrentValue: event.target.value })
                  }
                />
              ) : null}
            </>
          )}

          <Input
            type="text"
            variant="bordered"
            label={isQualitative ? "目標" : "タイトル（任意）"}
            labelPlacement="outside"
            isRequired={isQualitative}
            placeholder={
              isQualitative
                ? "例: この大会で優勝する"
                : isManual
                  ? values.customMetricLabel.trim() || "指標名の目標"
                  : metricExample(values.metricKey)
            }
            value={values.title}
            onChange={(event) => update({ title: event.target.value })}
          />

          {errors.length > 0 || serverErrors.length > 0 ? (
            <ul role="alert" className="space-y-1 text-sm text-danger">
              {[...errors, ...serverErrors].map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose} isDisabled={isSaving}>
            キャンセル
          </Button>
          <Button
            color="primary"
            className="font-bold"
            onPress={handleSubmit}
            isDisabled={
              isSaving || isEntitlementLoading || lockedFeature !== null
            }
            isLoading={isSaving}
          >
            {isEditing ? "更新" : "保存"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
