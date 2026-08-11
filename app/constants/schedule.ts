import type { ScheduleEventType } from "@app/types/schedule";

// back/app/models/schedule.rb の `validates :title, length: { maximum: 50 }` と一致させる。
export const SCHEDULE_TITLE_MAX_LENGTH = 50;

// back/app/models/schedule.rb の `validates :note, length: { maximum: 2000 }` と一致させる。
export const SCHEDULE_NOTE_MAX_LENGTH = 2000;

/**
 * 時刻の表示文字列。終了時刻があれば「開始〜終了」で返す。
 * 開始時刻が無い（終日）場合は null。
 */
export const scheduleTimeLabel = (
  scheduledTime: string | null,
  endTime: string | null,
): string | null => {
  if (!scheduledTime) return null;
  return endTime ? `${scheduledTime}〜${endTime}` : scheduledTime;
};

/**
 * 曜日マスタ。num は back の Schedule#day_numbers と同じ「月=1〜日=7」。
 * JavaScript の Date#getDay（日=0〜土=6）とはずれるため、変換せずこの番号だけを使う。
 */
export const WEEK_DAYS: ReadonlyArray<{ num: number; label: string }> = [
  { num: 1, label: "月" },
  { num: 2, label: "火" },
  { num: 3, label: "水" },
  { num: 4, label: "木" },
  { num: 5, label: "金" },
  { num: 6, label: "土" },
  { num: 7, label: "日" },
];

/** "1,3,5" を「月・水・金」へ整形する。未知の番号は無視する。 */
export const dayLabels = (daysOfWeek: string): string =>
  daysOfWeek
    .split(",")
    .map((value) => WEEK_DAYS.find((day) => day.num === Number(value))?.label)
    .filter((label): label is string => label !== undefined)
    .join("・");

/**
 * 種別マスタ。value は back の Schedule::EVENT_TYPES と完全一致させる。
 * color は mobile の @constants/schedule と同じ値を使い、種別の見た目を揃える。
 */
export const EVENT_TYPES: ReadonlyArray<{
  value: ScheduleEventType;
  label: string;
  color: string;
}> = [
  { value: "self_practice", label: "自主練", color: "#4a8e32" },
  { value: "practice", label: "チーム練習", color: "#3B82F6" },
  { value: "game", label: "試合", color: "#EF4444" },
  { value: "other", label: "その他", color: "#52525B" },
];

/** 種別のメタ情報を返す。未知の値は自主練にフォールバックする。 */
export const eventTypeMeta = (value: ScheduleEventType) =>
  EVENT_TYPES.find((event) => event.value === value) ?? EVENT_TYPES[0];

/**
 * 無料プランでカレンダーを閲覧できる、今日を中心とした前後の月数。
 *
 * back/app/controllers/api/v2/plans_controller.rb の同名定数と揃える。範囲の判定権は
 * back にあり（entitlement が無ければ from / to をこの幅にクランプして返す）、front の
 * この値は「ペイウォールをどこで出すか」という表示上の目安にすぎない。back が広げても
 * front が狭いままだと閲覧できるはずの日をロック表示してしまうため、値を変えるときは
 * back・mobile と同時に更新する。
 *
 * 本来は API が上限を返し front が受け取るのが正しい（front / back / mobile の三重定義を
 * 解消できる）が、レスポンス形式の変更は back 側の対応が要るため現時点は定数で揃える。
 */
export const FREE_CALENDAR_WINDOW_MONTHS = 3;
