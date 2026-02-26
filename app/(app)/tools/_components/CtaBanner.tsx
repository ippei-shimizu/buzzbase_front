import Link from "next/link";

export default function CtaBanner() {
  return (
    <section className="mt-10 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6">
      <h2 className="text-lg font-bold mb-2">もっと詳しく成績を管理するなら</h2>
      <p className="text-sm text-zinc-300 leading-6 mb-4">
        BUZZ
        BASEなら試合結果を入力するだけで、打率・防御率・OPSなど全29指標を自動算出。チームメイトとランキング形式で成績を共有できます。
      </p>
      <Link
        href="/signup"
        className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
      >
        BUZZ BASEで無料で使ってみる
      </Link>
    </section>
  );
}
