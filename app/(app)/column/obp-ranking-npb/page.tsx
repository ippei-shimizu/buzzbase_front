import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

type RankingRow = {
  player: string;
  year: string;
  obp: string;
  note: string;
};

const historicalSeasons: RankingRow[] = [
  {
    player: "王 貞治",
    year: "1974",
    obp: ".532",
    note: "NPB 歴代最高シーズン出塁率。三冠王 (.332/49HR/107打点)",
  },
  {
    player: "落合 博満",
    year: "1986",
    obp: ".487",
    note: "2 年連続 3 度目の三冠王 (.360/50HR/116打点)",
  },
  {
    player: "ランディ・バース",
    year: "1986",
    obp: ".481",
    note: "2 年連続三冠王 (.389/47HR/109打点)",
  },
  {
    player: "イチロー",
    year: "1994",
    obp: ".445",
    note: "シーズン 210 安打の日本記録 (.385) 達成年",
  },
  {
    player: "松井 秀喜",
    year: "2002",
    obp: ".461",
    note: "本塁打王・打点王・最高出塁率・MVP (50HR/107打点)",
  },
];

const notableTitleHolders = [
  {
    label: "イチロー (1994〜2000, オリックス)",
    note: "首位打者 7 連覇期にリーグ最高出塁率の常連。.400 超えシーズン複数",
  },
  {
    label: "青木 宣親 (ヤクルト)",
    note: "首位打者 2 回・最高出塁率複数回。NPB 復帰後も .400 超えを記録するシーズンあり",
  },
  {
    label: "糸井 嘉男 (オリックス・阪神ほか)",
    note: "最高出塁率タイトル複数回。打率・四球バランス型の典型",
  },
  {
    label: "柳田 悠岐 (ソフトバンク)",
    note: "OPS 1.000 超え 4 シーズンを記録した期間中、出塁率も .450 前後を維持",
  },
  {
    label: "近藤 健介 (日本ハム → ソフトバンク)",
    note: "近年の最高出塁率タイトル常連。選球眼に優れたリードオフ型",
  },
];

const faqItems = [
  {
    question: "NPB 歴代シーズン最高出塁率は誰？",
    answer:
      "1974 年の王貞治の出塁率 .532 が NPB 歴代最高。三冠王 (.332/49HR/107打点) を達成したシーズンで、半世紀以上更新されていない記録です。",
  },
  {
    question: "現役 NPB 選手の出塁率の目安は？",
    answer:
      "リーグ平均が .310〜.330 で推移する中、.380 を超えれば各球団の中軸、.400 を超えればリーグ最高出塁率タイトル争い、.420 以上は MVP 級の偉業です。",
  },
  {
    question: "最高出塁率タイトル獲得には何が必要？",
    answer:
      "規定打席に到達した上で、リーグでシーズン出塁率 1 位になることが条件です。打率と四球数のバランス、シーズンを通した接触の質、選球眼の安定が鍵です。",
  },
];

export default function ObpRankingNpbColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="NPB 出塁率ランキング｜歴代シーズン上位と最高出塁率タイトル獲得者"
        description="NPB 歴代シーズン出塁率上位と、最高出塁率タイトル獲得者・現役主力打者の水準を整理。"
        path="/column/obp-ranking-npb"
        breadcrumbLeafName="NPB 出塁率ランキング"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "NPB 出塁率ランキング" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        NPB 出塁率ランキング｜歴代シーズン上位と最高出塁率タイトル獲得者
      </h1>

      <p className="mt-4 text-sm text-zinc-300 leading-6">
        NPB（日本プロ野球）の歴代シーズン出塁率の上位を整理しました。
        <strong>.400 を超えるシーズン</strong>
        は歴代でも限られており、各球団の中軸打者・リードオフマンとして活躍した一流打者の証です。
      </p>

      <p className="mt-2 text-sm text-zinc-400 leading-6">
        ※本記事の数値はシーズン規定打席到達者を対象としており、出典・年度によって小数第
        3 位以下が変動する場合があります。
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
          ※順位付けは省略。年度別の比較には規定打席や時代背景の差があるため、参考値として扱ってください。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">
          最高出塁率タイトル獲得者・常連選手
        </h2>
        <ul className="ml-5 list-disc space-y-2 text-sm text-zinc-300 leading-6">
          {notableTitleHolders.map((holder) => (
            <li key={holder.label}>
              <strong>{holder.label}</strong>: {holder.note}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">現役 NPB 選手の出塁率の目安</h2>
        <p className="text-sm text-zinc-300 leading-6">
          近年の NPB はリーグ平均出塁率が .310〜.330
          程度で推移しており、シーズンを通して .380
          を維持できれば各球団の中軸クラス、.400
          を超えればタイトル争いに絡める水準です。.420 以上はリーグでも年間
          0〜数人レベルに限られます。
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
            href="/column/obp-ranking-mlb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">MLB 出塁率ランキング</p>
            <p className="mt-1 text-xs text-zinc-400">
              ボンズ・ルース・ウィリアムズ
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
