import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ConditionalShell } from "@/components/layout/conditional-shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "OJT Hours Tracker — Track internship hours & generate a DTR",
    template: "%s · OJT Hours Tracker",
  },
  description:
    "Track your OJT/internship rendered hours, write daily EOD records, import EOD text and Excel files, and generate a print-ready DTR. Local-first, no account required.",
  keywords: [
    "OJT hours tracker",
    "OJT hour calculator",
    "internship hours tracker",
    "internship DTR generator",
    "OJT DTR generator",
    "student OJT tracker",
    "practicum hours tracker",
  ],
  applicationName: "OJT Hours Tracker",
  authors: [{ name: "OJT Hours Tracker" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <ConditionalShell>{children}</ConditionalShell>
        </Providers>
      </body>
    </html>
  );
}
