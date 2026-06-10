import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import SearchPalette from "@/components/SearchPalette";
import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "DevTools — Browser-side developer utilities",
  description: "Fast, offline-friendly developer tools that run entirely in your browser.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Prevent flash: apply saved theme before React hydrates */}
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var t=localStorage.getItem('devtools:theme');if(t==='light')document.documentElement.classList.add('light')})()`,
            }}
          />
        </head>
        <body className="min-h-screen flex flex-col">
          <header className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur sticky top-0 z-50">
            <div className="mx-auto max-w-6xl px-4 py-2.5 flex items-center gap-3">
              <Link href="/" className="font-mono text-sm font-bold tracking-tight shrink-0">
                <span className="text-emerald-400">$</span> devtools
              </Link>
              <div className="flex-1 max-w-md">
                <SearchPalette />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <UserMenu />
              </div>
            </div>
          </header>

          <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">{children}</main>

          <footer className="border-t border-neutral-800 py-5">
            <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
              <span>
                <span className="text-emerald-500 font-mono">$</span> devtools — all processing client-side · no uploads · no tracking
              </span>
              <div className="flex items-center gap-4">
                <span>Built with Next.js</span>
                {process.env.NEXT_PUBLIC_GITHUB_REPO && (
                  <a
                    href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_REPO}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border border-neutral-700 rounded-full px-3 py-1 text-neutral-400 hover:border-neutral-500 hover:text-white transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    ⭐ Star on GitHub
                  </a>
                )}
              </div>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
