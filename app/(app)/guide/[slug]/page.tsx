import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL } from "@app/constants/app";
import { getAllArticleSlugs, getArticle } from "@app/data/articles";
import ArticlePageContent from "../_components/ArticlePageContent";

// レジストリに存在する slug のみを有効にする（未知の slug は 404）。
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const definition = getArticle(slug);
  if (!definition) return {};

  return {
    title: definition.metaTitle,
    description: definition.metaDescription,
    alternates: {
      canonical: `${SITE_URL}/guide/${slug}`,
    },
  };
}

export default async function GuideArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const definition = getArticle(slug);
  if (!definition) notFound();

  return <ArticlePageContent definition={definition} />;
}
