# パフォーマンスルール（Vercelベストプラクティス準拠）

## バンドルサイズ（CRITICAL）

- **バレルインポートを避ける** — `import { X } from 'library'`ではなく直接ファイルからインポート
- 初回レンダリングに不要な重いコンポーネントは`next/dynamic`で遅延ロード（`ssr: false`）
- `next.config.js`の`optimizePackageImports`を活用

## 再レンダリング最適化

- **useEffectでstateを同期しない** — propsやstateから計算できる値はレンダリング中に直接計算する
- `useState` + `useEffect`で派生値を管理するのはアンチパターン
- state更新は関数形式を使う: `setItems(prev => [...prev, newItem])`（stale closure防止）
- `useEffect`の依存配列にオブジェクト全体ではなく、使うprimitive値を指定（`[user.id]` not `[user]`）
- 連続的な値（px幅等）ではなく導出boolean（`isMobile`）をsubscribeする

## サーバーサイド

- `React.cache()`でリクエスト内のデータフェッチを重複排除する（Prisma等DB直接アクセス向け）
- 非同期Server Componentは互いに依存させず並列実行させる
