"use client";
import { Button } from "@heroui/react";
import React, { useState } from "react";
import ResendConfirmationModal from "@app/components/modal/ResendConfirmationModal";
import ToastSuccess from "@app/components/toast/ToastSuccess";

export default function RegistrationConfirmation() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleResendSuccess = () => {
    setSuccessMessage("確認メールを再送信しました。メールをご確認ください。");
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 5000);
  };

  return (
    <>
      {showSuccessToast && <ToastSuccess text={successMessage} />}
      <ResendConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        email=""
        onResendSuccess={handleResendSuccess}
        showEmailInput={true}
      />
      <div className="px-4 pt-32 max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <h2 className="text-lg bold mb-8">
          BUZZ BASEへご登録ありがとうございます！
        </h2>
        <p className="text-base leading-6 mb-6">
          入力したメールアドレス宛にアカウント確認メールを送信しました。
          <br></br>
          メール内のリンクをクリックして、登録を完了してください。
        </p>
        <p className="text-sm text-red-500 mb-6">
          メールが見つからない場合は、迷惑メールフォルダをご確認ください。
        </p>
        <div className="text-center">
          <Button
            color="primary"
            variant="bordered"
            onPress={() => setIsModalOpen(true)}
            className="font-semibold"
          >
            確認メールが届かない場合はこちら
          </Button>
        </div>
      </div>
    </>
  );
}
