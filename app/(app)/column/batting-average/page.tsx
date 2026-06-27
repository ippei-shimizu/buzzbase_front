import Link from "next/link";
import AdBanner from "@app/components/ad/AdBanner";
import { adSlots } from "@app/components/ad/adConfig";
import CtaBanner from "../../_components/CtaBanner";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import BattingAverageColumnJsonLd from "./_components/BattingAverageColumnJsonLd";

const faqItems = [
  {
    question: "打率の読み方と英語表記は？",
    answer:
      "打率は「だりつ」と読み、英語の Batting Average（AVG、エーブイジー）の略です。安打を打つ確率を示し、野球で最も古くから使われている打撃指標です。",
  },
  {
    question: "打率3割とはどのくらいすごい？",
    answer:
      "プロ野球（NPB）では打率3割（.300）は好打者の証です。シーズンを通して3割を維持できる打者はリーグに数人〜10名前後で、クリーンアップを任せられる実力者です。首位打者争いは.330〜.350付近で展開されることが多く、.350を超えるとハイレベルなシーズンといえます。",
  },
  {
    question: "打率の出し方は？",
    answer:
      "打率は「安打数 ÷ 打数」で計算します。たとえば150打数45安打なら、45÷150=.300（3割）です。打数には四球・死球・犠打・犠飛は含まれません。小数第3位まで表記するのが一般的です。",
  },
  {
    question: "四球は打率に含まれる？",
    answer:
      "いいえ、四球（フォアボール）は打率の計算に含まれません。四球は「打数」にカウントされないため、打率には影響しません。四球を含めた出塁能力を評価するには出塁率（OBP）を使います。同様に、死球・犠打・犠飛・打撃妨害も打数には含まれません。",
  },
  {
    question: "打数と打席数の違いは？",
    answer:
      "打席数は打者がバッターボックスに入った全回数です。打数は打席数から四球、死球、犠打、犠飛、打撃妨害を除いた数です。たとえば10打席で四球が2回あった場合、打数は8になります。打率の計算には打数を使います。",
  },
  {
    question: "打率 .350 / .250 / .200 はそれぞれどんなレベル？",
    answer:
      ".350 以上は歴代首位打者級の偉業、.300 以上は好打者・クリーンアップライン、.280 は中堅レギュラー、.250 はリーグ平均、.200 を切るとレギュラー困難で守備・走塁での補完が必須レベルです。",
  },
  {
    question: "中学野球（シニア・ボーイズ）の打率目安は？",
    answer:
      "硬式リーグでは .300 以上でレギュラー、.350 以上でクリーンアップ、.400 を超えれば全国レベルの強打者の目安です。軟式中学野球では球速が抑えめのため、さらに数値が伸びる傾向があります。",
  },
  {
    question: "MLB と NPB で打率の基準は変わる？",
    answer:
      "MLB と NPB のリーグ平均はいずれも .240〜.260 で大きな差はありません。タイトル獲得ラインも MLB は .330 前後、NPB は .320〜.340 とほぼ同水準。基準（.300 で好打者・.350 で歴代級）も共通して使えます。",
  },
  {
    question: "ポジションによって打率の基準は違う？",
    answer:
      "捕手・遊撃手・二塁手などセンターラインのポジションは守備負担が大きいため、.260 前後でも十分な打撃力と評価されます。一塁手・指名打者・外野コーナーは打撃が期待されるため、.280 以上が標準ラインです。",
  },
];

