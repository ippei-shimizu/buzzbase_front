import type { SignInData, SignUpData } from "@app/interface";
import type { AxiosResponseHeaders, RawAxiosResponseHeaders } from "axios";
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

export const signOut = async () => {
  const response = await axiosInstance.delete("/api/v1/auth/sign_out");

  Cookies.remove("access-token");
  Cookies.remove("client");
  Cookies.remove("uid");

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
