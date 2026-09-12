import type {
  GoalComparison,
  GoalKind,
  GoalMetricKey,
  GoalPeriodType,
} from "@app/types/goal";
import type { DecimalValue } from "@app/types/practice";
import { parseDecimal } from "@app/constants/practice";

// back/app/models/concerns/plan_limits.rb の MONTHLY_GOAL_FREE_LIMIT と一致させる。
export const MONTHLY_GOAL_FREE_LIMIT = 2;

// オンボーディング（buzzbase.onboarding.*）とは別機能なので接頭辞を分ける。
const GOAL_STORAGE_PREFIX = "buzzbase.goal.";

/**
 * 達成サマリーモーダルを対象月について表示済みか、を保持する localStorage キー。
 *
 * 「月に一度だけ」を値ではなくキーの一部（YYYY-MM）で表すことで、既存の
 * readOnboardingFlag / writeOnboardingFlag（boolean 前提）をそのまま使える。
 *
 * @param monthKey 対象月（YYYY-MM）
 */
export const achievementSummaryShownKey = (monthKey: string): string =>
  `${GOAL_STORAGE_PREFIX}achievementSummaryShown.${monthKey}`;

/**
 * 無料枠を共有する個人の期間目標。back の Goal::PERSONAL_PERIOD_TYPES と一致させる。
 * season / tournament は件数ではなく Pro 限定機能として別に判定される。
 */
export const PERSONAL_GOAL_PERIOD_TYPES: readonly GoalPeriodType[] = [
  "monthly",
  "weekly",
  "yearly",
  "custom",
];

/** 目標の期間タイプの表示ラベル。 */
export const GOAL_PERIOD_LABELS: Record<GoalPeriodType, string> = {
  weekly: "週次",
  monthly: "月次",
  yearly: "年間",
  custom: "カスタム期間",
  tournament: "大会",
  season: "シーズン",
};

/** 期間タイプの選択肢・一覧のグルーピングで使う表示順。mobile と揃える。 */
export const GOAL_PERIOD_ORDER: readonly GoalPeriodType[] = [
  "weekly",
  "monthly",
  "yearly",
  "custom",
  "tournament",
  "season",
];

/** 目標の種類（kind）の表示ラベル。 */
export const GOAL_KIND_LABELS: Record<GoalKind, string> = {
  numeric: "数値目標",
  qualitative: "達成目標",
  manual: "自由指標",
};

/** 種類ごとの説明。何ができるかを選択前に伝えるため、mobile と同じ文言を使う。 */
export const GOAL_KIND_DESCRIPTIONS: Record<GoalKind, string> = {
  numeric:
    "「打率3割」「今月20日練習」のように数字で決めると、記録した成績や練習からアプリが今の数字を自動で計算して、達成までの進み具合を出してくれます。",
  qualitative:
    "「大会で優勝」「レギュラーになる」など数字にできない目標向け。叶ったら「達成」を押すだけで管理できます（数字の入力は不要）。",
  manual:
    "「球速130km/h」「体重を増やす」など、アプリが測れない自分だけの目標を作れます。測った値を入力するたびに、目標までの進み具合が更新されます。",
};

/** 達成条件の表示ラベル。 */
export const GOAL_COMPARISON_LABELS: Record<GoalComparison, string> = {
  greater_than: "以上",
  less_than: "以下",
};

export interface GoalMetric {
  key: GoalMetricKey;
  label: string;
  unit: string;
  /** 達成条件。指標ごとに固定で、ユーザーには選ばせない（防御率は「以下」など）。 */
  comparison: GoalComparison;
  /** 小数で扱う指標か。目標値の入力例と表示桁数の切り替えに使う。 */
  decimal?: boolean;
}

// back の Goal::METRIC_KEYS / Goals::MetricCalculator と対応（自動集計できる指標）。
export const GOAL_METRICS: readonly GoalMetric[] = [
  {
    key: "practice_days",
    label: "練習日数",
    unit: "日",
    comparison: "greater_than",
  },
  {
    key: "self_practice_days",
    label: "自主練習日数",
    unit: "日",
    comparison: "greater_than",
  },
  // 新規作成では選べない（GOAL_METRIC_CATEGORIES から除外済み）。
  // 確定済みの既存目標をラベル付きで表示するために残す。
  {
    key: "total_swing_count",
    label: "素振り本数",
    unit: "本",
    comparison: "greater_than",
  },
  {
    key: "game_count",
    label: "出場試合数",
    unit: "試合",
    comparison: "greater_than",
  },
  {
    key: "menu_practice_days",
    label: "メニュー継続日数",
    unit: "日",
    comparison: "greater_than",
  },
  // 単位は対象メニューの unit_label を使うため、指標側では持たない。
  {
    key: "menu_practice_amount",
    label: "メニュー回数",
    unit: "",
    comparison: "greater_than",
  },
  {
    key: "batting_average",
    label: "打率",
    unit: "",
    comparison: "greater_than",
    decimal: true,
  },
  {
    key: "on_base_percentage",
    label: "出塁率",
    unit: "",
    comparison: "greater_than",
    decimal: true,
  },
  {
    key: "slugging_percentage",
    label: "長打率",
    unit: "",
    comparison: "greater_than",
    decimal: true,
  },
  {
    key: "ops",
    label: "OPS",
    unit: "",
    comparison: "greater_than",
    decimal: true,
  },
  { key: "hits", label: "安打", unit: "本", comparison: "greater_than" },
  { key: "home_runs", label: "本塁打", unit: "本", comparison: "greater_than" },
  {
    key: "runs_batted_in",
    label: "打点",
    unit: "点",
    comparison: "greater_than",
  },
  { key: "runs_scored", label: "得点", unit: "点", comparison: "greater_than" },
  {
    key: "stolen_bases",
    label: "盗塁",
    unit: "個",
    comparison: "greater_than",
  },
  {
    key: "era",
    label: "防御率",
    unit: "",
    comparison: "less_than",
    decimal: true,
  },
  {
    key: "whip",
    label: "WHIP",
    unit: "",
    comparison: "less_than",
    decimal: true,
  },
  {
    key: "strikeouts",
    label: "奪三振",
    unit: "個",
    comparison: "greater_than",
  },
  { key: "wins", label: "勝利", unit: "勝", comparison: "greater_than" },
  { key: "saves", label: "セーブ", unit: "個", comparison: "greater_than" },
];

