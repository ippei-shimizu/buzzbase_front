import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "長打率（SLG）の読み方は？",
    answer:
      "「ちょうだりつ」と読みます。英語では Slugging Percentage、略して SLG と表記されます。",
  },
  {
    question: "長打率と打率の違いは？",
    answer:
      "打率はすべての安打を等しく「1」として扱います（単打も本塁打も同じ価値）。一方、長打率は単打を 1、二塁打を 2、三塁打を 3、本塁打を 4 として塁打数を合計し、打数で割って計算するため、長打の価値を高く評価します。",
  },
  {
    question: "長打率の計算方法は？",
    answer:
      "長打率 = 塁打数 ÷ 打数で計算します。塁打数は単打×1 + 二塁打×2 + 三塁打×3 + 本塁打×4 の合計です。たとえば 150 打数で単打 30 本・二塁打 10 本・三塁打 2 本・本塁打 5 本なら、塁打数 = 30 + 20 + 6 + 20 = 76、長打率 = 76 ÷ 150 = .507 です。",
  },
  {
    question: "NPB のリーグ平均長打率はどれくらい？",
    answer:
      "NPB のリーグ平均長打率は概ね .360〜.400 の範囲で推移します。.450 を超えれば好打者、.500 を超えれば中心打者、.550 以上はリーグ代表級の長打力です。",
  },
  {
    question: "長打率と OPS の関係は？",
    answer:
      "OPS = 出塁率 + 長打率で、長打率は OPS の構成要素の一つです。出塁率と長打率を同じ比重で足し合わせるため、長打率を伸ばすことは OPS を大きく押し上げる近道になります。",
  },
  {
    question: "ISO（純粋長打力）との違いは？",
    answer:
      "ISO（Isolated Power）= 長打率 - 打率で、安打の中での長打の比率だけを取り出した指標です。長打率は単打も含む総合長打力、ISO は単打を除いた純粋な長打力を表します。",
  },
  {
    question: "中学野球・高校野球の長打率の目安は？",
    answer:
      "中学野球は金属バットで打高傾向のため .400 を超えれば中軸、.450 を超えれば 4 番候補。高校野球も金属バットで打高、地方大会レギュラーで .400 前後、甲子園レベルの中軸打者は .500 を超えることもあります。",
  },
  {
    question: "MLB と NPB で長打率の傾向は違う？",
    answer:
      "MLB のリーグ平均長打率は .395〜.415 程度で NPB よりやや高めです。本塁打が出やすい球場環境と打球速度の高さが背景にあります。タイトル獲得ラインは MLB が .600 前後、NPB が .550〜.600 とほぼ同水準です。",
  },
  {
    question: "ポジション別の長打率の目安は？",
    answer:
      "コーナー（一塁手・三塁手・外野コーナー）は打撃を強く期待されるため .450 以上を目安、センターラインは .380 以上、捕手は .350〜.400 が標準。守備負担と長打力のバランスでポジションごとに期待値が異なります。",
  },
];

const benchmarks = [
  {
    level: "S",
    range: ".550 以上",
    label: "歴代級",
    description: "本塁打王・MVP を狙えるリーグトップクラスの長打力",
  },
  {
    level: "A",
    range: ".500〜.549",
    label: "中心打者",
    description: "クリーンアップ標準。年間 20 本塁打以上が見える長打力",
  },
  {
    level: "B",
    range: ".450〜.499",
    label: "好打者",
    description: "上位レギュラー。アベレージと長打のバランス型",
  },
  {
    level: "C",
    range: ".380〜.449",
    label: "平均",
    description: "リーグ平均前後。レギュラーとして標準的",
  },
  {
    level: "D",
    range: ".380 未満",
    label: "要改善",
    description: "長打力不足。打率を維持しながら長打を増やす技術改善が必要",
  },
];

