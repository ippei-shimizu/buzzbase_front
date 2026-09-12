import Image from "next/image";
import Link from "next/link";
import PasswordResetRequestForm from "@app/components/auth/PasswordResetRequestForm";

export default function Page() {
  return (
    <>
      <Image
        src="/images/logo-bg.png"
        alt=""
        width={500}
        height={400}
        className="absolute opacity-[0.03] -left-28 -top-10 lg:left-24 lg:w-[620px]"
      />
      <div className="h-full flex flex-col items-center justify-center px-4">
        <div className="w-11/12 max-w-[720px] mx-auto lg:m-[0_auto_0_28%]">
          <h2 className="text-2xl font-bold mb-4">パスワードの再設定</h2>
          <p className="text-sm text-zinc-400 mb-8">
            ご登録のメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
          </p>
          <PasswordResetRequestForm />
          <p className="text-sm text-zinc-400 mt-8 text-center">
            <Link href="/signin" className="text-yellow-500">
              ログイン画面に戻る
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
