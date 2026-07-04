import { type Metadata } from "next";
import Link from "next/link";
import AdBanner from "@app/components/ad/AdBanner";
import { adSlots } from "@app/components/ad/adConfig";
import { SITE_URL } from "@app/constants/app";
import { getArticlesBySection } from "@app/data/articles";
import { SECTION_LABELS, type ArticleSection } from "@app/data/articles/types";

export const metadata: Metadata = {
  title: "野球の記録・練習ガイド",
  description:
    "野球のスコアのつけ方や練習メニューなど、記録と上達に役立つガイドの一覧です。基本から丁寧に解説します。",
  alternates: {
    canonical: `${SITE_URL}/guide`,
  },
};

const SECTIONS: ArticleSection[] = ["score", "practice"];

export default function GuidePage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">野球の記録・練習ガイド</h1>
      <p className="text-sm text-zinc-400 mb-8">
        スコアのつけ方や練習メニューなど、記録と上達に役立つガイドをまとめています。
      </p>

      {SECTIONS.map((section) => {
        const articles = getArticlesBySection(section);
        if (articles.length === 0) return null;
        return (
          <section key={section} className="mb-10">
            <h2 className="text-xl font-bold mb-3">
              {SECTION_LABELS[section]}
            </h2>
            <div className="space-y-2">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/guide/${article.slug}`}
                  className="block rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
                >
                  <p className="text-sm font-bold text-zinc-100">
                    {article.title}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1 leading-5 line-clamp-2">
                    {article.metaDescription}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <AdBanner slot={adSlots.columnHorizontal} format="horizontal" />
    </>
  );
}
