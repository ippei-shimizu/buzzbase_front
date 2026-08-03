// グループ導線オンボーディングの表示状態を保持する localStorage キー。
// 記録フロー（gameResultId など接頭辞なしのキー）と衝突させないため、
// この機能のキーはすべて同じ接頭辞配下にまとめる。
const ONBOARDING_STORAGE_PREFIX = "buzzbase.onboarding.";

/** グループ一覧の「招待コードで参加」ツールチップを表示済みか。 */
export const GROUP_JOIN_TOOLTIP_SHOWN_STORAGE_KEY = `${ONBOARDING_STORAGE_PREFIX}groupJoinTooltipShown`;

/** グローバルナビのグループ未参加バッジを閲覧済みか。 */
export const GROUP_TAB_BADGE_SEEN_STORAGE_KEY = `${ONBOARDING_STORAGE_PREFIX}groupTabBadgeSeen`;

/** ダッシュボードのグループ招待カードをユーザーが閉じたか。 */
export const INVITE_CARD_DISMISSED_STORAGE_KEY = `${ONBOARDING_STORAGE_PREFIX}inviteCardDismissed`;
