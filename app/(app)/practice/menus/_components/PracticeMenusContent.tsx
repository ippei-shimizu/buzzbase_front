"use client";

import type { PracticeMenu, PracticeMenuInput } from "@app/types/practice";
import PlusIcon from "@heroicons/react/24/outline/PlusIcon";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ProUpsellCard } from "@app/components/pro/ProUpsellCard";
import { PRACTICE_MENU_FREE_LIMIT } from "@app/constants/practice";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import { useEntitlement } from "@app/hooks/pro/useEntitlement";
import {
  createPracticeMenu,
  deletePracticeMenu,
  updatePracticeMenu,
} from "@app/services/v2/practiceMenuService";
import {
  DELETE_KEEPS_LOGS_NOTICE,
  FREE_LIMIT_DESCRIPTION,
  FREE_LIMIT_SERVER_ERROR,
  FREE_LIMIT_TITLE,
} from "./practiceMenuCopy";
import PracticeMenuFormModal from "./PracticeMenuFormModal";
import PracticeMenuList from "./PracticeMenuList";

interface PracticeMenusContentProps {
  initialMenus: PracticeMenu[];
  /** 登録完了後に戻る画面。練習記録画面等からメニュー未登録で誘導された場合に渡される。 */
  returnTo?: string | null;
}

/** フォームを開くたびに増やし、key の付け替えで入力状態を初期化するための識別子。 */
interface FormTarget {
  menu: PracticeMenu | null;
  token: number;
}

/**
 * 練習メニュー画面の Container。
 * 一覧の状態保持・Server Action 呼び出し・無料枠の判定を担い、表示は子コンポーネントへ委ねる。
 */
export default function PracticeMenusContent({
  initialMenus,
  returnTo,
}: PracticeMenusContentProps) {
  const router = useRouter();
  const [menus, setMenus] = useState<PracticeMenu[]>(initialMenus);
  const [form, setForm] = useState<FormTarget | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PracticeMenu | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { hasEntitlement, isLoading: isEntitlementLoading } = useEntitlement();
  const { open: openProUpgradeModal } = useProUpgradeModal();

  const hasUnlimited = hasEntitlement("unlimited_practice_menus");
  // 判定が確定するまでは上限扱いにしない。未確定のまま塞ぐと Pro 加入者に上限を誤って告知してしまう。
  const isAtFreeLimit =
    !isEntitlementLoading &&
    !hasUnlimited &&
    menus.length >= PRACTICE_MENU_FREE_LIMIT;

  const openForm = (menu: PracticeMenu | null) => {
    setFormErrors([]);
    setForm({ menu, token: Date.now() + menus.length });
  };

  const handleAdd = () => {
    if (isAtFreeLimit) {
      openProUpgradeModal({ trigger: "unlimited_practice_menus" });
      return;
    }
    openForm(null);
  };

  const handleSubmit = async (input: PracticeMenuInput) => {
    const editing = form?.menu ?? null;
    setIsSaving(true);
    setFormErrors([]);

    const result = editing
      ? await updatePracticeMenu(editing.id, input)
      : await createPracticeMenu(input);
    setIsSaving(false);

    if (result.ok) {
      setMenus((prev) =>
        editing
          ? prev.map((item) => (item.id === editing.id ? result.data : item))
          : [...prev, result.data],
      );
      setForm(null);
      toast.success(
        editing ? "練習メニューを更新しました" : "練習メニューを作成しました",
      );
      // メニュー未登録で誘導された直後の新規作成のみ、元の画面へ戻す。
      if (!editing && returnTo) {
        router.push(returnTo);
      }
      return;
    }

    // 作成時の 403 は Pro 限定機能ではなく無料枠の超過を意味する。
    // 別端末での追加などでクライアント側の件数判定とずれた場合にここへ入る。
    if (!editing && result.reason === "forbidden") {
      setFormErrors([FREE_LIMIT_SERVER_ERROR]);
      openProUpgradeModal({ trigger: "unlimited_practice_menus" });
      return;
    }
    setFormErrors(result.errors);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await deletePracticeMenu(deleteTarget.id);
    setIsDeleting(false);

    if (!result.ok) {
      toast.error(result.errors[0]);
      return;
    }
    setMenus((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast.success("練習メニューを削除しました");
  };

  return (
    <>
      <h2 className="text-lg font-bold">練習メニュー</h2>
      <p className="mt-2 text-xs text-zinc-300">
        練習の記録に使うメニューを登録します。カテゴリと計測タイプを決めておくと、記録するときに量をそのまま入力できます。
      </p>

      <div className="my-6">
        <PracticeMenuList
          menus={menus}
          onEdit={openForm}
          onDelete={setDeleteTarget}
        />
      </div>

      {isAtFreeLimit ? (
        <ProUpsellCard
          feature="unlimited_practice_menus"
          title={FREE_LIMIT_TITLE}
          description={FREE_LIMIT_DESCRIPTION}
          ctaLabel="Pro プランを見る"
          className="mb-4"
        />
      ) : null}

      <Button
        color="primary"
        fullWidth
        radius="sm"
        className="font-bold"
        startContent={<PlusIcon className="h-5 w-5" aria-hidden />}
        isDisabled={isEntitlementLoading}
        onPress={handleAdd}
      >
        メニューを作る
      </Button>

      {form ? (
        <PracticeMenuFormModal
          key={form.token}
          menu={form.menu}
          isSaving={isSaving}
          serverErrors={formErrors}
          onClose={() => setForm(null)}
          onSubmit={handleSubmit}
        />
      ) : null}

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        placement="center"
        className="buzz-dark"
      >
        <ModalContent>
          <ModalHeader className="text-white">メニューの削除</ModalHeader>
          <ModalBody>
            <p className="text-sm text-white">
              「{deleteTarget?.name}」を削除しますか？
            </p>
            <p className="text-xs text-zinc-400">{DELETE_KEEPS_LOGS_NOTICE}</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => setDeleteTarget(null)}
              isDisabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isDisabled={isDeleting}
              isLoading={isDeleting}
            >
              削除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
