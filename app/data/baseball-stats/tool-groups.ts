/**
 * ツール一覧ページのセクションごとの掲載順。
 * ここに入れ忘れた計算ツールはサイトマップにだけ載って一覧から辿れなくなるため、
 * `app/__tests__/sitemap.test.ts` が定義との一致を検証している。
 */
export const battingToolSlugs = [
  "batting-average",
  "obp",
  "slugging",
  "ops",
  "risp-batting-average",
];

export const pitchingToolSlugs = [
  "era",
  "whip",
  "k-bb",
  "k-9",
  "bb-9",
  "opponent-batting-average",
];

export const teamToolSlugs = ["winning-percentage"];
