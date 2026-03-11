"use client";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import EmailInput from "@app/components/auth/EmailInput";
import ErrorMessages from "@app/components/auth/ErrorMessages";
import GoogleLoginButton from "@app/components/auth/GoogleLoginButton";
import PasswordInput from "@app/components/auth/PasswordInput";
import SubmitButton from "@app/components/button/SendButton";
import ResendConfirmationModal from "@app/components/modal/ResendConfirmationModal";
import LoadingSpinner from "@app/components/spinner/LoadingSpinner";
import ToastSuccess from "@app/components/toast/ToastSuccess";
import { useAuthContext } from "@app/contexts/useAuthContext";
import { signIn } from "@app/services/authService";
import { getUserData } from "@app/services/userService";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { setIsLoggedIn } = useAuthContext();
  const router = useRouter();

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);

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
      await signIn({ email, password });
      setIsLoggedIn(true);
      const userData = await getUserData();
      if (userData && userData.user_id) {
        setIsLoggedIn(true);
        router.push(`/mypage/${userData.user_id}`);
      } else {
        setIsLoggedIn(true);
        router.push("/register-username");
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.errors) {
        const errorMessages = error.response.data.errors;
        const isUnconfirmedError =
          error.response.status === 401 &&
          Array.isArray(errorMessages) &&
          errorMessages.some(
            (msg: string) =>
              msg.includes(
                "A confirmation email was sent to your account at",
              ) ||
              msg.includes(
                "You must follow the instructions in the email before your account can be activated",
              ),
          );

        if (isUnconfirmedError) {
          setIsModalOpen(true);
        } else {
          setErrorsWithTimeout(errorMessages);
        }
      } else {
        setErrorsWithTimeout(["ログインに失敗しました"]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendSuccess = () => {
    setSuccessMessage("確認メールを再送信しました。メールをご確認ください。");
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 5000);
  };

  const validateEmail = useCallback(
    (email: string) => email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i),
    [],
  );

  const isInvalid = useMemo(() => {
    if (email === "") return false;
    return validateEmail(email) ? false : true;
  }, [email, validateEmail]);

  const validatePassword = useCallback(
    (password: string) => /^[a-zA-Z\d]{6,}$/.test(password),
    [],
  );

  const isInvalidPassword = useMemo(() => {
    if (password === "") return false;
    return validatePassword(password) ? false : true;
  }, [password, validatePassword]);

  const isFormValid = useMemo(() => {
    return (
      email !== "" &&
      password !== "" &&
      validateEmail(email) &&
      validatePassword(password)
    );
  }, [email, password, validateEmail, validatePassword]);

  return (
    <>
      {isLoading && <LoadingSpinner />}
      {showSuccessToast && <ToastSuccess text={successMessage} />}
      <ResendConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        email={email}
        onResendSuccess={handleResendSuccess}
        showEmailInput={false}
      />
      <GoogleLoginButton />
      <div className="flex items-center gap-x-3 my-4">
        <div className="h-px flex-1 bg-gray-300" />
        <span className="text-sm text-gray-400">または</span>
        <div className="h-px flex-1 bg-gray-300" />
      </div>
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
          variant={"bordered"}
          errorMessage={
            isInvalid ? "有効なメールアドレスを入力してください" : ""
          }
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
          variant={"bordered"}
          errorMessage={
            isInvalidPassword ? "6文字以上で半角英数字のみ有効です" : ""
          }
          type={isPasswordVisible ? "text" : "password"}
        />
        <SubmitButton
          className="bg-yellow-500 text-white h-auto text-base mt-6 mx-auto py-2.5 px-12 rounded-full block font-semibold"
          type="submit"
          text="ログインする"
          disabled={!isFormValid}
        />
      </form>
    </>
  );
}
