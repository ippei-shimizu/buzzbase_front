"use client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import React, { Suspense, useEffect, useRef, useState } from "react";
import SignIn from "@app/components/auth/SignIn";
import ToastSuccess from "@app/components/toast/ToastSuccess";
import { useAuthContext } from "@app/contexts/useAuthContext";
import EmailConfirmationAutoLogin, {
  hasConfirmationTokens,
} from "./_components/EmailConfirmationAutoLogin";
import SignUpCompletionTracker from "./_components/SignUpCompletionTracker";

function SignInContent() {
  const searchParams = useSearchParams();
  const [toastTimedOut, setToastTimedOut] = useState(false);
  const confirmationUrl = searchParams.get("account_confirmation_success");
  const logoutParams = searchParams.get("logout");
  const confirmationAccessToken = searchParams.get("access-token");
  const confirmationClient = searchParams.get("client");
  const confirmationUid = searchParams.get("uid");
  const router = useRouter();
  const { isLoggedIn } = useAuthContext();
  const prevIsLoggedInRef = useRef(isLoggedIn);

  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);

  const withConfirmationTokens = hasConfirmationTokens({
    accessToken: confirmationAccessToken,
    client: confirmationClient,
    uid: confirmationUid,
  });

  const logoutSuccess = logoutParams === "success" && !toastTimedOut;
  const message = logoutSuccess ? "ログアウトしました" : "";

  useEffect(() => {
    // ref は「直前のレンダーの isLoggedIn」を表す不変条件なので、
    // 早期 return する経路でも必ず更新する
    const prevIsLoggedIn = prevIsLoggedInRef.current;
    prevIsLoggedInRef.current = isLoggedIn;

    // メール確認のトークンで自動ログインする場合は、遷移先を
    // EmailConfirmationAutoLogin 側が決めるためここでは動かさない
    if (withConfirmationTokens) return;
    // セッション復元で既にログイン済みの場合のみリダイレクト
    // このページ上でログインした場合（false→true）はリダイレクトしない
    // （GoogleLoginButtonやSignInが自前でナビゲーションを行うため）
    if (isLoggedIn === true && prevIsLoggedIn !== false) {
      router.push("/");
    }
  }, [isLoggedIn, router, withConfirmationTokens]);

  useEffect(() => {
    if (logoutParams !== "success") return;
    const timeout = setTimeout(() => {
      setToastTimedOut(true);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [logoutParams]);

  return (
    <>
      {/* GA4 の sign_up は EmailConfirmationAutoLogin の遷移より先に送る必要があるため、
          子の effect が JSX の記述順に flush されることに依存してこの順序を保つ */}
      <SignUpCompletionTracker triggered={confirmationUrl === "true"} />
      <EmailConfirmationAutoLogin
        accessToken={confirmationAccessToken}
        client={confirmationClient}
        uid={confirmationUid}
        onAutoLoginChange={setIsAutoLoggingIn}
      />
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
          {isAutoLoggingIn ? (
            <p role="status" className="text-base text-yellow-500">
              メールアドレスの認証が完了しました。ログインしています...
            </p>
          ) : (
            <>
              {confirmationUrl && !withConfirmationTokens && (
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
            </>
          )}
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
