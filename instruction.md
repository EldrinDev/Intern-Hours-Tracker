# OJT Hours Tracker

> A local-first web application for tracking internship/OJT rendered hours, daily EOD records, cumulative hours, remaining hours, and printable DTRs — designed to run entirely in the browser and deploy directly to Vercel without a backend.

---

# 1. Project Overview

## Project Name

**OJT Hours Tracker**

### Purpose

The OJT Hours Tracker is a web-based application that allows students/interns to manage their internship hours and daily End-of-Day (EOD) records in one place.

The system should make it easy to:

* Set an OJT required-hours goal
* Add internship/company information
* Record daily time-in and time-out
* Automatically calculate daily rendered hours
* Automatically calculate cumulative rendered hours
* Track remaining hours
* Track completed internship days
* Write detailed daily EOD notes
* Import existing EOD text files
* Import Excel records
* Automatically parse supported EOD formats
* Manually edit records
* Export records
* Generate a printable DTR
* Download records as PDF, DOCX, CSV, or XLSX
* Store data locally without requiring an account or backend
* Deploy to Vercel as a static/Next.js application

---

# 2. Core Product Idea

The application should answer three questions immediately:

> **How many hours have I rendered?**

> **How many hours do I still need?**

> **What did I accomplish each day?**

The dashboard should therefore prioritize:

```text
TOTAL REQUIRED HOURS
        ↓
RENDERED HOURS
        ↓
REMAINING HOURS
        ↓
COMPLETED DAYS
        ↓
DAILY RECORDS / EOD
```

---

# 3. Target Users

Primary user:

* College students
* OJT / internship students
* Practicum students
* IT students
* Engineering students
* Students required to submit DTRs
* Students required to submit daily EOD reports

The system should be usable by a single student without registration.

---

# 4. Design Philosophy

The application should feel like a **real productivity tool**, not a generic AI-generated dashboard.

### Design goals

* Clean
* Professional
* Minimal
* Student-friendly
* Desktop-first but fully responsive
* Fast
* Information-dense without being cluttered
* Strong typography
* Clear hierarchy
* Useful empty states
* Good print layout
* Keyboard-friendly
* Accessible

Avoid:

* Excessive gradients
* Excessive glassmorphism
* Too many cards
* Huge decorative elements
* Fake analytics
* Unnecessary animations
* AI-looking dashboard layouts

---

# 5. Recommended Technology Stack

## Frontend

### Next.js

Use:

**Next.js + TypeScript**

Why:

* Excellent Vercel support
* File-based routing
* Easy static deployment
* Good performance
* SEO support
* React ecosystem
* Easy client-side state management

---

## Styling

### Tailwind CSS

Use Tailwind CSS for:

* Layout
* Responsive design
* Forms
* Tables
* Dashboard
* Print-specific styling

---

## UI Components

Recommended:

### shadcn/ui

Use selectively for:

* Dialogs
* Dropdowns
* Buttons
* Inputs
* Selects
* Tabs
* Toasts
* Calendar
* Confirmation dialogs

Do not use every component simply because it exists.

---

# 6. Data Storage

## No Backend

The application should initially have:

```text
NO DATABASE
NO API SERVER
NO AUTHENTICATION
NO BACKEND
```

Instead, use:

### IndexedDB

Recommended primary storage:

**Dexie.js + IndexedDB**

Why IndexedDB instead of only localStorage:

* Better for structured data
* Larger storage capacity
* Better for future expansion
* Supports multiple records cleanly
* Can store settings and records
* Better architecture for a local-first application

---

# 7. Persistence Architecture

```text
Next.js Application
        │
        ↓
   Application State
        │
        ↓
      Dexie.js
        │
        ↓
     IndexedDB
        │
        ↓
    User's Browser
```

Everything stays locally on the user's device.

---

# 8. Optional State Management

Use React state for simple UI state.

If global state becomes necessary:

### Zustand

Use Zustand for:

* Current company
* Current settings
* UI preferences
* Import/export state
* Selected records

Do not introduce Redux unless the application becomes significantly more complex.

---

# 9. Date & Time

Use:

### date-fns

For:

* Date calculations
* Time calculations
* Formatting
* Parsing
* Duration calculations

Store timestamps in a consistent format.

Recommended:

```text
ISO 8601
```

Example:

```text
2026-08-03T10:20:00
```

---

# 10. Export Technologies

## CSV

Use:

```text
PapaParse
```

or native CSV generation.

---

## Excel

Use:

```text
SheetJS / xlsx
```

Export:

```text
.xlsx
```

---

## DOCX

Use:

```text
docx
```

Generate a formatted DTR document.

---

## PDF

Preferred architecture:

```text
HTML
 ↓
Print CSS
 ↓
Browser Print
 ↓
Save as PDF
```

This gives the user control over:

* Paper size
* Margins
* Printer
* Orientation
* PDF destination

For direct PDF generation, optionally use:

```text
jsPDF
```

or another client-side PDF library.

---

# 11. Vercel Deployment

The application should be deployable using:

```text
GitHub
   ↓
Vercel
   ↓
Next.js
```

No server required.

The application should work entirely client-side.

---

# 12. Main Features

## 12.1 OJT Goal

The user should be able to define:

```text
Required Hours
```

