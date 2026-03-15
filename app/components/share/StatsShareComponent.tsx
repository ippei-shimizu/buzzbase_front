"use client";

import {
  Button,
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  Snippet,
  ModalHeader,
} from "@heroui/react";
import Image from "next/image";
import React, { useCallback } from "react";
import { XIcon } from "@app/components/icon/XIcon";

type Position = {
  id: string;
  name: string;
};

type Team = {
  id: number;
  name: string;
  category_name: string;
  prefecture_name: string;
};

type StatsShareComponentProps = {
  userId: string;
  userName: string;
  positions?: Position[];
  teamData?: Team;
};

export default function StatsShareComponent({
  userId,
  userName,
  positions,
  teamData,
}: StatsShareComponentProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const shareUrl = `https://buzzbase.jp/mypage/${userId}`;
  const cardImageUrl = `/api/og/stats-card?userId=${userId}`;

  const buildShareText = () => {
    let text = `${userName}さんの成績カード`;

    if (positions && positions.length > 0) {
      text += `【ポジション】${positions[0].name}`;
    }

    if (teamData && teamData.name) {
      text += `【チーム】${teamData.name}`;
      if (teamData.prefecture_name) {
        text += `（${teamData.prefecture_name}）`;
      }
      if (teamData.category_name) {
        text += `｜${teamData.category_name}`;
      }
    }

    text += " #BUZZBASE";
    return text;
  };

  const shareText = buildShareText();
  const encodedText = encodeURIComponent(shareText);

  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodeURIComponent(shareUrl)}`;
  const lineShareUrl = `https://line.me/R/msg/text/?${encodedText} ${encodeURIComponent(shareUrl)}`;

  const handleShareMobile = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${userName}さんの成績カード`,
          text: shareText,
          url: shareUrl,
        })
        .catch((error) => console.error("Error sharing", error));
    } else {
      onOpen();
    }
  };

  const handleDownloadImage = useCallback(async () => {
    try {
      const res = await fetch(cardImageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${userName}_stats.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading image", error);
    }
  }, [cardImageUrl, userName]);

  return (
    <>
      <Button
        className="text-zinc-300 bg-transparent rounded-full text-xs border-1 border-zinc-400 w-full h-auto min-h-0 p-1.5 font-bold flex-1"
        onPress={handleShareMobile}
      >
        シェアする
      </Button>
      <Modal
        size="lg"
        isOpen={isOpen}
        onClose={onClose}
        placement="center"
        className="w-11/12"
      >
        <ModalContent>
          <ModalHeader className="justify-center">
            <p className="text-base">成績カードをシェアする</p>
          </ModalHeader>
          <ModalBody>
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cardImageUrl}
                alt={`${userName}の成績カード`}
                className="w-full rounded-lg border border-zinc-700"
              />
            </div>
            <Snippet
              color="default"
              size="sm"
              variant="bordered"
              symbol=""
              className="text-white"
            >
              {shareUrl}
            </Snippet>
            <div className="flex justify-center gap-x-6 mt-2">
              <Button
                as="a"
                href={twitterShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent"
                radius="sm"
                isIconOnly
                endContent={<XIcon fill="#F4F4F4" width="24" height="24" />}
              ></Button>
              <Button
                as="a"
                href={lineShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-transparent"
                radius="sm"
                isIconOnly
                endContent={
                  <Image
                    src="/images/icon-line.png"
                    alt=""
                    width={34}
                    height={34}
                  />
                }
              ></Button>
            </div>
            <div className="flex justify-center mb-4">
              <Button
                className="text-zinc-300 bg-zinc-800 rounded-lg text-sm border-1 border-zinc-600 px-6"
                onPress={handleDownloadImage}
              >
                画像を保存
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
