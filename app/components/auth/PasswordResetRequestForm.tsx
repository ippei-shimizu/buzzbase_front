"use client";
import { useCallback, useMemo, useState } from "react";
import EmailInput from "@app/components/auth/EmailInput";
import SubmitButton from "@app/components/button/SendButton";
import { requestPasswordReset } from "@app/services/authService";

// アカウント列挙・認証方式の推測を防ぐため、送信成功・失敗やアカウントの有無に
// かかわらず常に同じ文言を表示する。
const GENERIC_MESSAGE =
  "ご入力いただいたメールアドレス宛にパスワード再設定のご案内をお送りしました（該当するアカウントが存在する場合）。メールをご確認ください。";

export default function PasswordResetRequestForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    try {
      await requestPasswordReset(email);
    } catch {
      // 成否にかかわらず同一文言を表示するため、ここではエラー内容を利用しない
    } finally {
      setIsLoading(false);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return <p className="text-sm text-gray-200">{GENERIC_MESSAGE}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col justify-end gap-y-4">
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
