# インフィード広告配置戦略

## 概要

BUZZ BASEのログイン後画面における手動インフィード広告の配置戦略を定義する。
Google AdSense自動広告と併用しつつ、確実に表示させたい枠を手動で管理する。

---

## 1. 配置候補の選定基準

インフィード広告を配置するページは、以下の基準で判断する。

| 基準 | 説明 |
|------|------|
| コンテンツの長さ | スクロールが発生する程度のコンテンツ量があること |
| リスト/フィード型UI | 一覧表示やカード型UIなど、広告が自然に溶け込むレイアウトであること |
| 滞在時間 | ユーザーがある程度の時間を費やす閲覧系ページであること |
| 操作への非干渉 | データ入力や重要な操作フローを阻害しないこと |
| 表示頻度 | ユーザーが繰り返しアクセスするページであること（インプレッション確保） |

---

## 2. 推奨配置一覧

### 既存の配置（実装済み）

| ページ | パス | 配置位置 | adSlotキー |
|--------|------|----------|------------|
| ダッシュボード | `/dashboard` | DashboardContent下 | `dashboardInFeed` |
| 試合結果一覧 | `/game-result/lists` | MatchResultList下 | `gameResultListInFeed` |

### 新規追加一覧

| ページ | パス | 配置位置 | adSlotキー（案） |
|--------|------|----------|------------------|
| マイページ | `/mypage/[slug]` | フッターと成績+試合セクションの間 | `mypageBottomInFeed` |
| マイページ | `/mypage/[slug]` | 試合タブの一覧の間に紛れて配置 | `mypageMatchListInFeed` |
| ダッシュボード | `/dashboard` | 投手成績と直近の試合の間 | `dashboardMiddleInFeed` |
| 試合結果一覧 | `/game-result/lists` | 試合一覧の中に紛れて配置 | `gameResultListMiddleInFeed` |
| 試合結果サマリー | `/game-result/summary` | サマリーコンテンツ下 | `gameResultSummaryInFeed` |
| グループ詳細 | `/groups/[slug]` | ランキングテーブル群の末尾 | `groupDetailInFeed` |
| グループ一覧 | `/groups` | ページ最下部 | `groupListInFeed` |
| ノート一覧 | `/note` | 末尾 | `noteListInFeed` |
| ノート詳細 | `/note/[slug]` | 末尾 | `noteDetailInFeed` |
| フォロワー一覧 | `/mypage/[slug]/followers` | ユーザーリスト下 | `followersInFeed` |
| フォロー一覧 | `/mypage/[slug]/following` | ユーザーリスト下 | `followingInFeed` |
| 運営からのお知らせ一覧 | `/notice-from-management` | お知らせリスト下 | `noticeListInFeed` |

---

## 3. 配置しないページとその理由

| ページ | パス | 理由 |
|--------|------|------|
| 打撃成績入力 | `/game-result/batting` | 入力フォームへの集中を妨げる。誤タップのリスクが高い |
| 投手成績入力 | `/game-result/pitching` | 同上 |
| 試合結果記録 | `/game-result/record` | 同上 |
| プロフィール編集 | `/mypage/edit` | 編集フォーム画面。広告は不適切 |
| グループ作成 | `/groups/new` | 作成フォーム画面 |
| グループ編集系 | `/groups/[slug]/*/edit` | 編集フォーム画面 |
| ノート作成 | `/note/new` | 入力に集中すべき画面 |
| シーズン管理 | `/seasons` | 設定画面。コンテンツ量が少なく不自然 |
| ユーザー検索 | `/users/search` | 検索UIが主体。広告でUXが悪化する |
| 通知 | `/mypage/notifications` | 通知の確認を妨げる。誤タップリスクも高い |
| サインイン/サインアップ | `/signin`, `/signup` | 認証フロー中の広告はAdSenseポリシー上もUX上も不適切 |

---

## 4. 実装優先順位

全ページ一括で実装する。計12枠の新規インフィード広告を追加。

---

## 5. UX配慮事項

### 中高生ユーザーへの配慮

- **広告密度の制限**: 1画面に表示されるインフィード広告は最大1枠とする。自動広告との重複表示にも注意
- **誤タップ防止**: 広告の上下に十分な余白（`my-4` 以上）を確保する。既存の `AdInFeed` コンポーネントは `my-4` が設定済み
- **コンテンツの邪魔をしない位置**: メインコンテンツの末尾に配置し、コンテンツの途中に割り込ませない
- **ページ読み込み速度**: 広告スクリプトのロードでページ表示が遅くならないよう、`isAdsenseEnabled` フラグによる制御を維持する
- **モバイルファースト**: ほとんどのユーザーがスマートフォンからアクセスするため、モバイル画面での見え方を最優先で確認する

---

## 6. AdSenseポリシー準拠チェック

### 必ず確認すべきポリシー

| 項目 | 注意点 |
|------|--------|
| 広告とコンテンツの区別 | 広告がコンテンツと紛らわしくないこと。インフィード広告は「Ad」ラベルが自動付与されるが、スタイルで隠さないこと |
| 誤クリック誘導の禁止 | ボタンやリンクに近接しすぎた配置をしない。特にモバイルでは指の太さを考慮 |
| コンテンツ量の確保 | 広告だけが目立つページにしない。広告比率がコンテンツを上回らないようにする |
| 1画面あたりの広告数 | 自動広告を有効にしている場合、手動広告との合算でページ内の広告が過密にならないか確認 |
| 未成年ユーザーへの配慮 | 中高生がターゲットのため、パーソナライズド広告の制限やCOPPA/GDPR関連の設定を確認。AdSense管理画面で「子ども向けとして扱う」設定の検討 |
| ログイン必須ページ | ログイン後ページはクローラーがアクセスしにくいため、広告配信が制限される場合がある。自動広告との併用で補完する |

