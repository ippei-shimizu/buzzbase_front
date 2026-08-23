import { notFound } from "next/navigation";
import HeaderBack from "@app/components/header/HeaderBack";
import { getPlateAppearanceV2 } from "@app/services/v2/plateAppearanceService";
import { getCurrentUserIdV2 } from "@app/services/v2/userService";
import { PlateAppearanceDetailView } from "../_components/detail-view/PlateAppearanceDetailView";

/**
 * 打席詳細画面（閲覧専用）。Server Component でデータを取得し、
 * 表示は PlateAppearanceDetailView に委譲する。
 */
export default async function PlateAppearanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plateAppearanceId = Number(id);
  if (Number.isNaN(plateAppearanceId)) notFound();

  const [plateAppearance, currentUserId] = await Promise.all([
    getPlateAppearanceV2(plateAppearanceId),
    getCurrentUserIdV2(),
  ]);
  if (!plateAppearance) notFound();

  return (
    <>
      <HeaderBack />
      <main className="min-h-full">
        <div className="pb-24 relative w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
          <div className="pt-14 px-4 lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:px-6 lg:pb-6">
            <PlateAppearanceDetailView
              plateAppearance={plateAppearance}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      </main>
    </>
  );
}
