import type {
  MenuSummary,
  PracticeCategory,
  PracticeMenu,
} from "@app/types/practice";
import { formatTotalAmount, formatVolume } from "@app/constants/practice";

/**
 * 素振り自動ログのメニュー名。back の ShadowSwingSession::MENU_NAME と一致させる。
 * 素振りは練習メニューに紐付かないことがあり、その場合サマリーの practice_menu_id が
 * null になるため、名前で素振りだと見分ける。
 */
export const SHADOW_SWING_MENU_NAME = "素振り";

/** 素振りの推移は別エンドポイントを叩くため、パスではなく source で切り替える。 */
export const SHADOW_SWING_SOURCE = "shadow_swing";

/** 素振りの推移ページのパス。メニュー id を持たないので固定のセグメントを使う。 */
export const SHADOW_SWING_TREND_HREF = `/practice/summary/${SHADOW_SWING_SOURCE}?source=${SHADOW_SWING_SOURCE}`;

/** 1枚のカードに必要な表示情報。 */
export interface MenuSummaryCard {
  /** リストの key。メニュー削除後は id が無いので名前で代用する。 */
  key: string;
  summary: MenuSummary;
  /** アイコン選択に使うカテゴリ。メニューが引けない（削除済み）場合は null。 */
  category: PracticeCategory | null;
  /** 推移ページへのリンク。開けない記録（削除済みメニュー）は null。 */
  href: string | null;
  /** 素振り自動ログの積み上げかどうか。 */
  isShadowSwing: boolean;
}

/**
 * 筋トレ（重さ×回数）の積み上げかどうか。
 * back は unit が weight_reps でなくても重さ付きのログがあれば total_volume を返すため、
 * unit だけでなく total_volume の有無も見る（mobile の判定と揃える）。
 */
export const isWeightRepsSummary = (summary: MenuSummary): boolean =>
  summary.unit === "weight_reps" || summary.total_volume != null;

/**
 * カードのメイン数値のラベル。
 * 筋トレは重さの積み上げ（総挙上重量）、それ以外は量の累計を主役にする。
 */
export const summaryTotalLabel = (summary: MenuSummary): string =>
  isWeightRepsSummary(summary) ? "総挙上重量" : "累計";

/** 累計の表示値。筋トレは「8.2t」、それ以外は「12,400本」。 */
export const summaryTotalText = (summary: MenuSummary): string =>
  isWeightRepsSummary(summary)
    ? formatVolume(summary.total_volume ?? 0)
    : formatTotalAmount(summary.total_amount, summary.unit_label);

/** 今月の表示値。累計と同じ単位で出す（筋トレは「640kg」のように kg 表記になる）。 */
export const summaryMonthText = (summary: MenuSummary): string =>
  isWeightRepsSummary(summary)
    ? formatVolume(summary.this_month_volume ?? 0)
    : formatTotalAmount(summary.this_month_amount, summary.unit_label);

/** 最終記録日を「8/3」の形にする。未記録は "-"。 */
export const formatLastLoggedOn = (isoDate: string | null): string => {
  if (!isoDate) return "-";
  const [, month, day] = isoDate.split("-");
  if (!month || !day) return "-";
  return `${Number(month)}/${Number(day)}`;
};

/** まだ一度も記録していないメニューの空サマリー。 */
const emptySummary = (menu: PracticeMenu): MenuSummary => ({
  practice_menu_id: menu.id,
  menu_name: menu.name,
  unit: menu.unit,
  unit_label: menu.unit_label,
  total_amount: 0,
  total_volume: menu.unit === "weight_reps" ? 0 : null,
  this_month_amount: 0,
  this_month_volume: menu.unit === "weight_reps" ? 0 : null,
  days_count: 0,
  last_logged_on: null,
});

const buildCard = (
  summary: MenuSummary,
  categoryById: Map<number, PracticeCategory>,
): MenuSummaryCard => {
  const menuId = summary.practice_menu_id;
  const isShadowSwing =
    menuId === null && summary.menu_name === SHADOW_SWING_MENU_NAME;

  return {
    key: menuId === null ? `name:${summary.menu_name}` : `menu:${menuId}`,
    summary,
    category: menuId === null ? null : (categoryById.get(menuId) ?? null),
    // 削除済みメニューの記録は practice_menu_id が null になり、推移を集計できない。
    href:
      menuId !== null
        ? `/practice/summary/${menuId}`
        : isShadowSwing
          ? SHADOW_SWING_TREND_HREF
          : null,
    isShadowSwing,
  };
};

/**
 * サマリーと登録メニューを突き合わせ、カードの表示順を決める。
 *
 * 並びは最終記録日の新しい順。まだ記録していないメニューは日付を持たないため末尾に置く。
 * back のサマリーは記録のあるメニューしか含まないので、未記録のメニューはここで補う。
 *
 * @param summaries back のメニュー別サマリー（記録のあるものだけ）
 * @param menus 登録中の練習メニュー。カテゴリアイコンと未記録メニューの補完に使う
 */
export const buildMenuSummaryCards = (
  summaries: MenuSummary[],
  menus: PracticeMenu[],
): MenuSummaryCard[] => {
  const categoryById = new Map(menus.map((menu) => [menu.id, menu.category]));
  const recordedMenuIds = new Set(
    summaries
      .map((summary) => summary.practice_menu_id)
      .filter((id): id is number => id !== null),
  );
  const unrecorded = menus
    .filter((menu) => !recordedMenuIds.has(menu.id))
    .map(emptySummary);

  return [...summaries, ...unrecorded]
    .map((summary) => buildCard(summary, categoryById))
    .sort((a, b) =>
      (b.summary.last_logged_on ?? "").localeCompare(
        a.summary.last_logged_on ?? "",
      ),
    );
};
