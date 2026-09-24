import Link from "next/link";
import AdBanner from "@app/components/ad/AdBanner";
import { adSlots } from "@app/components/ad/adConfig";
import CtaBanner from "../../_components/CtaBanner";
import Breadcrumbs from "../../tools/_components/Breadcrumbs";
import ColumnArticleJsonLd from "../_components/ColumnArticleJsonLd";
import OpsLevelChecker from "./_components/OpsLevelChecker";
import { OPS_BENCHMARKS } from "./_constants/benchmarks";

const faqItems = [
  {
    question: "OPSはいくつから良いと言える？",
    answer:
      "歴史的に NPB のリーグ平均は .700 前後とされてきましたが、近年は .660〜.700 まで低下しているため、現代の感覚では .700 を超えれば「平均より良い」、.800 を超えればクリーンアップを任される好打者、.900 以上で中心打者、1.000 超えでリーグを代表するスラッガーが目安です。",
  },
  {
    question: "OPS .700／.800／.900／1.000 のそれぞれの意味は？",
    answer:
      ".700はリーグ平均水準（レギュラー定着の目安）、.800はクリーンアップ任せられる好打者、.900は中心打者・タイトル争いに絡むレベル、1.000超えはMVP・首位打者級の超一流打者を意味します。",
  },
  {
    question: "OPS .700 を超えるための課題は？",
    answer:
      "出塁率（OBP）.330 / 長打率（SLG）.370 程度が目安です。三振が多すぎて出塁率が低いタイプか、ゴロが多すぎて長打率が伸びないタイプかで取り組むべき課題が変わります。",
  },
  {
    question: "OPS .800 を超えるにはどうすればいい？",
    answer:
      "出塁率（OBP）を .350 以上に保ちつつ長打率（SLG）を .450 以上に伸ばすのが目安です。四球を恐れずに選ぶ姿勢と、長打になりやすいバッティング軌道の両立がポイントになります。",
  },
  {
    question: "OPS 1超え（1.000以上）の意味は？",
    answer:
      "出塁率と長打率の合計が1.000を超える状態のことです。NPBでも年間で達成できる選手は数人レベル、MLBでも歴代の超一流打者の象徴的な数字として扱われます。",
  },
  {
    question: "OPSの理論上の最大値は？",
    answer:
      "出塁率の理論最大は 1.000、長打率の理論最大は 4.000（毎打席本塁打）なので、OPS の理論上の最大値は 5.000 です。ただし実戦でこの数値に近づくことはなく、規定打席ベースでのシーズン最高値は MLB のバリー・ボンズ（2004 年）の 1.422、NPB の王貞治（1974 年）の 1.293 が事実上の天井です。",
  },
  {
    question: "MLBシーズン最高のOPSは？",
    answer:
      "MLB歴代シーズン最高OPSはバリー・ボンズが2004年に記録した1.422とされています。次いでバリー・ボンズの2002年（1.381）、ベーブ・ルースの1920年（1.379）、バリー・ボンズの2001年（1.379）などが続きます。",
  },
  {
    question: "NPBシーズン最高のOPSは？",
    answer:
      "NPB歴代最高は王貞治（1974年）の1.293で、次いでランディ・バース（1986年）の1.258、王貞治（1973年）の1.255、落合博満（1985年）の1.244、ウラディミール・バレンティン（2013年）の1.234が上位に並びます。歴代でも1.200を超えた例は限られています。",
  },
  {
    question: "高校野球のOPS目安は？",
    answer:
      "金属バットの影響で数値が出やすく、.800前後でレギュラー上位、.900以上で強打者、1.000超えで地区を代表するレベルが目安です。",
  },
  {
    question: "中学野球（シニア・ボーイズ）のOPS目安は？",
    answer:
      "中学硬式（シニア・ボーイズ等）でも金属バットが中心のため、.800前後でレギュラー上位、.900以上で4番候補、1.000超えで全国レベルの強打者の目安になります。",
  },
  {
    question: "OPSの基準はNPBとMLBで変わる？",
    answer:
      "基本的な評価基準（.800で優秀／.900で強打者／1.000超えで超一流）はほぼ共通で使えます。MLBの方が長打率が出やすい傾向はありますが、目安の桁が変わるほどの差ではありません。",
  },
];

const mlbRecords = [
  "バリー・ボンズ（2004年）: 1.422",
  "バリー・ボンズ（2002年）: 1.381",
  "ベーブ・ルース（1920年）: 1.379",
  "バリー・ボンズ（2001年）: 1.379",
  "ベーブ・ルース（1921年）: 1.359",
  "ベーブ・ルース（1923年）: 1.309",
  "テッド・ウィリアムズ（1941年）: 1.287",
];

