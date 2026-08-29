import type { PracticeLog, PresetMenu } from "@app/types/practice";
import type { Schedule, ScheduleMenu } from "@app/types/schedule";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * 「済」を判定する日付を決める。
 * 明示的な `?date=` があればそれを使い、無ければ単発予定の日付、
 * どちらも無い（毎週の予定を直接開いた）場合は今日を対象にする。
 */
export function resolveContextDate(
  raw: string | undefined,
  schedule: Schedule,
  today: string,
): string {
  if (raw && DATE_PATTERN.test(raw)) return raw;
  return schedule.planned_on ?? today;
}

/**
 * その日の練習ログを practice_menu_id → ログ ID 配列へ畳み込む。
 * 「済」は予定（schedule）単位で判定するため、他の予定やフル記録のログ（schedule_id 違い）は除く。
 * 解除時に削除する対象を特定できるよう、件数ではなく ID を保持する。
 */
export function buildDoneLogIds(
  logs: PracticeLog[],
  scheduleId: number,
): Record<number, number[]> {
  return logs.reduce<Record<number, number[]>>((acc, log) => {
    if (log.schedule_id !== scheduleId || log.practice_menu_id === null) {
      return acc;
    }
    const menuId = log.practice_menu_id;
    acc[menuId] = [...(acc[menuId] ?? []), log.id];
    return acc;
  }, {});
}

/** 「済」になっているメニューだけをプリセット形式へ変換する。 */
export function doneMenusAsPresets(
  menus: ScheduleMenu[],
  doneLogIds: Record<number, number[]>,
): PresetMenu[] {
  return menus
    .filter((menu) => (doneLogIds[menu.practice_menu_id]?.length ?? 0) > 0)
    .map((menu) => ({
      practice_menu_id: menu.practice_menu_id,
      target_value: menu.target_value,
    }));
}

/**
 * 済メニューを引き継いで練習記録画面を開く URL を組み立てる。
 *
 * 練習記録側は「URL の date と画面で選択中の日付が一致するとき」だけプリセットを適用するため、
 * date を必ず添える。省略するとプリセットが無効化されて引き継ぎが効かない。
 */
export function buildPracticeRecordHref(
  date: string,
  presetMenus: PresetMenu[],
): string {
  const query = new URLSearchParams({ date });
  if (presetMenus.length > 0) {
    query.set("presetMenus", JSON.stringify(presetMenus));
  }
  return `/practice/record?${query.toString()}`;
}
