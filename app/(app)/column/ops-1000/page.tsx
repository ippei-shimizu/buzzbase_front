import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "OPS 1超え（1.000以上）とは？",
    answer:
      "OPS（出塁率＋長打率）が1.000を超えることを指します。NPB・MLBともリーグ平均が.700前後の中で、1.000超えはMVP・首位打者級の超一流打者の象徴です。",
  },
  {
    question: "シーズン通算で OPS 1.000 を超えるのは何人くらい？",
    answer:
      "NPBでは規定打席に到達した中で年間数人レベル、いない年もあります。MLBでも年間で達成するのは数名で、歴代でも限られた超一流打者だけが通算1.000を維持しています。",
  },
  {
    question: "OPS 1.000 を超えるための OBP / SLG の目安は？",
    answer:
      "OBP .400 + SLG .600 が分かりやすい目安です。四球を選ぶ目と長打を打てるパワーを高いレベルで両立する必要があり、ホームラン王タイプか高打率タイプかによって配分は変わります。",
  },
];

export default function Ops1000ColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="OPS 1.000 を超える選手の特徴と「1超え」の意味"
        description="OPS 1.000 超え（「1超え」）の意味と難易度、達成に必要なOBP／SLGバランス、NPB・MLB歴代スラッガーを整理。"
        path="/column/ops-1000"
        breadcrumbLeafName="OPS 1.000 超え"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "OPS 1.000 超え" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        OPS 1.000 を超える選手の特徴と「1超え」の意味
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        OPS <strong>1.000 超え</strong>
        （通称「1超え（いちこえ）」）は、出塁率と長打率の合計が1.000を超えるラインを指す表現です。NPB・MLBともリーグ平均が.700前後で推移する中、年間で達成するのは数名レベル。
        <strong>MVP・首位打者・本塁打王争いに絡む超一流打者</strong>
        の象徴と言える数値です。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">OPS 1.000 の難易度</h2>
        <p className="text-sm text-zinc-300 leading-6">
          単打中心で打率を高めるだけでは OPS 1.000
          には届きません。四球を選んで出塁率を引き上げつつ、長打率も .600
          前後まで伸ばす必要があるため、<strong>選球眼とパワーの両立</strong>
          が必須です。NPBでは王貞治、落合博満、松井秀喜、バレンティンら、MLBではバリー・ボンズ、ベーブ・ルース、テッド・ウィリアムズ、フアン・ソトなど歴代スラッガーが該当します。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          1超えに必要な OBP / SLG バランス
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          一般的な目安は <strong>OBP .400 + SLG .600</strong>。打率は .300〜.340
          程度でも、ホームランと四球が多いタイプは到達可能です。逆に「打率 .340
          / OBP .380 / SLG .500」のようなタイプは打率は超一流でもOPSは .880
          程度に留まります。
        </p>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">あなたのOPSを計算してみよう</p>
        <Link
          href="/tools/ops"
          className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
        >
          OPS計算ツールを使う &rarr;
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">よくある質問</h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-lg border border-zinc-700 bg-zinc-800/50"
            >
              <summary className="cursor-pointer px-5 py-3 text-sm font-bold text-zinc-200">
                {item.question}
              </summary>
              <p className="px-5 pb-4 text-sm text-zinc-300 leading-6">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">関連コラム</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/column/ops"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPSとは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法・読み方</p>
          </Link>
          <Link
            href="/column/ops-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPSの目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">
              .700/.800/.900/1.000 の意味
            </p>
          </Link>
          <Link
            href="/column/ops-800"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPS .800 はどのレベル？</p>
            <p className="text-xs text-zinc-400 mt-1">好打者の入口ライン</p>
          </Link>
          <Link
            href="/column/ops-max"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPS の最大値（マックス）は？</p>
            <p className="text-xs text-zinc-400 mt-1">理論値と歴史的最高記録</p>
          </Link>
        </div>
      </section>
    </>
  );
}
