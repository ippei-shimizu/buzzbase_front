"use client";

import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import Link from "next/link";

type Props = {
  title: string;
  equation: string;
  description: string;
  description2?: string;
  description3?: string;
  slug?: string;
};

export default function StatCard({
  title,
  equation,
  description,
  description2,
  description3,
  slug,
}: Props) {
  return (
    <Card className="px-4 py-3 relative">
      <CardHeader className="p-0 block">
        <h3 className="font-bold text-base">{title}</h3>
        <Divider className="my-2" />
      </CardHeader>
      <CardBody className="p-0">
        {equation.length > 0 && <p className="text-sm">{equation}</p>}
        {description.length > 0 && (
          <p className="text-xs text-zinc-400 mt-1 leading-5">{description}</p>
        )}
        {description2 && description2.length > 0 && (
          <p className="text-xs text-zinc-400 mt-1 leading-5">{description2}</p>
        )}
        {description3 && description3.length > 0 && (
          <p className="text-xs text-zinc-400 mt-1 leading-5">{description3}</p>
        )}
        {slug && (
          <Link
            href={`/tools/${slug}`}
            className="inline-flex items-center gap-1 mt-3 text-xs text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
          >
            計算する &rarr;
          </Link>
        )}
      </CardBody>
    </Card>
  );
}