Example:

```text
Required Hours: 486
```

The system calculates:

```text
Rendered Hours
Remaining Hours
Completion Percentage
```

Example:

```text
Required       486 hrs
Rendered       126 hrs 30 mins
Remaining      359 hrs 30 mins
Progress       26.0%
```

---

# 13. Company Information

The user should be able to create an internship profile.

Fields:

```text
Company Name
Company Address
Department
Position / Role
Supervisor
OJT Start Date
Expected End Date
Required Hours
```

Example:

```text
Company:
Stafify BPO & Digital Agency

Position:
Full-Stack Developer Intern

Start Date:
August 3, 2026

Required Hours:
486
```

Company information should appear in exported DTRs.

---

# 14. Daily OJT Record

Each record should contain:

```text
Day
Date
Time In
Time Out
Break Duration
Rendered Hours
Cumulative Hours
Remaining Hours
Notes
```

Example:

```text
Day 1

Date:
August 3, 2026

Time In:
10:20 AM

Time Out:
7:19 PM

Rendered:
8h 59m

Cumulative:
8h 59m

Notes:
Reviewed Stafify Training Guide about App Drawer and Admin & HR.

Learned and absorbed ideas from their website for our capstone.

Received Git branching web link from our Senior.

Learned git merge --squash from our Senior.

Attended Git session mentored by our Senior.

Learned advanced Git features.

Reported our accomplishments during the first day.
```

---

# 15. Daily Hours Calculation

The system should automatically calculate:

```text
Time Out - Time In - Break
```

Example:

```text
10:20 AM → 7:19 PM
```

Total elapsed time:

```text
8 hours 59 minutes
```

If break time is:

```text
1 hour
```

Rendered time becomes:

```text
7 hours 59 minutes
```

The system should allow the user to configure whether breaks are:

```text
No Break
Manual Break
Automatic Break
```

Default:

```text
Manual Break
```

---

# 16. Cumulative Hours

After every record:

```text
Cumulative Hours =
Previous Cumulative Hours + Current Rendered Hours
```

Example:

```text
Day 1 → 8h 59m
Day 2 → 8h 12m
Day 3 → 8h 45m
```

Cumulative:

```text
Day 1 → 8h 59m
Day 2 → 17h 11m
Day 3 → 25h 56m
```

---

# 17. Remaining Hours

Formula:

```text
Remaining Hours =
Required Hours - Cumulative Hours
```

Never allow the displayed remaining hours to become negative.

Instead:

```text
Remaining:
0h 0m

Status:
Completed
```

---

# 18. Completion Percentage

Formula:

```text
(Rendered Hours / Required Hours) × 100
```

Cap at:

```text
100%
```

Example:

```text
Required:
486h

Rendered:
243h

Progress:
50%
```

---

# 19. Dashboard

Route:

```text
/dashboard
```

The dashboard should show:

```text
┌─────────────────────────────────────────────┐
│ OJT HOURS TRACKER                           │
│ Stafify BPO & Digital Agency                │
├─────────────────────────────────────────────┤
│                                             │
│ REQUIRED        RENDERED       REMAINING    │
│ 486h            126h 30m       359h 30m     │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ 26.0% COMPLETE                              │
│ ███████████░░░░░░░░░░░░                    │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│ DAYS COMPLETED       OJT START              │
│ 18                    Aug 3, 2026           │
│                                             │
└─────────────────────────────────────────────┘
```

---

# 20. Dashboard Sections

## Summary

Display:

* Required Hours
* Rendered Hours
* Remaining Hours
* Completion %
* Days Completed
* Days Remaining, if an expected schedule exists

---

## Recent Records

Display the latest:

```text
5–10 records
```

Example:

```text
Day 18
September 1, 2026
8h 10m
```

---

## Progress

Show:

```text
Rendered / Required
```

with a progress bar.

---

## Current Status

Possible states:

```text
Not Started
In Progress
Almost Complete
Completed
```

These are status indicators, not performance ratings.

---

# 21. Records Page

Route:

```text
/records
```

Display a table:

| Day | Date        | Time In  | Time Out | Rendered | Cumulative | Notes           |
| --- | ----------- | -------- | -------- | -------- | ---------- | --------------- |
| 1   | Aug 3, 2026 | 10:20 AM | 7:19 PM  | 8h 59m   | 8h 59m     | Git training    |
| 2   | Aug 4, 2026 | 8:00 AM  | 5:00 PM  | 8h       | 16h 59m    | API development |
| 3   | Aug 5, 2026 | 8:05 AM  | 5:10 PM  | 8h 5m    | 25h 4m     | Laravel API     |

---

# 22. Record Actions

Every record should support:

```text
View
Edit
Duplicate
Delete
```

Optional:

```text
Export
Print
```

Deletion should require confirmation.

---

# 23. Add Daily Record

Route:

```text
/records/new
```

Form:

```text
Day
Date
Time In
Time Out
Break
Notes
```

The system automatically calculates:

```text
Rendered Hours
Cumulative Hours
Remaining Hours
```

The user should NOT manually enter calculated values.

---

# 24. Manual Record Entry

Example:

