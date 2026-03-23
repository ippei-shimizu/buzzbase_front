import Link from "next/link";
import AdBanner from "@app/components/ad/AdBanner";
import { adSlots } from "@app/components/ad/adConfig";
import CtaBanner from "../../_components/CtaBanner";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import OpsColumnJsonLd from "./_components/OpsColumnJsonLd";

const faqItems = [
  {
    question: "OPSが高いとどうなる？",
    answer:
      "OPSが高い打者はチームの得点力に大きく貢献します。OPSは出塁率と長打率の合計なので、「塁に出る力」と「遠くに飛ばす力」の両方が優れていることを意味します。OPSが.800以上なら優秀、.900以上ならチームの中心打者レベルです。",
  },
  {
    question: "OPS 1.000超えはどのくらいすごい？",
    answer:
      "OPS 1.000超えはプロ野球（NPB）でもシーズンを通して達成できる選手は数人程度で、リーグを代表するスラッガーの証です。MLBでも同様に、MVP候補に挙がるようなトップクラスの打者が記録する数値です。",
  },
  {
    question: "OPSと打率の違いは？",
    answer:
      "打率は「安打数÷打数」で安打を打つ確率だけを評価します。一方OPSは出塁率（四球や死球も含む）と長打率（打撃の威力）を合算した指標で、打者の総合的な攻撃力をより正確に評価できます。打率.280でも四球が多く長打力がある打者はOPSが高くなります。",
  },
  {
    question: "高校野球のOPSの目安は？",
    answer:
      "高校野球では金属バットを使用するためプロ野球より数値が高くなる傾向があります。一般的に.700以上で平均的、.800以上で好打者、.900以上で強打者、1.000を超えると地区を代表するレベルの打者といえます。",
  },
];

