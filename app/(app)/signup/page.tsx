"use client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect } from "react";
import { toast } from "sonner";
import SignUp from "@app/components/auth/SignUp";

function SignUpContent() {
  const searchParams = useSearchParams();
  const authRequired = searchParams.get("auth_required");

  useEffect(() => {
    if (authRequired === "true") {
      toast.info("この機能を使うには会員登録（無料）が必要です", {
        id: "auth-required",
      });
    }
  }, [authRequired]);

  return (
    <>
      <Image
        src="/images/logo-bg.png"
        alt=""
        width={500}
        height={400}
        className="absolute opacity-[0.03] -left-28 -top-10 lg:left-24 lg:w-[620px]"
      />
      <div className="h-full flex flex-col items-center justify-center">
        <div className="w-11/12 px-4 max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
          <h2 className="text-2xl font-bold mb-8">新規会員登録</h2>
          <SignUp />
          <p className="text-sm text-zinc-400 mt-8 text-center">
            すでにアカウントをお持ちの方は
            <Link href="/signin" className="text-yellow-500 ml-1">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center">
          読み込み中...
        </div>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
