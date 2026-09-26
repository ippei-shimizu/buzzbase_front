/**
 * メール確認待ちのメールアドレスをブラウザに控える。
 *
 * 確認リンクのクエリで受け取った uid がこの値と一致する場合だけ自動ログインを許可することで、
 * 第三者が用意したトークン付き URL を踏ませて別アカウントにログインさせる
 * ログイン CSRF を防ぐ。
 */

const PENDING_CONFIRMATION_UID_KEY = "buzzbase.auth.pendingConfirmationUid";

/**
 * 確認待ちのメールアドレスを保存する。
 * 保存できない環境では自動ログインが成立せず手動ログインに倒れるだけなので握りつぶす。
 */
export function writePendingConfirmationUid(uid: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PENDING_CONFIRMATION_UID_KEY, uid);
  } catch {
    // 保存できない場合は自動ログインを諦め、手動ログインに倒す
  }
}

/**
 * 確認待ちのメールアドレスを読む。
 *
 * @returns 保存済みのメールアドレス。未保存または参照できない環境では null
 */
export function readPendingConfirmationUid(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(PENDING_CONFIRMATION_UID_KEY);
  } catch {
    return null;
  }
}

/** 確認待ちのメールアドレスを破棄する。自動ログインが成立した後に呼ぶ。 */
export function clearPendingConfirmationUid(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PENDING_CONFIRMATION_UID_KEY);
  } catch {
    // 消せなくても次回の一致判定に影響しない
  }
}

/**
 * 確認リンクで受け取った uid を受け入れてよいか判定する。
 *
 * @param uid クエリの uid
 * @returns この端末で確認待ちのメールアドレスと一致すれば true
 */
export function isPendingConfirmationUid(uid: string): boolean {
  const pendingUid = readPendingConfirmationUid();
  if (!pendingUid) return false;
  return pendingUid.trim().toLowerCase() === uid.trim().toLowerCase();
}