export default function SlgColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="長打率（SLG・ちょうだりつ）とは？意味・計算方法・目安をわかりやすく解説"
        description="長打率（SLG）の読み方・意味・計算式・評価基準を解説。打率・OPS との違い、ポジション別の基準まで整理。"
        path="/column/slg"
        breadcrumbLeafName="長打率（SLG）とは"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "長打率（SLG）とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        長打率（SLG・ちょうだりつ）とは？意味・計算方法・目安をわかりやすく解説
      </h1>

      <p className="mt-4 text-sm text-zinc-300 leading-6">
        長打率（SLG: Slugging Percentage）は、
        <strong>打者が 1 打数あたりに稼ぐ塁打数の平均</strong>
        を示す指標です。打率がすべての安打を等しく「1」として扱うのに対し、長打率は二塁打以上の長打をより高く評価するため、打者の長打力を正確に反映できます。OPS
        の構成要素としてもセイバーメトリクスで重視される指標です。
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">長打率の計算式</h2>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-200">
            <strong>長打率 = 塁打数 ÷ 打数</strong>
          </p>
          <p className="mt-2 text-sm text-zinc-400 leading-6">
            塁打数 = 単打×1 + 二塁打×2 + 三塁打×3 + 本塁打×4
          </p>
        </div>
        <p className="mt-3 text-sm text-zinc-300 leading-6">
          四球・死球・犠打・犠飛は打数に含まれません。長打率は分母が打率と同じ「打数」のため、選球眼（四球数）は反映されない点に注意してください。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">計算例</h2>
        <h3 className="mt-4 mb-2 text-base font-bold">
          例①: 中心打者（長打型）
        </h3>
        <p className="text-sm text-zinc-300 leading-6">
          150 打数、単打 30 本・二塁打 10 本・三塁打 2 本・本塁打 5 本の場合:
        </p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-300">
            塁打数 = 30 + 20 + 6 + 20 = 76
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            <span className="text-zinc-400">長打率 =</span> 76 ÷ 150 ={" "}
            <span className="font-bold text-yellow-500">.507</span>
          </p>
        </div>

        <h3 className="mt-6 mb-2 text-base font-bold">
          例②: アベレージヒッター（単打型）
        </h3>
        <p className="text-sm text-zinc-300 leading-6">
          200 打数、単打 50 本・二塁打 5 本・本塁打 1 本の場合:
        </p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-300">塁打数 = 50 + 10 + 4 = 64</p>
          <p className="mt-1 text-sm text-zinc-300">
            <span className="text-zinc-400">長打率 =</span> 64 ÷ 200 ={" "}
            <span className="font-bold text-yellow-500">.320</span>
          </p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">打率との違い</h2>
        <p className="text-sm text-zinc-300 leading-6">
          打率は安打の質を区別しません（単打も本塁打も同じ価値）。長打率は長打の価値を高く評価するため、同じ打率でも長打が多い打者の長打率は高くなります。たとえば同じ打率
          .300 でも、ホームラン量産型なら長打率 .550、単打型なら長打率 .380
          という差が出ます。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">長打率の目安（NPB 基準）</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-zinc-700 text-sm">
            <thead>
              <tr className="bg-zinc-800">
                <th className="border-b border-zinc-700 px-4 py-2 text-left text-zinc-300">
                  評価
                </th>
                <th className="border-b border-zinc-700 px-4 py-2 text-left text-zinc-300">
                  長打率
                </th>
                <th className="border-b border-zinc-700 px-4 py-2 text-left text-zinc-300">
                  ラベル
                </th>
                <th className="border-b border-zinc-700 px-4 py-2 text-left text-zinc-300">
                  目安
                </th>
              </tr>
            </thead>
            <tbody>
              {benchmarks.map((row) => (
                <tr key={row.level} className="even:bg-zinc-800/50">
                  <td className="border-b border-zinc-700 px-4 py-2 font-bold text-yellow-500">
                    {row.level}
                  </td>
                  <td className="border-b border-zinc-700 px-4 py-2 whitespace-nowrap text-zinc-300">
                    {row.range}
                  </td>
                  <td className="border-b border-zinc-700 px-4 py-2 text-zinc-200">
                    {row.label}
                  </td>
                  <td className="border-b border-zinc-700 px-4 py-2 text-zinc-400">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            href="/column/slg-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">長打率の目安・基準</p>
            <p className="mt-1 text-xs text-zinc-400">
              レベル別の意味・ポジション別
            </p>
          </Link>
          <Link
            href="/column/slg-500"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">長打率 .500 とは</p>
            <p className="mt-1 text-xs text-zinc-400">中心打者ライン</p>
          </Link>
          <Link
            href="/column/ops"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">OPS とは（基本記事）</p>
            <p className="mt-1 text-xs text-zinc-400">出塁率 + 長打率</p>
          </Link>
          <Link
            href="/column/slg-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">NPB 長打率ランキング</p>
            <p className="mt-1 text-xs text-zinc-400">歴代上位のスラッガー</p>
          </Link>
        </div>
      </section>
    </>
  );
}
