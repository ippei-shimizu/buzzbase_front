// 投手成績ラベルに紐づくツールチップ文言の単一ソース。
// ダッシュボード/マイページ/成績ページで共通に使用する。
// 新指標を追加するときはここに 1 行追加するだけで全画面に反映できる。

export const INNING_FORMAT_TOOLTIP =
  "試合のイニング制（7回制 or 9回制）に応じて計算されます。";

export const PITCHING_STAT_TOOLTIPS: Readonly<Record<string, string>> = {
  防御率: INNING_FORMAT_TOOLTIP,
  "K/9": INNING_FORMAT_TOOLTIP,
  "BB/9": INNING_FORMAT_TOOLTIP,
};