```text
Day:
1

Date:
August 3, 2026

Time In:
10:20 AM

Time Out:
7:19 PM

Break:
0h 00m

Notes:

- Reviewed Stafify Training Guide about App Drawer and Admin & HR
- Learned and absorbed ideas from their website for our capstone
- Received Git branching web link from our Senior
- Learned git merge --squash from our Senior
- Attended Git session mentored by our Senior
- Learned advanced Git features
- Reported our accomplishment during the first day
```

---

# 25. EOD Import

The system should support importing plain text EOD files.

Example input:

```text
Day 1: 10:20AM - 7:19PM August 3 2026
- Reviewed Stafify Training Guide about App Drawer and
- Admin & HR
- Learned and absorbed idea in their website for our capstone
- Receive git branching web link from our Senior
- learned git merge --squash from our senior
- attended git session mentored by our senior
- learned git advanced features
- reported our accomplishment during the first day
```

The parser should detect:

```text
Day
Time In
Time Out
Date
Notes
```

Then generate:

```text
DailyRecord
```

---

# 26. EOD Parser

Expected pattern:

```text
Day X: TIME_IN - TIME_OUT DATE
- NOTE
- NOTE
- NOTE
```

Example:

```text
Day 1: 10:20AM - 7:19PM August 3 2026
```

Parser output:

```json
{
  "day": 1,
  "date": "2026-08-03",
  "timeIn": "10:20",
  "timeOut": "19:19",
  "notes": [
    "Reviewed Stafify Training Guide about App Drawer and Admin & HR",
    "Learned and absorbed ideas from their website for our capstone",
    "Received Git branching web link from our Senior",
    "Learned git merge --squash from our Senior",
    "Attended Git session mentored by our Senior",
    "Learned advanced Git features",
    "Reported our accomplishment during the first day"
  ]
}
```

---

# 27. Smart EOD Import

The importer should:

1. Read the file
2. Detect daily record headings
3. Parse day number
4. Parse date
5. Parse time in
6. Parse time out
7. Collect bullet points
8. Convert bullets into notes
9. Calculate rendered hours
10. Calculate cumulative hours
11. Calculate remaining hours
12. Show preview
13. Ask for confirmation
14. Save records

Never immediately save imported records without preview.

---

# 28. Import Preview

Before importing:

```text
┌─────────────────────────────────────────────┐
│ IMPORT PREVIEW                              │
├─────────────────────────────────────────────┤
│                                             │
│ 18 records detected                         │
│                                             │
│ Day 1     Aug 3     10:20 AM → 7:19 PM     │
│ Day 2     Aug 4      8:00 AM → 5:00 PM     │
│ Day 3     Aug 5      8:05 AM → 5:10 PM     │
│                                             │
│ ⚠ Day 7 has no time-out                    │
│                                             │
│ [ Cancel ]              [ Import Records ] │
└─────────────────────────────────────────────┘
```

---

# 29. Excel Import

Support:

```text
.xlsx
.xls
```

Expected columns:

```text
Day
Date
Time In
Time Out
Break
Notes
```

Example:

| Day | Date       | Time In  | Time Out | Break | Notes        |
| --- | ---------- | -------- | -------- | ----- | ------------ |
| 1   | 08/03/2026 | 10:20 AM | 7:19 PM  | 0     | Git training |
| 2   | 08/04/2026 | 8:00 AM  | 5:00 PM  | 60    | Laravel      |
| 3   | 08/05/2026 | 8:05 AM  | 5:10 PM  | 60    | API          |

---

# 30. Import Error Handling

Detect:

```text
Missing date
Missing time in
Missing time out
Invalid time
Invalid date
Duplicate day
Duplicate date
Malformed EOD
Unknown format
```

Show human-readable errors.

Example:

```text
Unable to import Day 7.

Reason:
Time Out could not be detected.

Please edit the record or import again.
```

---

# 31. Duplicate Handling

If an imported record already exists:

```text
Day 7 already exists.
```

Options:

```text
Skip
Replace
Create Copy
```

Default:

```text
Skip
```

---

# 32. Export System

The application should support:

```text
PDF
DOCX
CSV
XLSX
TXT
```

---

# 33. DTR Export

The most important export format is the **DTR**.

The DTR should be designed for printing.

Recommended paper:

```text
A4
```

Optional:

```text
Letter
Long Bond Paper
```

---

# 34. DTR Layout

Example:

```text
========================================================

              DAILY TIME RECORD

Company:
Stafify BPO & Digital Agency

Intern:
Eldrin C. Ragaza

Position:
Full-Stack Developer Intern

OJT Period:
August 3, 2026 – __________

Required Hours:
486 Hours

========================================================

| Day | Date | Time In | Time Out | Hours |
|-----|------|---------|----------|-------|
| 1   | Aug 3 | 10:20 | 7:19 | 8:59 |
| 2   | Aug 4 | 8:00  | 5:00 | 8:00 |
| 3   | Aug 5 | 8:05  | 5:10 | 8:05 |

========================================================

TOTAL HOURS RENDERED:
126 Hours 30 Minutes

REMAINING:
359 Hours 30 Minutes

========================================================

Student Signature: ______________________

Supervisor Signature: ___________________

Date: _________________________________
```

---

# 35. Printable DTR Requirements

The print version should:

