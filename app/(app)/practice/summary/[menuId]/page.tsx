import type { MenuTrendView } from "./_components/MenuTrendContent";
import type { MenuTrend } from "@app/types/practice";
import type { Feature } from "@app/types/pro";
import ArrowLeftIcon from "@heroicons/react/24/outline/ArrowLeftIcon";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCachedProStatus } from "@app/(app)/pro/proStatus";
import Header from "@app/components/header/Header";
import { getPracticeMenus } from "@app/services/v2/practiceMenuService";
import {
  getMenuTrend,
  getShadowSwingTrend,
} from "@app/services/v2/practiceSummaryService";
import { DEFAULT_PRO_STATUS } from "@app/types/pro";
import {
  SHADOW_SWING_MENU_NAME,
  SHADOW_SWING_SOURCE,
} from "../_utils/menuSummaryDisplay";
import MenuTrendContent from "./_components/MenuTrendContent";
import { TREND_PAGE_TITLE } from "./_components/menuTrendCopy";
import { buildSampleMenuTrend } from "./_components/menuTrendSampleData";

/** 推移詳細を開くのに必要な entitlement。back の 403 と同じキー。 */
const FEATURE = "practice_menu_trend_detail";

/** 素振りはメニューに紐付かないことがあるため、back も別エンドポイントで集計する。 */
const SHADOW_SWING_MENU: MenuTrend["menu"] = {
  id: null,
  name: SHADOW_SWING_MENU_NAME,
  unit: "count",
  unit_label: "本",
  is_weight_reps: false,
};

/** メニューを引けないとき（削除済みなど）にサンプルの見出しへ使う名前。 */
const UNKNOWN_MENU_NAME = "メニュー";

export const metadata = {
  title: TREND_PAGE_TITLE,
  robots: { index: false },
};

interface PracticeMenuTrendPageProps {
  params: Promise<{ menuId: string }>;
  searchParams: Promise<{ source?: string }>;
}

/**
 * サンプル表示用のメニュー情報を組み立てる。
 * 推移 API は Pro 限定なので叩けない。単位だけは合わせたいので、
 * Pro 限定ではないメニュー一覧から名称・単位を引く。
 */
async function resolveSampleMenu(menuId: number): Promise<MenuTrend["menu"]> {
  const menusResult = await getPracticeMenus();
  const menu =
    menusResult.status === "ok"
      ? menusResult.data.find((item) => item.id === menuId)
      : undefined;

  return {
    id: menu?.id ?? menuId,
    name: menu?.name ?? UNKNOWN_MENU_NAME,
    unit: menu?.unit ?? "count",
    unit_label: menu?.unit_label ?? null,
    is_weight_reps: menu?.unit === "weight_reps",
  };
}

async function buildSampleView(
  isShadowSwing: boolean,
  menuId: number,
): Promise<MenuTrendView> {
  const menu = isShadowSwing
    ? SHADOW_SWING_MENU
    : await resolveSampleMenu(menuId);
  return { kind: "sample", trend: buildSampleMenuTrend(menu) };
}

/**
 * 表示すべき内容を決める。
 * entitlement を持たないうちは推移 API を一切叩かず、サンプルだけを組み立てる。
 *
 * @param entitlements サーバーで解決した閲覧権限（未認証・取得失敗時は無料相当）
 */
async function resolveView(
  isShadowSwing: boolean,
  menuId: number,
  entitlements: readonly Feature[],
): Promise<MenuTrendView> {
  if (!entitlements.includes(FEATURE)) {
    return buildSampleView(isShadowSwing, menuId);
  }

  const result = isShadowSwing
    ? await getShadowSwingTrend()
    : await getMenuTrend(menuId);

  if (result.status === "ok") return { kind: "trend", trend: result.data };
  // entitlement の判定とサーバーの判定がずれた場合の 403。取得失敗とは区別する。
  if (result.status === "forbidden") {
    return buildSampleView(isShadowSwing, menuId);
  }
  return { kind: "error" };
}

export default async function PracticeMenuTrendPage({
  params,
  searchParams,
}: PracticeMenuTrendPageProps) {
  const cookieStore = await cookies();
  if (!cookieStore.get("access-token")) {
    redirect("/signup?auth_required=true");
  }

  const [{ menuId }, { source }] = await Promise.all([params, searchParams]);
  const isShadowSwing = source === SHADOW_SWING_SOURCE;
  const numericMenuId = Number(menuId);
  if (!isShadowSwing && !Number.isInteger(numericMenuId)) {
    notFound();
  }

  // 推移詳細は Pro 限定。無料ユーザーには 403 を踏ませず、そもそも API を叩かない。
  const proStatus = await getCachedProStatus();
  const view = await resolveView(
    isShadowSwing,
    numericMenuId,
    proStatus?.entitlements ?? DEFAULT_PRO_STATUS.entitlements,
  );

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="h-full w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <div className="pb-32 relative lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:pb-0 lg:mb-14">
          <div className="pt-20 px-4 lg:px-6">
            <Link
              href="/practice/summary"
              className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-400"
            >
              <ArrowLeftIcon className="h-3.5 w-3.5" aria-hidden />
              積み上げサマリー
            </Link>

            <div className="mt-3 mb-10">
              <MenuTrendContent view={view} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
