"use client";

import { useCallback, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Clock,
  Copy,
  Download,
  Filter,
  Fingerprint,
  Link2,
  Plus,
  QrCode,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import {
  type Allocation,
  type AuditEntry,
  type LedgerEntry,
  type OtpChannel,
  type PayChannel,
  activeCount,
  activeTotal,
  allocations as seedAllocations,
  audit as seedAudit,
  ceilings,
  channelLabel,
  frames,
  kpis,
  ledger as seedLedger,
  otpChannelLabel,
  purposeLabel,
  purposeTone,
  rules as seedRules,
  statusMeta,
  walkthrough,
} from "@/data/dashboard/finance-access";
import { kes, kesShort, clock } from "@/lib/format";
import { useToast } from "@/components/ui/overlay";
import { CountUp, Reveal, Tabs } from "@/components/ui/primitives";
import { useOverlay } from "@/components/finance-access/use-overlay";
import { ElderPhonePreview, PseudoQr, type PhoneStep } from "@/components/finance-access/phone-preview";
import {
  AllocateWizard,
  AuditDetailModal,
  CeilingMatrixModal,
  ChannelMatrixModal,
  emptyFaFilters,
  ElderViewModal,
  ExportModal,
  FiltersDrawer,
  LedgerModal,
  PinChangeModal,
  QrModal,
  RecipientPickerDrawer,
  ResendModal,
  RevokeModal,
  RulesLimitsModal,
  SettleModal,
  StatusPipeline,
  WalkthroughModal,
  type FaFilters,
  type NewAllocation,
} from "@/components/finance-access/modals";
import { AllocationDrawer } from "@/components/finance-access/drawer";
import { FrameStrip, ShutterLightbox, ShutterStage } from "@/components/contributions/shutter-gallery";

const HERO_IMG = "/images/frame-elder.jpg";

const sections = [
  { id: "s1", label: "S1 · KPIs" },
  { id: "s2", label: "S2 · Allocations" },
  { id: "s3", label: "S3 · Receive link" },
  { id: "s4", label: "S4 · Elder preview" },
  { id: "s5", label: "S5 · Link health" },
  { id: "s6", label: "S6 · Rules & limits" },
  { id: "s7", label: "S7 · Audit" },
  { id: "s8", label: "S8 · Stories" },
];

const kpiTone: Record<string, string> = {
  brand: "#1f4d3a",
  gold: "#d4a437",
  warn: "#e0a82e",
  ok: "#2e7d32",
  danger: "#c62828",
};

export default function FinanceAccessPage() {
  return <FinanceAccessView />;
}

function FinanceAccessView() {
  const toast = useToast();
  const ov = useOverlay();

  /* ---------- state ---------- */
  const [allocs, setAllocs] = useState<Allocation[]>(seedAllocations);
  const [filters, setFilters] = useState<FaFilters>(emptyFaFilters);
  const [statusTab, setStatusTab] = useState<"all" | "active" | "settled" | "dead">("all");
  const [ruleset, setRuleset] = useState(seedRules);
  const [session, setSession] = useState(0);
  const [frameIndex, setFrameIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  /* receive-link builder (S3) */
  const [linkRecipient, setLinkRecipient] = useState("e1");
  const [linkAmount, setLinkAmount] = useState("12000");
  const [linkPin, setLinkPin] = useState(true);
  const [linkOtp, setLinkOtp] = useState<OtpChannel>("sms");
  const [linkExpiry, setLinkExpiry] = useState(24);
  const [issued, setIssued] = useState<{ token: string; amount: number; recipient: string } | null>(null);
  const [reveal, setReveal] = useState(false);
  const [firing, setFiring] = useState(false);

  /* elder preview */
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("invite");
  const onPhoneState = useCallback((s: { step: PhoneStep }) => setPhoneStep(s.step), []);

  /* ---------- derived ---------- */
  const target = allocs.find((a) => a.id === ov.id) ?? null;
  const bump = () => setSession((s) => s + 1);

  const shown = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return allocs.filter((a) => {
      if (statusTab === "active" && !["link-issued", "pin-entered", "otp-verified", "released"].includes(a.status)) return false;
      if (statusTab === "settled" && a.status !== "settled") return false;
      if (statusTab === "dead" && !["expired", "failed"].includes(a.status)) return false;
      if (filters.status !== "all" && a.status !== filters.status) return false;
      if (filters.purpose !== "all" && a.purpose !== filters.purpose) return false;
      if (filters.channel !== "all" && a.channel !== filters.channel) return false;
      if (q && !`${a.recipient} ${a.ref} ${a.token} ${a.phone}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allocs, statusTab, filters]);

  const activeFilters =
    (filters.q ? 1 : 0) + (filters.status !== "all" ? 1 : 0) + (filters.purpose !== "all" ? 1 : 0) + (filters.channel !== "all" ? 1 : 0);

  const liveLinks = allocs.filter((a) => ["link-issued", "pin-entered", "otp-verified", "released"].includes(a.status));
  const pendingCount = allocs.filter((a) => ["link-issued", "pin-entered", "otp-verified"].includes(a.status)).length;
  const settledToday = allocs.filter((a) => a.status === "settled" && a.issuedAt.startsWith("18 Nov"));

  const [auditRows, setAuditRows] = useState<AuditEntry[]>(seedAudit);
  const [ledgerRows, setLedgerRows] = useState<LedgerEntry[]>(seedLedger);

  /* ---------- actions ---------- */
  const logAudit = (action: string, entity: string, detail: string, tone: AuditEntry["tone"] = "plain") => {
    setAuditRows((prev) => [
      { ref: `NY-AUD-${String(1043 + prev.length).padStart(5, "0")}`, at: "18 Nov · 09:52", actor: "Peter Wanyama Nalyanya", action, entity, detail, tone },
      ...prev,
    ]);
  };

  const issueAllocation = (a: NewAllocation) => {
    const full: Allocation = { ...a, status: "link-issued" };
    setAllocs((prev) => [full, ...prev]);
    logAudit("allocation.issue", full.ref, `KES ${full.amount.toLocaleString("en-KE")} · ${purposeLabel[full.purpose]} · PIN ${full.pinRequired ? "required" : "off"} · ${otpChannelLabel[full.otpChannel]}`, "gold");
    toast({ tone: "ok", title: "Receive link issued", body: `${full.token} · ${full.recipient} · expires in ${full.expiryInSec / 3600}h` });
  };

  const buildLink = () => {
    const amt = Number(linkAmount) || 0;
    const person = allocs.find((a) => a.id === linkRecipient);
    const name = person?.recipient ?? "Mzee Victor Nalyanya";
    const token = `NY-RCV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setIssued({ token, amount: amt, recipient: name });
    setReveal(false);
    setFiring(true);
    requestAnimationFrame(() => setReveal(true));
    window.setTimeout(() => setFiring(false), 620);
    logAudit("link.generate", token, `${kes(amt)} for ${name} · PIN ${linkPin ? "required" : "off"} · ${otpChannelLabel[linkOtp]}`, "gold");
    toast({ tone: "ok", title: "Link ready", body: `${token} · copy it or send it straight to the elder` });
  };

  const copyLink = () => {
    const value = `nalyanya.app/r/${(issued?.token ?? target?.token ?? "").replace("NY-RCV-", "").toLowerCase()}`;
    navigator.clipboard?.writeText(value).catch(() => undefined);
    toast({ tone: "info", title: "Link copied", body: value });
  };

  const settle = (a: Allocation, ref: string) => {
    setAllocs((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: "settled", settledRef: ref, expiryInSec: 0 } : x)));
    setLedgerRows((prev) => [
      { ref: `NY-LED-00046${prev.length}`, at: "18 Nov · 09:53", debit: "Allocations clearing", credit: `${channelLabel[a.channel]} · ${a.phone}`, amount: a.amount, source: a.ref },
      ...prev,
    ]);
    logAudit("allocation.settled", a.ref, `${kes(a.amount)} → ${a.phone} · ${ref} (SIMULATED)`, "gold");
    toast({ tone: "ok", title: "Marked as settled", body: `${a.ref} · ledger posted · ${ref}` });
  };

  const revoke = (a: Allocation, reason: string) => {
    setAllocs((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: "expired", expiryInSec: 0 } : x)));
    logAudit("link.revoke", a.ref, `${kes(a.amount)} · reason: ${reason}`, "red");
    toast({ tone: "warn", title: "Link revoked", body: "The elder sees a clear 'cancelled' page · the money stays in the family account" });
  };

  const resend = (a: Allocation, ch: OtpChannel) => {
    logAudit("link.resend", a.ref, `Sent again to ${a.phone} via ${otpChannelLabel[ch]} (SIMULATED)`);
    toast({ tone: "info", title: "Link sent again (SIMULATED)", body: `${a.phone} via ${otpChannelLabel[ch]}` });
  };

  const saveRules = (r: typeof seedRules) => {
    setRuleset(r);
    logAudit("rules.edit", "NY-ALC-RULES", `per-tx ${kes(r.perTxCap)} · PIN ${r.pinAttempts} tries · lock ${r.lockMinutes} min · 2FA verified`);
    toast({ tone: "ok", title: "Rules saved (SIMULATED)", body: `Per-transaction cap ${kes(r.perTxCap)}` });
  };

  const stepNames: Record<PhoneStep, string> = {
    invite: "1 · Link opened",
    pin: "2 · PIN",
    otp: "3 · Code",
    receiving: "4 · Receiving",
    success: "5 · Received",
    locked: "Locked",
  };

  return (
    <div className="page-dash-finance-access mx-auto max-w-[1500px]">
      {/* ================= HERO ================= */}
      <Reveal>
        <header className="fa-hero mb-6">
          <img src={HERO_IMG} alt="An elder's hands on the family ledger beside a mobile phone" className="fa-hero__img" fetchPriority="high" />
          <div className="fa-hero__shade" />
          <div className="fa-hero__body grid grid-cols-[minmax(0,1fr)] gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div className="min-w-0">
              <span className="gd-code">T-9 · Finance access</span>
              <h1 className="ny-display mt-3 max-w-[21ch] text-[clamp(1.9rem,4.6vw,3.3rem)] leading-[1.02] text-on-brand">
                Send an elder money with one link.
              </h1>
              <p className="mt-2.5 max-w-[58ch] text-sm leading-relaxed text-on-brand/85 sm:text-base">
                No app, no login, no account. They tap the link, enter a 4-digit PIN and a one-time code, and the money
                lands on their M-Pesa. This page shows every allocation — and exactly what they see.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-accent" onClick={() => ov.open("allocate")}>
                  <Plus className="h-4 w-4" /> Allocate money
                </button>
                <button type="button" className="ny-btn ny-btn-outline !border-on-brand/50 !text-on-brand hover:!bg-on-brand/10" onClick={() => ov.open("walkthrough")}>
                  How it works
                </button>
                <button type="button" className="ny-btn ny-btn-ghost !text-on-brand/90 hover:!bg-on-brand/10" onClick={() => ov.open("ceilings")}>
                  <Users className="h-4 w-4" /> Who can allocate
                </button>
              </div>
            </div>

            <div className="fa-glass p-4">
              <p className="ny-hud !text-on-brand/70">Available to allocate</p>
              <p className="ny-display mt-1 text-[clamp(1.6rem,3vw,2.2rem)] leading-none">
                <CountUp value={250000} prefix="KES " />
              </p>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-on-brand/20 pt-3">
                <span className="ny-hud !text-on-brand/75">Pending links</span>
                <span className="ny-chip ny-chip-warn ny-pulse">{pendingCount} waiting</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="ny-hud !text-on-brand/75">Settled today</span>
                <span className="ny-chip ny-chip-ok">
                  <CountUp value={settledToday.reduce((s, a) => s + a.amount, 0)} prefix="KES " />
                </span>
              </div>
            </div>
          </div>
        </header>
      </Reveal>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[210px_minmax(0,1fr)]">
        <nav className="cc-rail" aria-label="Section index">
          <p className="ny-hud px-2 pb-1">Sections</p>
          {sections.map((s) => (
            <a key={s.id} href={`#${s.id}`}>
              {s.label}
            </a>
          ))}
          <span className="ny-hud mt-2 border-t border-border-subtle px-2 pt-2 !text-[0.56rem]">8 sections · 16 overlays</span>
        </nav>

        <div className="min-w-0">
          {/* ================= S1 KPIs ================= */}
          <section id="s1" className="mb-8 scroll-mt-24" aria-label="Finance access KPIs">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-5">
              {kpis.map((k, i) => (
                <Reveal key={k.label} delay={i * 60}>
                  <div className="fa-kpi" style={{ ["--kpi-accent" as string]: kpiTone[k.tone] ?? "#1f4d3a" } as CSSProperties}>
                    <p className="ny-hud">{k.label}</p>
                    <p className="fa-kpi__value mt-1.5">
                      <CountUp value={k.value} prefix={"prefix" in k ? k.prefix ?? "" : ""} />
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <p className="text-xs text-text-tertiary">{k.hint}</p>
                      {"pulse" in k && k.pulse ? <span className="ny-chip ny-chip-warn ny-pulse !px-1.5">live</span> : null}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ================= S2 ALLOCATIONS ================= */}
          <section id="s2" className="mb-8 scroll-mt-24" aria-label="Allocations">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">Every allocation</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Allocations &amp; receive links</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("filters")}>
                  <Filter className="h-3.5 w-3.5" /> Filters
                  {activeFilters > 0 && <span className="ny-chip ny-chip-brand !px-1.5">{activeFilters}</span>}
                </button>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("export", { t: "Allocations" })}>
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => ov.open("allocate")}>
                  <Plus className="h-3.5 w-3.5" /> Create allocation
                </button>
              </div>
            </div>

            <div className="ny-card-flat mb-3 px-4 py-3">
              <p className="ny-hud mb-2">The life of a link</p>
              <StatusPipeline status="settled" />
            </div>

            <Tabs
              tabs={[
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "settled", label: "Settled" },
                { id: "dead", label: "Expired & failed" },
              ]}
              active={statusTab}
              onChange={(id) => setStatusTab(id as "all" | "active" | "settled" | "dead")}
            />

            <div className="cc-table-wrap ny-scroll mt-3 overflow-x-auto">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Ref</th>
                    <th>Recipient</th>
                    <th className="text-right">Amount</th>
                    <th>Purpose</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((a) => (
                    <tr key={a.id} onClick={() => ov.open("allocation", { id: a.id, t: "overview" })}>
                      <td data-label="Ref">
                        <span className="block font-semibold">{a.ref}</span>
                        <span className="fa-token ny-hud !text-[0.55rem]">{a.token}</span>
                      </td>
                      <td data-label="Recipient">
                        <span className="block font-semibold">{a.recipient}</span>
                        <span className="ny-hud !text-[0.55rem]">{a.phone}</span>
                      </td>
                      <td data-label="Amount" className="ny-num text-right font-semibold">{kes(a.amount)}</td>
                      <td data-label="Purpose">
                        <span className={`ny-chip ${purposeTone[a.purpose]}`}>{purposeLabel[a.purpose]}</span>
                      </td>
                      <td data-label="Channel">
                        <span className="ny-chip ny-chip-neutral">{channelLabel[a.channel]}</span>
                      </td>
                      <td data-label="Status">
                        <span className={`ny-chip ${statusMeta[a.status].tone}`}>{statusMeta[a.status].label}</span>
                      </td>
                      <td data-label="Expires" className="ny-num text-text-secondary">
                        {a.expiryInSec > 0 && ["link-issued", "pin-entered", "otp-verified", "released"].includes(a.status)
                          ? clock(a.expiryInSec)
                          : a.expiresAt}
                      </td>
                      <td data-label="Actions">
                        <span className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            className="ny-btn ny-btn-outline ny-btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              ov.open("qr", { id: a.id });
                            }}
                            aria-label={`Show QR for ${a.ref}`}
                          >
                            <QrCode className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className="ny-btn ny-btn-ghost ny-btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              ov.open("resend", { id: a.id });
                            }}
                            aria-label={`Resend ${a.ref}`}
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            className="ny-btn ny-btn-ghost ny-btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              ov.open("elder", { id: a.id });
                            }}
                            aria-label={`Preview elder view for ${a.ref}`}
                          >
                            <Smartphone className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {shown.length === 0 && (
                    <tr>
                      <td colSpan={8} className="!py-10 text-center">
                        <p className="ny-display text-base">No allocations match</p>
                        <p className="mt-1 text-sm text-text-secondary">Clear the filters, or send someone money with a fresh link.</p>
                        <button type="button" className="ny-btn ny-btn-accent ny-btn-sm mt-3" onClick={() => ov.open("allocate")}>
                          <Plus className="h-3.5 w-3.5" /> Create allocation
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="ny-hud mt-2">
              Click any row for the full drawer · statuses: draft → link issued → PIN entered → code verified → released → settled
            </p>
          </section>

          {/* ================= S3 RECEIVE LINK PANEL ================= */}
          <section id="s3" className="mb-8 scroll-mt-24" aria-label="Receive link builder">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S3 · Generate</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Build the receive link</h2>
                <p className="mt-1 max-w-[62ch] text-sm text-text-secondary">
                  Set it up here, watch the elder&apos;s screen on the right, and issue when it looks right. Every choice
                  below is exactly what the elder will meet.
                </p>
              </div>
              <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("channels")}>
                <ShieldCheck className="h-3.5 w-3.5" /> Rails &amp; capability
              </button>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="ny-card p-4 sm:p-5">
                <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
                  <div>
                    <label className="ny-label" htmlFor="lb-who">Who is it for?</label>
                    <select id="lb-who" className="ny-select" value={linkRecipient} onChange={(e) => setLinkRecipient(e.target.value)}>
                      {allocs.slice(0, 6).map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.recipient} · {a.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="ny-label" htmlFor="lb-amt">Amount (KES)</label>
                    <input id="lb-amt" inputMode="numeric" className="ny-input ny-num" value={linkAmount} onChange={(e) => setLinkAmount(e.target.value.replace(/[^0-9]/g, ""))} />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3">
                  <div>
                    <p className="text-sm font-semibold">Require their 4-digit PIN</p>
                    <p className="ny-hud mt-0.5 !text-[0.55rem]">
                      {ruleset.pinAttempts} tries · {ruleset.lockMinutes} minute lock
                    </p>
                  </div>
                  <button type="button" role="switch" aria-checked={linkPin} aria-label="Require PIN" className="fa-switch" onClick={() => setLinkPin((v) => !v)} />
                </div>

                <div className="mt-4">
                  <span className="ny-label">One-time code by</span>
                  <div className="flex flex-wrap gap-2">
                    {(["sms", "whatsapp", "email"] as OtpChannel[]).map((c) => (
                      <button key={c} type="button" onClick={() => setLinkOtp(c)} className={`ny-chip ny-touch ${linkOtp === c ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                        {otpChannelLabel[c]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <span className="ny-label">Link expires after</span>
                  <div className="flex flex-wrap gap-2">
                    {[6, 12, 24, 48, 72].map((h) => (
                      <button key={h} type="button" onClick={() => setLinkExpiry(h)} className={`ny-chip ny-touch ${linkExpiry === h ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                        {h}h
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" className="ny-btn ny-btn-accent" onClick={buildLink}>
                    <Link2 className="h-4 w-4" /> Generate link
                  </button>
                  <button type="button" className="ny-btn ny-btn-outline" onClick={() => ov.open("allocate")}>
                    Full wizard (8 steps) <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <aside className="fa-qr-card self-start p-4">
                <div className={`fa-reveal ${reveal ? "is-open" : ""}`}>
                  <PseudoQr value={issued?.token ?? "nalyanya.app/r/pending"} size={224} />
                </div>
                <div className={`fa-flash ${firing ? "is-firing" : ""}`} aria-hidden />
                <div className="mt-3 text-center">
                  <p className="fa-token text-sm font-semibold">
                    nalyanya.app/r/{(issued?.token ?? "NY-RCV-pending").replace("NY-RCV-", "").toLowerCase()}
                  </p>
                  <p className="ny-hud mt-1 !text-[0.55rem]">
                    {issued ? `${kes(issued.amount)} · ${issued.recipient.split(" ")[0]} · expires in ${linkExpiry}h` : "Generate a link to see it here"}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="ny-btn ny-btn-primary ny-btn-sm flex-1" onClick={copyLink} disabled={!issued}>
                    <Copy className="h-3.5 w-3.5" /> Copy link
                  </button>
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("elder", { id: allocs[0].id })}>
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="ny-chip ny-chip-sim mt-3 w-full">QR preview · SIMULATED link</p>
              </aside>
            </div>
          </section>

          {/* ================= S4 ELDER PREVIEW ================= */}
          <section id="s4" className="mb-8 scroll-mt-24" aria-label="Elder preview">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S4 · Live preview</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">What the elder sees</h2>
                <p className="mt-1 max-w-[62ch] text-sm text-text-secondary">
                  This is the real flow at <span className="fa-token font-semibold">/r/:token</span> — one question per
                  screen, big type, a PIN instead of a password. Try it; the wrong PIN three times locks it, just like
                  production.
                </p>
              </div>
              <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("elder", { id: allocs[0].id })}>
                <Sparkles className="h-3.5 w-3.5" /> Full screen
              </button>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
              <Reveal>
                <ElderPhonePreview
                  amount={Number(linkAmount) || 12000}
                  sender="Peter Wanyama"
                  phone="+2547 ··· 7890"
                  token="NY-RCV-8H2K4Q"
                  pinRequired={linkPin}
                  otpChannel={linkOtp}
                  onState={onPhoneState}
                />
              </Reveal>

              <div className="space-y-4">
                <div className="ny-card p-4 sm:p-5">
                  <p className="ny-hud">Where you are in the flow</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(Object.keys(stepNames) as PhoneStep[]).map((s) => (
                      <span key={s} className={`ny-chip ${phoneStep === s ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                        {stepNames[s]}
                      </span>
                    ))}
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="ny-inset px-3 py-2.5">
                      <dt className="ny-hud">Amount shown</dt>
                      <dd className="ny-num font-semibold">{kes(Number(linkAmount) || 12000)}</dd>
                    </div>
                    <div className="ny-inset px-3 py-2.5">
                      <dt className="ny-hud">Code channel</dt>
                      <dd className="font-semibold">{otpChannelLabel[linkOtp]}</dd>
                    </div>
                    <div className="ny-inset px-3 py-2.5">
                      <dt className="ny-hud">PIN</dt>
                      <dd className="font-semibold">{linkPin ? "Required" : "Not required"}</dd>
                    </div>
                    <div className="ny-inset px-3 py-2.5">
                      <dt className="ny-hud">Lock after</dt>
                      <dd className="ny-num font-semibold">{ruleset.pinAttempts} tries · {ruleset.lockMinutes} min</dd>
                    </div>
                  </dl>
                </div>

                <div className="ny-card p-4 sm:p-5">
                  <p className="ny-hud">Why elders can use it</p>
                  <ul className="mt-2 space-y-2 text-sm text-text-secondary">
                    {[
                      "One question per screen — no forms, no scrolling walls of text",
                      "A 4-digit PIN they already know, not a password to forget",
                      "Text at 20px and up, buttons 56px tall in Elder Mode",
                      "Works in a basic Android browser over a slow connection",
                      "If it locks, the money stays safe — nothing is ever at risk",
                    ].map((t) => (
                      <li key={t} className="flex items-start gap-2.5">
                        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {t}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("walkthrough")}>
                      See the five steps
                    </button>
                    <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => ov.open("pin")}>
                      <Fingerprint className="h-3.5 w-3.5" /> Change their PIN
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= S5 LINK HEALTH ================= */}
          <section id="s5" className="mb-8 scroll-mt-24" aria-label="Link health">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S5 · Health</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Links waiting on someone</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("channels")}>
                  Rails
                </button>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => ov.open("allocate")}>
                  <Plus className="h-3.5 w-3.5" /> New allocation
                </button>
              </div>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2 xl:grid-cols-3">
              {liveLinks.map((a, i) => {
                const urgent = a.expiryInSec < 12000 && a.expiryInSec > 0;
                return (
                  <Reveal key={a.id} delay={i * 55}>
                    <article className={`fa-link-card h-full ${urgent ? "is-urgent" : a.status === "settled" ? "is-settled" : ""}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{a.recipient}</p>
                          <p className="ny-hud mt-0.5 !text-[0.55rem]">
                            {a.ref} · {a.phone}
                          </p>
                        </div>
                        <span className={`ny-chip ${statusMeta[a.status].tone} shrink-0 ${urgent ? "ny-pulse" : ""}`}>
                          {statusMeta[a.status].label}
                        </span>
                      </div>

                      <div className="flex items-end justify-between gap-2">
                        <p className="ny-num ny-display text-xl leading-none">{kes(a.amount)}</p>
                        <p className="ny-hud flex items-center gap-1 !text-[0.56rem]">
                          <Clock className="h-3 w-3" /> {clock(a.expiryInSec)}
                        </p>
                      </div>

                      <p className="ny-hud !text-[0.55rem]">{statusMeta[a.status].hint}</p>

                      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                        <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("allocation", { id: a.id, t: "overview" })}>
                          View
                        </button>
                        <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => ov.open("resend", { id: a.id })}>
                          <Send className="h-3.5 w-3.5" /> Resend
                        </button>
                        <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => ov.open("revoke", { id: a.id })}>
                          <X className="h-3.5 w-3.5" /> Revoke
                        </button>
                      </div>
                    </article>
                  </Reveal>
                );
              })}

              {liveLinks.length === 0 && (
                <div className="ny-inset col-span-full px-6 py-12 text-center">
                  <p className="ny-display text-lg">Nothing is waiting</p>
                  <p className="mx-auto mt-1.5 max-w-sm text-sm text-text-secondary">Every link has been settled or has expired.</p>
                </div>
              )}
            </div>

            <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2">
              {allocs
                .filter((a) => a.status === "expired" || a.status === "failed")
                .map((a) => (
                  <div key={a.id} className="fa-link-card is-dead">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">{a.recipient}</p>
                        <p className="ny-hud mt-0.5 !text-[0.55rem]">{a.ref} · {kes(a.amount)}</p>
                      </div>
                      <span className={`ny-chip ${statusMeta[a.status].tone}`}>{statusMeta[a.status].label}</span>
                    </div>
                    <p className="text-sm text-text-secondary">{a.note}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => ov.open("allocate")}>
                        <RotateCwIcon /> Reissue link
                      </button>
                      <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => ov.open("allocation", { id: a.id, t: "timeline" })}>
                        See what happened
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* ================= S6 RULES & LIMITS ================= */}
          <section id="s6" className="mb-8 scroll-mt-24" aria-label="Rules and limits">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S6 · Guardrails</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Rules &amp; limits</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("ceilings")}>
                  <Users className="h-3.5 w-3.5" /> Role ceilings
                </button>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => ov.open("rules")}>
                  <Fingerprint className="h-3.5 w-3.5" /> Edit rules (2FA)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { k: "Per-transaction cap", v: kes(ruleset.perTxCap) },
                { k: "Daily cap", v: kes(ruleset.dailyCap) },
                { k: "Per-member monthly cap", v: kes(ruleset.memberMonthlyCap) },
                { k: "4-eyes above", v: kes(ruleset.fourEyesAbove) },
                { k: "PIN tries", v: `${ruleset.pinAttempts} then lock` },
                { k: "Code tries", v: `${ruleset.otpAttempts} then lock` },
                { k: "Lock length", v: `${ruleset.lockMinutes} minutes` },
                { k: "Default expiry", v: `${ruleset.defaultExpiryHrs} hours` },
              ].map((r) => (
                <div key={r.k} className="fa-rule">
                  <p className="ny-hud">{r.k}</p>
                  <p className="ny-num ny-display mt-1.5 text-lg leading-none">{r.v}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-2">
              <div className="ny-card p-4 sm:p-5">
                <p className="ny-hud">By role</p>
                <ul className="mt-2 space-y-1.5">
                  {ceilings.slice(0, 4).map((c) => (
                    <li key={c.role} className="ny-inset flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                      <span className="font-medium">{c.role}</span>
                      <span className="ny-num">{c.perTx ? kesShort(c.perTx) : "—"}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-3 w-full" onClick={() => ov.open("ceilings")}>
                  Open the full matrix
                </button>
              </div>

              <div className="ny-card p-4 sm:p-5">
                <p className="ny-hud">Safety, in plain words</p>
                <ul className="mt-2 space-y-2 text-sm text-text-secondary">
                  {[
                    "An expired link never costs the family anything — the money simply stays put",
                    "A locked link needs no manual fix; it unlocks itself in 15 minutes",
                    "Only the money-routing fields are admin-gated; everything else a member can edit",
                    "Every revoke, rules change and payout needs a reason and lands in the audit trail",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2.5">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" /> {t}
                    </li>
                  ))}
                </ul>
                <Link href="/dashboard/settings" className="ny-btn ny-btn-ghost ny-btn-sm mt-3 w-full">
                  Open settings (T-16) <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>

          {/* ================= S7 AUDIT ================= */}
          <section id="s7" className="mb-8 scroll-mt-24" aria-label="Audit trail">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S7 · Append-only</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Audit trail</h2>
              </div>
              <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => ov.open("export", { t: "Audit trail" })}>
                <Download className="h-3.5 w-3.5" /> Export
              </button>
            </div>

            <div className="cc-table-wrap">
              <ul>
                {auditRows.slice(0, 8).map((a) => (
                  <li key={a.ref}>
                    <button type="button" className="cc-audit-row w-full text-left" onClick={() => ov.open("audit", { id: a.ref })}>
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.tone === "gold" ? "bg-brand-accent" : a.tone === "red" ? "bg-danger" : "bg-text-tertiary"}`} />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-text-primary">
                          {a.action} <span className="font-normal text-text-secondary">· {a.entity}</span>
                        </span>
                        <span className="block text-sm text-text-secondary">{a.detail}</span>
                        <span className="ny-hud mt-1 block !text-[0.55rem]">
                          {a.at} · {a.actor}
                        </span>
                      </span>
                      <span className="ny-hud !text-[0.55rem]">{a.ref}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => ov.open("ledger", { id: ledgerRows[0].ref })}>
                Double-entry view
              </button>
              <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => ov.open("channels")}>
                Integration rails
              </button>
            </div>
          </section>

          {/* ================= S8 STORIES (camera pinhole) ================= */}
          <section id="s8" className="mb-8 scroll-mt-24" aria-label="Stories behind the allocations">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S8 · Camera pinhole</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Where the money actually goes</h2>
                <p className="mt-1 max-w-[62ch] text-sm text-text-secondary">
                  Step through the family photographs the way a camera does — the iris slams to a pinhole, the exposure
                  flashes, and the next frame opens up.
                </p>
              </div>
              <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => setLightbox(true)}>
                Full contact sheet
              </button>
            </div>

            <Reveal>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div>
                  <ShutterStage frames={frames} index={frameIndex} onIndexChange={setFrameIndex} />
                  <div className="mt-3">
                    <FrameStrip frames={frames} index={frameIndex} onIndexChange={setFrameIndex} />
                  </div>
                </div>
                <aside className="ny-card p-4">
                  <p className="ny-hud">Frame notes</p>
                  <ul className="mt-2 space-y-2.5">
                    {[
                      { k: "Transition", v: "iris → pinhole → flash → open" },
                      { k: "Timing", v: "400ms close · 440ms open" },
                      { k: "Depth", v: "CSS 3D perspective 1400px" },
                      { k: "A11y", v: "reduced-motion snaps instantly" },
                    ].map((n) => (
                      <li key={n.k} className="ny-inset px-3 py-2.5">
                        <span className="ny-hud block !text-[0.55rem]">{n.k}</span>
                        <span className="text-sm font-medium">{n.v}</span>
                      </li>
                    ))}
                  </ul>
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-3 w-full" onClick={() => setLightbox(true)}>
                    <Sparkles className="h-3.5 w-3.5" /> Expand
                  </button>
                  <p className="ny-hud mt-3">Drive connector SIMULATED · Phase 2 pulls the real albums</p>
                </aside>
              </div>
            </Reveal>
          </section>

          {/* ================= FOOTER ================= */}
          <Reveal>
            <footer className="rounded-xl border border-dashed border-border-strong bg-surface-2 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-text-secondary">
                  <strong className="text-text-primary">Frontend-only Phase 1.</strong> Every rail below renders fully and resolves honestly.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["M-Pesa B2C", "Bank EFT", "Africa's Talking SMS", "WhatsApp codes", "Receive-link webhooks", "PIN vault"].map((r) => (
                    <span key={r} className="ny-chip ny-chip-sim">{r}</span>
                  ))}
                </div>
              </div>
            </footer>
          </Reveal>
        </div>
      </div>

      {/* ================= OVERLAYS ================= */}
      <AllocateWizard
        key={`alloc-${ov.nonce ?? session}`}
        open={ov.key === "allocate"}
        onClose={ov.close}
        preselect={ov.id}
        onIssue={issueAllocation}
        onPickRecipient={() => ov.open("picker")}
      />

      <AllocationDrawer
        allocation={target}
        open={ov.key === "allocation"}
        onClose={ov.close}
        initialTab={ov.t ?? "overview"}
        ledger={ledgerRows}
        audit={auditRows}
        onQr={(a) => ov.open("qr", { id: a.id })}
        onResend={(a) => ov.open("resend", { id: a.id })}
        onRevoke={(a) => ov.open("revoke", { id: a.id })}
        onSettle={(a) => ov.open("settle", { id: a.id })}
        onPin={() => ov.open("pin")}
        onElder={(a) => ov.open("elder", { id: a.id })}
        onLedger={(e) => ov.open("ledger", { id: e.ref })}
        onAudit={(e) => ov.open("audit", { id: e.ref })}
      />

      <QrModal
        open={ov.key === "qr"}
        onClose={ov.close}
        allocation={target}
        onCopy={copyLink}
        onResend={() => ov.open("resend", { id: target?.id })}
      />

      <RevokeModal
        open={ov.key === "revoke"}
        onClose={ov.close}
        allocation={target}
        onConfirm={(reason) => {
          if (target) revoke(target, reason);
        }}
      />

      <ResendModal
        open={ov.key === "resend"}
        onClose={ov.close}
        allocation={target}
        onSend={(ch) => {
          if (target) resend(target, ch);
          ov.close();
        }}
      />

      <SettleModal
        open={ov.key === "settle"}
        onClose={ov.close}
        allocation={target}
        onConfirm={(ref) => {
          if (target) settle(target, ref);
        }}
      />

      <PinChangeModal
        open={ov.key === "pin"}
        onClose={ov.close}
        onSave={(pin) => {
          logAudit("pin.change", target?.ref ?? "NY-RCV", `Receive PIN updated · OTP + admin co-sign · ends ···${pin.slice(-1)}`, "gold");
          toast({ tone: "ok", title: "Receive PIN updated (SIMULATED)", body: "The old PIN stays active until the elder's next link." });
        }}
      />

      <RulesLimitsModal
        key={`rules-${ov.nonce ?? "0"}`}
        open={ov.key === "rules"}
        onClose={ov.close}
        rules={ruleset}
        onSave={saveRules}
      />

      <CeilingMatrixModal open={ov.key === "ceilings"} onClose={ov.close} />

      <ExportModal
        open={ov.key === "export"}
        onClose={ov.close}
        scope={ov.t ?? "Allocations"}
        onQueue={(format) => {
          ov.close();
          toast({ tone: "ok", title: `${format} export queued`, body: "Local stub · HMAC-signed file arrives in Phase 2" });
        }}
      />

      <FiltersDrawer open={ov.key === "filters"} onClose={ov.close} value={filters} onChange={setFilters} />

      <WalkthroughModal open={ov.key === "walkthrough"} onClose={ov.close} steps={walkthrough} />

      <ElderViewModal
        open={ov.key === "elder"}
        onClose={ov.close}
        allocation={target}
        phone={
          <ElderPhonePreview
            key={ov.nonce ?? "elder"}
            amount={target?.amount ?? 12000}
            sender="Peter Wanyama"
            phone={target?.phone ?? "+2547 ··· 7890"}
            token={target?.token ?? "NY-RCV-8H2K4Q"}
            pinRequired={target?.pinRequired ?? true}
            otpChannel={target?.otpChannel ?? "sms"}
          />
        }
      />

      <ChannelMatrixModal open={ov.key === "channels"} onClose={ov.close} />

      <AuditDetailModal
        open={ov.key === "audit"}
        onClose={ov.close}
        entry={auditRows.find((a) => a.ref === ov.id) ?? null}
      />

      <LedgerModal
        open={ov.key === "ledger"}
        onClose={ov.close}
        entry={ledgerRows.find((l) => l.ref === ov.id) ?? null}
      />

      <RecipientPickerDrawer
        open={ov.key === "picker"}
        onClose={() => ov.open("allocate")}
        onPick={(r) => {
          setLinkRecipient(r.id);
          toast({ tone: "info", title: "Recipient chosen", body: `${r.name} · ${r.phone}` });
          ov.open("allocate");
        }}
      />

      <ShutterLightbox open={lightbox} onClose={() => setLightbox(false)} index={frameIndex} onIndexChange={setFrameIndex} frames={frames} />
    </div>
  );
}

function RotateCwIcon() {
  return <ArrowRight className="h-3.5 w-3.5" aria-hidden />;
}
