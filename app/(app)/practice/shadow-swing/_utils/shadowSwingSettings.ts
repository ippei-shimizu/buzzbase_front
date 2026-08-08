/**
 * 素振りカウンターの設定値と、プラン（entitlement）による可否判定。
 * ブラウザ API にも React にも依存しない純粋関数だけを置く。
 */

/**
 * 無料プランで選べるインターバルの範囲（秒）。
 * back/app/models/shadow_swing_session.rb の
 * `FREE_INTERVAL_RANGE`（無料は5〜8秒のみ）と一致させる。
 */
export const FREE_INTERVAL_MIN_SECONDS = 5;
export const FREE_INTERVAL_MAX_SECONDS = 8;

/** Pro プランで選べるインターバルの範囲（秒）。 */
export const PRO_INTERVAL_MIN_SECONDS = 1;
export const PRO_INTERVAL_MAX_SECONDS = 20;

/** 無料でもそのまま開始できるよう、既定値は無料の範囲内に置く。 */
export const DEFAULT_INTERVAL_SECONDS = 5;

export const DEFAULT_TARGET_COUNT = 200;
export const MIN_TARGET_COUNT = 1;
/** 現実的に振り切れる上限。桁の打ち間違いで数時間のセッションが始まるのを防ぐ。 */
export const MAX_TARGET_COUNT = 9999;

/** 選択肢として並べるインターバル（秒）。mobile の設定画面と同じ刻みで揃える。 */
export const INTERVAL_OPTIONS: readonly number[] = [
  1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];

/**
 * インターバル設定の解放状態。
 * `pending` は Pro 判定がまだ確定していない状態で、可否の扱いは無料と同じにする
 * （UI 上はロック表示ではなく「確認中」として見せる）。
 */
export type IntervalAccess = "pending" | "free" | "pro";

/**
 * Pro 判定の状態からインターバルの解放状態を決める。
 * 判定中を `pro` に倒すと、無料ユーザーが 5〜10 秒の外を選べてしまい、
 * 開始時にサーバー側とも食い違うため、判定中は必ず無料と同じ扱いにする。
 */
export function resolveIntervalAccess({
  isEntitlementLoading,
  hasCustomInterval,
}: {
  isEntitlementLoading: boolean;
  hasCustomInterval: boolean;
}): IntervalAccess {
  if (isEntitlementLoading) return "pending";
  return hasCustomInterval ? "pro" : "free";
}

/** 解放状態ごとに選べるインターバルの範囲（秒）。判定中は無料と同じ範囲。 */
export function intervalRange(access: IntervalAccess): {
  min: number;
  max: number;
} {
  if (access === "pro") {
    return { min: PRO_INTERVAL_MIN_SECONDS, max: PRO_INTERVAL_MAX_SECONDS };
  }
  return { min: FREE_INTERVAL_MIN_SECONDS, max: FREE_INTERVAL_MAX_SECONDS };
}

/** そのインターバルを選べるか。 */
export function isIntervalAllowed(
  seconds: number,
  access: IntervalAccess,
): boolean {
  if (!Number.isFinite(seconds)) return false;
  const { min, max } = intervalRange(access);
  return seconds >= min && seconds <= max;
}

/**
 * 選択済みのインターバルを解放状態の範囲へ引き戻す。
 * Pro 判定が確定して範囲が狭まったときに、選べない値のまま開始されるのを防ぐ。
 */
export function clampIntervalToAccess(
  seconds: number,
  access: IntervalAccess,
): number {
  const { min, max } = intervalRange(access);
  if (!Number.isFinite(seconds)) return DEFAULT_INTERVAL_SECONDS;
  return Math.min(Math.max(seconds, min), max);
}

/** 目標本数の入力値を検証する。空欄・非数・範囲外はエラー文言を返す。 */
export function validateTargetCount(value: string): {
  count: number | null;
  error: string | null;
} {
  const trimmed = value.trim();
  if (trimmed === "")
    return { count: null, error: "目標本数を入力してください" };

  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed)) {
    return { count: null, error: "目標本数は整数で入力してください" };
  }
  if (parsed < MIN_TARGET_COUNT || parsed > MAX_TARGET_COUNT) {
    return {
      count: null,
      error: `目標本数は${MIN_TARGET_COUNT}〜${MAX_TARGET_COUNT.toLocaleString("ja-JP")}本で入力してください`,
    };
  }
  return { count: parsed, error: null };
}

/** 合図の設定。笛の音とカウント読み上げは同時に有効にならない。 */
export interface CueSettings {
  whistle: boolean;
  speech: boolean;
}

export type CueKind = "whistle" | "speech";

export const DEFAULT_CUE_SETTINGS: CueSettings = {
  whistle: true,
  speech: false,
};

/**
 * 笛の音・カウント読み上げの選択を反映する。
 *
 * 両方を同時に鳴らすと読み上げが笛にかき消され、どちらの合図としても機能しなくなるため、
 * 片方を有効にしたらもう片方は必ず無効にする（＝排他）。
 * 有効化の分岐をここに閉じ込め、呼び出し側が両方 true の状態を作れないようにしている。
 */
export function applyCueSelection(
  current: CueSettings,
  kind: CueKind,
  enabled: boolean,
): CueSettings {
  if (!enabled) return { ...current, [kind]: false };
  return kind === "whistle"
    ? { whistle: true, speech: false }
    : { whistle: false, speech: true };
}

/**
 * バイブレーション設定の状態。
 * - available: 使える
 * - pending: Pro 判定が未確定（確定するまで有効化しない）
 * - locked: Pro 未加入
 * - unsupported: ブラウザが `navigator.vibrate` を持たない（iOS Safari など）
 */
export type VibrationAvailability =
  | "available"
  | "pending"
  | "locked"
  | "unsupported";

/**
 * バイブレーションの可否を決める。
 *
 * 非対応ブラウザの判定を最優先にする。Pro であっても `navigator.vibrate` が無い環境では
 * 一切振動しないため、「Pro なので設定できる」と見せてしまうと機能しない設定が残る。
 */
export function resolveVibrationAvailability({
  isSupported,
  isEntitlementLoading,
  hasVibration,
}: {
  isSupported: boolean;
  isEntitlementLoading: boolean;
  hasVibration: boolean;
}): VibrationAvailability {
  if (!isSupported) return "unsupported";
  if (isEntitlementLoading) return "pending";
  return hasVibration ? "available" : "locked";
}

/** バイブレーションを実際に有効化してよいか。 */
export function canEnableVibration(
  availability: VibrationAvailability,
): boolean {
  return availability === "available";
}

/** カウント画面へ引き渡す確定済みの設定。 */
export interface ShadowSwingConfig {
  targetCount: number;
  intervalSeconds: number;
  cue: CueSettings;
  vibration: boolean;
}
