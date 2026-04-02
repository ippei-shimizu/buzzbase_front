type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  faq: FaqItem[];
};

export default function RunsColumnJsonLd({ faq }: Props) {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "野球の失点とは？自責点との違い・失点率の計算方法を解説",
    description:
      "野球の失点の意味・自責点との違い・失点率の計算方法を解説。防御率との関係もわかりやすく説明します。",
    url: "https://buzzbase.jp/column/runs",
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
        name: "失点とは",
        item: "https://buzzbase.jp/column/runs",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      {faqPage && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      />
    </>
  );
}
