import { CalculatorDefinition } from "@app/data/baseball-stats/types";
import CtaBanner from "../../_components/CtaBanner";
import Breadcrumbs from "./Breadcrumbs";
import JsonLd from "./JsonLd";
import RelatedTools from "./RelatedTools";
import StatExplanation from "./StatExplanation";

type Props = {
  definition: CalculatorDefinition;
  calculatorSlot: React.ReactNode;
};

export default function CalculatorPageContent({
  definition,
  calculatorSlot,
}: Props) {
  const baseUrl = "https://buzzbase.jp";

  return (
    <>
      <JsonLd
        toolName={definition.title}
        toolDescription={definition.metaDescription}
        toolUrl={`${baseUrl}/tools/${definition.slug}`}
        faq={definition.faq}
        breadcrumbs={[
          { name: "BUZZ BASE", url: baseUrl },
          {
            name: "計算ツール",
            url: `${baseUrl}/tools`,
          },
          {
            name: definition.title,
            url: `${baseUrl}/tools/${definition.slug}`,
          },
        ]}
      />

      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "計算ツール", href: "/tools" },
          { label: definition.title },
        ]}
      />

      <h1 className="text-2xl font-bold mb-2">{definition.heading}</h1>
      <p className="text-sm text-zinc-400 mb-6">{definition.description}</p>

      {calculatorSlot}

      <StatExplanation
        explanation={definition.explanation}
        formula={definition.formula}
        formulaExample={definition.formulaExample}
        guide={definition.guide}
      />

      {definition.faq.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-3">よくある質問</h2>
          <div className="space-y-4">
            {definition.faq.map((item) => (
              <details
                key={item.question}
                className="rounded-lg border border-zinc-700 bg-zinc-800/50"
              >
                <summary className="px-4 py-3 cursor-pointer text-sm font-bold hover:text-yellow-500 transition-colors">
                  {item.question}
                </summary>
                <p className="px-4 pb-3 text-sm text-zinc-400 leading-6">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <CtaBanner
        heading="もっと詳しく成績を管理するなら"
        body="BUZZ BASEなら試合結果を入力するだけで、打率・防御率・OPSなど全29指標を自動算出。チームメイトとランキング形式で成績を共有できます。"
      />

      <RelatedTools slugs={definition.relatedSlugs} />
    </>
  );
}
