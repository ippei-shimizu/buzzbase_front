"use client";

import { useRouter } from "next/navigation";
import { startTransition, useEffect, useRef } from "react";
import { useAuthContext } from "@app/contexts/useAuthContext";
import {
  clearAuthCookies,
  setAuthCookiesFromConfirmation,
} from "@app/services/authService";
import { getUserData } from "@app/services/userService";
import {
  clearPendingConfirmationUid,
  isPendingConfirmationUid,
} from "@app/utils/pendingConfirmationStorage";
import { identifyUser } from "@app/utils/posthog";

interface ConfirmationTokens {
  accessToken: string | null;
  client: string | null;
  uid: string | null;
}

interface Props extends ConfirmationTokens {
  /** 自動ログインを開始したか。呼び出し側がログインフォームの出し分けに使う。 */
  onAutoLoginChange: (isAutoLoggingIn: boolean) => void;
}

/**
 * 自動ログインに必要なトークンが揃っているか。
 * 呼び出し側とこのコンポーネントで判定がずれないよう、条件をここに集約する。
 */
export const hasConfirmationTokens = ({
  accessToken,
  client,
  uid,
}: ConfirmationTokens): boolean => Boolean(accessToken && client && uid);

/** URL からトークンを落とす。履歴とアドレスバーに残す時間を最短にするため遷移を待たない。 */
const stripTokensFromUrl = () => {
  const url = new URL(window.location.href);
  ["access-token", "client", "uid", "expiry"].forEach((key) =>
    url.searchParams.delete(key),
  );
  window.history.replaceState(null, "", url.toString());
};

/**
 * メール確認のリダイレクトに載ってきた認証トークンでそのままログイン状態にし、次の画面へ送る。
 * この端末でサインアップしたメールアドレスと uid が一致しない場合は何もせず手動ログインに任せる。
 */
export default function EmailConfirmationAutoLogin({
  accessToken,
  client,
  uid,
  onAutoLoginChange,
}: Props) {
  const router = useRouter();
  const { setIsLoggedIn } = useAuthContext();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!hasConfirmationTokens({ accessToken, client, uid }) || !uid) return;
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    // 第三者が用意したトークン付き URL を踏ませて別アカウントにログインさせる
    // ログイン CSRF を防ぐため、この端末で確認待ちのメールアドレスとだけ照合する。
    if (!isPendingConfirmationUid(uid)) {
      stripTokensFromUrl();
      return;
    }

    const signInWithConfirmationTokens = async () => {
      onAutoLoginChange(true);
      setAuthCookiesFromConfirmation({
        accessToken: accessToken as string,
        client: client as string,
        uid,
      });
      stripTokensFromUrl();

      let userData: Awaited<ReturnType<typeof getUserData>>;
      try {
        userData = await getUserData();
      } catch {
        // 失敗の最頻の原因はトークンの失効。ログイン状態にはせず手動ログインに戻す。
        clearAuthCookies();
        setIsLoggedIn(false);
        onAutoLoginChange(false);
        return;
      }

      clearPendingConfirmationUid();
      setIsLoggedIn(true);
      if (userData?.id) identifyUser(userData.id);

      // 認証 cookie はクライアント側で書き換わるため、遷移だけでは Server Component が
      // 未ログインのまま描画される。既存のログイン経路と同じく refresh を伴わせる。
      startTransition(() => {
        router.replace(
          userData?.user_id
            ? `/mypage/${userData.user_id}`
            : "/register-username",
        );
        router.refresh();
      });
    };

    void signInWithConfirmationTokens();
  }, [accessToken, client, uid, router, setIsLoggedIn, onAutoLoginChange]);

  return null;
}
