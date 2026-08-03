import type {
  ScheduleEventType,
  ScheduleInput,
  ScheduleMenu,
} from "@app/types/schedule";
import { SCHEDULE_TITLE_MAX_LENGTH } from "@app/constants/schedule";

/** 繰り返し種別。single = この日だけ（planned_on）／weekly = 毎週（days_of_week）。 */
export type ScheduleRecurrence = "single" | "weekly";

/** メニューの指定方法。set = メニューセットから／individual = 個別に選ぶ。 */
export type ScheduleMenuSource = "individual" | "set";

export interface ScheduleFormValues {
  recurrence: ScheduleRecurrence;
  eventType: ScheduleEventType;
  title: string;
  /** 選択中の曜日番号（月=1〜日=7）。 */
  days: number[];
  /** YYYY-MM-DD。 */
  plannedOn: string;
  /** HH:MM。空文字は終日（時刻未設定）。 */
  scheduledTime: string;
  menuSource: ScheduleMenuSource;
  menuSetId: number | null;
  /** practice_menu_id → 目標量の入力文字列。キーの存在が「選択中」を意味する。 */
  menuAmounts: Record<number, string>;
  notificationEnabled: boolean;
  notificationMessage: string;
}

export interface BuildScheduleInputOptions {
  /** Pro（custom_notification_messages）を持つか。無い場合は送っても back に捨てられる。 */
  canCustomizeMessage: boolean;
  /** 練習ログ記録済みで編集ロックされたメニュー。入力値に関わらず元の内容を維持する。 */
  lockedMenus: ScheduleMenu[];
}

export const RECURRENCE_CONFLICT_ERROR = "曜日と日付は同時に指定できません";
export const RECURRENCE_MISSING_ERROR =
  "曜日または日付のいずれかを指定してください";
export const TITLE_REQUIRED_ERROR =
  "タイトルを入力してください（メニューセットを選ぶと省略できます）";
export const TITLE_TOO_LONG_ERROR = `タイトルは${SCHEDULE_TITLE_MAX_LENGTH}文字以内で入力してください`;

/** 入力欄の文字列を送信値へ変換する。空文字・非数は null（未指定）として送る。 */
function toNumberOrNull(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/** メニューセットを使う指定になっているか。セット未選択なら個別扱いに倒す。 */
function usesMenuSet(values: ScheduleFormValues): boolean {
  return values.menuSource === "set" && values.menuSetId !== null;
}

/**
 * 送信するメニュー項目を組み立てる。
 *
 * 編集ロックされたメニュー（logged_practice_menu_ids）は必ず元の目標量のまま含める。
 * back は menus を渡すと全置換するため、ロック対象を落とすと記録済みログとの紐付けが
 * 壊れて「済」判定が不整合になる。入力側の値は採用せず、サーバーから来た値を返す。
 */
export function buildScheduleMenuItems(
  menuAmounts: Record<number, string>,
  lockedMenus: ScheduleMenu[],
): { practice_menu_id: number; target_value: number | null }[] {
  const lockedIds = new Set(lockedMenus.map((menu) => menu.practice_menu_id));
  const locked = lockedMenus.map((menu) => ({
    practice_menu_id: menu.practice_menu_id,
    target_value: menu.target_value,
  }));
  const selected = Object.entries(menuAmounts)
    .map(([menuId, amount]) => ({
      practice_menu_id: Number(menuId),
      target_value: toNumberOrNull(amount),
    }))
    .filter((item) => !lockedIds.has(item.practice_menu_id));

  return [...locked, ...selected];
}

/**
 * フォームの状態を back の schedule パラメータへ変換する。
 * 排他制約に合わせ、選ばれていない側（days_of_week / planned_on）は必ず null で送る。
 */
export function buildScheduleInput(
  values: ScheduleFormValues,
  { canCustomizeMessage, lockedMenus }: BuildScheduleInputOptions,
): ScheduleInput {
  const usingSet = usesMenuSet(values);
  const message = values.notificationMessage.trim();

  return {
    title: values.title.trim() || null,
    event_type: values.eventType,
    days_of_week:
      values.recurrence === "weekly" && values.days.length > 0
        ? Array.from(new Set(values.days))
            .sort((a, b) => a - b)
            .join(",")
        : null,
    planned_on:
      values.recurrence === "single" ? values.plannedOn || null : null,
    scheduled_time: values.scheduledTime || null,
    menu_set_id: usingSet ? values.menuSetId : null,
    notification_enabled: values.notificationEnabled,
    notification_message: canCustomizeMessage && message ? message : null,
    // セット指定時は個別紐付けを空にして、表示元（menu_set）と実データを一致させる。
    menus: usingSet
      ? []
      : buildScheduleMenuItems(values.menuAmounts, lockedMenus),
  };
}

/**
 * 送信前のクライアント側バリデーション。
 * back のモデルバリデーション（排他必須・タイトル必須・50文字以内）と同じ条件を先に検査し、
 * 422 まで往復せずその場でエラーを返す。
 */
export function validateScheduleInput(input: ScheduleInput): string[] {
  const errors: string[] = [];
  const hasDays = Boolean(input.days_of_week);
  const hasDate = Boolean(input.planned_on);

  if (hasDays && hasDate) {
    errors.push(RECURRENCE_CONFLICT_ERROR);
  } else if (!hasDays && !hasDate) {
    errors.push(RECURRENCE_MISSING_ERROR);
  }

  const title = (input.title ?? "").trim();
  if (!input.menu_set_id && title === "") errors.push(TITLE_REQUIRED_ERROR);
  if (title.length > SCHEDULE_TITLE_MAX_LENGTH)
    errors.push(TITLE_TOO_LONG_ERROR);

  return errors;
}
