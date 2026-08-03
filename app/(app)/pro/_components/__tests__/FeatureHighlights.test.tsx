import { render, screen, within } from "@testing-library/react";
import { PRO_PAYWALL_COPY } from "@app/components/pro/paywallCopy";
import {
  APP_ONLY_LABEL,
  SHOWCASE_FEATURES,
} from "@app/components/pro/proFeatureCatalog";
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

  it("訴求している機能はすべて Web 提供済みなので「アプリ版」を出さない", () => {
    render(<FeatureHighlights />);

    expect(screen.queryByText(APP_ONLY_LABEL)).not.toBeInTheDocument();
  });

  it("実物のない「スクリーンショット」のプレースホルダを出さない", () => {
    const { container } = render(<FeatureHighlights />);
    expect(container.textContent).not.toMatch(/スクリーンショット/);
  });
});