---

## 7. 実装時の技術的な注意点

### adConfig.ts へのスロット追加

新規広告枠ごとにAdSense管理画面で広告ユニットを作成し、スロットIDを `adConfig.ts` に追加する。

```typescript
// app/components/ad/adConfig.ts に追加するスロット例
export const adSlots = {
  // ... 既存スロット ...
  /** マイページ インフィード広告 */
  mypageInFeed: "取得したスロットID",
  /** グループ詳細 インフィード広告 */
  groupDetailInFeed: "取得したスロットID",
  /** ノート一覧 インフィード広告 */
  noteListInFeed: "取得したスロットID",
  /** グループ一覧 インフィード広告 */
  groupListInFeed: "取得したスロットID",
  /** 運営お知らせ一覧 インフィード広告 */
  noticeListInFeed: "取得したスロットID",
} as const;
```

### AdInFeed コンポーネントの使い方

既存の `AdInFeed` コンポーネントをそのまま利用する。

```tsx
import AdInFeed from "@app/components/ad/AdInFeed";
import { adSlots } from "@app/components/ad/adConfig";

// リストコンテンツの直下に配置
<AdInFeed
  slot={adSlots.mypageInFeed}
  layoutKey="-6t+ed+2i-1n-4w"
/>
```

### 配置位置の具体例

**マイページ** (`/mypage/[slug]/page.tsx`):
- `IndividualResultsList` または `MatchResultList` の下、Tabsの閉じタグの手前

**グループ詳細** (`/groups/[slug]/page.tsx`):
- `GroupBattingRankingTable` / `GroupPitchingRankingTable` の下、各Tabコンテンツの末尾

**ノート一覧** (`/note/page.tsx`):
- `NoteListComponent` の下、`NoteAddButton` の前

### layoutKey について

`layoutKey` はAdSenseのインフィード広告で広告の外観レイアウトを制御するパラメータ。既存の配置で使用している `-6t+ed+2i-1n-4w` を統一して使用するか、AdSense管理画面から新しい広告ユニット作成時に生成されるキーを使用する。

### Client Component での注意

マイページやグループ詳細は `"use client"` のClient Componentのため、`AdInFeed` コンポーネント（同じくClient Component）をそのまま配置できる。Server Componentのページ（ノート一覧など）でも、`AdInFeed` は `"use client"` 宣言済みなので問題なく使用可能。

---

## 8. KPI・効果測定

### 追跡すべき指標

| 指標 | 測定方法 | 目的 |
|------|----------|------|
| ページ別インプレッション数 | AdSenseレポート（広告ユニット別） | 各配置枠の露出量の把握 |
| クリック率（CTR） | AdSenseレポート | 広告の効果と位置の適切さの評価 |
| ページ別RPM | AdSenseレポート | ページあたりの収益性の比較 |
| ページ滞在時間の変化 | Google Analytics | 広告追加によるUX悪化がないかの確認 |
| 直帰率の変化 | Google Analytics | 広告によるユーザー離脱の有無 |
| ページ読み込み速度 | Lighthouse / Web Vitals | パフォーマンスへの影響確認 |

### 効果測定のタイミング

- Phase 1実装後、2週間経過時点で初回レビュー
- その後は月次でAdSenseレポートを確認
- RPMが著しく低い枠（目安: 全体平均の50%以下）は撤去を検討
- ページ滞在時間が20%以上低下した場合は広告位置の見直し

### 現状のMAU規模での留意点

MAU 70-90の段階では広告収益は限定的（月数百円程度の見込み）。現時点の目的は以下の通り。

- 広告配置のベストプラクティスを確立する
- MAU増加時にスケールできる広告基盤を整える
- ユーザーに広告が存在する環境に慣れてもらう（将来のプレミアムプラン訴求の布石）

---

## 9. 横長ディスプレイ広告（ページ最下部）

計算ツール系ページの最下部に横長ディスプレイ広告（`format="horizontal"`）を追加する。

### 配置一覧

| ページ | パス | 配置位置 | adSlotキー（案） |
|--------|------|----------|------------------|
| ツール詳細 | `/tools/[slug]` | RelatedTools の下 | `toolsDetailHorizontal` |
| ツール一覧 | `/tools` | 既存 `toolsListBottom` の下 | `toolsListHorizontal` |
| 成績算出 | `/calculation-of-grades` | 既存 `calcGradesBottom` の下 | `calcGradesHorizontal` |

### 既存のディスプレイ広告との位置関係

```
【ツール詳細ページ】
CTA② → toolsDetailBottom → RelatedTools → toolsDetailHorizontal（横長）

【ツール一覧ページ】
チーム指標セクション → toolsListBottom → toolsListHorizontal（横長）

【成績算出ページ】
投手成績セクション → calcGradesBottom → calcGradesHorizontal（横長）
```

### 補足

- ページ最下部のためユーザー体験への影響は小さい
- ツール一覧・成績算出ページでは既存のディスプレイ広告と連続するが、ページ最下部であること、離脱直前のインプレッション確保が目的のため許容する
- ツール詳細ページはRelatedToolsが間に入るため自然な配置

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-03-18 | 初版作成 |
| 2026-03-18 | 横長ディスプレイ広告（ページ最下部）の配置戦略を追加 |
| 2026-03-18 | インフィード広告の配置一覧をユーザー指定の12枠に更新 |
