# NextUI v2.6.11 アップグレード完了レポート

## 実施日

2025-10-13

## 概要

NextUI v2.2.9 から v2.6.11 へのアップグレードを、テストファーストアプローチで実施しました。
GitHub Issue #165 で報告されていた Tabs コンポーネントの動作不良を解決しました。

## アップグレード内容

### 依存関係のアップグレード

| パッケージ        | 旧バージョン | 新バージョン |
| ----------------- | ------------ | ------------ |
| @nextui-org/react | v2.2.9       | v2.6.11      |
| framer-motion     | v10.16.12    | v11.18.2     |
| tailwindcss       | v3.3.0       | v3.4.18      |

### テスト環境のセットアップ

- **テストフレームワーク**: Jest v30.2.0
- **テストライブラリ**: @testing-library/react v16.3.0
- **テストユーティリティ**: @testing-library/user-event v14.6.1
- **マッチャー拡張**: @testing-library/jest-dom v6.9.1

## 実施手順

### Phase 0: テスト環境の構築

1. Jest と Testing Library のインストール
2. jest.config.js の作成（Next.js 14 対応）
3. jest.setup.js の作成（Framer Motion のモック設定）
4. package.json にテストスクリプトを追加
5. tsconfig.json に型定義を追加

### Phase 1: 既存コンポーネントのテスト作成

NextUI v2.2.9 の状態で以下のテストを作成し、ベースラインを確立：

#### 作成したテストファイル

1. **app/components/table/**tests**/GroupBattingRankingTable.test.tsx** (6 tests)
   - 打率、本塁打、打点などのランキングソート検証
   - ユーザーリンクの検証
   - undefined データのハンドリング検証

2. **app/components/table/**tests**/GroupPitchingRankingTable.test.tsx** (9 tests)
   - 防御率、勝利数、セーブ数などのランキングソート検証
   - ユーザーリンクの検証
   - undefined データのハンドリング検証

3. **app/components/auth/**tests**/EmailInput.test.tsx** (6 tests)
   - メールアドレス入力コンポーネントの検証
   - バリデーション動作の検証

4. **app/(app)/mypage/[slug]/**tests**/MypageTabs.test.tsx** (9 tests)
   - **実際のマイページコンポーネントのテスト**
   - 「成績」「試合」タブの切り替え検証
   - タブコンテンツ（IndividualResultsList, MatchResultList）の表示検証
   - ユーザー情報、フォロー情報の表示検証
   - アクセシビリティ属性の検証

5. **app/(app)/groups/[slug]/**tests**/GroupDetailTabs.test.tsx** (10 tests)
   - **実際のグループページコンポーネントのテスト**
   - 「打撃成績」「投手成績」タブの切り替え検証
   - ナビゲーションボタンの表示切り替え検証
   - ランキングテーブル（GroupBattingRankingTable, GroupPitchingRankingTable）の表示検証
   - データフェッチとプロップスの受け渡し検証
   - アクセシビリティ属性の検証

### Phase 2: NextUI アップグレード

1. Framer Motion を v11.18.2 にアップグレード
2. TailwindCSS を v3.4.18 にアップグレード
3. NextUI を v2.6.11 にアップグレード
4. 破壊的変更の確認（カスタムユニット、バリデーション動作など）

### Phase 3: テスト検証

- アップグレード後、全 40 テストが合格
- Tabs コンポーネントの動作が正常であることを確認
- 実際のページコンポーネントでの Tabs 動作を検証

## テスト結果

### 最終テスト結果

```
Test Suites: 5 passed, 5 total
Tests:       40 passed, 40 total
Snapshots:   0 total
Time:        1.833 s
```

### テストの種類

1. **ユニットテスト** (21 tests)
   - Table コンポーネント（15 tests）
   - Input コンポーネント（6 tests）

2. **統合テスト** (19 tests)
   - マイページ全体のテスト（9 tests）
   - グループページ全体のテスト（10 tests）
   - 実際のコンポーネント、hooks、サービスをモックして統合的に検証

### テストカバレッジ設定

- branches: 70%
- functions: 70%
- lines: 70%
- statements: 70%

## 破壊的変更の確認

### v2.3.0: カスタムユニット削除

- 影響: なし（カスタムユニットの使用なし）

### v2.4.0: バリデーション動作変更

- 影響: なし（デフォルト "aria" で問題なし）

### v2.6.0: Table テーマグループセレクター

- 影響: なし（カスタムテーマの使用なし）

## 解決した問題

