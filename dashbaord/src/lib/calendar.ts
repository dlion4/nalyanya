/* Calendar helpers — pure date math in Africa/Nairobi (EAT, UTC+3). No Date.now() so server and client render identically. */

/** The frozen "today" for the frontend phase (Wednesday 6 May 2026, EAT). */
export const TODAY_ISO = "2026-05-06";
export const DEFAULT_MONTH = "2026-05";

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const DAY_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;
const MONTH_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function parseIso(iso: string): { y: number; m: number; d: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

function isoFromDate(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

export function addDays(iso: string, n: number): string {
  const { y, m, d } = parseIso(iso);
  return isoFromDate(new Date(Date.UTC(y, m - 1, d + n)));
}

/** 0 = Sunday … 6 = Saturday */
export function weekdayOf(iso: string): number {
  const { y, m, d } = parseIso(iso);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Whole days from a to b (b − a). */
export function diffDays(a: string, b: string): number {
  const pa = parseIso(a);
  const pb = parseIso(b);
  return Math.round((Date.UTC(pb.y, pb.m - 1, pb.d) - Date.UTC(pa.y, pa.m - 1, pa.d)) / 86_400_000);
}

export function isWeekend(iso: string): boolean {
  const w = weekdayOf(iso);
  return w === 0 || w === 6;
}

/** "Sun 10 May" */
export function shortDay(iso: string): string {
  const { d, m } = parseIso(iso);
  return `${DAY_SHORT[weekdayOf(iso)]} ${d} ${MONTH_SHORT[m - 1]}`;
}

/** "Sunday, 10 May 2026" */
export function longDate(iso: string): string {
  const { y, m, d } = parseIso(iso);
  return `${DAY_LONG[weekdayOf(iso)]}, ${d} ${MONTH_LONG[m - 1]} ${y}`;
}

/** "10 May" */
export function dayMonth(iso: string): string {
  const { d, m } = parseIso(iso);
  return `${d} ${MONTH_SHORT[m - 1]}`;
}

export function monthKeyOf(iso: string): string {
  const { y, m } = parseIso(iso);
  return `${y}-${pad(m)}`;
}

/** "May 2026" from "2026-05" */
export function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH_LONG[m - 1]} ${y}`;
}

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

export interface GridCell {
  iso: string;
  day: number;
  inMonth: boolean;
}

/** Monday-first 6×7 month grid for the given "YYYY-MM" key. */
export function monthGrid(key: string): GridCell[] {
  const [y, m] = key.split("-").map(Number);
  const first = `${y}-${pad(m)}-01`;
  const offset = (weekdayOf(first) + 6) % 7;
  const start = addDays(first, -offset);
  return Array.from({ length: 42 }, (_, i) => {
    const iso = addDays(start, i);
    const { m: cellMonth, d } = parseIso(iso);
    return { iso, day: d, inMonth: cellMonth === m };
  });
}

/** Monday → Sunday of the week containing iso. */
export function weekOf(iso: string): string[] {
  const offset = (weekdayOf(iso) + 6) % 7;
  const monday = addDays(iso, -offset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function eatLabel(hhmm: string): string {
  return `${hhmm} EAT`;
}

/* ─── ICS (RFC 5545) — UTC stamps so every calendar app reads the time correctly ─── */

function utcStamp(iso: string, hhmm: string): string {
  const { y, m, d } = parseIso(iso);
  const [hh, mm] = hhmm.split(":").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, hh - 3, mm));
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
}

function icsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

export interface IcsItem {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
}

export function buildIcs(items: IcsItem[], calendarName: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nalyanya Family//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icsText(calendarName)}`,
    "X-WR-TIMEZONE:Africa/Nairobi",
  ];
  const stamp = "20260506T090000Z";
  for (const item of items) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${item.id}@nalyanya.family`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${utcStamp(item.date, item.startTime)}`,
      `DTEND:${utcStamp(item.date, item.endTime)}`,
      `SUMMARY:${icsText(item.title)}`,
      `LOCATION:${icsText(item.location)}`,
      `DESCRIPTION:${icsText(item.description)}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/** Triggers a real browser download of a text file (no network). */
export function downloadText(filename: string, content: string, mime = "text/calendar;charset=utf-8"): void {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
