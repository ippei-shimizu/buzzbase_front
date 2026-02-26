"use client";
import "@mantine/core/styles.css";
import { Button } from "@heroui/react";
import { Group } from "@mantine/core";
import Link from "next/link";
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
        </>
      )}
    </>
  );
}
