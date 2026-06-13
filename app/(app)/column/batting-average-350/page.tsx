import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "打率 .350 はどれくらいすごい？",
    answer:
      "NPB のリーグ平均が概ね .250 前後で推移する中で、.350 はリーグ平均を 1 割以上上回る歴代級の数値です。シーズン規定打席到達者で .350 を超えるのは年間 0〜2 名程度の偉業。",
  },
  {
    question: "歴代で打率 .350 以上を達成した日本人選手は？",
    answer:
      "イチローの .387（2000 年・オリックス）、落合博満の .367（1985 年・ロッテ、三冠王）、青木宣親の .358（2010 年・ヤクルト）などが代表的です。MLB でもイチローの .372（2004 年）が日本人最高記録として残ります。",
  },
  {
    question: "打率 .350 を達成するにはどうすればいい？",
    answer:
      "10 打席で 3.5 安打、つまりほぼ毎試合複数安打が必要です。ヒットゾーンの広さ・選球眼・外野の間を抜く打球の質、すべてが揃って初めて到達できる水準です。",
  },
];

export default function BattingAverage350ColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="打率 .350 はどのレベル？歴代首位打者と達成条件"
        description="打率 .350 以上は NPB 首位打者の上位ライン。イチロー・落合博満・青木宣親ら歴代の .350 越え打者と、達成に必要な打撃指標を整理。"
        path="/column/batting-average-350"
        breadcrumbLeafName="打率 .350"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "打率 .350 とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        打率 .350 はどのレベル？歴代首位打者と達成条件
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        打率 <strong>.350</strong>{" "}
        は、首位打者争いの最上位ライン。シーズンを通して .350 を維持できる打者は
        NPB でも年間 0〜2 名程度の偉業で、
        <strong>歴代を代表するヒットメーカー</strong>のみが到達できる水準です。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">NPB 歴代の打率 .350 越え</h2>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
          <li>
            <strong>イチロー（1994, オリックス）</strong>: .385 — シーズン 210
            安打のプロ野球新記録
          </li>
          <li>
            <strong>イチロー（2000, オリックス）</strong>: .387 — NPB
            最後のシーズン
          </li>
          <li>
            <strong>落合博満（1985, ロッテ）</strong>: .367 — 三冠王
          </li>
          <li>
            <strong>ランディ・バース（1986, 阪神）</strong>: .389 —
            2年連続三冠王
          </li>
          <li>
            <strong>青木宣親（2010, ヤクルト）</strong>: .358 —
            首位打者・最高出塁率
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">MLB の打率 .350 越え</h2>
        <p className="text-sm text-zinc-300 leading-6">
          MLB でも .350 はシーズンを通して維持するのは難しく、規定打席到達者で
          .350 を超えるのは年間数名。日本人選手では
          <strong>イチローの 2004 年シーズン .372</strong>が、262
          安打の年として歴史に刻まれています。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">.350 達成に必要な打撃指標</h2>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
          <li>10 打席で 3.5 安打（毎試合 1.4〜1.5 安打のペース）</li>
          <li>三振率を 10〜15% に抑える接触率の高さ</li>
          <li>ヒットゾーンの広さ（センターから逆方向への打ち分け）</li>
          <li>追い込まれてからの対応力（2 ストライク打率の高さ）</li>
        </ul>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">あなたの打率を計算してみよう</p>
        <Link
          href="/tools/batting-average"
          className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
        >
          打率計算ツールを使う &rarr;
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
            href="/column/batting-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率とは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法</p>
          </Link>
          <Link
            href="/column/batting-average-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率の目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">レベル別の意味</p>
          </Link>
          <Link
            href="/column/batting-average-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB 打率歴代ランキング</p>
            <p className="text-xs text-zinc-400 mt-1">歴代上位の名打者</p>
          </Link>
          <Link
            href="/column/batting-average-300"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率 3 割の意味</p>
            <p className="text-xs text-zinc-400 mt-1">好打者ライン</p>
          </Link>
        </div>
      </section>
    </>
  );
}
