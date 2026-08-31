import { notFound } from "next/navigation";
import HeaderBack from "@app/components/header/HeaderBack";
import { LockIcon } from "@app/components/icon/LockIcon";
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

  const [result, currentUserId] = await Promise.all([
    getPlateAppearanceV2(plateAppearanceId),
    getCurrentUserIdV2(),
  ]);
  if (result.status === "unavailable") notFound();

  return (
    <>
      <HeaderBack />
      <main className="min-h-full">
        <div className="pb-24 relative w-full max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
          <div className="pt-14 px-4 lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:px-6 lg:pb-6">
            {result.status === "forbidden" ? (
              <div className="mt-12 flex flex-col items-center gap-y-3 pb-8">
                <LockIcon fill="#a1a1aa" width="40" height="40" />
                <p className="text-sm text-zinc-400 text-center">
                  相互フォローのユーザーのみ打席詳細を閲覧できます
                </p>
              </div>
            ) : (
              <PlateAppearanceDetailView
                plateAppearance={result.plateAppearance}
                currentUserId={currentUserId}
              />
            )}
          </div>
        </div>
      </main>
    </>
  );
}
