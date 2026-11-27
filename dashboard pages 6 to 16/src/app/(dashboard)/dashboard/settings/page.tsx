"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Banknote, Bell, Building2, Check, Clock, Cog, Database, Download, Eye, Fingerprint, Globe, KeyRound, Landmark, Lock, Mail, MessageSquare, Megaphone, Pause, Play, Plus, RotateCw, Settings2, ShieldCheck, Smartphone, Sparkles, Upload, Users, X } from "lucide-react";
import { CountUp, Reveal, Tabs } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlay";
import { fmt, kes } from "@/lib/format";
import {
  APPROVAL_LABEL,
  PERM_LABEL,
  PERMS,
  ROLES,
  activeAutomationCount,
  activeFlagCount,
  appearanceSeed,
  approvalsSeed,
  auditSeed,
  automationSeed,
  configuredCount,
  consentSeed,
  familySeed,
  flagsSeed,
  frames,
  integrationsSeed,
  permCount,
  queueSeed,
  rbacSeed,
  retentionSeed,
  type ApprovalMode,
  type Appearance,
  type AuditEntry,
  type Cadence,
  type Flag,
  type Integration,
  type Retention,
  type VaultState,
  type Webhook,
  webhooksSeed,
} from "@/data/dashboard/settings";
import { useOverlay } from "@/components/settings/use-overlay";
import {
  AppearanceModal,
  ApprovalsModal,
  AuditModal,
  AutomationModal,
  BranchModal,
  ConsentModal,
  DecisionModal,
  ExportAllModal,
  FamilyDrawer,
  FlagModal,
  PauseAllModal,
  QueueDrawer,
  RbacDrawer,
  RetentionModal,
  VaultDrawer,
  VaultRevokeModal,
  VaultTestModal,
  WebhookLogModal,
  WebhookModal,
} from "@/components/settings/modals";
import { FrameStrip, ShutterLightbox, ShutterStage } from "@/components/contributions/shutter-gallery";

const HERO_IMG = "/images/frame-reunion.jpg";

const sections = [
  { id: "s1", label: "S1 · Family & governance" },
  { id: "s2", label: "S2 · Roles & approvals" },
  { id: "s3", label: "S3 · Integration vault" },
  { id: "s4", label: "S4 · Automation" },
  { id: "s5", label: "S5 · Appearance" },
  { id: "s6", label: "S6 · Data & privacy" },
  { id: "s7", label: "S7 · Flags & webhooks" },
  { id: "s8", label: "S8 · Audit" },
  { id: "s9", label: "S9 · Stories" },
];

const KPI_ACCENTS = ["#1f4d3a", "#d4a437", "#2e7d32", "#b5532a", "#6a4c93", "#e0a82e"];
const INBOUND_HOOKS = [
  { name: "Receive-link fulfilment", path: "POST /api/webhooks/receive/:token", detail: "M-Pesa B2C confirmation that an elder received an allocation. Marks it settled." },
  { name: "M-Pesa C2B confirmation", path: "POST /api/webhooks/mpesa/c2b", detail: "Marks a contribution paid and updates the live tally." },
  { name: "WhatsApp inbound", path: "POST /api/webhooks/whatsapp", detail: "Routes a reply into the 1:1 thread in T-14." },
];

const categoryIcon: Record<Integration["category"], typeof Smartphone> = {
  "money-in": Smartphone,
  "money-out": Banknote,
  transfer: Landmark,
  messaging: MessageSquare,
  images: Database,
  identity: KeyRound,
};

export default function SettingsPage() {
  return <SettingsView />;
}

