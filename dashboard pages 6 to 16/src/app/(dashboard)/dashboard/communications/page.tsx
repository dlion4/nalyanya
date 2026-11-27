"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Bell, CalendarClock, Check, Download, Filter, Mail, Megaphone, MessageSquare, Plus, Send, Settings2, ShieldCheck, Smartphone, Sparkles, Users, Wallet, X } from "lucide-react";
import { CountUp, Reveal, Tabs } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlay";
import { fmt, kes } from "@/lib/format";
import {
  AS_OF,
  CHANNELS,
  CHANNEL_CAPABILITY,
  CHANNEL_LABEL,
  CHANNEL_TONE,
  SMS_COST_KES,
  auditSeed,
  audienceCounts,
  audiences,
  broadcastStats,
  broadcasts as seedBroadcasts,
  chooseReceipts,
  people,
  personOf,
  replySeeds,
  settingsSeed,
  templates as seedTemplates,
  threads as seedThreads,
  type AuditEntry,
  type Broadcast,
  type BroadcastStatus,
  type Channel,
  type Delivery,
  type Person,
  type Settings,
  type Template,
  type TemplateKind,
  type Thread,
} from "@/data/dashboard/communications";
import { useOverlay } from "@/components/communications/use-overlay";
import { ComposeWizard, type ComposeDraft } from "@/components/communications/wizards";
import { AudiencePickerDrawer, BroadcastDrawer, FiltersDrawer, ThreadDrawer, ThreadPickerDrawer, emptyBroadcastFilters, type BroadcastFilters } from "@/components/communications/drawers";
import {
  BroadcastActionModal,
  BudgetModal,
  CancelBroadcastModal,
  ChannelGuideModal,
  ContactRevealModal,
  DeliveryProofModal,
  DuplicateModal,
  MediaPickerModal,
  ProofModal,
  ReplyModal,
  RetryModal,
  ScheduleModal,
  SettingsModal,
  TemplateEditorModal,
  TemplatePreviewModal,
  TestSendModal,
} from "@/components/communications/modals";
import { AuditModal, DeleteTemplateModal, ExportModal, DecisionModal } from "@/components/communications/export-audit-modals";
import { FrameStrip, ShutterLightbox, ShutterStage } from "@/components/contributions/shutter-gallery";
import type { Frame } from "@/data/dashboard/contributions";
import { frames as storyFrames } from "@/data/dashboard/communications";

const HERO_IMG = "/images/contrib-hero.jpg";

const sections = [
  { id: "s1", label: "S1 · Broadcast KPIs" },
  { id: "s2", label: "S2 · Compose" },
  { id: "s3", label: "S3 · Broadcasts" },
  { id: "s4", label: "S4 · Detail drawer" },
  { id: "s5", label: "S5 · 1:1 threads" },
  { id: "s6", label: "S6 · Templates" },
  { id: "s7", label: "S7 · Quiet hours" },
  { id: "s8", label: "S8 · Stories" },
  { id: "s9", label: "S9 · Audit" },
];

const KPI_ACCENTS = ["#1f4d3a", "#d4a437", "#2e7d32", "#b5532a"];
const PAGE_FRAMES: Frame[] = storyFrames;
const CHANNEL_ICONS = { whatsapp: MessageSquare, sms: Smartphone, email: Mail, "in-app": Bell } as const;
const statusTone: Record<BroadcastStatus, string> = { simulated: "ny-chip-sim", scheduled: "ny-chip-warn", cancelled: "ny-chip-neutral", draft: "ny-chip-info" };
const kindTone: Record<TemplateKind, string> = { event: "ny-chip-info", funeral: "ny-chip-neutral", harambee: "ny-chip-brand", reminder: "ny-chip-warn", alert: "ny-chip-danger", general: "ny-chip-neutral" };

const replySeed = replySeeds;
const formatAt = (iso: string | null | undefined) => iso ? iso.replace("T", " · ").replace("+03:00", " EAT") : "—";

export default function CommunicationsPage() {
  return <CommunicationsView />;
}

