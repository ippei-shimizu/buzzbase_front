import type { ImprovementThemeStatus } from "@app/types/improvementTheme";
import { IMPROVEMENT_THEME_FREE_LIMIT } from "@app/constants/improvementTheme";

export const FREE_LIMIT_TITLE = `無料プランで同時に取り組める課題は${IMPROVEMENT_THEME_FREE_LIMIT}件までです`;

export const FREE_LIMIT_DESCRIPTION =
  "克服・アーカイブした課題は件数に含まれません。Pro プランなら取組中の課題を無制限に持てます。";

/**
 * 作成が 403 で弾かれたときにフォームへ出す文言。
 * 別端末での追加などでクライアント側の件数判定がサーバーとずれた場合にここへ入る。
 */
export const FREE_LIMIT_SERVER_ERROR = `${FREE_LIMIT_TITLE}。${FREE_LIMIT_DESCRIPTION}`;

export const EMPTY_MESSAGE: Record<ImprovementThemeStatus, string> = {
  open: "いま取り組む課題を決めると、練習やノートがその課題に束ねられます。",
  achieved: "克服した課題はまだありません。",
  archived: "アーカイブした課題はありません。",
};

export const LOAD_ERROR_MESSAGE =
  "課題を取得できませんでした。時間を置いて再度お試しください。";

export const NOT_FOUND_MESSAGE = "課題が見つかりません。";

export const DELETE_CONFIRM_NOTICE =
  "削除しても、紐付いていた練習記録・ノートは残ります。";

export const TITLE_REQUIRED_ERROR = "課題のタイトルを入力してください。";

export const LINKED_SESSIONS_LOAD_ERROR =
  "紐づく練習記録を取得できませんでした。";

export const LINKED_NOTES_LOAD_ERROR = "紐づくノートを取得できませんでした。";
