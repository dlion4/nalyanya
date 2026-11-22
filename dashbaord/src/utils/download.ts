export function downloadText(name: string, content: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportCalendar(event: {
  id: string;
  title: string;
  date: string;
  place: string;
  description: string;
}) {
  const safe = (s: string) =>
    s
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  const time = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  downloadText(
    `${event.id}.ics`,
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Nalyanya//Family Calendar//EN",
      "BEGIN:VEVENT",
      `UID:${event.id}@nalyanya.local`,
      `DTSTAMP:${time(new Date())}`,
      `DTSTART:${time(new Date(event.date))}`,
      `DTEND:${time(new Date(+new Date(event.date) + 2 * 3600000))}`,
      `SUMMARY:${safe(event.title)}`,
      `LOCATION:${safe(event.place)}`,
      `DESCRIPTION:${safe(event.description)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n"),
    "text/calendar;charset=utf-8",
  );
}
