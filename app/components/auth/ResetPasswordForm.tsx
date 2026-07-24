"use client";
import type { ResetPasswordAuthHeaders } from "@app/interface";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ErrorMessages from "@app/components/auth/ErrorMessages";
import PasswordConfirmInput from "@app/components/auth/PasswordConfirmInput";
import PasswordInput from "@app/components/auth/PasswordInput";
import SubmitButton from "@app/components/button/SendButton";
import { resetPassword } from "@app/services/authService";

interface Props {
  authHeaders: ResetPasswordAuthHeaders;
}

export default function ResetPasswordForm({ authHeaders }: Props) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const router = useRouter();

  const validatePassword = (value: string) => /^[a-zA-Z\d]{6,}$/.test(value);

  const isInvalidPassword = useMemo(
    () => password !== "" && !validatePassword(password),
    [password],
  );

  const isFormValid = useMemo(
    () => validatePassword(password) && passwordConfirmation === password,
    [password, passwordConfirmation],
  );

  const setErrorsWithTimeout = (newErrors: string[]) => {
    setErrors(newErrors);
    setTimeout(() => setErrors([]), 5000);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isLoading) return;
    if (!validatePassword(password)) {
      setErrorsWithTimeout(["6文字以上の半角英数字で入力してください"]);
      return;
    }
    if (password !== passwordConfirmation) {
      setErrorsWithTimeout(["確認用パスワードが一致しません"]);
      return;
    }

    setIsLoading(true);
    setErrors([]);
    try {
      await resetPassword({ password, passwordConfirmation }, authHeaders);
      setIsCompleted(true);
      setTimeout(() => router.push("/signin"), 3000);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.errors) {
        setErrorsWithTimeout(error.response.data.errors);
      } else {
        setErrorsWithTimeout([
          "パスワードの再設定に失敗しました。もう一度お試しください。",
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <p className="text-sm text-yellow-500">
        パスワードを更新しました。ログイン画面に移動します。
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col justify-end gap-y-4">
      <ErrorMessages errors={errors} />
      <PasswordInput
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="caret-zinc-400 bg-main rounded-2xl"
        label="新しいパスワード"
        placeholder="6文字以上半角英数字のみ"
        labelPlacement="outside"
        isInvalid={isInvalidPassword}
        isPasswordVisible={isPasswordVisible}
        togglePasswordVisibility={() => setIsPasswordVisible((v) => !v)}
        color={isInvalidPassword ? "danger" : "default"}
        variant={"bordered"}
        errorMessage={
          isInvalidPassword ? "6文字以上で半角英数字のみ有効です" : ""
        }
        type={isPasswordVisible ? "text" : "password"}
      />
      <PasswordConfirmInput
        value={passwordConfirmation}
        onChange={(e) => setPasswordConfirmation(e.target.value)}
        className="caret-zinc-400 bg-main rounded-2xl"
        label="新しいパスワード（確認用）"
        placeholder="もう一度入力してください"
        labelPlacement="outside"
        isConfirmVisible={isConfirmVisible}
        toggleConfirmVisibility={() => setIsConfirmVisible((v) => !v)}
        variant={"bordered"}
        type={isConfirmVisible ? "text" : "password"}
      />
      <SubmitButton
        className="bg-yellow-500 text-white h-auto text-base mt-6 mx-auto py-2.5 px-12 rounded-full block font-semibold"
        type="submit"
        text="パスワードを変更する"
        disabled={!isFormValid || isLoading}
      />
    </form>
  );
}
