'use client';

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "./providers/auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </SessionProvider>
  );
} 