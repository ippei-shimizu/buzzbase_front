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

/** 初回ウォークスルー（3ステップのスライド）を見終えたか。 */
export const WALKTHROUGH_COMPLETED_STORAGE_KEY = `${ONBOARDING_STORAGE_PREFIX}walkthroughCompleted`;

export type OnboardingIllustration = "autoCalc" | "ranking" | "growth";

export interface OnboardingStep {
  illustration: OnboardingIllustration;
  title: string;
  copy: string;
}

// 業界平均に合わせ3ステップを上限とする（5以上は離脱増）。順序が表示順。
// モバイルアプリの初回起動ウォークスルーと文言・順序を揃えている。
export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    illustration: "autoCalc",
    title: "打者も投手も、入力するだけで自動計算",
    copy: "もう自分で電卓を叩かなくていい。打率・OPS から防御率・奪三振まで、打撃も投球も29指標を自動で算出します。",
  },
  {
    illustration: "ranking",
    title: "チームメイトとランキングで競う",
    copy: "友達と打率を競い合おう。グループ内ランキングでモチベーションが続きます。",
  },
  {
    illustration: "growth",
    title: "成長を1枚のグラフで",
    copy: "成績の推移をグラフで振り返り。自分の成長が一目でわかります。",
  },
] as const;
