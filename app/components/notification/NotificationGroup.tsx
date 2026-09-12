"use client";

import type { Notifications } from "@app/interface";
import {
  Avatar,
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GroupIcon } from "@app/components/icon/GroupIcon";
import { useProUpgradeModal } from "@app/contexts/proUpgradeModalContext";
import {
  acceptGroupInvitation,
  declinedGroupInvitation,
} from "@app/services/groupInvitationsService";
import { deleteNotification } from "@app/services/notificationsService";
import { trackGroupJoined } from "@app/utils/analytics";
import {
  GROUP_FREE_LIMIT_MESSAGE,
  isGroupLimitError,
} from "@app/utils/pro/groupLimit";

interface NotificationGroupProps {
  notice: Notifications;
  onChanged?: () => void;
}

const INVITATION_STATUS_LABELS: Record<string, string> = {
  accepted: "参加済み",
  declined: "辞退済み",
};

export default function NotificationGroup({
  notice,
  onChanged,
}: NotificationGroupProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const { open: openProUpgradeModal } = useProUpgradeModal();

  // 承認・辞退できるのは招待が保留中のときだけ。それ以外は結果を履歴として表示する
  const isPending = notice.group_invitation === "pending";
  const statusLabel = INVITATION_STATUS_LABELS[notice.group_invitation];

  const handleAcceptGroupInvitation = async (groupId: number, id: number) => {
    try {
      await acceptGroupInvitation(groupId);
      trackGroupJoined(groupId);
      await deleteNotification(id);
      router.push(`/groups/${groupId}`);
    } catch (error) {
      // 無料枠の上限は想定内の拒否なので Sentry へは送らず、その場で理由を提示する。
      if (isGroupLimitError(error)) {
        toast.error(GROUP_FREE_LIMIT_MESSAGE);
        openProUpgradeModal({ trigger: "unlimited_groups" });
        return;
      }
      Sentry.captureException(error, {
        tags: { source: "notification-group", action: "acceptInvitation" },
      });
    }
  };

  const handleDeclinedGroupInvitation = async (groupId: number, id: number) => {
    try {
      await declinedGroupInvitation(groupId);
      await deleteNotification(id);
      onClose();
      onChanged?.();
    } catch (error) {
      Sentry.captureException(error, {
        tags: { source: "notification-group", action: "declineInvitation" },
      });
    }
  };

  const handleOpen = () => {
    onOpen();
  };
  return (
    <>
      <div className="grid grid-cols-[28px_1fr] gap-x-3">
        <GroupIcon fill="#f4f4f4" width="28" height="28" />
        <div className="flex flex-col items-start gap-y-1 pt-1">
          <Link href={`/mypage/${notice.actor_user_id}`}>
            <Avatar
              src={
                process.env.NODE_ENV === "production"
                  ? `${notice.actor_icon.url}`
                  : `${process.env.NEXT_PUBLIC_API_URL}${notice.actor_icon.url}`
              }
              size="sm"
              isBordered
              className="min-w-[28px] max-w-[28px] min-h-[28px] max-h-[28px]"
            />
          </Link>
          <p className="text-sm text-zinc-400 mt-1">
            <Link
              href={`/mypage/${notice.actor_user_id}`}
              className="text-base text-white font-bold"
            >
              {notice.actor_name}
            </Link>
            さんから
            <span className="text-base text-white font-bold">
              {notice.group_name}
            </span>
            グループへ招待されました
          </p>
          {statusLabel ? (
            <span className="mt-1 px-2 py-0.5 rounded-full border-1 border-zinc-500 text-zinc-300 text-xxs font-bold">
              {statusLabel}
            </span>
          ) : null}
          {isPending ? (
            <div className="flex justify-start gap-x-5 w-full mt-2">
              <Button
                size="sm"
                color="primary"
                onPress={() =>
                  handleAcceptGroupInvitation(
                    notice.event_id,
                    notice.id as number,
                  )
                }
              >
                参加する
              </Button>
              <Button size="sm" color="danger" onPress={() => handleOpen()}>
                拒否する
              </Button>
              <Modal
                size="lg"
                isOpen={isOpen}
                onClose={onClose}
                placement="center"
                className="w-11/12"
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex gap-1 text-base text-white pb-0">
                        本当に 「{notice.group_name}」
                        への招待を拒否してもよろしいですか？
                      </ModalHeader>
                      <ModalFooter>
                        <Button
                          variant="light"
                          onPress={onClose}
                          className="text-white"
                        >
                          キャンセル
                        </Button>
                        <Button
                          color="danger"
                          onPress={() =>
                            handleDeclinedGroupInvitation(
                              notice.event_id,
                              notice.id as number,
                            )
                          }
                        >
                          拒否する
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
