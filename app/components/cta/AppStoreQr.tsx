import Image from "next/image";

type Props = {
  className?: string;
};

/**
 * App Store の静的QR（?ct=tool_qr）＋説明の共通ブロック。
 * デスクトップでは App Store バッジが行き止まりになるため、スマホのカメラで
 * 読み取ってアプリ（＝モバイルでの登録）へ橋渡しする。
 * インタラクションを持たないためサーバーコンポーネントのまま利用できる。
 */
export default function AppStoreQr({ className = "" }: Props) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/images/app-store-qr.svg"
        alt="App Store で BUZZ BASE を開くQRコード"
        width={80}
        height={80}
        className="rounded-md"
      />
      <p className="text-left text-xs text-zinc-400 leading-5">
        スマホのカメラで読み取って
        <br />
        アプリを入手（App Store）
      </p>
    </div>
  );
}
