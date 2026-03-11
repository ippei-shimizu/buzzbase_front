"use client";

import { HeroUIProvider } from "@heroui/react";
import { GoogleOAuthProvider } from "@react-oauth/google";

if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
  console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set");
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider>
      <GoogleOAuthProvider
        clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
      >
        {children}
      </GoogleOAuthProvider>
    </HeroUIProvider>
  );
}