export default function OpsColumnPage() {
  return (
    <>
      <OpsColumnJsonLd faq={faqItems} />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "OPSとは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        OPSとは？意味・計算方法・高校野球/プロ野球の目安を解説
      </h1>

      {/* リード文 */}
      <p className="text-sm text-zinc-300 leading-6 mt-4">
        OPS（オーピーエス）とは、
        <strong>出塁率と長打率を足し合わせた野球の打撃指標</strong>
        です。打者の「塁に出る力」と「長打を打つ力」を1つの数値で総合評価できるため、プロ野球から高校野球まで幅広く使われています。この記事では、OPSの意味・計算方法・レベル別の目安値を詳しく解説します。
      </p>

      {/* 目次 */}
      <nav className="mt-6 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
        <p className="font-bold text-sm mb-3">目次</p>
        <ol className="list-decimal list-inside text-sm text-zinc-300 space-y-2">
          <li>
            <a
              href="#meaning"
              className="hover:text-yellow-500 transition-colors"
            >
              OPSの意味
            </a>
          </li>
          <li>
            <a
              href="#calculation"
              className="hover:text-yellow-500 transition-colors"
            >
              OPSの計算方法と計算例
            </a>
          </li>
          <li>
            <a
              href="#benchmarks"
              className="hover:text-yellow-500 transition-colors"
            >
              OPSの目安値・評価基準
            </a>
          </li>
          <li>
            <a href="#faq" className="hover:text-yellow-500 transition-colors">
              よくある質問
            </a>
          </li>
          <li>
            <a
              href="#related"
              className="hover:text-yellow-500 transition-colors"
            >
              関連指標
            </a>
          </li>
        </ol>
      </nav>

      {/* OPSの意味 */}
      <section id="meaning" className="mt-10">
        <h2 className="text-xl font-bold mb-4">OPSの意味</h2>
        <p className="text-sm text-zinc-300 leading-6">
          OPSは「On-base Plus
          Slugging」の略で、出塁率（OBP）と長打率（SLG）を合算した指標です。
        </p>
        <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-yellow-500 font-mono font-bold text-center">
            OPS = 出塁率（OBP） + 長打率（SLG）
          </p>
        </div>
        <p className="text-sm text-zinc-300 leading-6 mt-4">
          打率が「ヒットを打つ確率」だけを測るのに対し、OPSは
          <strong>四球による出塁</strong>や<strong>長打の威力</strong>
          も反映するため、打者の攻撃力をより総合的に評価できます。セイバーメトリクス（データ分析による野球の科学的評価）の普及とともに、チーム得点との相関が高い指標として注目されるようになりました。
        </p>
        <p className="text-sm text-zinc-300 leading-6 mt-3">
          NPB（日本プロ野球）やMLB（メジャーリーグ）のデータ分析においても、打者の貢献度を測る基本指標として広く活用されています。
        </p>
      </section>

      {/* 計算方法 + 計算例 */}
      <section id="calculation" className="mt-10">
        <h2 className="text-xl font-bold mb-4">OPSの計算方法と計算例</h2>
        <p className="text-sm text-zinc-300 leading-6">
          OPSは出塁率と長打率をそれぞれ計算し、その合計で求めます。
        </p>

        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="text-xs text-zinc-400 mb-1">出塁率の計算式</p>
            <p className="text-yellow-500 font-mono text-sm">
              出塁率 =（安打 + 四球 + 死球）÷（打数 + 四球 + 死球 + 犠飛）
            </p>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <p className="text-xs text-zinc-400 mb-1">長打率の計算式</p>
            <p className="text-yellow-500 font-mono text-sm">
              長打率 = 塁打数 ÷ 打数
            </p>
          </div>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">計算例</h3>
        <p className="text-sm text-zinc-300 leading-6">
          ある打者のシーズン成績が以下の場合:
        </p>
        <ul className="text-sm text-zinc-300 leading-6 mt-2 ml-4 list-disc space-y-1">
          <li>打数: 400、安打: 120、四球: 50、死球: 5、犠飛: 8</li>
          <li>塁打数: 200</li>
        </ul>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4 space-y-2">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">出塁率 =</span> （120 + 50 +
            5）÷（400 + 50 + 5 + 8）={" "}
            <span className="text-yellow-500 font-bold">.378</span>
          </p>
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">長打率 =</span> 200 ÷ 400 ={" "}
            <span className="text-yellow-500 font-bold">.500</span>
          </p>
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">OPS =</span> .378 + .500 ={" "}
            <span className="text-yellow-500 font-bold text-base">.878</span>
          </p>
        </div>

        <p className="text-sm text-zinc-300 leading-6 mt-4">
          自分の成績からOPSを計算したい場合は、無料の計算ツールを使えば数値を入力するだけで瞬時に算出できます。
        </p>
        <Link
          href="/tools/ops"
          className="inline-flex items-center gap-1 mt-3 text-sm text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
        >
          OPS計算ツールで今すぐ計算する &rarr;
        </Link>
      </section>

      <AdBanner slot={adSlots.columnMiddle} className="mt-8" />

      {/* 目安値・評価基準 */}
      <section id="benchmarks" className="mt-10">
        <h2 className="text-xl font-bold mb-4">OPSの目安値・評価基準</h2>
        <p className="text-sm text-zinc-300 leading-6 mb-4">
          OPSの評価基準はカテゴリによって異なります。以下にプロ野球（NPB）と高校野球の目安を示します。
        </p>

        <h3 className="font-bold text-base mb-3">プロ野球（NPB）のOPS目安</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  評価
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  OPS
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  説明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  A（素晴らしい）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .900以上
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  リーグを代表するスラッガー。MVP候補クラス
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  B（優秀）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .800〜.899
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  クリーンアップを任せられる好打者
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  C（平均的）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .700〜.799
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  リーグ平均前後。レギュラーとして標準的
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  D（要改善）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .700未満
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  打撃面での貢献が低い。守備や走塁で補う必要あり
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">
          高校野球・中学野球のOPS目安
        </h3>
        <p className="text-sm text-zinc-300 leading-6 mb-3">
          高校野球・中学野球では金属バットを使用するため、プロ野球より全体的に数値が高くなる傾向があります。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  評価
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  OPS
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  説明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  優秀
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .900以上
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  地区大会で上位を狙える強打者
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  平均的
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .700〜.899
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  レギュラーとして標準的なレベル
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  要改善
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .700未満
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  出塁率・長打率の両方を上げる練習が必要
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 計算ツールCTA */}
        <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
          <p className="text-lg font-bold mb-2">今すぐ自分のOPSを計算する</p>
          <p className="text-sm text-zinc-300 mb-4">
            安打数・打数・四球・死球・塁打数を入力するだけでOPS・出塁率・長打率を一括自動計算。登録不要・完全無料。
          </p>
          <Link
            href="/tools/ops"
            className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
          >
            OPS計算ツールを使う &rarr;
          </Link>
        </div>
      </section>

      <AdBanner slot={adSlots.columnBottom} className="mt-8" />

      {/* よくある質問 */}
      <section id="faq" className="mt-10">
        <h2 className="text-xl font-bold mb-4">よくある質問</h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-lg border border-zinc-700 bg-zinc-800/50"
            >
              <summary className="cursor-pointer px-5 py-3 text-sm font-bold text-zinc-200 flex items-center justify-between">
                {item.question}
                <span className="text-zinc-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="px-5 pb-4 text-sm text-zinc-300 leading-6">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 関連指標 */}
      <section id="related" className="mt-10">
        <h2 className="text-xl font-bold mb-4">関連指標</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/tools/obp"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">出塁率（OBP）</p>
            <p className="text-xs text-zinc-400 mt-1">
              四球・死球を含む出塁能力を評価
            </p>
          </Link>
          <Link
            href="/tools/slugging"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">長打率（SLG）</p>
            <p className="text-xs text-zinc-400 mt-1">
              打撃の威力・長打力を数値化
            </p>
          </Link>
          <Link
            href="/tools/batting-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率（AVG）</p>
            <p className="text-xs text-zinc-400 mt-1">最も基本的な打撃指標</p>
          </Link>
        </div>
      </section>

      {/* BUZZ BASE登録CTA */}
      <CtaBanner
        className="mt-10"
        heading="チームの成績をまとめて管理するなら"
        body="BUZZ BASEなら試合結果を入力するだけで、OPSを含む全29指標を自動算出。チームメイトとランキング形式で成績を共有できます。完全無料。"
        buttonText="無料で始める（30秒で登録）"
      />

      <AdBanner
        slot={adSlots.columnHorizontal}
        format="horizontal"
        className="mt-8"
      />
    </>
  );
}