export type GoalMetricCategory = "practice" | "batting" | "pitching";

/** 指標選択のカテゴリ（表示順・見出し・所属キー）。mobile の並び順と揃える。 */
export const GOAL_METRIC_CATEGORIES: ReadonlyArray<{
  key: GoalMetricCategory;
  label: string;
  keys: readonly GoalMetricKey[];
}> = [
  {
    key: "practice",
    label: "練習・試合",
    keys: [
      "practice_days",
      "self_practice_days",
      "game_count",
      "menu_practice_days",
      "menu_practice_amount",
    ],
  },
  {
    key: "batting",
    label: "打撃",
    keys: [
      "batting_average",
      "on_base_percentage",
      "slugging_percentage",
      "ops",
      "hits",
      "home_runs",
      "runs_batted_in",
      "runs_scored",
      "stolen_bases",
    ],
  },
  {
    key: "pitching",
    label: "投手",
    keys: ["era", "whip", "strikeouts", "wins", "saves"],
  },
];

/** 対象メニューの指定が必須になる指標。back の MENU_REQUIRED_METRIC_KEYS と一致させる。 */
export const MENU_METRIC_KEYS: readonly GoalMetricKey[] = [
  "menu_practice_days",
  "menu_practice_amount",
];

export const isMenuMetricKey = (key: GoalMetricKey | null): boolean =>
  key !== null && MENU_METRIC_KEYS.includes(key);

/** 数値目標タイトルのプレースホルダー例（指標別）。 */
const GOAL_METRIC_EXAMPLES: Partial<Record<GoalMetricKey, string>> = {
  practice_days: "例: 今月20日練習する",
  self_practice_days: "例: 今月15日自主練する",
  total_swing_count: "例: 今月2000本素振り",
  game_count: "例: 今シーズン15試合出場",
  menu_practice_days: "例: このメニューを20日継続",
  menu_practice_amount: "例: このメニューを合計2000こなす",
  batting_average: "例: 打率.320を目指す",
  on_base_percentage: "例: 出塁率.400を目指す",
  slugging_percentage: "例: 長打率.500を目指す",
  ops: "例: OPS.850を目指す",
  hits: "例: 安打30本",
  home_runs: "例: 本塁打10本",
  runs_batted_in: "例: 打点20点",
  runs_scored: "例: 得点20点",
  stolen_bases: "例: 盗塁10個",
  era: "例: 防御率2.50以下",
  whip: "例: WHIP1.20以下",
  strikeouts: "例: 奪三振50個",
  wins: "例: 今シーズン5勝",
  saves: "例: 10セーブ",
};

export const metricExample = (key: GoalMetricKey): string =>
  GOAL_METRIC_EXAMPLES[key] ?? "";

/** カテゴリの所属キーに対応する指標を GOAL_METRICS の定義順で返す。 */
export const metricsInCategory = (
  keys: readonly GoalMetricKey[],
): GoalMetric[] => GOAL_METRICS.filter((metric) => keys.includes(metric.key));

/** 指標定義。未知のキーが来ても画面を落とさないよう先頭の指標へフォールバックする。 */
export const metricFor = (key: GoalMetricKey | null): GoalMetric =>
  GOAL_METRICS.find((metric) => metric.key === key) ?? GOAL_METRICS[0];

export const metricLabel = (key: GoalMetricKey | null): string =>
  GOAL_METRICS.find((metric) => metric.key === key)?.label ?? key ?? "";

// 防御率・WHIP は 1 以上でも小数第2位まで見せたい（打率系と違い ".XXX" 表記の慣習が無いため）。
const TWO_DECIMAL_METRIC_KEYS: readonly GoalMetricKey[] = ["era", "whip"];

/**
 * 指標の値を表示用に整形する。
 * 小数指標でない場合は整数へ丸め、打率系は 1 未満なら先頭の 0 を落として ".320" と見せる。
 */
export const formatMetricValue = (
  key: GoalMetricKey | null,
  value: DecimalValue | null | undefined,
): string => {
  const parsed = parseDecimal(value) ?? 0;
  const metric = GOAL_METRICS.find((item) => item.key === key);
  if (!metric?.decimal) return String(Math.round(parsed));

  if (key !== null && TWO_DECIMAL_METRIC_KEYS.includes(key)) {
    return parsed.toFixed(2);
  }
  return Math.abs(parsed) < 1
    ? parsed.toFixed(3).replace(/^(-?)0\./, "$1.")
    : parsed.toFixed(3);
};
