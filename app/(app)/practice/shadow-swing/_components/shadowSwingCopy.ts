import {
  FREE_INTERVAL_MAX_SECONDS,
  FREE_INTERVAL_MIN_SECONDS,
  PRO_INTERVAL_MAX_SECONDS,
  PRO_INTERVAL_MIN_SECONDS,
} from "../_utils/shadowSwingSettings";

/**
 * 素振りカウンターの文言。UI 実装から切り離し、
 * ブラウザ制約についてユーザーに何を約束しているかを一箇所で読めるようにする。
 */

export const PAGE_TITLE = "素振りカウンター";

export const PAGE_DESCRIPTION =
  "設定したインターバルで自動的にカウントアップし、素振りの本数を練習記録に保存します。笛の音や読み上げでテンポを取りながら振れます。";

export const FREE_INTERVAL_HINT = `無料プランはインターバル${FREE_INTERVAL_MIN_SECONDS}〜${FREE_INTERVAL_MAX_SECONDS}秒のみ選べます。Pro なら${PRO_INTERVAL_MIN_SECONDS}〜${PRO_INTERVAL_MAX_SECONDS}秒の全範囲を使えます。`;

export const INTERVAL_PENDING_HINT =
  "プランを確認しています。確認できるまではインターバルの選択範囲を無料プランと同じにしています。";

export const CUE_EXCLUSIVE_HINT =
  "「笛の音」と「カウント読み上げ」は同時に鳴らすと聞き分けられないため、どちらか一方だけを選べます。";

export const VIBRATION_LOCKED_HINT =
  "バイブレーションは Pro プラン限定の機能です。";

/**
 * `navigator.vibrate` 非対応環境（iOS Safari など）向けの説明。
 * ここで黙ってトグルだけ無効にすると「なぜ押せないのか」が分からないため、
 * 端末側の制約であることまで書く。
 */
export const VIBRATION_UNSUPPORTED_HINT =
  "お使いのブラウザはバイブレーションに対応していないため設定できません（iOS の Safari など）。アプリ版では利用できます。";

/**
 * バックグラウンド継続実行（Pro: shadow_swing_background）の扱い。
 * ブラウザは非アクティブタブのタイマーを間引き、音声や振動も止まるため
 * Web では提供しない。トグルは出さず、代わりに何が起きるかを説明する。
 */
export const BACKGROUND_WEB_NOTICE =
  "ブラウザでは、他のタブや別アプリに切り替えるとカウントを続けられません。切り替えを検知した時点で自動的に一時停止し、戻ってきたら「再開」から続けられます。バックグラウンドでの継続実行はアプリ版のみの機能です。";

/** Screen Wake Lock 非対応環境（対応していれば表示しない）向けの注意書き。 */
export const WAKE_LOCK_UNSUPPORTED_NOTICE =
  "お使いのブラウザは画面の自動消灯を抑止できません。素振り中に画面が消えると一時停止するため、端末の自動ロックを長めに設定してください。";

export const AUTO_PAUSED_BY_HIDDEN =
  "画面が切り替わったため一時停止しました。「再開」で続けられます。";

export const LEAVE_CONFIRM_MESSAGE =
  "素振りをカウント中です。ページを離れると記録されません。";

export const START_BUTTON_LABEL = "開始する";
export const PAUSE_BUTTON_LABEL = "一時停止";
export const RESUME_BUTTON_LABEL = "再開";
export const FINISH_BUTTON_LABEL = "終了する";

export const SAVE_FAILED_TITLE = "記録の保存に失敗しました";
export const SAVE_FAILED_DESCRIPTION =
  "カウントした本数はこの画面に残しています。通信状況を確認して「再試行」を押してください。";
export const RETRY_BUTTON_LABEL = "再試行";

export const SAVED_MESSAGE = "練習記録に保存しました";
export const SAVING_MESSAGE = "練習記録に保存しています…";

export const NO_SWING_MESSAGE =
  "1本もカウントされていないため、記録は保存していません。";

export const STATS_ERROR_MESSAGE =
  "積み上げ本数を取得できませんでした。時間を置いて再度お試しください。";

export const START_FAILED_MESSAGE = "素振りを開始できませんでした";
