import type {
  ResetPasswordAuthHeaders,
  ResetPasswordData,
  SignInData,
  SignUpData,
} from "@app/interface";
import type { AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";
import axios from "axios";
import Cookies from "js-cookie";
import axiosInstance from "@app/utils/axiosInstance";

const setAuthCookies = (
  headers: AxiosResponseHeaders | Partial<RawAxiosResponseHeaders>,
) => {
  const sixMonths = 30 * 6;
  const options = {
    expires: sixMonths,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
  };
  Cookies.set("access-token", headers["access-token"], options);
  Cookies.set("client", headers["client"], options);
  Cookies.set("uid", headers["uid"], options);
};

export const signUp = async (data: SignUpData) => {
  const response = await axiosInstance.post("/api/v1/auth", {
    email: data.email,
    password: data.password,
    password_confirmation: data.passwordConfirmation,
    confirm_success_url: process.env.NEXT_PUBLIC_CONFIRM_SUCCESS_URL,
  });

  return response;
};

export const signIn = async (data: SignInData) => {
  const response = await axiosInstance.post("/api/v1/auth/sign_in", {
    email: data.email,
    password: data.password,
  });
  setAuthCookies(response.headers);

  return response;
};

/** devise_token_auth の認証 cookie 3点を破棄する。 */
export const clearAuthCookies = () => {
  Cookies.remove("access-token");
  Cookies.remove("client");
  Cookies.remove("uid");
};

export const signOut = async () => {
  const response = await axiosInstance.delete("/api/v1/auth/sign_out");

  clearAuthCookies();

  return response;
};

export const googleSignIn = async (idToken: string) => {
  const response = await axiosInstance.post("/api/v1/google_sign_in", {
    id_token: idToken,
  });
  setAuthCookies(response.headers);

  return response;
};

export const resendConfirmation = async (email: string) => {
  const response = await axiosInstance.post("/api/v1/auth/confirmation", {
    email: email,
    redirect_url: process.env.NEXT_PUBLIC_CONFIRM_SUCCESS_URL,
  });

  return response;
};

export const requestPasswordReset = async (email: string) => {
  // 本番環境変数は末尾スラッシュ付きで設定される場合があり、単純な文字列結合だと
  // "https://buzzbase.jp//reset-password" のような二重スラッシュになり
  // devise_token_authのredirect_whitelistの完全一致チェックに失敗しうるため除去する。
  const baseUrl = (process.env.NEXT_PUBLIC_METADATA_BASE_URL || "").replace(
    /\/+$/,
    "",
  );
  const response = await axiosInstance.post("/api/v1/auth/password", {
    email,
    redirect_url: `${baseUrl}/reset-password`,
  });

  return response;
};

// パスワード再設定リンクのワンタイムトークンで認証するため、ログイン中セッションの
// Cookieを自動付与するaxiosInstanceは使わず、素のaxiosでヘッダーを明示的に指定する。
export const resetPassword = async (
  data: ResetPasswordData,
  authHeaders: ResetPasswordAuthHeaders,
) => {
  const response = await axios.put(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/password`,
    {
      password: data.password,
      password_confirmation: data.passwordConfirmation,
    },
    {
      headers: {
        "access-token": authHeaders.accessToken,
        client: authHeaders.client,
        uid: authHeaders.uid,
      },
    },
  );

  return response;
};
