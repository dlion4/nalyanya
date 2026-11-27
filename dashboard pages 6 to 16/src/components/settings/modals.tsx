"use client";

import { useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Download, Eye, EyeOff, Fingerprint, KeyRound, Loader2, Pause, Play, Plus, RotateCw, ShieldCheck, Trash2, X } from "lucide-react";
import { Drawer, Modal } from "@/components/ui/overlay";
import { Stepper, Tabs } from "@/components/ui/primitives";
import { fmt, kes } from "@/lib/format";
import {
  APPROVAL_LABEL,
  AS_OF,
  PERM_LABEL,
  PERMS,
  ROLES,
  type ApprovalMode,
  type Appearance,
  type AuditEntry,
  type ConsentEntry,
  type FamilyProfile,
  type Flag,
  type Integration,
  type Retention,
  type Webhook,
  fmtDate,
  type Cadence,
} from "@/data/dashboard/settings";

/* ------------------------------------------------------------------ */
/* D1 — Family profile editor (3 tabs)                                  */
/* ------------------------------------------------------------------ */
export function FamilyDrawer({ family, onClose, onSave }: { family: FamilyProfile; onClose: () => void; onSave: (f: FamilyProfile) => void }) {
  const [tab, setTab] = useState("identity");
  const [name, setName] = useState(family.name);
  const [motto, setMotto] = useState(family.motto);
  const [crest, setCrest] = useState(family.crest);
  const [head, setHead] = useState(family.head);
  const [coAdmins, setCoAdmins] = useState(family.coAdmins.join(", "));
  const [conduct, setConduct] = useState(family.conduct);
  const [branches, setBranches] = useState(family.branches);
  const ok = name.trim().length >= 3 && motto.trim().length >= 5;
  return (
    <Drawer open onClose={onClose} title="Family profile and governance" sub="Master-admin · every change is audit-logged" width="max-w-[620px]"
      footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={!ok} onClick={() => onSave({ ...family, name: name.trim(), motto: motto.trim(), crest, head, coAdmins: coAdmins.split(",").map(s => s.trim()).filter(Boolean), conduct: conduct.trim(), branches })}><Check className="h-3.5 w-3.5"/> Save family</button></>}
    >
      <Tabs tabs={[{id:"identity",label:"Identity"},{id:"people",label:"People"},{id:"conduct",label:"Conduct"}]} active={tab} onChange={setTab} />
      <div className="pt-4">
        {tab === "identity" && (
          <div className="space-y-3">
            <div><label className="ny-label" htmlFor="fm-name">Family name</label><input id="fm-name" className="ny-input" value={name} onChange={e=>setName(e.target.value)}/></div>
            <div><label className="ny-label" htmlFor="fm-motto">Motto</label><input id="fm-motto" className="ny-input" value={motto} onChange={e=>setMotto(e.target.value)}/></div>
            <div>
              <p className="ny-label">Crest</p>
              <div className="grid grid-cols-3 gap-2">{["/images/frame-elder.jpg","/images/frame-reunion.jpg","/images/contrib-hero.jpg"].map(src=><button key={src} type="button" aria-pressed={crest===src} onClick={()=>setCrest(src)} className={`overflow-hidden rounded-lg border-2 transition ${crest===src?"border-brand-accent":"border-transparent opacity-80"}`}><img src={src} alt="" className="h-20 w-full object-cover"/></button>)}</div>
              <p className="ny-chip ny-chip-sim mt-2">Crest upload SIMULATED · no file is stored</p>
            </div>
          </div>
        )}
        {tab === "people" && (
          <div className="space-y-3">
            <div><label className="ny-label" htmlFor="fm-head">Family head</label><input id="fm-head" className="ny-input" value={head} onChange={e=>setHead(e.target.value)}/></div>
            <div><label className="ny-label" htmlFor="fm-co">Co-admins (comma separated)</label><input id="fm-co" className="ny-input" value={coAdmins} onChange={e=>setCoAdmins(e.target.value)}/></div>
            <div>
              <p className="ny-label">Branches</p>
              <ul className="space-y-1.5">{branches.map(b=><li key={b.id} className="flex items-center justify-between gap-2 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2 text-sm"><span className="truncate">{b.name} · {b.members} members</span><span className="ny-hud shrink-0 !text-[0.52rem]">{b.lead}</span></li>)}</ul>
              <p className="ny-hud mt-2 !text-[0.52rem]">Add and rename branches from the branches manager.</p>
            </div>
          </div>
        )}
        {tab === "conduct" && (
          <div><label className="ny-label" htmlFor="fm-conduct">Family code of conduct</label><textarea id="fm-conduct" className="ny-textarea min-h-[180px]" value={conduct} onChange={e=>setConduct(e.target.value)}/><p className="ny-hud mt-1 !text-[0.52rem]">Shown to every new member at signup and in the public About page.</p></div>
        )}
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* D2 — RBAC matrix editor (2FA gated on save)                          */
/* ------------------------------------------------------------------ */
export function RbacDrawer({ matrix, onClose, onSave }: { matrix: Record<string, Record<string, boolean>>; onClose: () => void; onSave: (m: Record<string, Record<string, boolean>>) => void }) {
  const [draft, setDraft] = useState(matrix);
  const [code, setCode] = useState("");
  const toggle = (role: string, perm: string) => setDraft(d => ({ ...d, [role]: { ...d[role], [perm]: !d[role]?.[perm] } }));
  const changed = JSON.stringify(draft) !== JSON.stringify(matrix);
  return (
    <Drawer open onClose={onClose} title="Roles and permissions" sub="Hidden, not disabled · a role never sees an action it cannot take" width="max-w-[680px]"
      footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={!changed || code.length !== 6} onClick={() => { onSave(draft); }}><ShieldCheck className="h-3.5 w-3.5"/> Save matrix (2FA)</button></>}
    >
      <div className="ny-scroll overflow-x-auto">
        <table className="st-matrix">
          <thead><tr><th scope="col">Role</th>{PERMS.map(p=><th key={p} scope="col">{PERM_LABEL[p]}</th>)}</tr></thead>
          <tbody>
            {ROLES.map(role => (
              <tr key={role}>
                <td className="whitespace-nowrap text-sm font-semibold">{role}</td>
                {PERMS.map(perm => (
                  <td key={perm}>
                    <button type="button" role="switch" aria-checked={!!draft[role]?.[perm]} aria-label={`${role} · ${PERM_LABEL[perm]}`} className={`st-cell ${draft[role]?.[perm] ? "is-on" : ""}`} onClick={() => toggle(role, perm)}>
                      <span className="st-tick">{draft[role]?.[perm] ? "✓" : "–"}</span>
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ny-hud mt-3 !text-[0.52rem]">Ward/Minor is read-only and guardian-managed. Viewer is read-only across the family.</p>
      <label className="ny-label mt-4" htmlFor="rb-2fa"><Fingerprint className="mr-1 inline h-3.5 w-3.5"/> Family head&apos;s 2FA code</label>
      <input id="rb-2fa" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}/>
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · dev mode accepts any 6 digits</p>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* D3 — Vault credential editor (write-only, never echoes)              */
/* ------------------------------------------------------------------ */
export function VaultDrawer({ integration, onClose, onSave, onTest }: { integration: Integration; onClose: () => void; onSave: (id: string) => void; onTest: (id: string) => void }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const filled = integration.fields.filter(f => (values[f.key] ?? "").length > 3).length;
  const complete = filled === integration.fields.length;
  return (
    <Drawer open onClose={onClose} title={integration.name} sub={`${integration.detail} · write-only vault`} width="max-w-[560px]"
      footer={<>
        <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => onTest(integration.id)}><RotateCw className="h-3.5 w-3.5"/> Test (SIMULATED)</button>
        <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={!complete || busy} onClick={()=>{setBusy(true);window.setTimeout(()=>{onSave(integration.id);setBusy(false);},600)}}>{busy?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<Check className="h-3.5 w-3.5"/>} Save credentials</button>
      </>}
    >
      <span className={`ny-chip ${integration.state === "configured" ? "ny-chip-ok" : "ny-chip-sim"}`}>{integration.state === "configured" ? "configured" : "ready-ui · backend Phase 2"}</span>
      <div className="mt-4 space-y-3">
        {integration.fields.map(f => (
          <div key={f.key}>
            <label className="ny-label" htmlFor={`vf-${f.key}`}>{f.label}</label>
            <div className="relative">
              <input
                id={`vf-${f.key}`}
                type={f.secret && !reveal[f.key] ? "password" : "text"}
                className="ny-input pr-10"
                value={values[f.key] ?? ""}
                onChange={e=>setValues(v=>({...v,[f.key]:e.target.value}))}
                placeholder={f.placeholder}
                autoComplete="off"
              />
              {f.secret && <button type="button" onClick={()=>setReveal(r=>({...r,[f.key]:!r[f.key]}))} aria-label={reveal[f.key]?"Hide value":"Show value"} className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded text-text-tertiary hover:text-text-primary">{reveal[f.key]?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</button>}
            </div>
          </div>
        ))}
      </div>
      <p className="ny-inset mt-4 px-3.5 py-3 text-xs leading-relaxed text-text-secondary">
        Values are written to the vault and never read back into the browser. Phase 1 stores nothing at all — the fields
        clear on close. Rotate replaces the old secret immediately.
      </p>
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · AES-256-GCM vault lands with the backend</p>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* D4 — Scheduler queue                                                 */
/* ------------------------------------------------------------------ */
export function QueueDrawer({ jobs, paused, onPauseAll, onClose }: { jobs: { id: string; label: string; at: string; kind: string }[]; paused: boolean; onPauseAll: () => void; onClose: () => void }) {
  return (
    <Drawer open onClose={onClose} title="Scheduler queue" sub={`Next ${jobs.length} firings · ${paused ? "all paused" : "running"}`} width="max-w-[600px]"
      footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Close</button><button type="button" className={`ny-btn ny-btn-sm ${paused ? "ny-btn-primary" : "ny-btn-danger"}`} onClick={onPauseAll}>{paused?<><Play className="h-3.5 w-3.5"/> Resume all</>:<><Pause className="h-3.5 w-3.5"/> Pause all</>}</button></>}
    >
      <ul>
        {jobs.map(j => (
          <li key={j.id} className="st-queue">
            <span className={`ny-chip ${j.kind === "rotation" ? "ny-chip-brand" : j.kind === "reminder" ? "ny-chip-warn" : j.kind === "digest" ? "ny-chip-info" : "ny-chip-neutral"}`}>{j.kind}</span>
            <span className="min-w-0"><span className="block truncate text-sm font-medium">{j.label}</span></span>
            <span className="ny-hud shrink-0 !text-[0.52rem]">{j.at}</span>
          </li>
        ))}
      </ul>
      <p className="ny-chip ny-chip-sim mt-4">Local timer in Phase 1 · BullMQ when the backend is wired</p>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* M1 — Approval policy editor                                          */
/* ------------------------------------------------------------------ */
export function ApprovalsModal({ approvals, onClose, onSave }: { approvals: { action: string; mode: ApprovalMode; note: string }[]; onClose: () => void; onSave: (a: { action: string; mode: ApprovalMode; note: string }[]) => void }) {
  const [draft, setDraft] = useState(approvals);
  return <Modal open onClose={onClose} title="Approval policy" sub="Per action class · always-ask, standing approval, or never" size="md"
    footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={()=>onSave(draft)}><Check className="h-3.5 w-3.5"/> Save policy</button></>}
  >
    <ul className="space-y-2">{draft.map(a => (
      <li key={a.action} className="rounded-xl border border-border-subtle bg-surface-1 px-3.5 py-3">
        <p className="text-sm font-semibold">{a.action}</p>
        <p className="ny-hud mt-0.5 !text-[0.52rem]">{a.note}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">{(["always-ask","standing","never"] as ApprovalMode[]).map(m=><button key={m} type="button" onClick={()=>setDraft(d=>d.map(x=>x.action===a.action?{...x,mode:m}:x))} className={`ny-chip ny-touch ${a.mode===m?"!bg-brand-primary !text-on-brand !border-transparent":"ny-chip-neutral"}`}>{APPROVAL_LABEL[m]}</button>)}</div>
      </li>
    ))}</ul>
    <p className="ny-chip ny-chip-sim mt-3">Money-touching config still needs 2FA regardless of policy</p>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M2 — Vault test result                                               */
/* ------------------------------------------------------------------ */
export function VaultTestModal({ integration, ok, onClose }: { integration: Integration; ok: boolean; onClose: () => void }) {
  const seed = Array.from(integration.id).reduce((a, c) => a + c.charCodeAt(0), 0);
  const proof = `SIM-TEST-${integration.id.toUpperCase()}-${String(1000 + (seed % 9000))}`;
  return <Modal open onClose={onClose} title={`Test ${integration.name}`} sub="Local round-trip · no request left this device" size="sm" tone="gold"
    footer={<button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>Done</button>}
  >
    <div className={`rounded-xl border p-4 text-center ${ok?"border-[rgba(46,125,50,0.3)] bg-[rgba(46,125,50,0.07)]":"border-[rgba(198,40,40,0.3)] bg-[rgba(198,40,40,0.06)]"}`}>
      <span className={`mx-auto grid h-11 w-11 place-items-center rounded-full ${ok?"bg-[rgba(46,125,50,0.16)]":"bg-[rgba(198,40,40,0.14)]"}`}>{ok?<Check className="h-6 w-6 text-success"/>:<X className="h-6 w-6 text-danger"/>}</span>
      <p className="mt-3 text-sm font-semibold">{ok ? "Test passed locally" : "Test could not run"}</p>
      <p className="ny-hud mt-1 !text-[0.52rem]">{proof} · SIMULATED</p>
    </div>
    <p className="text-sm leading-relaxed text-text-secondary mt-3">{ok ? "The adapter responds to a local health check. Real credentials are checked when the backend is wired." : "No credential is stored yet, so the real test cannot run."}</p>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M3 — Revoke a credential (danger, reason required)                   */
/* ------------------------------------------------------------------ */
export function VaultRevokeModal({ integration, onConfirm, onClose }: { integration: Integration; onConfirm: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const ok = reason.trim().length >= 6;
  return <Modal open onClose={onClose} title={`Revoke ${integration.name} credentials?`} sub="Money and messaging on this rail stop immediately" size="sm" tone="danger"
    footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Keep them</button><button type="button" className="ny-btn ny-btn-danger ny-btn-sm" disabled={!ok} onClick={()=>onConfirm(reason.trim())}><Trash2 className="h-3.5 w-3.5"/> Revoke</button></>}
  >
    <div className="flex items-start gap-3 rounded-xl border border-[rgba(198,40,40,0.3)] bg-[rgba(198,40,40,0.06)] px-4 py-3"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger"/><p className="text-sm leading-relaxed text-text-secondary">Scheduled payouts and broadcasts that use this rail are paused until new credentials are saved.</p></div>
    <label className="ny-label mt-4" htmlFor="vr-reason">Reason (logged)</label><input id="vr-reason" className="ny-input" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Key rotated after the quarterly review"/>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M4 — Automation detail                                               */
/* ------------------------------------------------------------------ */
export function AutomationModal({ automation, onClose, onToggle }: { automation: { id: string; name: string; detail: string; on: boolean; critical: boolean; cadence?: Cadence }; onClose: () => void; onToggle: () => void }) {
  return <Modal open onClose={onClose} title={automation.name} sub={automation.detail} size="sm"
    footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Close</button><button type="button" className={`ny-btn ny-btn-sm ${automation.on?"ny-btn-danger":"ny-btn-primary"}`} onClick={onToggle}>{automation.on?"Switch off":"Switch on"}</button></>}
  >
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3"><div><p className="text-sm font-semibold">Automation is {automation.on ? "on" : "off"}</p><p className="ny-hud mt-0.5 !text-[0.52rem]">Applies to the whole family instance</p></div><button type="button" role="switch" aria-checked={automation.on} aria-label={automation.name} className="st-switch" onClick={onToggle}/></div>
      {automation.cadence && <div><span className="ny-label">Cadence</span><div className="flex flex-wrap gap-1.5">{(["off","weekly","fortnightly","monthly"] as Cadence[]).map(c=><span key={c} className={`ny-chip ${automation.cadence===c?"ny-chip-brand":"ny-chip-neutral"}`}>{c}</span>)}</div></div>}
      {automation.critical && <p className="ny-chip ny-chip-warn">Money-touching · switching this on writes an audit row</p>}
      <p className="ny-chip ny-chip-sim">Local timer in Phase 1 · scheduler connects with the backend</p>
    </div>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M5 — Appearance and locale                                           */
/* ------------------------------------------------------------------ */
export function AppearanceModal({ prefs, onClose, onSave }: { prefs: Appearance; onClose: () => void; onSave: (p: Appearance) => void }) {
  const [draft, setDraft] = useState(prefs);
  const set = <K extends keyof Appearance>(k: K, v: Appearance[K]) => setDraft(d => ({ ...d, [k]: v }));
  return <Modal open onClose={onClose} title="Appearance and locale" sub="Theme, Elder Mode default, currency and format" size="md"
    footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={()=>onSave(draft)}><Check className="h-3.5 w-3.5"/> Save appearance</button></>}
  >
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div><label className="ny-label" htmlFor="ap-theme">Theme</label><select id="ap-theme" className="ny-select" value={draft.theme} onChange={e=>set("theme",e.target.value as Appearance["theme"])}><option value="light">Light (default)</option><option value="dark">Dark</option><option value="system">Follow system</option></select></div>
      <div><label className="ny-label" htmlFor="ap-cur">Display currency</label><select id="ap-cur" className="ny-select" value={draft.currency} onChange={e=>set("currency",e.target.value as Appearance["currency"])}>{["KES","USD","EUR"].map(c=><option key={c}>{c}</option>)}</select></div>
      <div><label className="ny-label" htmlFor="ap-lang">Language</label><select id="ap-lang" className="ny-select" value={draft.language} onChange={e=>set("language",e.target.value as "en"|"sw")}><option value="en">English</option><option value="sw">Kiswahili (mock)</option></select></div>
      <div><label className="ny-label" htmlFor="ap-tz">Timezone</label><select id="ap-tz" className="ny-select" value={draft.timezone} onChange={e=>set("timezone",e.target.value)}><option>Africa/Nairobi</option><option>UTC</option><option>Europe/London</option><option>America/Toronto</option></select></div>
      <div><label className="ny-label" htmlFor="ap-num">Number format</label><select id="ap-num" className="ny-select" value={draft.numbers} onChange={e=>set("numbers",e.target.value as Appearance["numbers"])}><option>1,234,567.89</option><option>1 234 567,89</option></select></div>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3"><div><p className="text-sm font-semibold">Elder Mode by default</p><p className="ny-hud mt-0.5 !text-[0.52rem]">New members start with large type</p></div><button type="button" role="switch" aria-checked={draft.elderDefault} aria-label="Elder Mode default" className="st-switch" onClick={()=>set("elderDefault",!draft.elderDefault)}/></div>
      <div className="sm:col-span-2 flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3"><div><p className="text-sm font-semibold">Reduce motion for everyone</p><p className="ny-hud mt-0.5 !text-[0.52rem]">Overrides each device&apos;s own setting</p></div><button type="button" role="switch" aria-checked={draft.reduceMotion} aria-label="Reduce motion" className="st-switch" onClick={()=>set("reduceMotion",!draft.reduceMotion)}/></div>
    </div>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M6 — Retention policy                                                */
/* ------------------------------------------------------------------ */
export function RetentionModal({ retention, onClose, onSave }: { retention: Retention; onClose: () => void; onSave: (r: Retention) => void }) {
  const [draft, setDraft] = useState(retention);
  const set = <K extends keyof Retention>(k: K, v: number) => setDraft(d => ({ ...d, [k]: v }));
  return <Modal open onClose={onClose} title="Data retention" sub="How long each kind of family record is kept" size="md"
    footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={()=>onSave(draft)}><Check className="h-3.5 w-3.5"/> Save retention</button></>}
  >
    <div className="space-y-3">
      {([["ledgerYears","Ledger entries","years",7,30],["auditYears","Audit trail","years",7,30],["imagesHotDays","Gallery images, hot","days",30,365],["archiveYears","Deep archive","years",1,25]] as const).map(([key,label,unit,min,max]) => (
        <div key={key} className="rounded-xl border border-border-subtle bg-surface-1 px-3.5 py-3">
          <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold">{label}</p><p className="ny-num text-sm font-semibold">{draft[key]} {unit}</p></div>
          <input type="range" min={min} max={max} value={draft[key]} onChange={e=>set(key,Number(e.target.value))} className="mt-2 w-full accent-[var(--color-brand-primary)]" aria-label={label}/>
        </div>
      ))}
    </div>
    <p className="ny-chip ny-chip-warn mt-3">Ledger and audit are kept for the family&apos;s protection. Never set them below one year.</p>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M7 — Consent log                                                     */
/* ------------------------------------------------------------------ */
export function ConsentModal({ entries, onClose }: { entries: ConsentEntry[]; onClose: () => void }) {
  return <Modal open onClose={onClose} title="Consent log" sub="Who agreed to what, and when" size="md" footer={<button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>Close</button>}>
    <ul className="space-y-1.5">{entries.map(c=><li key={c.id} className="flex items-start gap-2.5 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${c.tone==="gold"?"bg-brand-accent":c.tone==="red"?"bg-danger":"bg-text-tertiary"}`}/><span className="min-w-0"><span className="block text-sm font-medium">{c.who}</span><span className="ny-hud block !text-[0.52rem]">{c.at}</span><span className="block text-xs text-text-secondary">{c.note}</span></span></li>)}</ul>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M8 — Export everything                                               */
/* ------------------------------------------------------------------ */
export function ExportAllModal({ onClose, onQueue }: { onClose: () => void; onQueue: () => void }) {
  return <Modal open onClose={onClose} title="Export the whole family instance" sub="One archive · ledger, lineage, gallery index and audit" size="sm" tone="gold"
    footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onQueue}><Download className="h-3.5 w-3.5"/> Queue export</button></>}
  >
    <ul className="space-y-1.5 text-sm">{["Double-entry ledger, all 8,412 rows","Lineage graph for 243 members","Contribution, chama, sacco and loan records","Gallery index with consent status","Consent log and full audit trail"].map(x=><li key={x} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-success"/>{x}</li>)}</ul>
    <p className="ny-inset mt-3 px-3.5 py-3 text-xs leading-relaxed text-text-secondary">Images are exported as an index, not the files themselves. Signed and encrypted when the backend is wired.</p>
    <p className="ny-chip ny-chip-sim mt-3">SIMULATED · async job stub</p>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M9 — Feature flag editor                                             */
/* ------------------------------------------------------------------ */
export function FlagModal({ flag, onClose, onSave }: { flag: Flag; onClose: () => void; onSave: (f: Flag) => void }) {
  const [on, setOn] = useState(flag.on);
  const [limit, setLimit] = useState(flag.limit ?? 0);
  return <Modal open onClose={onClose} title={flag.label} sub={flag.key} size="sm"
    footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={()=>onSave({ ...flag, on, limit: flag.kind === "number" ? limit : flag.limit })}><Check className="h-3.5 w-3.5"/> Save flag</button></>}
  >
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3"><div><p className="text-sm font-semibold">Flag is {on ? "on" : "off"}</p><p className="ny-hud mt-0.5 !text-[0.52rem]">Applies to every member immediately</p></div><button type="button" role="switch" aria-checked={on} aria-label={flag.label} className="st-switch" onClick={()=>setOn(v=>!v)}/></div>
    {flag.kind === "number" && <div className="mt-3"><label className="ny-label" htmlFor="fg-limit">Limit</label><input id="fg-limit" inputMode="numeric" className="ny-input ny-num" value={limit} onChange={e=>setLimit(Number(e.target.value.replace(/[^0-9]/g,""))||0)}/></div>}
    <p className="ny-chip ny-chip-sim mt-3">Local only in Phase 1 · feature flags persist with the backend</p>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M10 — Outbound webhook editor (with test-fire)                       */
/* ------------------------------------------------------------------ */
export function WebhookModal({ webhook, onClose, onSave, onFire }: { webhook: Webhook | null; onClose: () => void; onSave: (w: Webhook) => void; onFire: (id: string) => void }) {
  const isNew = !webhook;
  const [url, setUrl] = useState(webhook?.url ?? "");
  const [secret, setSecret] = useState(webhook?.secret ?? "");
  const [events, setEvents] = useState<string[]>(webhook?.events ?? ["ledger.posted"]);
  const [on, setOn] = useState(webhook?.on ?? true);
  const allEvents = ["ledger.posted","contribution.confirmed","loan.approved","allocation.settled","broadcast.sent","member.added","digest.sent","grant.disbursed"];
  const ok = /^https?:\/\/.+/.test(url) && secret.trim().length >= 8 && events.length > 0;
  return <Modal open onClose={onClose} title={isNew ? "New outbound webhook" : "Edit webhook"} sub="URL + HMAC secret + event picker" size="md"
    footer={<>
      {!isNew && <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={()=>onFire(webhook!.id)}><Play className="h-3.5 w-3.5"/> Test-fire (SIMULATED)</button>}
      <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={!ok} onClick={()=>onSave({ id: webhook?.id ?? `w${Date.now().toString(36)}`, url, secret, events, on, last: webhook?.last ?? null, ok: webhook?.ok ?? null })}><Check className="h-3.5 w-3.5"/> Save webhook</button>
    </>}
  >
    <div className="space-y-3">
      <div><label className="ny-label" htmlFor="wh-url">Destination URL</label><input id="wh-url" className="ny-input" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://…/hooks/nalyanya"/></div>
      <div><label className="ny-label" htmlFor="wh-secret">HMAC signing secret</label><input id="wh-secret" type="password" className="ny-input" value={secret} onChange={e=>setSecret(e.target.value)} placeholder="whsec_…" autoComplete="off"/></div>
      <div><span className="ny-label">Events</span><div className="flex flex-wrap gap-1.5">{allEvents.map(ev=>{const sel=events.includes(ev);return <button key={ev} type="button" aria-pressed={sel} onClick={()=>setEvents(p=>sel?p.filter(x=>x!==ev):[...p,ev])} className={`ny-chip ny-touch ${sel?"!bg-brand-primary !text-on-brand !border-transparent":"ny-chip-neutral"}`}>{ev}</button>})}</div></div>
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3"><span className="text-sm font-semibold">Active</span><button type="button" role="switch" aria-checked={on} aria-label="Webhook active" className="st-switch" onClick={()=>setOn(v=>!v)}/></div>
    </div>
    <p className="ny-chip ny-chip-sim mt-3">Test-fire posts a signed payload locally · never leaves the browser</p>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M11 — Webhook delivery log                                           */
/* ------------------------------------------------------------------ */
export function WebhookLogModal({ webhook, onClose }: { webhook: Webhook; onClose: () => void }) {
  return <Modal open onClose={onClose} title="Delivery log" sub={webhook.url} size="md" footer={<button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>Close</button>}>
    <ul className="space-y-1.5">
      {[0,1,2,3,4].map(i => (
        <li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2 text-sm">
          <span className="min-w-0"><span className="block truncate font-medium">{webhook.events[i % webhook.events.length] ?? "ledger.posted"}</span><span className="ny-hud block !text-[0.52rem]">SIM-DELIVERY-{1000+i} · 200 OK · 148 ms</span></span>
          <span className={`ny-chip shrink-0 ${i === 3 ? "ny-chip-danger" : "ny-chip-ok"}`}>{i === 3 ? "failed" : "delivered"}</span>
        </li>
      ))}
    </ul>
    <p className="ny-chip ny-chip-sim mt-3">Log entries are local examples</p>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M12 — Pause all (danger, reason)                                     */
/* ------------------------------------------------------------------ */
export function PauseAllModal({ onConfirm, onClose }: { onConfirm: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const ok = reason.trim().length >= 8;
  return <Modal open onClose={onClose} title="Pause every scheduled job?" sub="Chama rotations, collections and reminders all stop" size="sm" tone="danger"
    footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Keep running</button><button type="button" className="ny-btn ny-btn-danger ny-btn-sm" disabled={!ok} onClick={()=>onConfirm(reason.trim())}><Pause className="h-3.5 w-3.5"/> Pause all</button></>}
  >
    <div className="flex items-start gap-3 rounded-xl border border-[rgba(198,40,40,0.3)] bg-[rgba(198,40,40,0.06)] px-4 py-3"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger"/><p className="text-sm leading-relaxed text-text-secondary">Money due during the pause is not lost — it queues. Elders expecting a reminder today will not get one.</p></div>
    <label className="ny-label mt-4" htmlFor="pa-reason">Reason (logged)</label><input id="pa-reason" className="ny-input" value={reason} onChange={e=>setReason(e.target.value)} placeholder="Reconciliation in progress"/>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M13 — Branch manager                                                 */
/* ------------------------------------------------------------------ */
export function BranchModal({ branches, onClose, onSave }: { branches: { id: string; name: string; members: number; lead: string }[]; onClose: () => void; onSave: (b: { id: string; name: string; members: number; lead: string }[]) => void }) {
  const [draft, setDraft] = useState(branches);
  const [name, setName] = useState("");
  return <Modal open onClose={onClose} title="Branches" sub={`${draft.length} branches · leads shown in the family switcher`} size="md"
    footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Close</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={()=>onSave(draft)}><Check className="h-3.5 w-3.5"/> Save branches</button></>}
  >
    <ul className="space-y-2">{draft.map(b=><li key={b.id} className="flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-1 px-3 py-2.5">
      <input className="ny-input !min-h-0 flex-1 py-1.5" value={b.name} onChange={e=>setDraft(d=>d.map(x=>x.id===b.id?{...x,name:e.target.value}:x))} aria-label={`${b.name} name`}/>
      <input className="ny-input !min-h-0 flex-1 py-1.5" value={b.lead} onChange={e=>setDraft(d=>d.map(x=>x.id===b.id?{...x,lead:e.target.value}:x))} aria-label={`${b.name} lead`}/>
      <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2" aria-label={`Remove ${b.name}`} onClick={()=>setDraft(d=>d.filter(x=>x.id!==b.id))}><Trash2 className="h-3.5 w-3.5"/></button>
    </li>)}</ul>
    <div className="mt-3 flex gap-2"><input className="ny-input" placeholder="New branch name" value={name} onChange={e=>setName(e.target.value)}/><button type="button" className="ny-btn ny-btn-outline ny-btn-sm shrink-0" disabled={name.trim().length<3} onClick={()=>{setDraft(d=>[...d,{id:`br${Date.now().toString(36)}`,name:name.trim(),members:0,lead:"Unassigned"}]);setName("");}}><Plus className="h-3.5 w-3.5"/> Add</button></div>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M14 — Audit detail                                                   */
/* ------------------------------------------------------------------ */
export function AuditModal({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  return <Modal open onClose={onClose} title={`Audit · ${entry.action}`} sub={`${entry.ref} · ${entry.at}`} size="sm" footer={<button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>Close</button>}>
    <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">{[["Actor",entry.actor],["Entity",entry.entity],["Detail",entry.detail],["Time",`${entry.at} EAT`],["Integrity","Append-only · HMAC export in Phase 2"]].map(([k,v])=><div key={k} className="flex items-start justify-between gap-3 px-3.5 py-2.5"><dt className="shrink-0 text-text-secondary">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M15 — Confirmation after any admin action                            */
/* ------------------------------------------------------------------ */
export function DecisionModal({ data, onClose }: { data: { title: string; body: string; tone: "ok"|"warn" }; onClose: () => void }) {
  return <Modal open onClose={onClose} title={data.title} size="sm" tone={data.tone==="warn"?"danger":"gold"} footer={<button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>Done</button>}>
    <div className="rounded-xl border border-border-subtle bg-surface-2 p-4 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[rgba(212,164,55,0.2)]"><Check className="h-6 w-6 text-[#7a5b12]"/></span><p className="mt-3 text-sm leading-relaxed text-text-secondary">{data.body}</p></div>
    <p className="ny-chip ny-chip-sim mt-3">SIMULATED · state is local and resets on reload</p>
  </Modal>;
}
