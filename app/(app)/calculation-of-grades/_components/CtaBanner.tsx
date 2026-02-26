import Link from "next/link";

export default function CtaBanner() {
  return (
    <div className="my-10 rounded-xl bg-linear-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6">
      <p className="text-base font-bold mb-2">成績を自動で計算するなら</p>
      <p className="text-sm text-zinc-300 leading-6 mb-4">
        BUZZ
        BASEなら試合結果を入力するだけで、上記の全指標を自動算出。チームメイトとランキング形式で成績を共有できます。
      </p>
      <Link
        href="/signup"
        className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
      >
        BUZZ BASEで無料で使ってみる
      </Link>
    </div>
  );
}
