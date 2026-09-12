import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "打率 3 割（.300）はどれくらいすごい？",
    answer:
      "NPB のリーグ平均打率がおおむね .240〜.260 で推移する中、.300 はリーグ平均を 0.04〜0.05 上回る水準です。シーズンを通して .300 を維持できる打者はリーグに数人〜10 名前後で、クリーンアップを任される一流レベルです。",
  },
  {
    question: "3 割打者になるには 10 打席で何安打必要？",
    answer:
      "10 打席で 3 安打が目安です。100 打席なら 30 安打、シーズン規定打席（NPB 約 443 打席）に到達するには約 133 安打が必要になります。1 試合 4 打席で安打 1.2 本以上のペースを継続することになります。",
  },
  {
    question: "高校野球で打率 3 割はどう評価される？",
    answer:
      "金属バットの恩恵で全体に数字が出やすい高校野球では、3 割はレギュラーの最低ラインのイメージ。強豪校の主軸を狙うには .350、絶対的なバットマンになるには .400 以上が必要です。",
  },
];

export default function BattingAverage300ColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="打率 3 割の意味｜「3割打者」がすごい理由とプロ・高校での難易度"
        description="打率 .300（3 割打者）が好打者の代名詞とされる理由、NPB・MLB の歴代 3 割打者、達成に必要な打席ごとの安打ペースを整理。"
        path="/column/batting-average-300"
        breadcrumbLeafName="打率 3 割の意味"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "打率 3 割の意味" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        打率 3 割の意味｜「3割打者」がすごい理由とプロ・高校での難易度
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        打率 <strong>.300</strong>（3
        割打者）は、野球で最も知られた「一流の証」のひとつ。NPB
        のリーグ平均が概ね .240〜.260 で推移する中、.300 は
        <strong>リーグ平均を 0.04〜0.05 上回る</strong>
        水準で、シーズンを通して維持できる打者は各球団のクリーンアップに座るレベルの実力者です。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          なぜ「3 割打者」が一流の証なのか
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          打率は野球で最も古くから使われている打撃指標で、19
          世紀末に誕生した時点から「.300」が好打者の象徴とされてきました。「10
          打席で 3
          安打」という覚えやすさと、リーグ平均を明確に上回る水準であることが、その地位を不動にしています。
        </p>
        <p className="text-sm text-zinc-300 leading-6 mt-3">
          NPB では毎年規定打席到達者で .300 を超えるのは 10
          名前後。クリーンアップやリードオフマンの座を任され、年俸交渉でも「3
          割打者」は明確な基準として機能します。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">高校野球での打率 .300</h2>
        <p className="text-sm text-zinc-300 leading-6">
          金属バットの恩恵で全体に数字が出やすい高校野球では、.300
          はレギュラー最低ライン〜中堅打者レベル。強豪校で主軸を狙うなら
          .350、地区を背負うバットマンには .400 以上が必要になってきます。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          打率 .300 を達成するための目安ペース
        </h2>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
          <li>10 打席で 3 安打 (1 試合 4 打席なら 1.2 安打ペース)</li>
          <li>100 打席で 30 安打</li>
          <li>NPB 規定打席（約 443 打席）で約 133 安打</li>
          <li>
            安打種別: 単打中心 + 二塁打 / 本塁打を 2〜3
            割含めれば長打率も伸ばせる
          </li>
        </ul>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">あなたの打率を計算してみよう</p>
        <Link
          href="/tools/batting-average"
          className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
        >
          打率計算ツールを使う &rarr;
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
            href="/column/batting-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率とは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法</p>
          </Link>
          <Link
            href="/column/batting-average-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">打率の目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">レベル別の意味</p>
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
            <p className="text-xs text-zinc-400 mt-1">指標の使い分け方</p>
          </Link>
        </div>
      </section>
    </>
  );
}
