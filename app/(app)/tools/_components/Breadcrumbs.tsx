import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="パンくずリスト" className="mb-4">
      <ol className="flex items-center gap-1.5 text-xs text-zinc-400 flex-wrap">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {index > 0 ? <span aria-hidden="true">&gt;</span> : null}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-yellow-500 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-zinc-300">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
