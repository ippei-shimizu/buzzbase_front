"use client";

import type { MenuSet } from "@app/types/menuSet";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { deleteMenuSet } from "@app/services/v2/menuSetService";
import { formatMenuSetItem } from "../../../_utils/menuSetDisplay";
import {
  CANCEL_LABEL,
  DELETE_CONFIRM_TITLE,
  DELETE_KEEPS_SCHEDULES_NOTICE,
  DELETE_LABEL,
  DETAIL_MENU_SECTION_TITLE,
  DETAIL_NOTE_SECTION_TITLE,
  EDIT_LABEL,
  ITEMS_EMPTY,
} from "../../_components/menuSetCopy";

interface MenuSetDetailContentProps {
  menuSet: MenuSet;
}

/**
 * メニューセット詳細の Container。
 * セットの中身の表示と、編集への導線・削除の確認を担う。
 */
export default function MenuSetDetailContent({
  menuSet,
}: MenuSetDetailContentProps) {
  const router = useRouter();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteMenuSet(menuSet.id);
    setIsDeleting(false);

    if (!result.ok) {
      toast.error(result.errors[0]);
      return;
    }
    toast.success("メニューセットを削除しました");
    router.push("/practice/menu-sets");
    router.refresh();
  };

  return (
    <>
      <h2 className="break-words text-xl font-bold text-white">
        {menuSet.name}
      </h2>

      <section className="mt-6">
        <h3 className="mb-2 text-sm font-bold text-zinc-400">
          {DETAIL_MENU_SECTION_TITLE}
        </h3>
        {menuSet.items.length === 0 ? (
          <p className="text-sm text-zinc-400">{ITEMS_EMPTY}</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {menuSet.items.map((item) => (
              <li
                key={item.practice_menu_id}
                className="rounded-[10px] bg-sub px-3.5 py-3 text-sm text-white"
              >
                {formatMenuSetItem(item)}
              </li>
            ))}
          </ul>
        )}
      </section>

      {menuSet.note ? (
        <section className="mt-6">
          <h3 className="mb-2 text-sm font-bold text-zinc-400">
            {DETAIL_NOTE_SECTION_TITLE}
          </h3>
          <p className="whitespace-pre-wrap text-sm text-white">
            {menuSet.note}
          </p>
        </section>
      ) : null}

      <div className="mt-8 flex gap-3">
        <Button
          as={Link}
          href={`/practice/menu-sets/${menuSet.id}/edit`}
          variant="flat"
          radius="sm"
          className="flex-1"
        >
          {EDIT_LABEL}
        </Button>
        <Button
          color="danger"
          variant="flat"
          radius="sm"
          className="flex-1"
          onPress={() => setIsDeleteOpen(true)}
        >
          {DELETE_LABEL}
        </Button>
      </div>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        placement="center"
        className="buzz-dark"
      >
        <ModalContent>
          <ModalHeader className="text-white">
            {DELETE_CONFIRM_TITLE}
          </ModalHeader>
          <ModalBody>
            <p className="text-sm text-white">
              「{menuSet.name}」を削除しますか？
            </p>
            <p className="text-xs text-zinc-400">
              {DELETE_KEEPS_SCHEDULES_NOTICE}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onPress={() => setIsDeleteOpen(false)}
              isDisabled={isDeleting}
            >
              {CANCEL_LABEL}
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isDisabled={isDeleting}
              isLoading={isDeleting}
            >
              {DELETE_LABEL}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
