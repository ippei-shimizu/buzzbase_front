"use client";

import { Skeleton } from "@heroui/react";

export default function Loading() {
  return (
    <>
      <Skeleton className="rounded-lg">
        <div className="h-6 rounded-lg bg-default-300"></div>
      </Skeleton>
    </>
  );
}
