import { render } from "@testing-library/react";
import ColumnArticleJsonLd from "../ColumnArticleJsonLd";

const baseProps = {
  headline: "OPSとは？意味・計算方法を解説",
  description: "OPS の意味と計算方法を解説します。",
  path: "/column/ops",
  breadcrumbLeafName: "OPSとは",
  datePublished: "2026-03-24",
  dateModified: "2026-09-24",
};

function parseJsonLd(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll('script[type="application/ld+json"]'),
  ).map((script) => JSON.parse(script.innerHTML));
}

describe("ColumnArticleJsonLd", () => {
  it("Article に公開日・更新日・著者・mainEntityOfPage を出力する", () => {
    const { container } = render(
      <ColumnArticleJsonLd {...baseProps} faq={[]} />,
    );

    const article = parseJsonLd(container).find(
      (json) => json["@type"] === "Article",
    );
    expect(article).toMatchObject({
      headline: baseProps.headline,
      url: "https://buzzbase.jp/column/ops",
      datePublished: "2026-03-24T00:00:00+09:00",
      dateModified: "2026-09-24T00:00:00+09:00",
      author: {
        "@type": "Organization",
        name: "BUZZ BASE",
        url: "https://buzzbase.jp",
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": "https://buzzbase.jp/column/ops",
      },
    });
  });

  it("FAQ が空なら FAQPage を出力しない", () => {
    const { container } = render(
      <ColumnArticleJsonLd {...baseProps} faq={[]} />,
    );

    expect(
      parseJsonLd(container).some((json) => json["@type"] === "FAQPage"),
    ).toBe(false);
  });

  it("FAQ があれば FAQPage を出力する", () => {
    const { container } = render(
      <ColumnArticleJsonLd
        {...baseProps}
        faq={[{ question: "OPSの読み方は？", answer: "オーピーエスです。" }]}
      />,
    );

    const faqPage = parseJsonLd(container).find(
      (json) => json["@type"] === "FAQPage",
    );
    expect(faqPage.mainEntity[0].name).toBe("OPSの読み方は？");
  });
});
