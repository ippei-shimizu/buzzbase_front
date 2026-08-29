import type {
  PeriodicReview,
  PeriodicReviewType,
} from "@app/types/periodicReview";
import type { DecimalValue } from "@app/types/practice";
import { parseDecimal } from "@app/constants/practice";

/** 値が欠損している（＝旧レポートに指標が無い）ことを示す表示。0 と取り違えさせない。 */
export const MISSING_VALUE = "-";

/**
 * 率系（打率・出塁率・長打率・OPS）を野球慣用の「.XXX」表記にする。
 * 値が無い場合は 0 ではなく「-」を返す。
 */
export function formatRatio(value: DecimalValue | null | undefined): string {
  const parsed = parseDecimal(value);
  if (parsed === null) return MISSING_VALUE;
  return parsed.toFixed(3).replace(/^(-?)0\./, "$1.");
}

/** 打率の前期間比。符号付きで返す（+.026 / -.012）。値が無ければ null。 */
export function formatDelta(
  value: DecimalValue | null | undefined,
): string | null {
  const parsed = parseDecimal(value);
  if (parsed === null) return null;
  return `${parsed >= 0 ? "+" : ""}${formatRatio(parsed)}`;
}

/** 防御率・WHIP などの小数指標。桁数を指定する。値が無ければ「-」。 */
export function formatFixed(
  value: DecimalValue | null | undefined,
  digits: number,
): string {
  const parsed = parseDecimal(value);
  if (parsed === null) return MISSING_VALUE;
  return parsed.toFixed(digits);
}

/** 練習日数・素振り数などの整数系。単位を付けて返す。値が無ければ単位も付けず「-」。 */
export function formatCount(
  value: DecimalValue | null | undefined,
  unit = "",
): string {
  const parsed = parseDecimal(value);
  if (parsed === null) return MISSING_VALUE;
  return `${parsed.toLocaleString("ja-JP")}${unit}`;
}

/** 「2026/07/06」形式。back は "2026-07-06" を返す。 */
export function formatPeriodDate(value: string): string {
  return value.replaceAll("-", "/");
}

/**
 * カード見出し。週次は period_start が属する月内の何週目か（「7月 第2週の振り返り」）、
 * 月次は月表記（「2026年7月の振り返り」）にする。
 * 月をまたぐ週は開始日（月曜）の月に帰属させる。第N週は開始日の日付から
 * 7日刻み（1〜7日=第1週、8〜14日=第2週…）で決める。
 */
export function periodicReviewTitle(review: {
  period_type: PeriodicReviewType;
  period_start: string;
}): string {
  const [year, month, day] = review.period_start.split("-").map(Number);
  if (review.period_type === "monthly") {
    return `${year}年${month}月の振り返り`;
  }
  const weekOfMonth = Math.floor((day - 1) / 7) + 1;
  return `${month}月 第${weekOfMonth}週の振り返り`;
}

/** 月ページャ用に period_start の日付（YYYY-MM-DD）を返す。 */
export function reviewDate(review: { period_start: string }): string {
  return review.period_start;
}

/** 未読レポートの id 一覧。既読化の対象を決めるのに使う。 */
export function unreadReviewIds(reviews: PeriodicReview[]): number[] {
  return reviews.filter((review) => !review.read).map((review) => review.id);
}
