"use client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import React, { Suspense, useEffect, useRef, useState } from "react";
import SignIn from "@app/components/auth/SignIn";
import ToastSuccess from "@app/components/toast/ToastSuccess";
import { useAuthContext } from "@app/contexts/useAuthContext";

function SignInContent() {
  const searchParams = useSearchParams();
  const [toastTimedOut, setToastTimedOut] = useState(false);
  const confirmationUrl = searchParams.get("account_confirmation_success");
  const logoutParams = searchParams.get("logout");
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();
  const prevIsLoggedInRef = useRef(isLoggedIn);

  const logoutSuccess = logoutParams === "success" && !toastTimedOut;
  const message = logoutSuccess ? "ログアウトしました" : "";

  useEffect(() => {
    // セッション復元で既にログイン済みの場合のみリダイレクト
    // このページ上でログインした場合（false→true）はリダイレクトしない
    // （GoogleLoginButtonやSignInが自前でナビゲーションを行うため）
    if (isLoggedIn === true && prevIsLoggedInRef.current !== false) {
      router.push("/");
    }
    prevIsLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (logoutParams !== "success") return;
    const timeout = setTimeout(() => {
      setToastTimedOut(true);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [logoutParams]);

  return (
    <>
      {logoutSuccess && <ToastSuccess text={message} />}
      <Image
        src="/images/logo-bg.png"
        alt=""
        width={500}
        height={400}
        className="absolute opacity-[0.03] -left-28 -top-10 lg:left-24 lg:w-[620px]"
      />
      <div className="h-full flex flex-col items-center justify-center px-4">
        <div className="w-11/12 max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
          {confirmationUrl && (
            <p className="mb-10 text-sm text-yellow-500 lg:text-base">
              メールアドレスの認証が成功しました！
              <br />
              先ほどのメールアドレスとパスワードを入力してください。
            </p>
          )}
          <h2 className="text-2xl font-bold mb-9">ログイン</h2>
          <SignIn />
          <p className="text-sm text-zinc-400 mt-8 text-center">
            まだ登録していない方は
            <Link href="/signup" className="text-yellow-500 ml-1">
              新規会員登録（無料）
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
      <SignInContent />
    </Suspense>
  );
}
