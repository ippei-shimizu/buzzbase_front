import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "防御率 1 点台はどれくらいすごい？",
    answer:
      "NPB・MLB ともリーグ平均が 3.50 前後で推移する中、1 点台はリーグ歴代でも数年に数人しか出ない歴史的水準。沢村賞・MVP・CY Young 級の偉業です。",
  },
  {
    question: "シーズン通算で 1 点台を達成した投手は？",
    answer:
      "NPB では村田兆治・江夏豊・伊藤智仁・斉藤雅樹・前田健太など、歴代でも限られたエースのみ。MLB ではボブ・ギブソンの 1968 年 1.12 が伝説的な数字として残ります。",
  },
  {
    question: "防御率 1 点台達成に必要な条件は？",
    answer:
      "被打率 .200 前後、WHIP 1.00 以下、奪三振率 9.00 以上のような圧倒的な投球内容が必要です。9 イニング換算で 1 点未満しか取られないため、毎試合 8 回 1 失点〜完封ペースが求められます。",
  },
];

export default function Era1ColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="防御率 1 点台はどのレベル？歴代エースと達成条件"
        description="防御率 1.00 〜 1.99 は歴代でも限られたレジェンド水準。NPB・MLB 歴代の 1 点台投手と、達成に必要な被打率・WHIP の目安を整理。"
        path="/column/era-1"
        breadcrumbLeafName="防御率 1 点台"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "防御率 1 点台とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        防御率 1 点台はどのレベル？歴代エースと達成条件
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        防御率 <strong>1.00 〜 1.99</strong>{" "}
        は、リーグを代表するエースの中でも別格の領域です。NPB・MLB
        ともリーグ平均が 3.50 前後で推移する中、規定投球回到達者で 1
        点台を残すのは年間 0〜1 人。
        <strong>沢村賞・MVP・CY Young 賞の絶対的本命</strong>
        に位置付けられます。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">NPB 歴代の 1 点台シーズン</h2>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
          <li>村田兆治（1981 年）: 1.96 — ロッテエース全盛期</li>
          <li>江夏豊（1968 年）: 2.13 → 翌 1969 年 1.55 へ</li>
          <li>伊藤智仁（1993 年）: 0.91 — 新人記録</li>
          <li>斉藤雅樹（1989 年）: 1.62 — 沢村賞・最多勝</li>
          <li>前田健太（2010 年）: 2.21 → MLB へ羽ばたく前段階</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">MLB 歴代の伝説的 1 点台</h2>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
          <li>
            ボブ・ギブソン（1968 年）: <strong>1.12</strong> — 投高打低の象徴
          </li>
          <li>ペドロ・マルティネス（2000 年）: 1.74</li>
          <li>グレッグ・マダックス（1995 年）: 1.63</li>
          <li>ロジャー・クレメンス（1990 年）: 1.93</li>
        </ul>
        <p className="text-sm text-zinc-400 leading-6 mt-3">
          1968
          年は「ピッチャーズイヤー」と呼ばれリーグ全体が投高打低だったため、翌年からマウンドの高さやストライクゾーンが調整されました。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          防御率 1 点台を達成するための条件
        </h2>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
          <li>
            <strong>被打率 .200 前後</strong>: ヒットを抑える圧倒的な力
          </li>
          <li>
            <strong>WHIP 1.00 以下</strong>: 走者を出さない安定感
          </li>
          <li>
            <strong>奪三振率 9.00 以上</strong>: 強気の三振で危機回避
          </li>
          <li>
            <strong>BB/9 2.50 以下</strong>: 四球を最小限に抑える制球力
          </li>
        </ul>
        <p className="text-sm text-zinc-300 leading-6 mt-3">
          9 イニングに 1 点未満しか取られない計算なので、毎試合 8 回 1
          失点〜完封のペースが必要。シーズンを通して安定したコンディションも問われます。
        </p>
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
            href="/column/era-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB 防御率歴代ランキング</p>
            <p className="text-xs text-zinc-400 mt-1">歴代上位の名投手</p>
          </Link>
          <Link
            href="/column/era-2"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率 2 点台はどのレベル？</p>
            <p className="text-xs text-zinc-400 mt-1">エースの入口ライン</p>
          </Link>
        </div>
      </section>
    </>
  );
}
