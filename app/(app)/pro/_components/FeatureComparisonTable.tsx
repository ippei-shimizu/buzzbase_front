interface Row {
  category: string;
  feature: string;
  free: string;
  pro: string;
}

const ROWS: Row[] = [
  {
    category: "メディア",
    feature: "動画・画像アップロード",
    free: "月 3 件まで",
    pro: "無制限",
  },
  {
    category: "メディア",
    feature: "メディア保管期間",
    free: "30 日",
    pro: "無制限（長期保管）",
  },
  {
    category: "成績",
    feature: "シーズン跨ぎ成績推移グラフ",
    free: "—",
    pro: "全期間表示",
  },
  {
    category: "草機能",
    feature: "ヒートマップ表示期間",
    free: "直近 30 日",
    pro: "全期間",
  },
  {
    category: "練習",
    feature: "練習メニュー",
    free: "3 件まで",
    pro: "無制限",
  },
  {
    category: "練習",
    feature: "自主練スケジュール",
    free: "1 件まで",
    pro: "無制限",
  },
  {
    category: "目標",
    feature: "月次目標",
    free: "1 件まで",
    pro: "無制限",
  },
  {
    category: "目標",
    feature: "シーズン目標",
    free: "—",
    pro: "設定可能",
  },
  {
    category: "体験",
    feature: "広告表示",
    free: "あり",
    pro: "なし",
  },
  {
    category: "通知",
    feature: "通知メッセージのカスタマイズ",
    free: "—",
    pro: "対応",
  },
];

export default function FeatureComparisonTable() {
  return (
    <section className="bg-[#262626] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-10 text-center text-2xl font-bold text-white md:text-3xl">
          Free と Pro の違い
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-700">
          <table className="w-full text-sm text-gray-200">
            <thead className="bg-[#424242]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">機能</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-400">
                  Free
                </th>
                <th className="px-4 py-3 text-center font-semibold text-[#d08000]">
                  Pro
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={`${row.category}-${row.feature}`}
                  className="border-t border-gray-700"
                >
                  <td className="px-4 py-3">
                    <span className="block text-xs text-gray-500">
                      {row.category}
                    </span>
                    {row.feature}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400">
                    {row.free}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-white">
                    {row.pro}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
