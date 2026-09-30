"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock, ArrowRight, ShieldCheck, Upload, FileText, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SetupFlow } from "@/components/setup/setup-flow";
import { useSettings } from "@/hooks/use-settings";

const FEATURES = [
  { icon: Calculator, title: "Automatic hours", body: "Enter time in and time out — rendered, cumulative, and remaining hours calculate themselves." },
  { icon: Upload, title: "Import EOD & Excel", body: "Paste your daily EOD text or upload an Excel file. Preview before saving." },
  { icon: FileText, title: "Print-ready DTR", body: "Generate a clean Daily Time Record and export to PDF, DOCX, CSV, or XLSX." },
  { icon: ShieldCheck, title: "Stays on your device", body: "No account, no server. Your records live in your browser by default." },
];

export default function LandingPage() {
  const { settings, loading } = useSettings();
  const [showSetup, setShowSetup] = useState(false);

  const start = () => setShowSetup(true);

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <Clock className="h-5 w-5" />
          </div>
          <span className="text-base font-semibold">OJT Hours Tracker</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Dashboard
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {showSetup ? (
        <div className="mx-auto flex max-w-6xl justify-center px-4 py-10 md:px-6">
          <SetupFlow />
        </div>
      ) : (
        <>
          <section className="mx-auto max-w-6xl px-4 pb-8 pt-10 text-center md:px-6 md:pt-20">
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Track your OJT hours without the spreadsheet headache.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Record daily hours, import your EODs, monitor your progress, and generate a
              print-ready DTR. No account required.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={start}>
                {!loading && settings.setupComplete ? "Continue setup" : "Start Tracking"}
                <ArrowRight className="h-4 w-4" />
              </Button>
              {!loading && settings.setupComplete && (
                <Link href="/dashboard">
                  <Button size="lg" variant="outline">
                    Open Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </section>

          <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 md:grid-cols-2 md:px-6 lg:grid-cols-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="hover-lift rise group rounded-lg border border-border bg-card p-5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <Icon className="h-6 w-6 text-accent transition-transform duration-200 group-hover:scale-110" />
                  <h3 className="mt-3 font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
                </div>
              );
            })}
          </section>

          <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
            Your OJT records stay on your device by default.{" "}
            <Link href="/about" className="underline-offset-4 hover:underline">
              About
            </Link>
          </footer>
        </>
      )}
    </div>
  );
}
