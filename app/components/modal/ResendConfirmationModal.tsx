"use client";
import type { ResendConfirmationModalProps } from "@app/interface";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { AxiosError } from "axios";
import { useCallback, useMemo, useState } from "react";
import EmailInput from "@app/components/auth/EmailInput";
import ErrorMessages from "@app/components/auth/ErrorMessages";
import { resendConfirmation } from "@app/services/authService";

export default function ResendConfirmationModal({
  isOpen,
  onClose,
  email: initialEmail = "",
  onResendSuccess,
  showEmailInput,
}: ResendConfirmationModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateEmail = useCallback(
    (email: string) => email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i),
    [],
  );

  const isInvalid = useMemo(() => {
    if (email === "") return false;
    return validateEmail(email) ? false : true;
  }, [email, validateEmail]);

  const isFormValid = useMemo(() => {
    return email !== "" && validateEmail(email);
  }, [email, validateEmail]);

  const setErrorsWithTimeout = (newErrors: string[]) => {
    setErrors(newErrors);
    setTimeout(() => {
      setErrors([]);
    }, 5000);
  };

  const handleResend = async () => {
    setIsLoading(true);
    setErrors([]);
    try {
      await resendConfirmation(email);
      onResendSuccess();
      onClose();
      setEmail("");
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data?.errors) {
        setErrorsWithTimeout(error.response.data.errors);
      } else {
        setErrorsWithTimeout([
          "確認メールの送信に失敗しました。しばらくしてから再度お試しください。",
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setErrors([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      placement="center"
      className="buzz-dark"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          メールアドレス確認のお願い
        </ModalHeader>
        <ModalBody>
          <ErrorMessages errors={errors} />
          <p className="text-sm text-gray-200">
            アカウントの登録を完了するには、メールアドレスの確認が必要です。
            {!showEmailInput && (
              <>
                <br />
                確認メールを再送信しますか？
              </>
            )}
          </p>
          {showEmailInput ? (
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
          ) : (
            <p className="text-sm font-semibold">{email}</p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={handleClose}
            className="text-white"
          >
            キャンセル
          </Button>
          <Button
            color="primary"
            onPress={handleResend}
            isLoading={isLoading}
            isDisabled={!isFormValid || isLoading}
          >
            確認メールを再送する
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
