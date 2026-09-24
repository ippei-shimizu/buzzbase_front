import Link from "next/link";
import { type RelatedColumn } from "@app/data/baseball-stats/types";

type Props = {
  explanation: string;
  formula: string;
  formulaExample: string;
  guide: { label: string; description: string }[];
  relatedColumns?: RelatedColumn[];
};

export default function StatExplanation({
  explanation,
  formula,
  formulaExample,
  guide,
  relatedColumns = [],
}: Props) {
  return (
    <div className="mt-10 space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">計算式</h2>
        <div className="rounded-lg bg-zinc-800/50 border border-zinc-700 px-4 py-3">
          <p className="text-base font-mono font-bold text-yellow-500">
            {formula}
          </p>
          <p className="text-sm text-zinc-400 mt-2">{formulaExample}</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold mb-3">解説</h2>
        <div className="space-y-4">
          {explanation.split("\n\n").map((paragraph, index) => (
            <p key={index} className="text-sm text-zinc-300 leading-7">
              {paragraph}
            </p>
          ))}
        </div>

        {relatedColumns.length > 0 ? (
          <div className="rounded-lg border border-yellow-700/40 bg-yellow-900/10 px-4 py-3">
            <h3 className="text-sm font-bold text-zinc-200 mb-2">
              もっと詳しく
            </h3>
            <ul className="space-y-2">
              {relatedColumns.map((column) => (
                <li key={column.href}>
                  <Link
                    href={column.href}
                    className="text-sm font-bold text-yellow-500 hover:text-yellow-400 transition-colors"
                  >
                    {column.label}
                  </Link>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {column.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {guide.length > 0 ? (
        <section>
          <h2 className="text-xl font-bold mb-3">目安</h2>
          <div className="grid gap-2">
            {guide.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-lg bg-zinc-800/50 border border-zinc-700 px-4 py-2.5"
              >
                <span className="font-mono font-bold text-yellow-500 min-w-[80px]">
                  {item.label}
                </span>
                <span className="text-sm text-zinc-300">
                  {item.description}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
