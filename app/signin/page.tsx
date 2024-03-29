"use client";
import SignIn from "@app/components/auth/SignIn";
import ToastSuccess from "@app/components/toast/ToastSuccess";
import { useAuthContext } from "@app/contexts/useAuthContext";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Page() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const confirmationUrl = searchParams.get("account_confirmation_success");
  const logoutParams = searchParams.get("logout");

  const router = useRouter();
  const { isLoggedIn } = useAuthContext();

  useEffect(() => {
    if (isLoggedIn === true) {
      return router.push("/");
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (logoutParams === "success") {
      setSuccessToastWithTimeout();
      setMessage("ログアウトしました");
    }
  }, [logoutParams]);

  const setSuccessToastWithTimeout = () => {
    setLogoutSuccess(true);
    const timeout = setTimeout(() => {
      setLogoutSuccess(false);
    }, 5000);
    return () => clearTimeout(timeout);
  };

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
        </div>
      </div>
    </>
  );
}
