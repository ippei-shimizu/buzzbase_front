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
  { year: "2018", central: ".340", pacific: ".325" },
  { year: "2019", central: ".332", pacific: ".327" },
  {
    year: "2020",
    central: ".333",
    pacific: ".326",
    note: "120 試合短縮シーズン",
  },
  { year: "2021", central: ".324", pacific: ".316" },
  { year: "2022", central: ".308", pacific: ".309" },
  { year: "2023", central: ".306", pacific: ".309" },
];

const faqItems = [
  {
    question: "NPB のリーグ平均出塁率はどれくらい？",
    answer:
      "近年は .305〜.340 のレンジで推移しています。2018 年はセ・リーグ .340 / パ・リーグ .325 と高めでしたが、2022〜2023 年には両リーグとも .305〜.310 前後まで低下しており、投高打低のトレンドが続いています。",
  },
  {
    question: "リーグ平均と最高出塁率タイトル獲得ラインの差は？",
    answer:
      "近年の最高出塁率タイトル獲得ラインは .400 前後で、リーグ平均（.305〜.340）から +0.060〜+0.090 のレンジ。.400 を超えるシーズンは各球団に 1 人いるかどうかの貴重な数値です。",
  },
  {
    question: "セ・パで出塁率の傾向は違う？",
    answer:
      "2018〜2021 はセ・リーグの方がパ・リーグよりやや高い傾向（差 .005〜.015）でしたが、2022〜2023 はパ・リーグが微差でセ・リーグを上回るシーズンも出ています。DH 制によるパ・リーグの優位性は年度によって入れ替わる程度の差です。",
  },
];

export default function NpbObpAverageColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="NPB 出塁率平均値の推移｜セ・パ両リーグ平均と最高出塁率の関係"
        description="NPB（日本プロ野球）のリーグ平均出塁率の推移と、最高出塁率タイトル獲得ラインとの関係を整理。"
        path="/column/npb-obp-average"
        breadcrumbLeafName="NPB 出塁率平均値の推移"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "NPB 出塁率平均値の推移" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        NPB 出塁率平均値の推移｜セ・パ両リーグ平均と最高出塁率の関係
      </h1>

      <p className="mt-4 text-sm text-zinc-300 leading-6">
        NPB（日本プロ野球）のリーグ平均出塁率は、近年
        <strong>長期的な低下傾向</strong>
        にあります。2018 年はセ・リーグ .340 / パ・リーグ .325
        でしたが、2022〜2023 年には両リーグとも <strong>.305〜.310 前後</strong>
        まで下がっており、投高打低のトレンドが強まっています。出塁率を「いくつから良い」と判断するときは、その年のリーグ平均との比較が重要な物差しになります。
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">
          NPB リーグ平均出塁率の推移（直近・参考値）
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
          2018〜2021 はセ・リーグの方がパ・リーグよりやや高い傾向で、差は
          .005〜.015 程度ありました。一方で 2022〜2023
          はパ・リーグが微差でセ・リーグを上回るシーズンも出ており、DH
          制によるパ・リーグ優位という一般論は、年度によって入れ替わる程度の差にとどまっています。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">
          最高出塁率タイトル獲得ラインとの差
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          リーグ平均 .305〜.340 に対して、最高出塁率タイトルを獲得する打者は概ね{" "}
          <strong>.400 前後</strong> をマーク。リーグ平均から +0.060〜+0.090
          上回る選手で、各球団に 1 人いるかどうかの稀少な存在です。.420
          を超えるシーズンは MVP・首位打者級の偉業として扱われます。
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
            href="/column/obp-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">NPB 出塁率ランキング</p>
            <p className="mt-1 text-xs text-zinc-400">
              歴代シーズン上位とタイトル獲得者
            </p>
          </Link>
          <Link
            href="/column/obp-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">出塁率の目安・基準</p>
            <p className="mt-1 text-xs text-zinc-400">
              .350/.380/.400/.420 の意味
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
          <Link
            href="/column/obp"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">出塁率とは（基本記事）</p>
            <p className="mt-1 text-xs text-zinc-400">
              意味・計算方法・打率との違い
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
