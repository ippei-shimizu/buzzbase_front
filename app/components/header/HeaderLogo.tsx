"use client";
import React from "react";
import { Link } from "@nextui-org/react";

export default function HeaderLogo() {
  return (
    <>
      <header className="py-2 px-3 border-b border-b-zinc-500 fixed top-0 w-full bg-main z-50">
        <div className="flex items-center justify-center h-full">
          <Link href="/">LOGO</Link>
        </div>
      </header>
    </>
  );
}
