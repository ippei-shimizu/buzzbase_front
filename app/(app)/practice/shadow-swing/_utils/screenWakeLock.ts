import { supportsScreenWakeLock } from "./browserSupport";

/**
 * 素振り中の画面消灯を抑止する Screen Wake Lock のラッパー。
 *
 * 非対応環境（Safari の一部バージョンなど）では取得に失敗するが、その場合も
 * 素振り自体は続けられるため例外にはしない。呼び出し側は `supportsScreenWakeLock()` を見て
 * 「端末の自動ロックが働く」旨の注意書きを出す。
 */

/** lib.dom の型に依らず、使う分だけを構造的に受ける。 */
interface WakeLockSentinelLike {
  released: boolean;
  release(): Promise<void>;
}

interface WakeLockLike {
  request(type: "screen"): Promise<WakeLockSentinelLike>;
}

function resolveWakeLock(): WakeLockLike | null {
  if (!supportsScreenWakeLock()) return null;
  return (
    (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock ?? null
  );
}

export class ScreenWakeLock {
  private sentinel: WakeLockSentinelLike | null = null;

  /**
   * ロックを取得する。
   * タブが非表示の間はブラウザが必ず拒否するため、可視状態に戻ってから呼び直す必要がある。
   *
   * @return 取得できたか
   */
  async acquire(): Promise<boolean> {
    const wakeLock = resolveWakeLock();
    if (!wakeLock) return false;
    if (this.sentinel && !this.sentinel.released) return true;

    try {
      this.sentinel = await wakeLock.request("screen");
      return true;
    } catch {
      this.sentinel = null;
      return false;
    }
  }

  /** ロックを解放する。取得していなければ何もしない。 */
  async release(): Promise<void> {
    const sentinel = this.sentinel;
    this.sentinel = null;
    if (!sentinel || sentinel.released) return;
    try {
      await sentinel.release();
    } catch {
      // 解放に失敗しても、タブを閉じればブラウザ側で解放される。
    }
  }
}
