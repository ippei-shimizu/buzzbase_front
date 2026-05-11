"use client";

import type { InviteLinkInfo } from "@app/interface";
import { Avatar, Button, Input } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Header from "@app/components/header/Header";
import useRequireAuth from "@app/hooks/auth/useRequireAuth";
import {
  acceptInviteLink,
  getInviteLinkInfo,
} from "@app/services/groupInviteLinksService";

export default function GroupJoinPage() {
  const router = useRouter();
  useRequireAuth();

  const [code, setCode] = useState("");
  const [inviteInfo, setInviteInfo] = useState<InviteLinkInfo | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  const handleLookup = async () => {
    if (!code) return;
    setIsLookingUp(true);
    try {
      const info = await getInviteLinkInfo(code);
      setInviteInfo(info);
    } catch (error) {
      console.error("招待コードの確認に失敗しました", error);
      setInviteInfo(null);
      toast.error("無効な招待コードです");
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleAccept = async () => {
    if (!code || !inviteInfo) return;
    setIsAccepting(true);
    try {
      const result = await acceptInviteLink(code);
      router.push(`/groups/${result.group_id}`);
    } catch (error) {
      console.error("グループへの参加に失敗しました", error);
      toast.error("グループへの参加に失敗しました");
    } finally {
      setIsAccepting(false);
    }
  };

  const groupIconSrc = (() => {
    if (!inviteInfo?.group.icon) return undefined;
    if (inviteInfo.group.icon.endsWith(".svg")) return undefined;
    return process.env.NODE_ENV === "production"
      ? inviteInfo.group.icon
      : `${process.env.NEXT_PUBLIC_API_URL}${inviteInfo.group.icon}`;
  })();

  const inviterIconSrc = (() => {
    const url = inviteInfo?.inviter.image.url;
    if (!url) return undefined;
    if (url.endsWith(".svg")) return undefined;
    return process.env.NODE_ENV === "production"
      ? url
      : `${process.env.NEXT_PUBLIC_API_URL}${url}`;
  })();

  return (
    <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
      <Header />
      <main className="pt-14 pb-12 px-6 max-w-[720px] w-full mx-auto lg:m-[0_auto_0_28%] lg:border-x-1 lg:border-b-1 lg:border-zinc-500">
        <div className="pt-6">
          <p className="text-base font-bold text-white mb-3">
            招待コードを入力
          </p>
          <Input
            value={code}
            onValueChange={(v) => setCode(v.toUpperCase())}
            maxLength={8}
            placeholder="例: ABC12DEF"
            variant="bordered"
            classNames={{
              input:
                "text-center tracking-[2px] uppercase text-lg font-semibold",
              inputWrapper: "bg-zinc-800 border-zinc-700",
            }}
          />
          <Button
            color="primary"
            fullWidth
            size="lg"
            radius="md"
            className="mt-4"
            isDisabled={code.length === 0}
            isLoading={isLookingUp}
            onPress={handleLookup}
          >
            確認する
          </Button>

          {inviteInfo ? (
            <div className="mt-6 bg-zinc-800 rounded-xl p-5">
              <div className="flex items-center gap-x-3">
                <Avatar src={groupIconSrc} size="lg" isBordered />
                <div>
                  <p className="text-lg font-bold text-white">
                    {inviteInfo.group.name}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    メンバー: {inviteInfo.group.member_count}人
                  </p>
                </div>
              </div>
              <div className="border-t border-zinc-700 mt-4 pt-4 flex items-center gap-x-2">
                <Avatar src={inviterIconSrc} size="sm" />
                <p className="text-sm text-zinc-300">
                  招待者: {inviteInfo.inviter.name}
                </p>
              </div>
              <Button
                color="primary"
                fullWidth
                size="lg"
                radius="md"
                className="mt-5"
                isLoading={isAccepting}
                onPress={handleAccept}
              >
                グループに参加
              </Button>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
