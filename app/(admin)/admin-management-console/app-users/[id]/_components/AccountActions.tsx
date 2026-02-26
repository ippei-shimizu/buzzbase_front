"use client";

import type { AppUserDetail } from "../../../../../types/admin";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { suspendUser, restoreUser, softDeleteUser } from "../../actions";

interface AccountActionsProps {
  user: AppUserDetail;
}

export default function AccountActions({ user }: AccountActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dialog, setDialog] = useState<"suspend" | "restore" | "delete" | null>(
    null,
  );
  const [suspendReason, setSuspendReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSuspend = async () => {
    setIsLoading(true);
    setError(null);
    const result = await suspendUser(user.id, suspendReason || undefined);
    setIsLoading(false);
    if (result.success) {
      setDialog(null);
      setSuspendReason("");
      router.refresh();
    } else {
      setError(result.errors?.join(", ") || "エラーが発生しました");
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    setError(null);
    const result = await restoreUser(user.id);
    setIsLoading(false);
    if (result.success) {
      setDialog(null);
      router.refresh();
    } else {
      setError(result.errors?.join(", ") || "エラーが発生しました");
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    const result = await softDeleteUser(user.id);
    setIsLoading(false);
    if (result.success) {
      setDialog(null);
      router.refresh();
    } else {
      setError(result.errors?.join(", ") || "エラーが発生しました");
    }
  };

  if (user.account_status === "deleted") {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          アカウント操作
        </h3>
        <p className="text-sm text-gray-500">
          このアカウントは削除済みのため、操作できません。
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          アカウント操作
        </h3>
        <div className="flex flex-wrap gap-3">
          {user.account_status === "active" && (
            <button
              type="button"
              onClick={() => setDialog("suspend")}
              className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              アカウント停止
            </button>
          )}

          {user.account_status === "suspended" && (
            <button
              type="button"
              onClick={() => setDialog("restore")}
              className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              アカウント復帰
            </button>
          )}

          <button
            type="button"
            onClick={() => setDialog("delete")}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            アカウント削除
          </button>
        </div>
      </div>

      {/* Dialog overlay */}
      {dialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => {
                if (!isLoading) {
                  setDialog(null);
                  setError(null);
                }
              }}
            />

            <div className="relative inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                {dialog === "suspend" && (
                  <>
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                        <svg
                          className="h-6 w-6 text-yellow-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          アカウント停止
                        </h3>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            {user.name}
                            のアカウントを停止します。停止理由を入力してください（任意）。
                          </p>
                          <textarea
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            placeholder="停止理由（任意）"
                            rows={3}
                            className="mt-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {dialog === "restore" && (
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        アカウント復帰
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {user.name}のアカウントを復帰させますか？
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {dialog === "delete" && (
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        アカウント削除
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {user.name}
                          のアカウントを論理削除します。この操作は取り消せません。本当に削除しますか？
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {dialog === "suspend" && (
                  <button
                    type="button"
                    onClick={handleSuspend}
                    disabled={isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isLoading ? "処理中..." : "停止する"}
                  </button>
                )}
                {dialog === "restore" && (
                  <button
                    type="button"
                    onClick={handleRestore}
                    disabled={isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isLoading ? "処理中..." : "復帰する"}
                  </button>
                )}
                {dialog === "delete" && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isLoading ? "処理中..." : "削除する"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setDialog(null);
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
