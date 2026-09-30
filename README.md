# OJT Hours Tracker

A local-first web app for tracking internship / OJT rendered hours, daily EOD records, cumulative and remaining hours, and generating a print-ready **Daily Time Record (DTR)**. Everything runs in your browser — no account, no backend, no database server.

> How many hours have I rendered? How many do I still need? What did I accomplish each day?
> OJT Hours Tracker answers all three at a glance.

---

## Features

- **OJT goal tracking** — set required hours, see rendered, remaining, and completion %
- **Daily records** — time in / time out with automatic rendered-hour calculation
- **Automatic math** — cumulative and remaining hours recalculate on every change (overnight shifts supported, never shows negative remaining)
- **Default break** — configurable break automatically deducted from each day
- **EOD import** — paste or upload EOD text; a smart parser detects day, date, time in/out, and notes, with a preview before saving
- **Excel / CSV import** — flexible column matching, duplicate handling (skip / replace / copy), and error detection
- **Records views** — searchable, filterable, sortable table plus a timeline view
- **Print-ready DTR** — clean `@media print` layout with company, student, totals, and signature areas
- **Exports** — PDF, DOCX, CSV, XLSX, and plain-text EOD
- **Backup & restore** — one JSON file to move your data between browsers or devices
- **Light & dark mode** — subtle charcoal dark theme
- **Animated icons & polished UI** — micro-interactions throughout, with reduced-motion support
- **Local-first & offline-friendly** — data stored in IndexedDB, survives refreshes and restarts

---

## Tech Stack

| Area | Choice |
|------|--------|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Storage | Dexie.js over IndexedDB |
| Dates / time | date-fns |
| Validation | Zod |
| Excel | SheetJS (`xlsx`) |
| DOCX | `docx` |
| PDF | jsPDF + jspdf-autotable (plus browser print) |
| CSV | PapaParse |
| Icons | lucide-react + @animateicons/react (Motion) |
| Theme | next-themes |
| Package manager | pnpm |
| Deployment | Vercel |

---

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run the TypeScript compiler |

---

## Deployment (Vercel)

This is a fully client-side Next.js app with **no environment variables and no backend**, so it deploys to Vercel with zero configuration.

1. Push this repo to GitHub.
2. On Vercel, **New Project → Import** the repo.
3. Vercel auto-detects Next.js and `pnpm`. Deploy.

Your data is **not** affected by deploys — it lives in your browser (see below), not on Vercel.

---

## Data & Privacy

Your OJT records are stored **locally in your browser** using IndexedDB. This means:

- Records persist across page refreshes and browser restarts on the **same browser and device**.
- Records are **not** synced between devices or browsers, and are removed if you clear browser data or use incognito mode.
- Nothing is ever sent to a server.

To move your data or keep it safe, use **Settings → Data Management → Export Backup** to download a JSON backup, and **Import Backup** to restore it elsewhere.

---

## Project Structure

```
app/                # Next.js routes (dashboard, records, import, export, dtr, settings, about)
components/         # UI kit, layout shell, dashboard, records, setup
hooks/              # Live-data hooks (records, settings, company, summary)
lib/
  calculations/     # Hours + progress math
  db/               # Dexie schema and repository (CRUD)
  exporters/        # CSV, XLSX, DOCX, PDF, TXT, backup
  formatters/       # Date and duration formatting
  parsers/          # EOD text, Excel, CSV parsers + import validation
types/              # Company, DailyRecord, Settings
```

**Architecture:** UI → hooks → repository → Dexie → IndexedDB, with business logic (calculations, parsers, exporters) kept separate from components. All durations are stored internally as **minutes** and formatted only for display, which keeps calculations exact.

---

## Roadmap

Possible future additions (not part of the current build):

- Optional cloud sync (e.g. Supabase) for multi-device access
- PWA install + full offline support
- Monthly calendar view
- Multiple OJT profiles

---

## License

MIT — free to use and modify.
