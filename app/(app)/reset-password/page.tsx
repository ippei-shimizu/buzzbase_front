import ResetPasswordForm from "@app/components/auth/ResetPasswordForm";

interface PageProps {
  searchParams: Promise<{
    "access-token"?: string;
    client?: string;
    uid?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const accessToken = params["access-token"];
  const client = params.client;
  const uid = params.uid;
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
