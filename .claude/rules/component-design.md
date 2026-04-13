# コンポーネント設計ルール

## 基本方針: Server Component優先

- **よほどの理由がない限りServer Componentを使用する**
- Client Componentが必要な場合は明確な理由を持つ（イベントハンドリング、useState、usePathname等）
- `"use client"`は必要最小限のコンポーネントにのみ付与する

## Container / Presentational パターン

- page.tsxは薄く保つ（認証チェック + データ取得 + Presentationalへの委譲のみ）
- Container役のClient Componentは`_components/`に配置（命名にContainerはつけない）
- Presentationalコンポーネントはpropsのみ受け取り、データフェッチしない

## コロケーション

- 特定画面でのみ使用するコンポーネント: そのルートの`_components/`に配置
- 複数画面で共通使用: ルートグループ直下の`_components/`に配置（例: `(admin)/_components/`）
- 全体共通UI: `app/components/`に配置
- ルーティングに関係しないディレクトリにはアンダーバーをつける（`_components/`, `_utils/`）

## Vercelベストプラクティス

- **booleanプロップの乱立を避ける** — Compound Componentパターンで構成するか、用途別にバリアントコンポーネントを作る
- 条件レンダリングは `&&` ではなく三項演算子 `? :` を使う（`0 && <X/>`で"0"がレンダリングされる問題を防ぐ）
- 静的なJSX要素はコンポーネント外に定数として切り出す
- `forwardRef`は不要（React 19以降、refは通常のpropとして渡せる）
