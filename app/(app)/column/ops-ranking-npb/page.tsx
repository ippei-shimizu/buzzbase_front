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
    player: "王 貞治",
    year: "1974",
    ops: "1.293",
    note: "本塁打49・出塁率.532",
  },
  {
    rank: 2,
    player: "バレンティン",
    year: "2013",
    ops: "1.234",
    note: "シーズン本塁打60本の年",
  },
  {
    rank: 3,
    player: "落合 博満",
    year: "1985",
    ops: "1.207",
    note: "三冠王獲得シーズン",
  },
  { rank: 4, player: "ブーマー", year: "1984", ops: "1.198", note: "三冠王" },
  {
    rank: 5,
    player: "松井 秀喜",
    year: "2002",
    ops: "1.153",
    note: "本塁打50・打点107",
  },
  {
    rank: 6,
    player: "落合 博満",
    year: "1986",
    ops: "1.150",
    note: "三冠王（2年連続）",
  },
  {
    rank: 7,
    player: "アレックス・ラミレス",
    year: "2010",
    ops: "1.046",
    note: "ヤクルト時代の最高シーズン",
  },
  {
    rank: 8,
    player: "T-岡田",
    year: "2010",
    ops: "1.024",
    note: "本塁打33・若き本塁打王",
  },
];

const faqItems = [
  {
    question: "NPB歴代最高シーズンOPSは誰？",
    answer:
      "王貞治の1974年シーズン（OPS 1.293）が歴代最高クラスとされています。バレンティンの2013年（1.234）や落合博満の1985年（1.207）も近い水準です。",
  },
  {
    question: "現役NPB選手のOPSの目安は？",
    answer:
      "リーグを代表する打者は .900 を超え、好打者ラインは .800、平均的なレギュラーは .700 前後です。タイトル争いには .900 以上が必要になる年が多くなります。",
  },
];

export default function OpsRankingNpbColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="NPB OPSランキング｜歴代シーズン上位と現役主要選手の目安"
        description="NPB歴代シーズンOPSランキングと現役主力打者のOPS水準を整理。"
        path="/column/ops-ranking-npb"
        breadcrumbLeafName="NPB OPSランキング"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "NPB OPSランキング" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        NPB OPSランキング｜歴代シーズン上位と現役主要選手の目安
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        NPB（日本プロ野球）の歴代シーズンOPS上位を整理しました。
        <strong>1.000を超えるシーズン</strong>
        は歴代でも限られており、リーグを代表する超一流打者の証です。記録は年度・球団・規定打席のカウントによって若干の差があります。
      </p>

      <p className="text-sm text-zinc-400 leading-6 mt-2">
        ※本記事の数値はシーズン規定打席到達者を対象としており、年度や情報源によって小数第3位以下が変動する場合があります。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">歴代シーズンOPS上位</h2>
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
        <h2 className="text-xl font-bold mb-3">現役NPB選手のOPSの目安</h2>
        <p className="text-sm text-zinc-300 leading-6">
          シーズンを通して .900 を維持できれば各球団の主軸クラス、 1.000
          を超えれば打撃部門のタイトル候補。リーグ平均はおおむね .700
          前後で推移し、レギュラー定着のラインは .700 〜 .750 が目安になります。
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
            href="/column/ops-ranking-mlb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">MLB OPS 歴代TOP30</p>
            <p className="text-xs text-zinc-400 mt-1">
              バリー・ボンズから現役まで
            </p>
          </Link>
          <Link
            href="/column/npb-ops-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB OPS平均値の推移</p>
            <p className="text-xs text-zinc-400 mt-1">
              リーグ平均と歴代スラッガー
            </p>
          </Link>
          <Link
            href="/column/ops"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPSとは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法・読み方</p>
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
        </div>
      </section>
    </>
  );
}
