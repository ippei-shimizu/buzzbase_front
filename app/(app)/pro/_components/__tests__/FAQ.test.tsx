import { render } from "@testing-library/react";
import FAQ from "../FAQ";

/**
 * Accordion は keepContentMounted で回答も常に DOM に載せているため、
 * 開閉操作を挟まずテキスト全体を読める（framer-motion の dynamic import は Jest で解決できない）。
 */
function renderFaqText(): string {
  const { container } = render(<FAQ />);
  return container.textContent ?? "";
}

describe("FAQ", () => {
  it("Web 版とアプリ版で提供状況が異なることを説明する", () => {
    const text = renderFaqText();

    expect(text).toMatch(/Web 版とアプリ版のどちらでも使えますか/);
    expect(text).toMatch(/共通の 1 つの契約/);
    expect(text).toMatch(/方向別・カウント別・球種別・対戦投手別の打率/);
    expect(text).toMatch(/アプリ版からご利用ください/);
  });

  it("無料枠の数値が back の PlanLimits と一致する", () => {
    const text = renderFaqText();

    expect(text).toMatch(/個人の期間目標は 2 件まで/);
    expect(text).toMatch(/練習メニューは 3 件まで/);
    expect(text).toMatch(/動画・画像のアップロードは月 3 件まで/);
    expect(text).toMatch(/グループへの所属は 1 件まで/);
  });

  it("自主練スケジュールを無料でも上限なしと説明する", () => {
    // back の FREE_FEATURES: schedule_single は無料でも無制限に作成できる。
    expect(renderFaqText()).toMatch(/自主練スケジュール（作成数の上限なし）/);
  });

  it("解約後の制限を Pro 限定機能の実態に沿って説明する", () => {
    const text = renderFaqText();

    expect(text).toMatch(/削除されることはありません/);
    expect(text).toMatch(/方向別・カウント別・球種別・対戦投手別の打率/);
  });

  it("実在しない機能の訴求を掲載しない", () => {
    expect(renderFaqText()).not.toMatch(/長期保管/);
  });
});
