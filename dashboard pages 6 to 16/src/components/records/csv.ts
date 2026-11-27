import type { Tx } from "@/data/dashboard/records";

/* CSV built in the browser from local mock rows. Nothing is sent anywhere. */

export function toCsv(rows: Tx[]): string {
  const head = ["Date", "Ref", "Type", "Member", "Branch", "Amount KES", "Direction", "Account", "Balance after KES", "Source", "Link", "Status", "Note"];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const body = rows.map((t) =>
    [t.date, t.ref, t.label, t.memberName, t.branch, t.signed, t.dir, t.account, t.balance, t.source, t.href, t.status, t.note]
      .map(esc)
      .join(","),
  );
  return [head.map(esc).join(","), ...body].join("\n");
}

export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
