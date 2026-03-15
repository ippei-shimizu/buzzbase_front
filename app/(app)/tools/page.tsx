import Link from "next/link";
import type { Metadata } from "next";
import { calculatorDefinitions } from "@app/data/baseball-stats/calculator-definitions";
import { CalculatorDefinition } from "@app/data/baseball-stats/types";

export const metadata: Metadata = {
  title: "野球計算ツール一覧｜打率・防御率・OPSなど無料で自動計算【登録不要】",
  description:
    "打率・防御率・OPS・出塁率・長打率・WHIPなど、野球の主要指標を無料で自動計算。登録不要でブラウザからすぐ使えます。",
};

const battingSlugs = ["batting-average", "obp", "slugging", "ops"];
const pitchingSlugs = ["era", "whip", "k-bb", "k-9", "bb-9"];

function getTools(slugs: string[]): CalculatorDefinition[] {
  return slugs
    .map((slug) => calculatorDefinitions[slug])
    .filter((t): t is CalculatorDefinition => Boolean(t));
}

function ToolCard({ tool }: { tool: CalculatorDefinition }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3 flex items-center justify-between gap-3"
    >
      <div>
        <p className="font-bold text-sm text-white">{tool.title}</p>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
          {tool.description}
        </p>
      </div>
      <svg
        className="w-4 h-4 shrink-0 text-zinc-500 group-hover:text-yellow-600 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

export default function ToolsPage() {
  const battingTools = getTools(battingSlugs);
  const pitchingTools = getTools(pitchingSlugs);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">野球計算ツール一覧</h1>
      <p className="text-sm text-zinc-400 mb-8">
        打率・防御率・OPSなど、野球の主要指標を無料で自動計算できます。登録不要でブラウザからすぐ使えます。
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-bold mb-3">打撃指標</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {battingTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">投手指標</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {pitchingTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>
    </div>
  );
}