* Hide navigation
* Hide buttons
* Hide unnecessary UI
* Use black text
* Use white background
* Use print-friendly borders
* Fit properly on paper
* Avoid unnecessary page breaks
* Repeat table headers
* Show page numbers if possible
* Include company information
* Include student information
* Include total rendered hours
* Include signature areas

Use:

```css
@media print
```

---

# 36. Export CSV

CSV should contain:

```text
Day
Date
Time In
Time Out
Break
Rendered Hours
Cumulative Hours
Remaining Hours
Notes
```

---

# 37. Export Excel

Excel workbook:

### Sheet 1

```text
DTR
```

### Sheet 2

```text
Summary
```

### Sheet 3

```text
EOD Notes
```

Summary:

```text
Required Hours
Rendered Hours
Remaining Hours
Completion Percentage
Days Completed
Start Date
End Date
Company
Position
```

---

# 38. Settings

Route:

```text
/settings
```

Settings:

```text
Company
Student Information
Required Hours
OJT Start Date
Expected End Date
Default Break
Time Format
Date Format
Theme
```

---

# 39. Student Information

Optional fields:

```text
Full Name
Student ID
Course / Program
Year Level
School
```

These can appear on DTR exports.

---

# 40. Data Management

Settings should include:

```text
Export Backup
Import Backup
Clear All Data
Reset Application
```

---

# 41. Backup Format

Create an application backup:

```text
ojt-tracker-backup.json
```

Example:

```json
{
  "version": 1,
  "settings": {},
  "company": {},
  "records": []
}
```

This allows users to move their records between browsers/devices.

---

# 42. Data Model

## Company

```typescript
interface Company {
  id: string
  name: string
  address?: string
  department?: string
  position?: string
  supervisor?: string
  startDate?: string
  expectedEndDate?: string
  requiredHours: number
}
```

---

## DailyRecord

```typescript
interface DailyRecord {
  id: string
  day: number
  date: string

  timeIn: string
  timeOut: string

  breakMinutes: number

  renderedMinutes: number
  cumulativeMinutes: number
  remainingMinutes: number

  notes: string[]

  createdAt: string
  updatedAt: string
}
```

Important:

Store calculated values as minutes internally.

Example:

```text
8h 30m
```

becomes:

```text
510 minutes
```

This makes calculations safer.

---

# 43. Settings Model

```typescript
interface OJTSettings {
  requiredMinutes: number

  studentName?: string
  studentId?: string
  school?: string
  course?: string
  yearLevel?: string

  companyId?: string

  startDate?: string
  expectedEndDate?: string

  defaultBreakMinutes: number

  timeFormat: "12h" | "24h"
}
```

---

# 44. Database Schema

Even though there is no backend database, Dexie can use:

```text
companies
records
settings
```

Example:

```typescript
db.version(1).stores({
  companies: "id, name",
  records: "id, day, date",
  settings: "id"
})
```

---

# 45. Routes

Recommended route structure:

```text
/
├── dashboard
├── records
├── records/new
├── records/[id]
├── import
├── export
├── dtr
├── settings
└── about
```

---

# 46. Homepage

The homepage should explain the application.

Hero:

```text
Track your OJT hours
without the spreadsheet headache.

Record your daily hours, import your EODs,
monitor your progress, and generate a
print-ready DTR.

[ Start Tracking ]
```

No account required.

---

# 47. Dashboard Navigation

Sidebar:

```text
OJT HOURS TRACKER

Dashboard
Records
Add Record
Import
Export
DTR

────────────

Company
Settings
Data Backup

────────────

About
```

---

# 48. Mobile Navigation

On mobile:

```text
Bottom Navigation

Dashboard
Records
Add
Import
More
```

---

# 49. Dashboard Quick Actions

Include:

```text
+ Add Today's Record
Import EOD
Import Excel
Export DTR
Print DTR
Backup Data
```

---

# 50. Today Indicator

If there is no record for today:

```text
Today's record hasn't been added yet.

[ Add Today's Record ]
```

If a record exists:

```text
Today's record

8:03 AM → 5:02 PM

8h 59m rendered
```

---

# 51. Timeline View

In addition to the table, provide an optional timeline.

```text
DAY 1
Aug 3, 2026
10:20 AM → 7:19 PM
8h 59m

│
│ Git training
│ App Drawer
│ Admin & HR
│ Git branching
│ Git merge --squash
│
▼

DAY 2
Aug 4, 2026
...
```

This makes EOD notes easier to read.

---

# 52. Search & Filtering

Records should support:

```text
Search
Filter by date
Filter by month
Filter by day
Sort ascending
Sort descending
```

Search should search:

```text
Day
Date
Notes
```

Example:

```text
Search: Git
```

Results:

```text
Day 1
Day 4
Day 7
```

---

# 53. Monthly View

Optional calendar view:

```text
August 2026

Mon Tue Wed Thu Fri Sat Sun
                1   2
 3   4   5   6   7   8   9
10  11  12  13  14  15  16
17  18  19  20  21  22  23
24  25  26  27  28  29  30
31
```

Days with records should be visually identifiable.

---

# 54. Progress Calculation

Primary metrics:

```text
Required Hours
Rendered Hours
Remaining Hours
Completion %
Days Completed
```

Example:

```text
486h required

████████████░░░░░░░░ 26%

126h 30m rendered
359h 30m remaining
18 days completed
```

