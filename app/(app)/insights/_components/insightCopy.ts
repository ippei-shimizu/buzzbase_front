import { INSIGHT_COMBINATION_LIMIT } from "@app/constants/insight";

export const PAGE_TITLE = "練習と成績のつながり";

/**
 * 見出し下のリード文。相関であって因果ではないことを最初に明示する。
 * mobile の一覧画面と同じ文言。
 */
export const PAGE_DESCRIPTION =
  "あなたの練習・コンディションと成績の傾向です。必ずそうなるとは限りませんが、続けるほど精度が上がります。";

export const CUSTOM_SECTION_TITLE = "自作";
export const PRESET_SECTION_TITLE = "おすすめ";

/** Pro だがカードが1枚も無いとき。取得失敗と混同させない。 */
export const EMPTY_MESSAGE =
  "まだ表示できるカードがありません。練習と成績を記録していくと、ここに傾向が並びます。";

/** 自作カードが 0 件のとき。おすすめは別途表示されるため、作成導線の案内だけにする。 */
export const CUSTOM_EMPTY_MESSAGE =
  "自作の組み合わせはまだありません。気になる組み合わせを作ると、ここに並びます。";

/** 取得失敗。0 件と同じ文言にすると「記録が足りない」と誤解させるため分ける。 */
export const LOAD_ERROR_MESSAGE =
  "練習と成績のつながりを取得できませんでした。時間を置いて再度お試しください。";

export const CREATE_BUTTON_LABEL = "組み合わせを作る";
export const FORM_TITLE = "組み合わせを作る";

/** 作成フォームの説明。何が作られるのかだけを述べ、効果は約束しない。 */
export const FORM_DESCRIPTION =
  "「やったこと」と「成績」を1つずつ選ぶと、週ごとの傾向カードが作られます。";

export const INPUT_MODE_LABEL = "入力（やったこと）";
export const METRIC_LABEL = "成績";
export const FIXED_INPUT_MODE_LABEL = "コンディション・練習量";
export const MENU_INPUT_MODE_LABEL = "練習メニュー";

export const NO_PRACTICE_MENU_MESSAGE =
  "練習メニューがありません。先に練習メニューを作ってください。";

export const INPUT_REQUIRED_ERROR = "入力（やったこと）を選んでください。";
export const MENU_REQUIRED_ERROR = "練習メニューを選んでください。";
export const METRIC_REQUIRED_ERROR = "成績を選んでください。";
export const DUPLICATE_ERROR = "同じ組み合わせのカードがすでにあります。";

/**
 * 20件上限に達したときの案内。
 * Pro 内での件数上限なので、Pro 訴求へは倒さない。
 */
export const LIMIT_REACHED_MESSAGE = `自作の組み合わせは${INSIGHT_COMBINATION_LIMIT}件までです。新しく作るには、いらないカードを削除してください。`;

/**
 * 作成が 403 で弾かれたときの案内。
 * この 403 は件数超過ではなく「機能そのものが Pro 限定」を意味する。
 */
export const PRO_ONLY_ERROR =
  "「練習と成績のつながり」は Pro プラン限定です。Pro プランに加入すると組み合わせを作れます。";

export const DELETE_MODAL_TITLE = "組み合わせの削除";

/** 削除確認の補足。削除しても記録自体は消えないことを伝える。 */
export const DELETE_NOTICE =
  "削除しても、練習の記録や成績は消えません。カードだけが一覧から消えます。";

export const DELETE_SUCCESS_MESSAGE = "組み合わせを削除しました";
export const CREATE_SUCCESS_MESSAGE = "組み合わせを作成しました";

/** 作成は成功したが一覧の再取得に失敗したとき。作成の成否を取り違えさせない。 */
export const REFRESH_FAILED_MESSAGE =
  "作成しましたが、一覧を更新できませんでした。ページを再読み込みしてください。";
