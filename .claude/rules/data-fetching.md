# データフェッチ / Server Actions ルール

## 基本方針: Server Actions優先

- **新機能のAPIリクエストはServer Actionsを使用する**
- `services/`ディレクトリのAxios + useEffectパターンは旧来コード（新規では使わない）
- `useEffect`でのデータフェッチは禁止

## Server Actions (`actions.ts`)

```typescript
"use server";

// 認証ヘッダー取得の共通パターン
async function getAuthHeaders(): Promise<Record<string, string> | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access-token")?.value;
  const client = cookieStore.get("client")?.value;
  const uid = cookieStore.get("uid")?.value;
  if (!accessToken || !client || !uid) return null;
  return { "Content-Type": "application/json", "access-token": accessToken, client, uid };
}
```

- actions.tsは責務ごとにファイルを分ける（`dashboard/actions.ts`, `seasons/actions.ts`）
- 認証が必要なAPI: `cache: "no-store"`
- 公開コンテンツ: `next: { revalidate: 60 }` でISR
- エラー時は`null`や`[]`を返す（UI側でfallback表示）
- `redirect()`を含む場合は`NEXT_REDIRECT`エラーを必ず再スロー
- APIベースURL: `RAILS_API_URL`（`http://back:3000`、Docker内部通信）

## パフォーマンス（Vercelベストプラクティス）

- **独立したデータ取得は`Promise.all()`で並列実行する**（直列awaitしない）
- `<Suspense>`で部分的にストリーミングし、ページ全体のレンダリングをブロックしない
- propsにはソースデータだけ渡し、変換処理はクライアント側で行う（シリアライズの重複排除）
