import * as Sentry from "@sentry/nextjs";

type CaptureContext = {
  action?: string;
  extra?: Record<string, unknown>;
};

export function captureServerActionError(
  error: unknown,
  context?: CaptureContext,
): void {
  if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
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
