import { render, screen, within } from "@testing-library/react";
import { PRO_PAYWALL_COPY } from "@app/components/pro/paywallCopy";
import { FEATURE_COMPARISONS } from "@app/components/pro/proFeatureCatalog";
import { PRO_FEATURES } from "@app/types/pro";
import FeatureComparisonTable from "../FeatureComparisonTable";

/** #453 で削除した、実在しない機能の訴求。復活していないことを見張る。 */
const REMOVED_CLAIMS = [/長期保管/, /スケジュール.{0,6}無制限/];

describe("FeatureComparisonTable", () => {
  it("Pro 機能 31 項目を 1 行ずつ掲載する", () => {
    render(<FeatureComparisonTable />);

    // 各グループの見出し行を除いた本文行が Pro 機能の総数に一致する。
    const bodyRows = screen
      .getAllByRole("row")
      .filter((row) => within(row).queryAllByRole("columnheader").length === 0);

    expect(bodyRows).toHaveLength(PRO_FEATURES.length);
    expect(PRO_FEATURES).toHaveLength(31);
  });

  it("すべての Pro 機能の名称が表示される", () => {
    render(<FeatureComparisonTable />);

    for (const feature of PRO_FEATURES) {
      expect(
        screen.getByRole("rowheader", {
          name: new RegExp(PRO_PAYWALL_COPY[feature].title),
        }),
      ).toBeInTheDocument();
    }
  });

  it("無料枠の数値を掲載する", () => {
    render(<FeatureComparisonTable />);

    const mediaRow = screen
      .getByRole("rowheader", { name: /動画・画像を無制限にアップロード/ })
      .closest("tr");
    expect(
      within(mediaRow as HTMLElement).getByText("月3件"),
    ).toBeInTheDocument();

    const goalRow = screen
      .getByRole("rowheader", { name: /個人の期間目標を無制限に設定/ })
      .closest("tr");
    expect(within(goalRow as HTMLElement).getByText("2件")).toBeInTheDocument();

    const groupRow = screen
      .getByRole("rowheader", { name: /グループを無制限に作成・参加/ })
      .closest("tr");
    expect(
      within(groupRow as HTMLElement).getByText("1件"),
    ).toBeInTheDocument();
  });

  it("アプリ版でのみ使える機能に「アプリ版」を明記する", () => {
    render(<FeatureComparisonTable />);

    const appOnlyCount = PRO_FEATURES.filter(
      (feature) => FEATURE_COMPARISONS[feature].availability === "app_only",
    ).length;

    expect(screen.getAllByText("アプリ版")).toHaveLength(appOnlyCount);
    expect(
      within(
        screen
          .getByRole("rowheader", { name: /バックグラウンドでも継続実行/ })
          .closest("tr") as HTMLElement,
      ).getByText("アプリ版"),
    ).toBeInTheDocument();
  });

  it("Web で使える機能には「アプリ版」を付けない", () => {
    render(<FeatureComparisonTable />);

    const directionRow = screen
      .getByRole("rowheader", { name: /方向別の打率/ })
      .closest("tr");

    expect(
      within(directionRow as HTMLElement).queryByText("アプリ版"),
    ).not.toBeInTheDocument();
  });

  it("実在しない機能の訴求を掲載しない", () => {
    const { container } = render(<FeatureComparisonTable />);

    for (const claim of REMOVED_CLAIMS) {
      expect(container.textContent).not.toMatch(claim);
    }
  });
});
