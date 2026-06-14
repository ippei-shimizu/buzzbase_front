import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

type AverageRow = {
  year: string;
  central: string;
  pacific: string;
  note?: string;
};

const averageHistory: AverageRow[] = [
  { year: "2018", central: ".417", pacific: ".398" },
  { year: "2019", central: ".402", pacific: ".398" },
  {
    year: "2020",
    central: ".395",
    pacific: ".386",
    note: "120 試合短縮シーズン",
  },
  { year: "2021", central: ".384", pacific: ".366" },
  { year: "2022", central: ".363", pacific: ".368" },
  { year: "2023", central: ".363", pacific: ".376" },
];

const faqItems = [
  {
    question: "NPB のリーグ平均長打率はどれくらい？",
    answer:
      "近年は .360〜.420 のレンジで推移しています。2018 年は両リーグとも .400 前後でしたが、2022〜2023 年には .360〜.380 台まで低下しており、長期的に投高打低のトレンドが続いています。",
  },
  {
    question: "リーグ平均と本塁打王・MVP 級スラッガーの差は？",
    answer:
      "歴代上位（王貞治 1974 = .761、ランディ・バース 1986 = .777、落合博満 1985 = .763 など）は、当時のリーグ平均を .350 以上上回る規格外の数値。リーグ平均との差（SLG+ の考え方）を意識すると、選手の偉大さがより明確になります。",
  },
  {
    question: "セ・パで長打率の傾向は違う？",
    answer:
      "2018〜2021 はセ・リーグの方がパ・リーグよりやや高い傾向でしたが、2022〜2023 はパ・リーグがセ・リーグを上回る年も出ています。DH 制を採用するパ・リーグが押し上げられるという一般論は、年度によって入れ替わる程度の差にとどまります。",
  },
];

export default function NpbSlgAverageColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="NPB 長打率平均値の推移｜セ・パ両リーグ平均と歴代スラッガーの比較"
        description="NPB（日本プロ野球）のリーグ平均長打率の推移と、歴代スラッガーシーズンとの比較を整理。"
        path="/column/npb-slg-average"
        breadcrumbLeafName="NPB 長打率平均値の推移"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "NPB 長打率平均値の推移" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        NPB 長打率平均値の推移｜セ・パ両リーグ平均と歴代スラッガーの比較
      </h1>

      <p className="mt-4 text-sm text-zinc-300 leading-6">
        NPB（日本プロ野球）のリーグ平均長打率は、近年
        <strong>長期的な低下傾向</strong>
        にあります。2018 年は両リーグとも .400 前後でしたが、2022〜2023 年には{" "}
        <strong>.360〜.380 台</strong>
        まで下がっており、投高打低のトレンドが強まっています。長打率を「いくつから良い」と判断するときは、その年のリーグ平均との比較が重要な物差しになります。
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">
          NPB リーグ平均長打率の推移（直近・参考値）
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-zinc-700 text-sm">
            <thead>
              <tr className="bg-zinc-800">
                <th className="border-b border-zinc-700 px-3 py-2 text-left text-zinc-300">
                  年度
                </th>
                <th className="border-b border-zinc-700 px-3 py-2 text-left text-zinc-300">
                  セ・リーグ平均
                </th>
                <th className="border-b border-zinc-700 px-3 py-2 text-left text-zinc-300">
                  パ・リーグ平均
                </th>
                <th className="border-b border-zinc-700 px-3 py-2 text-left text-zinc-300">
                  備考
                </th>
              </tr>
            </thead>
            <tbody>
              {averageHistory.map((row) => (
                <tr key={row.year} className="even:bg-zinc-800/50">
                  <td className="border-b border-zinc-700 px-3 py-2 whitespace-nowrap font-bold text-zinc-200">
                    {row.year}
                  </td>
                  <td className="border-b border-zinc-700 px-3 py-2 whitespace-nowrap font-bold text-yellow-500">
                    {row.central}
                  </td>
                  <td className="border-b border-zinc-700 px-3 py-2 whitespace-nowrap font-bold text-yellow-500">
                    {row.pacific}
                  </td>
                  <td className="border-b border-zinc-700 px-3 py-2 text-zinc-400">
                    {row.note ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-zinc-400 leading-6">
          ※リーグ平均は出典・集計対象（規定打席／全打席）によって値が変動する場合があります。本記事の数値は参考値として扱ってください。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">セ・パの違いはどれくらい？</h2>
        <p className="text-sm text-zinc-300 leading-6">
          2018〜2021
          はセ・リーグの方がパ・リーグよりやや高い傾向でしたが、2022〜2023
          はパ・リーグがセ・リーグを上回るシーズンも出ています。DH
          制によるパ・リーグ優位という一般論は、年度によって入れ替わる程度の差にとどまっています。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">歴代スラッガーとの比較</h2>
        <p className="text-sm text-zinc-300 leading-6">
          現代のリーグ平均が .360〜.400 に対して、歴代上位（王貞治 1974 = .761 /
          ランディ・バース 1986 = .777 / 落合博満 1985 = .763 / 松井秀喜 2002 =
          .692 など）は
          <strong>リーグ平均を .350 以上上回る</strong>
          規格外の数値です。リーグ平均長打率との差（SLG+
          のような考え方）を意識すると、選手の偉大さがより明確になります。
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
            href="/column/slg-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">NPB 長打率ランキング</p>
            <p className="mt-1 text-xs text-zinc-400">
              歴代シーズン上位のスラッガー
            </p>
          </Link>
          <Link
            href="/column/slg-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">長打率の目安・基準</p>
            <p className="mt-1 text-xs text-zinc-400">
              .400/.450/.500/.550 の意味
            </p>
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
          <Link
            href="/column/slg"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">長打率とは（基本記事）</p>
            <p className="mt-1 text-xs text-zinc-400">
              意味・計算方法・打率との違い
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
