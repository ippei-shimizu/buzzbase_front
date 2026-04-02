"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { APP_STORE_URL } from "@app/constants/app";

const STORAGE_KEY = "smart_app_banner_dismissed_at";
const RESHOW_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7日

function setCssVar(value: string) {
  document.documentElement.style.setProperty("--smart-banner-height", value);
}

function shouldShow() {
  if (typeof window === "undefined") return false;
  const dismissedAt = localStorage.getItem(STORAGE_KEY);
  return (
    !dismissedAt || Date.now() - Number(dismissedAt) >= RESHOW_INTERVAL_MS
  );
}

export default function SmartAppBanner() {
  const [visible, setVisible] = useState(shouldShow);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible || !bannerRef.current) {
      setCssVar("0px");
      return;
    }
    const updateHeight = () => {
      if (bannerRef.current) {
        setCssVar(`${bannerRef.current.offsetHeight}px`);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [visible]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      ref={bannerRef}
      className="fixed top-0 left-0 right-0 z-[60] bg-zinc-900 border-b border-zinc-700"
    >
      <div className="flex items-center gap-3 px-3 py-1.5 max-w-screen-lg mx-auto">
        <button
          onClick={handleDismiss}
          className="shrink-0 text-zinc-400 hover:text-zinc-200 transition-colors text-lg leading-none"
          aria-label="バナーを閉じる"
        >
          ✕
        </button>
        <Image
          src="/images/buzz-icon.png"
          alt="BUZZ BASE"
          width={36}
          height={36}
          className="shrink-0 rounded-lg"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">BUZZ BASE</p>
          <p className="text-xs text-zinc-400 truncate">
            アプリで成績を記録しよう
          </p>
        </div>
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Image
            src="/images/download_app_store_badge_jp.svg"
            alt="App Storeからダウンロード"
            width={120}
            height={40}
            className="h-[34px] w-auto"
          />
        </a>
      </div>
    </div>
  );
}
