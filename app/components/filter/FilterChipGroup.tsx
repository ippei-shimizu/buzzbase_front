interface FilterChipGroupProps {
  children: React.ReactNode;
}

export default function FilterChipGroup({ children }: FilterChipGroupProps) {
  return (
    <div className="flex flex-nowrap gap-2 overflow-x-auto min-w-0 max-w-full [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}
