"use client";

import type { InviteLinkResponse } from "@app/interface";
import { Button, Spinner, useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import HeaderBackLink from "@app/components/header/HeaderBackLink";
import { CopyIcon } from "@app/components/icon/CopyIcon";
import { GroupIcon } from "@app/components/icon/GroupIcon";
import { ShareIcon } from "@app/components/icon/ShareIcon";
import useRequireAuth from "@app/hooks/auth/useRequireAuth";
import { getOrCreateInviteLink } from "@app/services/groupInviteLinksService";
import ShareInviteFallbackModal from "./_components/ShareInviteFallbackModal";

const APP_STORE_URL = "https://apps.apple.com/jp/app/buzz-base/id6761011816";

const buildShareMessage = (groupName: string, code: string) =>
  `BUZZ BASEで「${groupName}」に参加しよう！\n\n招待コード: ${code}\n\nアプリをダウンロード\n${APP_STORE_URL}\n\nアプリをインストールして、招待コードを入力してね！`;

export default function ShareInvitePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = use(props.params);
  const groupId = Number(params.slug);
  const router = useRouter();
  useRequireAuth();

  const [inviteLink, setInviteLink] = useState<InviteLinkResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchInviteLink = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const data = await getOrCreateInviteLink(groupId);
      setInviteLink(data);
    } catch (error) {
      console.error("招待コードの取得に失敗しました", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (!Number.isNaN(groupId)) {
      fetchInviteLink();
    }
  }, [groupId, fetchInviteLink]);

  const handleCopy = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink.code);
      toast.success("コピーしました");
    } catch (error) {
      console.error("コピーに失敗しました", error);
      toast.error("コピーに失敗しました");
    }
  };

  const handleShare = async () => {
    if (!inviteLink) return;
    const message = buildShareMessage(inviteLink.group_name, inviteLink.code);

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ text: message });
        return;
      } catch (error) {
        if ((error as DOMException)?.name === "AbortError") {
          return;
        }
      }
    }
    onOpen();
  };

  const handleViewGroup = () => {
    router.replace(`/groups/${groupId}`);
  };

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <HeaderBackLink
        backLink={`/groups/${groupId}`}
        groupName={inviteLink?.group_name}
        groupIconLink=""
      />
      <main className="pt-16 pb-12 px-6 max-w-[720px] w-full mx-auto lg:m-[0_auto_0_28%] lg:border-x-1 lg:border-b-1 lg:border-zinc-500">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Spinner color="primary" size="lg" />
          </div>
        ) : isError || !inviteLink ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <p className="text-sm text-zinc-400">
              招待コードの取得に失敗しました
            </p>
            <Button
              variant="bordered"
              color="primary"
              onPress={fetchInviteLink}
            >
              再試行
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center pt-6">
            <h1 className="text-lg font-bold text-white mb-8">
              {inviteLink.group_name}
            </h1>

            <div className="w-full bg-zinc-800 rounded-2xl py-7 px-10 flex flex-col items-center mb-6">
              <p className="text-xs text-zinc-400 mb-2">招待コード</p>
              <p className="text-primary text-3xl font-extrabold tracking-[0.25em]">
                {inviteLink.code}
              </p>
            </div>

            <Button
              variant="bordered"
              color="primary"
              fullWidth
              size="lg"
              radius="md"
              onPress={handleCopy}
              startContent={<CopyIcon stroke="#d08000" />}
              className="mb-3"
            >
              コードをコピー
            </Button>

            <Button
              color="primary"
              variant="solid"
              fullWidth
              size="lg"
              radius="md"
              onPress={handleShare}
              startContent={<ShareIcon stroke="#FFFFFF" />}
              className="mb-3"
            >
              LINEなどで共有
            </Button>

            <Button
              variant="bordered"
              color="primary"
              fullWidth
              size="lg"
              radius="md"
              onPress={handleViewGroup}
              startContent={<GroupIcon width="18" height="18" fill="#d08000" />}
              className="mb-8"
            >
              グループを見る
            </Button>

            <p className="text-xs text-zinc-500 text-center leading-5">
              コードを受け取った人はアプリで入力して
              <br />
              グループに参加できます
            </p>
          </div>
        )}
      </main>
      {inviteLink ? (
        <ShareInviteFallbackModal
          isOpen={isOpen}
          onClose={onClose}
          shareMessage={buildShareMessage(
            inviteLink.group_name,
            inviteLink.code,
          )}
        />
      ) : null}
    </div>
  );
}
