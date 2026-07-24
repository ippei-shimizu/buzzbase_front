"use client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ResetPasswordForm from "@app/components/auth/ResetPasswordForm";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const accessToken = searchParams.get("access-token");
  const client = searchParams.get("client");
  const uid = searchParams.get("uid");
  const hasValidToken = !!(accessToken && client && uid);

  return (
    <div className="h-full flex flex-col items-center justify-center px-4">
      <div className="w-11/12 max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
        <h2 className="text-2xl font-bold mb-9">新しいパスワードの設定</h2>
        {hasValidToken ? (
          <ResetPasswordForm authHeaders={{ accessToken, client, uid }} />
        ) : (
          <p className="text-sm text-gray-200">
            このページにはアクセスできません。パスワード再設定メールのリンクからアクセスされた場合には、URLをご確認ください。
          </p>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center">
          読み込み中...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
