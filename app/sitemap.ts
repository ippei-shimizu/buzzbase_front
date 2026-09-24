import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { SITE_URL } from "@app/constants/app";
import { getAllCalculatorSlugs } from "@app/data/baseball-stats/calculator-definitions";

/** 検索エンジンに届けたい公開ページ。認証が必要な画面やアカウント系は含めない */
const STATIC_PATHS = ["/", "/tools", "/column", "/calculation-of-grades"];

const COLUMN_DIR = path.join(process.cwd(), "app", "(app)", "column");

/**
 * コラム記事の slug をディレクトリから列挙する。
 * 記事一覧を手で管理すると追加・統合のたびに漏れるため、page.tsx を持つ
 * ルートディレクトリだけをサイトマップの正とする。
 *
 * @param columnDir 列挙対象のディレクトリ。テストから差し替える
 * @returns slug の昇順配列
 */
export function listColumnSlugs(columnDir: string = COLUMN_DIR): string[] {
  return fs
    .readdirSync(columnDir, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        !entry.name.startsWith("_") &&
        fs.existsSync(path.join(columnDir, entry.name, "page.tsx")),
    )
    .map((entry) => entry.name)
    .sort();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPaths = getAllCalculatorSlugs().map((slug) => `/tools/${slug}`);
  const columnPaths = listColumnSlugs().map((slug) => `/column/${slug}`);

  return [...STATIC_PATHS, ...toolPaths, ...columnPaths].map((pagePath) => ({
    url: `${SITE_URL}${pagePath}`,
  }));
}
