"use client";

import EmailInput from "@app/components/auth/EmailInput";
import ErrorMessages from "@app/components/auth/ErrorMessages";
import PasswordConfirmInput from "@app/components/auth/PasswordConfirmInput";
import PasswordInput from "@app/components/auth/PasswordInput";
import SubmitButton from "@app/components/button/SendButton";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import { signUp } from "@app/services/authService";
import { useRouter } from "next/navigation";
import React, { useCallback, useMemo, useState } from "react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);

  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  const setErrorsWithTimeout = (newErrors: React.SetStateAction<string[]>) => {
    setErrors(newErrors);
    setTimeout(() => {
      setErrors([]);
    }, 5000);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors([]);
    try {
      await signUp({
        email,
        password,
        passwordConfirmation,
        confirm_success_url: process.env.NEXT_PUBLIC_CONFIRM_SUCCESS_URL,
      });
      router.push("/registration-confirmation");
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrorsWithTimeout(error.response.data.errors.full_messages);
      } else {
        setErrorsWithTimeout(["登録に失敗しました"]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = useCallback(
    (email: string) => email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i),
    []
  );

  const isInvalid = useMemo(() => {
    if (email === "") return false;
    return validateEmail(email) ? false : true;
  }, [email, validateEmail]);

  const validatePassword = useCallback(
    (password: string) => /^[a-zA-Z\d]{6,}$/.test(password),
    []
  );

  const isInvalidPassword = React.useMemo(() => {
    if (password === "") return false;
    return validatePassword(password) ? false : true;
  }, [password, validatePassword]);

  const isFormValid = useMemo(() => {
    return (
      email !== "" &&
      password !== "" &&
      passwordConfirmation !== "" &&
      validateEmail(email) &&
      validatePassword(password)
    );
  }, [email, password, passwordConfirmation, validateEmail, validatePassword]);

  return (
    <>
      {isLoading && <LoadingSpinner />}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-end gap-y-4"
      >
        <ErrorMessages errors={errors} />
        <EmailInput
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="caret-zinc-400 bg-main rounded-2xl"
          type="email"
          label="メールアドレス"
          placeholder="buzzbase@example.com"
          labelPlacement="outside"
          isInvalid={isInvalid}
          color={isInvalid ? "danger" : "default"}
          errorMessage={
            isInvalid ? "有効なメールアドレスを入力してください" : ""
          }
          variant={"bordered"}
        />
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="caret-zinc-400 bg-main rounded-2xl"
          label="パスワード"
          placeholder="6文字以上半角英数字のみ"
          labelPlacement="outside"
          isInvalid={isInvalidPassword}
          isPasswordVisible={isPasswordVisible}
          togglePasswordVisibility={togglePasswordVisibility}
          color={isInvalidPassword ? "danger" : "default"}
          errorMessage={
            isInvalidPassword ? "6文字以上で半角英数字のみ有効です" : ""
          }
          type={isPasswordVisible ? "text" : "password"}
          variant={"bordered"}
        />
        <PasswordConfirmInput
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          className="caret-zinc-400 bg-main rounded-2xl"
          label="パスワード（確認用）"
          placeholder="パスワード再入力"
          labelPlacement="outside"
          isConfirmVisible={isConfirmVisible}
          toggleConfirmVisibility={toggleConfirmVisibility}
          type={isConfirmVisible ? "text" : "password"}
          variant={"bordered"}
        />
        <SubmitButton
          className="bg-yellow-500 text-white text-base mt-6 mx-auto px-14 rounded-full block font-semibold"
          type="submit"
          text="登録する"
          disabled={!isFormValid}
        />
      </form>
    </>
  );
}
