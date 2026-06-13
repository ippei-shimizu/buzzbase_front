import Link from "next/link";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";

const faqItems = [
  {
    question: "OPSの理論上の最大値は？",
    answer:
      "出塁率の理論最大は1.000、長打率の理論最大は4.000（毎打席本塁打）なので、OPSの理論上の最大値は5.000です。ただし実戦でこの数値に近づくことはなく、シーズン通算の最高値は約1.500前後が天井になります。",
  },
  {
    question: "MLBシーズン最高のOPSは？",
    answer:
      "MLB歴代シーズン最高OPSはバリー・ボンズが2004年に記録した1.422とされています。次いでベーブ・ルース、テッド・ウィリアムズらが1.300台後半を残しています。",
  },
  {
    question: "NPBシーズン最高のOPSは？",
    answer:
      "NPBではバレンティン（2013年）の1.234、王貞治の1.293（1974年）などが上位に並びます。歴代でも1.200を超えた例は限られています。",
  },
];

export default function OpsMaxColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="OPSの最大値（マックス）は？理論値と歴代最高記録"
        description="OPSの理論上の最大値（5.000）と実戦での最高記録、NPB・MLB歴代のシーズン最高OPSを整理。"
        path="/column/ops-max"
        breadcrumbLeafName="OPSの最大値"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "OPSの最大値" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        OPSの最大値（マックス）は？理論値と歴代最高記録
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        OPSの理論上の最大値は <strong>5.000</strong>{" "}
        です。出塁率は最大1.000（毎打席出塁）、長打率は最大4.000（毎打席本塁打）まで上昇しうるため、計算上はこの値が上限になります。ただし実戦の規定打席ベースでは、シーズン通算で
        <strong>1.500前後が事実上の天井</strong>です。
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">
          OPS の理論最大値（5.000）の内訳
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          OPS = OBP + SLG。OBP の理論最大は
          1.000（すべての打席で安打・四球・死球）、SLG の理論最大は
          4.000（毎打席本塁打）。したがって OPS の数学的な上限は{" "}
          <strong>5.000</strong> です。1〜2 打席程度であれば計算上 5.000
          になり得ますが、規定打席に達するシーズン単位では現実的に観測されません。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">MLB歴代シーズン最高OPS</h2>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
          <li>バリー・ボンズ（2004年）: 1.422</li>
          <li>バリー・ボンズ（2002年）: 1.381</li>
          <li>ベーブ・ルース（1920年）: 1.382</li>
          <li>テッド・ウィリアムズ（1941年）: 1.287</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-bold mb-3">NPB歴代シーズン最高OPS</h2>
        <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
          <li>王貞治（1974年）: 1.293</li>
          <li>バレンティン（2013年）: 1.234</li>
          <li>落合博満（1985年）: 1.207</li>
          <li>松井秀喜（2002年）: 1.153</li>
        </ul>
        <p className="text-sm text-zinc-400 leading-6 mt-3">
          ※年度・チーム・規定打席のカウントによって値はわずかに変動します。
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
            href="/column/ops-1000"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPS 1.000 を超える選手</p>
            <p className="text-xs text-zinc-400 mt-1">
              「1超え」の意味と歴代スラッガー
            </p>
          </Link>
          <Link
            href="/column/ops-ranking-mlb"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">MLB OPS 歴代TOP30</p>
            <p className="text-xs text-zinc-400 mt-1">
              バリー・ボンズから現役まで
            </p>
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
        </div>
      </section>
    </>
  );
}
