"use client";

import Header from "@app/components/header/Header";
import { Button } from "@heroui/react";
import Link from "next/link";

export default function Custom404() {
  return (
    <>
      <div className="buzz-dark flex flex-col w-full h-full min-h-screen">
        <Header />
        <div className="h-full">
          <main className="h-full">
            <div className="flex flex-col justify-center items-center gap-y-4 h-full px-4">
              <h2 className="text-4xl font-bold">404</h2>
              <p>指定されたページが見つかりません</p>
              <Link href="/">
                <Button
                  color="primary"
                  radius="sm"
                  className="px-6"
                >
                  トップへ
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
