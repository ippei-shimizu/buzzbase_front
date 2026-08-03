/**
 * 素振りカウンターが使うブラウザ API の対応可否。
 * SSR では `navigator` が無いので必ず false を返し、クライアントで再判定する。
 */

/**
 * `navigator.vibrate` を持つか。iOS Safari は非対応で、Android Chrome などは対応する。
 * 呼んでも例外は出ずに何も起きないため、機能検出しないと
 * 「設定できるのに一切振動しない」状態を作ってしまう。
 */
export function supportsVibration(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

/**
 * Screen Wake Lock API（画面の自動消灯抑止）を持つか。
 * 非対応環境では素振り中に画面が消えるため、呼び出し側で注意書きを出す。
 */
export function supportsScreenWakeLock(): boolean {
  return typeof navigator !== "undefined" && "wakeLock" in navigator;
}

/** `useSyncExternalStore` 用の購読関数。対応可否は実行中に変わらないので何も購読しない。 */
export function subscribeToNothing(): () => void {
  return () => {};
}

/** SSR 時のスナップショット。クライアントで判定するまでは「非対応」として描画する。 */
export function unsupportedOnServer(): false {
  return false;
}
