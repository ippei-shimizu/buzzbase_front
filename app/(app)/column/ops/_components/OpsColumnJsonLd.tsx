type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  faq: FaqItem[];
};

export default function OpsColumnJsonLd({ faq }: Props) {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "OPSとは？意味・計算方法・いくつから良いかの目安を解説",
    description:
      "OPS（オーピーエス）は出塁率と長打率を足した打者の総合指標。計算式と、.700で平均・.800で好打者・.900で強打者・1.000超えで超一流という目安をNPB・MLB・高校野球・中学野球別に解説。無料の計算ツール付き。",
    url: "https://buzzbase.jp/column/ops",
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
        name: "OPSとは",
        item: "https://buzzbase.jp/column/ops",
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
