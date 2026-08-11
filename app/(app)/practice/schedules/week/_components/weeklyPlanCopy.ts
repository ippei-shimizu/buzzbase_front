/** 週の練習プラン画面の文言。表示のゆれを避けるため 1 箇所に集約する。 */

export const PREV_WEEK_LABEL = "前の週";
export const NEXT_WEEK_LABEL = "次の週";
export const THIS_WEEK_LABEL = "今週";
export const ADD_PLAN_LABEL = "予定を追加";

/** 0 件と取得失敗を同じ見た目にすると「予定なし」と誤読させるため、文言を分ける。 */
export const LOAD_ERROR =
  "予定を取得できませんでした。時間を置いて再度お試しください。";
export const EMPTY_DAY_LABEL = "―";

export const COPY_LABEL = "来週にコピー";
export const COPY_RUNNING_LABEL = "コピー中";

/** 週プランに並ぶのが単発予定だけであることと、繰り返しの登録先を示す。 */
export const RECURRING_NOTICE =
  "毎週くり返す予定はここには並びません。カレンダーから登録・確認できます。";

/** コピー元が 0 件、または既にコピー済みで新しく作られなかったとき。 */
export const COPY_EMPTY_MESSAGE =
  "この週にはコピーできる予定がありません（毎週くり返す予定はコピーされません）。";
export const copiedMessage = (count: number): string =>
  `${count}件の予定を来週にコピーしました`;

/**
 * 「来週にコピー」の 403 は Pro 限定機能を指す。
 * 予定の作成自体は無料プランでも無制限なので、無料枠の超過と読ませない。
 */
export const COPY_FORBIDDEN_MESSAGE =
  "「来週にコピー」は Pro プラン限定の機能です。";
export const COPY_PAYWALL_TITLE = "今週のプランを来週にまるごとコピー";
export const COPY_PAYWALL_DESCRIPTION =
  "予定の作成は無料プランでも無制限です。Pro プランなら、その週の予定をまとめて来週へコピーして、毎週のプラン作りをそのまま繰り返せます。";
