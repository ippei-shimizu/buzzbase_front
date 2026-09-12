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
  { year: "2018", central: "4.10", pacific: "3.90" },
  { year: "2019", central: "3.89", pacific: "3.91" },
  {
    year: "2020",
    central: "3.83",
    pacific: "3.86",
    note: "120 試合短縮シーズン",
  },
  { year: "2021", central: "3.60", pacific: "3.48" },
  {
    year: "2022",
    central: "3.45",
    pacific: "2.76",
    note: "佐々木朗希 (ロッテ) 完全試合、パ・リーグ歴史的な投高打低",
  },
];

const faqItems = [
  {
    question: "NPB のリーグ平均防御率はどれくらい？",
    answer:
      "年度により大きく変動しますが、近年は概ね 2.76〜4.10 の幅で推移しています。2018 年はセ・リーグが 4.10 と高めでしたが、2022 年はパ・リーグが 2.76 と歴史的な投高打低となるなど、年により様相が異なります。",
  },
  {
    question: "リーグ平均防御率はどう変化してきた？",
    answer:
      "2018 年の 4.10（セ）/ 3.90（パ）から、2022 年には 3.45 / 2.76 まで低下しました。特にパ・リーグの 2.76 は近年では突出した投高打低の年で、佐々木朗希の完全試合に象徴される投手力の高さがリーグ平均にも反映されました。",
  },
  {
    question: "セ・パで防御率の傾向は違う？",
    answer:
      "DH 制を採用するパ・リーグの方が投手にとっては相手打線が厚くなるため、リーグ平均防御率が高くなる傾向があると言われていました。しかし近年は年によって逆転することも多く、明確な差は出にくくなっています。",
  },
];

export default function NpbEraAverageColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="NPB 防御率平均値の推移｜セ・パ両リーグの平均と歴代エースの比較"
        description="NPB（日本プロ野球）のリーグ平均防御率の推移と、歴代エースシーズンとの比較を整理。"
        path="/column/npb-era-average"
        breadcrumbLeafName="NPB 防御率平均値の推移"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "NPB 防御率平均値の推移" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        NPB 防御率平均値の推移｜セ・パ両リーグの平均と歴代エースの比較
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        NPB（日本プロ野球）のリーグ平均防御率は、近年
        <strong>長期的な低下傾向</strong>
        にあります。2018 年はセ 4.10・パ 3.90 だったのに対し、2022 年はセ
        3.45・パ <strong>2.76</strong>{" "}
        と、特にパ・リーグで歴史的な投高打低が観測されました。防御率を「いくつから良い」と判断するときは、その年のリーグ平均との比較が重要な物差しになります。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          NPB リーグ平均防御率の推移（直近）
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
          ※リーグ平均は出典・集計対象（規定投球回 /
          全投手）によって値が変動する場合があります。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">セ・パの違いはどれくらい？</h2>
        <p className="text-sm text-zinc-300 leading-6">
          歴史的には DH
          制のパ・リーグの方がリーグ平均防御率がやや高い傾向と言われてきましたが、近年（2018〜2022）は年により逆転することが多く、明確な制度差というよりは各年の投手力分布によって変動しています。2018
          年はセが 4.10・パが 3.90 と通説どおりでしたが、2022 年はパが
          2.76・セが 3.45 とパの方が大きく低い年もあります。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">歴代エースとの比較</h2>
        <p className="text-sm text-zinc-300 leading-6">
          近年のリーグ平均が 2.76〜4.10 のレンジに対して、歴代上位（村山実 1970
          = 0.98 / 稲尾和久 1956 = 1.06 / 山本由伸 2021 = 1.39 など）は
          <strong>リーグ平均を 2.00 以上下回る</strong>
          規格外の数値です。リーグ平均防御率との差（ERA+
          のような考え方）を意識すると、選手の偉大さがより明確になります。
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
            href="/column/era-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB 防御率ランキング</p>
            <p className="text-xs text-zinc-400 mt-1">歴代上位の名投手</p>
          </Link>
          <Link
            href="/column/era-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率の目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">レベル別の意味</p>
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
          <Link
            href="/column/era"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">防御率（ERA）とは</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法</p>
          </Link>
        </div>
      </section>
    </>
  );
}
