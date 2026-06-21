import { defineConfig, devices } from "@playwright/test";

/**
 * front の E2E（ゴールデンパス）設定。
 *
 * 対象アプリの URL は E2E_BASE_URL で指定する（既定は docker の front ホストポート 8100）。
 * ログインを伴うフローはシード済みテストユーザー（E2E_EMAIL / E2E_PASSWORD）と
 * 到達可能なバックエンドが前提。
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:8100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
