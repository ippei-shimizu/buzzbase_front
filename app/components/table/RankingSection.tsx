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
};

type RankingSectionProps<T extends RankingItem> = {
  label: string;
  id: string;
  data: T[];
  renderValue: (item: T, index: number) => React.ReactNode;
  isFirst?: boolean;
};

export default function RankingSection<T extends RankingItem>({
  label,
  id,
  data,
  renderValue,
  isFirst = false,
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
                  <div className="grid grid-cols-[24px_1fr_auto] items-center">
                    <span className="text-base block mr-4">{index + 1}</span>
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
