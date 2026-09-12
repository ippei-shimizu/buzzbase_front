interface ProSectionPlaceholderProps {
  /** 読み込み中のブロック名。支援技術に何を待っているのか伝えるために使う。 */
  label: string;
}

/**
 * Pro 限定ブロックをクライアントで取得している間に置くプレースホルダー。
 * SSR 済みなら描画されない。加入直後の in-place 更新など、サーバーで
 * entitlement を解決できなかったケースだけがここに落ちる。
 */
export function ProSectionPlaceholder({ label }: ProSectionPlaceholderProps) {
  return (
    <div
      role="status"
      className="h-[200px] animate-pulse rounded-xl bg-[#3A3A3A]"
    >
      <span className="sr-only">{label}を読み込み中</span>
    </div>
  );
}
