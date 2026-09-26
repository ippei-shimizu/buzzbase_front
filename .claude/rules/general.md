# フロントエンド 全般ルール

## 技術スタック

- Next.js 16 / React 19 / TypeScript
- UIライブラリ: HeroUI（旧NextUI）+ Mantine
- スタイリング: TailwindCSS
- 状態管理: SWR（旧来）/ Server Actions（新規）
- パスエイリアス: `@app/*` → `app/*`

## コーディング規約

- すべての新しいファイルにはTypeScriptを使用
- ESLint + Prettierに準拠（`yarn lint`, `yarn format`）
- 型定義は`app/interface/index.ts`に集約
- **コード上の識別子（定数キー・スロット名・slug など）をリネーム・削除したら、`docs/` 配下も grep して追随させる**。`docs/strategy/*.md` は次に同じ領域を触る人が根拠にするため、実態とずれると同じ乖離が再生産される

## 認証

- 一般ユーザー: `access-token` / `client` / `uid`の3つのCookie（DeviseTokenAuth形式）
- 管理者: JWT認証（`admin-access-token` + `admin-refresh-token`）
- 認証ガードは`proxy.ts`で実施（Next.js 16で`middleware.ts`から`proxy.ts`にリネーム）
- Server Actions内での認証チェック: `cookies()`から3トークンを取得

## テーマ / デザイン

- ダークテーマ基調（`buzz-dark`テーマ）
- プライマリカラー: `#d08000`（ゴールド）
- 背景: `#2E2E2E`（main）/ `#424242`（sub）

## 開発コマンド

- `yarn dev` — 開発サーバー
- `yarn build` — ビルド
- `yarn lint` / `yarn typecheck` — 品質チェック
- `yarn test` — Jestテスト
