import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "長打率 .450 はどれくらいの実力？",
    answer:
      "NPB のリーグ平均長打率 .360〜.400 を 0.05〜0.09 上回る数値で、上位レギュラー水準の好打者ライン。アベレージと長打のバランスが取れた打者で、3〜6 番に置かれることが多い実力者です。",
  },
  {
    question: ".450 達成に必要な打率・長打のバランスは？",
    answer:
      "打率 .280 + ISO .170（年間 15〜20 HR）、打率 .300 + ISO .150（年間 12 HR + 二塁打 25）、打率 .320 + ISO .130（高打率・二塁打型）が代表的なパターン。打率と長打のどちらかを尖らせるか、両方を中堅レベルで揃えるかで設計します。",
  },
  {
    question: ".450 と .500 では何が変わる？",
    answer:
      "シーズン 500 打数で .450 は塁打数 225、.500 は塁打数 250 で 25 塁打の差。本塁打換算で 6〜7 本、得点期待値で年間 8〜12 得点の差で、これが「上位レギュラー」と「中心打者」を分けるラインになります。",
  },
];

export default function Slg450ColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="長打率 .450 とは？好打者ラインの意味と達成条件を解説"
        description="長打率 .450 は NPB の好打者ライン。上位レギュラー水準で、アベレージと長打のバランスが取れた打者の標準値。達成条件を整理。"
        path="/column/slg-450"
        breadcrumbLeafName="長打率 .450"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "長打率 .450 とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        長打率 .450 とは？好打者ラインの意味と達成条件を解説
      </h1>

      <p className="mt-4 text-sm text-zinc-300 leading-6">
        長打率 <strong>.450</strong> は、NPB の「好打者」ライン。リーグ平均
        .360〜.400 を 0.05〜0.09
        上回る数値で、上位レギュラーの長打力です。アベレージと長打のバランスが取れた打者の標準値で、3〜6
        番に置かれることが多い、各球団の主力打線を支える実力者です。
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">.450 の意味と位置づけ</h2>
        <p className="text-sm text-zinc-300 leading-6">
          .450 は規定打数到達者の上位 25〜30% に入る水準。3〜6
          番の上位レギュラーとして、年間を通してスタメンに座り、得点機を作れる打者の証です。.500
          に届かなくても、チームの中軸として継続的に貢献するラインです。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">.450 達成に必要なバランス</h2>
        <ul className="ml-5 list-disc space-y-1 text-sm text-zinc-300 leading-6">
          <li>
            <strong>打率 .280 + ISO .170</strong>: 中量本塁打型（年間 15〜20
            HR）
          </li>
          <li>
            <strong>打率 .300 + ISO .150</strong>: バランス型（年間 12 HR +
            二塁打 25 以上）
          </li>
          <li>
            <strong>打率 .320 + ISO .130</strong>: 高打率・二塁打型（年間 8 HR +
            二塁打 30 以上）
          </li>
        </ul>
        <p className="mt-3 text-sm text-zinc-300 leading-6">
          特に注目すべきは「二塁打」の数です。本塁打が伸びないシーズンでも、二塁打を年間
          25
          本以上打てれば長打率は安定します。アベレージヒッターでも、引っ張りの強い打球やライナー性の打球を増やすことで
          .450 帯に届きます。
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
            href="/column/slg-500"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">長打率 .500 とは</p>
            <p className="mt-1 text-xs text-zinc-400">中心打者ライン</p>
          </Link>
          <Link
            href="/column/slg-400"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">長打率 .400 とは</p>
            <p className="mt-1 text-xs text-zinc-400">
              リーグ平均を超えるライン
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