### GitHub Issue #165: Tabs コンポーネントが動作しない

**問題**: NextUI v2.2.9 で Tabs コンポーネントが正常に動作しない

**解決**: NextUI v2.6.11 へのアップグレードにより解決

**検証箇所**:

- マイページ（`app/(app)/mypage/[slug]/page.tsx`）の Tabs
- グループページ（`app/(app)/groups/[slug]/page.tsx`）の Tabs

**テスト**: 全 19 テストが合格（マイページ 9 テスト + グループページ 10 テスト）

**テストの特徴**:

- 実際のページコンポーネント（MyPage, GroupDetail）を直接テスト
- 依存する hooks、services、子コンポーネントを適切にモック
- タブの切り替え、コンテンツの表示、データの受け渡しを包括的に検証

## 今後の推奨事項

### 短期的な推奨事項

1. 継続的なテストの追加
2. E2E テストの検討（Playwright や Cypress）
3. カバレッジ目標の達成（現在 70%）

### 長期的な推奨事項

1. NextUI の廃止が予定されているため、HeroUI への移行を検討
2. 移行時期: NextUI のサポート終了時期を確認後
3. 移行方法: 同様のテストファーストアプローチを採用

## 関連ファイル

### 設定ファイル

- `front/jest.config.js`
- `front/jest.setup.js`
- `front/package.json` (devDependencies, scripts)
- `front/tsconfig.json` (types)

### テストファイル

**ユニットテスト**:

- `front/app/components/table/__tests__/GroupBattingRankingTable.test.tsx`
- `front/app/components/table/__tests__/GroupPitchingRankingTable.test.tsx`
- `front/app/components/auth/__tests__/EmailInput.test.tsx`

**統合テスト**:

- `front/app/(app)/mypage/[slug]/__tests__/MypageTabs.test.tsx`
- `front/app/(app)/groups/[slug]/__tests__/GroupDetailTabs.test.tsx`

## 技術的な課題と解決策

### 課題 1: モジュールパスエイリアスの解決

**問題**: `@app/` パスエイリアスが Jest で解決できない

**解決**: jest.config.js に moduleNameMapper を追加

```javascript
moduleNameMapper: {
  "^@/(.*)$": "<rootDir>/app/$1",
  "^@app/(.*)$": "<rootDir>/app/$1",
}
```

### 課題 2: 複雑な依存関係のモック

**問題**: マイページとグループページは多くの hooks とサービスに依存

**解決**: 各依存関係を適切にモックし、テストに必要な最小限のデータを返すように設定

- hooks: `getUserIdData`, `getTeams`, `getUserAwards`, `useCurrentUserId`
- services: `getGroupDetail`
- context: `useAuthContext`
- routing: `useRouter`
- components: すべての子コンポーネントをモック

### 課題 3: 実際のコンポーネント vs 簡易テストコンポーネント

**問題**: 当初、NextUI の Tabs 自体の動作を検証するために簡易的なテストコンポーネントを作成

**解決**: 実際のページコンポーネント（MyPage, GroupDetail）を直接テストする統合テストに移行し、アプリケーションの実際の動作を検証

## まとめ

NextUI v2.6.11 へのアップグレードは成功し、全 40 テストが合格しました。
特に Issue #165 で報告されていた Tabs コンポーネントの問題は完全に解決されています。

### 達成したこと

1. **テストファーストアプローチの実践**
   - アップグレード前に包括的なテストスイートを作成
   - ユニットテスト（21 tests）+ 統合テスト（19 tests）= 合計 40 tests
   - テスト実行時間: 1.833 秒（高速）

2. **実際のコンポーネントでの検証**
   - マイページ（MyPage）の実際の動作を検証
   - グループページ（GroupDetail）の実際の動作を検証
   - 依存関係を適切にモックし、統合的にテスト

3. **NextUI v2.6.11 での Tabs コンポーネント動作確認**
   - タブ切り替え機能が正常に動作
   - タブコンテンツの表示/非表示が正しく機能
   - アクセシビリティ属性（aria-selected, aria-label）が正しく設定

4. **継続的な品質保証の基盤構築**
   - 今後のアップグレードや機能追加時の回帰テストが可能
   - テストカバレッジ目標（70%）を設定
   - CI/CD での自動テスト実行が可能（`yarn test:ci`）

テストファーストアプローチにより、アップグレード前後の動作を確実に検証することができ、
今後のメンテナンスや追加開発においても、回帰テストによる品質保証が可能になりました。
