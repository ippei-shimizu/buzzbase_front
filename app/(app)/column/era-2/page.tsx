import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "防御率 2 点台はどれくらいすごい？",
    answer:
      "NPB のリーグ平均防御率がおおむね 3.50 前後で推移する中で、2 点台はリーグ平均を 1〜1.5 点上回る水準です。各球団のエース、最優秀防御率タイトル争いのラインです。",
  },
  {
    question: "防御率 2.00 を切るとどう評価される？",
    answer:
      "NPB では 2.00 を切るシーズンは年間 0〜数人しか出ず、リーグ MVP・沢村賞争いに絡む歴史的シーズンです。1.00 を切れば歴代でも数えるほどのレジェンドクラスになります。",
  },
  {
    question: "高校野球で防御率 2 点台は？",
    answer:
      "金属バットの影響で全体に数字が出やすい高校野球でも、防御率 2 点台は強豪校のエース・地区上位校の主戦投手レベルです。甲子園を狙えるラインといえます。",
  },
];

export default function Era2ColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="防御率 2 点台はどのレベル？プロ・高校野球での意味とエース基準"
        description="防御率 2.00 〜 2.99 はリーグ代表エース水準。NPB タイトル争い、MLB Cy Young 級、高校野球の主戦投手レベルでの意味を整理。"
        path="/column/era-2"
        breadcrumbLeafName="防御率 2 点台"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "防御率 2 点台とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        防御率 2 点台はどのレベル？プロ・高校野球での意味
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        防御率 <strong>2.00 〜 2.99</strong>{" "}
        は「リーグを代表するエース」の目安です。NPB のリーグ平均防御率は年により
        2.76〜4.10 のレンジで変動しますが、概ね 3.50 前後が目安。2 点台は
        <strong>リーグ平均を 1 点近く上回る</strong>水準で、年間を通して 2
        点台をキープできれば最優秀防御率タイトル争いや沢村賞・Cy Young
        賞候補に名前が挙がります。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          防御率 2 点台をプロ野球の文脈で見ると
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          NPB で年間防御率 2.00 を切るのは毎年
          0〜数人。各球団のエース・先発ローテーション最上位が並ぶラインです。MLB
          でも CY Young
          候補に必ず名前が挙がる水準で、リーグを代表する投手の最低ラインといえます。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          防御率 2 点台を高校野球で見ると
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          金属バットの恩恵で全体に防御率が出やすい高校野球では、2
          点台は強豪校のエース・地方大会上位校の主戦投手レベル。1.50
          を切ってくると甲子園を見据える絶対エースの入口になります。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">防御率 2 点台を達成するには</h2>
        <p className="text-sm text-zinc-300 leading-6">
          被打率を <strong>.230〜.250</strong>、WHIP を{" "}
          <strong>1.10 前後</strong>{" "}
          に抑えるのが目安。三振を多く取れる球種に加え、四球を 3.00（BB/9
          で）以下に抑えられる制球力の両立が必要です。
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
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法・読み方</p>
          </Link>
          <Link
            href="/column/era-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率の目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">
              1.00 / 2.00 / 3.00 / 4.00 の意味
            </p>
          </Link>
          <Link
            href="/column/era-1"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率 1 点台はどのレベル？</p>
            <p className="text-xs text-zinc-400 mt-1">歴代級・レジェンド水準</p>
          </Link>
          <Link
            href="/column/era-3"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率 3 点台はどのレベル？</p>
            <p className="text-xs text-zinc-400 mt-1">
              リーグ平均ラインの位置づけ
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
