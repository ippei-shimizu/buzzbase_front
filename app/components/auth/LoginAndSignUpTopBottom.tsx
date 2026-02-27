"use client";
import { Button } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { useAuthContext } from "@app/contexts/useAuthContext";

export default function LoginAndSignUpTopBottom() {
  const { isLoggedIn, loading } = useAuthContext();
  if (loading) {
    return <></>;
  }
  return (
    <>
      {isLoggedIn ? (
        <>
          <div className="w-40 mt-6 mx-auto lg:w-60 lg:mt-12">
            <Image
              src="/images/buzz-logo-v2.png"
              alt=""
              width="340"
              height="50"
            />
          </div>
        </>
      ) : (
        <>
          <p className="text-base mt-4 text-zinc-500 text-center font-medium lg:text-lg lg:mt-10">
            BUZZ BASEをはじめる
          </p>
          <div className="flex gap-x-8 justify-center mt-4">
            <Link href="/signin">
              <Button
                color="default"
                size="lg"
                radius="sm"
                className="py-2 px-10 bg-white text-zinc-800 font-medium lg:py-3 lg:px-16"
              >
                ログイン
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                color="primary"
                size="lg"
                radius="sm"
                className="py-2 px-10 font-medium lg:py-3 lg:px-16"
              >
                新規登録
              </Button>
            </Link>
          </div>
        </>
      )}
    </>
  );
}
