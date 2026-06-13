"use client";
import { Button } from "@heroui/react";
import Link from "next/link";
import AppStoreLink from "@app/components/cta/AppStoreLink";
import { LockIcon } from "@app/components/icon/LockIcon";

interface AuthRequiredOverlayProps {
  message?: string;
}

export default function AuthRequiredOverlay({
  message = "この情報を閲覧するにはログインが必要です",
}: AuthRequiredOverlayProps) {
  return (
    <div className="flex flex-col items-center gap-y-4 py-12">
      <LockIcon fill="#a1a1aa" width="40" height="40" />
      <p className="text-sm text-zinc-400 text-center">{message}</p>
      <div className="flex items-center gap-x-3 mt-2">
        <Link href="/signin">
          <Button
            color="default"
            size="lg"
            radius="sm"
            className="bg-white text-zinc-800 font-medium py-3"
          >
            ログイン
          </Button>
        </Link>
        <Link href="/signup">
          <Button
            color="primary"
            size="lg"
            radius="sm"
            className="font-medium py-2"
          >
            新規登録
          </Button>
        </Link>
      </div>
      <div className="mt-3">
        <p className="text-xs text-zinc-400 mb-2 text-center">
          iOSアプリはこちら
        </p>
        <AppStoreLink ctaLocation="auth_overlay" />
      </div>
    </div>
  );
}
