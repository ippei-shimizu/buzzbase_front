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
  { year: "2018", central: ".738", pacific: ".725" },
  { year: "2019", central: ".738", pacific: ".719" },
  {
    year: "2020",
    central: ".720",
    pacific: ".703",
    note: "120 試合短縮シーズン",
  },
  { year: "2021", central: ".697", pacific: ".684" },
  { year: "2022", central: ".679", pacific: ".670" },
  { year: "2023", central: ".662", pacific: ".662" },
];

const faqItems = [
  {
    question: "NPBのリーグ平均OPSはどれくらい？",
    answer:
      "近年は .660〜.700 のレンジで推移しています。2018年は両リーグとも .720〜.740 程度でしたが、2023年は両リーグとも .662 まで低下しており、長期的に投高打低のトレンドが続いています。",
  },
  {
    question: "リーグ平均OPSはどう変化してきた？",
    answer:
      "2018年の .738／.725（セ／パ）から、2023年には両リーグとも .662 まで低下し、約 .070 のマイナスが累積しています。ボール仕様や打高投低／投高打低のトレンドの影響を受けやすい指標です。",
  },
  {
    question: "セ・パでOPSの傾向は違う？",
    answer:
      "セ・リーグの方が直近数年はリーグ平均 OPS がやや高い傾向です。2018-2022 はセが パより .010〜.015 高く、2023 は両リーグ同値（.662）でした。DH 制でパが押し上げられるという一般論は近年は当てはまらないシーズンが増えています。",
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
        NPB（日本プロ野球）のリーグ平均 OPS は、近年
        <strong>長期的な低下傾向</strong>
        にあります。2018 年は両リーグとも .720〜.740 のレンジでしたが、2023
        年は両リーグとも <strong>.662</strong>{" "}
        まで下がっており、投高打低のトレンドが強まっています。OPS
        を「いくつから良い」と判断するときは、その年のリーグ平均との比較が重要な物差しになります。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          NPB リーグ平均 OPS の推移（直近）
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  年度
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  セ・リーグ平均
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  パ・リーグ平均
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  備考
                </th>
              </tr>
            </thead>
            <tbody>
              {averageHistory.map((row) => (
                <tr key={row.year} className="even:bg-zinc-800/50">
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-200 font-bold whitespace-nowrap">
                    {row.year}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-yellow-500 font-bold whitespace-nowrap">
                    {row.central}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-yellow-500 font-bold whitespace-nowrap">
                    {row.pacific}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-400">
                    {row.note ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-zinc-400 leading-6 mt-3">
          ※リーグ平均は出典・集計対象（規定打席/全打席）によって値が変動する場合があります。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">セ・パの違いはどれくらい？</h2>
        <p className="text-sm text-zinc-300 leading-6">
          近年（2018〜2023）はセ・リーグの方がパ・リーグよりわずかに高い傾向で、差は
          .010〜.015 程度。2023 年は両リーグとも .662 で同値でした。DH
          制を採用するパ・リーグが押し上げられるという一般論は、年度によっては当てはまらないことが増えています。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">歴代スラッガーとの比較</h2>
        <p className="text-sm text-zinc-300 leading-6">
          現代のリーグ平均が .660〜.700 に対して、歴代上位（王貞治 1974 =
          1.293／バース 1986 = 1.258／王貞治 1973 = 1.255／落合博満 1985 =
          1.244／バレンティン 2013 = 1.234）は
          <strong>リーグ平均を約 .500 以上も上回る</strong>
          規格外の数値です。リーグ平均 OPS との差（OPS+
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
