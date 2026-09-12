import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "OPS .800 は具体的にどれくらいすごい？",
    answer:
      "NPBのリーグ平均OPSがおおむね.700前後で推移する中で、.800はリーグ平均を1割以上上回る水準です。クリーンアップを任される好打者の目安と言えます。",
  },
  {
    question: "OPS .800 を超えるにはどうすればいい？",
    answer:
      "出塁率（OBP）を.350以上に保ちつつ長打率（SLG）を.450以上に伸ばすのが目安です。四球を恐れずに選ぶ姿勢と、長打になりやすいバッティング軌道の両立がポイントになります。",
  },
  {
    question: "高校野球で OPS .800 はどのレベル？",
    answer:
      "高校野球では金属バットの影響で数値が出やすく、強豪校でも.800を継続できる打者はレギュラー上位のレベルです。地方大会で主軸を担うバッティングと言えます。",
  },
];

export default function Ops800ColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="OPS .800 はどのレベル？プロ・高校野球での意味と実例を解説"
        description="OPS .800 はクリーンアップを任される好打者の目安。NPB・MLB・高校野球での意味と、.800を超えるための打撃指標バランスを解説。"
        path="/column/ops-800"
        breadcrumbLeafName="OPS .800"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "OPS .800 とは" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        OPS .800 はどのレベル？プロ・高校野球での意味
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        OPS <strong>.800</strong>{" "}
        は「クリーンアップを任される好打者」の目安です。NPB・MLB
        のリーグ平均OPSがおおむね.700前後で推移するため、.800は
        <strong>リーグ平均を1割以上上回る</strong>水準。年間を通して .800
        をキープできれば、3〜5番を打つレギュラーバッターとして信頼される打力と言えます。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          OPS .800 をプロ野球の文脈で見ると
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          NPBのレギュラーバッターでシーズンOPS .800
          以上を残すと、All-Star候補ライン・打撃部門の上位ランキングに名前が挙がるレベルです。MLBでも同様で、リーグ平均を明確に上回る「中軸を任せられる打者」の基準として扱われます。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">OPS .800 を高校野球で見ると</h2>
        <p className="text-sm text-zinc-300 leading-6">
          金属バットの恩恵で全体に数字が出やすい高校野球では、.800
          は強豪校のレギュラー上位や地方大会の主軸として通用するレベル。.900
          を超えてくると甲子園を見据える強打者の入口になります。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          .800 を超えるための OBP / SLG バランス
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          OPS .800 を継続するには、<strong>OBP .350 + SLG .450</strong>{" "}
          が分かりやすい目安です。出塁率（四球を選ぶ目）と長打率（長打を打つバットスピード）をバランス良く伸ばす必要があり、極端な選球タイプ・極端なフリースインガーは到達しづらい数値です。
        </p>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">あなたのOPSを計算してみよう</p>
        <Link
          href="/tools/ops"
          className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
        >
          OPS計算ツールを使う &rarr;
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
            href="/column/ops"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPSとは（基本記事）</p>
            <p className="text-xs text-zinc-400 mt-1">意味・計算方法・読み方</p>
          </Link>
          <Link
            href="/column/ops-criteria"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPSの目安・基準</p>
            <p className="text-xs text-zinc-400 mt-1">
              .700/.800/.900/1.000 の意味
            </p>
          </Link>
          <Link
            href="/column/ops-1000"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPS 1.000 を超える選手</p>
            <p className="text-xs text-zinc-400 mt-1">
              「1超え」の意味と歴代スラッガー
            </p>
          </Link>
          <Link
            href="/column/ops-700"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPS .700 は平均？</p>
            <p className="text-xs text-zinc-400 mt-1">
              リーグ平均ラインの位置づけ
            </p>
          </Link>
        </div>
      </section>
    </>
  );
}