function SettingsView() {
  const toast = useToast();
  const ov = useOverlay();

  /* ---------- state (local, resets on reload) ---------- */
  const [family, setFamily] = useState(familySeed);
  const [rbac, setRbac] = useState(() => Object.fromEntries(rbacSeed.map(r => [r.role, { ...r.perms }])) as Record<string, Record<string, boolean>>);
  const [approvals, setApprovals] = useState(approvalsSeed);
  const [integrations, setIntegrations] = useState<Integration[]>(integrationsSeed);
  const [automations, setAutomations] = useState(automationSeed);
  const [paused, setPaused] = useState(false);
  const [appearance, setAppearance] = useState<Appearance>(appearanceSeed);
  const [retention, setRetention] = useState<Retention>(retentionSeed);
  const [flags, setFlags] = useState<Flag[]>(flagsSeed);
  const [webhooks, setWebhooks] = useState<Webhook[]>(webhooksSeed);
  const [audit, setAudit] = useState<AuditEntry[]>(auditSeed);
  const [decision, setDecision] = useState<{ title: string; body: string; tone: "ok" | "warn" } | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean } | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  /* ---------- derived ---------- */
  const targetIntegration = ov.id ? integrations.find(i => i.id === ov.id) ?? null : null;
  const targetFlag = ov.id ? flags.find(f => f.id === ov.id) ?? null : null;
  const targetWebhook = ov.id ? webhooks.find(w => w.id === ov.id) ?? null : null;
  const targetAudit = ov.id ? audit.find(a => a.ref === ov.id) ?? null : null;
  const targetAutomation = ov.id ? automations.find(a => a.id === ov.id) ?? null : null;
  const configured = configuredCount(integrations);
  const activeAuto = activeAutomationCount(automations);
  const activeFlags = activeFlagCount(flags);
  const permTotal = ROLES.length * PERMS.length;
  const grantedTotal = ROLES.reduce((s, r) => s + PERMS.filter(p => rbac[r]?.[p]).length, 0);

  const open = (k: Parameters<typeof ov.open>[0], id?: string, t?: string) => ov.open(k, id || t ? { id, t } : undefined);
  const log = (action: string, entity: string, detail: string, tone: AuditEntry["tone"] = "plain") =>
    setAudit(prev => [{ ref: `NY-AUD-${String(1241 + prev.length).padStart(5, "0")}`, at: "18 Nov · 12:05", actor: "Peter Wanyama Nalyanya", action, entity, detail, tone }, ...prev]);

  const saveFamily = (f: typeof family) => {
    setFamily(f);
    log("family.edit", "NY-FAM-0001", `Name and motto saved · ${f.branches.length} branches`);
    ov.close();
    setDecision({ title: "Family saved", body: "The identity, people and code of conduct are updated for every member.", tone: "ok" });
  };

  const saveRbac = (m: Record<string, Record<string, boolean>>) => {
    setRbac(m);
    log("rbac.edit", "NY-RBAC", `Matrix saved · ${grantedTotal} of ${permTotal} permissions granted · 2FA verified`, "gold");
    ov.close();
    setDecision({ title: "Permission matrix saved", body: "Roles take effect on each member's next page load. Unauthorized actions are hidden, never disabled.", tone: "ok" });
  };

  const saveApprovals = (a: typeof approvals) => {
    setApprovals(a);
    log("approvals.edit", "NY-APPROVALS", a.map(x => `${x.action}: ${x.mode}`).join(" · "));
    ov.close();
    setDecision({ title: "Approval policy saved", body: "Money-touching configuration still requires 2FA whatever the policy says.", tone: "ok" });
  };

  const saveVault = (id: string) => {
    setIntegrations(prev => prev.map(i => (i.id === id ? { ...i, state: "configured" as VaultState } : i)));
    log("vault.write", id, "Credentials written to the vault · write-only, never echoed", "gold");
    ov.close();
    setDecision({ title: "Credentials saved (SIMULATED)", body: "The vault stores them in Phase 2. Nothing is kept in this browser session.", tone: "ok" });
  };

  const testVault = (id: string) => {
    const target = integrations.find(i => i.id === id);
    const ok = !!target && target.state === "configured";
    setIntegrations(prev => prev.map(i => (i.id === id ? { ...i, lastTested: "18 Nov · 12:05", lastTestOk: ok } : i)));
    log("integration.test", id, ok ? "Test fired · SIMULATED proof returned" : "Test could not run · no credential stored", ok ? "plain" : "red");
    setTestResult({ id, ok });
    open("vault-test", id);
  };

  const revokeVault = (id: string, reason: string) => {
    setIntegrations(prev => prev.map(i => (i.id === id ? { ...i, state: "ready-ui" as VaultState, lastTested: null, lastTestOk: null } : i)));
    log("vault.revoke", id, `Credentials revoked · ${reason}`, "red");
    ov.close();
    setDecision({ title: "Credentials revoked", body: "Payouts and broadcasts on this rail are paused until new credentials are saved.", tone: "warn" });
  };

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => (a.id === id ? { ...a, on: !a.on } : a)));
    const a = automations.find(x => x.id === id);
    log("automation.toggle", id, `${a?.name ?? id} switched ${a?.on ? "off" : "on"}`, a?.critical ? "gold" : "plain");
    if (targetAutomation) ov.close();
  };

  const pauseAll = (reason: string) => {
    setPaused(true);
    log("scheduler.pause", "NY-SCHED", `All jobs paused · ${reason}`, "red");
    ov.close();
    toast({ tone: "warn", title: "Scheduler paused", body: "Money due during the pause queues rather than disappearing." });
  };

  const resumeAll = () => {
    setPaused(false);
    log("scheduler.resume", "NY-SCHED", "All jobs resumed", "gold");
    toast({ tone: "ok", title: "Scheduler resumed", body: "Queued jobs fire on their next cadence." });
  };

  const saveAppearance = (a: Appearance) => {
    setAppearance(a);
    log("appearance.edit", "NY-APPEARANCE", `${a.theme} · ${a.currency} · ${a.language} · elder default ${a.elderDefault}`);
    ov.close();
    setDecision({ title: "Appearance saved", body: "Theme, currency and locale apply family-wide on the next page load.", tone: "ok" });
  };

  const saveRetention = (r: Retention) => {
    setRetention(r);
    log("retention.edit", "NY-RETENTION", `Ledger ${r.ledgerYears}y · audit ${r.auditYears}y · images ${r.imagesHotDays}d hot`, "gold");
    ov.close();
    setDecision({ title: "Retention saved", body: "Records past the hot window move to archive rather than being deleted.", tone: "ok" });
  };

  const saveFlag = (f: Flag) => {
    setFlags(prev => prev.map(x => (x.id === f.id ? f : x)));
    log("flag.edit", f.key, `${f.label} · ${f.on ? "on" : "off"}${f.kind === "number" ? ` · limit ${f.limit}` : ""}`);
    ov.close();
    setDecision({ title: "Flag saved", body: `${f.key} applies to every member immediately.`, tone: "ok" });
  };

  const saveWebhook = (w: Webhook) => {
    setWebhooks(prev => (prev.some(x => x.id === w.id) ? prev.map(x => (x.id === w.id ? w : x)) : [w, ...prev]));
    log("webhook.save", w.id, `${w.url} · ${w.events.length} events · ${w.on ? "active" : "inactive"}`, "gold");
    ov.close();
    setDecision({ title: "Webhook saved", body: "Events are signed with the HMAC secret and retried twice on failure.", tone: "ok" });
  };

  const fireWebhook = (id: string) => {
    const w = webhooks.find(x => x.id === id);
    setWebhooks(prev => prev.map(x => (x.id === id ? { ...x, last: "18 Nov · 12:06", ok: true } : x)));
    log("webhook.fire", id, `Test-fire to ${w?.url ?? ""} · signed payload · SIMULATED`, "gold");
    ov.close();
    toast({ tone: "info", title: "Test-fired (SIMULATED)", body: "A signed payload was generated locally. Nothing left the browser." });
  };

  /* ================================================================== */
  return (
    <div className="page-dash-settings mx-auto max-w-[1500px]">
      {/* ================= HERO ================= */}
      <Reveal>
        <header className="st-hero mb-6">
          <img src={HERO_IMG} alt="Five generations of the Nalyanya family on the homestead steps" className="st-hero__img" fetchPriority="high" />
          <div className="st-hero__shade" />
          <div className="st-hero__body grid grid-cols-[minmax(0,1fr)] gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end">
            <div className="min-w-0">
              <span className="gd-code">T-16 · Settings</span>
              <h1 className="ny-display mt-3 max-w-[20ch] text-[clamp(1.9rem,4.6vw,3.3rem)] leading-[1.02] text-on-brand">The controls the whole family runs on.</h1>
              <p className="mt-2.5 max-w-[60ch] text-sm leading-relaxed text-on-brand/85 sm:text-base">
                Security policy, roles, the credential vault, automation, feature flags and webhooks — one place, and every
                change is audit-logged. Two family heads&apos; approval is required for anything that touches money.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-accent" onClick={() => open("family")}><Cog className="h-4 w-4"/> Family profile</button>
                <button type="button" className="ny-btn ny-btn-outline !border-on-brand/50 !text-on-brand hover:!bg-on-brand/10" onClick={() => open("rbac")}><ShieldCheck className="h-4 w-4"/> Roles &amp; permissions</button>
                <button type="button" className="ny-btn ny-btn-ghost !text-on-brand/90 hover:!bg-on-brand/10" onClick={() => open("queue")}><Clock className="h-4 w-4"/> Scheduler queue</button>
              </div>
            </div>
            <div className="st-glass p-4">
              <p className="ny-hud !text-on-brand/70">Integrations</p>
              <p className="ny-display mt-1 text-[clamp(1.6rem,3vw,2.2rem)] leading-none"><CountUp value={integrations.length} /></p>
              <p className="mt-1.5 text-xs text-on-brand/75">{configured} configured · {integrations.length - configured} ready-ui</p>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-on-brand/20 pt-3">
                <span className="ny-hud !text-on-brand/75">Scheduler</span>
                <span className={`ny-chip ${paused ? "ny-chip-danger" : "ny-chip-ok"}`}>{paused ? "paused" : "running"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="ny-hud !text-on-brand/75">Automations on</span>
                <span className="ny-chip ny-chip-brand">{activeAuto}/{automations.length}</span>
              </div>
            </div>
          </div>
        </header>
      </Reveal>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[210px_minmax(0,1fr)]">
        <nav className="cc-rail" aria-label="Section index">
          <p className="ny-hud px-2 pb-1">Sections</p>
          {sections.map(s => <a key={s.id} href={`#${s.id}`}>{s.label}</a>)}
          <span className="ny-hud mt-2 border-t border-border-subtle px-2 pt-2 !text-[0.56rem]">9 sections · 23 overlays</span>
        </nav>

        <div className="min-w-0">
          {/* ================= S1 FAMILY ================= */}
          <section id="s1" className="mb-8 scroll-mt-24" aria-label="Family profile and governance">
            <div className="cc-sec-head">
              <div><p className="ny-hud">S1 · Identity</p><h2 className="ny-display text-[1.45rem] leading-tight">Family profile &amp; governance</h2></div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => open("branch")}><Building2 className="h-3.5 w-3.5"/> Branches</button>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("family")}><Cog className="h-3.5 w-3.5"/> Edit family</button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
              <div className="st-crest h-64">
                <img src={family.crest} alt="The family crest" className="h-full w-full object-cover" />
              </div>
              <div className="ny-card p-4 sm:p-5">
                <p className="ny-hud">The {family.name} family</p>
                <h3 className="ny-display mt-1 text-xl leading-tight">{family.motto}</h3>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {[["Family head", family.head],["Founded", family.founded],["Co-admins", family.coAdmins.join(", ")],["Council of elders", `${family.elders.length} elders`],["Branches", `${family.branches.length} · ${family.branches.reduce((s, b) => s + b.members, 0)} members`],["Code of conduct", `${family.conduct.length} characters`]].map(([k, v]) => <div key={k} className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5"><dt className="ny-hud">{k}</dt><dd className="mt-1 font-medium">{v}</dd></div>)}
                </dl>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-text-secondary">{family.conduct}</p>
              </div>
            </div>
          </section>

          {/* ================= S2 ROLES ================= */}
          <section id="s2" className="mb-8 scroll-mt-24" aria-label="Roles and approvals">
            <div className="cc-sec-head">
              <div><p className="ny-hud">S2 · RBAC</p><h2 className="ny-display text-[1.45rem] leading-tight">Roles, RBAC &amp; approval policy</h2></div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => open("approvals")}><ShieldCheck className="h-3.5 w-3.5"/> Approval policy</button>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("rbac")}><KeyRound className="h-3.5 w-3.5"/> Edit matrix</button>
              </div>
            </div>
            <div className="ny-card p-4 sm:p-5">
              <div className="ny-scroll overflow-x-auto">
                <table className="st-matrix">
                  <thead><tr><th scope="col">Role</th>{PERMS.map(p => <th key={p} scope="col">{PERM_LABEL[p]}</th>)}</tr></thead>
                  <tbody>
                    {ROLES.map(role => (
                      <tr key={role}>
                        <td className="whitespace-nowrap text-sm font-semibold">{role}</td>
                        {PERMS.map(perm => (
                          <td key={perm}>
                            <span className={`st-cell ${rbac[role]?.[perm] ? "is-on" : ""}`}><span className="st-tick">{rbac[role]?.[perm] ? "✓" : "–"}</span></span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="ny-hud">{grantedTotal} of {permTotal} permissions granted · unauthorized actions are hidden, not disabled</p>
                <Link href="/dashboard/members" className="ny-btn ny-btn-ghost ny-btn-sm">Members directory (T-3) <ArrowRight className="h-3.5 w-3.5"/></Link>
              </div>
            </div>
            <div className="ny-inset mt-3 px-4 py-3">
              <p className="ny-hud">Approval policy by action class</p>
              <ul className="mt-2 space-y-1.5 text-sm">{approvals.slice(0, 3).map(a => <li key={a.action} className="flex flex-wrap items-center justify-between gap-2"><span className="min-w-0 truncate">{a.action}</span><span className={`ny-chip shrink-0 ${a.mode === "always-ask" ? "ny-chip-warn" : a.mode === "standing" ? "ny-chip-brand" : "ny-chip-neutral"}`}>{APPROVAL_LABEL[a.mode]}</span></li>)}</ul>
              <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-3" onClick={() => open("approvals")}>See all {approvals.length} action classes</button>
            </div>
          </section>

          {/* ================= S3 VAULT ================= */}
          <section id="s3" className="mb-8 scroll-mt-24" aria-label="Integrations and credentials">
            <div className="cc-sec-head">
              <div><p className="ny-hud">S3 · The vault</p><h2 className="ny-display text-[1.45rem] leading-tight">Integrations &amp; credentials</h2><p className="mt-1 max-w-[64ch] text-sm text-text-secondary">Write-only fields. Secrets never echo back to the browser, and no test call leaves this device.</p></div>
              <span className="ny-chip ny-chip-sim">All rails SIMULATED · backend Phase 2</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {integrations.map((i, idx) => {
                const Icon = categoryIcon[i.category];
                return (
                  <Reveal key={i.id} delay={Math.min(idx, 8) * 40} className="h-full">
                    <article className={`st-vault ${i.state === "configured" ? "is-configured" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border-subtle bg-surface-2"><Icon className="h-4 w-4 text-brand-primary"/></span>
                        <span className={`ny-chip shrink-0 ${i.state === "configured" ? "ny-chip-ok" : "ny-chip-sim"}`}>{i.state}</span>
                      </div>
                      <p className="ny-display text-[0.98rem] leading-tight">{i.name}</p>
                      <p className="text-xs leading-relaxed text-text-secondary">{i.detail}</p>
                      <p className="ny-hud !text-[0.52rem]">{i.lastTested ? `Tested ${i.lastTested}${i.lastTestOk ? " · ok" : " · failed"}` : "Never tested"}</p>
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                        <button type="button" className="ny-btn ny-btn-outline ny-btn-sm flex-1" onClick={() => open("vault", i.id)}><KeyRound className="h-3.5 w-3.5"/> {i.state === "configured" ? "Rotate" : "Configure"}</button>
                        <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2" onClick={() => testVault(i.id)} aria-label={`Test ${i.name}`}><RotateCw className="h-3.5 w-3.5"/></button>
                        {i.state === "configured" && <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2" onClick={() => open("vault-revoke", i.id)} aria-label={`Revoke ${i.name} credentials`}><X className="h-3.5 w-3.5"/></button>}
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </section>

          {/* ================= S4 AUTOMATION ================= */}
          <section id="s4" className="mb-8 scroll-mt-24" aria-label="Automation and scheduling">
            <div className="cc-sec-head">
              <div><p className="ny-hud">S4 · Control room</p><h2 className="ny-display text-[1.45rem] leading-tight">Automation &amp; scheduling</h2></div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => open("queue")}><Clock className="h-3.5 w-3.5"/> Queue ({queueSeed.length})</button>
                <button type="button" className={`ny-btn ny-btn-sm ${paused ? "ny-btn-primary" : "ny-btn-danger"}`} onClick={() => (paused ? resumeAll() : open("pause-all"))}>{paused ? <><Play className="h-3.5 w-3.5"/> Resume all</> : <><Pause className="h-3.5 w-3.5"/> Pause all</>}</button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {automations.map(a => (
                <div key={a.id} className={`st-auto ${a.on ? "is-on" : ""} ${a.critical ? "is-critical" : ""}`}>
                  <button type="button" role="switch" aria-checked={a.on} aria-label={a.name} className="st-switch" onClick={() => toggleAutomation(a.id)}/>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{a.name}</span>
                    <span className="ny-hud block !text-[0.52rem]">{a.detail}</span>
                  </span>
                  {a.cadence && <span className="ny-chip ny-chip-neutral shrink-0">{a.cadence}</span>}
                  {a.critical && <span className="ny-chip ny-chip-warn shrink-0">money-touching</span>}
                  <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2 shrink-0" onClick={() => open("automation", a.id)} aria-label={`Detail for ${a.name}`}><ArrowRight className="h-4 w-4"/></button>
                </div>
              ))}
            </div>
            <div className="ny-inset mt-3 flex items-start gap-2.5 px-4 py-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary"/>
              <p className="text-xs leading-relaxed text-text-secondary">A local timer drives these in Phase 1. BullMQ takes over when the backend is wired, so the same toggles keep working.</p>
            </div>
          </section>

          {/* ================= S5 APPEARANCE ================= */}
          <section id="s5" className="mb-8 scroll-mt-24" aria-label="Appearance and locale">
            <div className="cc-sec-head">
              <div><p className="ny-hud">S5 · Locale</p><h2 className="ny-display text-[1.45rem] leading-tight">Appearance &amp; accessibility</h2></div>
              <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("appearance")}><Settings2 className="h-3.5 w-3.5"/> Edit appearance</button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[["Theme", appearance.theme],["Elder Mode default", appearance.elderDefault ? "On" : "Off"],["Currency", appearance.currency],["Language", appearance.language === "en" ? "English" : "Kiswahili"],["Timezone", appearance.timezone],["Number format", appearance.numbers],["Reduce motion", appearance.reduceMotion ? "Forced on" : "Per device"],["Elder default", appearance.elderDefault ? "56px targets" : "Standard"]].map(([k, v]) => <div key={k} className="ny-card p-4"><p className="ny-hud">{k}</p><p className="ny-display mt-1 text-base capitalize">{v}</p></div>)}
            </div>
          </section>

          {/* ================= S6 DATA ================= */}
          <section id="s6" className="mb-8 scroll-mt-24" aria-label="Data and privacy">
            <div className="cc-sec-head">
              <div><p className="ny-hud">S6 · Records</p><h2 className="ny-display text-[1.45rem] leading-tight">Data &amp; privacy</h2></div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => open("consent")}><Globe className="h-3.5 w-3.5"/> Consent log</button>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("export-all")}><Download className="h-3.5 w-3.5"/> Export everything</button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="ny-card p-4 sm:p-5 lg:col-span-7">
                <p className="ny-hud">Retention policy</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[["Ledger", `${retention.ledgerYears} years`],["Audit", `${retention.auditYears} years`],["Images hot", `${retention.imagesHotDays} days`],["Archive", `${retention.archiveYears} years`]].map(([k, v]) => <div key={k} className="ny-inset px-3 py-2.5"><p className="ny-hud !text-[0.5rem]">{k}</p><p className="ny-num mt-0.5 text-sm font-semibold">{v}</p></div>)}
                </div>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-4" onClick={() => open("retention")}><Database className="h-3.5 w-3.5"/> Edit retention</button>
                <p className="text-sm leading-relaxed text-text-secondary mt-4">Kenya DPA 2019: family data is kept for lineage, money and memories. Contact details stay inside the family. A member can view, correct and export their own record, and withdraw consent where the law allows. Ledger and audit history are retained for every member&apos;s protection.</p>
              </div>
              <div className="ny-card flex flex-col gap-3 p-4 sm:p-5 lg:col-span-5">
                <p className="ny-hud">Inbound webhooks · Phase 2</p>
                <ul className="space-y-1.5">
                  {INBOUND_HOOKS.map(h => <li key={h.path} className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5"><p className="text-sm font-semibold">{h.name}</p><code className="ny-hud block !text-[0.52rem]">{h.path}</code><p className="mt-1 text-xs text-text-secondary">{h.detail}</p></li>)}
                </ul>
                <p className="ny-chip ny-chip-sim mt-auto">Documented but not active in Phase 1</p>
              </div>
            </div>
          </section>

          {/* ================= S7 FLAGS & WEBHOOKS ================= */}
          <section id="s7" className="mb-8 scroll-mt-24" aria-label="Feature flags and webhooks">
            <div className="cc-sec-head">
              <div><p className="ny-hud">S7 · Switches</p><h2 className="ny-display text-[1.45rem] leading-tight">Feature flags &amp; webhooks</h2></div>
              <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("webhook-new")}><Plus className="h-3.5 w-3.5"/> New webhook</button>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="ny-card p-4 sm:p-5 lg:col-span-6">
                <div className="mb-3 flex items-center justify-between gap-2"><p className="ny-hud">Feature flags</p><span className="ny-chip ny-chip-brand">{activeFlags}/{flags.length} on</span></div>
                <div className="flex flex-col gap-2">
                  {flags.map(f => (
                    <div key={f.id} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                      <button type="button" role="switch" aria-checked={f.on} aria-label={f.label} className="st-switch" onClick={() => saveFlag({ ...f, on: !f.on })}/>
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{f.label}</span><code className="ny-hud block !text-[0.5rem]">{f.key}</code></span>
                      {f.kind === "number" && <span className="ny-chip ny-chip-neutral shrink-0">{f.limit}</span>}
                      <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2 shrink-0" onClick={() => open("flag", f.id)} aria-label={`Edit ${f.key}`}><ArrowRight className="h-4 w-4"/></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 lg:col-span-6">
                <p className="ny-hud">Outbound webhooks</p>
                {webhooks.map(w => (
                  <div key={w.id} className="ny-card p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0"><p className="truncate text-sm font-semibold">{w.url}</p><p className="ny-hud !text-[0.52rem]">{w.events.length} events · {w.secret.slice(0, 10)}…</p></div>
                      <span className={`ny-chip shrink-0 ${w.on ? (w.ok ? "ny-chip-ok" : "ny-chip-warn") : "ny-chip-neutral"}`}>{w.on ? (w.ok ? "active" : "failing") : "paused"}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">{w.events.map(e => <span key={e} className="ny-chip ny-chip-neutral !text-[0.48rem]">{e}</span>)}</div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => open("webhook", w.id)}>Edit</button>
                      <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => fireWebhook(w.id)}><Play className="h-3.5 w-3.5"/> Test-fire</button>
                      <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => open("webhook-log", w.id)}>Delivery log</button>
                    </div>
                  </div>
                ))}
                {webhooks.length === 0 && <p className="ny-inset px-4 py-8 text-center text-sm text-text-secondary">No outbound webhooks yet. Add one to push family events to another system.</p>}
              </div>
            </div>
          </section>

          {/* ================= S8 AUDIT ================= */}
          <section id="s8" className="mb-8 scroll-mt-24" aria-label="Audit trail">
            <div className="cc-sec-head">
              <div><p className="ny-hud">Append-only</p><h2 className="ny-display text-[1.45rem] leading-tight">Admin audit trail</h2></div>
              <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => toast({ tone: "ok", title: "HMAC export queued", body: "SIMULATED · the signed file is produced by the backend." })}><Download className="h-3.5 w-3.5"/> Export audit</button>
            </div>
            <div className="cc-table-wrap">
              <ul>{audit.map(a => (
                <li key={a.ref}>
                  <button type="button" className="cc-audit-row w-full text-left" onClick={() => open("audit", a.ref)}>
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.tone === "gold" ? "bg-brand-accent" : a.tone === "red" ? "bg-danger" : "bg-text-tertiary"}`}/>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-text-primary">{a.action} <span className="font-normal text-text-secondary">· {a.entity}</span></span>
                      <span className="block text-sm text-text-secondary">{a.detail}</span>
                      <span className="ny-hud mt-1 block !text-[0.52rem]">{a.at} · {a.actor}</span>
                    </span>
                    <span className="ny-hud !text-[0.52rem]">{a.ref}</span>
                  </button>
                </li>
              ))}</ul>
            </div>
          </section>

          {/* ================= S9 STORIES ================= */}
          <section id="s9" className="mb-8 scroll-mt-24" aria-label="Stories behind the settings">
            <div className="cc-sec-head">
              <div><p className="ny-hud">S9 · Camera pinhole</p><h2 className="ny-display text-[1.45rem] leading-tight">The rules, and who they protect</h2><p className="mt-1 max-w-[62ch] text-sm text-text-secondary">The iris closes to a pinhole, the exposure flashes, and the next family photograph opens.</p></div>
              <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => setLightbox(true)}>Full contact sheet</button>
            </div>
            <Reveal>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="min-w-0">
                  <ShutterStage frames={frames} index={frameIndex} onIndexChange={setFrameIndex}/>
                  <div className="mt-3"><FrameStrip frames={frames} index={frameIndex} onIndexChange={setFrameIndex}/></div>
                </div>
                <aside className="ny-card p-4">
                  <p className="ny-hud">Frame notes</p>
                  <ul className="mt-2 space-y-2.5">
                    {[{k:"Transition",v:"iris, pinhole, flash, open"},{k:"Timing",v:"400ms close · 440ms open"},{k:"Depth",v:"CSS 3D perspective 1400px"},{k:"Accessibility",v:"reduced motion snaps instantly"}].map(x => <li key={x.k} className="ny-inset px-3 py-2.5"><span className="ny-hud block !text-[0.55rem]">{x.k}</span><span className="text-sm font-medium">{x.v}</span></li>)}
                  </ul>
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-3 w-full" onClick={() => setLightbox(true)}><Sparkles className="h-3.5 w-3.5"/> Expand</button>
                  <p className="ny-hud mt-3">Drive connector SIMULATED · Phase 2</p>
                </aside>
              </div>
            </Reveal>
          </section>

          <Reveal><footer className="rounded-xl border border-dashed border-border-strong bg-surface-2 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-text-secondary"><strong className="text-text-primary">Frontend-only Phase 1.</strong> The vault, scheduler and webhooks are SIMULATED. Nothing leaves this browser.</p>
              <div className="flex flex-wrap gap-1.5">{["Credential vault","BullMQ scheduler","HMAC webhooks","M-Pesa Daraja","WhatsApp Cloud","Google Drive"].map(r => <span key={r} className="ny-chip ny-chip-sim">{r}</span>)}</div>
            </div>
          </footer></Reveal>
        </div>
      </div>

      {/* ================= OVERLAYS ================= */}
      {ov.key === "family" && <FamilyDrawer family={family} onClose={ov.close} onSave={saveFamily}/>}
      {ov.key === "rbac" && <RbacDrawer matrix={rbac} onClose={ov.close} onSave={saveRbac}/>}
      {ov.key === "approvals" && <ApprovalsModal approvals={approvals} onClose={ov.close} onSave={saveApprovals}/>}
      {ov.key === "vault" && targetIntegration && <VaultDrawer integration={targetIntegration} onClose={ov.close} onSave={saveVault} onTest={testVault}/>}
      {ov.key === "vault-test" && testResult && targetIntegration && <VaultTestModal integration={targetIntegration} ok={testResult.ok} onClose={() => { setTestResult(null); ov.close(); }}/>}
      {ov.key === "vault-revoke" && targetIntegration && <VaultRevokeModal integration={targetIntegration} onClose={ov.close} onConfirm={reason => revokeVault(targetIntegration.id, reason)}/>}
      {ov.key === "automation" && targetAutomation && <AutomationModal automation={targetAutomation} onClose={ov.close} onToggle={() => toggleAutomation(targetAutomation.id)}/>}
      {ov.key === "queue" && <QueueDrawer jobs={queueSeed} paused={paused} onPauseAll={() => (paused ? resumeAll() : open("pause-all"))} onClose={ov.close}/>}
      {ov.key === "pause-all" && <PauseAllModal onClose={ov.close} onConfirm={pauseAll}/>}
      {ov.key === "appearance" && <AppearanceModal prefs={appearance} onClose={ov.close} onSave={saveAppearance}/>}
      {ov.key === "retention" && <RetentionModal retention={retention} onClose={ov.close} onSave={saveRetention}/>}
      {ov.key === "consent" && <ConsentModal entries={consentSeed} onClose={ov.close}/>}
      {ov.key === "export-all" && <ExportAllModal onClose={ov.close} onQueue={() => { ov.close(); log("data.export", "NY-FAM-0001", "Whole-instance export queued · SIMULATED", "gold"); toast({ tone: "ok", title: "Export queued (SIMULATED)", body: "Async job stub · the signed archive is produced in Phase 2." }); }}/>}
      {ov.key === "flag" && targetFlag && <FlagModal flag={targetFlag} onClose={ov.close} onSave={saveFlag}/>}
      {ov.key === "webhook" && <WebhookModal webhook={targetWebhook} onClose={ov.close} onSave={saveWebhook} onFire={fireWebhook}/>}
      {ov.key === "webhook-new" && <WebhookModal webhook={null} onClose={ov.close} onSave={saveWebhook} onFire={fireWebhook}/>}
      {ov.key === "webhook-log" && targetWebhook && <WebhookLogModal webhook={targetWebhook} onClose={ov.close}/>}
      {ov.key === "audit" && targetAudit && <AuditModal entry={targetAudit} onClose={ov.close}/>}
      {ov.key === "branch" && <BranchModal branches={family.branches} onClose={ov.close} onSave={b => { setFamily(f => ({ ...f, branches: b })); log("branch.edit", "NY-FAM-0001", `${b.length} branches saved`); ov.close(); toast({ tone: "ok", title: "Branches saved", body: "The family context switcher picks them up on the next load." }); }}/>}
      {decision && <DecisionModal data={decision} onClose={() => setDecision(null)}/>}
      <ShutterLightbox open={lightbox} onClose={() => setLightbox(false)} index={frameIndex} onIndexChange={setFrameIndex} frames={frames}/>
    </div>
  );
}
