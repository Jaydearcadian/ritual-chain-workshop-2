import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { ConnectButton } from "@/components/ConnectButton";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "RitualPredict — Workshop",
    template: "%s — RitualPredict Workshop",
  },
  description:
    "Self-resolving prediction markets on Ritual Chain. Create → bet → schedule → HTTP→JQ → settle. No keeper.",
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0a0612",
};

const NAV_LINKS = [
  { href: "/", label: "Overview" },
  { href: "/markets", label: "Markets" },
  { href: "/mechanics", label: "Mechanics" },
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <header className="sticky top-0 z-50 border-b border-[color:var(--hairline)] bg-[color:var(--ink-900)]/85 backdrop-blur">
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-3">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center text-sm font-bold tracking-tight text-[color:var(--text-primary)]"
              >
                RitualPredict<span className="font-normal text-[color:var(--text-muted)]"> · Workshop</span>
              </Link>
              <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-[color:var(--text-secondary)] transition-colors hover:text-[color:var(--text-primary)]"
                  >
                    {l.label}
                  </Link>
                ))}
                <ConnectButton />
              </nav>
            </div>
          </header>

          <main id="main" className="flex flex-1 flex-col">
            {children}
          </main>

          <footer className="border-t border-[color:var(--hairline)]">
            <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-6">
              <p className="text-xs text-[color:var(--text-muted)]">RitualPredict Workshop · Ritual Chain 1979 · Testnet</p>
              <p className="text-xs text-[color:var(--text-muted)]">
                Invalid means refundable — a failed oracle is never a NO.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
