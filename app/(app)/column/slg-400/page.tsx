import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "長打率 .400 はどれくらいの実力？",
    answer:
      "NPB のリーグ平均長打率 .360〜.400 のやや上に位置するライン。レギュラーとして年間を通してスタメンを任され、長打面でも一定の貢献ができる打者の標準値です。下位打線でも十分機能する実力です。",
  },
  {
    question: ".400 達成に必要な指標バランスは？",
    answer:
      "打率 .260 + ISO .140（年間 10〜15 HR）、打率 .280 + ISO .120（バランス型）、打率 .300 + ISO .100（高打率・単打主体）のパターン。.400 に届くなら長打面で「ゼロではない」ことが示せます。",
  },
  {
    question: ".400 と .450 の差は？",
    answer:
      "シーズン 500 打数で .400 は塁打数 200、.450 は塁打数 225 で 25 塁打の差。本塁打換算で 6〜7 本、得点期待値で年間 8〜12 得点の差で、これが「下位レギュラー」と「上位レギュラー」を分けるラインになります。",
  },
];

export default function Slg400ColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="長打率 .400 とは？リーグ平均を超えるラインの意味と達成条件"
        description="長打率 .400 は NPB のリーグ平均を上回るライン。レギュラーの最低ラインで、長打面の貢献が見える打者の標準値。達成条件を整理。"
        path="/column/slg-400"
        breadcrumbLeafName="長打率 .400"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "長打率 .400 とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        長打率 .400 とは？リーグ平均を超えるラインの意味と達成条件
      </h1>

      <p className="mt-4 text-sm text-zinc-300 leading-6">
        長打率 <strong>.400</strong> は、NPB
        の「リーグ平均を超えるレギュラー」ライン。リーグ平均 .360〜.400
        のやや上にあたり、年間を通してスタメンを任され、長打面でも一定の貢献ができる打者の標準値です。
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">.400 の意味と位置づけ</h2>
        <p className="text-sm text-zinc-300 leading-6">
          .400 は規定打数到達者の上位 40〜50% に入る水準。1〜2 番 / 7〜8
          番の下位レギュラーや、中堅レギュラーが標準として保つラインです。.450
          に届かなくても、シーズン通じて試合に出続け、必要な場面で長打を生み出せる打者として認識されます。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">.400 達成に必要なバランス</h2>
        <ul className="ml-5 list-disc space-y-1 text-sm text-zinc-300 leading-6">
          <li>
            <strong>打率 .260 + ISO .140</strong>: 中量本塁打型（年間 10〜15
            HR）
          </li>
          <li>
            <strong>打率 .280 + ISO .120</strong>: バランス型（年間 8〜10 HR +
            二塁打 20 以上）
          </li>
          <li>
            <strong>打率 .300 + ISO .100</strong>: 高打率・単打主体型（年間 5〜8
            HR + 二塁打 20）
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">リーグ平均との位置関係</h2>
        <p className="text-sm text-zinc-300 leading-6">
          NPB のリーグ平均長打率は概ね .360〜.400 で推移します。.400
          ラインは「リーグ平均を上回る」最低限のラインで、下回るとリーグ平均以下のパフォーマンスとして扱われます。レギュラー定着の最低基準として意識すべき数値です。
        </p>
      </section>

      <div className="mt-8 rounded-xl border border-yellow-700/40 bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 px-5 py-6 text-center">
        <p className="mb-2 text-lg font-bold">あなたの長打率を計算してみよう</p>
        <Link
          href="/tools/slugging"
          className="inline-block rounded-lg bg-yellow-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-yellow-500"
        >
          長打率計算ツールを使う &rarr;
        </Link>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold">よくある質問</h2>
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
        <h2 className="mb-4 text-xl font-bold">関連コラム</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/column/slg"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">長打率とは（基本記事）</p>
            <p className="mt-1 text-xs text-zinc-400">
              意味・計算方法・打率との違い
            </p>
          </Link>
          <Link
            href="/column/slg-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">長打率の目安・基準</p>
            <p className="mt-1 text-xs text-zinc-400">
              レベル別の意味・ポジション別
            </p>
          </Link>
          <Link
            href="/column/slg-450"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">長打率 .450 とは</p>
            <p className="mt-1 text-xs text-zinc-400">好打者ライン</p>
          </Link>
          <Link
            href="/column/npb-slg-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">NPB 長打率平均値の推移</p>
            <p className="mt-1 text-xs text-zinc-400">リーグ平均の年度変化</p>
          </Link>
        </div>
      </section>
    </>
  );
}