function CommunicationsView() {
  const toast = useToast();
  const ov = useOverlay();

  /* ---------- state: local only ---------- */
  const [broadcastList, setBroadcastList] = useState<Broadcast[]>(seedBroadcasts);
  const [threadList, setThreadList] = useState<Thread[]>(seedThreads);
  const [templateList, setTemplateList] = useState<Template[]>(seedTemplates);
  const [settings, setSettings] = useState<Settings>(settingsSeed);
  const [audit, setAudit] = useState<AuditEntry[]>(auditSeed);
  const [filters, setFilters] = useState<BroadcastFilters>(emptyBroadcastFilters);
  const [selectedAudience, setSelectedAudience] = useState<string[]>(["m02", "m05", "m07", "m14"]);
  const [view, setView] = useState<"table" | "cards">("table");
  const [mediaPick, setMediaPick] = useState<string | undefined>(undefined);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [lastProof, setLastProof] = useState<{ channel: Channel; to: string; proof: string } | null>(null);
  const [decision, setDecision] = useState<{ title: string; body: string; tone: "ok" | "warn" } | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  /* ---------- overlay layers ---------- */
  const childKeys: string[] = ["cancel", "duplicate", "retry", "resend", "schedule", "proof", "reply", "audit", "test", "reveal"];
  const bottomId = ov.id;
  const bottomT = ov.t;
  const topIsChild = !!ov.topKey && childKeys.includes(ov.topKey);

  /* ---------- derived ---------- */
  const stats = broadcastStats(broadcastList);
  const current = bottomId ? broadcastList.find((b) => b.id === bottomId) ?? null : null;
  const currentThread = bottomId ? threadList.find((t) => t.id === bottomId) ?? null : null;
  const currentPerson = currentThread ? personOf(currentThread.personId) ?? null : null;
  const currentTemplate = bottomId && bottomId !== "new" ? templateList.find((t) => t.id === bottomId) ?? null : null;
  const currentReply = bottomId ? replySeed.find((r) => r.id === bottomId) ?? null : null;
  const currentReplyPerson = currentReply ? personOf(currentReply.personId) ?? null : null;
  const currentAudit = bottomId ? audit.find((a) => a.ref === bottomId) ?? null : null;

  const filteredBroadcasts = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return broadcastList.filter((b) => {
      if (filters.status !== "all" && b.status !== filters.status) return false;
      if (filters.channel !== "all" && !b.channels.includes(filters.channel)) return false;
      if (filters.kind !== "all" && b.kind !== filters.kind) return false;
      if (q && !`${b.ref} ${b.subject} ${b.excerpt} ${b.audienceLabel}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [broadcastList, filters]);

  const pendingThreads = threadList.filter((t) => t.unread > 0).length;
  const totalUnread = threadList.reduce((s, t) => s + t.unread, 0);
  const nextRef = `NY-BRD-2025-${String(185 + broadcastList.length - seedBroadcasts.length).padStart(5, "0")}`;
  const scheduledCount = broadcastList.filter((b) => b.status === "scheduled").length;
  const channelReceipt = lastProof;

  /* ---------- helpers ---------- */
  const open = (key: Parameters<typeof ov.open>[0], id?: string, t?: string) => ov.open(key, id || t ? { id, t } : undefined);
  const openTop = (key: Parameters<typeof ov.open>[0], id?: string, t?: string) => ov.openTop(key, id || t ? { id, t } : undefined);
  /* Two overlay layers: ov.key/ov.id/ov.t is the bottom (drawer); ov.topKey/topId/topT is the
     stacked child (small modal). The drawer stays mounted under a child confirm. */

  const addAudit = (action: string, entity: string, detail: string, tone: AuditEntry["tone"] = "plain") =>
    setAudit((prev) => [{ ref: `NY-AUD-${String(1172 + prev.length).padStart(5, "0")}`, at: "18 Nov · 10:55", actor: "Peter Wanyama Nalyanya", action, entity, detail, tone }, ...prev]);

  const simulateCompose = (draft: ComposeDraft) => {
    const id = `b-${Date.now().toString(36)}`;
    const n = broadcastList.length + 1;
    const ref = `NY-BRD-2025-${String(184 + n).padStart(5, "0")}`;
    const deliveries = draft.sampleDeliveries;
    const sampleN = Math.max(1, deliveries.length);
    const sd = deliveries.filter((d) => d.status === "delivered").length;
    const sf = deliveries.filter((d) => d.status === "failed").length;
    const delivered = draft.status === "scheduled" ? 0 : Math.round(draft.audienceCount * sd / sampleN);
    const failed = draft.status === "scheduled" ? 0 : Math.round(draft.audienceCount * sf / sampleN);
    const pending = draft.status === "scheduled" ? draft.audienceCount : Math.max(0, draft.audienceCount - delivered - failed);
    const b: Broadcast = { ...draft, id, ref, delivered, failed, pending, deliveries };
    setBroadcastList((prev) => [b, ...prev]);
    if (b.status === "simulated") setSettings((s) => ({ ...s, smsSpentToday: Math.min(s.smsDailyCap, s.smsSpentToday + b.smsCost) }));
    addAudit(b.status === "scheduled" ? "broadcast.schedule" : "broadcast.simulate", ref, `${b.subject} · ${b.audienceCount} recipients · ${b.channels.map((c) => CHANNEL_LABEL[c]).join(" + ")} · SIMULATED`, "gold");
    ov.close();
    toast({ tone: "info", title: b.status === "scheduled" ? "Broadcast scheduled locally" : "SIMULATED fanout complete", body: `${ref} · ${b.audienceCount} intended recipients · no message was sent` });
  };

  const openThreadFor = (person: Person) => {
    let t = threadList.find((x) => x.personId === person.id);
    if (!t) {
      t = { id: `th-${person.id}`, personId: person.id, channel: person.preferred, updatedAt: `${AS_OF}T10:55:00+03:00`, unread: 0, messages: [] };
      setThreadList((prev) => [t!, ...prev]);
    }
    window.setTimeout(() => open("thread", t!.id), 0);
  };

  const sendThreadMessage = (thread: Thread, body: string, channel: Channel) => {
    const msg = { id: `m-${Date.now().toString(36)}`, from: "me" as const, text: body, at: "just now · EAT", channel, status: "simulated" as const };
    setThreadList((prev) => prev.map((t) => t.id === thread.id ? { ...t, channel, updatedAt: `${AS_OF}T10:55:00+03:00`, messages: [...t.messages, msg] } : t));
    addAudit("thread.simulate", thread.id, `${CHANNEL_LABEL[channel]} · local reply preview · no message sent`);
    toast({ tone: "info", title: "Message preview saved", body: "SIMULATED · nothing was sent to the network" });
  };

  const resendBroadcast = (b: Broadcast) => {
    const fresh: Broadcast = {
      ...b,
      id: `b-${Date.now().toString(36)}`,
      ref: nextRef,
      status: "simulated",
      createdAt: `${AS_OF}T10:56:00+03:00`,
      sentAt: `${AS_OF}T10:56:00+03:00`,
      scheduledAt: null,
      failed: 0,
      pending: Math.round(b.audienceCount * 0.02),
      delivered: Math.round(b.audienceCount * 0.98),
      deliveries: b.deliveries.map((d) => ({ ...d, status: d.status === "failed" ? "delivered" : d.status, proof: `SIM-RETRY-${d.proof.slice(-4)}`, at: "just now · EAT" })),
    };
    setBroadcastList((prev) => [fresh, ...prev]);
    addAudit("broadcast.resimulate", fresh.ref, `Retry of ${b.ref} · ${b.audienceCount} recipients · SIMULATED`, "gold");
    ov.close();
    toast({ tone: "info", title: "Re-simulation complete", body: `${fresh.ref} · SIMULATED · no message was sent` });
  };

  const duplicateBroadcast = (b: Broadcast) => {
    const draft: Broadcast = {
      ...b,
      id: `b-${Date.now().toString(36)}`,
      ref: nextRef,
      status: "draft",
      createdAt: `${AS_OF}T10:56:00+03:00`,
      sentAt: null,
      scheduledAt: null,
      delivered: 0,
      failed: 0,
      pending: 0,
      deliveries: [],
    };
    setBroadcastList((prev) => [draft, ...prev]);
    addAudit("broadcast.duplicate", draft.ref, `Draft duplicated from ${b.ref}`);
    open("compose", draft.id);
  };

  const applyAction = (action: "cancel" | "resend" | "duplicate" | "retry", b: Broadcast) => {
    if (action === "duplicate") { duplicateBroadcast(b); return; }
    if (action === "resend") { resendBroadcast(b); return; }
    if (action === "cancel") {
      setBroadcastList((prev) => prev.map((x) => x.id === b.id ? { ...x, status: "cancelled" } : x));
      addAudit("broadcast.cancel", b.ref, "Scheduled message cancelled · local only", "red");
      ov.close();
      toast({ tone: "warn", title: "Schedule cancelled", body: `${b.ref} · nothing was sent` });
      return;
    }
    setBroadcastList((prev) => prev.map((x) => x.id === b.id ? { ...x, failed: 0, delivered: Math.min(x.audienceCount, x.delivered + x.failed), pending: x.pending, deliveries: x.deliveries.map((d) => d.status === "failed" ? { ...d, status: "delivered", proof: `SIM-RETRY-${d.proof.slice(-4)}` } : d) } : x));
    addAudit("broadcast.retry", b.ref, `${b.failed} failed recipients retried · SIMULATED`, "gold");
    ov.close();
    toast({ tone: "info", title: "Retry simulated", body: `${b.failed} failed receipts updated locally · no message was sent` });
  };

  const updateSchedule = (b: Broadcast, when: string) => {
    setBroadcastList((prev) => prev.map((x) => x.id === b.id ? { ...x, status: "scheduled", scheduledAt: when } : x));
    addAudit("broadcast.reschedule", b.ref, `New time ${when} EAT · local schedule`, "gold");
    ov.close();
    toast({ tone: "info", title: "Schedule updated locally", body: `${b.ref} · ${when.replace("T", " at ").replace("+03:00", " EAT")}` });
  };

  const saveTemplate = (t: Omit<Template, "id"> & { id?: string }) => {
    const id = t.id ?? `tpl-${Date.now().toString(36)}`;
    setTemplateList((prev) => t.id ? prev.map((x) => x.id === t.id ? { ...x, ...t, id } : x) : [{ ...t, id }, ...prev]);
    addAudit(t.id ? "template.edit" : "template.create", id, t.title);
    ov.close();
    toast({ tone: "ok", title: "Template saved", body: `${t.title} · available in quick send` });
  };

  const deleteTemplate = (tpl: Template) => {
    setTemplateList((prev) => prev.filter((x) => x.id !== tpl.id));
    addAudit("template.remove", tpl.id, `${tpl.title} removed from the library`, "red");
    ov.close();
    toast({ tone: "warn", title: "Template removed", body: "Existing broadcasts keep their original copy." });
  };

  const saveSettings = (s: Settings) => {
    setSettings(s);
    addAudit("comms.settings", "NY-COMMS-SETTINGS", `Quiet ${s.quietFrom}–${s.quietTo} · cap KES ${s.smsDailyCap} · 2FA verified`, "gold");
    ov.close();
    toast({ tone: "ok", title: "Communication rules saved", body: "SIMULATED · settings are local in Phase 1" });
  };

  const simulateTest = (proof: string) => {
    const channel = (ov.t as Channel) ?? "sms";
    setLastProof({ channel, to: channel === "email" ? "peter.wanyama@example.com" : "+254722 123 456", proof });
    open("proof", proof, channel);
  };

  /* ---------- filter results ---------- */
  const filtered = filteredBroadcasts;
  const filterCount = (filters.q ? 1 : 0) + (filters.status !== "all" ? 1 : 0) + (filters.channel !== "all" ? 1 : 0) + (filters.kind !== "all" ? 1 : 0);

  /* ---------- targets for URL overlays ---------- */
  const targetBroadcast = ov.id ? broadcastList.find((b) => b.id === ov.id) ?? null : null;
  const targetThread = ov.id ? threadList.find((t) => t.id === ov.id) ?? null : null;
  const targetPerson = targetThread ? personOf(targetThread.personId) ?? null : null;
  const targetTemplate = ov.id && ov.id !== "new" ? templateList.find((t) => t.id === ov.id) ?? null : null;
  const targetReply = ov.id ? replySeed.find((r) => r.id === ov.id) ?? null : null;
  const targetReplyPerson = targetReply ? personOf(targetReply.personId) ?? null : null;
  const targetAudit = ov.id ? audit.find((a) => a.ref === ov.id) ?? null : null;
  const targetProof = lastProof;
  const targetProofChannel = (ov.t as Channel | null) ?? targetProof?.channel ?? "sms";
  const audienceSeedIds = selectedAudience;
  const templateCount = templateList.length;

  /* ================================================================== */
  return (
    <div className="page-dash-communications mx-auto max-w-[1500px]">
      {/* ================= HERO ================= */}
      <Reveal>
        <header className="cm-hero mb-6">
          <img src={HERO_IMG} alt="Family members gathered around a harambee table" className="cm-hero__img" fetchPriority="high" />
          <div className="cm-hero__shade" />
          <div className="cm-hero__body grid grid-cols-[minmax(0,1fr)] gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end">
            <div className="min-w-0">
              <span className="gd-code">T-14 · Communications</span>
              <h1 className="ny-display mt-3 max-w-[22ch] text-[clamp(1.9rem,4.6vw,3.3rem)] leading-[1.02] text-on-brand">
                One message. Everyone who needs it.
              </h1>
              <p className="mt-2.5 max-w-[60ch] text-sm leading-relaxed text-on-brand/85 sm:text-base">
                Reunions, funerals, harambees and reminders — one composer routes to WhatsApp, SMS, email and in-app by each
                member&apos;s preference. Every send is clearly <strong>SIMULATED</strong> in Phase 1.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-accent" onClick={() => open("compose")}>
                  <Plus className="h-4 w-4" /> Compose a broadcast
                </button>
                <button type="button" className="ny-btn ny-btn-outline !border-on-brand/50 !text-on-brand hover:!bg-on-brand/10" onClick={() => open("thread-picker")}>
                  <MessageSquare className="h-4 w-4" /> Write to one person
                </button>
                <button type="button" className="ny-btn ny-btn-ghost !text-on-brand/90 hover:!bg-on-brand/10" onClick={() => open("channel-guide")}>
                  <ShieldCheck className="h-4 w-4" /> Channel guide
                </button>
              </div>
            </div>

            <div className="cm-glass p-4">
              <p className="ny-hud !text-on-brand/70">Family reached this month</p>
              <p className="ny-display mt-1 text-[clamp(1.6rem,3vw,2.2rem)] leading-none">
                <CountUp value={stats.reached} />
              </p>
              <p className="mt-1.5 text-xs text-on-brand/75">intended recipients · {stats.sent} simulated fanouts</p>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-on-brand/20 pt-3">
                <span className="ny-hud !text-on-brand/75">Delivery estimate</span>
                <span className="ny-chip ny-chip-ok">{stats.rate}%</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="ny-hud !text-on-brand/75">In flight / scheduled</span>
                <span className="ny-chip ny-chip-warn ny-pulse">{stats.pending}</span>
              </div>
            </div>
          </div>
        </header>
      </Reveal>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[210px_minmax(0,1fr)]">
        <nav className="cc-rail" aria-label="Section index">
          <p className="ny-hud px-2 pb-1">Sections</p>
          {sections.map((s) => <a key={s.id} href={`#${s.id}`}>{s.label}</a>)}
          <span className="ny-hud mt-2 border-t border-border-subtle px-2 pt-2 !text-[0.56rem]">9 sections · 20+ overlays</span>
        </nav>

        <div className="min-w-0">
          {/* ================= S1 KPI ================= */}
          <section id="s1" className="mb-8 scroll-mt-24" aria-label="Broadcast KPIs">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: "Broadcasts this month", value: stats.sent, hint: "SIMULATED fanouts", accent: KPI_ACCENTS[0] },
                { label: "Recipients reached", value: stats.reached, hint: "intended, across all routes", accent: KPI_ACCENTS[1] },
                { label: "Delivery estimate", value: stats.rate, suffix: "%", hint: `${stats.failed} simulated failures in the sample`, accent: KPI_ACCENTS[2] },
                { label: "Pending / in flight", value: stats.pending, hint: `${scheduledCount} scheduled locally`, accent: KPI_ACCENTS[3], pulse: stats.pending > 0 },
              ].map((k, i) => (
                <Reveal key={k.label} delay={i * 60}>
                  <div className="cm-kpi" style={{ ["--kpi-accent" as string]: k.accent } as CSSProperties}>
                    <p className="ny-hud">{k.label}</p>
                    <p className="cm-kpi__value mt-1.5"><CountUp value={k.value} suffix={k.suffix ?? ""} /></p>
                    <p className="mt-1.5 flex items-center gap-2 text-xs text-text-tertiary">{k.hint}{k.pulse && <span className="ny-chip ny-chip-warn ny-pulse !px-1.5">live</span>}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* ================= S2 COMPOSER ================= */}
          <section id="s2" className="mb-8 scroll-mt-24" aria-label="Broadcast composer">
            <div className="cc-sec-head">
              <div>
                <p className="ny-hud">S2 · The core</p>
                <h2 className="ny-display text-[1.45rem] leading-tight">Broadcast composer</h2>
                <p className="mt-1 max-w-[66ch] text-sm text-text-secondary">Choose an audience, then let the family&apos;s channel preferences route the message. Review the SMS cost before simulating.</p>
              </div>
              <div className="flex gap-2">
                <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => open("audience")}><Users className="h-3.5 w-3.5"/>Custom audience</button>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("compose")}><Plus className="h-3.5 w-3.5"/>Full composer</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_310px]">
              <div className="ny-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="ny-hud">Quick send · prefilled templates</p>
                  <span className="ny-chip ny-chip-sim">Send is SIMULATED</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {templateList.slice(0, 7).map((t) => <button key={t.id} type="button" onClick={() => open("compose", undefined, t.id)} className="ny-chip ny-chip-neutral ny-touch hover:-translate-y-0.5">{t.title}</button>)}
                </div>
                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {[
                    { title: "Reunion RSVP closes Friday", body: "All 12 branches · event attendees · WhatsApp + SMS", t: "tpl-reunion" },
                    { title: "School fees funded", body: "Bungoma + Trans-Nzoia · WhatsApp + in-app", t: "tpl-school" },
                  ].map((q) => <button key={q.title} type="button" onClick={() => open("compose", undefined, q.t)} className="gd-section-item text-left"><span><span className="block font-semibold">{q.title}</span><span className="ny-hud block !text-[0.52rem]">{q.body}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-brand-primary"/></button>)}
                </div>
                <button type="button" className="ny-btn ny-btn-accent mt-4 w-full" onClick={() => open("compose")}><Megaphone className="h-4 w-4"/> Compose from scratch</button>
              </div>

              <aside className="ny-card p-4">
                <p className="ny-hud">Default routing preview</p>
                <h3 className="ny-display text-lg">243 family members</h3>
                <div className="mt-3 space-y-2">
                  {[
                    ["WhatsApp-capable", 155, "var(--color-success)"],
                    ["SMS fallback", 88, "var(--color-brand-accent)"],
                    ["Email for long-form", 117, "var(--color-info)"],
                    ["In-app always", 243, "var(--color-brand-primary)"],
                  ].map(([l, n, col]) => <div key={String(l)}><div className="mb-1 flex items-center justify-between gap-2"><span className="ny-hud !text-[0.52rem]">{l}</span><span className="ny-num text-xs font-semibold">{n}</span></div><div className="cm-route-track"><span className="cm-route-fill block h-full" style={{ width: `${(Number(n) / 243) * 100}%`, background: String(col) }}/></div></div>)}
                </div>
                <div className="ny-inset mt-4 px-3 py-2.5 text-xs text-text-secondary">
                  Approx. SMS cost if all 243 received one segment: <span className="ny-num font-semibold text-text-primary">KES {(88 * SMS_COST_KES).toFixed(2)}</span> · SIMULATED
                </div>
                <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm mt-3 w-full" onClick={() => open("channel-guide")}>How routing works</button>
              </aside>
            </div>
          </section>

          {/* ================= S3 BROADCAST TABLE ================= */}
          <section id="s3" className="mb-8 scroll-mt-24" aria-label="Broadcast history">
            <div className="cc-sec-head">
              <div><p className="ny-hud">S3 · Broadcasts</p><h2 className="ny-display text-[1.45rem] leading-tight">Broadcast history</h2></div>
              <div className="flex flex-wrap items-center gap-2"><span className="ny-hud">{filteredBroadcasts.length} of {broadcastList.length}</span><button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={()=>open("filters")}><Filter className="h-3.5 w-3.5"/>Filters</button><button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={()=>open("export")}><Download className="h-3.5 w-3.5"/>Export</button></div>
            </div>
            <div className="cc-table-wrap ny-scroll overflow-x-auto">
              <table className="cc-table">
                <thead><tr><th>Ref</th><th>Subject</th><th>Audience</th><th>Channels</th><th>Sent / scheduled</th><th>Delivered</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>{filteredBroadcasts.map((b)=> (
                  <tr key={b.id} className="cm-broadcast" onClick={()=>open("broadcast",b.id,"overview")}>
                    <td data-label="Ref" className="ny-hud !text-[0.58rem]">{b.ref}</td>
                    <td data-label="Subject"><span className="block max-w-[260px] truncate font-semibold">{b.subject}</span><span className="ny-hud block !text-[0.5rem]">{b.excerpt}</span></td>
                    <td data-label="Audience"><span className="block text-sm font-medium">{b.audienceLabel}</span><span className="ny-num ny-hud !text-[0.5rem]">{b.audienceCount} people</span></td>
                    <td data-label="Channels"><span className="flex flex-wrap gap-1">{b.channels.map(c=><span key={c} className={`ny-chip ${CHANNEL_TONE[c]}`}>{CHANNEL_LABEL[c]}</span>)}</span></td>
                    <td data-label="Sent / scheduled" className="ny-num whitespace-nowrap">{b.sentAt ? formatAt(b.sentAt) : b.scheduledAt ? formatAt(b.scheduledAt) : "draft"}</td>
                    <td data-label="Delivered"><span className="ny-num font-semibold">{b.delivered}/{b.audienceCount}</span><span className="ny-hud ml-1 !text-[0.5rem]">{b.failed ? `${b.failed} failed` : ""}</span></td>
                    <td data-label="Status"><span className={`ny-chip ${statusTone[b.status]}`}>{b.status === "simulated" ? "SIMULATED" : b.status}</span></td>
                    <td data-label="Actions" onClick={e=>e.stopPropagation()}><span className="flex flex-wrap gap-1"><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2" onClick={()=>open("broadcast",b.id,"overview")}>View</button>{b.status==="simulated"&&<button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2" onClick={()=>open("retry",b.id)}>Retry</button>}{b.status==="scheduled"&&<button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2" onClick={()=>open("cancel",b.id)}>Cancel</button>}<button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2" onClick={()=>open("duplicate",b.id)}>Copy</button></span></td>
                  </tr>
                ))}{filteredBroadcasts.length===0&&<tr><td colSpan={8} className="!py-10 text-center"><p className="ny-display text-base">No broadcasts match</p><button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-3" onClick={()=>setFilters(emptyBroadcastFilters)}>Clear filters</button></td></tr>}</tbody>
              </table>
            </div>
          </section>

          {/* ================= S4 DETAIL DRAWER LAUNCHER ================= */}
          <section id="s4" className="mb-8 scroll-mt-24" aria-label="Broadcast details">
            <div className="cc-sec-head"><div><p className="ny-hud">S4 · Inspect</p><h2 className="ny-display text-[1.45rem] leading-tight">Open a broadcast</h2><p className="mt-1 text-sm text-text-secondary">Four tabs: overview, recipients, delivery proofs and replies.</p></div></div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{broadcastList.slice(0,4).map((b,i)=><Reveal key={b.id} delay={i*50}><button type="button" className="gd-section-item w-full text-left" onClick={()=>open("broadcast",b.id,"overview")}><span className="min-w-0"><span className="block truncate font-semibold">{b.subject}</span><span className="ny-hud block !text-[0.52rem]">{b.ref} · {b.audienceLabel} · {b.delivered}/{b.audienceCount}</span></span><span className={`ny-chip shrink-0 ${statusTone[b.status]}`}>{b.status==="simulated"?"SIMULATED":b.status}</span></button></Reveal>)}</div>
          </section>

          {/* ================= S5 1:1 THREADS ================= */}
          <section id="s5" className="mb-8 scroll-mt-24" aria-label="One-to-one messages">
            <div className="cc-sec-head"><div><p className="ny-hud">S5 · One person at a time</p><h2 className="ny-display text-[1.45rem] leading-tight">1:1 conversations</h2><p className="mt-1 text-sm text-text-secondary">SMS and WhatsApp are simulated · replies in these threads are local examples.</p></div><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={()=>open("thread-picker")}><Plus className="h-3.5 w-3.5"/>New message</button></div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_330px]">
              <div className="flex flex-col gap-2">{threadList.map(t=>{const person=personOf(t.personId);const last=t.messages[t.messages.length-1];if(!person)return null;return <button key={t.id} type="button" className="gd-section-item w-full text-left" onClick={()=>open("thread",t.id)}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-primary text-xs font-bold text-on-brand">{person.initials}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold">{person.name}</span><span className="ny-hud shrink-0 !text-[0.5rem]">{formatAt(t.updatedAt)}</span></span><span className="block truncate text-sm text-text-secondary">{last?.text??"No messages yet"}</span></span><span className="flex shrink-0 flex-col items-end gap-1"><span className={`ny-chip ${CHANNEL_TONE[t.channel]}`}>{CHANNEL_LABEL[t.channel]}</span>{t.unread>0&&<span className="ny-chip ny-chip-warn !px-1.5">{t.unread} new</span>}</span></button>})}</div>
              <aside className="ny-card p-4"><p className="ny-hud">How 1:1 routing works</p><ul className="mt-3 space-y-2 text-sm text-text-secondary">{["WhatsApp if the person has it", "SMS if they do not", "Email for a long note", "In-app always if they have an account"].map((x,i)=><li key={x} className="flex items-center gap-2"><span className="ny-num grid h-5 w-5 place-items-center rounded-full bg-surface-2 text-[0.6rem] font-bold">{i+1}</span>{x}</li>)}</ul><p className="ny-chip ny-chip-sim mt-4">No message is sent in Phase 1</p></aside>
            </div>
          </section>

          {/* ================= S6 TEMPLATES ================= */}
          <section id="s6" className="mb-8 scroll-mt-24" aria-label="Templates and quick send">
            <div className="cc-sec-head"><div><p className="ny-hud">S6 · Saved copy</p><h2 className="ny-display text-[1.45rem] leading-tight">Templates &amp; quick send</h2></div><button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={()=>open("template-edit","new")}><Plus className="h-3.5 w-3.5"/>New template</button></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{templateList.map((t,i)=><Reveal key={t.id} delay={i*35} className="h-full"><article className="cm-template"><div className="relative">{t.media?<img src={t.media} alt="" className="cm-template__image" loading="lazy"/>:<div className="cm-template__image grid place-items-center bg-surface-2"><MessageSquare className="h-6 w-6 text-text-tertiary"/></div>}<span className={`ny-chip ${kindTone[t.kind]} absolute left-2 top-2`}>{t.kind}</span></div><div className="flex flex-1 flex-col gap-2 p-3.5"><h3 className="ny-display text-sm leading-tight">{t.title}</h3><p className="ny-hud line-clamp-2 !text-[0.5rem]">{t.hint}</p><p className="line-clamp-3 text-xs leading-relaxed text-text-secondary">{t.body}</p><div className="mt-auto flex flex-wrap gap-1">{t.channels.map(c=><span key={c} className={`ny-chip ${CHANNEL_TONE[c]} !text-[0.48rem]`}>{CHANNEL_LABEL[c]}</span>)}</div><div className="flex gap-1.5 pt-1"><button type="button" className="ny-btn ny-btn-primary ny-btn-sm flex-1" onClick={()=>open("compose",undefined,t.id)}>Use</button><button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={()=>open("template",t.id)}>Preview</button><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2" onClick={()=>open("template-edit",t.id)} aria-label={`Edit ${t.title}`}>Edit</button></div></div></article></Reveal>)}</div>
          </section>

          {/* ================= S7 QUIET HOURS & RATES ================= */}
          <section id="s7" className="mb-8 scroll-mt-24" aria-label="Quiet hours and rate limits">
            <div className="cc-sec-head"><div><p className="ny-hud">S7 · Guardrails</p><h2 className="ny-display text-[1.45rem] leading-tight">Quiet hours &amp; rate limits</h2><p className="mt-1 text-sm text-text-secondary">EAT time · critical alerts can break through only if the family head allows it.</p></div><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={()=>open("budget")}><Settings2 className="h-3.5 w-3.5"/>Edit rules (2FA)</button></div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="ny-card p-4 sm:p-5 lg:col-span-7"><p className="ny-hud">Current rules</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{[["Quiet hours",`${settings.quietFrom}–${settings.quietTo} EAT`],["SMS daily cap",kes(settings.smsDailyCap)],["Spent today",kes(settings.smsSpentToday)],["SMS left",kes(Math.max(0,settings.smsDailyCap-settings.smsSpentToday))],["Retry policy",`${settings.retryCount} · ${settings.retryAfterMin} min`],["Fallback",settings.fallback?"Push → SMS":"Off"]].map(([k,v])=><div key={k} className="ny-inset px-3 py-2.5"><p className="ny-hud !text-[0.5rem]">{k}</p><p className="ny-num mt-0.5 text-sm font-semibold">{v}</p></div>)}</div><div className="mt-4 flex flex-wrap gap-2"><button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={()=>open("budget")}><Wallet className="h-3.5 w-3.5"/>SMS budget guard</button><button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={()=>open("test","","sms")}><Send className="h-3.5 w-3.5"/>Test SMS</button><button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={()=>open("test","","whatsapp")}><Send className="h-3.5 w-3.5"/>Test WhatsApp</button><button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={()=>open("test","","email")}><Send className="h-3.5 w-3.5"/>Test email</button></div></div>
              <div className="rc-card flex flex-col gap-3 lg:col-span-5"><p className="ny-hud">Channel costs · estimate</p>{CHANNELS.map(c=><div key={c} className="flex items-center justify-between gap-3"><span className="flex min-w-0 items-center gap-2"><span className={`ny-chip ${CHANNEL_TONE[c]}`}>{CHANNEL_LABEL[c]}</span><span className="ny-hud truncate !text-[0.5rem]">{CHANNEL_CAPABILITY[c]}</span></span><span className="ny-num shrink-0 text-xs font-semibold">{c==="sms"?`KES ${SMS_COST_KES.toFixed(2)}/SMS`:c==="in-app"?"local":"SIMULATED"}</span></div>)}<button type="button" className="ny-btn ny-btn-ghost ny-btn-sm mt-auto w-full" onClick={()=>open("channel-guide")}>Channel capability guide</button><p className="ny-chip ny-chip-sim">Cost is a preview · not a provider quote</p></div>
            </div>
          </section>

          {/* ================= S8 STORIES ================= */}
          <section id="s8" className="mb-8 scroll-mt-24" aria-label="Stories behind communications">
            <div className="cc-sec-head"><div><p className="ny-hud">S8 · Camera pinhole</p><h2 className="ny-display text-[1.45rem] leading-tight">The people behind every message</h2><p className="mt-1 max-w-[62ch] text-sm text-text-secondary">The iris closes to a pinhole, the exposure flashes, and the next family photograph opens.</p></div><button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={()=>setLightbox(true)}>Full contact sheet</button></div>
            <Reveal><div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_260px]"><div className="min-w-0"><ShutterStage frames={PAGE_FRAMES} index={frameIndex} onIndexChange={setFrameIndex}/><div className="mt-3"><FrameStrip frames={PAGE_FRAMES} index={frameIndex} onIndexChange={setFrameIndex}/></div></div><aside className="ny-card p-4"><p className="ny-hud">Frame notes</p><ul className="mt-2 space-y-2.5">{[{k:"Transition",v:"iris, pinhole, flash, open"},{k:"Timing",v:"400ms close · 440ms open"},{k:"Depth",v:"CSS 3D perspective 1400px"},{k:"Accessibility",v:"reduced motion snaps instantly"}].map(x=><li key={x.k} className="ny-inset px-3 py-2.5"><span className="ny-hud block !text-[0.55rem]">{x.k}</span><span className="text-sm font-medium">{x.v}</span></li>)}</ul><button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-3 w-full" onClick={()=>setLightbox(true)}><Sparkles className="h-3.5 w-3.5"/>Expand</button><p className="ny-hud mt-3">Drive connector SIMULATED · Phase 2</p></aside></div></Reveal>
          </section>

          {/* ================= S9 AUDIT ================= */}
          <section id="s9" className="mb-8 scroll-mt-24" aria-label="Communication audit">
            <div className="cc-sec-head"><div><p className="ny-hud">S9 · Append-only</p><h2 className="ny-display text-[1.45rem] leading-tight">Communication audit</h2></div><span className="ny-chip ny-chip-sim">SIMULATED event log</span></div>
            <div className="cc-table-wrap"><ul>{audit.map(a=><li key={a.ref}><button type="button" className="cc-audit-row w-full text-left" onClick={()=>open("audit",a.ref)}><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.tone==="gold"?"bg-brand-accent":a.tone==="red"?"bg-danger":"bg-text-tertiary"}`}/><span className="min-w-0"><span className="block text-sm font-semibold">{a.action} <span className="font-normal text-text-secondary">· {a.entity}</span></span><span className="block text-sm text-text-secondary">{a.detail}</span><span className="ny-hud mt-1 block !text-[0.52rem]">{a.at} · {a.actor}</span></span><span className="ny-hud !text-[0.52rem]">{a.ref}</span></button></li>)}</ul></div>
          </section>

          <Reveal><footer className="rounded-xl border border-dashed border-border-strong bg-surface-2 px-5 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-text-secondary"><strong className="text-text-primary">Frontend-only Phase 1.</strong> All four rails are SIMULATED.</p><div className="flex flex-wrap gap-1.5">{CHANNELS.map(c=><span key={c} className="ny-chip ny-chip-sim">{CHANNEL_LABEL[c]}</span>)}</div></div></footer></Reveal>
        </div>
      </div>

      {/* URL-driven primary overlays */}
      {ov.key === "compose" && <ComposeWizard key={`compose-${ov.nonce??"0"}`} settings={settings} preTemplate={ov.t} prefill={ov.id?broadcastList.find(b=>b.id===ov.id)??null:null} initialSelected={selectedAudience} initialMedia={mediaPick} ref={nextRef} onClose={ov.close} onSubmit={simulateCompose}/>}
      <BroadcastDrawer broadcast={current} open={(ov.key==="broadcast"||topIsChild)&&!!current} onClose={ov.close} onResend={b=>open("resend",b.id)} onDuplicate={b=>open("duplicate",b.id)} onCancel={b=>open("cancel",b.id)} onReceipt={(d,p)=>open("proof",`${current?.id??""}~${d.personId}~${d.channel}`)} onReply={(r,p)=>open("reply",r.id)}/>
      <ThreadDrawer thread={currentThread} person={currentPerson} onClose={ov.close} onSend={(text,ch)=>currentThread&&sendThreadMessage(currentThread,text,ch)} onReveal={()=>currentPerson&&open("reveal",currentPerson.id)}/>
      <FiltersDrawer open={ov.key==="filters"} value={filters} onChange={setFilters} matched={filteredBroadcasts.length} onClose={ov.close}/>
      {ov.key === "audience" && <AudiencePickerDrawer selected={selectedAudience} onClose={ov.close} onApply={ids=>{setSelectedAudience(ids);ov.close();toast({tone:"info",title:"Custom audience saved",body:`${ids.length} members selected for the next compose`})}}/>}
      {ov.key==="thread-picker"&&<ThreadPickerDrawer open onClose={ov.close} onPick={openThreadFor}/>}

      {/* Standalone modals */}
      {ov.key==="test"&&<TestSendModal channel={(ov.t as Channel)??"sms"} onClose={ov.close} onComplete={simulateTest}/>}
      {ov.key==="proof"&&targetProof&&<ProofModal channel={targetProofChannel} to={targetProof.to} proof={targetProof.proof} onClose={ov.close}/>}
      {ov.key==="template-edit"&&<TemplateEditorModal template={ov.id==="new"?null:currentTemplate} onClose={ov.close} onSave={saveTemplate}/>}
      {ov.key==="template"&&currentTemplate&&<TemplatePreviewModal template={currentTemplate} onClose={ov.close} onUse={()=>open("compose",undefined,currentTemplate.id)}/>}
      {ov.key==="template-delete"&&currentTemplate&&<DeleteTemplateModal template={currentTemplate} onClose={ov.close} onConfirm={()=>deleteTemplate(currentTemplate)}/>}
      {ov.key==="cancel"&&current&&<CancelBroadcastModal broadcast={current} onClose={ov.close} onConfirm={()=>applyAction("cancel",current)}/>}
      {ov.key==="duplicate"&&current&&<DuplicateModal broadcast={current} onClose={ov.close} onDuplicate={()=>duplicateBroadcast(current)}/>}
      {ov.key==="resend"&&current&&<RetryModal broadcast={current} onClose={ov.close} onRetry={()=>applyAction("retry",current)}/>}
      {ov.key==="schedule"&&current&&<ScheduleModal broadcast={current} onClose={ov.close} onSave={when=>updateSchedule(current,when)}/>}
      {ov.key==="budget"&&<BudgetModal settings={settings} onClose={ov.close} onSettings={()=>open("channel-guide")}/>}
      {ov.key==="channel-guide"&&<ChannelGuideModal onClose={ov.close} onTest={c=>open("test",undefined,c)}/>}
      {ov.key==="media"&&<MediaPickerModal onClose={ov.close} onPick={src=>{setMediaPick(src);toast({tone:"info",title:"Photo selected",body:src?"Available as the next compose’s preview image":"No image selected"})}}/>}
      {ov.key==="export"&&<ExportModal broadcasts={broadcastList} onClose={ov.close} onQueue={f=>{ov.close();toast({tone:"ok",title:`${f} export queued`,body:"SIMULATED · file generation connects in Phase 2"})}}/>}
      {ov.key==="reply"&&targetReply&&targetReplyPerson&&<ReplyModal reply={targetReply} person={targetReplyPerson} onClose={ov.close} onOpenThread={()=>openThreadFor(targetReplyPerson)}/>}
      {ov.key==="audit"&&currentAudit&&<AuditModal entry={currentAudit} onClose={ov.close}/>}
      {ov.key==="reveal"&&targetPerson&&<ContactRevealModal person={targetPerson} onClose={ov.close} onReveal={()=>{setRevealed(prev=>prev.includes(targetPerson.id)?prev:[...prev,targetPerson.id]);addAudit("contact.reveal",targetPerson.id,`Contact revealed to Peter W. · SIMULATED`,`gold`);ov.close();toast({tone:"info",title:"Contact details revealed",body:"Reveal is logged · no call was placed"})}}/>}
      {decision&&<DecisionModal data={decision} onClose={()=>setDecision(null)}/>}
      <ShutterLightbox open={lightbox} onClose={()=>setLightbox(false)} index={frameIndex} onIndexChange={setFrameIndex} frames={PAGE_FRAMES}/>
    </div>
  );
}
