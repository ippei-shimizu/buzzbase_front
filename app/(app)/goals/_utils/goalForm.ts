import type {
  Goal,
  GoalComparison,
  GoalInput,
  GoalKind,
  GoalMetricKey,
  GoalPeriodType,
  GoalUpdateInput,
} from "@app/types/goal";
import { GOAL_METRICS, MENU_METRIC_KEY, metricFor } from "@app/constants/goal";
import { parseDecimal } from "@app/constants/practice";

/**
 * 「今日」の基準は back の集計（Asia/Tokyo）に合わせる。
 * 実行環境のタイムゾーンに任せると、月次目標の対象期間が SSR と CSR でずれる。
 */
const TIME_ZONE = "Asia/Tokyo";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** 今日の日付を `YYYY-MM-DD` で返す。 */
export function todayString(now: Date = new Date()): string {
  return DATE_FORMATTER.format(now);
}

// 日付演算は UTC 固定の Date で行う。ローカルタイムゾーンで計算すると
// 夏時間や UTC+X の環境で 1 日ずれることがある。
const toDate = (iso: string): Date => new Date(`${iso}T00:00:00Z`);
const toIso = (date: Date): string => date.toISOString().slice(0, 10);

/** `YYYY-MM-DD` に日数を加算する。 */
export function addDays(iso: string, days: number): string {
  const date = toDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toIso(date);
}

export interface DateRange {
  start: string;
  end: string;
}

/** その日を含む月の初日・末日。 */
export function monthRange(iso: string): DateRange {
  const date = toDate(iso);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  return {
    start: toIso(new Date(Date.UTC(year, month, 1))),
    end: toIso(new Date(Date.UTC(year, month + 1, 0))),
  };
}

/** その日を含む週（月曜〜日曜）の初日・末日。 */
export function weekRange(iso: string): DateRange {
  const date = toDate(iso);
  const weekday = date.getUTCDay();
  const start = addDays(iso, -(weekday === 0 ? 6 : weekday - 1));
  return { start, end: addDays(start, 6) };
}

