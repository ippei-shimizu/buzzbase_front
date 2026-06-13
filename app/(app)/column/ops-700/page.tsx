import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "OPS .700 はNPBで平均レベル？",
    answer:
      "はい、NPBのリーグ平均OPSはおおむね.680〜.720の範囲で推移しているため、.700はちょうど平均水準です。レギュラー定着の最低ラインとして語られることが多いです。",
  },
  {
    question: "OPS .700 は高校野球ではどう？",
    answer:
      "金属バットの影響で全体に数字が出やすい高校野球では、.700は「平均よりやや下」のイメージです。公立校のレギュラーレベルではあるものの、強豪校の主軸を任されるには.800以上が必要になります。",
  },
  {
    question: "OPS .700 を超えるための課題は？",
    answer:
      "出塁率（OBP）.330 / 長打率（SLG）.370 程度が目安です。三振が多すぎて出塁率が低いタイプか、ゴロが多すぎて長打率が伸びないタイプかで取り組むべき課題が変わります。",
  },
];

export default function Ops700ColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="OPS .700 は平均？高校野球・プロ野球での位置づけ"
        description="OPS .700 はリーグ平均水準。NPB・高校野球・中学野球での位置づけと、.700を超えるためのOBP／SLG目安を解説。"
        path="/column/ops-700"
        breadcrumbLeafName="OPS .700"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "OPS .700 とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        OPS .700 は平均？高校野球とプロ野球での位置づけ
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        OPS <strong>.700</strong>{" "}
        はNPB・MLBのリーグ平均ラインです。年度によりますがリーグ全体の平均OPSは概ね
        .680〜.720
        で推移しており、.700はちょうど「レギュラーとして平均的な打者」の目安。
        <strong>レギュラー定着の最低ライン</strong>
        として語られることも多い水準です。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">プロ野球での OPS .700</h2>
        <p className="text-sm text-zinc-300 leading-6">
          NPB・MLBともリーグ平均が.700前後で推移するため、.700は
          <strong>レギュラー定着の最低ライン</strong>
          として扱われます。これを下回り続けると守備や走塁での貢献がなければスタメンを外れやすくなります。逆に
          .700
          を安定して超えてくると、リードオフマンや下位打線として価値のあるバッターと言えます。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">高校野球での OPS .700</h2>
        <p className="text-sm text-zinc-300 leading-6">
          金属バットの影響で数字が出やすい高校野球では、.700
          は「平均よりやや下」「公立校のレギュラーレベル」のイメージです。強豪校のレギュラー上位を狙うなら
          .800 以上、4番候補なら .900 以上が必要になってきます。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          .700 を超えるための OBP / SLG バランス
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          目安は <strong>OBP .330 + SLG .370</strong>
          。三振が多くて出塁率が低いタイプは選球眼の改善、ゴロが多くて長打率が伸びないタイプは打球角度の改善が課題になります。
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
            href="/column/ops-vs-batting-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPSと打率・長打率の違い</p>
            <p className="text-xs text-zinc-400 mt-1">指標の使い分け方</p>
          </Link>
        </div>
      </section>
    </>
  );
}
