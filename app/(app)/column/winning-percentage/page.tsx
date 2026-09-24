import Link from "next/link";
import AdBanner from "@app/components/ad/AdBanner";
import { adSlots } from "@app/components/ad/adConfig";
import CtaBanner from "../../_components/CtaBanner";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";
import {
  WINNING_PERCENTAGE_COLUMN_DESCRIPTION,
  WINNING_PERCENTAGE_COLUMN_TITLE,
} from "./_constants/meta";

const faqItems = [
  {
    question: "野球の勝率の出し方は？",
    answer:
      "勝率 = 勝利数 ÷（勝利数 ＋ 敗戦数）で計算します。たとえば 80 勝 60 敗なら 80 ÷ 140 = .571 です。引き分けは分母に含めません。",
  },
  {
    question: "引き分けは勝率に含まれる？",
    answer:
      "NPB（日本プロ野球）では 2001 年以降、引き分けを除外して勝率を計算しています。75 勝 60 敗 8 分なら 75 ÷（75 ＋ 60）= .556 で、8 引き分けは計算に入りません。MLB は延長戦で必ず決着をつけるため、原則として引き分けが発生しません。",
  },
  {
    question: "勝率 5 割とはどういう意味？",
    answer:
      "勝ち数と負け数が同じ状態（.500）のことです。勝率が .500 を上回れば「勝ち越し」、下回れば「負け越し」と呼びます。シーズン途中の順位表で「貯金」「借金」という言い方をするのも、5 割からの差を表しています。",
  },
  {
    question: "勝率はいくつから良い？",
    answer:
      "NPB のシーズン成績では .600 以上が優勝争いの水準、.550〜.599 で A クラス上位、.500〜.549 が勝ち越し・中位、.400 を下回ると下位低迷が目安です。年によっては .570 前後で優勝することもあります。",
  },
  {
    question: "勝率とゲーム差の違いは？",
    answer:
      "順位は勝率で決まり、ゲーム差は上位チームとの差を試合数に換算した目安です。ゲーム差 =（上位チームの勝ち数 − 下位チームの勝ち数 ＋ 下位チームの負け数 − 上位チームの負け数）÷ 2 で求めます。引き分け数の違いで、ゲーム差がマイナスなのに順位が下という逆転現象が起きることもあります。",
  },
  {
    question: "投手の勝率とは？",
    answer:
      "投手個人の勝利数 ÷（勝利数 ＋ 敗戦数）で、チームと同じ式です。NPB の最高勝率のタイトルは規定の勝利数（13 勝以上）を満たした投手の中で最も勝率が高い投手に与えられます。打線の援護や救援投手の出来にも左右されるため、投手の実力を見るときは防御率や WHIP と併用します。",
  },
  {
    question: "高校野球や少年野球でも勝率は使う？",
    answer:
      "トーナメント制の大会では 1 敗で終わるため、大会単位の勝率はあまり意味を持ちません。練習試合や地区のリーグ戦を含めた年間の勝敗で計算すると、チーム力の推移を把握する指標として使えます。",
  },
];

const npbBenchmarks = [
  {
    level: "S",
    range: ".650 以上",
    label: "独走優勝",
    description: "シーズンを通して圧倒的な強さ。90 勝前後が見える水準",
  },
  {
    level: "A",
    range: ".600〜.649",
    label: "優勝争い",
    description: "リーグ優勝を狙えるライン。143 試合なら 85 勝前後",
  },
  {
    level: "B",
    range: ".550〜.599",
    label: "A クラス上位",
    description: "クライマックスシリーズ進出の有力候補",
  },
  {
    level: "C",
    range: ".500〜.549",
    label: "勝ち越し・中位",
    description: "5 割前後。A クラスと B クラスの境目",
  },
  {
    level: "D",
    range: ".400〜.499",
    label: "負け越し・B クラス",
    description: "借金を抱えた状態。下位に沈みやすい",
  },
  {
    level: "E",
    range: ".400 未満",
    label: "下位低迷",
    description: "最下位争い。シーズン通算で .350 を切ることは稀",
  },
];

