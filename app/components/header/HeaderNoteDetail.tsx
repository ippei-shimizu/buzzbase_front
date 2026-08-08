"use client";

import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BackIcon } from "@app/components/icon/BackIcon";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { deleteBaseballNote } from "@app/services/v2/baseballNoteService";

interface HeaderNoteDetailProps {
  noteId: number;
}

/** ノート詳細画面のヘッダー。戻る（左）、編集・削除（右）を並べる。 */
export default function HeaderNoteDetail({ noteId }: HeaderNoteDetailProps) {
  const router = useRouter();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteBaseballNote(noteId);
    if (!result.ok) {
      setIsDeleting(false);
      return;
    }
    router.push("/note");
  };

  return (
    <>
      {isDeleting ? <LoadingSpinner /> : null}
      <header className="py-2 px-3 border-b border-b-zinc-500 fixed top-[var(--top-banner-offset,0px)] w-full bg-main z-50">
        <div className="flex items-center justify-between h-full max-w-[692px] mx-auto lg:m-[0_auto_0_28%]">
          <button onClick={() => router.back()} aria-label="戻る">
            <BackIcon width="24" height="24" fill="" stroke="white" />
          </button>
          <div className="flex items-center gap-4">
            <Link href={`/note/${noteId}/edit`} aria-label="ノートを編集">
              <PencilSquareIcon className="h-6 w-6 text-white" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={onOpen}
              aria-label="ノートを削除"
              disabled={isDeleting}
            >
              <TrashIcon className="h-6 w-6 text-danger" aria-hidden />
            </button>
          </div>
        </div>
      </header>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="lg"
        placement="center"
        className="w-11/12 ml-auto mr-auto"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader></ModalHeader>
              <ModalBody className="gap-y-2">
                <p className="text-base font-medium">
                  現在のノートを削除してもよろしいですか？
                </p>
              </ModalBody>
              <ModalFooter className="pt-3">
                <Button
                  className="text-white"
                  variant="light"
                  onPress={onClose}
                >
                  キャンセル
                </Button>
                <Button color="danger" radius="sm" onPress={handleDelete}>
                  削除する
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
