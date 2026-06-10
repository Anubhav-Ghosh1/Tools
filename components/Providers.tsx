"use client";

// Clerk wraps the app at layout level via ClerkProvider (server component).
// This file is kept as a thin pass-through in case other client providers are needed.
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
