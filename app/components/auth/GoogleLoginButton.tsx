"use client";

import type { CredentialResponse } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import ErrorMessages from "@app/components/auth/ErrorMessages";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { useAuthContext } from "@app/contexts/useAuthContext";
import { trackEvent } from "@app/lib/analytics";
import { googleSignIn } from "@app/services/authService";
import { getUserData } from "@app/services/userService";
import { trackSignUpCompleted, trackUserLoggedIn } from "@app/utils/analytics";
import { identifyUser } from "@app/utils/posthog";
import {
  isRateLimitError,
  rateLimitErrorMessage,
} from "@app/utils/rateLimitError";

interface GoogleLoginButtonProps {
  mode?: "signin" | "signup";
}

export default function GoogleLoginButton({
  mode = "signin",
}: GoogleLoginButtonProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setIsLoggedIn } = useAuthContext();
  const router = useRouter();

  // 認証 cookie はクライアント側で書き換わるため、遷移だけでは Server Component の
  // レンダー結果が前のユーザーのまま残る。refresh で作り直す。
  // 単一 transition にまとめて遷移先の RSC を2回取りに行かないようにする。
  const navigateAfterAuth = (path: string) => {
    startTransition(() => {
      router.push(path);
      router.refresh();
    });
  };

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrors(["Googleログインに失敗しました"]);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const response = await googleSignIn(credentialResponse.credential);

      if (response.data.requires_username) {
        trackEvent("sign_up", { method: "google" });
        trackSignUpCompleted("google");
        navigateAfterAuth("/register-username");
        setIsLoggedIn(true);
      } else {
        // requires_username=false はバックエンドが既存ユーザーと判断したことを意味する。
        // getUserData() が user_id を返さない一時的失敗があっても sign_up ではなく login として記録する。
        trackEvent("login", { method: "google" });
        trackUserLoggedIn("google");
        const userData = await getUserData();
        if (userData && userData.user_id) {
          identifyUser(userData.id);
          navigateAfterAuth(`/mypage/${userData.user_id}`);
        } else {
          navigateAfterAuth("/register-username");
        }
        setIsLoggedIn(true);
      }
    } catch (error: unknown) {
      setErrors([
        isRateLimitError(error)
          ? rateLimitErrorMessage(error)
          : "Googleログインに失敗しました",
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setErrors(["Googleログインに失敗しました"]);
  };

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <ErrorMessages errors={errors} />
      <div className="flex justify-center">
        <div className="overflow-hidden rounded-full">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            text={mode === "signup" ? "signup_with" : "signin_with"}
            shape="pill"
            size="large"
            width="300"
          />
        </div>
      </div>
    </>
  );
}
