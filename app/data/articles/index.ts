import { practiceArticles } from "./practice";
import { scoreArticles } from "./score";
import { type ArticleDefinition, type ArticleSection } from "./types";

/**
 * /guide 記事のレジストリ。tools の calculator-definitions と同じく、
 * 記事データを1箇所に集約し、slug/section で引けるようにする。
 */
const allArticles: ArticleDefinition[] = [
  ...scoreArticles,
  ...practiceArticles,
];

const articlesBySlug = new Map(
  allArticles.map((article) => [article.slug, article]),
);

/** slug から記事定義を取得する。存在しなければ null。 */
export function getArticle(slug: string): ArticleDefinition | null {
  return articlesBySlug.get(slug) ?? null;
}

/** 全記事の slug（generateStaticParams 用）。 */
export function getAllArticleSlugs(): string[] {
  return allArticles.map((article) => article.slug);
}

/** 全記事（ハブ一覧用）。 */
export function getAllArticles(): ArticleDefinition[] {
  return allArticles;
}

/** セクションで絞った記事一覧。 */
export function getArticlesBySection(
  section: ArticleSection,
): ArticleDefinition[] {
  return allArticles.filter((article) => article.section === section);
}
