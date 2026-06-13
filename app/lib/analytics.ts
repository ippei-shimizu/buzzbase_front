declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      target: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

/**
 * GA4 にカスタムイベントを送信する薄いラッパー。
 * window.gtag が未注入の環境 (SSR・開発環境・本番以外) では no-op として安全にスキップする。
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params);
}
