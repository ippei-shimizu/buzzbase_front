import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { getAllCalculatorSlugs } from "@app/data/baseball-stats/calculator-definitions";
import {
  battingToolSlugs,
  pitchingToolSlugs,
  teamToolSlugs,
} from "@app/data/baseball-stats/tool-groups";
import sitemap, { STATIC_PATHS, listColumnSlugs } from "../sitemap";

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

  it("計算ツールとコラム記事を列挙し、URL に使えない名前を含まない", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toHaveLength(
      STATIC_PATHS.length +
        getAllCalculatorSlugs().length +
        listColumnSlugs().length,
    );
    // ルートグループ "(...)"・動的セグメント "[...]"・非ルートの "_..." が混ざると
    // 実在しない URL を Search Console に送り続けることになる
    expect(
      urls.every((url) =>
        /^https:\/\/buzzbase\.jp\/([a-z0-9-]+(\/[a-z0-9-]+)*)?$/.test(url),
      ),
    ).toBe(true);
  });

  it("URL が重複しない", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("コラム一覧との整合", () => {
  it("コラム一覧ページに載っている slug 集合とディレクトリの集合が一致する", () => {
    // 一覧は page.tsx 内の categories 配列が正で、page ファイルからは export できないため
    // ソースの slug リテラルを拾って突き合わせる。乖離すると一覧のリンク切れか
    // サイトマップの漏れのどちらかが起きている
    const indexSource = fs.readFileSync(
      path.join(process.cwd(), "app", "(app)", "column", "page.tsx"),
      "utf-8",
    );
    const listedSlugs = Array.from(
      indexSource.matchAll(/slug: "([a-z0-9-]+)"/g),
    )
      .map((match) => match[1])
      .sort();

    expect(listedSlugs).toEqual(listColumnSlugs());
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

  it("URL にそのまま使える名前で page.tsx を持つディレクトリだけを昇順で返す", () => {
    fs.mkdirSync(path.join(tempDir, "ops"));
    fs.writeFileSync(path.join(tempDir, "ops", "page.tsx"), "");
    fs.mkdirSync(path.join(tempDir, "era"));
    fs.writeFileSync(path.join(tempDir, "era", "page.tsx"), "");
    fs.mkdirSync(path.join(tempDir, "_components"));
    fs.writeFileSync(path.join(tempDir, "_components", "page.tsx"), "");
    fs.mkdirSync(path.join(tempDir, "[slug]"));
    fs.writeFileSync(path.join(tempDir, "[slug]", "page.tsx"), "");
    fs.mkdirSync(path.join(tempDir, "(group)"));
    fs.writeFileSync(path.join(tempDir, "(group)", "page.tsx"), "");
    fs.mkdirSync(path.join(tempDir, "draft"));
    fs.writeFileSync(path.join(tempDir, "layout.tsx"), "");

    expect(listColumnSlugs(tempDir)).toEqual(["era", "ops"]);
  });

  // 定義だけ足してルートを作り忘れると Search Console に 404 を送り続け、
  // 一覧に入れ忘れるとサイト内から辿れない枝葉のページになる
  it("全計算ツールにルートと一覧カードが存在する", () => {
    const listedSlugs = [
      ...battingToolSlugs,
      ...pitchingToolSlugs,
      ...teamToolSlugs,
    ];

    for (const slug of getAllCalculatorSlugs()) {
      expect(
        fs.existsSync(
          path.join(process.cwd(), "app", "(app)", "tools", slug, "page.tsx"),
        ),
      ).toBe(true);
      expect(listedSlugs).toContain(slug);
    }
  });
});
