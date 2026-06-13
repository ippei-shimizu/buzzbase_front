import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "防御率 3 点台は NPB で平均レベル？",
    answer:
      "NPB のリーグ平均防御率はおおむね 3.30〜3.70 で推移するため、3.00 台前半は「平均より良い」、3.50 前後で「リーグ平均」、3.50 台後半 〜 3.99 で「平均よりやや下」が目安です。",
  },
  {
    question: "防御率 3 点台は先発として十分？",
    answer:
      "3.00 台前半なら先発ローテーション中軸として十分。3.50 を超えてくるとローテ維持はできるものの、3.00 を切る投手陣に押されて入れ替わるリスクが出てきます。",
  },
  {
    question: "防御率 3 点台から 2 点台に上げる方法は？",
    answer:
      "被打率を .240 → .230、WHIP を 1.20 → 1.10 へと改善するのが目安。長打率を抑える（被本塁打を減らす）と防御率は一気に下がりやすくなります。",
  },
];

export default function Era3ColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="防御率 3 点台はどのレベル？リーグ平均ラインの位置づけ"
        description="防御率 3.00 〜 3.99 は NPB のリーグ平均ライン。先発ローテーション中堅・ローテ維持の最低ラインとしての位置づけと改善ポイントを整理。"
        path="/column/era-3"
        breadcrumbLeafName="防御率 3 点台"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "防御率 3 点台とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        防御率 3 点台はどのレベル？リーグ平均ラインの位置づけ
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        防御率 <strong>3.00 〜 3.99</strong> は NPB
        のリーグ平均ラインです。年度によりますがリーグ平均が概ね 3.30〜3.70
        で推移するため、3.00 台は「先発ローテーション中軸の標準レベル」。
        <strong>ローテ維持の最低ライン</strong>として語られる水準です。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">プロ野球での防御率 3 点台</h2>
        <p className="text-sm text-zinc-300 leading-6">
          NPB の場合、3.00 台前半なら「リーグ平均より良い好投手」、3.50
          前後なら「リーグ平均レベルのローテ投手」、3.99
          まで悪化してくると「平均以下・降格リスクあり」の位置づけです。3.00
          を切れるかどうかが、エース格に上がる分水嶺になります。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">高校野球での防御率 3 点台</h2>
        <p className="text-sm text-zinc-300 leading-6">
          金属バットの影響で防御率が出やすい高校野球では、3
          点台は「公立校でも十分エース候補」レベル。強豪校のエースを狙うには 2
          点台、絶対エースなら 1 点台が必要になります。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          3 点台から 2 点台に上げる改善ポイント
        </h2>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
          <li>
            被打率を <strong>.240 → .230</strong>{" "}
            に下げる（追い込みのスライダー・落ち球を増やす）
          </li>
          <li>
            WHIP を <strong>1.20 → 1.10</strong> に（四球と被安打を減らす）
          </li>
          <li>
            被本塁打率を <strong>1.00 → 0.70</strong>{" "}
            程度に（ストライクゾーンの上下を意識）
          </li>
          <li>奪三振率 7.50 以上を目指す（決め球の精度向上）</li>
        </ul>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">あなたの防御率を計算してみよう</p>
        <Link
          href="/tools/era"
          className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
        >
          防御率計算ツールを使う &rarr;
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
            href="/column/era"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率（ERA）とは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法</p>
          </Link>
          <Link
            href="/column/era-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率の目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">レベル別の意味</p>
          </Link>
          <Link
            href="/column/era-2"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率 2 点台はどのレベル？</p>
            <p className="text-xs text-zinc-400 mt-1">エースの入口ライン</p>
          </Link>
          <Link
            href="/column/era-vs-runs"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率と失点率の違い</p>
            <p className="text-xs text-zinc-400 mt-1">指標の使い分け方</p>
          </Link>
        </div>
      </section>
    </>
  );
}
