# コラム / 計算ツールの SEO 改稿ルール

`/column/*` と計算ツールの文言を改稿・新設・統合するときの規約。同じ指摘がレビューで繰り返し出ているため定型化する。

## 数値と約束の整合（最頻出）

- **改稿前に、対象ページの `guide` / FAQ / `explanation` と、対になるツール or 記事の同じ項目を必ず読む**。meta description・FAQ・目安表・本文の数値がページ内および対になるページ間で食い違う指摘が繰り返し出ている
- **本文が提供している範囲だけ約束する**。FAQ の1問にしか無い切り口（「先発・中継ぎ別」等）をタイトルや description に書かない。テーブル化されている層だけ列挙する
- 実装に無い機能（端数の自動換算など）を description で謳わない

## 記事の住み分け

- 「意味・計算方法」の基礎記事と「いくつから良いか」の criteria 記事は対になっている（`/column/ops` と `/column/ops-criteria`）。基礎記事のタイトルに criteria 側の主軸キーワードを入れない
- 既存ツールに対応する解説記事を新設するとき、ツールの `faq` と**質問文が完全一致する設問を置かない**。両 URL が同じ Q&A を FAQPage で主張し棲み分けが崩れる。記事側は情報クエリ寄りに言い換える
- 数値別ページを統合するときは、旧ページの FAQ を**全件引き継ぐ**。本文に情報が残っていても FAQPage から落ちると疑問文型クエリの受け皿を失う
- 単体で残すページ（例: `/column/ops-1000`）のクエリに対して、統合先にアンカー付きの独立セクションや目次項目を作らない。クラスタ内の競合を再生産する

## 公開日・更新日

- 日付は各記事の `_constants/meta.ts` の `COLUMN_PUBLISHED_AT` / `COLUMN_UPDATED_AT` に置く。JSON-LD（`datePublished` / `dateModified`）と h1 下の表示が同じ値を見る
- **`COLUMN_UPDATED_AT` は本文の意味が変わったときだけ触る**。広告枠のリネームや整形など実差分の無い変更で日付だけ新しくすると、Google は本文の差分を見ているため評価されず、更新シグナルの信頼度を下げる方向に効く
- 記事を新設したら `_constants/meta.ts` と `<ColumnArticleDates>` を必ず置く（`app/(app)/column/__tests__/articleDates.test.ts` が全記事分を検証する）

## 文言の置き場所

- 文言は `app/(app)/column/<slug>/_constants/meta.ts` に集約する。layout の metadata・page の h1・`*JsonLd.tsx`・`column/page.tsx` のカードが参照するので、改稿はこのファイルだけ触る
- コラム一覧カードの説明は meta description を流用せず、50〜60字の `*_CARD_DESCRIPTION` を別に持つ
- ツールの `metaTitle` に計算例を入れると `generateMetadata` 経由でシェア OG のタイトルにも流れる。OG は `heading` ベースに分離する
- 接尾辞（`【野球】` の有無）は対になる3ページで揃える。`column/layout.tsx` の template で ` - BUZZ BASE` が付くため、32文字以内でも境界にかかる
