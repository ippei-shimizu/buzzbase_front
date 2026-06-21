import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

// ゴールデンパス: 新仕様の試合記録フローに入り、試合情報フォームが表示される。
// 守るリスク: 新仕様の主導線（記録 → 試合情報入力 → 記録パターン分岐）の結合崩れ。
test("試合記録フォームと記録パターン分岐が表示される", async ({ page }) => {
  await login(page);

  await page.goto("/game-result/record");
  await expect(page.getByText("自チーム")).toBeVisible();
  await expect(page.getByText("相手チーム")).toBeVisible();
  await expect(page.getByText("球場").first()).toBeVisible();
  await expect(page.getByText("記録パターン")).toBeVisible();

  // TODO(CI iteration): 以下の深い導線を段階追加する。
  //   1. チーム/球場/点数を入力し記録パターン（両方/打撃のみ/投球のみ）を選ぶ
  //   2. 打席記録ウィザード（グラウンド/結果/得点）を完走する
  //   3. 試合結果サマリーで入力した打席が表示される
  //   座標・動的要素は data-testid 付与を前提に伸ばす。
});
