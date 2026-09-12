"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import HeaderDetailActions from "@app/components/header/HeaderDetailActions";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { NOTE_LIST_PATH } from "@app/constants/note";
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
      toast.error(result.errors[0] ?? "ノートの削除に失敗しました");
      return;
    }
    router.push(NOTE_LIST_PATH);
  };

  return (
    <>
      {isDeleting ? <LoadingSpinner /> : null}
      <HeaderDetailActions
        editHref={`/note/${noteId}/edit`}
        editLabel="ノートを編集"
        deleteLabel="ノートを削除"
        onDeleteClick={onOpen}
        isDeleting={isDeleting}
      />
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
