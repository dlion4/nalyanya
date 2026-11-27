"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Clock3, ImagePlus, Loader2, Megaphone, Users } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import { fmt, kes } from "@/lib/format";
import {
  AS_OF,
  CHANNELS,
  CHANNEL_CAPABILITY,
  CHANNEL_LABEL,
  SMS_COST_KES,
  audienceCounts,
  audiences,
  chooseReceipts,
  people,
  resolveSample,
  safeMerge,
  templates,
  type AudienceKey,
  type AudienceSpec,
  type Broadcast,
  type Channel,
  type Settings,
  type TemplateKind,
} from "@/data/dashboard/communications";
import { Stepper } from "@/components/ui/primitives";

const STEPS = ["Audience", "Channels", "Message", "Schedule", "Review"];
const BRANCHES = ["Nairobi", "Bungoma", "Kakamega", "Trans-Nzoia", "Diaspora"] as const;

export type ComposeDraft = Omit<Broadcast, "id" | "ref" | "delivered" | "failed" | "pending" | "deliveries"> & {
  sampleDeliveries: Broadcast["deliveries"];
};

function routedCounts(spec: AudienceSpec, selected: Channel[], body: string) {
  const counts = audienceCounts(spec);
  const sms = selected.includes("sms")
    ? selected.includes("whatsapp")
      ? counts.sms
      : counts.total
    : 0;
  const wa = selected.includes("whatsapp") ? counts.whatsapp : 0;
  const email = selected.includes("email") ? counts.email : 0;
  const inapp = selected.includes("in-app") ? counts.inApp : 0;
  const segments = Math.max(1, Math.ceil(body.length / 160));
  const smsCost = Math.round(sms * segments * SMS_COST_KES * 100) / 100;
  return { counts, sms, wa, email, inapp, segments, smsCost, totalRouted: Math.max(wa, sms) + email + inapp };
}

function isQuiet(time: string, from: string, to: string): boolean {
  const [h, m] = time.split(":").map(Number);
  const [fh, fm] = from.split(":").map(Number);
  const [th, tm] = to.split(":").map(Number);
  const cur = h * 60 + m;
  const start = fh * 60 + fm;
  const end = th * 60 + tm;
  return start > end ? cur >= start || cur < end : cur >= start && cur < end;
}

