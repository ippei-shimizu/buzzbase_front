import {
  BATTING_AVERAGE_COLUMN_DESCRIPTION,
  BATTING_AVERAGE_COLUMN_TITLE,
} from "../_constants/meta";

type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  faq: FaqItem[];
};

export default function BattingAverageColumnJsonLd({ faq }: Props) {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: BATTING_AVERAGE_COLUMN_TITLE,
    description: BATTING_AVERAGE_COLUMN_DESCRIPTION,
    url: "https://buzzbase.jp/column/batting-average",
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
        name: "打率とは",
        item: "https://buzzbase.jp/column/batting-average",
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