---

# 55. OJT Completion

When:

```text
renderedMinutes >= requiredMinutes
```

show:

```text
OJT HOURS COMPLETED

You have completed your required OJT hours.

Total:
486h 15m
```

Do not continue displaying negative remaining hours.

---

# 56. Validation Rules

### Required Hours

Must be:

```text
> 0
```

### Day

Must be:

```text
positive integer
```

### Date

Must be valid.

### Time

Must be valid.

### Time Out

Normally:

```text
Time Out > Time In
```

Support overnight shifts if necessary.

---

# 57. Overnight Shift Support

Optional advanced feature.

Example:

```text
10:00 PM → 6:00 AM
```

The system should recognize this as:

```text
8 hours
```

instead of a negative duration.

---

# 58. Notes Editor

The notes field should support:

```text
Bullet points
```

Example:

```text
• Reviewed Laravel API documentation
• Implemented authentication endpoint
• Fixed UserResource response
• Tested endpoint using Postman
```

Internally:

```typescript
notes: string[]
```

---

# 59. EOD Writing Experience

Provide:

```text
+ Add accomplishment
```

Instead of forcing the user to type one giant textarea.

Example:

```text
Today's Accomplishments

[ + Add accomplishment ]

• Implemented API authentication
• Fixed UserResource response
• Tested API endpoints
```

Allow drag-and-drop reordering optionally.

---

# 60. Import Sources

Supported:

```text
TXT
CSV
XLSX
JSON backup
```

Primary requested formats:

```text
TXT
XLSX
```

---

# 61. TXT Import Parser Strategy

Use:

```text
Regex + line parser
```

Recognize:

```regex
Day\s+(\d+):\s*(.*?)\s*-\s*(.*?)\s+(.+)
```

Then normalize:

```text
10:20AM
10:20 AM
10:20am
10:20 am
```

into a consistent time representation.

---

# 62. Import Parser Architecture

```text
File
 ↓
File Reader
 ↓
Format Detector
 ↓
Parser
 ↓
Normalized DailyRecord
 ↓
Validation
 ↓
Preview
 ↓
User Confirmation
 ↓
IndexedDB
```

---

# 63. Automatic Calculation Pipeline

```text
DailyRecord
     ↓
Parse Time In
     ↓
Parse Time Out
     ↓
Calculate Duration
     ↓
Subtract Break
     ↓
Rendered Minutes
     ↓
Sort by Date / Day
     ↓
Calculate Cumulative
     ↓
Calculate Remaining
     ↓
Update Dashboard
```

---

# 64. Important Data Rule

Do not manually store:

```text
"8h 30m"
```

as the primary value.

Store:

```text
510
```

minutes.

Then format it:

```text
510 → 8h 30m
```

This prevents calculation errors.

---

# 65. Utility Functions

Create:

```text
calculateRenderedMinutes()
calculateCumulativeMinutes()
calculateRemainingMinutes()
calculateCompletionPercentage()
formatDuration()
formatTime()
formatDate()
parseEOD()
parseTime()
parseDate()
```

---

# 66. Suggested Project Structure

```text
ojt-hours-tracker/
│
├── app/
│   ├── page.tsx
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── records/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── import/
│   │   └── page.tsx
│   │
│   ├── export/
│   │   └── page.tsx
│   │
│   ├── dtr/
│   │   └── page.tsx
│   │
│   ├── settings/
│   │   └── page.tsx
│   │
│   └── about/
│       └── page.tsx
│
├── components/
│   ├── layout/
│   ├── dashboard/
│   ├── records/
│   ├── import/
│   ├── export/
│   ├── dtr/
│   └── ui/
│
├── lib/
│   ├── db/
│   │   ├── dexie.ts
│   │   └── schema.ts
│   │
│   ├── calculations/
│   │   ├── hours.ts
│   │   └── progress.ts
│   │
│   ├── parsers/
│   │   ├── eod-parser.ts
│   │   ├── excel-parser.ts
│   │   └── csv-parser.ts
│   │
│   ├── exporters/
│   │   ├── csv.ts
│   │   ├── excel.ts
│   │   ├── docx.ts
│   │   └── pdf.ts
│   │
│   ├── formatters/
│   │   ├── date.ts
│   │   └── duration.ts
│   │
│   └── utils.ts
│
├── hooks/
│   ├── use-records.ts
│   ├── use-settings.ts
│   └── use-company.ts
│
├── types/
│   ├── company.ts
│   ├── record.ts
│   └── settings.ts
│
├── public/
│
├── tests/
│   ├── calculations/
│   ├── parsers/
│   └── exporters/
│
├── package.json
├── tsconfig.json
└── README.md
```

---

# 67. Testing Strategy

Test the important calculations heavily.

## Calculation tests

Test:

```text
8:00 AM → 5:00 PM
```

Expected:

```text
9 hours
```

With 1-hour break:

```text
8 hours
```

---

## Edge Cases

Test:

```text
10:20 AM → 7:19 PM
```

Expected:

```text
8h 59m
```

Test:

```text
10:00 PM → 6:00 AM
```

Expected:

```text
8h
```

Test:

```text
Required = 486h
Rendered = 486h
```

Expected:

```text
Remaining = 0
Completion = 100%
```

