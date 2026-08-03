import type { PostHog } from "posthog-js";

/**
 * 計測イベントに載せるプロパティ。
 * 個人情報（メールアドレス・本名・生年月日・トークン）を載せないため、
 * 値はスカラーのみに限定してオブジェクトの丸ごと送信を型で防ぐ。
 */
export type AnalyticsProperties = Record<
  string,
  string | number | boolean | null
>;

interface QueuedEvent {
  event: string;
  properties?: AnalyticsProperties;
}

const DEFAULT_API_HOST = "https://us.i.posthog.com";

// posthog-js のロード完了前に発生したイベント（画面表示直後の step viewed など）を
// 落とさないためのバッファ。ロードに失敗し続けてもメモリを食い潰さないよう上限を持つ。
const MAX_QUEUED_EVENTS = 20;

let client: PostHog | null = null;
let isLoading = false;
const queue: QueuedEvent[] = [];

/**
 * 計測が有効かどうか。
 * キー未設定の環境（開発 / CI / preview）とサーバー側では常に false になり、
 * posthog-js のロードもネットワークリクエストも一切発生しない。
 */
export function isPostHogEnabled(): boolean {
  return typeof window !== "undefined" && !!process.env.NEXT_PUBLIC_POSTHOG_KEY;
}

function flushQueue(instance: PostHog): void {
  while (queue.length > 0) {
    const queued = queue.shift();
    if (!queued) return;
    try {
      instance.capture(queued.event, queued.properties);
    } catch {
      // 計測層はアプリの動作を壊さない
    }
  }
}

/**
 * PostHog クライアントを初期化する。ブラウザでのみ動作し、多重呼び出しは無視される。
 * posthog-js は初回描画に不要なため動的 import で遅延ロードし、描画をブロックしない。
 */
export function initPostHog(): void {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!isPostHogEnabled() || !apiKey || client !== null || isLoading) return;
  isLoading = true;
  void import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(apiKey, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? DEFAULT_API_HOST,
        defaults: "2025-05-24",
        // 中高生ユーザーの PII 保護のため、DOM のテキストや入力値を自動収集する
        // 機能（autocapture / セッションリプレイ）は全て無効にし、
        // このリポジトリで明示的に定義したイベントだけを送る。
        autocapture: false,
        disable_session_recording: true,
        disable_surveys: true,
        capture_pageview: "history_change",
        person_profiles: "identified_only",
      });
      client = posthog;
      flushQueue(posthog);
    })
    .catch(() => {
      // 計測ライブラリのロード失敗でアプリを壊さない
    })
    .finally(() => {
      isLoading = false;
    });
}

/**
 * イベントを 1 件送信する。
 * 無効時（キー未設定 / サーバー側）は完全な no-op で、失敗しても例外を投げない。
 */
export function capture(event: string, properties?: AnalyticsProperties): void {
  if (!isPostHogEnabled()) return;
  try {
    if (client === null) {
      if (queue.length < MAX_QUEUED_EVENTS) queue.push({ event, properties });
      return;
    }
    client.capture(event, properties);
  } catch {
    // 計測の失敗で呼び出し元の処理（保存・画面遷移）を止めない
  }
}

/**
 * ログイン中ユーザーを PostHog に紐付ける。
 * 名前やメールアドレスは渡さず、mobile と同じ内部 ID のみを識別子に使う
 * （Web / アプリで同一ユーザーとして集計するため）。
 */
export function identifyUser(userId: number): void {
  if (!isPostHogEnabled()) return;
  try {
    client?.identify(String(userId));
  } catch {
    // 計測の失敗で呼び出し元の処理を止めない
  }
}

/** ログアウト時に識別情報を破棄し、以降を匿名ユーザーとして扱う。 */
export function resetUser(): void {
  if (!isPostHogEnabled()) return;
  try {
    client?.reset();
  } catch {
    // 計測の失敗で呼び出し元の処理を止めない
  }
}
