import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

type RankingRow = {
  player: string;
  year: string;
  obp: string;
  note: string;
};

const seasonRanking: RankingRow[] = [
  {
    player: "バリー・ボンズ",
    year: "2004",
    obp: ".609",
    note: "MLB シーズン出塁率歴代最高。232 四球の歴代最多記録も同時達成",
  },
  {
    player: "バリー・ボンズ",
    year: "2002",
    obp: ".582",
    note: "打率 .370 ／ 198 四球。MVP",
  },
  {
    player: "テッド・ウィリアムズ",
    year: "1941",
    obp: ".553",
    note: "シーズン打率 .406（MLB 史上最後の 4 割打者）",
  },
  {
    player: "ジョン・マッグロー",
    year: "1899",
    obp: ".547",
    note: "19 世紀の伝説的選手・後の名将",
  },
  {
    player: "バリー・ボンズ",
    year: "2003",
    obp: ".529",
    note: "打率 .341 ／ 148 四球。MVP",
  },
];

const careerTop = [
  {
    label: "テッド・ウィリアムズ",
    note: "通算 .482 ／ MLB 通算出塁率歴代 1 位",
  },
  {
    label: "ベーブ・ルース",
    note: "通算 .474 ／ 歴代 2 位。本塁打王 12 回",
  },
  {
    label: "ジョン・マッグロー",
    note: "通算 .466 ／ 歴代 3 位",
  },
  {
    label: "バリー・ボンズ",
    note: "通算 .444 ／ シーズン記録は歴代最高 .609",
  },
  {
    label: "ロジャース・ホーンスビー",
    note: "通算 .434 ／ 史上有数の二塁手",
  },
];

const faqItems = [
  {
    question: "MLB シーズン出塁率の歴代最高は？",
    answer:
      "2004 年のバリー・ボンズの .609 が MLB シーズン歴代最高。同年は 232 四球の歴代記録も達成しています。",
  },
  {
    question: "通算出塁率の歴代 1 位は？",
    answer:
      "テッド・ウィリアムズの .482 が MLB 通算出塁率の歴代 1 位。打率の高さに加え、シーズン四球率の高さでも知られた選手です。",
  },
  {
    question: "MLB 現役選手の出塁率の目安は？",
    answer:
      "リーグ平均が .315〜.325 程度で推移する MLB では、シーズン .380 で All-Star 級、.400 を超えれば MVP 級。.420 以上は MVP 受賞最有力ラインです。",
  },
];

export default function ObpRankingMlbColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="MLB 出塁率ランキング｜歴代シーズン上位とキャリア通算 TOP"
        description="MLB の歴代シーズン出塁率と通算出塁率の TOP 級を整理。テッド・ウィリアムズ、ベーブ・ルース、バリー・ボンズらの記録を解説。"
        path="/column/obp-ranking-mlb"
        breadcrumbLeafName="MLB 出塁率ランキング"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "MLB 出塁率ランキング" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        MLB 出塁率ランキング｜歴代シーズン上位とキャリア通算 TOP
      </h1>

      <p className="mt-4 text-sm text-zinc-300 leading-6">
        MLB（メジャーリーグ）の歴代シーズン出塁率と通算出塁率の上位を整理しました。
        <strong>シーズン .500 超え</strong>は MLB
        史でも限られた打者しか達成しておらず、四球率と打率の両方を極限まで高めた選手の証です。
      </p>

      <p className="mt-2 text-sm text-zinc-400 leading-6">
        ※本記事の数値は MLB の公式統計ベースで、出典・カウント方法により小数第 3
        位以下が変動する場合があります。
      </p>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-bold">歴代上位シーズン出塁率</h2>
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
                  出塁率
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
                    {row.obp}
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
        <h2 className="mb-3 text-xl font-bold">通算出塁率 TOP 級の名打者</h2>
        <ul className="ml-5 list-disc space-y-2 text-sm text-zinc-300 leading-6">
          {careerTop.map((player) => (
            <li key={player.label}>
              <strong>{player.label}</strong>: {player.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">MLB 現役選手の出塁率の目安</h2>
        <p className="text-sm text-zinc-300 leading-6">
          近年の MLB はリーグ平均出塁率が .315〜.325
          程度で推移しており、シーズンを通して .380 を維持できれば All-Star
          級、.400 を超えれば MVP 級、.420 以上は MVP 受賞最有力ラインです。
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
            href="/column/npb-obp-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">NPB 出塁率平均値の推移</p>
            <p className="mt-1 text-xs text-zinc-400">リーグ平均と最高出塁率</p>
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
          <Link
            href="/column/obp-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">出塁率の目安・基準</p>
            <p className="mt-1 text-xs text-zinc-400">
              .350/.380/.400/.420 の意味
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