---

# 68. EOD Parser Tests

Test:

```text
Day 1: 10:20AM - 7:19PM August 3 2026
```

Expected:

```text
day = 1
timeIn = 10:20
timeOut = 19:19
date = 2026-08-03
```

Test variations:

```text
Day 1: 10:20 AM - 7:19 PM August 3, 2026
Day 1: 10:20am - 7:19pm August 3 2026
DAY 1: 10:20AM - 7:19PM August 3 2026
```

---

# 69. Data Safety

Because the application is local-first:

The user should be warned:

> Your records are stored in this browser. Clearing browser data or changing devices may remove your records.

Therefore provide:

```text
Export Backup
```

prominently.

---

# 70. Automatic Backup Reminder

Optional:

If the user has never exported a backup:

```text
Your records are stored only on this device.

Consider creating a backup.

[ Export Backup ]
```

Do not aggressively interrupt the user.

---

# 71. Offline Support

The application should ideally work without internet after the initial load.

Optional:

### PWA

Add:

```text
next-pwa
```

or a modern Next.js-compatible PWA implementation.

Then users can install it as:

```text
OJT Hours Tracker
```

on their desktop/mobile.

---

# 72. SEO

Even though this is primarily an app, create a landing page targeting searches such as:

```text
OJT hours tracker
OJT hour calculator
internship hours tracker
internship DTR generator
OJT DTR generator
student OJT tracker
practicum hours tracker
internship time tracker
```

---

# 73. Monetization

The application can be monetized through advertisements.

However:

### Do not put ads inside the core data-entry experience.

Avoid:

```text
Ad
↓
Input
↓
Ad
↓
Input
```

Instead place ads on:

```text
Landing page
Help pages
About page
Public informational pages
```

If ads are eventually added to the app itself, keep them away from critical buttons and forms.

---

# 74. Potential Future Monetization

Possible future features:

```text
Free:
- OJT tracking
- Basic DTR
- Import/export
- Local storage

Optional premium:
- Multiple OJT profiles
- Advanced DTR templates
- Cloud sync
- Multi-device synchronization
- Custom company templates
- Advanced reports
```

Do not implement a payment system in the MVP.

---

# 75. Privacy

Because the application contains internship information:

The default architecture should keep user data local.

Do not collect:

```text
Student records
EOD notes
Company information
```

on a server unless the user explicitly chooses cloud functionality later.

Landing page privacy messaging:

> Your OJT records stay on your device by default.

---

# 76. Accessibility

The application should support:

* Keyboard navigation
* Visible focus states
* Proper labels
* Semantic HTML
* Screen-reader-friendly forms
* Sufficient contrast
* Accessible dialogs
* Accessible tables

---

# 77. Responsive Design

Desktop:

```text
Sidebar + Content
```

Tablet:

```text
Compact Sidebar
```

Mobile:

```text
Top Header
+
Bottom Navigation
```

Tables should become:

```text
Scrollable table
```

or:

```text
Record cards
```

on smaller screens.

---

# 78. Theme

Recommended visual direction:

```text
Minimal productivity application
```

Base:

```text
White
Off-white
Black
Neutral gray
```

Accent:

```text
One restrained accent color
```

Possible accent:

```text
Blue
```

or a subtle:

```text
Indigo
```

Avoid a rainbow dashboard.

---

# 79. Typography

Use:

```text
Geist
```

or:

```text
Inter
```

Hierarchy:

```text
Large:
Dashboard numbers

Medium:
Section titles

Small:
Metadata

Monospace:
Time values / technical data where useful
```

---

# 80. Dashboard UX Principle

The user should be able to open the application and understand their OJT status in under 5 seconds.

Immediately visible:

```text
486h required
126h 30m rendered
359h 30m remaining
18 days completed
26% complete
```

---

# 81. First-Time Setup

When there are no records:

```text
Welcome to OJT Hours Tracker

Let's set up your internship.

Required OJT Hours
[ 486 ]

Company
[ Stafify BPO & Digital Agency ]

OJT Start Date
[ August 3, 2026 ]

[ Continue ]
```

Then:

```text
You're ready.

[ Add Your First Record ]
[ Import Existing EOD ]
```

---

# 82. Empty Dashboard

If no records exist:

```text
No OJT records yet.

Start tracking your internship hours.

[ Add First Record ]

or

[ Import EOD ]
```

---

# 83. Confirmation Dialogs

Deleting a record:

```text
Delete Day 7?

This will permanently remove the record
from this browser.

[ Cancel ] [ Delete ]
```

Clearing all data:

```text
Delete all OJT data?

This cannot be undone.

Make sure you have exported a backup first.

[ Cancel ] [ Delete Everything ]
```

---

# 84. Toast Notifications

Examples:

```text
Record added successfully.

EOD imported successfully.

5 records imported.

Record updated.

DTR exported.

Backup created.

Record deleted.
```

---

# 85. Keyboard Shortcuts

Optional:

```text
N → New Record
I → Import
E → Export
D → Dashboard
```

Do not implement shortcuts that interfere with typing.

---

# 86. Performance Requirements

Target:

```text
Fast initial load
Minimal JavaScript where possible
Lazy-load export libraries
Lazy-load Excel parser
Lazy-load DOCX/PDF generation
```

