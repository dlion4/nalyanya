/* ── East African Time (EAT, Africa/Nairobi) — the one clock the family uses ── */

import { useEffect, useState } from "react";

export interface EatTime { weekday: number; minutes: number; clock: string; day: string }
export interface OfficeWindow { open: number; close: number; label: string; note: string }
export interface OfficeStatus { open: boolean; label: string }

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");
const hm = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;

let formatter: Intl.DateTimeFormat | null = null;
try {
  formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    hourCycle: "h23",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
} catch {
  formatter = null;
}

export function eatNow(date = new Date()): EatTime {
  if (formatter) {
    const parts = formatter.formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
    const hour = Number(get("hour")) % 24 || 0;
    const minute = Number(get("minute"));
    const safeMinute = Number.isFinite(minute) ? minute : 0;
    return {
      weekday: Math.max(0, DAYS.indexOf(get("weekday"))),
      minutes: hour * 60 + safeMinute,
      clock: `${pad(hour)}:${pad(safeMinute)}`,
      day: `${get("weekday")} ${get("day")} ${get("month")}`,
    };
  }
  // Fallback: EAT is UTC+3
  const d = new Date(date.getTime() + (180 + date.getTimezoneOffset()) * 60_000);
  const hour = d.getUTCHours();
  const minute = d.getUTCMinutes();
  return { weekday: d.getUTCDay(), minutes: hour * 60 + minute, clock: `${pad(hour)}:${pad(minute)}`, day: DAYS[d.getUTCDay()] };
}

export function officeStatus(t: EatTime, hours: (OfficeWindow | null)[]): OfficeStatus {
  const today = hours[t.weekday];
  if (today && t.minutes >= today.open && t.minutes < today.close) {
    return { open: true, label: `Open now · closes ${hm(today.close)}` };
  }
  for (let i = 0; i < 8; i++) {
    const d = (t.weekday + i) % 7;
    const w = hours[d];
    if (!w) continue;
    if (i === 0 && t.minutes >= w.open) continue;
    const when = i === 0 ? "today" : i === 1 ? "tomorrow" : DAYS[d];
    return { open: false, label: `Closed · opens ${when} ${hm(w.open)}` };
  }
  return { open: false, label: "Closed" };
}

export function useEatClock(): EatTime {
  const [now, setNow] = useState<EatTime>(() => eatNow());
  useEffect(() => {
    const id = window.setInterval(() => setNow(eatNow()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}
