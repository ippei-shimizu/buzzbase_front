import type { ProFeature } from "@app/types/pro";

/**
 * Pro 機能ごとの訴求文言。ProUpgradeModal・ProUpsellCard・ProUpsellOverlay が同じ文言を参照する。
 * 特定のコンポーネントに属さないドメインデータとして独立させることで、
 * 文言の追加・修正が UI 実装から切り離され、参照側が増えても定義箇所が分散しない。
 */
export interface PaywallCopy {
  title: string;
  description: string;
  /** 2〜4行の具体的なメリット箇条書き。指定時は description より優先して表示する。 */
  benefits?: string[];
}

// trigger に応じた「なぜこのモーダルを開いたか」のコンテキスト訴求。
// PaywallModal 時代に画面ごとに最適化していたコピーをそのまま流用。
export const PRO_PAYWALL_COPY: Record<ProFeature, PaywallCopy> = {
  no_ads: {
    title: "広告を非表示にして集中する",
    description:
      "Pro プランに加入すると、アプリ内のすべての広告が非表示になります。",
  },
  season_transition_graph: {
    title: "シーズンを跨いだ成長を可視化",
    description:
      "過去複数シーズンの成績を折れ線グラフで比較して、長期的な成長を確認できます。",
  },
  grass_full_history: {
    title: "練習履歴を全期間で確認",
    description:
      "草機能のヒートマップを全期間で表示。継続の積み重ねを実感できます。",
    benefits: [
      "直近1年を超える練習履歴もヒートマップで振り返り",
      "去年の同じ時期と練習量を並べて比較",
      "最も続いた期間や積み上げた日数をいつでも確認",
    ],
  },
  unlimited_practice_menus: {
    title: "練習メニューを無制限に登録",
    description:
      "Pro プランなら4つ目以降の練習メニューも自由に登録・編集できます。",
  },
  unlimited_media_uploads: {
    title: "動画・画像を無制限にアップロード",
    description: "月3点までの制限を撤廃。練習映像をいくらでも保存できます。",
  },
  schedule_copy_next_week: {
    title: "今週のプランを来週にまるごとコピー",
    description:
      "Pro プランなら今週登録した予定をワンタップで来週にコピーでき、プラン作りの手間を省けます。",
  },
  unlimited_menu_sets: {
    title: "メニューセットを無制限に作成",
    description:
      "よく組む練習をセットにして、予定登録や週プランでそのまま使い回せます。",
  },
  unlimited_monthly_goals: {
    title: "個人の期間目標を無制限に設定",
    description:
      "月次・週次・年間の目標を3つ以上、同時に管理できます（無料は合計2つまで）。",
  },
  season_goals: {
    title: "シーズン目標を設定",
    description:
      "1シーズンを通した中長期目標を設定し、月次目標と紐づけて追跡できます。",
  },
  tournament_goals: {
    title: "大会目標を設定",
    description:
      "特定の大会に向けた目標を設定し、その大会の成績で達成を追跡できます。",
  },
  custom_notification_messages: {
    title: "通知メッセージをカスタマイズ",
    description: "練習リマインドや目標達成通知の文言を自分好みに編集できます。",
  },
  detailed_condition_log: {
    title: "コンディションを詳しく記録",
    description:
      "体調・気分・睡眠などを細かく記録し、調子の良し悪しの傾向を把握できます。",
  },
  unlimited_improvement_themes: {
    title: "取り組む課題を無制限に",
    description:
      "複数の課題を同時に設定して、練習やノートをそれぞれの課題に束ねられます。",
  },
  correlation_insights: {
    title: "練習と成績の関係を発見",
    description:
      "素振りや睡眠と打率の傾向を、あなたのデータから自動で読み解きます。",
    benefits: [
      "素振りの本数と打率の関係を自動で分析",
      "睡眠やコンディションと成績のつながりを可視化",
      "成果につながっている練習を数字で確認",
    ],
  },
  unlimited_reflection_templates: {
    title: "振り返りテンプレを自由に作成",
    description:
      "自分専用の問いかけテンプレをいくつでも作って、振り返りの質を高められます。",
  },
  advanced_periodic_review: {
    title: "週次・月次の振り返りレポートを受け取る",
    description:
      "練習量や成績の変化、課題別の取り組み状況、練習と成績のつながりを週末・月末に自動でまとめてお届けします。",
  },
  note_tags: {
    title: "野球ノートにタグを付けて整理",
    description:
      "Pro プランなら野球ノートにタグを付けて、後から振り返りやすく整理できます。",
    benefits: [
      "練習の気づきや試合の振り返りをタグで分類",
      "過去のノートをタグから素早く検索",
      "自分専用のタグも自由に作成可能",
    ],
  },
  multi_game_result_notes: {
    title: "1つのノートに複数の試合を紐付け",
    description:
      "Pro プランなら1つの野球ノートに複数の試合記録を紐付けて振り返れます。",
  },
  multi_improvement_theme_links: {
    title: "1つの記録に複数の課題を紐付け",
    description:
      "Pro プランなら練習記録・野球ノートに複数の課題を同時に紐付けて、取り組みをまとめて振り返れます。",
  },
  practice_menu_trend_detail: {
    title: "メニューごとの推移を詳しく見る",
    description:
      "期間を絞ったグラフや数値の内訳など、メニューごとの詳細な推移をいつでも振り返れます。",
  },
  custom_period_goals: {
    title: "カスタム期間で目標を設定",
    description:
      "「大会前3週間」のように自分で決めた期間で目標を設定し、進み具合を追跡できます。",
  },
  manual_metric_goals: {
    title: "自由指標で目標を設定",
    description:
      "球速や体重など、アプリが自動集計できない自分だけの指標も目標にして手入力で管理できます。",
  },
  shadow_swing_custom_interval: {
    title: "インターバルを自由に設定",
    description:
      "1秒〜20秒の全範囲でインターバルを設定できます。自分のテンポに合わせて素振りを鍛えましょう。",
  },
  shadow_swing_vibration: {
    title: "バイブレーションでテンポを取る",
    description:
      "音を出せない場所でもバイブレーションでインターバルを把握しながら素振りできます。",
  },
  shadow_swing_background: {
    title: "バックグラウンドでも継続実行",
    description:
      "画面ロックやアプリの切り替えで途切れず、素振りの本数と経過時間をそのまま継続できます。",
  },
  schedule_calendar_full_history: {
    title: "カレンダーを全期間閲覧",
    description:
      "先々の予定や過去の練習プランも、月を遡らずカレンダーでいつでも確認できます。",
  },
  unlimited_groups: {
    title: "グループを無制限に作成・参加",
    description:
      "Pro プランなら2つ目以降のグループも自由に作成・参加できます。チームを掛け持ちしているメンバーも安心です。",
  },
  hit_direction_average: {
    title: "方向別の打率",
    description: "打球を打った方向ごとの打率をヒートマップで可視化します。",
    benefits: [
      "引っ張り・センター返し・流し打ちの傾向が一目でわかる",
      "方向ごとの打率をヒートマップで比較",
      "打てていない方向を練習テーマに落とし込める",
    ],
  },
  count_situation_average: {
    title: "カウント別の打率",
    description:
      "初球・有利カウント・追い込みなど、カウント状況別の打率がわかります。",
  },
  pitch_type_average: {
    title: "球種別の打率",
    description: "ストレートや変化球など、球種ごとの得意・苦手が分析できます。",
  },
  pitch_course_average: {
    title: "コース別の打率",
    description:
      "5×5のコース別ヒートマップで得意・苦手なコースがわかります。球種別のクロス集計にも対応。",
  },
  pitcher_faceoff_average: {
    title: "対戦投手別",
    description: "対戦した投手ごとの打撃成績を一覧で確認できます。",
  },
};

export const DEFAULT_PAYWALL_COPY: PaywallCopy = {
  title: "BUZZ BASE Pro でもっと深く野球を",
  description: "Pro プランで全機能のロックを解除できます。",
};
