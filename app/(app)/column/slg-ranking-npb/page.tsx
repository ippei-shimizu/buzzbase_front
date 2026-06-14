import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

type RankingRow = {
  player: string;
  year: string;
  slg: string;
  note: string;
};

const historicalSeasons: RankingRow[] = [
  {
    player: "王 貞治",
    year: "1974",
    slg: ".761",
    note: "NPB 歴代最高シーズン長打率。三冠王 (.332/49HR/107打点)",
  },
  {
    player: "王 貞治",
    year: "1973",
    slg: ".761",
    note: "三冠王 (.355/51HR/114打点)",
  },
  {
    player: "落合 博満",
    year: "1985",
    slg: ".763",
    note: "三冠王 (.367/52HR/146打点)",
  },
  {
    player: "ランディ・バース",
    year: "1986",
    slg: ".777",
    note: "2 年連続三冠王 (.389/47HR/109打点)",
  },
  {
    player: "松井 秀喜",
    year: "2002",
    slg: ".692",
    note: "本塁打王・打点王・最高出塁率・MVP (50HR/107打点)",
  },
];

const notableSluggers = [
  {
    label: "ランディ・バース (1985, 阪神)",
    note: "セ・リーグ外国人初の三冠王 (.350/54HR/134打点)",
  },
  {
    label: "ウラディミール・バレンティン (2013, ヤクルト)",
    note: "シーズン本塁打 60 本 / MVP / 長打率 .779",
  },
  {
    label: "ブーマー・ウェルズ (1984, 阪急)",
    note: "外国人選手初の三冠王 (.355/37HR/130打点)",
  },
  {
    label: "柳田 悠岐 (ソフトバンク)",
    note: "OPS 1.000 超え 4 シーズンの主力期、長打率 .600 前後をマーク",
  },
  {
    label: "ロベルト・ペタジーニ (2003, ヤクルト)",
    note: "長打率 .688 / OPS 1.139",
  },
  {
    label: "村上 宗隆 (2022, ヤクルト)",
    note: "三冠王 (.318/56HR/134打点) / 長打率 .710 でリーグ歴代上位",
  },
];

const faqItems = [
  {
    question: "NPB 歴代シーズン最高長打率は誰？",
    answer:
      "1974 年の王貞治の長打率 .761 が NPB 歴代最高クラス。三冠王 (.332/49HR/107打点) を達成したシーズンで、半世紀以上のあいだ歴代上位の地位を保ち続けています。",
  },
  {
    question: "現役 NPB 選手の長打率の目安は？",
    answer:
      "リーグ平均が .360〜.400 で推移する中、.450 を超えれば上位レギュラー、.500 を超えれば各球団の中軸、.550 以上なら本塁打王・MVP 級。.700 を超えるシーズンは歴代でも限られています。",
  },
  {
    question: "本塁打王と長打率タイトルは一致する？",
    answer:
      "高い相関がありますが完全一致ではありません。本塁打王は本塁打の絶対数、長打率は打数あたりの塁打数で評価するため、打数が少ない打者は本塁打数が劣っても長打率で上回ることがあります。",
  },
];

export default function SlgRankingNpbColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="NPB 長打率ランキング｜歴代シーズン上位と本塁打王・MVP 級スラッガー"
        description="NPB 歴代シーズン長打率上位と、本塁打王・MVP 級スラッガー・現役主力打者の水準を整理。"
        path="/column/slg-ranking-npb"
        breadcrumbLeafName="NPB 長打率ランキング"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "NPB 長打率ランキング" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        NPB 長打率ランキング｜歴代シーズン上位と本塁打王・MVP 級スラッガー
      </h1>

      <p className="mt-4 text-sm text-zinc-300 leading-6">
        NPB（日本プロ野球）の歴代シーズン長打率の上位を整理しました。
        <strong>.700 を超えるシーズン</strong>
        は歴代でも限られており、本塁打王・MVP
        級の歴代スラッガーが残した記録です。
      </p>

      <p className="mt-2 text-sm text-zinc-400 leading-6">
        ※本記事の数値はシーズン規定打席到達者を対象としており、出典・年度によって小数第
        3 位以下が変動する場合があります。
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
              {historicalSeasons.map((row) => (
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
          ※順位付けは省略。年度別の比較には規定打席や時代背景の差があるため、参考値として扱ってください。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">
          他に語られることの多い高長打率シーズン
        </h2>
        <ul className="ml-5 list-disc space-y-2 text-sm text-zinc-300 leading-6">
          {notableSluggers.map((slugger) => (
            <li key={slugger.label}>
              <strong>{slugger.label}</strong>: {slugger.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">現役 NPB 選手の長打率の目安</h2>
        <p className="text-sm text-zinc-300 leading-6">
          近年の NPB はリーグ平均長打率が .360〜.400
          程度で推移しており、シーズンを通して .500
          を維持できれば各球団の中軸クラス、.550
          を超えればタイトル争いに絡める水準です。.700 超えはリーグでも年間
          0〜数人レベルに限られます。
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
            href="/column/slg-ranking-mlb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">MLB 長打率ランキング</p>
            <p className="mt-1 text-xs text-zinc-400">
              ボンズ・ルース・ウィリアムズ
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
