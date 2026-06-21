import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";

// ゴールデンパス: 既存ユーザー（v1 データのみ）でログイン → 成績画面が崩れず表示される。
// 守るリスク: v2 リファクタが既存ユーザーの集計画面を壊す後方互換リグレッション。
test("既存ユーザーで成績画面が表示される", async ({ page }) => {
  await login(page);

  await page.goto("/stats");
  // 成績画面が描画され、打撃成績タブ・集計テーブルが表示されることを確認する。
  await expect(page.getByText("打撃成績")).toBeVisible();
  await expect(page.getByText("打率")).toBeVisible();
});
