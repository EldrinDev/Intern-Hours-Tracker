"use client";

import Link from "next/link";
import { ShieldCheck, Zap, Download, PlusCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="About"
        description="A local-first tool for tracking OJT/internship hours and generating a DTR."
      />

      <Card>
        <CardContent className="space-y-4 pt-5 text-sm leading-relaxed text-muted-foreground">
          <p>
            OJT Hours Tracker helps students record daily time in/out, auto-calculate rendered,
            cumulative, and remaining hours, write EOD accomplishments, import existing EOD or Excel
            files, and generate a print-ready Daily Time Record.
          </p>
          <p>
            Everything runs in your browser. There is no account, no server, and no database — your
            records are stored locally using IndexedDB.
          </p>
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Zap, title: "Automatic math", body: "Rendered, cumulative, and remaining hours are always calculated for you." },
          { icon: ShieldCheck, title: "Private by default", body: "Your OJT records stay on your device. Export a backup to move between browsers." },
          { icon: Download, title: "Export anywhere", body: "DTR to PDF, DOCX, CSV, XLSX, or plain-text EOD." },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} className="hover-lift rise group" style={{ animationDelay: `${i * 80}ms` }}>
              <CardHeader>
                <Icon className="h-6 w-6 text-accent transition-transform duration-200 group-hover:scale-110" />
                <CardTitle className="mt-2 text-sm">{c.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{c.body}</CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/records/new">
          <Button>
            <PlusCircle className="h-4 w-4" /> Add a record
          </Button>
        </Link>
        <Link href="/settings#data">
          <Button variant="outline">
            <Download className="h-4 w-4" /> Backup your data
          </Button>
        </Link>
      </div>
    </div>
  );
}
