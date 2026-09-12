/**
 * メニューセット（再利用できる練習メニューの束）の型定義。
 * back/app/serializers/v2/menu_set_serializer.rb のレスポンスに対応する。
 */

/**
 * セット内のメニュー1件。
 * name / unit_label は practice_menu から都度引く表示用の値で、
 * メニューが削除されている場合は null になる。
 */
export interface MenuSetItem {
  practice_menu_id: number;
  name: string | null;
  unit_label: string | null;
  /** back は float カラムのため文字列化されず number で返る。 */
  target_value: number | null;
}

export interface MenuSet {
  id: number;
  name: string;
  note: string | null;
  sort_order: number;
  items: MenuSetItem[];
}

/**
 * メニューセットの作成・更新パラメータ。
 * items は差分更新ではなく全置換（back が menu_set_items を作り直す）。
 * 更新時に items を省略するとセット内メニューは変更されない。
 */
export interface MenuSetInput {
  name: string;
  note?: string | null;
  sort_order?: number;
  items?: { practice_menu_id: number; target_value?: number | null }[];
}
