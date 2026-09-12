import type { Plan } from "@app/types/plan";
import type { PracticeLog, PresetMenu } from "@app/types/practice";

/**
 * 「今日のやること」の状態計算。すべて純粋関数で、楽観的更新とロールバックの両方から使う。
 */

/**
 * 予定 × メニューを一意に指すキー。
 * 同じ練習メニューが複数の予定に含まれることがあり、practice_menu_id だけでは
 * どの予定のトグルなのか特定できない（「済」は予定単位で独立している）。
 */
export function planMenuKey(
  scheduleId: number,
  practiceMenuId: number,
): string {
  return `${scheduleId}:${practiceMenuId}`;
}

/**
 * 対象メニューの done を指定値に揃えた plans を返す。
 *
 * 反転ではなく「値を指定する」形にしているのは、失敗時のロールバックで
 * 元の状態へ確実に戻すため。反転を 2 回重ねる方式は、途中で別の更新が挟まると
 * 元に戻らない。予定全体の done も付随して計算し直す。
 */
export function setMenuDone(
  plans: Plan[],
  scheduleId: number,
  practiceMenuId: number,
  done: boolean,
): Plan[] {
  return plans.map((plan) => {
    if (plan.id !== scheduleId) return plan;
    const menus = plan.menus.map((menu) =>
      menu.practice_menu_id === practiceMenuId ? { ...menu, done } : menu,
    );
    return {
      ...plan,
      menus,
      done: menus.length > 0 && menus.every((menu) => menu.done),
    };
  });
}

/**
 * 「済」にしたメニューを練習記録のプリセットへ変換する。
 * 同じメニューが複数の予定で済になっていても記録先は 1 件なので、
 * practice_menu_id で重複を除く（先に現れた予定の目標量を採る）。
 */
export function donePresetMenus(plans: Plan[]): PresetMenu[] {
  const byMenuId = new Map<number, PresetMenu>();
  plans.forEach((plan) =>
    plan.menus.forEach((menu) => {
      if (!menu.done || byMenuId.has(menu.practice_menu_id)) return;
      byMenuId.set(menu.practice_menu_id, {
        practice_menu_id: menu.practice_menu_id,
        target_value: menu.target_value,
      });
    }),
  );
  return Array.from(byMenuId.values());
}

/**
 * 「済」を解除するために削除すべき練習ログの ID。
 * schedule_id が一致するログだけを対象にする。フル記録など予定に紐づかないログ
 * （schedule_id が null）まで消すと、予定と無関係な実績が失われる。
 */
export function doneLogIdsOf(
  logs: PracticeLog[],
  scheduleId: number,
  practiceMenuId: number,
): number[] {
  return logs
    .filter(
      (log) =>
        log.schedule_id === scheduleId &&
        log.practice_menu_id === practiceMenuId,
    )
    .map((log) => log.id);
}
