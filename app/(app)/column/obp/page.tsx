import Link from "next/link";
import AdBanner from "@app/components/ad/AdBanner";
import { adSlots } from "@app/components/ad/adConfig";
import CtaBanner from "../../_components/CtaBanner";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "出塁率（OBP）の読み方と英語表記は？",
    answer:
      "出塁率は「しゅつるいりつ」と読み、英語の On-Base Percentage（OBP、オービーピー）の略です。打率（AVG）が安打を打つ確率だけを評価するのに対し、出塁率は四球・死球も含めた「塁に出る確率」を測ります。",
  },
  {
    question: "出塁率と打率の違いは？",
    answer:
      "打率は「安打数 ÷ 打数」で安打を打つ確率だけを評価し、四球・死球は含めません。出塁率は「(安打 + 四球 + 死球) ÷ (打数 + 四球 + 死球 + 犠飛)」で、四球・死球による出塁も含めて評価します。出塁率は打率より概ね .050〜.100 高い数値帯になります。",
  },
  {
    question: "出塁率の計算方法は？",
    answer:
      "出塁率の計算式は（安打 + 四球 + 死球）÷（打数 + 四球 + 死球 + 犠飛）です。たとえば打数 400、安打 120、四球 60、死球 5、犠飛 5 なら、(120+60+5)÷(400+60+5+5)= 185÷470 = .394 になります。",
  },
  {
    question: "出塁率はいくつから良い？",
    answer:
      "NPB のリーグ平均は概ね .310〜.330 で推移します。.350 を超えれば中堅レギュラー上位、.380 を超えれば最高出塁率タイトル争い、.420 を超えれば歴代級の偉業です。",
  },
  {
    question: "OPS との関係は？",
    answer:
      "OPS（On-base Plus Slugging）は出塁率（OBP）と長打率（SLG）を足し合わせた指標です。打者の総合的な攻撃力を1つの数字で表すため、出塁率はOPSの構成要素として重要な指標になります。",
  },
  {
    question: "中学野球（シニア・ボーイズ）の出塁率目安は？",
    answer:
      "硬式リーグでは .380 以上でレギュラー上位、.420 以上でクリーンアップ、.450 を超えれば全国レベルの強打者の目安です。軟式中学野球では球速が抑えめのため、さらに数値が伸びる傾向があります。",
  },
  {
    question: "MLB と NPB で出塁率の基準は変わる？",
    answer:
      "MLB と NPB のリーグ平均出塁率はいずれも .310〜.330 で大きな差はありません。タイトル獲得ラインも MLB は .400 前後、NPB は .400〜.420 とほぼ同水準です。",
  },
  {
    question: "ポジションによって出塁率の基準は違う？",
    answer:
      "捕手・遊撃手・二塁手などセンターラインのポジションは守備負担が大きいため、.330 前後でも十分な打撃力と評価されます。一塁手・指名打者・外野コーナーは打撃が期待されるため、.350 以上が標準ラインです。",
  },
  {
    question: "リードオフマンには出塁率が重要？",
    answer:
      "はい。1〜2 番打者には「塁に出る能力」が最も重要視されるため、出塁率がチーム内の評価指標として打率以上に重視されることがあります。打率 .280 でも出塁率 .380 なら、優秀なリードオフマンの証です。",
  },
];

