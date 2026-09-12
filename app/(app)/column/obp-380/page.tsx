import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "出塁率 .380 はどれくらいの実力？",
    answer:
      "NPB のリーグ平均出塁率 .310〜.330 を 0.05 以上上回る数値で、好打者上位のライン。各球団のクリーンアップ・リードオフマンを任される実力で、上位打線で年間を通して使われる打者の標準値です。",
  },
  {
    question: ".380 と .400 ではどれくらい差がある？",
    answer:
      "シーズン 600 打席で考えると、出塁率 .380 は約 228 回出塁、.400 は約 240 回出塁。差は 12 出塁で、得点期待値ベースだと年間 10〜15 得点ほどの差になります。チーム勝率に直結する差です。",
  },
  {
    question: ".380 を目標にする場合の打率と四球数の目安は？",
    answer:
      "打率 .290 + 四球率 .12 (シーズン 70〜80 四球)、または打率 .310 + 四球率 .09 (シーズン 50〜60 四球) のバランスが目安です。打率と選球眼のどちらかに偏らず、両方をある程度高水準で維持する必要があります。",
  },
];

export default function Obp380ColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="出塁率 .380 とは？好打者上位ラインの目安と達成選手"
        description="出塁率 .380 は NPB の好打者上位ライン。各球団のクリーンアップ・リードオフマンを任される標準値、達成に必要な打率・四球率のバランスを整理。"
        path="/column/obp-380"
        breadcrumbLeafName="出塁率 .380"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "出塁率 .380 とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        出塁率 .380 とは？好打者上位ラインの目安と達成選手
      </h1>

      <p className="mt-4 text-sm text-zinc-300 leading-6">
        出塁率 <strong>.380</strong> は、NPB
        の「好打者上位」ライン。リーグ平均が .310〜.330 で推移する中、.380 は
        <strong>リーグ平均を 0.05 以上上回る</strong>
        水準で、各球団のクリーンアップ・リードオフマンを任される打者の標準値です。
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">.380 の意味と位置づけ</h2>
        <p className="text-sm text-zinc-300 leading-6">
          .380 は規定打席到達者の上位 15〜20% に入る水準。1〜3 番か 4
          番打者として年間を通してスタメンを任される打者の多くがこの帯域に集まります。.400
          に届かなくても、チームの得点期待値を大きく押し上げる「貢献度の高い出塁率」です。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">
          .380 達成に必要な指標バランス
        </h2>
        <ul className="ml-5 list-disc space-y-1 text-sm text-zinc-300 leading-6">
          <li>
            <strong>打率 .290 + 四球率 .12</strong>:
            接触型ヒッターの標準パターン (シーズン 70〜80 四球)
          </li>
          <li>
            <strong>打率 .260 + 四球率 .16</strong>: 選球眼重視型
            (リードオフマン候補)
          </li>
          <li>
            <strong>打率 .310 + 四球率 .09</strong>:
            高打率アベレージヒッタータイプ
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">
          .380 と .400 の得点期待値の差
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          シーズン 600 打席で、.380 は約 228 回出塁、.400 は約 240 回出塁。差は
          12 出塁で、得点期待値ベースだと年間 10〜15
          得点ほどの差になります。チーム勝率では 1〜1.5
          勝に相当する差で、ペナント争いに直結する数字です。
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
            href="/column/obp-400"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">出塁率 .400 とは</p>
            <p className="mt-1 text-xs text-zinc-400">
              最高出塁率タイトル争いライン
            </p>
          </Link>
          <Link
            href="/column/obp-350"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">出塁率 .350 とは</p>
            <p className="mt-1 text-xs text-zinc-400">
              中堅レギュラー上位ライン
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
