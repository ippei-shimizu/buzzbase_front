import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

type RankingRow = {
  player: string;
  year: string;
  slg: string;
  note: string;
};

const seasonRanking: RankingRow[] = [
  {
    player: "バリー・ボンズ",
    year: "2001",
    slg: ".863",
    note: "MLB シーズン長打率歴代最高。シーズン本塁打 73 本 (MLB 記録)",
  },
  {
    player: "ベーブ・ルース",
    year: "1920",
    slg: ".847",
    note: "本塁打 54 本 / 戦前の MLB を変えたシーズン",
  },
  {
    player: "ベーブ・ルース",
    year: "1921",
    slg: ".846",
    note: "本塁打 59 本 / 打点 168 / MVP 級シーズン",
  },
  {
    player: "バリー・ボンズ",
    year: "2004",
    slg: ".812",
    note: "OBP .609 (MLB 歴代最高) と同年達成",
  },
  {
    player: "バリー・ボンズ",
    year: "2002",
    slg: ".799",
    note: "打率 .370 / 198 四球",
  },
];

const careerTop = [
  {
    label: "ベーブ・ルース",
    note: "通算 .690 ／ MLB 通算長打率歴代 1 位",
  },
  {
    label: "テッド・ウィリアムズ",
    note: "通算 .634 ／ 歴代 2 位",
  },
  {
    label: "ルー・ゲーリッグ",
    note: "通算 .632 ／ 歴代 3 位",
  },
  {
    label: "ジミー・フォックス",
    note: "通算 .609 ／ 戦前のスラッガーを代表する打者",
  },
  {
    label: "バリー・ボンズ",
    note: "通算 .607 ／ シーズン記録は歴代最高 .863",
  },
];

const faqItems = [
  {
    question: "MLB シーズン長打率の歴代最高は？",
    answer:
      "2001 年のバリー・ボンズの .863 が MLB シーズン歴代最高。同年は本塁打 73 本の MLB 記録も達成しています。",
  },
  {
    question: "通算長打率の歴代 1 位は？",
    answer:
      "ベーブ・ルースの .690 が MLB 通算長打率の歴代 1 位。シーズン .847 / .846 を 2 年連続でマークし、戦前の MLB を変えたスラッガーです。",
  },
  {
    question: "MLB 現役選手の長打率の目安は？",
    answer:
      "リーグ平均が .395〜.415 程度で推移する MLB では、シーズン .500 で All-Star 級、.550 を超えれば MVP 候補。.600 以上は MVP 受賞最有力ラインです。",
  },
];

export default function SlgRankingMlbColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="MLB 長打率ランキング｜歴代シーズン上位とキャリア通算 TOP"
        description="MLB の歴代シーズン長打率と通算長打率の TOP 級を整理。バリー・ボンズ、ベーブ・ルース、テッド・ウィリアムズらの記録。"
        path="/column/slg-ranking-mlb"
        breadcrumbLeafName="MLB 長打率ランキング"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "MLB 長打率ランキング" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        MLB 長打率ランキング｜歴代シーズン上位とキャリア通算 TOP
      </h1>

      <p className="mt-4 text-sm text-zinc-300 leading-6">
        MLB（メジャーリーグ）の歴代シーズン長打率と通算長打率の上位を整理しました。
        <strong>シーズン .800 超え</strong>は MLB
        史でもごく限られた打者しか達成しておらず、本塁打量産能力と打率を極限まで高めた選手の証です。
      </p>

      <p className="mt-2 text-sm text-zinc-400 leading-6">
        ※本記事の数値は MLB の公式統計ベースで、出典・カウント方法により小数第 3
        位以下が変動する場合があります。
      </p>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold">歴代上位シーズン長打率</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-zinc-700 text-sm">
            <thead>
              <tr className="bg-zinc-800">
                <th className="border-b border-zinc-700 px-3 py-2 text-left text-zinc-300">
                  選手
                </th>
                <th className="border-b border-zinc-700 px-3 py-2 text-left text-zinc-300">
                  年度
                </th>
                <th className="border-b border-zinc-700 px-3 py-2 text-left text-zinc-300">
                  長打率
                </th>
                <th className="border-b border-zinc-700 px-3 py-2 text-left text-zinc-300">
                  備考
                </th>
              </tr>
            </thead>
            <tbody>
              {seasonRanking.map((row) => (
                <tr
                  key={`${row.player}-${row.year}`}
                  className="even:bg-zinc-800/50"
                >
                  <td className="border-b border-zinc-700 px-3 py-2 font-bold text-zinc-200">
                    {row.player}
                  </td>
                  <td className="border-b border-zinc-700 px-3 py-2 whitespace-nowrap text-zinc-300">
                    {row.year}
                  </td>
                  <td className="border-b border-zinc-700 px-3 py-2 whitespace-nowrap font-bold text-yellow-500">
                    {row.slg}
                  </td>
                  <td className="border-b border-zinc-700 px-3 py-2 text-zinc-400">
                    {row.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          ※順位付けは省略。時代背景や規定打席の差があるため、参考値として扱ってください。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">通算長打率 TOP 級の名打者</h2>
        <ul className="ml-5 list-disc space-y-2 text-sm text-zinc-300 leading-6">
          {careerTop.map((player) => (
            <li key={player.label}>
              <strong>{player.label}</strong>: {player.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">MLB 現役選手の長打率の目安</h2>
        <p className="text-sm text-zinc-300 leading-6">
          近年の MLB はリーグ平均長打率が .395〜.415
          程度で推移しており、シーズンを通して .500 を維持できれば All-Star
          級、.550 を超えれば MVP 候補、.600 以上は MVP 受賞最有力ラインです。
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
              歴代シーズン上位とタイトル獲得者
            </p>
          </Link>
          <Link
            href="/column/npb-slg-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">NPB 長打率平均値の推移</p>
            <p className="mt-1 text-xs text-zinc-400">
              リーグ平均と歴代スラッガー
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
          <Link
            href="/column/slg-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">長打率の目安・基準</p>
            <p className="mt-1 text-xs text-zinc-400">
              .400/.450/.500/.550 の意味
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
