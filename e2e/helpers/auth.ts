import { expect, type Page } from "@playwright/test";

/**
 * signin 画面から UI 経由でログインする。
 * 認証情報はシード済みテストユーザー（E2E_EMAIL / E2E_PASSWORD）を環境変数で渡す。
 * devise_token_auth の access-token / client / uid Cookie がセットされる。
 */
export async function login(page: Page): Promise<void> {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "E2E_EMAIL / E2E_PASSWORD が未設定です（シード済みテストユーザーが必要）",
    );
  }

  await page.goto("/signin");
  await page.getByPlaceholder("buzzbase@example.com").fill(email);
  await page.getByPlaceholder("6文字以上半角英数字のみ").fill(password);
  await page.getByRole("button", { name: "ログインする" }).click();

  // ログイン成功でマイページ（/mypage/:user_id）へ遷移する。
  await expect(page).toHaveURL(/\/mypage\//, { timeout: 15000 });
}
