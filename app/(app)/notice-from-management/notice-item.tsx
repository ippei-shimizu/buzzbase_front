"use client";

import { Divider } from "@heroui/react";
import Link from "next/link";
import { DetailLinkArrowIcon } from "@app/components/icon/DetailLinkArrowIcon";

interface Notice {
  href: string;
  date: string;
  title: string;
}

interface NoticeItemsProps {
  notices: Notice[];
}

export default function NoticeItems({ notices }: NoticeItemsProps) {
  return (
    <ul className="mt-6 grid gap-y-2 lg:gap-y-4">
      {notices.map((notice, index) => (
        <li key={index}>
          <Link href={notice.href}>
            <ul className="flex justify-between items-center">
              <li>
                <span className="text-xs text-zinc-400 lg:text-base lg:mb-1">
                  {notice.date}
                </span>
                <p className="text-base mt-0.5 pb-2 font-medium lg:text-xl lg:pb-4">
                  {notice.title}
                </p>
              </li>
              <li>
                <DetailLinkArrowIcon width="22" height="22" stroke="#f4f4f4" />
              </li>
            </ul>
          </Link>
          <Divider />
        </li>
      ))}
    </ul>
  );
}
