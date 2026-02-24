import type { SignInData, SignUpData } from "@app/interface";
import Cookies from "js-cookie";
import axiosInstance from "@app/utils/axiosInstance";

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
  const sixMonths = 30 * 6;
  Cookies.set("access-token", response.headers["access-token"], {
    expires: sixMonths,
  });
  Cookies.set("client", response.headers["client"], { expires: sixMonths });
  Cookies.set("uid", response.headers["uid"], { expires: sixMonths });

  return response;
};

export const signOut = async () => {
  const response = await axiosInstance.delete("/api/v1/auth/sign_out");

  Cookies.remove("access-token");
  Cookies.remove("client");
  Cookies.remove("uid");

  return response;
};

export const resendConfirmation = async (email: string) => {
  const response = await axiosInstance.post("/api/v1/auth/confirmation", {
    email: email,
    redirect_url: process.env.NEXT_PUBLIC_CONFIRM_SUCCESS_URL,
  });

  return response;
};
