import Link from "next/link";
import { calculatorDefinitions } from "@app/data/baseball-stats/calculator-definitions";
import { CalculatorDefinition } from "@app/data/baseball-stats/types";

type Props = {
  slugs: string[];
};

export default function RelatedTools({ slugs }: Props) {
  const tools = slugs
    .map((slug) => calculatorDefinitions[slug])
    .filter((t): t is CalculatorDefinition => Boolean(t));

  if (tools.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-lg font-bold mb-3">関連する計算ツール</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3 block"
          >
            <p className="font-bold text-sm text-white">{tool.title}</p>
            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
              {tool.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
