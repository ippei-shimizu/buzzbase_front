import type {
  DecimalValue,
  PracticeCategory,
  PracticeLogSource,
  PracticeUnit,
} from "@app/types/practice";
import type { ComponentType, SVGProps } from "react";
import ArrowTrendingUpIcon from "@heroicons/react/24/outline/ArrowTrendingUpIcon";
import BoltIcon from "@heroicons/react/24/outline/BoltIcon";
import EllipsisHorizontalCircleIcon from "@heroicons/react/24/outline/EllipsisHorizontalCircleIcon";
import FireIcon from "@heroicons/react/24/outline/FireIcon";
import HandRaisedIcon from "@heroicons/react/24/outline/HandRaisedIcon";
import HeartIcon from "@heroicons/react/24/outline/HeartIcon";
import ScaleIcon from "@heroicons/react/24/outline/ScaleIcon";
import ShieldCheckIcon from "@heroicons/react/24/outline/ShieldCheckIcon";
import SolidBoltIcon from "@heroicons/react/24/solid/BoltIcon";

// back/app/models/concerns/plan_limits.rb の PRACTICE_MENU_FREE_LIMIT と一致させる。
export const PRACTICE_MENU_FREE_LIMIT = 3;

/**
 * 数値の整形は実行環境のロケールに依存させない。
 * Server Component / Server Action は Vercel のロケール未定なコンテナで動くため、
 * 既定ロケールに任せると桁区切りが環境ごとにぶれる（"12,400" / "12.400"）。
 */
const NUMBER_LOCALE = "ja-JP";

/** カテゴリの表示ラベル。key は back の PracticeMenu::CATEGORIES と完全一致させる。 */
export const PRACTICE_CATEGORIES: ReadonlyArray<{
  key: PracticeCategory;
  label: string;
}> = [
  { key: "batting", label: "バッティング" },
  { key: "pitching", label: "投手" },
  { key: "defense", label: "守備" },
  { key: "baserunning", label: "走塁" },
  { key: "training", label: "トレーニング" },
  { key: "strength", label: "筋トレ" },
  { key: "care", label: "ケア" },
  { key: "other", label: "その他" },
];

/**
 * 単位マスタ。key は back の PracticeMenu::UNITS と完全一致させる。
 * defaultLabel はメニュー作成時に unit_label 未入力だった場合の既定表記、
 * placeholderValue は量の入力欄に出す例示値。
 */
export const PRACTICE_UNITS: ReadonlyArray<{
  key: PracticeUnit;
  label: string;
  defaultLabel: string;
  placeholderValue: string;
}> = [
  { key: "count", label: "回数", defaultLabel: "本", placeholderValue: "200" },
  { key: "minutes", label: "時間", defaultLabel: "分", placeholderValue: "30" },
  { key: "distance", label: "距離", defaultLabel: "km", placeholderValue: "5" },
  {
    key: "weight_reps",
    label: "重さ×回数",
    defaultLabel: "回",
    placeholderValue: "10",
  },
];

/** カテゴリごとのアイコン。一覧・詳細でメニューの種類を見分けやすくする。 */
export const PRACTICE_CATEGORY_ICONS: Readonly<
  Record<PracticeCategory, ComponentType<SVGProps<SVGSVGElement>>>
> = {
  batting: BoltIcon,
  pitching: HandRaisedIcon,
  defense: ShieldCheckIcon,
  baserunning: ArrowTrendingUpIcon,
  training: FireIcon,
  strength: ScaleIcon,
  care: HeartIcon,
  other: EllipsisHorizontalCircleIcon,
};

/** 気分の選択肢。back は自由文字列カラムのため、選択肢は front / mobile 側で揃える。 */
export const CONDITION_MOODS: ReadonlyArray<string> = ["好調", "普通", "不調"];

