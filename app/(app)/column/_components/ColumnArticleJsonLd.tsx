type FaqItem = {
  question: string;
  answer: string;
};

type Props = {
  /** 記事タイトル（Article.headline / BreadcrumbList の最終要素に使う） */
  headline: string;
  /** 記事概要（Article.description に使う） */
  description: string;
  /** 記事 URL（path のみ。例: "/column/ops-1000"） */
  path: string;
  /** Breadcrumb の最終要素に表示する短い名前（例: "OPS .800"） */
  breadcrumbLeafName: string;
  /** FAQPage に展開する FAQ。空配列なら FAQPage を出力しない */
  faq: FaqItem[];
  /** 公開日（YYYY-MM-DD） */
  datePublished: string;
  /** 最終更新日（YYYY-MM-DD）。本文を直したらここだけ書き換える */
  dateModified: string;
};

const SITE_URL = "https://buzzbase.jp";
// タイムゾーンを省くと Googlebot 側のタイムゾーンで解釈され、JST 基準の日付が前日にずれうる
const JST_START_OF_DAY = "T00:00:00+09:00";

/** JSON-LD は script 要素の中に直接書き出すため、`</script>` で閉じられないよう `<` を退避する */
function toJsonLdHtml(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * /column 配下の短いストック記事向け、共有 JSON-LD コンポーネント。
 * Article / BreadcrumbList を常に出力し、FAQ がある場合のみ FAQPage を追加する。
 */
export default function ColumnArticleJsonLd({
  headline,
  description,
  path,
  breadcrumbLeafName,
  faq,
  datePublished,
  dateModified,
}: Props) {
  const url = `${SITE_URL}${path}`;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    datePublished: `${datePublished}${JST_START_OF_DAY}`,
    dateModified: `${dateModified}${JST_START_OF_DAY}`,
    author: {
      "@type": "Organization",
      name: "BUZZ BASE",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "BUZZ BASE",
      url: SITE_URL,
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
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "コラム",
        item: `${SITE_URL}/column`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: breadcrumbLeafName,
        item: url,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdHtml(article) }}
      />
      {faqPage ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdHtml(faqPage) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdHtml(breadcrumbList) }}
      />
    </>
  );
}
