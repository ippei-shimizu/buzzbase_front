import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "出塁率 .400 はどれくらいすごい？",
    answer:
      "NPB のリーグ平均出塁率が概ね .310〜.330 で推移する中、.400 はリーグ平均を 0.07 以上上回る歴代級の数値。最高出塁率タイトル争いの中心ラインで、リーグを代表する打者の証です。",
  },
  {
    question: ".400 を達成するためには打率はどれくらい必要？",
    answer:
      "打率 .300 ＋ 四球率（BB/PA）.12〜.15 程度が一つの目安です。たとえば 600 打席なら、四球 75〜90 個と打率 .300 を両立できれば出塁率 .400 が見えてきます。",
  },
  {
    question: "歴代で出塁率 .400 を超えた日本人選手は？",
    answer:
      "イチローの 1994 年 .445、王貞治の 1974 年 .532（NPB 歴代最高）、青木宣親、糸井嘉男などが代表的です。MVP・首位打者・最高出塁率を獲得する選手の多くが .400 超えを残しています。",
  },
];

export default function Obp400ColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="出塁率 .400 とは？最高出塁率タイトル争いラインを解説"
        description="出塁率 .400 は NPB の最高出塁率タイトル争いの中心ライン。.400 を超える歴代名打者、達成に必要な打率・四球数の目安を整理。"
        path="/column/obp-400"
        breadcrumbLeafName="出塁率 .400"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "出塁率 .400 とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        出塁率 .400 とは？最高出塁率タイトル争いラインを解説
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        出塁率 <strong>.400</strong> は、最高出塁率タイトル争いの中心ライン。NPB
        のリーグ平均が概ね .310〜.330 で推移する中、.400 は
        <strong>リーグ平均を 0.07 以上上回る</strong>
        水準で、シーズンを通して維持できる打者は各球団のクリーンアップ・リードオフマンとして信頼される実力者です。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          出塁率 .400 は最高出塁率タイトルの目安
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          NPB では .400 を超えるシーズンを残せば最高出塁率タイトル獲得圏。.420
          を超えれば MVP・首位打者級の偉業です。MLB でも .400
          はキャリアハイの目安で、年間 .400 超えは All-Star 級。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          .400 達成に必要な指標バランス
        </h2>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
          <li>
            <strong>打率 .300 + 四球率 (BB/PA) .12〜.15</strong>:
            接触型ヒッターの王道パターン
          </li>
          <li>
            <strong>打率 .270 + 四球率 .18〜.20</strong>: 選球眼特化型
            (リードオフマン)
          </li>
          <li>
            <strong>打率 .330 + 四球率 .08〜.10</strong>:
            アベレージヒッタータイプ
          </li>
        </ul>
        <p className="text-sm text-zinc-300 leading-6 mt-3">
          いずれのパターンも、シーズンを通して三振率を低めに抑える接触の質、ストライクゾーンの読み、追い込まれてからのカット技術が共通して必要になります。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">.400 と .420 の差は？</h2>
        <p className="text-sm text-zinc-300 leading-6">
          .400 が「最高出塁率タイトル獲得圏」だとすると、.420
          以上は「MVP・歴代級」のラインです。.420
          を超えるシーズンを残せるのは年間 0〜数人レベルで、年間のリーグ MVP
          候補に必ず名前が挙がります。
        </p>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">あなたの出塁率を計算してみよう</p>
        <Link
          href="/tools/obp"
          className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
        >
          出塁率計算ツールを使う &rarr;
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
            href="/column/obp"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">出塁率とは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">
              意味・計算方法・打率との違い
            </p>
          </Link>
          <Link
            href="/column/obp-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">出塁率の目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">
              レベル別の意味・ポジション別
            </p>
          </Link>
          <Link
            href="/column/obp-380"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">出塁率 .380 とは</p>
            <p className="text-xs text-zinc-400 mt-1">好打者上位ライン</p>
          </Link>
          <Link
            href="/column/obp-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB 出塁率ランキング</p>
            <p className="text-xs text-zinc-400 mt-1">歴代上位の名打者</p>
          </Link>
        </div>
      </section>
    </>
  );
}
