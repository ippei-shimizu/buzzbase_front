import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

type RankingRow = {
  rank: number;
  player: string;
  year: string;
  ops: string;
  note: string;
};

const historicalRanking: RankingRow[] = [
  {
    rank: 1,
    player: "バリー・ボンズ",
    year: "2004",
    ops: "1.422",
    note: "232四球の記録的シーズン",
  },
  {
    rank: 2,
    player: "バリー・ボンズ",
    year: "2002",
    ops: "1.381",
    note: "本塁打46・四球198",
  },
  {
    rank: 3,
    player: "ベーブ・ルース",
    year: "1920",
    ops: "1.379",
    note: "本塁打54・長打率.849（当時の歴代最高）",
  },
  {
    rank: 4,
    player: "バリー・ボンズ",
    year: "2001",
    ops: "1.379",
    note: "シーズン本塁打73本（歴代最多）",
  },
  {
    rank: 5,
    player: "ベーブ・ルース",
    year: "1921",
    ops: "1.359",
    note: "本塁打59",
  },
  {
    rank: 6,
    player: "ベーブ・ルース",
    year: "1923",
    ops: "1.309",
    note: "MVP獲得シーズン (打率.393/41HR)",
  },
  {
    rank: 7,
    player: "テッド・ウィリアムズ",
    year: "1941",
    ops: "1.287",
    note: "シーズン打率.406（MLB最後の4割打者）",
  },
  {
    rank: 8,
    player: "ロジャース・ホーンスビー",
    year: "1925",
    ops: "1.245",
    note: "三冠王 (.403/39HR/143打点)",
  },
];

const faqItems = [
  {
    question: "MLB歴代最高シーズンOPSは？",
    answer:
      "バリー・ボンズが2004年に記録した1.422がMLB歴代最高クラスとされています。同じくバリー・ボンズの2002年（1.381）、2001年（1.379）も上位に並びます。",
  },
  {
    question: "現役MLB選手で1.000を超えるOPSの選手は？",
    answer:
      "シーズンを通して1.000を超えるのはフアン・ソト、アーロン・ジャッジ、シェイ・オーニル、ムーキー・ベッツなど数名レベル。リーグでも年間で1.000超えは10名前後に限られます。",
  },
];

export default function OpsRankingMlbColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="MLB OPS歴代TOP｜バリー・ボンズから現役まで"
        description="MLB歴代シーズン最高OPSランキングと近年のトップ選手の水準を整理。"
        path="/column/ops-ranking-mlb"
        breadcrumbLeafName="MLB OPS歴代TOP"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "MLB OPS歴代TOP" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        MLB OPS歴代TOP｜バリー・ボンズから現役まで歴代シーズン最高OPS
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        MLB（メジャーリーグ）歴代シーズンOPSの上位を整理しました。
        <strong>バリー・ボンズ、ベーブ・ルース、テッド・ウィリアムズ</strong>
        といった伝説的なスラッガーが上位を占めており、シーズン1.300超えは野球の歴史を象徴する偉業です。
      </p>

      <p className="text-sm text-zinc-400 leading-6 mt-2">
        ※本記事の数値は規定打席到達者を対象としており、年度や情報源によって小数第3位以下が変動する場合があります。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">MLB歴代シーズンOPS上位</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  順位
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  選手
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  年度
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  OPS
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  備考
                </th>
              </tr>
            </thead>
            <tbody>
              {historicalRanking.map((row) => (
                <tr
                  key={`${row.player}-${row.year}`}
                  className="even:bg-zinc-800/50"
                >
                  <td className="px-3 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                    {row.rank}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-200 font-bold">
                    {row.player}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300 whitespace-nowrap">
                    {row.year}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-yellow-500 font-bold whitespace-nowrap">
                    {row.ops}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-400">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">現役MLB選手のOPS水準</h2>
        <p className="text-sm text-zinc-300 leading-6">
          シーズンを通して .900 以上を維持できればAll-Star級、 1.000
          を超えればMVP争い、 1.100
          を超えてくれば歴史的なシーズンとなります。MLBはNPBよりやや長打率（SLG）が出やすい傾向があるため、トップ選手のOPSは1.000前後で安定する年が多くなっています。
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
            href="/column/ops-max"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPSの最大値（マックス）</p>
            <p className="text-xs text-zinc-400 mt-1">理論値と歴史的最高記録</p>
          </Link>
          <Link
            href="/column/ops-1000"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPS 1.000 を超える選手</p>
            <p className="text-xs text-zinc-400 mt-1">「1超え」の意味</p>
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
