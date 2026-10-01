// Standalone test of the smart EOD parser logic (mirrors eod-smart.ts).
// Run with: node scripts/test-smart.mjs

const DAY_START_RE = /^\s*day\s+(\d+)\b/i;
const SECTION_RE = /^(morning|afternoon|evening|notes?|accomplishments?|tasks?|summary)\s*[:：]?\s*$/i;

function findDateInLine(line) {
  const monthName = line.match(/[A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4}/);
  if (monthName) return new Date(monthName[0]).toISOString().slice(0, 10);
  const numeric = line.match(/\d{4}-\d{2}-\d{2}/);
  if (numeric) return numeric[0];
  return null;
}
function parseTime(s) {
  const m = s.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let h = +m[1]; const min = m[2] ? +m[2] : 0; const mer = m[3];
  if (mer === "am" && h === 12) h = 0;
  if (mer === "pm" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
function findTimesInLine(line) {
  const r = {};
  const lower = line.toLowerCase();
  if (lower.includes("time in") || lower.includes("time out")) {
    const i = line.match(/time\s*in\s*[:\-]?\s*(\d{1,2}(?::\d{2})?\s*(?:[ap]m)?)/i);
    const o = line.match(/time\s*out\s*[:\-]?\s*(\d{1,2}(?::\d{2})?\s*(?:[ap]m)?)/i);
    if (i) r.timeIn = parseTime(i[1]);
    if (o) r.timeOut = parseTime(o[1]);
    return r;
  }
  const range = line.match(/(\d{1,2}(?::\d{2})?\s*(?:[ap]m)?)\s*(?:[-–—]|to)\s*(\d{1,2}(?::\d{2})?\s*(?:[ap]m)?)/i);
  if (range) { r.timeIn = parseTime(range[1]); r.timeOut = parseTime(range[2]); }
  return r;
}

function parse(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks = []; let cur = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (DAY_START_RE.test(line)) { if (cur) blocks.push(cur); cur = { dayLine: line, lines: [] }; }
    else if (cur) cur.lines.push(line);
  }
  if (cur) blocks.push(cur);

  return blocks.map((b, i) => {
    const day = +b.dayLine.match(DAY_START_RE)[1];
    let date = findDateInLine(b.dayLine) || "";
    let { timeIn = "", timeOut = "" } = findTimesInLine(b.dayLine);
    const notes = [];
    for (const line of b.lines) {
      if (!line || SECTION_RE.test(line)) continue;
      if (!date) { const d = findDateInLine(line); if (d) { date = d; continue; } }
      if (!timeIn || !timeOut) {
        const t = findTimesInLine(line);
        if (t.timeIn && !timeIn) timeIn = t.timeIn;
        if (t.timeOut && !timeOut) timeOut = t.timeOut;
        if (t.timeIn || t.timeOut) continue;
      }
      notes.push(line.replace(/^[-*•·]\s?/, "").trim());
    }
    return { day, date, timeIn, timeOut, notes: notes.length };
  });
}

const example = `Day 40
September 30, 2026
Time In: 10:04 AM
Time Out: 8:00 PM


Morning

-Arrived at the office and greeted Sir Eldrin a happy birthday.
-Continued converting raw components.

Afternoon

- Continued converting raw components to use the shared global components.
- Worked overtime with Sir Siah.

Day 39 – September 30, 2026
Time In: 10:25 AM | Time Out: 7:00 PM

Morning
- Continued working on AMS and checked the Purchase Order route.

Afternoon
- Continued on the AMS module and updated the dashboard tab color.

Day 1: 10:20AM - 7:19PM August 3 2026
- Reviewed training guide
- Attended Git session`;

console.log(JSON.stringify(parse(example), null, 2));
