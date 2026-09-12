import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "長打率 .500 はどれくらいの実力？",
    answer:
      "NPB のリーグ平均長打率 .360〜.400 を 0.10 以上上回る数値で、クリーンアップを任される中心打者の標準値です。年間 20 本塁打以上が見える長打力を持ち、各球団の主軸として年間を通してスタメンを任される実力者です。",
  },
  {
    question: ".500 達成に必要な指標バランスは？",
    answer:
      "打率 .280 + ISO .220（年間 25 本塁打型）、打率 .300 + ISO .200（バランス型）、打率 .320 + ISO .180（高打率アベレージ型）など、複数のパターンがあります。共通して必要なのは、二塁打と本塁打の絶対数を増やす技術と打球速度です。",
  },
  {
    question: ".500 と .550 ではどれくらい差がある？",
    answer:
      "シーズン 500 打数で換算すると、.500 は塁打数 250、.550 は塁打数 275 で 25 塁打の差。本塁打換算で 6〜7 本に相当し、チームの得点期待値で年間 8〜12 得点、勝率では 1 勝前後の差になります。MVP 候補と中心打者を分ける差です。",
  },
];

export default function Slg500ColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="長打率 .500 とは？中心打者ラインの意味と達成条件を解説"
        description="長打率 .500 は NPB の中心打者ライン。クリーンアップ標準で、年間 20 本塁打以上が見える長打力。達成に必要な指標バランスを整理。"
        path="/column/slg-500"
        breadcrumbLeafName="長打率 .500"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "長打率 .500 とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        長打率 .500 とは？中心打者ラインの意味と達成条件を解説
      </h1>

      <p className="mt-4 text-sm text-zinc-300 leading-6">
        長打率 <strong>.500</strong> は、NPB の「中心打者」ライン。リーグ平均
        .360〜.400
        を一段上回る数値で、各球団のクリーンアップを任される強打者の標準値です。
        <strong>年間 20 本塁打以上</strong>
        が見える長打力で、得点圏での得点期待値も高い、リーグの上位 10〜15%
        に入る打者の証です。
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">.500 の意味と位置づけ</h2>
        <p className="text-sm text-zinc-300 leading-6">
          .500 は規定打数到達者の上位 10〜15% に入る水準。3〜5
          番のクリーンアップを年間通して任され、本塁打王や打点王の常連ランクに入る打者の多くがこの帯域に集まります。.550
          に届かなくても、チームの得点力を大きく押し上げる「主軸の証」となるラインです。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">
          .500 達成に必要な指標バランス
        </h2>
        <ul className="ml-5 list-disc space-y-1 text-sm text-zinc-300 leading-6">
          <li>
            <strong>打率 .280 + ISO .220</strong>: 本塁打量産型（年間 25〜30
            HR）
          </li>
          <li>
            <strong>打率 .300 + ISO .200</strong>: バランス型（年間 20〜25 HR +
            二塁打 25 以上）
          </li>
          <li>
            <strong>打率 .320 + ISO .180</strong>: 高打率アベレージ型（年間
            15〜20 HR + 二塁打 30 以上）
          </li>
        </ul>
        <p className="mt-3 text-sm text-zinc-300 leading-6">
          いずれのパターンも、二塁打と本塁打の絶対数を増やす技術と打球速度が必要です。フライ角度の最適化、引っ張り方向への強い打球、追い込まれてからの長打狙いなど、打席ごとの設計が鍵になります。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">
          .500 と .550 の得点期待値の差
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          シーズン 500 打数で換算すると、.500 は塁打数 250、.550 は塁打数 275 で
          25 塁打の差。本塁打換算で 6〜7 本に相当し、チームの得点期待値で年間
          8〜12 得点、勝率では 1 勝前後の差になります。中心打者と MVP
          候補を分ける差で、タイトル争いに直結する数字です。
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
            href="/column/slg-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">NPB 長打率ランキング</p>
            <p className="mt-1 text-xs text-zinc-400">歴代上位のスラッガー</p>
          </Link>
        </div>
      </section>
    </>
  );
}
