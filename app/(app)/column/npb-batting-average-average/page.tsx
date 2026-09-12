import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

type AverageRow = {
  year: string;
  central: string;
  pacific: string;
  note?: string;
};

// 出典: 公式 NPB.jp 年度別成績 (2018-2022)。
// 規定打席到達者ベースのリーグ平均打率の近似値。
// 出典・集計対象 (規定打席 / 全打席) によって値が若干変動する場合があるため
// 記事内で注釈を入れている。
const averageHistory: AverageRow[] = [
  { year: "2018", central: ".259", pacific: ".254" },
  { year: "2019", central: ".253", pacific: ".252" },
  {
    year: "2020",
    central: ".254",
    pacific: ".246",
    note: "120 試合短縮シーズン",
  },
  { year: "2021", central: ".251", pacific: ".241" },
  {
    year: "2022",
    central: ".240",
    pacific: ".216",
    note: "佐々木朗希 (ロッテ) 完全試合、パ・リーグ歴史的な投高打低",
  },
];

const faqItems = [
  {
    question: "NPB のリーグ平均打率はどれくらい？",
    answer:
      "年度により変動しますが、近年は概ね .216〜.259 のレンジで推移しています。2018 年はセが .259・パが .254 と高めでしたが、2022 年はパ・リーグが .216 と歴史的な投高打低となるなど、年により様相が異なります。",
  },
  {
    question: "リーグ平均打率はどう変化してきた？",
    answer:
      "2018 年の .259（セ）/ .254（パ）から、2022 年には .240 / .216 まで低下しました。特に 2022 年のパ・リーグの .216 は近年では突出した投高打低の年で、佐々木朗希の完全試合に象徴される投手力の高さが平均打率にも反映されました。",
  },
  {
    question: "セ・パで打率の傾向は違う？",
    answer:
      "DH 制を採用するパ・リーグは、投手が打席に立たない分リーグ全体の打率が押し上げられる傾向があると言われていました。しかし近年はパ・リーグの方が打率が低い年も増えており、明確な制度差というよりは各年の投手力分布によって変動しています。",
  },
];

export default function NpbBattingAverageAverageColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="NPB 打率平均値の推移｜セ・パ両リーグの平均と歴代名打者の比較"
        description="NPB（日本プロ野球）のリーグ平均打率の推移と、歴代名打者シーズンとの比較を整理。"
        path="/column/npb-batting-average-average"
        breadcrumbLeafName="NPB 打率平均値の推移"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "NPB 打率平均値の推移" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        NPB 打率平均値の推移｜セ・パ両リーグの平均と歴代名打者の比較
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        NPB（日本プロ野球）のリーグ平均打率は、近年
        <strong>長期的な低下傾向</strong>
        にあります。2018 年はセ .259・パ .254 だったのに対し、2022 年はセ
        .240・パ <strong>.216</strong>{" "}
        と、特にパ・リーグで歴史的な投高打低が観測されました。打率を「いくつから良い」と判断するときは、その年のリーグ平均との比較が重要な物差しになります。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          NPB リーグ平均打率の推移（直近）
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
          ※リーグ平均は出典・集計対象（規定打席 /
          全打席）によって値が変動する場合があります。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">セ・パの違いはどれくらい？</h2>
        <p className="text-sm text-zinc-300 leading-6">
          歴史的には DH
          制を採用するパ・リーグの方がリーグ平均打率がやや高い傾向と言われてきましたが、近年（2018〜2022）は年により逆転することが多く、明確な制度差というよりは各年の投手力分布によって変動しています。2018
          年はセが .259・パが .254 と通説どおりでしたが、2022 年はセ .240・パ
          .216 とセの方が大きく高い年もあります。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">歴代名打者との比較</h2>
        <p className="text-sm text-zinc-300 leading-6">
          近年のリーグ平均が .216〜.259 のレンジに対して、歴代上位（バース 1986
          = .389 / イチロー 2000 = .387 / 落合博満 1985 = .367 / 青木宣親 2010 =
          .358 など）は
          <strong>リーグ平均を 0.100 以上上回る</strong>
          規格外の数値です。リーグ平均との差（OPS+ ならぬ AVG+
          のような考え方）を意識すると、選手の偉大さがより明確になります。
        </p>
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
            href="/column/batting-average-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB 打率ランキング</p>
            <p className="text-xs text-zinc-400 mt-1">歴代上位の名打者</p>
          </Link>
          <Link
            href="/column/batting-average-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率の目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">レベル別の意味</p>
          </Link>
          <Link
            href="/column/batting-average-250"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率 .250 は平均？</p>
            <p className="text-xs text-zinc-400 mt-1">
              リーグ平均ラインの位置づけ
            </p>
          </Link>
          <Link
            href="/column/batting-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率とは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法</p>
          </Link>
        </div>
      </section>
    </>
  );
}
