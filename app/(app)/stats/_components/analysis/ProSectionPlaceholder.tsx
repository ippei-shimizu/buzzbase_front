interface ProSectionPlaceholderProps {
  /** 判定確定後に描画されるブロックの高さに合わせる Tailwind クラス。 */
  className?: string;
}

/**
 * Pro 判定の確定を待つ間に置く中立プレースホルダー。
 * 判定前は hasEntitlement が false 側に倒れるため、そのまま描画すると Pro ユーザーへ
 * ロック UI が一瞬映る。高さだけ確保して切り替え時のレイアウトシフトも抑える。
 */
export function ProSectionPlaceholder({
  className = "h-[200px]",
}: ProSectionPlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-[#3A3A3A] ${className}`}
    />
  );
}