export default function BattingAverageColumnPage() {
  return (
    <>
      <BattingAverageColumnJsonLd faq={faqItems} />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "打率とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        打率とは？計算方法・打率の出し方・目安値をわかりやすく解説
      </h1>

      {/* リード文 */}
      <p className="text-sm text-zinc-300 leading-6 mt-4">
        打率（読み方：<strong>だりつ</strong>、英語表記：
        <strong>AVG / Batting Average</strong>）とは、
        <strong>打者が打数に対してどれだけの割合で安打を打ったか</strong>
        を示す、野球で最も基本的な打撃指標です。「3割打者」という言葉に代表されるように、打率は打者の実力を測る第一歩として広く認知されています。この記事では、打率の意味・計算方法・打率の出し方・レベル別の目安値を詳しく解説します。
      </p>
      <p className="text-sm text-zinc-400 leading-6 mt-2">
        「打率はいくつから良いのか」「.250 / .280 / .300 /
        .350」の意味、ポジション別の目安を網羅した
        <Link
          href="/column/batting-average-criteria"
          className="text-yellow-500 hover:text-yellow-400 transition-colors font-bold"
        >
          打率の目安・基準を詳しく解説した記事
        </Link>
        も併せて参照してください。
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
              打率の意味
            </a>
          </li>
          <li>
            <a
              href="#calculation"
              className="hover:text-yellow-500 transition-colors"
            >
              打率の計算方法と計算例
            </a>
          </li>
          <li>
            <a
              href="#benchmarks"
              className="hover:text-yellow-500 transition-colors"
            >
              打率の目安値・評価基準
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

      {/* 打率の意味 */}
      <section id="meaning" className="mt-10">
        <h2 className="text-xl font-bold mb-4">打率の意味</h2>
        <p className="text-sm text-zinc-300 leading-6">
          打率は「Batting
          Average」の略で、打者が打数に対してどれだけの割合で安打（ヒット）を打ったかを示す指標です。
        </p>
        <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-yellow-500 font-mono font-bold text-center">
            打率 = 安打数 ÷ 打数
          </p>
        </div>
        <p className="text-sm text-zinc-300 leading-6 mt-4">
          19世紀のアメリカで考案されて以来、プロ野球（NPB・MLB）から高校野球、少年野球まで幅広い場面で使われている最も歴史の長い打撃指標です。「3割打者」は好打者の代名詞として広く知られており、打率は打者の実力を直感的に理解できる指標として親しまれています。
        </p>
        <p className="text-sm text-zinc-300 leading-6 mt-3">
          ただし、打率は安打のみを評価するため、四球による出塁は反映されません。打者の総合的な攻撃力を評価するには、出塁率（OBP）やOPSを併用するのが効果的です。
        </p>
      </section>

      {/* 計算方法 + 計算例 */}
      <section id="calculation" className="mt-10">
        <h2 className="text-xl font-bold mb-4">打率の計算方法と計算例</h2>
        <p className="text-sm text-zinc-300 leading-6">
          打率の計算式はシンプルで、安打数と打数の2つの数値がわかれば計算できます。
        </p>

        <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-xs text-zinc-400 mb-1">打率の計算式</p>
          <p className="text-yellow-500 font-mono text-sm">
            打率 = 安打数 ÷ 打数
          </p>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">
          計算例①：好打者（3割）
        </h3>
        <p className="text-sm text-zinc-300 leading-6">150打数45安打の場合:</p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">打率 =</span> 45 ÷ 150 ={" "}
            <span className="text-yellow-500 font-bold">.300（3割0分0厘）</span>
          </p>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">計算例②：平均的な打者</h3>
        <p className="text-sm text-zinc-300 leading-6">200打数50安打の場合:</p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">打率 =</span> 50 ÷ 200 ={" "}
            <span className="text-yellow-500 font-bold">.250（2割5分0厘）</span>
          </p>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">
          計算例③：打席数と打数が異なるケース
        </h3>
        <p className="text-sm text-zinc-300 leading-6">
          10打席で安打3本、四球2回、犠飛1回の場合:
        </p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4 space-y-2">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">打数 =</span> 10 - 2（四球）-
            1（犠飛）= <span className="text-yellow-500 font-bold">7</span>
          </p>
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">打率 =</span> 3 ÷ 7 ={" "}
            <span className="text-yellow-500 font-bold">.429（4割2分9厘）</span>
          </p>
        </div>
        <p className="text-xs text-zinc-400 mt-2">
          ※ 四球と犠飛は打数に含まれないため、打席数10と打数7は異なります。
        </p>

        <h3 className="font-bold text-base mt-6 mb-3">打数と打席数の違い</h3>
        <p className="text-sm text-zinc-300 leading-6">
          打率の計算で使う「打数」と「打席数」は異なる概念です。打席数から以下を除いたものが打数になります:
        </p>
        <ul className="text-sm text-zinc-300 leading-6 mt-2 ml-4 list-disc space-y-1">
          <li>四球（フォアボール）</li>
          <li>死球（デッドボール）</li>
          <li>犠打（バント）</li>
          <li>犠飛（犠牲フライ）</li>
          <li>打撃妨害</li>
        </ul>
        <p className="text-sm text-zinc-300 leading-6 mt-3">
          つまり、打者が自らバットを振って結果を出した打席のみが「打数」としてカウントされます。選球眼が良く四球を多く選ぶ打者は、打率以上に出塁率が高くなります。
        </p>

        <p className="text-sm text-zinc-300 leading-6 mt-4">
          自分の成績から打率を計算したい場合は、無料の計算ツールを使えば数値を入力するだけで瞬時に算出できます。
        </p>
        <Link
          href="/tools/batting-average"
          className="inline-flex items-center gap-1 mt-3 text-sm text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
        >
          打率計算ツールで今すぐ計算する &rarr;
        </Link>
      </section>

      <AdBanner slot={adSlots.columnMiddle} className="mt-8" />

      {/* 目安値・評価基準 */}
      <section id="benchmarks" className="mt-10">
        <h2 className="text-xl font-bold mb-4">打率の目安値・評価基準</h2>
        <p className="text-sm text-zinc-300 leading-6 mb-4">
          打率の評価基準はカテゴリによって異なります。以下にプロ野球（NPB）と高校野球の目安を示します。
        </p>

        <h3 className="font-bold text-base mb-3">プロ野球（NPB）の打率目安</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  評価
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  打率
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  説明
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-amber-400 font-bold">
                  S（歴代級）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .350以上
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  リーグを代表するトップバッター・首位打者上位
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  A（好打者）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .300〜.349
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  3 割打者の証・クリーンアップを任せられる一流レベル
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  B（中堅レギュラー）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .280〜.299
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  リーグ平均より上の中堅レギュラー水準
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  C（平均）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .250〜.279
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  NPB のリーグ平均前後・標準的なレギュラー
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  D（要改善）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .250未満
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  打撃面での貢献が低い。守備や走塁で補う必要あり
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">高校野球の打率目安</h3>
        <p className="text-sm text-zinc-300 leading-6 mb-3">
          高校野球では金属バットを使用するため、プロ野球より全体的に数値が高くなる傾向があります。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  評価
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  打率
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
                  .400以上
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  甲子園出場レベルのチームの中心打者
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  好打者
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .350〜.399
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  地方大会で上位を狙えるレベル
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  平均的
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .300〜.349
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  レギュラーとして標準的なレベル
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  要改善
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .300未満
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  バッティング練習の強化が必要
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 計算ツールCTA */}
        <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
          <p className="text-lg font-bold mb-2">今すぐ自分の打率を計算する</p>
          <p className="text-sm text-zinc-300 mb-4">
            安打数と打数を入力するだけで打率を自動計算。登録不要・完全無料。
          </p>
          <Link
            href="/tools/batting-average"
            className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
          >
            打率計算ツールを使う &rarr;
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
            href="/column/ops"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPS</p>
            <p className="text-xs text-zinc-400 mt-1">
              出塁率+長打率で打者の総合力を評価
            </p>
          </Link>
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
        </div>
      </section>

      {/* 関連コラム */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">関連コラム</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/column/batting-average-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率の目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">
              .250 / .280 / .300 / .350 の意味、ポジション別の基準
            </p>
          </Link>
          <Link
            href="/column/batting-average-300"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率 3 割の意味</p>
            <p className="text-xs text-zinc-400 mt-1">
              「3 割打者」が一流の証とされる理由
            </p>
          </Link>
          <Link
            href="/column/batting-average-350"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率 .350 はどのレベル？</p>
            <p className="text-xs text-zinc-400 mt-1">歴代首位打者級</p>
          </Link>
          <Link
            href="/column/batting-average-vs-obp"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率と出塁率の違い</p>
            <p className="text-xs text-zinc-400 mt-1">AVG と OBP の使い分け</p>
          </Link>
          <Link
            href="/column/batting-average-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB 打率ランキング</p>
            <p className="text-xs text-zinc-400 mt-1">歴代上位の名打者</p>
          </Link>
          <Link
            href="/column/npb-batting-average-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB 打率平均値の推移</p>
            <p className="text-xs text-zinc-400 mt-1">リーグ平均の変遷</p>
          </Link>
        </div>
      </section>

      {/* BUZZ BASEアプリCTA */}
      <CtaBanner
        className="mt-10"
        heading="打撃成績をアプリでまとめて管理するなら"
        body="BUZZ BASEアプリなら試合結果を入力するだけで、打率を含む全29指標を自動算出。チームメイトとランキング形式で成績を共有できます。完全無料。"
      />

      <AdBanner
        slot={adSlots.columnHorizontal}
        format="horizontal"
        className="mt-8"
      />
    </>
  );
}
