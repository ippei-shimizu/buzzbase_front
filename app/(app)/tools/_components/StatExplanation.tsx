type Props = {
  explanation: string;
  formula: string;
  formulaExample: string;
  guide: { label: string; description: string }[];
};

export default function StatExplanation({
  explanation,
  formula,
  formulaExample,
  guide,
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
