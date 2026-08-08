"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User,
} from "@heroui/react";
import Link from "next/link";

type RankingItem = {
  name: string;
  user_id: string;
  image_url: string;
  previous_rank?: number | null;
};

type RankingSectionProps<T extends RankingItem> = {
  label: string;
  id: string;
  data: T[];
  renderValue: (item: T, index: number) => React.ReactNode;
  isFirst?: boolean;
  hideRankChange?: boolean;
};

/**
 * 前日順位との差分を「▲n / ▼n / －」で表す。
 * previous_rank が無い（初参加など）場合は差分を出さない。
 */
function RankChangeBadge({
  currentRank,
  previousRank,
}: {
  currentRank: number;
  previousRank?: number | null;
}) {
  if (previousRank == null) {
    return null;
  }
  const change = previousRank - currentRank;
  if (change === 0) {
    return <span className="text-xs text-zinc-500 ml-1">－</span>;
  }
  const isUp = change > 0;
  return (
    <span className={`text-xs ml-1 ${isUp ? "text-success" : "text-danger"}`}>
      {isUp ? "▲" : "▼"}
      {Math.abs(change)}
    </span>
  );
}

export default function RankingSection<T extends RankingItem>({
  label,
  id,
  data,
  renderValue,
  isFirst = false,
  hideRankChange = false,
}: RankingSectionProps<T>) {
  return (
    <Table className={isFirst ? "" : "mt-8"} aria-label={label} id={id}>
      <TableHeader>
        <TableColumn className="text-base text-white font-bold text-center">
          {label}
        </TableColumn>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="grid grid-cols-[1fr_auto] items-center ">
                <Link href={`/mypage/${item.user_id}`} className="block">
                  <div className="grid grid-cols-[auto_1fr_auto] items-center">
                    <span className="text-base flex items-center mr-4">
                      {index + 1}
                      {!hideRankChange && (
                        <RankChangeBadge
                          currentRank={index + 1}
                          previousRank={item.previous_rank}
                        />
                      )}
                    </span>
                    <User
                      name={item.name}
                      description={item.user_id}
                      avatarProps={{
                        src:
                          process.env.NODE_ENV === "production"
                            ? item.image_url
                            : `${process.env.NEXT_PUBLIC_API_URL}${item.image_url}`,
                      }}
                      className="justify-start"
                    />
                    <span className="text-base block font-bold">
                      {renderValue(item, index)}
                    </span>
                  </div>
                </Link>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