/* ------------------------------------------------------------------ */
/* Compose broadcast — audience → rails → copy → schedule → review.       */
/* ------------------------------------------------------------------ */
export function ComposeWizard({
  settings,
  preTemplate,
  prefill,
  initialSelected,
  initialMedia,
  ref,
  onClose,
  onSubmit,
}: {
  settings: Settings;
  preTemplate?: string | null;
  prefill?: Broadcast | null;
  initialSelected?: string[];
  initialMedia?: string;
  ref: string;
  onClose: () => void;
  onSubmit: (d: ComposeDraft) => void;
}) {
  const initialTemplate = templates.find((t) => t.id === preTemplate);
  const [step, setStep] = useState(0);
  const [audience, setAudience] = useState<AudienceKey>(prefill?.audienceKey ?? (initialSelected?.length ? "selected" : "all"));
  const [branches, setBranches] = useState<string[]>(prefill?.branches ?? []);
  const [role, setRole] = useState<string>("Elder");
  const [selectedPeople, setSelectedPeople] = useState<string[]>(initialSelected ?? ["m02", "m05", "m07", "m14"]);
  const [customLabel, setCustomLabel] = useState(prefill?.audienceLabel ?? "Nairobi elders");
  const [channels, setChannels] = useState<Channel[]>(prefill?.channels ?? initialTemplate?.channels ?? ["whatsapp", "sms", "in-app"]);
  const [kind, setKind] = useState<TemplateKind>(prefill?.kind ?? initialTemplate?.kind ?? "general");
  const [templateId, setTemplateId] = useState<string | undefined>(prefill?.templateId ?? initialTemplate?.id);
  const [subject, setSubject] = useState(prefill?.subject ?? initialTemplate?.subject ?? "");
  const [body, setBody] = useState(prefill?.body ?? initialTemplate?.body ?? "");
  const [media, setMedia] = useState<string | undefined>(prefill?.media ?? initialTemplate?.media ?? initialMedia);
  const [schedule, setSchedule] = useState<"now" | "later">(prefill?.status === "scheduled" ? "later" : "now");
  const [date, setDate] = useState(prefill?.scheduledAt?.slice(0, 10) ?? "2025-11-20");
  const [time, setTime] = useState(prefill?.scheduledAt?.slice(11, 16) ?? "08:30");
  const [busy, setBusy] = useState(false);
  const [quietOverride, setQuietOverride] = useState(false);

  const spec: AudienceSpec = {
    key: audience,
    branches: branches as AudienceSpec["branches"],
    role: (audience === "role" ? role : "all") as AudienceSpec["role"],
    selected: audience === "selected" ? selectedPeople : [],
    eventOnly: audience === "event",
  };
  const counts = audienceCounts(spec);
  const routeRaw = routedCounts(spec, channels, body);
  const routes: Record<Channel, number> = { whatsapp: routeRaw.wa, sms: routeRaw.sms, email: routeRaw.email, "in-app": routeRaw.inapp };
  const sample = resolveSample(spec);
  const previewPerson = sample[0] ?? people[0];
  const preview = safeMerge(body || "Write a message to preview it here, {first_name}.", previewPerson);
  const critical = kind === "alert";
  const scheduledQuiet = schedule === "later" && settings.quietOn && isQuiet(time, settings.quietFrom, settings.quietTo) && !critical;
  const smsOverBudget = routeRaw.smsCost > Math.max(0, settings.smsDailyCap - settings.smsSpentToday);
  const sampleN = Math.min(counts.total, 15);
  const audienceLabel =
    audience === "branch" ? (branches.length ? branches.join(" + ") : "Pick a branch") :
    audience === "role" ? `${role}s only` :
    audience === "selected" ? `${selectedPeople.length} selected members` :
    audience === "custom" ? customLabel :
    audiences.find((a) => a.id === audience)?.label ?? "All family";

  const toggleChannel = (c: Channel) => setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  const toggleBranch = (b: string) => setBranches((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  const togglePerson = (id: string) => setSelectedPeople((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const pickTemplate = (id: string) => {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setTemplateId(t.id);
    setKind(t.kind);
    setSubject(t.subject);
    setBody(t.body);
    setMedia(t.media);
    setChannels(t.channels);
  };

  const valid = [
    counts.total > 0 && (audience !== "branch" || branches.length > 0) && (audience !== "selected" || selectedPeople.length > 0),
    channels.length > 0 && !smsOverBudget,
    subject.trim().length >= 3 && body.trim().length >= 10,
    schedule === "now" || (date >= AS_OF && time.length === 5),
    !scheduledQuiet || quietOverride,
  ];
  const canNext = valid[step];

  const submit = () => {
    if (!canNext) return;
    setBusy(true);
    window.setTimeout(() => {
      const scheduledAt = schedule === "later" ? `${date}T${time}:00+03:00` : null;
      const status: Broadcast["status"] = schedule === "later" ? "scheduled" : "simulated";
      const deliveries = schedule === "now" ? chooseReceipts(spec, channels, ref) : [];
      onSubmit({
        subject: subject.trim(),
        excerpt: body.trim().replace(/\s+/g, " ").slice(0, 120),
        body: body.trim(),
        audienceKey: audience,
        audienceLabel,
        audienceCount: counts.total,
        branches: audience === "branch" ? branches as Broadcast["branches"] : undefined,
        channels,
        kind,
        status,
        createdAt: `${AS_OF}T10:48:00+03:00`,
        sentAt: status === "simulated" ? `${AS_OF}T10:48:00+03:00` : null,
        scheduledAt,
        smsRecipients: routes.sms,
        smsCost: routeRaw.smsCost,
        media,
        templateId,
        sampleDeliveries: deliveries,
      });
      setBusy(false);
      onClose();
    }, 650);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Compose a broadcast"
      sub="One message · routed to each person’s preferred channel · all sends are SIMULATED"
      size="xl"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={busy || !canNext} onClick={submit}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Megaphone className="h-3.5 w-3.5" />}
              {schedule === "now" ? "Simulate send" : "Schedule broadcast"}
            </button>
          )}
        </>
      }
    >
      <Stepper total={STEPS.length} current={step} labels={STEPS} />

      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {audiences.map((a) => (
              <button key={a.id} type="button" onClick={() => setAudience(a.id)} className={`rounded-xl border p-3.5 text-left transition ${audience === a.id ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{a.label}</span>
                  <span className="ny-num rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold">{a.count || "—"}</span>
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-text-secondary">{a.hint}</span>
              </button>
            ))}
          </div>

          {audience === "branch" && (
            <div>
              <span className="ny-label">Choose branch(es)</span>
              <div className="flex flex-wrap gap-1.5">
                {BRANCHES.map((b) => (
                  <button key={b} type="button" aria-pressed={branches.includes(b)} onClick={() => toggleBranch(b)} className={`ny-chip ny-touch ${branches.includes(b) ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {audience === "role" && (
            <div>
              <label className="ny-label" htmlFor="cmp-role">Role</label>
              <select id="cmp-role" className="ny-select" value={role} onChange={(e) => setRole(e.target.value)}>
                {(["Elder", "Family head", "Finance officer", "Member", "Chama member", "Parent"] as const).map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
          )}

          {audience === "selected" && (
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="ny-hud">Pick people · {selectedPeople.length} selected</p>
                <span className="ny-chip ny-chip-brand"><Users className="h-3 w-3" /> recipient picker below</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {people.map((p) => (
                  <button key={p.id} type="button" aria-pressed={selectedPeople.includes(p.id)} onClick={() => togglePerson(p.id)} className={`ny-chip ny-touch ${selectedPeople.includes(p.id) ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                    {p.name.split(" ")[0]} {p.name.split(" ")[1]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {audience === "custom" && (
            <div>
              <label className="ny-label" htmlFor="cmp-custom">Name this group</label>
              <input id="cmp-custom" className="ny-input" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="Nairobi elders" />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {BRANCHES.map((b) => (
                  <button key={b} type="button" aria-pressed={branches.includes(b)} onClick={() => toggleBranch(b)} className={`ny-chip ny-touch ${branches.includes(b) ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="ny-inset grid grid-cols-2 gap-3 px-3.5 py-3 text-sm sm:grid-cols-4">
            {[
              ["Resolved", String(counts.total)],
              ["WhatsApp capable", String(counts.whatsapp)],
              ["SMS fallback", String(counts.sms)],
              ["In-app", String(counts.inApp)],
            ].map(([k, v]) => <span key={k}><span className="ny-hud block">{k}</span><span className="ny-num font-semibold">{v}</span></span>)}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {CHANNELS.map((c) => (
              <button key={c} type="button" aria-pressed={channels.includes(c)} onClick={() => toggleChannel(c)} className={`cm-channel ${channels.includes(c) ? "is-on" : ""}`}>
                <span className="cm-channel__check">{channels.includes(c) ? <Check className="h-3 w-3" /> : null}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{CHANNEL_LABEL[c]}</span>
                  <span className="ny-hud mt-1 block !text-[0.5rem]">{CHANNEL_CAPABILITY[c]}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="ny-card-flat space-y-2 p-4">
            <p className="ny-hud">Auto-routing hint</p>
            {CHANNELS.map((c) => {
              const n = routes[c];
              return <div key={c} className="cm-route-row"><span className="ny-hud !text-[0.55rem]">{CHANNEL_LABEL[c]}</span><span className="cm-route-track"><span className="cm-route-fill block h-full" style={{ width: `${counts.total ? (n / counts.total) * 100 : 0}%`, background: c === "whatsapp" ? "var(--color-success)" : c === "sms" ? "var(--color-brand-accent)" : c === "email" ? "var(--color-info)" : "var(--color-brand-primary)" }} /></span><span className="ny-num text-right text-xs font-semibold">{n}</span></div>;
            })}
            <p className="ny-hud pt-1 !text-[0.52rem]">WhatsApp-capable numbers route to WhatsApp; the rest fall back to SMS. In-app is always included when selected.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="ny-chip ny-chip-warn">SMS estimate · KES {routeRaw.smsCost.toFixed(2)}</span>
            <span className={`ny-chip ${smsOverBudget ? "ny-chip-danger" : "ny-chip-ok"}`}>
              Daily cap · KES {settings.smsSpentToday.toLocaleString("en-KE")} spent of {settings.smsDailyCap.toLocaleString("en-KE")}
            </span>
            <span className="ny-chip ny-chip-neutral"><Users className="h-3 w-3" /> {counts.total} recipients</span>
          </div>
          {smsOverBudget && <p className="ny-chip ny-chip-danger">SMS budget guard blocked this broadcast. Remove SMS, reduce the audience, or ask an admin to raise the cap.</p>}
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {templates.map((tpl) => (
                <button key={tpl.id} type="button" onClick={() => pickTemplate(tpl.id)} className={`ny-chip ny-touch ${templateId === tpl.id ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                  {tpl.title}
                </button>
              ))}
            </div>
            <div>
              <label className="ny-label" htmlFor="cmp-subject">Subject</label>
              <input id="cmp-subject" className="ny-input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="A note from the family" />
            </div>
            <div>
              <label className="ny-label" htmlFor="cmp-body">Message · merge fields {"{first_name}"} and {"{branch}"}</label>
              <textarea id="cmp-body" className="ny-textarea min-h-[180px]" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Habari {first_name}, ..." />
              <p className="ny-hud mt-1.5 text-right !text-[0.52rem]">{body.length} characters · {Math.max(1, Math.ceil(body.length / 160))} SMS segment{Math.ceil(body.length / 160) === 1 ? "" : "s"}</p>
            </div>
            {channels.includes("whatsapp") && (
              <div>
                <span className="ny-label">Attach an image for WhatsApp</span>
                <div className="flex flex-wrap gap-1.5">
                  {["/images/frame-reunion.jpg", "/images/cause-water.jpg", "/images/cause-school.jpg", "/images/cause-medical.jpg", ""].map((src, i) => (
                    <button key={src || "none"} type="button" aria-pressed={media === (src || undefined)} onClick={() => setMedia(src || undefined)} className={`overflow-hidden rounded-lg border-2 transition ${media === (src || undefined) ? "border-brand-accent" : "border-transparent opacity-75 hover:opacity-100"}`}>
                      {src ? <img src={src} alt="" className="h-12 w-16 object-cover"/> : <span className="grid h-12 w-16 place-items-center bg-surface-2 text-[0.6rem]">No image</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div>
            <p className="ny-label">Member preview · merge fields filled in</p>
            <div className="cm-preview">
              {media && <img src={media} alt="" className="cm-preview__image" loading="lazy" />}
              <div className="cm-preview__body">
                <span className="ny-chip ny-chip-ok mb-2">WhatsApp preview · SIMULATED</span>
                <p className="ny-display text-base">{subject || "Subject"}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{preview}</p>
                <p className="ny-hud mt-3 !text-[0.5rem]">To {previewPerson.name} · {previewPerson.branch}</p>
              </div>
            </div>
            <p className="ny-hud mt-2 !text-[0.52rem]">The same copy routes to SMS, email and in-app according to each person’s capability.</p>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => setSchedule("now")} className={`rounded-xl border p-4 text-left transition ${schedule === "now" ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1"}`}>
              <span className="block text-sm font-semibold">Simulate now</span>
              <span className="mt-1 block text-xs text-text-secondary">Local fanout receipts appear immediately. Nothing is sent.</span>
            </button>
            <button type="button" onClick={() => setSchedule("later")} className={`rounded-xl border p-4 text-left transition ${schedule === "later" ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1"}`}>
              <span className="block text-sm font-semibold">Schedule for later</span>
              <span className="mt-1 block text-xs text-text-secondary">Saves a planned local broadcast. It will not run in Phase 1.</span>
            </button>
          </div>
          {schedule === "later" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><label className="ny-label" htmlFor="cmp-date">Date (EAT)</label><input id="cmp-date" type="date" min={AS_OF} className="ny-input" value={date} onChange={(e) => setDate(e.target.value)}/></div>
              <div><label className="ny-label" htmlFor="cmp-time">Time (EAT)</label><input id="cmp-time" type="time" className="ny-input" value={time} onChange={(e) => setTime(e.target.value)}/></div>
            </div>
          )}
          <div className="ny-inset flex items-start gap-2.5 px-3.5 py-3">
            <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary"/>
            <p className="text-sm leading-relaxed text-text-secondary">
              Quiet hours are {settings.quietFrom}–{settings.quietTo} EAT. They are respected for ordinary messages; critical alerts can break through only if the family has enabled it.
            </p>
          </div>
          {scheduledQuiet && (
            <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5 text-sm">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--color-brand-primary)]" checked={quietOverride} onChange={() => setQuietOverride((v) => !v)}/>
              <span>This is important enough to send during quiet hours. I understand it wakes people.</span>
            </label>
          )}
          <div className="flex flex-wrap gap-2">
            <span className={`ny-chip ${settings.quietOn ? "ny-chip-brand" : "ny-chip-neutral"}`}>Quiet hours {settings.quietOn ? "on" : "off"}</span>
            <span className={`ny-chip ${critical && settings.criticalBypass ? "ny-chip-warn" : "ny-chip-neutral"}`}>{critical && settings.criticalBypass ? "Critical bypass on" : "Standard retry policy"}</span>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="ny-inset px-4 py-3.5">
            <p className="ny-hud">Review the broadcast</p>
            <p className="ny-display mt-1 text-lg">{subject}</p>
            <p className="mt-1 text-sm text-text-secondary">{audienceLabel} · {counts.total} people · {schedule === "now" ? "simulate now" : `planned ${date} at ${time} EAT`}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {channels.map((c) => <div key={c} className="ny-inset px-3 py-2.5"><p className="ny-hud">{CHANNEL_LABEL[c]}</p><p className="ny-num font-semibold">{routes[c]}</p></div>)}
          </div>
          <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
            {[
              ["Audience", audienceLabel], ["Message", `${body.length} characters`], ["SMS cost estimate", `KES ${routeRaw.smsCost.toFixed(2)}`],
              ["Daily budget after", `KES ${(settings.smsSpentToday + routeRaw.smsCost).toFixed(2)} / ${settings.smsDailyCap.toFixed(2)}`],
              ["Delivery", schedule === "now" ? "SIMULATED receipts · no send" : "Scheduled locally · will not send in Phase 1"],
            ].map(([k, v]) => <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5"><dt className="text-text-secondary">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>)}
          </dl>
          <p className="ny-chip ny-chip-sim">Every rail stays SIMULATED · never a fake “Sent” claim</p>
        </div>
      )}
    </Modal>
  );
}
