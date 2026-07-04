import Link from "next/link";
import CtaBanner from "@app/(app)/_components/CtaBanner";
import Breadcrumbs from "@app/(app)/tools/_components/Breadcrumbs";
import AdBanner from "@app/components/ad/AdBanner";
import { adSlots } from "@app/components/ad/adConfig";
import { SITE_URL } from "@app/constants/app";
import { getArticle } from "@app/data/articles";
import { type ArticleDefinition } from "@app/data/articles/types";
import { getCalculatorDefinition } from "@app/data/baseball-stats/calculator-definitions";

type Props = {
  definition: ArticleDefinition;
};

/**
 * /guide 記事の共有レンダラ。ArticleDefinition のデータから、
 * JSON-LD（Article / FAQPage / BreadcrumbList）・パンくず・目次・本文ブロック・
 * FAQ・関連リンク・CTA・広告までを一括で描画する。tools の
 * CalculatorPageContent と同じ「データ→共通レイアウト」の役割。
 */
export default function ArticlePageContent({ definition }: Props) {
  const path = `/guide/${definition.slug}`;
  const url = `${SITE_URL}${path}`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: definition.title,
    description: definition.metaDescription,
    url,
    publisher: {
      "@type": "Organization",
      name: "BUZZ BASE",
      url: SITE_URL,
    },
  };

  const faqLd =
    definition.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: definition.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }
      : null;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "BUZZ BASE", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "ガイド",
        item: `${SITE_URL}/guide`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: definition.breadcrumbLeafName,
        item: url,
      },
    ],
  };

  const relatedArticles = definition.relatedArticleSlugs
    .map((slug) => getArticle(slug))
    .filter((article): article is ArticleDefinition => article !== null);

  const relatedTools = definition.relatedToolSlugs
    .map((slug) => getCalculatorDefinition(slug))
    .filter((tool): tool is NonNullable<typeof tool> => tool != null);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {faqLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "ガイド", href: "/guide" },
          { label: definition.breadcrumbLeafName },
        ]}
      />

      <h1 className="text-2xl font-bold mb-3">{definition.title}</h1>
      <p className="text-sm text-zinc-300 leading-7 mb-6">{definition.lead}</p>

      {definition.blocks.length > 1 ? (
        <nav
          aria-label="目次"
          className="mb-8 rounded-lg border border-zinc-700 bg-zinc-800/40 px-4 py-3"
        >
          <p className="text-xs font-bold text-zinc-400 mb-2">目次</p>
          <ul className="space-y-1.5">
            {definition.blocks.map((block) => (
              <li key={block.id}>
                <a
                  href={`#${block.id}`}
                  className="text-sm text-yellow-500 hover:underline"
                >
                  {block.heading}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {definition.blocks.map((block, index) => (
        <section key={block.id} id={block.id} className="mb-8 scroll-mt-20">
          <h2 className="text-xl font-bold mb-3">{block.heading}</h2>
          {block.paragraphs?.map((paragraph, i) => (
            <p key={i} className="text-sm text-zinc-300 leading-7 mb-3">
              {paragraph}
            </p>
          ))}
          {block.list ? (
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-zinc-300 leading-7 mb-3">
              {block.list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          ) : null}
          {block.table ? (
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr>
                    {block.table.headers.map((header) => (
                      <th
                        key={header}
                        className="border border-zinc-700 bg-zinc-800/60 px-3 py-2 text-left font-bold text-zinc-200"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.table.rows.map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="border border-zinc-700 px-3 py-2 text-zinc-300"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          {block.note ? (
            <p className="text-xs text-zinc-500 leading-6 border-l-2 border-zinc-600 pl-3">
              {block.note}
            </p>
          ) : null}
          {index === 0 ? <AdBanner slot={adSlots.columnMiddle} /> : null}
        </section>
      ))}

      <CtaBanner
        heading={definition.cta.heading}
        body={definition.cta.body}
        sourceTool={definition.slug}
      />

      <AdBanner slot={adSlots.columnBottom} />

      {definition.faq.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-3">よくある質問</h2>
          <div className="space-y-4">
            {definition.faq.map((item) => (
              <details
                key={item.question}
                className="rounded-lg border border-zinc-700 bg-zinc-800/50"
              >
                <summary className="px-4 py-3 cursor-pointer text-sm font-bold hover:text-yellow-500 transition-colors">
                  {item.question}
                </summary>
                <p className="px-4 pb-3 text-sm text-zinc-400 leading-6">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {relatedArticles.length > 0 || relatedTools.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-3">関連ページ</h2>
          <div className="space-y-2">
            {relatedArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/guide/${article.slug}`}
                className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-2.5"
              >
                <span className="text-sm text-zinc-300">{article.title}</span>
                <span aria-hidden="true" className="text-zinc-500">
                  &rarr;
                </span>
              </Link>
            ))}
            {relatedTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-2.5"
              >
                <span className="text-sm text-zinc-300">{tool.title}</span>
                <span aria-hidden="true" className="text-zinc-500">
                  &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <AdBanner slot={adSlots.columnHorizontal} format="horizontal" />
    </>
  );
}
