"use client";
import { Button } from "@heroui/react";
import { Group } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { APP_STORE_URL } from "@app/constants/app";
import { useAuthContext } from "@app/contexts/useAuthContext";

export default function LoginAndSignUp() {
  const { isLoggedIn, loading } = useAuthContext();
  if (loading) {
    return <></>;
  }
  return (
    <>
      {isLoggedIn ? (
        <></>
      ) : (
        <>
          <Group mt={30}>
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
          </Group>
          <div className="mt-5">
            <p className="text-xs text-zinc-400 mb-2">iOSアプリはこちら</p>
            <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
              <Image
                src="/images/download_app_store_badge_jp.svg"
                alt="App Storeからダウンロード"
                width={150}
                height={50}
                className="h-[44px] w-auto"
              />
            </a>
          </div>
        </>
      )}
    </>
  );
}