export default function WinningPercentageColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline={WINNING_PERCENTAGE_COLUMN_TITLE}
        description={WINNING_PERCENTAGE_COLUMN_DESCRIPTION}
        path="/column/winning-percentage"
        breadcrumbLeafName="勝率とは"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "勝率とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">{WINNING_PERCENTAGE_COLUMN_TITLE}</h1>

      <p className="mt-4 text-sm text-zinc-300 leading-6">
        野球の勝率（英語表記：<strong>Winning Percentage / WPCT</strong>
        ）とは、<strong>勝利数を勝利数と敗戦数の合計で割った値</strong>
        で、チームや投手がどれだけの割合で勝っているかを示す最も基本的な成績指標です。プロ野球ではペナントレースの順位を決める数値で、引き分けは計算に含めません。この記事では、勝率の出し方・計算例・NPB
        での目安・ゲーム差との関係・投手の勝率までをまとめて解説します。
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">勝率の計算式（出し方）</h2>
        <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-200">
            <strong>勝率 = 勝利数 ÷（勝利数 ＋ 敗戦数）</strong>
          </p>
          <p className="mt-2 text-sm text-zinc-400 leading-6">
            引き分けは分母にも分子にも含めない（NPB 方式）
          </p>
        </div>
        <p className="mt-3 text-sm text-zinc-300 leading-6">
          分母が「試合数」ではなく「勝利数＋敗戦数」である点がポイントです。引き分けを試合数に含めて計算すると勝率が実際より低く出てしまうので、順位表と同じ値を出したいときは必ず引き分けを除いてください。表記は小数第
          3 位までで、.571 のように先頭の 0 を省略するのが一般的です。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">計算例</h2>
        <h3 className="mt-4 mb-2 text-base font-bold">例①: 引き分けなし</h3>
        <p className="text-sm text-zinc-300 leading-6">80 勝 60 敗の場合:</p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">勝率 =</span> 80 ÷（80 ＋ 60）= 80 ÷
            140 = <span className="font-bold text-yellow-500">.571</span>
          </p>
        </div>

        <h3 className="mt-6 mb-2 text-base font-bold">例②: 引き分けあり</h3>
        <p className="text-sm text-zinc-300 leading-6">
          75 勝 60 敗 8 分の場合:
        </p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-300">
            <span className="text-zinc-400">勝率 =</span> 75 ÷（75 ＋ 60）= 75 ÷
            135 = <span className="font-bold text-yellow-500">.556</span>
          </p>
          <p className="mt-1 text-xs text-zinc-400">
            8 引き分けは計算に含めない。143 試合で割ると .524
            になり、順位表の値と食い違う
          </p>
        </div>
      </section>

      <AdBanner slot={adSlots.columnMiddle} className="mt-8" />

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">勝率の目安（NPB 基準）</h2>
        <p className="mb-4 text-sm text-zinc-300 leading-6">
          143 試合制のペナントレースを基準にした一般的な評価です。年によっては
          .570
          前後で優勝することもあり、リーグ内の力関係で必要な勝率は上下します。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border border-zinc-700 text-sm">
            <thead>
              <tr className="bg-zinc-800">
                <th className="border-b border-zinc-700 px-4 py-2 text-left text-zinc-300">
                  評価
                </th>
                <th className="border-b border-zinc-700 px-4 py-2 text-left text-zinc-300">
                  勝率
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
              {npbBenchmarks.map((row) => (
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

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">勝率とゲーム差の関係</h2>
        <p className="text-sm text-zinc-300 leading-6">
          順位を決めるのは勝率で、ゲーム差は「上位チームに追いつくまでに必要な試合数」を表す目安です。次の式で求めます。
        </p>
        <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
          <p className="text-sm text-zinc-200">
            <strong>
              ゲーム差 =（上位の勝ち数 − 下位の勝ち数 ＋ 下位の負け数 −
              上位の負け数）÷ 2
            </strong>
          </p>
        </div>
        <p className="mt-3 text-sm text-zinc-300 leading-6">
          たとえば 1 位が 80 勝 60 敗、2 位が 78 勝 63 敗なら、（80 − 78 ＋ 63 −
          60）÷ 2 = 2.5 ゲーム差です。引き分けの数が違うと、ゲーム差が 0
          やマイナスなのに勝率では下位、という逆転現象が起きることがあります。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">投手の勝率と最高勝率</h2>
        <p className="text-sm text-zinc-300 leading-6">
          投手個人の勝率もチームと同じ式で計算します。NPB
          の最高勝率のタイトルは規定の勝利数（13
          勝以上）を満たした投手の中で最も勝率が高い投手に与えられます。ただし投手の勝敗は打線の援護や救援投手の出来にも左右されるため、投手の実力そのものを見るときは
          <Link
            href="/column/era"
            className="font-bold text-yellow-500 transition-colors hover:text-yellow-400"
          >
            防御率
          </Link>
          や WHIP と併せて評価します。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-xl font-bold">
          高校野球・少年野球での勝率の使い方
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          トーナメント制の公式戦は 1
          敗で終わるため、大会単位の勝率はほとんど意味を持ちません。練習試合や地区リーグ戦を含めた年間の勝敗で計算すると、チーム力の推移や新チームの立ち上がりを数値で振り返る指標として使えます。BUZZ
          BASE
          アプリなら試合結果を入力するだけでチームの勝率を自動集計できます。
        </p>
      </section>

      <div className="mt-8 rounded-xl border border-yellow-700/40 bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 px-5 py-6 text-center">
        <p className="mb-2 text-lg font-bold">勝率を計算してみよう</p>
        <p className="mb-4 text-sm text-zinc-300">
          勝利数と敗戦数を入力するだけで勝率を自動計算。目安付き。
        </p>
        <Link
          href="/tools/winning-percentage"
          className="inline-block rounded-lg bg-yellow-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-yellow-500"
        >
          勝率計算ツールを使う &rarr;
        </Link>
      </div>

      <AdBanner slot={adSlots.columnBottom} className="mt-8" />

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
            href="/column/era"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">防御率（ERA）とは</p>
            <p className="mt-1 text-xs text-zinc-400">
              計算方法と良い数値の目安
            </p>
          </Link>
          <Link
            href="/column/runs"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">失点と自責点の違い</p>
            <p className="mt-1 text-xs text-zinc-400">失点率の計算方法</p>
          </Link>
          <Link
            href="/column/ops"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">OPS とは</p>
            <p className="mt-1 text-xs text-zinc-400">
              出塁率＋長打率で打者の総合力を測る
            </p>
          </Link>
          <Link
            href="/tools"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 transition-colors hover:border-yellow-600/50 hover:bg-zinc-800"
          >
            <p className="text-sm font-bold">野球計算ツール一覧</p>
            <p className="mt-1 text-xs text-zinc-400">
              打率・防御率・OPS などを無料で計算
            </p>
          </Link>
        </div>
      </section>

      <CtaBanner
        className="mt-10"
        heading="チームの勝敗と成績をアプリでまとめて管理するなら"
        body="BUZZ BASEアプリなら試合結果を入力するだけで、勝率や個人成績を自動集計。チームメイトとランキング形式で成績を共有できます。完全無料。"
      />

      <AdBanner slot={adSlots.columnHorizontal} className="mt-8" />
    </>
  );
}
