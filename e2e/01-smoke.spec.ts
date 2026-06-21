import { test, expect } from "@playwright/test";

// 疎通確認（土台）。signin 画面が表示され、フォームが描画されることだけを確認する。
// これが green でないと以降のゴールデンパスは成立しない。認証・バックエンド不要。
test("signin 画面が表示される", async ({ page }) => {
  await page.goto("/signin");
  await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
  await expect(page.getByPlaceholder("buzzbase@example.com")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "ログインする" }),
  ).toBeVisible();
});
