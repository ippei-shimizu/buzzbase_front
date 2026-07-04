/**
 * データ駆動の記事（/guide）システムの型定義。
 * tools の CalculatorDefinition と同型のレジストリ方式で、記事を1オブジェクトの
 * データとして定義し、共有レンダラ ArticlePageContent が描画する。
 */

export type ArticleSection = "score" | "practice";

export const SECTION_LABELS: Record<ArticleSection, string> = {
  score: "スコア・記録",
  practice: "練習・上達",
};

export type ArticleFaq = {
  question: string;
  answer: string;
};

export type ArticleTable = {
  headers: string[];
  rows: string[][];
};

/**
 * 記事の1セクション。既存ハードコード記事の「h2 ＋ 段落 ＋ 表/箇条書き」構造を
 * データ化したもの。id は目次アンカーに使う。
 */
export type ArticleBlock = {
  id: string;
  heading: string;
  paragraphs?: string[];
  list?: string[];
  table?: ArticleTable;
  /** 補足・注記（監修待ちの断り書きなど）。任意 */
  note?: string;
};

export type ArticleDefinition = {
  slug: string;
  section: ArticleSection;
  /** h1・関連リンクのカード見出しに使う短めの表示名 */
  title: string;
  metaTitle: string;
  metaDescription: string;
  /** リード文（h1 直下） */
  lead: string;
  /** パンくずの末尾表示名 */
  breadcrumbLeafName: string;
  blocks: ArticleBlock[];
  faq: ArticleFaq[];
  /** 同じ /guide 内の関連記事 slug */
  relatedArticleSlugs: string[];
  /** 関連する計算ツールの slug（/tools/<slug>） */
  relatedToolSlugs: string[];
  cta: {
    heading?: string;
    body: string;
  };
};
