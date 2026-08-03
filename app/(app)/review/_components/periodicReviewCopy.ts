export const PAGE_TITLE = "振り返りレポート";
export const PAGE_DESCRIPTION =
  "週末・月末に、その期間の練習量と成績の変化を自動でまとめてお届けします。";

/** Pro だがまだレポートが生成されていないときの案内。訴求は出さない（すでに加入済みのため）。 */
export const NOT_GENERATED_MESSAGE =
  "まだレポートがありません。週明け・月初に、その期間のがんばりと成績の振り返りがここに届きます。";

/** 取得失敗。0 件（未生成）と同じ文言にすると「届いていない」と誤解させるため分ける。 */
export const LOAD_ERROR_MESSAGE =
  "振り返りレポートを取得できませんでした。時間をおいて再度お試しください。";

export const BANNER_TITLE = "振り返りレポートが届いています";
export const BANNER_ERROR_TITLE = "振り返りレポートを取得できませんでした";
export const BANNER_ERROR_SUB = "タップで一覧を開く";

/** 未読件数の表示。0 件では呼ばない（バナー自体を出さない）。 */
export const bannerUnreadLabel = (count: number): string =>
  `未読 ${count} 件・タップで確認`;
