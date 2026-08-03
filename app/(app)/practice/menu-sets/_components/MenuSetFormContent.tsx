"use client";

import type { MenuSet, MenuSetInput } from "@app/types/menuSet";
import type { PracticeMenu } from "@app/types/practice";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { createMenuSet, updateMenuSet } from "@app/services/v2/menuSetService";
import { FREE_LIMIT_SERVER_ERROR } from "./menuSetCopy";
import MenuSetForm from "./MenuSetForm";

interface MenuSetFormContentProps {
  /** 編集対象。null なら新規作成。 */
  menuSet: MenuSet | null;
  menus: PracticeMenu[];
}

/**
 * メニューセットフォーム画面の Container。
 * Server Action の呼び出しと保存後の遷移を担い、入力 UI は MenuSetForm に委ねる。
 */
export default function MenuSetFormContent({
  menuSet,
  menus,
}: MenuSetFormContentProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const { open: openProUpgradeModal } = useProUpgradeModal();

  const handleSubmit = async (input: MenuSetInput) => {
    setIsSaving(true);
    setServerErrors([]);

    const result = menuSet
      ? await updateMenuSet(menuSet.id, input)
      : await createMenuSet(input);
    setIsSaving(false);

    if (result.ok) {
      toast.success(
        menuSet
          ? "メニューセットを更新しました"
          : "メニューセットを作成しました",
      );
      router.push(`/practice/menu-sets/${result.data.id}`);
      router.refresh();
      return;
    }

    // 作成時の 403 は Pro 限定機能ではなく無料枠の超過を意味する。
    // 別端末での追加などでクライアント側の件数判定とずれた場合にここへ入る。
    if (!menuSet && result.reason === "forbidden") {
      setServerErrors([FREE_LIMIT_SERVER_ERROR]);
      openProUpgradeModal({ trigger: "unlimited_menu_sets" });
      return;
    }
    setServerErrors(result.errors);
  };

  return (
    <MenuSetForm
      menuSet={menuSet}
      menus={menus}
      isSaving={isSaving}
      serverErrors={serverErrors}
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
    />
  );
}