/** その日を含む年の初日・末日。 */
export function yearRange(iso: string): DateRange {
  const year = toDate(iso).getUTCFullYear();
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

/** 対象期間を自動算出する期間タイプ。ユーザーに開始日・期限を入力させない。 */
const AUTO_RANGE_PERIOD_TYPES: readonly GoalPeriodType[] = [
  "monthly",
  "weekly",
  "yearly",
];

/** 対象期間が自動算出される期間タイプか。 */
export function hasAutoRange(periodType: GoalPeriodType): boolean {
  return AUTO_RANGE_PERIOD_TYPES.includes(periodType);
}

/** 新規作成時の既定の期限（今日から90日後）。 */
const DEFAULT_DEADLINE_OFFSET_DAYS = 90;

export interface GoalFormValues {
  kind: GoalKind;
  periodType: GoalPeriodType;
  metricKey: GoalMetricKey;
  practiceMenuId: number | null;
  targetValue: string;
  customMetricLabel: string;
  customUnit: string;
  manualCurrentValue: string;
  comparison: GoalComparison;
  title: string;
  seasonId: number | null;
  tournamentId: number | null;
  /** カスタム期間の開始日（`YYYY-MM-DD`）。 */
  startDate: string;
  /** カスタム期間・シーズン・大会の期限（`YYYY-MM-DD`）。 */
  deadline: string;
}

/** 数値入力欄へ流し込む文字列。未入力（null）と 0 を取り違えないよう空文字を返す。 */
function toInputValue(value: Goal["target_value"]): string {
  const parsed = parseDecimal(value);
  return parsed === null ? "" : String(parsed);
}

/** フォームの初期値。編集時は既存の目標から復元する。 */
export function initialGoalFormValues(
  goal: Goal | null,
  today: string,
): GoalFormValues {
  if (!goal) {
    return {
      kind: "numeric",
      periodType: "monthly",
      metricKey: GOAL_METRICS[0].key,
      practiceMenuId: null,
      targetValue: "",
      customMetricLabel: "",
      customUnit: "",
      manualCurrentValue: "",
      comparison: "greater_than",
      title: "",
      seasonId: null,
      tournamentId: null,
      startDate: today,
      deadline: addDays(today, DEFAULT_DEADLINE_OFFSET_DAYS),
    };
  }

  return {
    kind: goal.kind,
    periodType: goal.period_type,
    metricKey: goal.metric_key ?? GOAL_METRICS[0].key,
    practiceMenuId: goal.practice_menu_id,
    targetValue: toInputValue(goal.target_value),
    customMetricLabel: goal.custom_metric_label ?? "",
    customUnit: goal.custom_unit ?? "",
    manualCurrentValue:
      goal.kind === "manual" ? toInputValue(goal.manual_current_value) : "",
    comparison: goal.comparison_type,
    title: goal.title,
    seasonId: goal.season_id,
    tournamentId: goal.tournament_id,
    startDate: goal.month_start ?? today,
    deadline: goal.deadline,
  };
}

/** 継続日数（対象メニューの指定が必須）の指標を選んでいるか。 */
export function isMenuMetric(values: GoalFormValues): boolean {
  return values.kind === "numeric" && values.metricKey === MENU_METRIC_KEY;
}

/**
 * 対象期間（month_start / deadline）を決める。
 *
 * 編集では monthly / weekly / yearly の期間を再計算しない。
 * 保存のたびに「今日」を基準に振り直すと、先月作った月次目標が今月へ移ってしまうため。
 */
export function resolveGoalPeriod(
  values: GoalFormValues,
  editing: Goal | null,
  today: string,
): { month_start: string | null; deadline: string } {
  if (editing && hasAutoRange(values.periodType)) {
    return { month_start: editing.month_start, deadline: editing.deadline };
  }

  switch (values.periodType) {
    case "monthly": {
      const range = monthRange(today);
      return { month_start: range.start, deadline: range.end };
    }
    case "weekly": {
      const range = weekRange(today);
      return { month_start: range.start, deadline: range.end };
    }
    case "yearly": {
      const range = yearRange(today);
      return { month_start: range.start, deadline: range.end };
    }
    case "custom":
      return { month_start: values.startDate, deadline: values.deadline };
    default:
      // シーズン・大会は対象試合から期間を求めるため開始日を持たない。
      return { month_start: null, deadline: values.deadline };
  }
}

/**
 * 入力値を検証し、エラーメッセージを返す（空配列なら送信可）。
 * back の 422 を待たずに気づけるよう、必須項目と日付の前後関係だけを見る。
 */
export function validateGoalForm(values: GoalFormValues): string[] {
  const errors: string[] = [];
  const isQualitative = values.kind === "qualitative";
  const isManual = values.kind === "manual";

  if (isQualitative && values.title.trim() === "") {
    errors.push("目標を入力してください");
  }
  if (isManual && values.customMetricLabel.trim() === "") {
    errors.push("指標名を入力してください");
  }
  if (!isQualitative) {
    const parsedTarget = parseDecimal(values.targetValue);
    if (parsedTarget === null) {
      errors.push("目標値を入力してください");
    } else if (parsedTarget < 0) {
      // 0 は「エラー0」「四球0」のような正当な目標値として許容する。負値だけを弾く。
      errors.push("目標値は0以上の数値を入力してください");
    }
  }
  if (isMenuMetric(values) && values.practiceMenuId === null) {
    errors.push("対象の練習メニューを選択してください");
  }
  if (values.periodType === "season" && values.seasonId === null) {
    errors.push("シーズンを選択してください");
  }
  if (values.periodType === "tournament" && values.tournamentId === null) {
    errors.push("大会を選択してください");
  }
  if (
    (values.periodType === "season" || values.periodType === "tournament") &&
    values.deadline.trim() === ""
  ) {
    errors.push("期限を入力してください");
  }
  if (values.periodType === "custom") {
    if (values.startDate.trim() === "" || values.deadline.trim() === "") {
      errors.push("開始日と終了日を入力してください");
    } else if (values.startDate > values.deadline) {
      errors.push("終了日は開始日以降にしてください");
    }
  }
  return errors;
}

/** タイトル未入力時のフォールバック。一覧で「無題」が並ばないよう指標名から補う。 */
function resolveTitle(values: GoalFormValues): string {
  const title = values.title.trim();
  if (title !== "") return title;
  if (values.kind === "manual") return values.customMetricLabel.trim();
  return `${metricFor(values.metricKey).label}目標`;
}

/** 数値・自由指標で共通の目標値。検証済み前提で数値化する。 */
function targetValueOf(values: GoalFormValues): number {
  return parseDecimal(values.targetValue) ?? 0;
}

/**
 * 新規作成の送信ペイロードを組み立てる。
 * 定性目標は指標・目標値を持たないため、それらのキー自体を送らない。
 */
export function buildGoalCreatePayload(
  values: GoalFormValues,
  today: string,
): GoalInput {
  const period = resolveGoalPeriod(values, null, today);
  const base: GoalInput = {
    title: resolveTitle(values),
    kind: values.kind,
    period_type: values.periodType,
    season_id: values.periodType === "season" ? values.seasonId : null,
    tournament_id:
      values.periodType === "tournament" ? values.tournamentId : null,
    month_start: period.month_start,
    deadline: period.deadline,
  };

  if (values.kind === "qualitative") return base;

  if (values.kind === "manual") {
    return {
      ...base,
      custom_metric_label: values.customMetricLabel.trim(),
      custom_unit: values.customUnit.trim() || null,
      target_value: targetValueOf(values),
      // 自由指標は自動集計できないため、達成条件をユーザーに選ばせる。
      comparison_type: values.comparison,
      manual_current_value: parseDecimal(values.manualCurrentValue) ?? 0,
    };
  }

  return {
    ...base,
    metric_key: values.metricKey,
    target_value: targetValueOf(values),
    // 数値目標の達成条件は指標ごとに決まる（防御率は以下、打率は以上）。
    comparison_type: metricFor(values.metricKey).comparison,
    practice_menu_id: isMenuMetric(values) ? values.practiceMenuId : null,
  };
}

/**
 * 更新の送信ペイロードを組み立てる。
 *
 * back が更新を許可するのは title / month_start / deadline / target_value /
 * custom_metric_label / custom_unit / manual_current_value だけ。
 * 種類・期間タイプ・シーズン・大会・指標・達成条件・対象メニューは含めない
 * （送っても無視され、「編集できたのに反映されない」状態になるため）。
 */
export function buildGoalUpdatePayload(
  values: GoalFormValues,
  editing: Goal,
  today: string,
): GoalUpdateInput {
  const period = resolveGoalPeriod(values, editing, today);
  const base: GoalUpdateInput = {
    title: resolveTitle(values),
    month_start: period.month_start,
    deadline: period.deadline,
  };

  if (values.kind === "qualitative") return base;

  if (values.kind === "manual") {
    return {
      ...base,
      custom_metric_label: values.customMetricLabel.trim(),
      custom_unit: values.customUnit.trim() || null,
      target_value: targetValueOf(values),
      manual_current_value: parseDecimal(values.manualCurrentValue) ?? 0,
    };
  }

  return { ...base, target_value: targetValueOf(values) };
}
