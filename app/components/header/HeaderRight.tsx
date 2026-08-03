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
import { BallIcon } from "@app/components/icon/BallIcon";
import { CalendarIcon } from "@app/components/icon/CalendarIcon";
import { MailIcon } from "@app/components/icon/MailIcon";
import { MenuIcon } from "@app/components/icon/MenuIcon";
import { NoteIcon } from "@app/components/icon/NoteIcon";
import { RankingIcon } from "@app/components/icon/RankingIcon";
import { StatsIcon } from "@app/components/icon/StatsIcon";
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
                  key="reflection-templates"
                  as={Link}
                  href="/note/templates"
                  startContent={
                    <NoteIcon fill="currentColor" width="18" height="18" />
                  }
                >
                  振り返りテンプレ
                </DropdownItem>
                <DropdownItem
                  key="practice-records"
                  as={Link}
                  href="/practice/records"
                  startContent={
                    <BallIcon fill="currentColor" width="18" height="18" />
                  }
                >
                  練習記録
                </DropdownItem>
                <DropdownItem
                  key="themes"
                  as={Link}
                  href="/themes"
                  startContent={
                    <BallIcon fill="currentColor" width="18" height="18" />
                  }
                >
                  課題
                </DropdownItem>
                <DropdownItem
                  key="review"
                  as={Link}
                  href="/review"
                  startContent={
                    <StatsIcon fill="currentColor" width="18" height="18" />
                  }
                >
                  振り返りレポート
                </DropdownItem>
                <DropdownItem
                  key="insights"
                  as={Link}
                  href="/insights"
                  startContent={
                    <StatsIcon fill="currentColor" width="18" height="18" />
                  }
                >
                  練習と成績のつながり
                </DropdownItem>
                <DropdownItem
                  key="goals"
                  as={Link}
                  href="/goals"
                  startContent={
                    <RankingIcon fill="currentColor" width="18" height="18" />
                  }
                >
                  目標
                </DropdownItem>
                <DropdownItem
                  key="shadow-swing"
                  as={Link}
                  href="/practice/shadow-swing"
                  startContent={
                    <BallIcon fill="currentColor" width="18" height="18" />
                  }
                >
                  素振りカウンター
                </DropdownItem>
                <DropdownItem
                  key="practice-menus"
                  as={Link}
                  href="/practice/menus"
                  startContent={
                    <BallIcon fill="currentColor" width="18" height="18" />
                  }
                >
                  練習メニュー
                </DropdownItem>
                <DropdownItem
                  key="menu-sets"
                  as={Link}
                  href="/practice/menu-sets"
                  startContent={
                    <BallIcon fill="currentColor" width="18" height="18" />
                  }
                >
                  メニューセット
                </DropdownItem>
                <DropdownItem
                  key="practice-schedules"
                  as={Link}
                  href="/practice/schedules"
                  startContent={
                    <CalendarIcon fill="currentColor" width="18" height="18" />
                  }
                >
                  練習スケジュール
                </DropdownItem>
                <DropdownItem
                  key="practice-schedules-calendar"
                  as={Link}
                  href="/practice/schedules/calendar"
                  startContent={
                    <CalendarIcon fill="currentColor" width="18" height="18" />
                  }
                >
                  予定カレンダー
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
