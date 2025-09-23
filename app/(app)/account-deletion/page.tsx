"use client";

import Header from "@app/components/header/Header";
import { useAuthContext } from "@app/contexts/useAuthContext";
import { deleteUser, getCurrentUserId } from "@app/services/userService";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountDeletionPage() {
  const { isLoggedIn } = useAuthContext();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isLoggedIn === false) {
      return router.push("/signin");
    }
  }, [router, isLoggedIn]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) {
        throw new Error("ユーザーIDの取得に失敗しました");
      }

      await deleteUser(currentUserId);

      router.push("/signin");
    } catch (error) {
      console.error("アカウント削除エラー:", error);
      alert(
        "アカウントの削除に失敗しました。しばらく時間をおいてから再度お試しください。",
      );
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <>
      <div className="buzz-dark flex flex-col w-full min-h-screen bg-main">
        <div className="h-full bg-main">
          <Header />
          <main className="h-full pb-16 w-full  max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
            <div className="px-4 pt-20 lg:border-x-1 lg:border-b-1 lg:border-zinc-500 lg:px-6 lg:pb-12">
              <h2 className="text-2xl font-bold">アカウント削除について</h2>
              <p className="mt-4 text-base text-danger-400">
                アカウント削除前にお読みください
              </p>
              <div className="space-y-4 text-sm leading-relaxed mt-10">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">重要な注意事項</h3>
                  <ul className="space-y-2">
                    <li>
                      •
                      アカウントを削除すると、すべてのデータが完全に削除されます
                    </li>
                    <li>• 削除されたデータは復元できません</li>
                    <li>
                      •
                      同じメールアドレスで再登録は可能ですが、過去のデータは復元されません
                    </li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">削除されるデータ</h3>
                  <ul className="space-y-1">
                    <li>• プロフィール情報</li>
                    <li>• 試合結果データ</li>
                    <li>• 成績データ（打撃成績、投手成績など）</li>
                    <li>• フォロー・フォロワー情報</li>
                    <li>• グループ参加情報</li>
                    <li>• その他すべての関連データ</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">削除処理について</h3>
                  <p className="">
                    アカウント削除は即座に実行されます。削除処理完了後は自動的にログアウトされ、
                    ログインページにリダイレクトされます。
                  </p>
                </div>
              </div>
              <div className="text-center mt-8">
                <Button
                  color="danger"
                  variant="solid"
                  size="md"
                  onClick={onOpen}
                  className="px-8 py-3 text-base font-semibold"
                >
                  アカウントを削除する
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 削除確認モーダル */}
      <Modal isOpen={isOpen} onClose={onClose} size="sm" backdrop="blur">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-xl font-semibold text-center">
              アカウント削除の確認
            </h3>
          </ModalHeader>
          <ModalBody>
            <div className="text-center">
              <p className="text-danger-400 font-semibold mb-2">
                本当にアカウントを削除しますか？
              </p>
              <p className="text-sm text-zinc-400">
                この操作は取り消すことができません。
              </p>
            </div>
          </ModalBody>
          <ModalFooter className="flex justify-center gap-4">
            <Button
              variant="light"
              onClick={onClose}
              disabled={isDeleting}
              className="text-white"
            >
              キャンセル
            </Button>
            <Button
              color="danger"
              variant="solid"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              isLoading={isDeleting}
            >
              削除する
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