const npbRecords = [
  "王貞治（1974年）: 1.293",
  "ランディ・バース（1986年）: 1.258",
  "王貞治（1973年）: 1.255",
  "落合博満（1985年）: 1.244",
  "バレンティン（2013年）: 1.234",
];

export default function OpsCriteriaColumnPage() {
  return (
    <>
      <ColumnArticleJsonLd
        headline="OPSはいくつから良い？レベル別の目安・基準・現場感を野球指標で解説"
        description="OPS（オーピーエス）はいくつから良いのか、.700／.800／.900／1.000 の意味とカテゴリ別（中学・高校・大学・社会人・プロ）の目安を解説。4番を任されるOPSや強豪校レギュラーのOPSなどの現場感、理論上の最大値（5.000）と NPB・MLB 歴代最高記録まで紹介。"
        path="/column/ops-criteria"
        breadcrumbLeafName="OPSの目安・基準"
        faq={faqItems}
      />
      <Breadcrumbs
        items={[
          { label: "BUZZ BASE", href: "/" },
          { label: "コラム", href: "/column" },
          { label: "OPSの目安・基準" },
        ]}
      />

      <h1 className="text-2xl font-bold">
        OPSはいくつから良い？レベル別の目安・基準を野球指標で解説
      </h1>

      <p className="text-sm text-zinc-300 leading-6 mt-4">
        OPS（オーピーエス）の良し悪しを判断する目安は、
        <strong>
          「.700で平均」「.800で好打者」「.900で中心打者」「1.000で超一流」
        </strong>
        の4段階で覚えるとシンプルです。本記事ではNPB・MLB・高校野球・中学野球それぞれのレベル別目安と、「4番を任されるOPS」「強豪校レギュラーのOPS」など現場感のある数字、OPSの理論上の最大値と歴代最高記録まで紹介します。自分のOPSを入力すると、カテゴリ別にどのレベルかをその場で判定できます。
      </p>

      <p className="text-sm text-zinc-400 leading-6 mt-2">
        OPSの意味や計算式から確認したい場合は{" "}
        <Link
          href="/column/ops"
          className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
        >
          OPSとは？意味・計算方法の記事
        </Link>{" "}
        を併せてご覧ください。
      </p>

      <nav
        aria-label="この記事の目次"
        className="mt-6 rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4"
      >
        <p className="text-sm font-bold text-zinc-200 mb-2">この記事の目次</p>
        <ul className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
          {[
            ["#benchmarks", "カテゴリ別 OPS 目安テーブル"],
            ["#checker", "あなたのOPSはどのレベル？"],
            ["#ops-700", "OPS .700 は平均？"],
            ["#ops-800", "OPS .800 はどのレベル？"],
            ["#ops-900", "OPS .900 は中心打者"],
            ["#ops-max", "OPS の最大値と歴代最高記録"],
            ["#field-sense", "現場感のある目安"],
          ].map(([href, label]) => (
            <li key={href}>
              <a
                href={href}
                className="text-yellow-500 hover:text-yellow-400 transition-colors"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="benchmarks" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold mb-4">
          カテゴリ別 OPS 目安テーブル（プロ／高校／中学）
        </h2>
        <p className="text-sm text-zinc-300 leading-6 mb-4">
          金属バット／木製バットの違い、球場の広さ、投手レベルの差により、同じOPSでもカテゴリによって意味合いが変わります。下表は現場で語られることの多い目安をまとめたものです。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-700">
            <thead>
              <tr className="bg-zinc-800">
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  レベル
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  OPS
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  プロ野球
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  高校野球
                </th>
                <th className="px-3 py-2 text-left border-b border-zinc-700 text-zinc-300">
                  中学野球
                </th>
              </tr>
            </thead>
            <tbody>
              {OPS_BENCHMARKS.map((row) => (
                <tr key={row.key} className="even:bg-zinc-800/50 align-top">
                  <td
                    className={`px-3 py-2 border-b border-zinc-700 font-bold ${row.color}`}
                  >
                    {row.level}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300 whitespace-nowrap">
                    {row.ops}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                    {row.pro}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                    {row.high}
                  </td>
                  <td className="px-3 py-2 border-b border-zinc-700 text-zinc-300">
                    {row.middle}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="checker" className="mt-8 scroll-mt-24">
        <OpsLevelChecker />
        <p className="mt-3 text-sm text-zinc-400 leading-6">
          OPS がまだ分からない場合は{" "}
          <Link
            href="/tools/ops"
            className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
          >
            OPS計算ツール
          </Link>{" "}
          で安打数・打数・四球・死球・塁打数から計算できます。
        </p>
      </section>

      <AdBanner slot={adSlots.columnMiddle} className="mt-8" />

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">
          数値帯ごとのOPSの意味（.700／.800／.900／1.000）
        </h2>

        <div className="space-y-6">
          <div
            id="ops-700"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4 scroll-mt-24"
          >
            <h3 className="font-bold text-zinc-200">
              <span className="text-yellow-500">.700</span> ／
              リーグ平均ライン（OPS .700 は平均？）
            </h3>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              歴史的には NPB・MLB ともリーグ全体の平均 OPS が .700
              前後とされ、レギュラー定着の最低ラインと言われてきました。直近の
              NPB は .660〜.700 まで低下しているため、.700
              を安定して超えてくれば「リーグ平均より上のレギュラー」として十分に評価されます。逆に
              .700
              を下回り続けると、守備や走塁での貢献がなければスタメンを外れやすくなります。
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              金属バットで数字が出やすい高校野球では、.700
              は「平均よりやや下」「公立校のレギュラーレベル」のイメージです。強豪校のレギュラー上位を狙うなら
              .800 以上、4番候補なら .900 以上が必要になってきます。
            </p>
            <p className="text-sm text-zinc-400 leading-6 mt-2">
              .700 を超えるための目安は <strong>OBP .330 + SLG .370</strong>
              。三振が多くて出塁率が低いタイプは選球眼の改善、ゴロが多くて長打率が伸びないタイプは打球角度の改善が課題になります。
            </p>
          </div>

          <div
            id="ops-800"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4 scroll-mt-24"
          >
            <h3 className="font-bold text-zinc-200">
              <span className="text-yellow-500">.800</span> ／ 好打者の入口（OPS
              .800 はどのレベル？）
            </h3>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              リーグ平均を1割以上上回る水準で、クリーンアップ（3〜5番）を任される好打者の目安です。NPB
              のレギュラーでシーズン .800
              以上を残すと、オールスター候補や打撃部門の上位ランキングに名前が挙がるレベルで、MLB
              でも「中軸を任せられる打者」の基準として扱われます。
            </p>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              高校野球では強豪校のレギュラー上位や地方大会の主軸として通用するレベルです。.900
              を超えてくると甲子園を見据える強打者の入口になります。
            </p>
            <p className="text-sm text-zinc-400 leading-6 mt-2">
              .800 を継続する目安は <strong>OBP .350 + SLG .450</strong>
              。四球を選ぶ目と長打を打つバットスピードをバランス良く伸ばす必要があり、極端な選球タイプや極端なフリースインガーは到達しづらい数値です。
            </p>
          </div>

          <div
            id="ops-900"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4 scroll-mt-24"
          >
            <h3 className="font-bold text-zinc-200">
              <span className="text-yellow-500">.900</span> ／
              中心打者・タイトル争い
            </h3>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              チームの中心打者として打線を引っ張るクラス。OPSランキングで上位に入り、シーズン後半にはタイトル争いに名前が挙がる水準です。高校野球なら強豪校の主軸、中学硬式なら全国レベルの4番候補にあたります。
            </p>
          </div>

          {/* 1.000 の受け皿は /column/ops-1000 に残すため、ここは目次に載せず要約と送客に留める */}
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <h3 className="font-bold text-zinc-200">
              <span className="text-amber-400">1.000</span> ／
              超一流（詳細は専用記事）
            </h3>
            <p className="text-sm text-zinc-300 leading-6 mt-2">
              年間を通して1.000を超える選手はNPBでも数人レベル。MLBでも歴代の超一流打者の象徴的な数値として扱われ、「1超え（いちこえ）」と呼ばれることもあります。達成に必要な出塁率・長打率のバランスや歴代の達成者は{" "}
              <Link
                href="/column/ops-1000"
                className="text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
              >
                OPS 1.000 を超える選手の特徴
              </Link>{" "}
              で詳しく解説しています。
            </p>
          </div>
        </div>
      </section>

      <section id="ops-max" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold mb-4">
          OPSの最大値（マックス）は？理論値と歴代最高記録
        </h2>
        <p className="text-sm text-zinc-300 leading-6">
          OPS = OBP + SLG なので、OBP の理論最大 1.000（すべての打席で出塁）と
          SLG の理論最大 4.000（毎打席本塁打）を足した <strong>5.000</strong>{" "}
          が数学的な上限です。1〜2 打席であれば計算上 5.000
          になり得ますが、規定打席に達するシーズン単位では現実的に観測されず、実戦での天井は
          MLB の <strong>1.422（バリー・ボンズ 2004 年）</strong>、NPB の{" "}
          <strong>1.293（王貞治 1974 年）</strong> です。
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <h3 className="font-bold text-zinc-200 mb-2">
              MLB歴代シーズン最高OPS
            </h3>
            <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
              {mlbRecords.map((record) => (
                <li key={record}>{record}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-4">
            <h3 className="font-bold text-zinc-200 mb-2">
              NPB歴代シーズン最高OPS
            </h3>
            <ul className="text-sm text-zinc-300 leading-6 list-disc ml-5 space-y-1">
              {npbRecords.map((record) => (
                <li key={record}>{record}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-sm text-zinc-400 leading-6 mt-3">
          ※年度・出典・規定打席のカウントによって小数第3位以下が変動する場合があります。
        </p>
      </section>

      <section id="field-sense" className="mt-10 scroll-mt-24">
        <h2 className="text-xl font-bold mb-4">
          現場感：「4番を任されるOPS」「強豪校レギュラーのOPS」
        </h2>
        <ul className="space-y-3 text-sm text-zinc-300 leading-6">
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>チームの4番を任される目安：</strong> 高校野球では .850〜.950
            が目安。長打率を高めつつ出塁率を落とさないバランスが必要です。
          </li>
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>強豪校レギュラーの目安：</strong> 打順問わず .800
            を切らないことが目安。OPSがチーム全体で .800
            を超えるとリーグ上位の打力チームと言えます。
          </li>
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>シニア・ボーイズ全国レベルの目安：</strong> 主力打者で .900
            前後、4番で 1.000
            近辺。出塁率より長打率で数字を作るタイプが多い傾向です。
          </li>
          <li className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-5 py-3">
            <strong>大学・社会人野球の目安：</strong>{" "}
            木製バットに切り替わるため数字は下振れする傾向。リーグ戦で .800
            を超えれば十分にスカウト対象になる水準です。
          </li>
        </ul>
      </section>

      <div className="mt-8 rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6 text-center">
        <p className="text-lg font-bold mb-2">
          OPSを計算してレベルを確認しよう
        </p>
        <p className="text-sm text-zinc-300 mb-4">
          安打数・打数・四球・死球・塁打数を入力するだけでOPS・出塁率・長打率を自動計算。レベル評価バッジ付き。
        </p>
        <Link
          href="/tools/ops"
          className="inline-block rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors px-6 py-2.5 text-sm font-bold text-white"
        >
          OPS計算ツールを使う &rarr;
        </Link>
      </div>

      <AdBanner slot={adSlots.columnBottom} className="mt-8" />

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">よくある質問</h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-lg border border-zinc-700 bg-zinc-800/50"
            >
              <summary className="cursor-pointer px-5 py-3 text-sm font-bold text-zinc-200 flex items-center justify-between">
                {item.question}
                <span className="text-zinc-400 group-open:rotate-180 transition-transform">
                  ▼
                </span>
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
            <p className="text-xs text-zinc-400 mt-1">
              意味・計算方法・読み方を解説
            </p>
          </Link>
          <Link
            href="/column/ops-1000"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPS 1.000 を超える選手</p>
            <p className="text-xs text-zinc-400 mt-1">
              歴代スラッガーと「1超え」の意味
            </p>
          </Link>
          <Link
            href="/column/npb-ops-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">NPB の平均 OPS の推移</p>
            <p className="text-xs text-zinc-400 mt-1">
              リーグ平均はいくつか、年度別に整理
            </p>
          </Link>
          <Link
            href="/column/ops-vs-batting-average"
            className="rounded-lg border border-zinc-700 bg-zinc-800/50 hover:border-yellow-600/50 hover:bg-zinc-800 transition-colors px-4 py-3"
          >
            <p className="font-bold text-sm">OPSと打率・長打率の違い</p>
            <p className="text-xs text-zinc-400 mt-1">指標の使い分け方</p>
          </Link>
        </div>
      </section>

      <CtaBanner
        className="mt-10"
        heading="チームの成績をアプリでまとめて管理するなら"
        body="BUZZ BASEアプリなら試合結果を入力するだけで、OPSを含む全29指標を自動算出。チームメイトとランキング形式で成績を共有できます。完全無料。"
      />

      <AdBanner
        slot={adSlots.columnHorizontal}
        format="horizontal"
        className="mt-8"
      />
    </>
  );
}
