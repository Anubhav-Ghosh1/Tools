import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevTools — Browser-side developer utilities",
  description: "A suite of fast, offline-friendly developer tools that run entirely in your browser.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur sticky top-0 z-10">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-mono text-sm font-semibold tracking-tight">
              <span className="text-emerald-400">$</span> devtools
            </Link>
            <nav className="text-xs text-neutral-400">
              <span className="hidden sm:inline">Runs in your browser. No uploads.</span>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
        <footer className="border-t border-neutral-800 py-4 text-center text-xs text-neutral-500">
          Built with Next.js · All processing client-side
        </footer>
      </body>
    </html>
  );
}