Do not load heavy export libraries on the dashboard.

---

# 87. Code Quality

Use:

```text
TypeScript strict mode
ESLint
Prettier
Reusable components
Small utility functions
Clear naming
No duplicated calculation logic
```

Avoid:

```text
any
```

where possible.

---

# 88. Architecture Principle

Keep business logic separate from UI.

Bad:

```text
React component
 ├── parse date
 ├── calculate hours
 ├── calculate cumulative
 ├── export Excel
 └── render UI
```

Better:

```text
UI
 ↓
Hooks
 ↓
Services
 ↓
Business Logic
 ↓
Storage
```

---

# 89. Recommended Architecture

```text
┌──────────────────────────────┐
│          Next.js UI          │
├──────────────────────────────┤
│ React Components             │
│ Pages                        │
│ Forms                        │
│ Tables                       │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│          Hooks               │
├──────────────────────────────┤
│ useRecords                   │
│ useSettings                  │
│ useCompany                   │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│       Business Logic         │
├──────────────────────────────┤
│ Hours Calculation             │
│ EOD Parser                   │
│ Validation                   │
│ Import / Export              │
└──────────────┬───────────────┘
               ↓
┌──────────────────────────────┐
│          Dexie                │
├──────────────────────────────┤
│ IndexedDB                    │
└──────────────────────────────┘
```

---

# 90. MVP Scope

Do NOT build everything immediately.

### MVP 1

Implement:

```text
✓ Company setup
✓ Required hours
✓ Add record
✓ Edit record
✓ Delete record
✓ Automatic rendered hours
✓ Cumulative hours
✓ Remaining hours
✓ Dashboard
✓ Records table
✓ Local persistence
```

---

# 91. MVP 2

Add:

```text
✓ EOD TXT import
✓ Import preview
✓ EOD parser
✓ Excel import
✓ Search
✓ Filtering
✓ Timeline
```

---

# 92. MVP 3

Add:

```text
✓ CSV export
✓ Excel export
✓ DOCX export
✓ DTR print template
✓ PDF export
```

---

# 93. MVP 4

Add:

```text
✓ Backup / restore
✓ PWA
✓ Offline support
✓ Better mobile UX
✓ Landing page
✓ SEO pages
```

---

# 94. Future Features

Possible future additions:

```text
Multiple OJT profiles
Multiple companies
Multiple internships
Cloud sync
Google Drive backup
Supabase authentication
Team/company dashboards
Supervisor approval
Digital signatures
Automatic attendance reminders
Daily notification
Weekly OJT summary
Expected completion date
Hours-per-day calculator
OJT schedule planner
Holiday calendar
Absence tracking
Leave tracking
Overtime tracking
```

These should NOT be part of the initial MVP.

---

# 95. Example User Flow

```text
Open Website
      ↓
First-Time Setup
      ↓
Enter Required Hours
      ↓
Enter Company
      ↓
Dashboard
      ↓
Add Record
      ↓
Enter Time In
      ↓
Enter Time Out
      ↓
Write EOD
      ↓
Save
      ↓
Automatic Calculation
      ↓
Dashboard Updates
      ↓
Continue Daily
      ↓
Export DTR
      ↓
Print / Submit
```

---

# 96. EOD Import Flow

```text
Upload TXT
    ↓
Detect Format
    ↓
Parse EOD
    ↓
Extract Records
    ↓
Validate
    ↓
Preview
    ↓
Confirm
    ↓
Save
    ↓
Calculate Hours
    ↓
Update Dashboard
```

---

# 97. DTR Flow

```text
Records
   ↓
DTR Generator
   ↓
Select Date Range
   ↓
Preview
   ↓
Print
   ↓
PDF
```

---

# 98. Project Branding

Possible names:

### OJT Hours

Simple and professional.

### OJT Tracker

Clear and searchable.

### OJT Log

Minimal.

### InternLog

More product-like.

### Rendered

Modern branding.

### OJT Ledger

Professional and record-focused.

### Practicum

More academic.

Recommended working name:

```text
OJT Tracker
```

Repository:

```text
ojt-hours-tracker
```

---

# 99. README Structure

````markdown
# OJT Hours Tracker

A local-first internship/OJT hours tracking application.

## Features

- OJT hour tracking
- Daily EOD records
- Automatic hour calculation
- Cumulative hours
- Remaining hours
- TXT EOD import
- Excel import
- DTR generation
- PDF / DOCX / CSV / XLSX export
- Local-first storage
- Offline support

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Dexie.js
- IndexedDB
- date-fns
- SheetJS
- docx

## Getting Started

```bash
pnpm install
pnpm dev
````

## Deployment

Deploy directly to Vercel.

## Privacy

OJT records are stored locally in the user's browser by default.

````

---

# 100. Development Roadmap

## Phase 1 — Foundation

```text
[ ] Create Next.js project
[ ] Configure TypeScript
[ ] Configure Tailwind
[ ] Install shadcn/ui
[ ] Create application shell
[ ] Create navigation
[ ] Create theme
````

---

## Phase 2 — Data Layer

```text
[ ] Install Dexie
[ ] Create database
[ ] Create Company model
[ ] Create DailyRecord model
[ ] Create Settings model
[ ] Create CRUD functions
```

