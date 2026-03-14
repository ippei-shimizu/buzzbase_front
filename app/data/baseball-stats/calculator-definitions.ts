import { CalculatorDefinition } from "./types";

export const calculatorDefinitions: Record<string, CalculatorDefinition> = {
  "batting-average": {
    slug: "batting-average",
    title: "打率計算ツール",
    metaTitle: "打率計算ツール｜安打数と打数から打率を自動計算",
    metaDescription:
      "安打数と打数を入力するだけで打率を自動計算。登録不要・無料でブラウザからすぐ使えます。打率の計算式・目安値・意味もわかりやすく解説。プロ野球や高校野球の打率平均も紹介。",
    heading: "打率計算ツール",
    description:
      "安打数と打数を入力して、打率を計算できます。打率は打者の基本的な打撃能力を示す指標です。",
    explanation:
      "打率（Batting Average）は、打者がどれだけの割合でヒットを打つかを示す、野球で最も基本的な打撃指標です。一般的に「3割打者」は好打者とされ、プロ野球では打率.300以上が一流の証とされています。打率は単純な計算式で求められるため、少年野球から草野球まで幅広く使われています。",
    formula: "打率 = 安打数 ÷ 打数",
    formulaExample:
      "例：150打数45安打の場合、打率 = 45 ÷ 150 = .300（3割0分0厘）",
    guide: [
      { label: ".300以上", description: "好打者（一流レベル）" },
      { label: ".250〜.299", description: "平均的な打者" },
      { label: ".200〜.249", description: "やや苦戦している打者" },
      { label: ".200未満", description: "打撃不振" },
    ],
    fields: [
      {
        name: "hits",
        label: "安打数",
        placeholder: "例: 45",
        min: 0,
        step: 1,
      },
      {
        name: "atBats",
        label: "打数",
        placeholder: "例: 150",
        min: 0,
        step: 1,
      },
    ],
    outputs: [
      {
        label: "打率",
        format: (value: number) => value.toFixed(3).replace(/^0/, ""),
      },
    ],
    calculate: (values: Record<string, number>) => {
      const { hits, atBats } = values;
      if (!atBats || atBats === 0) return null;
      if (hits > atBats) return null;
      return hits / atBats;
    },
    faq: [
      {
        question: "打率とは何ですか？",
        answer:
          "打率は、打者がヒットを打つ確率を示す指標です。安打数を打数で割って算出します。例えば100打数30安打なら打率.300になります。",
      },
      {
        question: "打率の計算方法は？",
        answer:
          "打率 = 安打数 ÷ 打数 で計算します。四球、死球、犠打、犠飛は打数に含まれません。",
      },
      {
        question: "良い打率の目安は？",
        answer:
          "一般的に.300以上で好打者、.250前後が平均的、.200以下は打撃不振とされます。プロ野球の首位打者は.330〜.350程度のことが多いです。",
      },
    ],
    relatedSlugs: ["obp", "ops", "slugging"],
  },
  era: {
    slug: "era",
    title: "防御率計算ツール",
    metaTitle: "防御率（ERA）計算ツール｜自責点と投球回から防御率を自動計算",
    metaDescription:
      "自責点と投球回を入力するだけで防御率（ERA）を自動計算。登録不要・無料でブラウザからすぐ使えます。防御率の計算式・目安値・意味もわかりやすく解説。投手の実力を客観的に評価する基本指標です。",
    heading: "防御率（ERA）計算ツール",
    description:
      "自責点と投球回を入力して、防御率を計算できます。防御率は投手の実力を測る最も基本的な指標です。",
    explanation:
      "防御率（ERA: Earned Run Average）は、投手が9イニング投げた場合に何点の自責点を許すかを示す指標です。投手の実力を測る最も基本的な指標であり、値が低いほど優秀な投手とされます。エラーによる失点は自責点に含まれないため、純粋な投手の能力を反映します。",
    formula: "防御率 = 自責点 × 9 ÷ 投球回数",
    formulaExample: "例：60投球回で自責点12の場合、防御率 = 12 × 9 ÷ 60 = 1.80",
    guide: [
      { label: "2.00未満", description: "エース級（非常に優秀）" },
      { label: "2.00〜3.00", description: "優秀な投手" },
      { label: "3.00〜4.00", description: "平均的な投手" },
      { label: "4.00以上", description: "改善が必要" },
    ],
    fields: [
      {
        name: "earnedRuns",
        label: "自責点",
        placeholder: "例: 12",
        min: 0,
        step: 1,
      },
      {
        name: "inningsPitched",
        label: "投球回",
        placeholder: "例: 60",
        min: 0,
        step: 0.1,
      },
    ],
    outputs: [
      {
        label: "防御率",
        format: (value: number) => value.toFixed(2),
      },
    ],
    calculate: (values: Record<string, number>) => {
      const { earnedRuns, inningsPitched } = values;
      if (!inningsPitched || inningsPitched === 0) return null;
      return (earnedRuns * 9) / inningsPitched;
    },
    faq: [
      {
        question: "防御率とは何ですか？",
        answer:
          "防御率（ERA）は、投手が9イニング（1試合分）を投げた場合に何点の自責点を許すかを示す指標です。値が低いほど優秀な投手です。",
      },
      {
        question: "防御率の計算方法は？",
        answer:
          "防御率 = 自責点 × 9 ÷ 投球回数 で計算します。エラーによる失点（非自責点）は含まれません。",
      },
      {
        question: "良い防御率の目安は？",
        answer:
          "一般的に2.00未満はエース級、2.00〜3.00は優秀、3.00〜4.00が平均的とされます。",
      },
    ],
    relatedSlugs: ["whip", "k-9", "k-bb"],
  },
  ops: {
    slug: "ops",
    title: "OPS計算ツール",
    metaTitle: "OPS計算ツール｜出塁率・長打率・OPSを生データから一括自動計算",
    metaDescription:
      "安打・四球・死球・塁打を入力するだけでOPS・出塁率・長打率を一括自動計算。登録不要・無料でブラウザからすぐ使えます。OPSの計算式・目安値・意味もわかりやすく解説。野球の打撃力を総合評価する指標を今すぐチェック。",
    heading: "OPS計算ツール",
    description:
      "成績データを入力して、出塁率・長打率・OPSを一括で計算できます。OPSは打者の総合的な攻撃力を示す指標です。",
    explanation:
      "OPS（On-base Plus Slugging）は出塁率と長打率を足した値で、打者の総合的な攻撃力を示す指標です。出塁能力と長打力の両方を評価できるため、近年の野球分析で非常に重視されています。打率よりも得点との相関が高く、打者の実力をより正確に反映するとされています。",
    formula: "OPS = 出塁率 + 長打率",
    formulaExample: "例：出塁率.380 + 長打率.520 = OPS .900",
    guide: [
      { label: ".900以上", description: "強打者（一流レベル）" },
      { label: ".800〜.899", description: "優秀な打者" },
      { label: ".700〜.799", description: "平均的な打者" },
      { label: ".700未満", description: "打撃力に課題あり" },
    ],
    fields: [
      {
        name: "hits",
        label: "安打数",
        placeholder: "例: 45",
        min: 0,
        step: 1,
      },
      {
        name: "atBats",
        label: "打数",
        placeholder: "例: 150",
        min: 0,
        step: 1,
      },
      {
        name: "walks",
        label: "四球",
        placeholder: "例: 20",
        min: 0,
        step: 1,
      },
      {
        name: "hitByPitch",
        label: "死球",
        placeholder: "例: 3",
        min: 0,
        step: 1,
      },
      {
        name: "sacrificeFlies",
        label: "犠飛",
        placeholder: "例: 2",
        min: 0,
        step: 1,
      },
      {
        name: "totalBases",
        label: "塁打数",
        placeholder: "例: 75",
        min: 0,
        step: 1,
      },
    ],
    outputs: [
      {
        label: "出塁率",
        key: "obp",
        format: (value: number) => value.toFixed(3).replace(/^0/, ""),
      },
      {
        label: "長打率",
        key: "slg",
        format: (value: number) => value.toFixed(3).replace(/^0/, ""),
      },
      {
        label: "OPS",
        key: "ops",
        format: (value: number) => value.toFixed(3).replace(/^0/, ""),
      },
    ],
    calculate: (
      values: Record<string, number>,
    ): Record<string, number | null> | null => {
      const { hits, atBats, walks, hitByPitch, sacrificeFlies, totalBases } =
        values;
      const obpDenominator = atBats + walks + hitByPitch + sacrificeFlies;
      if (!obpDenominator || obpDenominator === 0) return null;
      if (!atBats || atBats === 0) return null;
      const obp = (hits + walks + hitByPitch) / obpDenominator;
      const slg = totalBases / atBats;
      return { obp, slg, ops: obp + slg };
    },
    faq: [
      {
        question: "OPSとは何ですか？",
        answer:
          "OPS（On-base Plus Slugging）は出塁率と長打率を合計した指標で、打者の総合的な攻撃力を示します。打率よりも得点貢献度との相関が高いとされています。",
      },
      {
        question: "OPSの計算方法は？",
        answer:
          "OPS = 出塁率 + 長打率 で計算します。出塁率 =（安打+四球+死球）÷（打数+四球+死球+犠飛）、長打率 = 塁打数 ÷ 打数 です。",
      },
      {
        question: "良いOPSの目安は？",
        answer:
          ".900以上は強打者、.800〜.899は優秀、.700〜.799が平均的とされます。1.000を超えるとリーグを代表する打者レベルです。",
      },
    ],
    relatedSlugs: ["batting-average", "obp", "slugging"],
  },
  slugging: {
    slug: "slugging",
    title: "長打率計算ツール",
    metaTitle: "長打率（SLG）計算ツール｜塁打数と打数から長打率を自動計算",
    metaDescription:
      "塁打数と打数を入力するだけで長打率（SLG）を自動計算。登録不要・無料でブラウザからすぐ使えます。長打率の計算式・目安値・意味を解説。長打力を数値で評価したい方におすすめ。",
    heading: "長打率（SLG）計算ツール",
    description:
      "塁打数と打数を入力して、長打率を計算できます。長打率は打者の長打力を示す指標です。",
    explanation:
      "長打率（SLG: Slugging Percentage）は、打者が1打数あたりに稼ぐ塁打数の平均を示す指標です。単打を1、二塁打を2、三塁打を3、本塁打を4として合計した塁打数を打数で割って算出します。打率とは異なり、長打の価値を高く評価するため、打者の長打力をより正確に反映します。",
    formula: "長打率 = 塁打数 ÷ 打数",
    formulaExample: "例：150打数で塁打数75の場合、長打率 = 75 ÷ 150 = .500",
    guide: [
      { label: ".500以上", description: "長打力が非常に高い" },
      { label: ".400〜.499", description: "平均以上の長打力" },
      { label: ".300〜.399", description: "平均的" },
      { label: ".300未満", description: "長打力に課題あり" },
    ],
    fields: [
      {
        name: "totalBases",
        label: "塁打数",
        placeholder: "例: 75",
        min: 0,
        step: 1,
      },
      {
        name: "atBats",
        label: "打数",
        placeholder: "例: 150",
        min: 0,
        step: 1,
      },
    ],
    outputs: [
      {
        label: "長打率",
        format: (value: number) => value.toFixed(3).replace(/^0/, ""),
      },
    ],
    calculate: (values: Record<string, number>) => {
      const { totalBases, atBats } = values;
      if (!atBats || atBats === 0) return null;
      return totalBases / atBats;
    },
    faq: [
      {
        question: "長打率とは何ですか？",
        answer:
          "長打率は、打者が1打数あたりに平均何塁打を稼ぐかを示す指標です。長打の価値を高く評価するため、打者の長打力を正確に反映します。",
      },
      {
        question: "長打率の計算方法は？",
        answer:
          "長打率 = 塁打数 ÷ 打数 で計算します。塁打数は、単打×1 + 二塁打×2 + 三塁打×3 + 本塁打×4 の合計です。",
      },
      {
        question: "長打率と打率の違いは？",
        answer:
          "打率はすべてのヒットを等しく1として扱いますが、長打率は二塁打以上の長打をより高く評価します。そのため長打率は打者の長打力を反映する指標です。",
      },
    ],
    relatedSlugs: ["batting-average", "ops", "obp"],
  },
  obp: {
    slug: "obp",
    title: "出塁率計算ツール",
    metaTitle: "出塁率（OBP）計算ツール｜安打・四球・死球から出塁率を自動計算",
    metaDescription:
      "安打・四球・死球・打数・犠飛を入力するだけで出塁率（OBP）を自動計算。登録不要・無料でブラウザからすぐ使えます。出塁率の計算式・目安値・意味もわかりやすく解説。打率との違いや高い出塁率の基準も紹介。",
    heading: "出塁率（OBP）計算ツール",
    description:
      "成績データを入力して、出塁率を計算できます。出塁率は打者がどれだけの確率で出塁するかを示す指標です。",
    explanation:
      "出塁率（OBP: On-Base Percentage）は、打者が打席に立った際にどれだけの確率で出塁できるかを示す指標です。安打だけでなく四球や死球による出塁も含むため、打率よりも打者の出塁能力をより正確に反映します。選球眼の良い打者は打率以上に出塁率が高くなります。",
    formula: "出塁率 =（安打 + 四球 + 死球）÷（打数 + 四球 + 死球 + 犠飛）",
    formulaExample:
      "例：150打数45安打、20四球、3死球、2犠飛の場合、出塁率 =（45+20+3）÷（150+20+3+2）= .389",
    guide: [
      { label: ".400以上", description: "非常に優秀な出塁能力" },
      { label: ".350〜.399", description: "優秀な打者" },
      { label: ".300〜.349", description: "平均的" },
      { label: ".300未満", description: "出塁能力に課題あり" },
    ],
    fields: [
      {
        name: "hits",
        label: "安打数",
        placeholder: "例: 45",
        min: 0,
        step: 1,
      },
      {
        name: "walks",
        label: "四球",
        placeholder: "例: 20",
        min: 0,
        step: 1,
      },
      {
        name: "hitByPitch",
        label: "死球",
        placeholder: "例: 3",
        min: 0,
        step: 1,
      },
      {
        name: "atBats",
        label: "打数",
        placeholder: "例: 150",
        min: 0,
        step: 1,
      },
      {
        name: "sacrificeFlies",
        label: "犠飛",
        placeholder: "例: 2",
        min: 0,
        step: 1,
      },
    ],
    outputs: [
      {
        label: "出塁率",
        format: (value: number) => value.toFixed(3).replace(/^0/, ""),
      },
    ],
    calculate: (values: Record<string, number>) => {
      const { hits, walks, hitByPitch, atBats, sacrificeFlies } = values;
      const denominator = atBats + walks + hitByPitch + sacrificeFlies;
      if (!denominator || denominator === 0) return null;
      return (hits + walks + hitByPitch) / denominator;
    },
    faq: [
      {
        question: "出塁率とは何ですか？",
        answer:
          "出塁率は、打者が打席に立った際にどれだけの確率で塁に出られるかを示す指標です。安打に加えて四球や死球による出塁も含みます。",
      },
      {
        question: "出塁率の計算方法は？",
        answer:
          "出塁率 =（安打 + 四球 + 死球）÷（打数 + 四球 + 死球 + 犠飛）で計算します。犠打は含まれません。",
      },
      {
        question: "出塁率と打率の違いは？",
        answer:
          "打率は安打数÷打数で計算しますが、出塁率は四球や死球による出塁も含みます。選球眼の良い打者は打率より出塁率が高くなります。",
      },
    ],
    relatedSlugs: ["batting-average", "ops", "slugging"],
  },
  whip: {
    slug: "whip",
    title: "WHIP計算ツール",
    metaTitle: "WHIP計算ツール｜与四球と被安打から WHIPを自動計算",
    metaDescription:
      "与四球・被安打・投球回を入力するだけでWHIPを自動計算。登録不要・無料でブラウザからすぐ使えます。WHIPの計算式・目安値・意味もわかりやすく解説。1イニングあたりの走者許容率で投手力を評価。",
    heading: "WHIP計算ツール",
    description:
      "与四球・被安打・投球回を入力して、WHIPを計算できます。WHIPは投手の安定性を示す指標です。",
    explanation:
      "WHIP（Walks plus Hits per Inning Pitched）は、1イニングあたりに投手が許した走者数（安打と四球の合計）を示す指標です。防御率と並んで投手の安定性を評価する重要な指標で、値が低いほどランナーを許さない優れた投手とされます。",
    formula: "WHIP =（与四球 + 被安打）÷ 投球回",
    formulaExample:
      "例：60投球回で与四球15、被安打50の場合、WHIP =（15+50）÷ 60 = 1.08",
    guide: [
      { label: "1.00未満", description: "エース級（非常に優秀）" },
      { label: "1.00〜1.20", description: "優秀な投手" },
      { label: "1.20〜1.40", description: "平均的な投手" },
      { label: "1.40以上", description: "改善が必要" },
    ],
    fields: [
      {
        name: "walks",
        label: "与四球",
        placeholder: "例: 15",
        min: 0,
        step: 1,
      },
      {
        name: "hitsAllowed",
        label: "被安打",
        placeholder: "例: 50",
        min: 0,
        step: 1,
      },
      {
        name: "inningsPitched",
        label: "投球回",
        placeholder: "例: 60",
        min: 0,
        step: 0.1,
      },
    ],
    outputs: [
      {
        label: "WHIP",
        format: (value: number) => value.toFixed(2),
      },
    ],
    calculate: (values: Record<string, number>) => {
      const { walks, hitsAllowed, inningsPitched } = values;
      if (!inningsPitched || inningsPitched === 0) return null;
      return (walks + hitsAllowed) / inningsPitched;
    },
    faq: [
      {
        question: "WHIPとは何ですか？",
        answer:
          "WHIP（Walks plus Hits per Inning Pitched）は、1イニングあたりに投手が許した走者数を示す指標です。被安打と与四球の合計を投球回で割って算出します。",
      },
      {
        question: "WHIPの計算方法は？",
        answer:
          "WHIP =（与四球 + 被安打）÷ 投球回 で計算します。死球は含まれません。",
      },
      {
        question: "良いWHIPの目安は？",
        answer:
          "1.00未満はエース級、1.00〜1.20は優秀、1.20〜1.40が平均的とされます。",
      },
    ],
    relatedSlugs: ["era", "k-9", "k-bb"],
  },
  "k-bb": {
    slug: "k-bb",
    title: "K/BB計算ツール",
    metaTitle: "K/BB計算ツール｜奪三振と与四球からK/BBを自動計算",
    metaDescription:
      "奪三振と与四球を入力するだけでK/BB（奪三振÷与四球）を自動計算。登録不要・無料でブラウザからすぐ使えます。K/BBの計算式・目安値・意味を解説。投手の制球力と奪三振能力のバランスを評価する指標です。",
    heading: "K/BB計算ツール",
    description:
      "奪三振と与四球を入力して、K/BBを計算できます。K/BBは投手の制球力と支配力のバランスを示す指標です。",
    explanation:
      "K/BB（Strikeout-to-Walk Ratio）は、奪三振数を与四球数で割った値で、投手の制球力と奪三振能力のバランスを示す指標です。値が高いほど、三振を多く奪いながら四球を少なく抑える優れた投手とされます。",
    formula: "K/BB = 奪三振 ÷ 与四球",
    formulaExample: "例：奪三振80、与四球20の場合、K/BB = 80 ÷ 20 = 4.00",
    guide: [
      { label: "4.00以上", description: "非常に優秀な制球力" },
      { label: "3.00〜3.99", description: "優秀な投手" },
      { label: "2.00〜2.99", description: "平均的な投手" },
      { label: "2.00未満", description: "制球力に課題あり" },
    ],
    fields: [
      {
        name: "strikeouts",
        label: "奪三振",
        placeholder: "例: 80",
        min: 0,
        step: 1,
      },
      {
        name: "walks",
        label: "与四球",
        placeholder: "例: 20",
        min: 0,
        step: 1,
      },
    ],
    outputs: [
      {
        label: "K/BB",
        format: (value: number) => value.toFixed(2),
      },
    ],
    calculate: (values: Record<string, number>) => {
      const { strikeouts, walks } = values;
      if (!walks || walks === 0) return null;
      return strikeouts / walks;
    },
    faq: [
      {
        question: "K/BBとは何ですか？",
        answer:
          "K/BBは奪三振数を与四球数で割った値で、投手の制球力と奪三振能力のバランスを示します。値が高いほど優れた投手です。",
      },
      {
        question: "K/BBの計算方法は？",
        answer: "K/BB = 奪三振 ÷ 与四球 で計算します。",
      },
      {
        question: "良いK/BBの目安は？",
        answer:
          "4.00以上は非常に優秀、3.00〜3.99は優秀、2.00〜2.99が平均的とされます。",
      },
    ],
    relatedSlugs: ["era", "whip", "k-9"],
  },
  "k-9": {
    slug: "k-9",
    title: "K/9計算ツール",
    metaTitle: "K/9計算ツール｜奪三振数と投球回からK/9を自動計算",
    metaDescription:
      "奪三振数と投球回を入力するだけでK/9（9イニングあたり奪三振数）を自動計算。登録不要・無料でブラウザからすぐ使えます。K/9の計算式・目安値・意味を解説。投手の奪三振能力を評価する指標です。",
    heading: "K/9計算ツール",
    description:
      "奪三振数と投球回を入力して、K/9を計算できます。K/9は投手の奪三振能力を示す指標です。",
    explanation:
      "K/9（Strikeouts per 9 innings）は、投手が9イニング投げた場合に何個の三振を奪えるかを示す指標です。投手の奪三振能力を測る基本的な指標で、値が高いほど三振を多く奪える支配的な投手とされます。",
    formula: "K/9 =（奪三振数 × 9）÷ 投球回数",
    formulaExample: "例：60投球回で奪三振60の場合、K/9 =（60 × 9）÷ 60 = 9.00",
    guide: [
      { label: "9.00以上", description: "奪三振能力が非常に高い" },
      { label: "7.00〜8.99", description: "優秀な奪三振能力" },
      { label: "5.00〜6.99", description: "平均的" },
      { label: "5.00未満", description: "奪三振能力に課題あり" },
    ],
    fields: [
      {
        name: "strikeouts",
        label: "奪三振数",
        placeholder: "例: 60",
        min: 0,
        step: 1,
      },
      {
        name: "inningsPitched",
        label: "投球回",
        placeholder: "例: 60",
        min: 0,
        step: 0.1,
      },
    ],
    outputs: [
      {
        label: "K/9",
        format: (value: number) => value.toFixed(2),
      },
    ],
    calculate: (values: Record<string, number>) => {
      const { strikeouts, inningsPitched } = values;
      if (!inningsPitched || inningsPitched === 0) return null;
      return (strikeouts * 9) / inningsPitched;
    },
    faq: [
      {
        question: "K/9とは何ですか？",
        answer:
          "K/9は投手が9イニングあたりに奪える三振の数を示す指標です。値が高いほど奪三振能力が高い投手です。",
      },
      {
        question: "K/9の計算方法は？",
        answer: "K/9 =（奪三振数 × 9）÷ 投球回数 で計算します。",
      },
      {
        question: "良いK/9の目安は？",
        answer:
          "9.00以上は非常に優秀、7.00〜8.99は優秀、5.00〜6.99が平均的とされます。",
      },
    ],
    relatedSlugs: ["era", "whip", "k-bb"],
  },
  "bb-9": {
    slug: "bb-9",
    title: "BB/9計算ツール",
    metaTitle: "BB/9計算ツール｜与四球と投球回からBB/9を自動計算",
    metaDescription:
      "与四球と投球回を入力するだけでBB/9（9イニングあたり与四球数）を自動計算。登録不要・無料でブラウザからすぐ使えます。BB/9の計算式・目安値・意味を解説。投手の制球力を数値で把握できます。",
    heading: "BB/9計算ツール",
    description:
      "与四球と投球回を入力して、BB/9を計算できます。BB/9は投手の制球力を示す指標です。",
    explanation:
      "BB/9（Walks per 9 innings）は、投手が9イニング投げた場合に何個の四球を与えるかを示す指標です。投手の制球力を測る指標で、値が低いほどコントロールの良い投手とされます。",
    formula: "BB/9 =（与四球 ÷ 投球回）× 9",
    formulaExample: "例：60投球回で与四球15の場合、BB/9 =（15 ÷ 60）× 9 = 2.25",
    guide: [
      { label: "2.00未満", description: "非常に優秀な制球力" },
      { label: "2.00〜3.00", description: "優秀な制球力" },
      { label: "3.00〜4.00", description: "平均的" },
      { label: "4.00以上", description: "制球力に課題あり" },
    ],
    fields: [
      {
        name: "walks",
        label: "与四球",
        placeholder: "例: 15",
        min: 0,
        step: 1,
      },
      {
        name: "inningsPitched",
        label: "投球回",
        placeholder: "例: 60",
        min: 0,
        step: 0.1,
      },
    ],
    outputs: [
      {
        label: "BB/9",
        format: (value: number) => value.toFixed(2),
      },
    ],
    calculate: (values: Record<string, number>) => {
      const { walks, inningsPitched } = values;
      if (!inningsPitched || inningsPitched === 0) return null;
      return (walks / inningsPitched) * 9;
    },
    faq: [
      {
        question: "BB/9とは何ですか？",
        answer:
          "BB/9は投手が9イニングあたりに与える四球の数を示す指標です。値が低いほど制球力が高い投手です。",
      },
      {
        question: "BB/9の計算方法は？",
        answer: "BB/9 =（与四球 ÷ 投球回）× 9 で計算します。",
      },
      {
        question: "良いBB/9の目安は？",
        answer:
          "2.00未満は非常に優秀、2.00〜3.00は優秀、3.00〜4.00が平均的とされます。",
      },
    ],
    relatedSlugs: ["era", "whip", "k-bb"],
  },
};

export function getCalculatorDefinition(
  slug: string,
): CalculatorDefinition | undefined {
  return calculatorDefinitions[slug];
}

export function getAllCalculatorSlugs(): string[] {
  return Object.keys(calculatorDefinitions);
}
