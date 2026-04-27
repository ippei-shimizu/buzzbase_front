import * as Sentry from "@sentry/nextjs";

type CaptureContext = {
  action?: string;
  extra?: Record<string, unknown>;
  /**
   * catch 内でエラーを再スローする場合は true を指定する。
   * その場合、本ヘルパーは captureException を呼ばず、isolation scope にタグだけ設定する。
   * → 再スロー後に Next.js / Sentry SDK の自動キャプチャが動くため、二重通知を防げる。
   */
  rethrow?: boolean;
};

/**
 * Server Actions の catch 句で使用するヘルパー。
 *
 * - NEXT_REDIRECT (Next.js の redirect() による疑似エラー) は無視する
 * - rethrow: false（デフォルト）: その場で captureException する（エラーを吸収する catch 用）
 * - rethrow: true: capture せず isolation scope にタグだけ設定する（再スローする catch 用）
 *
 * ⚠️ 注意:
 * NEXT_REDIRECT を含むパス（redirect() を呼んでいる Server Action）では、
 * このヘルパーを呼ぶ前に必ず手動で以下を実行すること:
 *
 *   if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) throw error;
 *
 * このヘルパーは void 戻りで re-throw しないため、redirect エラーを呼び出し側が
 * 意識的に再スローしないとリダイレクトが動作しない。
 */
export function captureServerActionError(
  error: unknown,
  context?: CaptureContext,
): void {
  if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
    return;
  }

  if (context?.rethrow) {
    const scope = Sentry.getIsolationScope();
    scope.setTag("source", "server-action");
    if (context.action) scope.setTag("action", context.action);
    if (context.extra) scope.setExtras(context.extra);
    return;
  }

  Sentry.captureException(error, {
    tags: {
      source: "server-action",
      ...(context?.action ? { action: context.action } : {}),
    },
    extra: context?.extra,
  });
}
