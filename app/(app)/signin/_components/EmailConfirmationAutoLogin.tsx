"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuthContext } from "@app/contexts/useAuthContext";
import { setAuthCookiesFromConfirmation } from "@app/services/authService";
import { getUserData } from "@app/services/userService";

interface Props {
  accessToken: string | null;
  client: string | null;
  uid: string | null;
}

/**
 * メール確認のリダイレクトに載ってきた認証トークンでそのままログイン状態にし、
 * 次の画面へ送る。トークンが揃っていない場合は何もせず手動ログインに任せる。
 */
export default function EmailConfirmationAutoLogin({
  accessToken,
  client,
  uid,
}: Props) {
  const router = useRouter();
  const { setIsLoggedIn } = useAuthContext();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!accessToken || !client || !uid) return;
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const signInWithConfirmationTokens = async () => {
      setAuthCookiesFromConfirmation({ accessToken, client, uid });
      setIsLoggedIn(true);

      // 取得に失敗したケースは安全側（ユーザー名登録）に倒す。ログインは成立しているため再取得が可能。
      try {
        const userData = await getUserData();
        router.replace(
          userData?.user_id
            ? `/mypage/${userData.user_id}`
            : "/register-username",
        );
      } catch {
        router.replace("/register-username");
      }
    };

    void signInWithConfirmationTokens();
  }, [accessToken, client, uid, router, setIsLoggedIn]);

  return null;
}
