interface FilterChipGroupProps {
  children: React.ReactNode;
  /** はみ出したチップを横スクロールではなく折り返して表示する。 */
  wrap?: boolean;
}

export default function FilterChipGroup({
  children,
  wrap = false,
}: FilterChipGroupProps) {
  if (wrap) {
    return (
      <div className="flex flex-wrap gap-2 min-w-0 max-w-full">{children}</div>
    );
  }
  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto min-w-0 max-w-full [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}
