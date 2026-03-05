"use client";

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Skeleton,
} from "@heroui/react";
import Link from "next/link";
import HeaderLoginAndSignUp from "@app/components/auth/HeaderLoginAndSignUp";
import { CalendarIcon } from "@app/components/icon/CalendarIcon";
import { MailIcon } from "@app/components/icon/MailIcon";
import { MenuIcon } from "@app/components/icon/MenuIcon";
import { NoteIcon } from "@app/components/icon/NoteIcon";
import NotificationBadge from "@app/components/notification/NotificationBadge";
import UserSearch from "@app/components/user/UserSearch";
import { useAuthContext } from "@app/contexts/useAuthContext";

export default function HeaderRight() {
  const { isLoggedIn, loading } = useAuthContext();

  if (loading) {
    return (
      <>
        <Skeleton className="rounded-lg">
          <div className="h-6 rounded-lg bg-default-300"></div>
        </Skeleton>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-x-4 pt-1">
        {isLoggedIn ? (
          <div className="flex items-center gap-x-4">
            <UserSearch />
            <NotificationBadge />
            <Dropdown>
              <DropdownTrigger>
                <button aria-label="メニュー">
                  <MenuIcon fill="#F4F4F4" />
                </button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Header menu">
                <DropdownItem
                  key="note"
                  as={Link}
                  href="/note"
                  startContent={
                    <NoteIcon fill="currentColor" width="18" height="18" />
                  }
                >
                  野球ノート
                </DropdownItem>
                <DropdownItem
                  key="seasons"
                  as={Link}
                  href="/seasons"
                  startContent={
                    <CalendarIcon fill="currentColor" width="18" height="18" />
                  }
                >
                  シーズン管理
                </DropdownItem>
                <DropdownItem
                  key="contact"
                  as={Link}
                  href="/contact"
                  startContent={
                    <MailIcon fill="currentColor" width="18" height="18" />
                  }
                >
                  ご意見・改善案
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        ) : (
          <>
            <HeaderLoginAndSignUp />
            <div className="absolute top-14 right-2">
              <UserSearch />
            </div>
          </>
        )}
      </div>
    </>
  );
}
