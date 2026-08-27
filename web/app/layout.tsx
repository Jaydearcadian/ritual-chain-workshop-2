import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Oswald } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { ConnectButton } from "@/components/ConnectButton";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Odds — Last Predictor Standing",
    template: "%s — Odds",
  },
  description:
    "Odds is a competitive forecasting game on Ritual Chain testnet. Call the outcome, survive the rounds, take the pool — settled by the self-resolving RitualPredict market.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#faf7f2",
};

const NAV_LINKS = [
  { href: "/markets", label: "Play" },
  { href: "/mechanics", label: "Mechanics" },
] as const;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Providers>
          <header className="sticky top-0 z-50 border-b border-[color:var(--hairline)] bg-[color:var(--canvas)]/85 backdrop-blur">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
              <Link href="/" aria-label="Odds — home" className="inline-flex min-h-11 items-center gap-2">
                <span aria-hidden className="inline-block h-3 w-3 rounded-[2px] bg-[color:var(--ink)]" />
                <span className="font-display text-lg font-semibold uppercase leading-none tracking-[0.08em] text-[color:var(--ink)]">
                  Odds
                </span>
              </Link>
              <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-[color:var(--ink-secondary)] transition-colors hover:text-[color:var(--ink)]"
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
            <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-6">
              <p className="text-xs text-[color:var(--ink-muted)]">
                Odds · Ritual Chain 1979 testnet · a game, not a production exchange
              </p>
              <p className="text-xs text-[color:var(--ink-muted)]">
                Invalid means refundable — a failed oracle is never a NO.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}