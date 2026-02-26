import Link from "next/link";

const tocItems = [
  { label: "打撃成績", href: "#batting" },
  { label: "投手成績", href: "#pitching" },
];

export default function TableOfContents() {
  return (
    <nav className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 mb-6">
      <p className="text-sm font-bold mb-2">目次</p>
      <ul className="grid gap-y-1.5">
        {tocItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm text-zinc-400 hover:text-yellow-500 transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
