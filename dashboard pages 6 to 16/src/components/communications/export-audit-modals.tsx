"use client";

import { useState } from "react";
import { AlertTriangle, Check, Download, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import type { AuditEntry, Broadcast, Template } from "@/data/dashboard/communications";

export function ExportModal({ broadcasts, onQueue, onClose }: { broadcasts: Broadcast[]; onQueue: (format: "CSV" | "PDF") => void; onClose: () => void }) {
  const [format, setFormat] = useState<"CSV" | "PDF">("CSV");
  return <Modal open onClose={onClose} title="Export broadcasts" sub={`${broadcasts.length} records · signed files connect in Phase 2`} size="sm" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onQueue(format)}><Download className="h-3.5 w-3.5"/> Queue {format}</button></>}><div className="grid grid-cols-2 gap-2">{(["CSV","PDF"] as const).map((f)=><button key={f} type="button" onClick={()=>setFormat(f)} className={`rounded-xl border p-3 text-sm font-semibold transition ${format===f?"border-brand-primary bg-[rgba(31,77,58,0.07)]":"border-border-subtle bg-surface-1"}`}>{f}</button>)}</div><p className="ny-chip ny-chip-sim mt-4">SIMULATED · KES cost estimates · EAT timestamps</p></Modal>;
}

export function AuditModal({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  return <Modal open onClose={onClose} title={`Audit · ${entry.action}`} sub={`${entry.ref} · ${entry.at}`} size="sm" footer={<button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>Close</button>}><dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">{[["Actor",entry.actor],["Entity",entry.entity],["Detail",entry.detail],["Time",`${entry.at} EAT`],["Integrity","Append-only · HMAC in Phase 2"]].map(([k,v])=><div key={k} className="flex items-start justify-between gap-3 px-3.5 py-2.5"><dt className="shrink-0 text-text-secondary">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl></Modal>;
}

export function DecisionModal({ data, onClose }: { data: { title: string; body: string; tone: "ok" | "warn" }; onClose: () => void }) {
  return <Modal open onClose={onClose} title={data.title} size="sm" tone={data.tone === "warn" ? "danger" : "gold"} footer={<button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>Done</button>}><div className="rounded-xl border border-border-subtle bg-surface-2 p-4 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[rgba(212,164,55,0.2)]"><Check className="h-6 w-6 text-[#7a5b12]"/></span><p className="mt-3 text-sm leading-relaxed text-text-secondary">{data.body}</p></div><p className="ny-chip ny-chip-sim mt-3">SIMULATED · no external message was sent</p></Modal>;
}

export function DeleteTemplateModal({ template, onConfirm, onClose }: { template: Template; onConfirm: () => void; onClose: () => void }) {
  return <Modal open onClose={onClose} title="Remove this template?" sub={template.title} size="sm" tone="danger" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Keep it</button><button type="button" className="ny-btn ny-btn-danger ny-btn-sm" onClick={onConfirm}><Trash2 className="h-3.5 w-3.5"/> Remove template</button></>}><div className="flex items-start gap-3 rounded-xl border border-[rgba(198,40,40,0.3)] bg-[rgba(198,40,40,0.06)] px-4 py-3"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger"/><p className="text-sm leading-relaxed text-text-secondary">Existing broadcasts keep the copy they were created with. The template will no longer appear for new messages.</p></div></Modal>;
}
