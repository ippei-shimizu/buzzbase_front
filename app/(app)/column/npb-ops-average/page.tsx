import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "NPBのリーグ平均OPSはどれくらい？",
    answer:
      "年度によって変動しますが、おおむね.680〜.720の範囲で推移しています。セ・リーグとパ・リーグで大きな差はなく、いずれも.700前後が平均値の目安です。",
  },
  {
    question: "リーグ平均OPSはどう変化してきた？",
    answer:
      "投高打低の時期はリーグ平均が.660前後まで下がり、打高投低の時期は.720を超えることもあります。ボール仕様の変更や戦術の変化（フライボール革命など）の影響を受けやすい指標です。",
  },
  {
    question: "セ・パでOPSの傾向は違う？",
    answer:
      "DH制を採用しているパ・リーグの方がリーグ全体のOPSはわずかに高くなる傾向があります。投手が打席に立たない分、平均OBP・SLGが押し上げられるためです。",
  },
];

export default function NpbOpsAverageColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="NPB OPS平均値の推移｜セ・パ両リーグの平均と歴代スラッガーの比較"
        description="NPB（日本プロ野球）のリーグ平均OPSの推移と、歴代スラッガーシーズンとの比較を整理。"
        path="/column/npb-ops-average"
        breadcrumbLeafName="NPB OPS平均値の推移"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "NPB OPS平均値の推移" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        NPB OPS平均値の推移｜セ・パ両リーグの平均と歴代スラッガーの比較
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        NPB（日本プロ野球）のリーグ平均OPSは、年度や球の規格・戦術トレンドによって変動するものの、おおむね{" "}
        <strong>.680〜.720 の範囲</strong>{" "}
        で推移しています。OPSを「いくつから良い」と判断するときは、リーグ平均との比較が重要な物差しになります。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          NPB リーグ平均OPSの目安（直近トレンド）
        </h2>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
          <li>投高打低の年：リーグ平均OPSが .660〜.690 程度に下がる</li>
          <li>打高投低の年：リーグ平均OPSが .710〜.730 まで上がる</li>
          <li>近年のトレンド：おおむね .680〜.710 のレンジで推移</li>
        </ul>
        <p className="text-sm text-zinc-300 leading-6 mt-3">
          ボール仕様の変更や、フライボール革命のような戦術トレンドの影響でリーグ全体のOPSが上下します。リーグ平均が
          .680 を下回るシーズンは投手有利、 .720
          を超えるシーズンは打者有利と覚えておくと現場感がつかみやすくなります。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">セ・パで違いはある？</h2>
        <p className="text-sm text-zinc-300 leading-6">
          DH制を採用するパ・リーグはリーグ平均OPSがやや高くなる傾向があります。投手が打席に立たない分、平均OBP・SLGが押し上げられるためです。差は小さいものの、シーズン通算
          .010〜.020 程度の開きが出ることがあります。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">歴代スラッガーとの比較</h2>
        <p className="text-sm text-zinc-300 leading-6">
          リーグ平均 .700 に対して、歴代上位（王貞治 1.293／バレンティン
          1.234／落合博満 1.207 など）は
          <strong>.500 以上もリーグ平均を上回る</strong>
          規格外の数値です。リーグ平均OPSとの差（OPS+
          のような考え方）を意識すると、選手の偉大さがより明確になります。
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
            href="/column/ops-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB OPSランキング</p>
            <p className="text-xs text-zinc-400 mt-1">
              歴代シーズン上位の日本人スラッガー
            </p>
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
            href="/column/ops-700"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPS .700 は平均？</p>
            <p className="text-xs text-zinc-400 mt-1">
              リーグ平均ラインの位置づけ
            </p>
          </Link>
          <Link
            href="/column/ops"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPSとは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法・読み方</p>
          </Link>
        </div>
      </section>
    </>
  );
}
