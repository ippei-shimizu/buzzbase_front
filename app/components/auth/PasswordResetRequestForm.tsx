"use client";
import { useCallback, useMemo, useState } from "react";
import EmailInput from "@app/components/auth/EmailInput";
import ErrorMessages from "@app/components/auth/ErrorMessages";
import SubmitButton from "@app/components/button/SendButton";
import { requestPasswordReset } from "@app/services/authService";
import {
  isRateLimitError,
  rateLimitErrorMessage,
} from "@app/utils/rateLimitError";

// アカウント列挙・認証方式の推測を防ぐため、送信成功・失敗やアカウントの有無に
// かかわらず常に同じ文言を表示する。レート制限だけは対象メールの有無に依存しないため例外的に別文言を出す。
const GENERIC_MESSAGE =
  "ご入力いただいたメールアドレス宛にパスワード再設定のご案内をお送りしました（該当するアカウントが存在する場合）。メールをご確認ください。";

export default function PasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateEmail = useCallback(
    (email: string) => email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i),
    [],
  );

  const isInvalid = useMemo(() => {
    if (email === "") return false;
    return validateEmail(email) ? false : true;
  }, [email, validateEmail]);

  const isFormValid = useMemo(
    () => email !== "" && !!validateEmail(email),
    [email, validateEmail],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isFormValid || isLoading) return;
    setIsLoading(true);
    setErrors([]);
    try {
      await requestPasswordReset(email);
      setIsSubmitted(true);
    } catch (error: unknown) {
      if (isRateLimitError(error)) {
        setErrors([rateLimitErrorMessage(error)]);
      } else {
        setIsSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return <p className="text-sm text-gray-200">{GENERIC_MESSAGE}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col justify-end gap-y-4">
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
        variant={"bordered"}
        errorMessage={isInvalid ? "有効なメールアドレスを入力してください" : ""}
      />
      <SubmitButton
        className="bg-yellow-500 text-white h-auto text-base mt-6 mx-auto py-2.5 px-12 rounded-full block font-semibold"
        type="submit"
        text="送信する"
        disabled={!isFormValid || isLoading}
      />
    </form>
  );
}
