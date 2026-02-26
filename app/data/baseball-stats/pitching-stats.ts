import { PitchingStat } from "./types";

export const pitchingStats: PitchingStat[] = [
  {
    title: "防御率",
    equation: "自責点×9 ÷ 投球回数",
    description:
      "その投手が9イニング（1試合）を投げたとしたら何点に抑えられるかを示す指標です",
    description2: "",
    description3: "",
    slug: "era",
  },
  {
    title: "勝利",
    equation: "",
    description:
      "・スターターが5イニング以上を投げ、チームがリードしている状態で交代し、その後チームが負けることなく勝つ場合、スタートした投手が勝利投手になります。",
    description2:
      "・リリーフ投手の場合、公式記録員が「最も効果的だった」と判断した投手が勝利投手となります。これは、スターターが5イニングを満たしていないか、ゲームの途中でリードが変わった場合に適用されます。",
    description3: "",
  },
  {
    title: "敗戦",
    equation: "",
    description:
      "・チームが負けたゲームで、相手チームが勝利に必要なリードを取った時の投手が敗戦投手になります。",
    description2:
      "・敗戦投手は、ゲーム中に相手チームにリードを許し、そのリードが最後まで逆転されない場合に記録されます。",
    description3: "",
  },
  {
    title: "ホールド",
    equation: "",
    description:
      "・リリーフ投手がゲームに登板し、リードを守りながら敗戦投手にならず、セーブの機会も成立させない状態で交代する。",
    description2:
      "・登板時、リードが3点以内であるか、同点または逆転を許していない状態で、少なくとも1アウトを取るか、登板時に同点または勝ち越しの走者が出塁していない場合に限る。",
    description3: "・ゲーム終了時までにリードが保たれている必要がある。",
  },
  {
    title: "セーブ",
    equation: "",
    description:
      "・投手がリリーフとして登板し、勝利を保存しゲーム終了まで投げる。",
    description2:
      "・登板時、勝利チームがリードしており、そのリードが3点以内であるか、投手が少なくとも3イニングを投げるか、同点または勝ち越しの走者が塁に出ている状態で登板する。",
    description3: "・投手がリードを守り抜き、ゲームを勝利で締めくくる。",
  },
  {
    title: "完投",
    equation: "",
    description:
      "投手がゲームの初めから終わりまで自分一人で投げ抜き、試合を完了すること。",
    description2: "",
    description3: "",
  },
  {
    title: "完封",
    equation: "",
    description: "投手が完投し、相手チームに一点も与えずに試合を終えること。",
    description2: "",
    description3: "",
  },
  {
    title: "勝率",
    equation: "勝利数 ÷（勝利数 + 敗戦数）",
    description:
      "投手の勝ちゲームに対する貢献度を示す指標で、高いほど投手がチームの勝利に大きく貢献していることを意味します。",
    description2: "",
    description3: "",
  },
  {
    title: "投球回",
    equation: "",
    description:
      "実際に投げたイニング数を示す指標です。1イニングは相手チームの3人の打者をアウトさせることに相当します。",
    description2: "",
    description3: "",
  },
  {
    title: "失点",
    equation: "",
    description:
      "投手がマウンドにいる間に相手チームが得た得点の総数です。これには、ヒット、四球、野手のエラーなどによって生じたすべての得点が含まれます。",
    description2: "",
    description3: "",
  },
  {
    title: "自責点",
    equation: "",
    description:
      "投手のミスや守備のサポート不足（例：野手のエラー）によらないで生じた得点のみを数えたものです。具体的には、エラーや野手選択による得点を除外し、投手の責任による得点のみを計算します。",
    description2: "",
    description3: "",
  },
  {
    title: "被安打",
    equation: "",
    description: "投手が許したヒット（単打、二塁打、三塁打）の総数です。",
    description2: "",
    description3: "",
  },
  {
    title: "被本塁打",
    equation: "",
    description:
      "投手が投じた球を打者が打ち、その結果として本塁打になった回数です。",
    description2: "",
    description3: "",
  },
  {
    title: "奪三振",
    equation: "",
    description: "投手が三振によってアウトを取った回数です。",
    description2: "",
    description3: "",
  },
  {
    title: "与四球",
    equation: "",
    description: "四球によって打者を一塁に進めた回数です。",
    description2: "",
    description3: "",
  },
  {
    title: "与死球",
    equation: "",
    description:
      "投じた球が打者に当たり、その結果として打者が一塁に進むことが許された回数です。",
    description2: "",
    description3: "",
  },
  {
    title: "K/9",
    equation: "（奪三振数×9）÷（投球回数）",
    description: "9イニングで三振をいくつ奪えるかを表した指標です。",
    description2: "",
    description3: "",
    slug: "k-9",
  },
  {
    title: "BB/9",
    equation: "（与四球÷投球回）×9",
    description: "BB/9は9イニングあたりの与四球の数を示します。",
    description2: "",
    description3: "",
    slug: "bb-9",
  },
  {
    title: "K/BB",
    equation: "奪三振 ÷ 与四球",
    description:
      "制球力と支配力のバランスを示す指標で、高い値は投手が多くの奪三振を取りつつ、少ない四球を与えていることを意味します。",
    description2: "",
    description3: "",
    slug: "k-bb",
  },
  {
    title: "WHIP",
    equation: "（与四球 + 被安打） ÷ 投球回",
    description:
      "1イニングあたりに投手が許した走者（安打と四球の合計）の数を示します。",
    description2: "",
    description3: "",
    slug: "whip",
  },
];
