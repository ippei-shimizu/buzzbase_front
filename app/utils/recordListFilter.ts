/**
 * 記録系一覧（練習記録 / 野球ノート）に共通する、日付をキーにした絞り込みユーティリティ。
 *
 * back の一覧エンドポイント（`GET /api/v2/baseball_notes` / `GET /api/v2/practice_sessions`）は
 * フリーワード検索とページングのパラメータを持たず、練習セッションの `from` / `to` も
 * 日付レンジを1往復ごとに再取得する形でしか使えない。一覧は全件を1回で取得して
 * クライアント側で検索・レンジ・月分割を行うため、その計算をここへ集約する。
 */

/** フリーワードと日付レンジ。すべて空文字が「絞り込まない」を表す。 */
export interface RecordSearchValues {
  keyword: string;
  /** 期間の開始日 `YYYY-MM-DD`。この日を含む。 */
  startDate: string;
  /** 期間の終了日 `YYYY-MM-DD`。この日を含む。 */
  endDate: string;
}

export const EMPTY_RECORD_SEARCH: RecordSearchValues = {
  keyword: "",
  startDate: "",
  endDate: "",
};

/** back が時刻付きで返した場合も日付だけで比較できるよう `YYYY-MM-DD` に切り詰める。 */
export function toDay(value: string): string {
  return value.slice(0, 10);
}

/** 検索語・日付レンジのいずれかが入っているか。 */
export function hasActiveRecordSearch(values: RecordSearchValues): boolean {
  return (
    values.keyword.trim() !== "" ||
    values.startDate !== "" ||
    values.endDate !== ""
  );
}

/** 日付レンジに収まるか。開始日・終了日ともに **その日を含む**。 */
export function matchesDateRange(
  date: string,
  values: Pick<RecordSearchValues, "startDate" | "endDate">,
): boolean {
  const day = toDay(date);
  if (values.startDate !== "" && day < values.startDate) return false;
  if (values.endDate !== "" && day > values.endDate) return false;
  return true;
}

/**
 * 検索対象のテキスト片を連結して検索語を含むか判定する。
 * 大文字小文字は区別せず、検索語が空なら常に一致とみなす。
 */
export function matchesKeyword(parts: string[], keyword: string): boolean {
  const term = keyword.trim().toLowerCase();
  if (term === "") return true;
  return parts.join("\n").toLowerCase().includes(term);
}

/**
 * 開始日・終了日の一方を動かしたときに、もう一方を矛盾しない値へ寄せる。
 * 開始日が終了日より後の状態は常に0件になり、ユーザーには不具合に見えるため許さない。
 */
export function alignDateRange(
  values: RecordSearchValues,
  changed: "startDate" | "endDate",
  next: string,
): RecordSearchValues {
  if (changed === "startDate") {
    const endDate =
      values.endDate !== "" && next !== "" && values.endDate < next
        ? next
        : values.endDate;
    return { ...values, startDate: next, endDate };
  }
  const startDate =
    values.startDate !== "" && next !== "" && values.startDate > next
      ? next
      : values.startDate;
  return { ...values, startDate, endDate: next };
}

/** 記録が存在する年月（`YYYY-MM`）を新しい順に重複なく並べる。 */
export function collectMonths<T>(
  items: T[],
  dateOf: (item: T) => string,
): string[] {
  const months = new Set(items.map((item) => toDay(dateOf(item)).slice(0, 7)));
  return Array.from(months).sort((a, b) => (a < b ? 1 : -1));
}

/** 指定した年月（`YYYY-MM`）の記録だけを取り出す。 */
export function itemsInMonth<T>(
  items: T[],
  dateOf: (item: T) => string,
  month: string,
): T[] {
  return items.filter((item) => toDay(dateOf(item)).startsWith(month));
}

/** 月見出し付きで描画するための、年月ごとのまとまり。並びは元の配列順（新しい順）を保つ。 */
export interface MonthGroup<T> {
  month: string;
  items: T[];
}

/**
 * 記録を年月ごとにまとめる。並び順は入力の順序（back は日付の新しい順で返す）に従い、
 * ここで並べ替えはしない。
 */
export function groupByMonth<T>(
  items: T[],
  dateOf: (item: T) => string,
): MonthGroup<T>[] {
  const groups: MonthGroup<T>[] = [];
  items.forEach((item) => {
    const month = toDay(dateOf(item)).slice(0, 7);
    const last = groups[groups.length - 1];
    if (last && last.month === month) {
      last.items.push(item);
      return;
    }
    groups.push({ month, items: [item] });
  });
  return groups;
}

/** `YYYY-MM` を「2026年8月」形式にする。 */
export function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split("-");
  return `${Number(year)}年${Number(monthNumber)}月`;
}

/** 月ページャの見出し「2026年8月（3件）」。件数は絞り込み後のその月の件数。 */
export function formatMonthCountLabel(month: string, count: number): string {
  return `${formatMonthLabel(month)}（${count}件）`;
}
