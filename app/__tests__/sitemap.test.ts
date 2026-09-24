import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sitemap, { listColumnSlugs } from "../sitemap";

describe("sitemap", () => {
  it("トップ・ツール一覧・コラム一覧・成績算出ページを含む", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        "https://buzzbase.jp/",
        "https://buzzbase.jp/tools",
        "https://buzzbase.jp/column",
        "https://buzzbase.jp/calculation-of-grades",
      ]),
    );
  });

  it("計算ツールとコラム記事を実ディレクトリから列挙する", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("https://buzzbase.jp/tools/era");
    expect(urls).toContain("https://buzzbase.jp/column/ops");
    expect(urls.some((url) => url.includes("/column/_"))).toBe(false);
  });

  it("URL が重複しない", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("listColumnSlugs", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "column-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("page.tsx を持つルートディレクトリだけを昇順で返す", () => {
    fs.mkdirSync(path.join(tempDir, "ops"));
    fs.writeFileSync(path.join(tempDir, "ops", "page.tsx"), "");
    fs.mkdirSync(path.join(tempDir, "era"));
    fs.writeFileSync(path.join(tempDir, "era", "page.tsx"), "");
    fs.mkdirSync(path.join(tempDir, "_components"));
    fs.writeFileSync(path.join(tempDir, "_components", "page.tsx"), "");
    fs.mkdirSync(path.join(tempDir, "draft"));
    fs.writeFileSync(path.join(tempDir, "layout.tsx"), "");

    expect(listColumnSlugs(tempDir)).toEqual(["era", "ops"]);
  });
});
