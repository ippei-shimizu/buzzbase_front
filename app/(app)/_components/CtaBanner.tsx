import Image from "next/image";
import { APP_STORE_URL } from "@app/constants/app";

type Props = {
  heading?: string;
  body: string;
  className?: string;
};

export default function CtaBanner({
  heading,
  body,
  className = "mt-10",
}: Props) {
  return (
    <section
      className={`${className} rounded-xl bg-gradient-to-r from-yellow-900/30 to-yellow-800/20 border border-yellow-700/40 px-5 py-6`}
    >
      <Image
        src="/images/buzz-logo-v2.png"
        alt="BUZZ BASE"
        width={140}
        height={34}
        className="mb-3"
      />
      {heading ? <h2 className="text-lg font-bold mb-2">{heading}</h2> : null}
      <p className="text-sm text-zinc-300 leading-6 mb-4">{body}</p>
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <Image
          src="/images/download_app_store_badge_jp.svg"
          alt="App Storeからダウンロード"
          width={150}
          height={50}
          className="h-[44px] w-auto"
        />
      </a>
      <p className="text-xs text-zinc-400 mt-2">
        登録30秒・クレジットカード不要・完全無料
      </p>
    </section>
  );
}
