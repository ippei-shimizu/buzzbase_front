// 試合記録のパターン分岐。クライアント状態のみで DB には保存せず、
// 試合情報入力 → 打撃 / 投手 への遷移分岐に使う。
export type RecordPattern = "batting" | "pitching" | "both";
