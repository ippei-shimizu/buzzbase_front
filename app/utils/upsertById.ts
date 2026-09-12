/**
 * id が一致する要素があれば置き換え、無ければ先頭に追加したリストを返す。
 *
 * マスタの作成 API は同名レコードがあれば既存を返す（冪等）ため、レスポンスを無条件に
 * 追加すると同じ id が並んで二重表示になる。その追従用。
 *
 * @param items 現在のリスト
 * @param item 作成 API のレスポンス
 * @returns 重複しない新しいリスト
 */
export function upsertById<T extends { id: number }>(items: T[], item: T): T[] {
  return items.some((current) => current.id === item.id)
    ? items.map((current) => (current.id === item.id ? item : current))
    : [item, ...items];
}
