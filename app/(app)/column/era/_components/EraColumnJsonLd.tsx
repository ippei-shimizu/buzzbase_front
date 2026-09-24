type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  faq: FaqItem[];
};

export default function EraColumnJsonLd({ faq }: Props) {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "防御率とは？計算方法と良い数値の目安を先発・中継ぎ別に解説",
    description:
      "防御率（ERA）は自責点×9÷投球回で求める投手の指標。2.00以下でエース級、3.00台でリーグ平均などNPB・MLB・高校野球・中学野球の目安と、先発・中継ぎ・抑え別の基準をわかりやすく解説。無料の計算ツール付き。",
    url: "https://buzzbase.jp/column/era",
    publisher: {
      "@type": "Organization",
      name: "BUZZ BASE",
      url: "https://buzzbase.jp",
    },
  };

  const faqPage =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "BUZZ BASE",
        item: "https://buzzbase.jp",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "コラム",
        item: "https://buzzbase.jp/column",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "防御率とは",
        item: "https://buzzbase.jp/column/era",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      {faqPage ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      />
    </>
  );
}
