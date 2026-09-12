import type { GoalTab } from "../_utils/goalList";
import type { GoalMetricKey } from "@app/types/goal";
import { MONTHLY_GOAL_FREE_LIMIT } from "@app/constants/goal";

export const FREE_LIMIT_TITLE = `無料プランで同時に設定できる目標は${MONTHLY_GOAL_FREE_LIMIT}件までです`;

export const FREE_LIMIT_DESCRIPTION =
  "週次・月次・年間・カスタム期間の目標は合わせて2件までです。Pro プランなら3つ目以降も同時に管理できます。";

/**
 * 作成が 403 で弾かれたときにフォームへ出す文言。
 * back の「Pro プランで期間目標を無制限に設定できます」は Pro 限定機能ではなく件数上限を指すため、
 * 別端末での追加などで件数判定がずれた場合も上限として案内する。
 */
export const FREE_LIMIT_SERVER_ERROR = `${FREE_LIMIT_TITLE}。${FREE_LIMIT_DESCRIPTION}`;

export const EMPTY_MESSAGE: Record<GoalTab, string> = {
  in_progress: "進行中の目標はありません",
  achieved: "達成した目標はまだありません",
  unachieved: "未達で終わった目標はありません",
};

export const LOAD_ERROR_MESSAGE =
  "目標を取得できませんでした。時間を置いて再度お試しください。";

export const BADGES_TITLE = "達成バッジ";

export const BADGES_DESCRIPTION =
  "期限を迎えた目標を達成すると、自動でバッジが増えます。";

/** 空状態の文言はモバイルアプリのバッジ一覧と揃える。 */
export const BADGES_EMPTY_TITLE = "まだ達成バッジはありません";

export const BADGES_EMPTY_DESCRIPTION =
  "目標を達成すると、ここにバッジが並びます";

export const BADGES_LOAD_ERROR_MESSAGE =
  "達成バッジを取得できませんでした。時間を置いて再度お試しください。";

export const HISTORY_LOAD_ERROR_MESSAGE =
  "達成・未達の履歴を取得できませんでした。進行中の目標のみ表示しています。";

export const DELETE_CONFIRM_NOTICE =
  "削除すると進捗の記録も失われます。達成バッジは残ります。";

/** 編集で変更できない項目の理由。UI の disabled とセットで必ず伝える。 */
export const IMMUTABLE_FIELDS_NOTICE =
  "目標タイプ・期間・指標・条件は作成後に変更できません。変更したい場合は削除して作り直してください。";

/** メニュー指定が必須な指標の説明。数え方が指標ごとに違うため文言も分ける。 */
export const MENU_METRIC_HINTS: Partial<Record<GoalMetricKey, string>> = {
  menu_practice_days: "期間内にこのメニューを実施した「日数」を数えます。",
  menu_practice_amount:
    "期間内にこのメニューでこなした量を合計します。単位はメニューの設定に従います。",
};

export const MANUAL_CURRENT_VALUE_HINT =
  "現在値は手入力で更新します（自動集計はしません）。";

export const NO_SEASON_MESSAGE =
  "シーズンがありません。シーズン管理から登録してください。";

export const NO_TOURNAMENT_MESSAGE =
  "大会がありません。試合記録で大会を登録してください。";

export const NO_PRACTICE_MENU_MESSAGE =
  "練習メニューがありません。練習メニュー画面で登録してください。";

export const AUTO_RANGE_HINTS = {
  monthly: "対象期間: 今月（自動設定）",
  weekly: "対象期間: 今週 月〜日（自動設定）",
  yearly: "対象期間: 今年 1月〜12月（自動設定）",
} as const;