/** 故障箇所のプリセット。back は jsonb の自由文字列のため、入力補助としてのみ使う。 */
export const INJURY_PARTS: ReadonlyArray<string> = [
  "肩",
  "肘",
  "手首",
  "腰",
  "股関節",
  "膝",
  "足首",
  "その他",
];

/** カテゴリの表示ラベルを返す。未知の値はそのまま返して情報を落とさない。 */
export const categoryLabel = (category: PracticeCategory): string =>
  PRACTICE_CATEGORIES.find((item) => item.key === category)?.label ?? category;

/** 単位の表示ラベルを返す。未知の値はそのまま返して情報を落とさない。 */
export const unitLabel = (unit: PracticeUnit): string =>
  PRACTICE_UNITS.find((item) => item.key === unit)?.label ?? unit;

/** 筋トレ（重さ×回数）の計測かどうか。 */
export const isWeightReps = (unit: PracticeUnit): boolean =>
  unit === "weight_reps";

/**
 * back が文字列で返す decimal 値を数値へ変換する。
 * 数値化できない値（null / 空文字 / 非数）は null を返し、
 * 表示側が「未入力」と「0」を取り違えないようにする。
 */
export const parseDecimal = (
  value: DecimalValue | null | undefined,
): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

/**
 * 練習量1件を表示用に整形する。
 * 重さがある記録（筋トレ）は「60kg × 10回」、それ以外は「200本」のように返す。
 * 量も重さも無い記録は空文字を返す。
 *
 * 重さがある場合の回数の単位は、unit_label に依らず「回」で固定する（mobile と表示を揃えるため）。
 */
export const formatPracticeValue = (log: {
  amount: DecimalValue | null;
  weight: DecimalValue | null;
  unit_label: string | null;
}): string => {
  const amount = parseDecimal(log.amount);
  const weight = parseDecimal(log.weight);
  const reps = amount === null ? "" : String(amount);

  if (weight !== null) return `${weight}kg × ${reps || "0"}回`;
  if (amount === null) return "";
  return `${reps}${log.unit_label ?? ""}`;
};

/**
 * 積み上げの量を「12,400本」のように整形する。
 * 単位ラベルが無いメニューは数値のみを返す。
 */
export const formatTotalAmount = (
  amount: DecimalValue | null | undefined,
  unitLabelText: string | null,
): string =>
  `${(parseDecimal(amount) ?? 0).toLocaleString(NUMBER_LOCALE)}${unitLabelText ?? ""}`;

/**
 * 総挙上重量を「8.2t」「640kg」のように整形する。
 * 1000kg 以上は t 表記（小数第1位まで）、それ未満は kg 表記にする。
 */
export const formatVolume = (kg: DecimalValue | null | undefined): string => {
  const value = parseDecimal(kg) ?? 0;
  if (value >= 1000) {
    return `${(value / 1000).toLocaleString(NUMBER_LOCALE, {
      maximumFractionDigits: 1,
    })}t`;
  }
  return `${value.toLocaleString(NUMBER_LOCALE)}kg`;
};

/**
 * 素振り自動ログのアイコン。
 * バッティングと同系のモチーフを塗りつぶしで使い分け、手入力の記録と見分けられるようにする。
 */
export const SHADOW_SWING_ICON: ComponentType<SVGProps<SVGSVGElement>> =
  SolidBoltIcon;

/**
 * 練習ログのアイコンを決める。素振りは専用アイコン、それ以外はメニューのカテゴリで振り分ける。
 * category が不明（メニュー削除済みなど）の場合は「その他」のアイコンにフォールバックする。
 */
export const practiceIconForLog = (
  source: PracticeLogSource,
  category: PracticeCategory | undefined,
): ComponentType<SVGProps<SVGSVGElement>> => {
  if (source === "shadow_swing") return SHADOW_SWING_ICON;
  return category
    ? PRACTICE_CATEGORY_ICONS[category]
    : PRACTICE_CATEGORY_ICONS.other;
};
