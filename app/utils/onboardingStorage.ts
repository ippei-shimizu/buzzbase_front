// フラグは「立っているかどうか」しか持たないため、値は固定文字列で十分。
const FLAG_ENABLED_VALUE = "1";

/**
 * オンボーディング導線の表示済みフラグを読む。
 *
 * @param key 対象のフラグキー
 * @returns フラグが立っていれば true（＝もう出さない）。
 *   プライベートブラウジングなど localStorage を参照できない環境では true に倒す。
 *   永続化できない環境で「閉じても毎回出てくる導線」を出し続ける方が害が大きいため。
 */
export function readOnboardingFlag(key: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(key) === FLAG_ENABLED_VALUE;
  } catch {
    return true;
  }
}

/**
 * オンボーディング導線を表示済みとして永続化する。
 * 容量超過などで保存できなくても表示制御そのものは継続させたいので握りつぶす。
 *
 * @param key 対象のフラグキー
 */
export function writeOnboardingFlag(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, FLAG_ENABLED_VALUE);
  } catch {
    // 保存できなくても現在の表示状態は呼び出し側が保持する
  }
}
