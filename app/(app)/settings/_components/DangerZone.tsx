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
import Link from "next/link";
import useLogout from "@app/hooks/auth/useLogout";

/** 危険操作エリア。ログアウトは確認モーダルを挟み、アカウント削除は専用ページへ遷移する。 */
export default function DangerZone() {
  const logout = useLogout();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogout = () => {
    onClose();
    void logout();
  };

  return (
    <div className="flex flex-col gap-2.5">
      <Button
        color="danger"
        variant="solid"
        onPress={onOpen}
        className="font-bold"
      >
        ログアウト
      </Button>
      <Button
        as={Link}
        href="/account-deletion"
        color="danger"
        variant="bordered"
        className="font-bold"
      >
        アカウント削除
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        placement="center"
        size="sm"
        backdrop="blur"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold text-center">
              ログアウトの確認
            </h3>
          </ModalHeader>
          <ModalBody>
            <p className="text-center text-sm text-zinc-400">
              ログアウトしますか？
            </p>
          </ModalBody>
          <ModalFooter className="flex justify-center gap-4">
            <Button variant="light" onPress={onClose} className="text-white">
              キャンセル
            </Button>
            <Button color="danger" variant="solid" onPress={handleLogout}>
              ログアウト
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
