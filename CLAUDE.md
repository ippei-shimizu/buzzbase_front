# BUZZ BASE フロントエンド プロジェクトルール

## パッケージ管理

- すべてのパッケージ管理操作には **yarn** を使用する
- コマンド:
  - `yarn install` - 依存関係をインストール
  - `yarn add <package>` - 新しい依存関係を追加
  - `yarn add -D <package>` - 開発用依存関係を追加
  - `yarn remove <package>` - 依存関係を削除

## 開発環境

- 開発環境の構築には **Docker Compose** を使用する
- `docker-compose up` - 開発環境を起動

## 開発

- `yarn dev` - 開発サーバーを起動
- `yarn build` - 本番用ビルド
- `yarn start` - 本番サーバーを起動

## コード品質

- `yarn lint` - ESLint実行
- `yarn lint:fix` - ESLint自動修正
- `yarn typecheck` - TypeScript型チェック
- `yarn format` - Prettierフォーマット
- `yarn format:check` - フォーマットチェック
- `yarn test` - Jestテスト実行
- `yarn test:watch` - ウォッチモード
- `yarn test:coverage` - カバレッジ付きテスト

## コード標準

- 既存のコード規約に従う
- すべての新しいファイルにはTypeScriptを使用
- 既存のコードベースのコンポーネント構造パターンに従う
- スタイリングにはTailwindCSSを使用

## コメント規約

- **コードを読めばわかること（WHAT）は書かない**。識別子・型・処理の流れはコード自身が語る。コメントが繰り返すと冗長になり、コード変更時に陳腐化する
- **コードからは読み取れない意図・前提・制約（WHY）だけを書く**。例: 性能上の理由でこの順序にしている / 仕様で空配列を許容しない / バックエンドの挙動に合わせて〜している、など
- **issue 番号 / PR 番号 / ticket URL をコメントに書かない**。時間と共に陳腐化し、リーダーにとってノイズになる。経緯や参照リンクは PR description やコミットメッセージに残す
  - NG: `// 二重表示を防ぐ（issue #341）`
  - NG: `// データを取得する`（コードを見れば明らか）
  - OK: `// SSR 時は cookies() が undefined のため、CSR でのみフォールバックを描画する`
- 公開関数の JSDoc / TSDoc は「責務」「引数・返り値の意味」を簡潔に書いてよい（保守性向上の資産として残す）

## フロントエンド開発ルール

- **よほどの理由がない限りServer Componentを使用する**
- **APIリクエストはサーバーアクションを使用する**
- **useEffectの使用は極力避ける**
- Client Componentが必要な場合は明確な理由を持つ（イベントハンドリング、状態管理など）
- データフェッチは可能な限りサーバーサイドで実行する
- **Container/Presentationalパターンを採用する**
  - Container Component: データ取得・状態管理・ビジネスロジックを担当
  - Presentational Component: UIの表示・プロパティの受け渡しのみを担当

## ディレクトリ・ファイル構造ルール

- **APIリクエストのディレクトリは責務ごとに分ける**
  - 例: `app/admin/auth/actions.ts`, `app/admin/dashboard/actions.ts`
- **ルーティングに関係しないディレクトリにはアンダーバーをつける**
  - 例: `app/admin/dashboard/_components/`
- **コンポーネントのコロケーション**
  - 特定の画面でのみ使用: そのルーティングディレクトリ内の`_components/`に配置
  - 複数画面で共通使用: `app/admin/_components/`に配置
- **page.tsxにはルートに対応するコンポーネントのみ記載**
  - 他のコンポーネントは適切な`_components/`ディレクトリに分離する

## 認証・セキュリティ

- **Admin認証状態はプロキシ（旧ミドルウェア）で判定する**
- 認証が必要なルートは`proxy.ts`で保護する（Next.js 16で`middleware.ts`から`proxy.ts`にリネーム）
