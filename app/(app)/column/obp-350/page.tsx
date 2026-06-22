import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "出塁率 .350 はどれくらいすごい？",
    answer:
      "NPB のリーグ平均出塁率 .310〜.330 を一段上回る数値で、中堅レギュラー上位のライン。年間を通してスタメンで使われ、上位打線でチームの得点機を作る打者の標準値です。",
  },
  {
    question: ".350 と平均打者 (.320 前後) の差は？",
    answer:
      "シーズン 600 打席で見ると、.350 は約 210 回出塁、.320 は約 192 回出塁。差は 18 出塁で、得点期待値ベースだと年間 12〜15 得点ほど、勝率では 1〜1.5 勝に相当します。",
  },
  {
    question: ".350 を達成するための打率・四球率の目安は？",
    answer:
      "打率 .270 + 四球率 .10〜.12 が一つの目安です。シーズン 600 打席なら、安打 130 本前後と四球 60 個前後を両立できれば .350 が見えてきます。",
  },
];

export default function Obp350ColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="出塁率 .350 とは？中堅レギュラー上位ラインの意味と達成条件"
        description="出塁率 .350 は NPB の中堅レギュラー上位ライン。リーグ平均を一段上回る数値で、安定してスタメンを任される打者の標準値。計算方法・達成条件を解説。"
        path="/column/obp-350"
        breadcrumbLeafName="出塁率 .350"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "出塁率 .350 とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        出塁率 .350 とは？中堅レギュラー上位ラインの意味と達成条件
      </h1>

      <p className="mt-4 text-sm text-zinc-300 leading-6">
        出塁率 <strong>.350</strong> は、NPB
        の「中堅レギュラー上位」ライン。リーグ平均 .310〜.330
        を一段上回る数値で、年間を通してスタメンで使われ、上位打線で得点機を作る打者の標準値です。
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">.350 の意味と位置づけ</h2>
        <p className="text-sm text-zinc-300 leading-6">
          .350 は規定打席到達者の上位 30〜40% に入る水準。1〜2 番か 6〜7
          番の中堅レギュラーとして、シーズン通して試合に出続けられる「信頼の証」のライン。.380
          や .400 に届かなくても、チームに不可欠な存在として扱われます。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">.350 達成に必要なバランス</h2>
        <ul className="ml-5 list-disc space-y-1 text-sm text-zinc-300 leading-6">
          <li>
            <strong>打率 .270 + 四球率 .10〜.12</strong>:
            接触型ヒッターの標準パターン (シーズン 60 四球前後)
          </li>
          <li>
            <strong>打率 .240 + 四球率 .15</strong>: 選球眼特化型
            (リードオフマン候補)
          </li>
          <li>
            <strong>打率 .300 + 四球率 .07</strong>: アベレージヒッタータイプ
          </li>
        </ul>
        <p className="mt-3 text-sm text-zinc-300 leading-6">
          打率と選球眼のバランスが取れていれば、極端な特化型でなくても達成可能。シーズンを通して三振を減らし、打席ごとに球を見る姿勢を続けることが鍵です。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">.350 とリーグ平均 .320 の差</h2>
        <p className="text-sm text-zinc-300 leading-6">
          シーズン 600 打席で、.350 は約 210 回出塁、.320 は約 192 回出塁。差は
          18 出塁で、得点期待値ベースだと年間 12〜15 得点ほど、勝率では 1〜1.5
          勝に相当する差です。リーグ平均を維持するだけのレギュラーと、.350
          をキープできるレギュラーでは、チーム貢献度がはっきり分かれます。
        </p>
      </section>

      <div className="mt-8 rounded-xl border border-yellow-700/40 bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 px-5 py-6 text-center">
        <p className="mb-2 text-lg font-bold">あなたの出塁率を計算してみよう</p>
        <Link
          href="/tools/obp"
          className="inline-block rounded-lg bg-yellow-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-yellow-500"
        >
          出塁率計算ツールを使う &rarr;
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
            href="/column/obp"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">出塁率とは（基本記事）</p>
            <p className="mt-1 text-xs text-zinc-400">
              意味・計算方法・打率との違い
            </p>
          </Link>
          <Link
            href="/column/obp-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">出塁率の目安・基準</p>
            <p className="mt-1 text-xs text-zinc-400">
              レベル別の意味・ポジション別
            </p>
          </Link>
          <Link
            href="/column/obp-380"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">出塁率 .380 とは</p>
            <p className="mt-1 text-xs text-zinc-400">好打者上位ライン</p>
          </Link>
          <Link
            href="/column/obp-400"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">出塁率 .400 とは</p>
            <p className="mt-1 text-xs text-zinc-400">
              最高出塁率タイトル争いライン
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
