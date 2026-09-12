import type {
  DecimalValue,
  PracticeLog,
  PracticeMenu,
  PracticeSession,
  PracticeSessionItemInput,
  PresetMenu,
} from "@app/types/practice";
import { isWeightReps, parseDecimal } from "@app/constants/practice";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 「今日」の判定は back の集計（Asia/Tokyo）に合わせる。
 * サーバーのロケール/タイムゾーンに依存させないことで、SSR と CSR で同じ日付になり
 * 未来日ガードの基準もぶれない。
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

/** その日付が今日より後か。`YYYY-MM-DD` は辞書順比較で日付順になる。 */
export function isFutureDate(date: string, today: string): boolean {
  return date > today;
}

/**
 * `?date=` を検証して初期表示日を決める。
 * 形式が不正な場合と未来日の場合は今日へフォールバックし、未来日の記録を作らせない。
 */
export function resolveInitialDate(
  raw: string | undefined,
  today: string,
): string {
  if (!raw || !DATE_PATTERN.test(raw)) return today;
  return isFutureDate(raw, today) ? today : raw;
}

/**
 * `?presetMenus=`（JSON 配列）を解釈する。
 * 外部から渡る文字列なので、壊れていても画面を落とさず「プリセット無し」に倒す。
 */
export function parsePresetMenus(raw: string | undefined): PresetMenu[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (typeof item !== "object" || item === null) return [];
      const { practice_menu_id: menuId, target_value: target } = item as {
        practice_menu_id?: unknown;
        target_value?: unknown;
      };
      const id = Number(menuId);
      if (!Number.isFinite(id)) return [];
      const targetValue = Number(target);
      return [
        {
          practice_menu_id: id,
          target_value: Number.isFinite(targetValue) ? targetValue : null,
        },
      ];
    });
  } catch {
    return [];
  }
}

/**
 * 入力欄に流し込む文字列へ変換する。
 * back の decimal は `"200.0"` のような文字列で返るため、そのまま出さず数値化してから文字列にする。
 */
export function toInputValue(value: DecimalValue | null | undefined): string {
  const parsed = parseDecimal(value);
  return parsed === null ? "" : String(parsed);
}

/** 入力欄の文字列を送信値へ変換する。空文字・非数は null（未入力）として送る。 */
function toNumberOrNull(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * 編集対象になる練習ログ。
 * 素振り自動ログ（source: shadow_swing）はこの画面の同期対象外なので除く。
 * メニューが特定できないログも項目として扱えないため除く。
 */
function editableLogs(session: PracticeSession | null): PracticeLog[] {
  return (session?.practice_logs ?? []).filter(
    (log) => log.source === "manual" && log.practice_menu_id !== null,
  );
}

/**
 * 選択済みメニューの量（menu_id → 入力文字列）を組み立てる。
 * 既存セッションの記録を土台にし、まだ選ばれていないプリセットだけを目標量つきで足す。
 *
 * back の保存は practice_menu_id をキーにした差分同期で、送らなかったメニューのログは
 * 削除される。そのため一覧に出ないメニュー（削除済みなど）のログもここに残し、
 * 保存時にそのまま送り返せるようにする。
 */
export function buildInitialAmounts(
  session: PracticeSession | null,
  presetMenus: PresetMenu[],
): Record<number, string> {
  const amounts: Record<number, string> = {};
  editableLogs(session).forEach((log) => {
    amounts[log.practice_menu_id as number] = toInputValue(log.amount);
  });
  presetMenus.forEach((preset) => {
    // 予定のメニューをチェックすると量なしのログが先に作られるため、
    // 既存ログが空のときは予定の目標量で埋める。実績は 0 でも上書きしない。
    if ((amounts[preset.practice_menu_id] ?? "") !== "") return;
    amounts[preset.practice_menu_id] = toInputValue(preset.target_value);
  });
  return amounts;
}

/** 筋トレ（重さ×回数）の重さ（menu_id → 入力文字列）を組み立てる。 */
export function buildInitialWeights(
  session: PracticeSession | null,
  presetMenus: PresetMenu[],
  menus: PracticeMenu[],
): Record<number, string> {
  const weights: Record<number, string> = {};
  editableLogs(session)
    .filter((log) => log.weight !== null)
    .forEach((log) => {
      weights[log.practice_menu_id as number] = toInputValue(log.weight);
    });
  presetMenus.forEach((preset) => {
    if (preset.practice_menu_id in weights) return;
    const menu = menus.find((item) => item.id === preset.practice_menu_id);
    if (menu && isWeightReps(menu.unit)) weights[preset.practice_menu_id] = "";
  });
  return weights;
}

/**
 * 保存用の items を組み立てる。
 * 選択中のメニューを常に全件返す（ユーザーが触っていない項目も含む）。
 * back は送られなかったメニューのログを削除するため、間引くと既存の記録が消える。
 */
export function buildItems(
  amounts: Record<number, string>,
  weights: Record<number, string>,
): PracticeSessionItemInput[] {
  return Object.entries(amounts).map(([menuId, amount]) => ({
    practice_menu_id: Number(menuId),
    amount: toNumberOrNull(amount),
    weight: toNumberOrNull(weights[Number(menuId)]),
  }));
}
