const faqItems = [
  {
    question: "打率の計算方法は？",
    answer:
      "打率は「安打数 ÷ 打数」で計算します。打数には四球・死球・犠打・犠飛は含まれません。例えば150打数45安打なら、打率 = 45 ÷ 150 = .300（3割）です。",
  },
  {
    question: "OPSの計算方法は？",
    answer:
      "OPSは「出塁率 + 長打率」で計算します。出塁率は（安打+四球+死球）÷（打数+四球+死球+犠飛）、長打率は塁打数÷打数です。OPSが.800以上なら優秀な打者です。",
  },
  {
    question: "防御率の計算方法は？",
    answer:
      "防御率は「自責点 × 9 ÷ 投球回数」で計算します。投手が9イニング投げたと仮定した場合に何点の自責点を与えるかを示す指標です。2.00以下ならエース級です。",
  },
  {
    question: "出塁率の計算方法は？",
    answer:
      "出塁率は「（安打数 + 四球 + 死球）÷（打数 + 四球 + 死球 + 犠飛）」で計算します。打率と違い、四球や死球による出塁も評価に含まれます。",
  },
  {
    question: "K/BBとは？計算方法は？",
    answer:
      "K/BB（奪三振与四球比率）は「奪三振数 ÷ 与四球数」で計算します。投手の制球力と奪三振能力のバランスを示す指標で、3.5以上なら優秀です。",
  },
];

export default function CalcGradesJsonLd() {
  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "BUZZ BASE",
        item: "https://buzzbase.jp",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "野球成績の計算方法＆指標一覧",
        item: "https://buzzbase.jp/calculation-of-grades",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbList) }}
      />
    </>
  );
}
