import { BattingStat } from "./types";

export const battingStats: BattingStat[] = [
  {
    title: "打率",
    equation: "安打 ÷ 打数",
    descriptions: [
      "打者のヒットを打つ能力を示す基本的な指標です。安打数と打数から簡単に計算できます。",
    ],
    slug: "batting-average",
  },
  {
    title: "出塁率",
    equation: "（安打数＋四球＋死球）÷（打数＋四球＋死球＋犠飛）",
    descriptions: [
      "打者がどれだけの確率で出塁するかを示します。安打・四球・死球から簡単に計算できます。",
    ],
    slug: "obp",
  },
  {
    title: "長打率",
    equation: "塁打数 ÷ 打数",
    descriptions: [
      "打者が打席に立った際に平均してどれだけの塁打数を稼ぐかを示す指標です。塁打数と打数から簡単に計算できます。",
    ],
    slug: "slugging",
  },
  {
    title: "OPS",
    equation: "出塁率 + 長打率",
    descriptions: [
      "打者の全体的な攻撃力を示す指標です。出塁率と長打率から簡単に計算できます。",
    ],
    slug: "ops",
  },
  {
    title: "ISO",
    equation: "（二塁打 + 三塁打×2 + 本塁打×3）÷ 打数",
    descriptions: [
      "長打力のみを測る指標で、打者がどれだけ二塁打以上を打つ能力があるかを示します。",
    ],
  },
  {
    title: "ISOD",
    equation: "出塁率 - 打率",
    descriptions: [
      "打者の選球眼を示す指標で、打者がどれだけ四球で出塁する能力があるかを示します。",
    ],
  },
  {
    title: "BB/K",
    equation: "四球 ÷ 三振",
    descriptions: [
      "打者の選球眼とコンタクト能力を測る指標です。この値が高いほど、打者は選球眼が良く、三振の少ない打者として評価されます。",
    ],
  },
];
