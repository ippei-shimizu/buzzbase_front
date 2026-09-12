"use client";

import type { Notifications } from "@app/interface";
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
import { useState, type ReactNode } from "react";
import NotificationEventIcon from "@app/components/notification/NotificationEventIcon";
import { formatNotificationTime } from "@app/utils/notificationTime";

interface NotificationRowProps {
  notice: Notifications;
  onDelete?: (id: number) => Promise<void>;
  children: ReactNode;
}

/**
 * 通知1件分の共通の外枠。未読表示・イベントアイコン・相対時刻・削除操作を担い、
 * 通知種別ごとの本文は children として受け取る。
 */
export default function NotificationRow({
  notice,
  onDelete,
  children,
}: NotificationRowProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);

  const isUnread = !notice.read_at;
  // 運営からのお知らせは id が "mn_1" のような文字列で、削除エンドポイントの対象外
  const deletableId = typeof notice.id === "number" ? notice.id : null;
  const canDelete = onDelete !== undefined && deletableId !== null;

  const handleConfirmDelete = async () => {
    if (!onDelete || deletableId === null || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(deletableId);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <div
      className={`grid grid-cols-[1fr_auto] gap-x-2 border-l-2 pl-3 py-1 rounded-r-md ${
        isUnread
          ? "border-primary bg-primary/10"
          : "border-transparent opacity-60"
      }`}
    >
      <div className="min-w-0">
        {children}
        <div className="flex items-center gap-x-1 mt-1">
          <NotificationEventIcon eventType={notice.event_type} />
          <time dateTime={notice.created_at} className="text-xs text-zinc-400">
            {formatNotificationTime(notice.created_at)}
          </time>
        </div>
      </div>
      <div className="flex items-start gap-x-1 shrink-0">
        {isUnread ? (
          // 色だけに頼らず「未読」の文言とドットの両方で区別する
          <span className="flex items-center gap-x-1 h-6 px-2 rounded-full border-1 border-primary text-primary text-xxs font-bold">
            <span
              aria-hidden="true"
              className="block w-1.5 h-1.5 rounded-full bg-primary"
            />
            未読
          </span>
        ) : null}
        {canDelete ? (
          <>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              radius="full"
              aria-label="通知を削除"
              className="min-w-6 w-6 h-6 text-zinc-400"
              onPress={onOpen}
            >
              <TrashIcon aria-hidden="true" className="w-4 h-4" />
            </Button>
            <Modal
              size="sm"
              isOpen={isOpen}
              onClose={onClose}
              placement="center"
              className="w-11/12"
            >
              <ModalContent>
                <ModalHeader className="text-base text-white pb-0">
                  この通知を削除しますか？
                </ModalHeader>
                <ModalBody className="text-sm text-zinc-400">
                  削除した通知は元に戻せません。
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="light"
                    className="text-white"
                    isDisabled={isDeleting}
                    onPress={onClose}
                  >
                    キャンセル
                  </Button>
                  <Button
                    color="danger"
                    isLoading={isDeleting}
                    onPress={handleConfirmDelete}
                  >
                    削除する
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
        ) : null}
      </div>
    </div>
  );
}
