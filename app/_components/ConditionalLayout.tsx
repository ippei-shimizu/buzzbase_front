"use client";

import { usePathname } from "next/navigation";
import Footer from "@app/components/footer/Footer";
import NavigationMenu from "@app/components/header/NavigationMenu";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin-management-console");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <NavigationMenu />
      <Footer />
    </>
  );
}
