"use client";

import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ErrorMessages from "@app/components/auth/ErrorMessages";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { useAuthContext } from "@app/contexts/useAuthContext";
import { googleSignIn } from "@app/services/authService";
import { getUserData } from "@app/services/userService";

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

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrors(["Googleログインに失敗しました"]);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      const response = await googleSignIn(credentialResponse.credential);
      setIsLoggedIn(true);

      if (response.data.requires_username) {
        router.push("/register-username");
      } else {
        const userData = await getUserData();
        if (userData && userData.user_id) {
          router.push(`/mypage/${userData.user_id}`);
        } else {
          router.push("/register-username");
        }
      }
    } catch {
      setErrors(["Googleログインに失敗しました"]);
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
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          text={mode === "signup" ? "signup_with" : "signin_with"}
          shape="pill"
          size="large"
          width="300"
        />
      </div>
    </>
  );
}