export default function ObpColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="出塁率（OBP・しゅつるいりつ）とは？計算方法・打率との違い・目安値を解説"
        description="出塁率（OBP）の読み方・意味・計算式・打率との違いをわかりやすく解説。NPB・MLB・高校野球・中学野球の目安値、ポジション別の基準も掲載。"
        path="/column/obp"
        breadcrumbLeafName="出塁率とは"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "出塁率とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        出塁率（OBP）とは？計算方法・打率との違い・目安値をわかりやすく解説
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        出塁率（読み方：<strong>しゅつるいりつ</strong>、英語表記：
        <strong>OBP / On-Base Percentage</strong>）とは、
        <strong>打者が塁に出る確率</strong>
        を示す野球の打撃指標です。打率（AVG）が安打を打つ確率だけを評価するのに対し、出塁率は
        <strong>四球・死球による出塁も含めて評価</strong>
        するため、選球眼を含めた総合的な出塁能力を測れます。
      </p>

      <p className="text-sm text-zinc-400 leading-6 mt-2">
        「出塁率はいくつから良いのか」「.300 / .350 / .380 /
        .400」の意味、ポジション別の目安を網羅した
        <Link
          href="/column/obp-criteria"
          className="text-yellow-500 hover:text-yellow-400 transition-colors font-bold"
        >
          出塁率の目安・基準を詳しく解説した記事
        </Link>
        も併せて参照してください。
      </p>

      <nav className="mt-6 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
        <p className="font-bold text-sm mb-3">目次</p>
        <ol className="list-decimal list-inside text-sm text-zinc-300 space-y-2">
          <li>
            <a
              href="#meaning"
              className="hover:text-yellow-500 transition-colors"
            >
              出塁率の意味
            </a>
          </li>
          <li>
            <a
              href="#calculation"
              className="hover:text-yellow-500 transition-colors"
            >
              出塁率の計算方法と計算例
            </a>
          </li>
          <li>
            <a
              href="#vs-avg"
              className="hover:text-yellow-500 transition-colors"
            >
              出塁率と打率の違い
            </a>
          </li>
          <li>
            <a
              href="#benchmarks"
              className="hover:text-yellow-500 transition-colors"
            >
              出塁率の目安値・評価基準
            </a>
          </li>
          <li>
            <a href="#faq" className="hover:text-yellow-500 transition-colors">
              よくある質問
            </a>
          </li>
        </ol>
      </nav>

      <section id="meaning" className="mt-10">
        <h2 className="text-xl font-bold mb-4">出塁率の意味</h2>
        <p className="text-sm text-zinc-300 leading-6">
          出塁率は「On-Base
          Percentage」の略で、打者が打席に立ったときに塁に出る確率を示します。
        </p>
        <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-yellow-500 font-mono font-bold text-center">
            出塁率 =（安打 + 四球 + 死球）÷（打数 + 四球 + 死球 + 犠飛）
          </p>
        </div>
        <p className="text-sm text-zinc-300 leading-6 mt-4">
          打率が「安打を打つ技術」だけを測るのに対し、出塁率は
          <strong>四球を選ぶ力（選球眼）</strong>
          も評価するため、リードオフマンや 2
          番打者の能力を測る上で打率以上に重視されます。
        </p>
        <p className="text-sm text-zinc-300 leading-6 mt-3">
          NPB（日本プロ野球）や MLB（メジャーリーグ）のデータ分析でも、出塁率は
          OPS（On-base Plus
          Slugging）の構成要素として、打者の総合評価で重要な役割を果たしています。
        </p>
      </section>

      <section id="calculation" className="mt-10">
        <h2 className="text-xl font-bold mb-4">出塁率の計算方法と計算例</h2>
        <p className="text-sm text-zinc-300 leading-6">
          出塁率の計算式はシンプルで、安打数・打数・四球・死球・犠飛の 5
          つの数値がわかれば計算できます。
        </p>

        <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-xs text-zinc-400 mb-1">出塁率の計算式</p>
          <p className="text-yellow-500 font-mono text-sm">
            出塁率 =（安打 + 四球 + 死球）÷（打数 + 四球 + 死球 + 犠飛）
          </p>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">
          計算例①：好打者（.380）
        </h3>
        <p className="text-sm text-zinc-300 leading-6">
          打数 400、安打 120、四球 50、死球 5、犠飛 8 の場合:
        </p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">出塁率 =</span>（120 + 50 +
            5）÷（400 + 50 + 5 + 8）= 175 ÷ 463 ={" "}
            <span className="text-yellow-500 font-bold">.378</span>
          </p>
        </div>

        <h3 className="font-bold text-base mt-6 mb-3">
          計算例②：リードオフマン
        </h3>
        <p className="text-sm text-zinc-300 leading-6">
          打率は控えめでも四球が多いタイプ。打数 400、安打 100、四球 80、死球
          5、犠飛 5 の場合:
        </p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4 space-y-2">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">打率 =</span> 100 ÷ 400 ={" "}
            <span className="text-yellow-500 font-bold">.250</span>
          </p>
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">出塁率 =</span>（100 + 80 +
            5）÷（400 + 80 + 5 + 5）= 185 ÷ 490 ={" "}
            <span className="text-yellow-500 font-bold">.378</span>
          </p>
        </div>
        <p className="text-sm text-zinc-300 leading-6 mt-3">
          打率 .250 は平均的でも、出塁率 .378
          は中堅レギュラー上位レベル。打率だけでは見えない打者の価値が出塁率によって浮かび上がります。
        </p>

        <p className="text-sm text-zinc-300 leading-6 mt-4">
          自分の成績から出塁率を計算したい場合は、無料の計算ツールを使えば数値を入力するだけで瞬時に算出できます。
        </p>
        <Link
          href="/tools/obp"
          className="inline-flex items-center gap-1 mt-3 text-sm text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
        >
          出塁率計算ツールで今すぐ計算する &rarr;
        </Link>
      </section>

      <AdBanner slot={adSlots.columnMiddle} className="mt-8" />

      <section id="vs-avg" className="mt-10">
        <h2 className="text-xl font-bold mb-4">出塁率と打率の違い</h2>
        <p className="text-sm text-zinc-300 leading-6">
          出塁率と打率の最大の違いは、
          <strong>四球・死球を含めるかどうか</strong>です。
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  指標
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  計算式
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  四球・死球
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  打率（AVG）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  安打 ÷ 打数
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  含まない
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  出塁率（OBP）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  (安打＋四球＋死球) ÷ (打数＋四球＋死球＋犠飛)
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  含む
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-zinc-300 leading-6 mt-4">
          出塁率は打率より概ね <strong>.050〜.100 高い</strong>
          数値帯になります。両者の差（OBP - AVG）が <strong>.080 以上</strong>
          あれば、選球眼が優れた打者と評価されます。
        </p>

        <p className="text-sm text-zinc-300 leading-6 mt-3">
          詳細は{" "}
          <Link
            href="/column/batting-average-vs-obp"
            className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
          >
            打率と出塁率の違いを解説した記事
          </Link>{" "}
          を参照してください。
        </p>
      </section>

      <section id="benchmarks" className="mt-10">
        <h2 className="text-xl font-bold mb-4">出塁率の目安値・評価基準</h2>
        <p className="text-sm text-zinc-300 leading-6 mb-4">
          出塁率の評価基準はカテゴリによって異なります。以下にプロ野球（NPB）の目安を示します。
        </p>

        <h3 className="font-bold text-base mb-3">
          プロ野球（NPB）の出塁率目安
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  評価
                </th>
                <th className="px-4 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  出塁率
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
                  .420以上
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  MVP・首位打者・最高出塁率の主役級
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  A（好打者上位）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .380〜.419
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  最高出塁率タイトル争い・リードオフマンとして一流
                </td>
              </tr>
              <tr className="bg-zinc-800/50">
                <td className="px-4 py-2 border-b border-zinc-700 text-yellow-500 font-bold">
                  B（中堅レギュラー上位）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .350〜.379
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  リーグ平均より上、選球眼が安定
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300 font-bold">
                  C（平均）
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  .310〜.349
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
                  .310未満
                </td>
                <td className="px-4 py-2 border-b border-zinc-700 text-zinc-300">
                  選球眼または接触率の改善が必要
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
          <p className="text-lg font-bold mb-2">今すぐ自分の出塁率を計算する</p>
          <p className="text-sm text-zinc-300 mb-4">
            安打数・打数・四球・死球・犠飛を入力するだけで出塁率を自動計算。登録不要・完全無料。
          </p>
          <Link
            href="/tools/obp"
            className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
          >
            出塁率計算ツールを使う &rarr;
          </Link>
        </div>
      </section>

      <AdBanner slot={adSlots.columnBottom} className="mt-8" />

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

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">関連コラム</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/column/obp-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">出塁率の目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">
              .310 / .350 / .380 / .420 の意味、ポジション別
            </p>
          </Link>
          <Link
            href="/column/obp-400"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">出塁率 .400 とは</p>
            <p className="text-xs text-zinc-400 mt-1">
              最高出塁率タイトルライン
            </p>
          </Link>
          <Link
            href="/column/obp-350"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">出塁率 .350 とは</p>
            <p className="text-xs text-zinc-400 mt-1">中堅レギュラー上位</p>
          </Link>
          <Link
            href="/column/batting-average-vs-obp"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率と出塁率の違い</p>
            <p className="text-xs text-zinc-400 mt-1">AVG と OBP の使い分け</p>
          </Link>
          <Link
            href="/column/obp-ranking-npb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB 出塁率ランキング</p>
            <p className="text-xs text-zinc-400 mt-1">歴代上位の名打者</p>
          </Link>
          <Link
            href="/column/ops"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPS とは</p>
            <p className="text-xs text-zinc-400 mt-1">
              出塁率＋長打率の総合評価
            </p>
          </Link>
        </div>
      </section>

      <CtaBanner
        className="mt-10"
        heading="打撃成績をアプリでまとめて管理するなら"
        body="BUZZ BASEアプリなら試合結果を入力するだけで、出塁率を含む全29指標を自動算出。チームメイトとランキング形式で成績を共有できます。完全無料。"
      />

      <AdBanner
        slot={adSlots.columnHorizontal}
        format="horizontal"
        className="mt-8"
      />
    </>
  );
}
