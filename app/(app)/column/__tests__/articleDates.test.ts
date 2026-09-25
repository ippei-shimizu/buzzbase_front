import fs from "node:fs";
import path from "node:path";
import { listColumnSlugs } from "@app/sitemap";

const COLUMN_DIR = path.join(process.cwd(), "app", "(app)", "column");

// 記事を追加したときの入れ忘れは、JSON-LD 側は必須 prop で止まるが表示側は静かに欠落する。
// 45 記事を目視で守り続けられないため、記事ごとの不変条件として固定する
describe("コラム記事の公開日・更新日", () => {
  it.each(listColumnSlugs())(
    "%s が日付定数と公開日・更新日の表示を持つ",
    (slug) => {
      const meta = fs.readFileSync(
        path.join(COLUMN_DIR, slug, "_constants", "meta.ts"),
        "utf-8",
      );
      const published = meta.match(
        /COLUMN_PUBLISHED_AT = "(\d{4}-\d{2}-\d{2})"/,
      );
      const updated = meta.match(/COLUMN_UPDATED_AT = "(\d{4}-\d{2}-\d{2})"/);

      expect(published).not.toBeNull();
      expect(updated).not.toBeNull();
      expect(updated![1] >= published![1]).toBe(true);

      const page = fs.readFileSync(
        path.join(COLUMN_DIR, slug, "page.tsx"),
        "utf-8",
      );
      expect(page.match(/<ColumnArticleDates/g)).toHaveLength(1);
      expect(page.match(/datePublished=/g)).toHaveLength(1);
      expect(page.match(/dateModified=/g)).toHaveLength(1);
    },
  );
});
