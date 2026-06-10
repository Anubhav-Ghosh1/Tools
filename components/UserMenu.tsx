"use client";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { LogIn } from "lucide-react";

export default function UserMenu() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return <div className="w-7 h-7 rounded-full bg-neutral-800 animate-pulse" />;
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="redirect" fallbackRedirectUrl="/">
        <button className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-200 transition whitespace-nowrap">
          <LogIn size={13} />
          <span className="hidden sm:inline">Sign in</span>
        </button>
      </SignInButton>
    );
  }

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "w-7 h-7",
        },
      }}
    />
  );
}
