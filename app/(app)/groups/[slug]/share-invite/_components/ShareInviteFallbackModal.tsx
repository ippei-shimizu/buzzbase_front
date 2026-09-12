"use client";

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Snippet,
} from "@heroui/react";
import Image from "next/image";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  shareMessage: string;
};

export default function ShareInviteFallbackModal({
  isOpen,
  onClose,
  shareMessage,
}: Props) {
  const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(
    shareMessage,
  )}`;

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      className="w-11/12"
    >
      <ModalContent>
        <ModalHeader className="justify-center">
          <p className="text-base">招待コードを共有する</p>
        </ModalHeader>
        <ModalBody className="pb-6">
          <Snippet
            color="default"
            size="sm"
            variant="bordered"
            symbol=""
            className="text-white whitespace-pre-wrap break-all"
          >
            {shareMessage}
          </Snippet>
          <div className="flex justify-center mt-2">
            <Button
              as="a"
              href={lineShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent"
              radius="sm"
              isIconOnly
              aria-label="LINEで共有"
              endContent={
                <Image
                  src="/images/icon-line.png"
                  alt="LINE"
                  width={36}
                  height={36}
                />
              }
            />
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
