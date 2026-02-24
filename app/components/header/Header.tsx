"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import HeaderRight from "@app/components/header/HeaderRight";
import { useAuthContext } from "@app/contexts/useAuthContext";
import { getNotificationCount } from "@app/services/notificationsService";

type NotificationCount = {
  count: number;
};

export default function Header() {
  const [notificationCount, setNotificationCount] =
    useState<NotificationCount | null>(null);
  const { isLoggedIn } = useAuthContext();
  useEffect(() => {
    localStorage.removeItem("gameResultId");
    fetchDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fetchDate = async () => {
    try {
      if (!isLoggedIn == false) {
        const responseNotificationCount = await getNotificationCount();
        setNotificationCount(responseNotificationCount);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <header className="py-2 px-3 border-b border-b-zinc-500 fixed top-0 w-full bg-main z-50">
        <div className="flex items-center justify-between h-full max-w-[692px] mx-auto lg:m-[0_auto_0_28%] relative">
          <Link href="/">
            <Image
              src="/images/buzz-logo-v2.png"
              width="120"
              height="30"
              alt="BUZZ BASE"
            />
          </Link>
          <HeaderRight />
        </div>
      </header>
    </>
  );
}