---

## Phase 3 — Core Tracking

```text
[ ] First-time setup
[ ] Company setup
[ ] Required hours
[ ] Add record
[ ] Edit record
[ ] Delete record
[ ] Calculate rendered hours
[ ] Calculate cumulative hours
[ ] Calculate remaining hours
[ ] Calculate completion percentage
```

---

## Phase 4 — Dashboard

```text
[ ] Summary cards
[ ] Progress bar
[ ] Recent records
[ ] Today's record
[ ] Completion status
[ ] Quick actions
```

---

## Phase 5 — Records

```text
[ ] Records table
[ ] Search
[ ] Filtering
[ ] Sorting
[ ] Timeline
[ ] Record details
```

---

## Phase 6 — Import

```text
[ ] TXT upload
[ ] EOD parser
[ ] Parser validation
[ ] Import preview
[ ] Duplicate detection
[ ] Excel import
```

---

## Phase 7 — Export

```text
[ ] CSV export
[ ] Excel export
[ ] DOCX export
[ ] DTR print layout
[ ] PDF generation
```

---

## Phase 8 — Reliability

```text
[ ] Unit tests
[ ] Parser tests
[ ] Calculation tests
[ ] Import tests
[ ] Export tests
[ ] Edge-case testing
```

---

## Phase 9 — Deployment

```text
[ ] Production build
[ ] Vercel deployment
[ ] Test production environment
[ ] Test mobile
[ ] Test print
[ ] Test import/export
[ ] Test browser persistence
```

---

# 101. Definition of Done

The project is considered production-ready when:

```text
✓ User can create an OJT profile

✓ User can define required hours

✓ User can add daily records

✓ Time in/out automatically calculate rendered hours

✓ Cumulative hours automatically update

✓ Remaining hours automatically update

✓ Dashboard accurately reflects progress

✓ User can edit records

✓ User can delete records

✓ User can import TXT EOD files

✓ User can import Excel files

✓ Import preview catches errors

✓ User can export CSV

✓ User can export XLSX

✓ User can export DOCX

✓ User can print a professional DTR

✓ Data survives page refresh

✓ Data survives browser restart

✓ User can backup data

✓ User can restore data

✓ Application works on mobile

✓ Application works on desktop

✓ Application deploys successfully to Vercel

✓ No backend is required

✓ Core application functionality works offline
```

---

# 102. Final Recommended Stack

```text
Frontend
└── Next.js
    └── TypeScript

Styling
└── Tailwind CSS

UI
└── shadcn/ui

State
└── React State
└── Zustand (only if necessary)

Storage
└── Dexie.js
    └── IndexedDB

Date/Time
└── date-fns

Excel
└── SheetJS

DOCX
└── docx

PDF
└── Print CSS
└── Optional jsPDF

Validation
└── Zod

Testing
└── Vitest
└── React Testing Library

Deployment
└── Vercel

Source Control
└── GitHub
```

---

# 103. Recommended Final Architecture

```text
                 ┌───────────────────┐
                 │     VERCEL        │
                 │     Next.js       │
                 └─────────┬─────────┘
                           │
                           ↓
                ┌─────────────────────┐
                │    OJT TRACKER      │
                ├─────────────────────┤
                │ Dashboard           │
                │ Records             │
                │ EOD Import          │
                │ Excel Import        │
                │ DTR Generator       │
                │ Export              │
                │ Settings            │
                └──────────┬──────────┘
                           │
                           ↓
                 ┌─────────────────┐
                 │ Business Logic  │
                 ├─────────────────┤
                 │ Hour Calculator │
                 │ EOD Parser      │
                 │ Validators      │
                 │ Exporters       │
                 └────────┬────────┘
                          │
                          ↓
                 ┌─────────────────┐
                 │     Dexie       │
                 │   IndexedDB     │
                 └─────────────────┘
```

---

# 104. Product Goal

The finished application should feel like:

> **A small, polished productivity product that a student could actually use throughout their entire internship.**

Not merely:

> "A CRUD project that tracks hours."

The most important experience should be:

```text
OPEN APP
    ↓
SEE PROGRESS
    ↓
LOG TODAY
    ↓
PASTE / IMPORT EOD
    ↓
SAVE
    ↓
DONE
```

And at the end of the internship:

```text
OPEN DTR
    ↓
SELECT DATE RANGE
    ↓
PREVIEW
    ↓
PRINT / EXPORT
    ↓
SUBMIT
```

---

# 105. Recommended First Build

Start with only these screens:

```text
/
Dashboard
Records
Add Record
Import
DTR
Settings
```

Do not start with the entire feature list.

Build this first:

```text
Setup
 ↓
Add Record
 ↓
Automatic Calculation
 ↓
Dashboard
 ↓
IndexedDB
 ↓
Print DTR
```

Once that works reliably, add TXT/Excel importing and the other export formats.

---

# 106. Success Criteria

The project succeeds if a student can:

> Set their required OJT hours → enter their first day → automatically calculate their hours → continue logging every day → import existing EODs → see exactly how many hours remain → generate a professional DTR → print/submit it.

All without:

```text
Creating an account
Setting up a backend
Setting up a database server
Paying for hosting
```

The entire core application should be deployable to **Vercel for free** as a Next.js application.
