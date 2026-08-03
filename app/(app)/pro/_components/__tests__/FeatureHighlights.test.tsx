import { render, screen, within } from "@testing-library/react";
import { PRO_PAYWALL_COPY } from "@app/components/pro/paywallCopy";
import { SHOWCASE_FEATURES } from "@app/components/pro/proFeatureCatalog";
import FeatureHighlights from "../FeatureHighlights";

describe("FeatureHighlights", () => {
  it("SHOWCASE_FEATURES の機能を benefits の箇条書きで紹介する", () => {
    render(<FeatureHighlights />);

    for (const feature of SHOWCASE_FEATURES) {
      const copy = PRO_PAYWALL_COPY[feature];
      const card = screen
        .getByRole("heading", { name: new RegExp(copy.title) })
        .closest("article");

      expect(card).not.toBeNull();
      for (const benefit of copy.benefits ?? []) {
        expect(
          within(card as HTMLElement).getByText(benefit),
        ).toBeInTheDocument();
      }
    }
  });

  it("アプリ版でのみ使える機能に「アプリ版」を明記する", () => {
    render(<FeatureHighlights />);

    const correlationCard = screen
      .getByRole("heading", { name: /練習と成績の関係を発見/ })
      .closest("article");
    expect(
      within(correlationCard as HTMLElement).getByText("アプリ版"),
    ).toBeInTheDocument();

    const directionCard = screen
      .getByRole("heading", { name: /方向別の打率/ })
      .closest("article");
    expect(
      within(directionCard as HTMLElement).queryByText("アプリ版"),
    ).not.toBeInTheDocument();
  });

  it("実物のない「スクリーンショット」のプレースホルダを出さない", () => {
    const { container } = render(<FeatureHighlights />);
    expect(container.textContent).not.toMatch(/スクリーンショット/);
  });
});
