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
 * - SSR / gtag 未注入環境では no-op として安全にスキップする
 * - gtag 呼び出し自体も try/catch で握りつぶし、計装層が本来のフロー（router.push 等）を壊さないことを保証する
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;
  try {
    window.gtag("event", eventName, params);
  } catch {
    // 計装層は本来のフローを壊さない。失敗はサイレントに握りつぶす
  }
}
