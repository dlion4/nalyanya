"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { Bell, BellRing, Copy, Link2, MessageCircle, Radio, Send, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SectionHeader, SimulatedBadge } from "@/components/ui/Primitives";
import { DELIVERY_SEED, REMINDER_OFFSETS, sortByStart, type DeliveryReceipt, type FamilyEvent, rsvpSummary } from "@/data/dashboard/events";
import { MEMBERS } from "@/data/family/people";
import { eatLabel, shortDay, TODAY_ISO } from "@/lib/calendar";
import { cn } from "@/lib/format";
import { EventStatusChip } from "@/views/dashboard/events/eventsUi";
import type { EventsActions } from "@/views/dashboard/events/types";

const TAB_CLASS =
  "rounded-full px-4 py-2 text-xs font-semibold text-text-secondary outline-none transition data-focus:ring-2 data-focus:ring-brand-accent data-selected:bg-brand-primary data-selected:text-white";

const RECEIPT_STYLE: Record<DeliveryReceipt["status"], string> = {
  read: "ny-chip-success",
  delivered: "ny-chip-info",
  pending: "ny-chip-warning",
  failed: "ny-chip-danger",
};

export function InvitesReminders({ events, actions }: { events: FamilyEvent[]; actions: EventsActions }) {
  const scheduled = useMemo(() => sortByStart(events.filter((e) => e.status === "scheduled")), [events]);
  const [pickedId, setPickedId] = useState<string>(scheduled[0]?.id ?? "");
  const picked = scheduled.find((e) => e.id === pickedId) ?? scheduled[0];
  const [receipts, setReceipts] = useState<DeliveryReceipt[]>(DELIVERY_SEED);
  const [streaming, setStreaming] = useState(false);

  const routing = useMemo(() => {
    const living = MEMBERS.filter((m) => m.deathYear === undefined);
    const wa = living.filter((m) => m.whatsapp && m.phone).length;
    const sms = living.filter((m) => !m.whatsapp && m.phone).length;
    const email = living.filter((m) => m.email).length;
    return { wa, sms, email, cost: sms * 0.8 };
  }, []);

  const pendingNudges = picked ? rsvpSummary(picked).pending : 0;

  useEffect(() => {
    if (!streaming) return;
    const extra: DeliveryReceipt[] = [
      { id: `RCP-${7750 + receipts.length}`, to: "Ruth Nekesa Nalyanya", channel: "WhatsApp", status: "delivered", at: "09:52 EAT", eventId: picked?.id ?? "" },
      { id: `RCP-${7751 + receipts.length}`, to: "Caleb Kiprono Nalyanya", channel: "SMS", status: "pending", at: "09:52 EAT", eventId: picked?.id ?? "" },
      { id: `RCP-${7752 + receipts.length}`, to: "Esther Chepkoech Nalyanya", channel: "Email", status: "read", at: "09:53 EAT", eventId: picked?.id ?? "" },
    ];
    let i = 0;
    const timer = window.setInterval(() => {
      if (i >= extra.length) {
        window.clearInterval(timer);
        setStreaming(false);
        return;
      }
      const next = extra[i];
      setReceipts((prev) => [next, ...prev]);
      i += 1;
    }, 650);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming]);

  const inviteLink = picked ? `nalyanya.family/rsvp/${picked.id}` : "nalyanya.family/rsvp";

  return (
    <section id="invites" aria-labelledby="invites-heading" className="scroll-mt-24 space-y-6">
      <SectionHeader
        eyebrow="S6 · Invites & reminders"
        title="Reach every relative on the channel they use"
        description="WhatsApp where it works, SMS for basic phones, email for the diaspora. Automatic reminders go out two days and one hour before. Nothing is sent in this phase."
        actions={<SimulatedBadge label="Sending connects when the backend is wired" />}
      />
      <h2 id="invites-heading" className="sr-only">Invites and reminders</h2>

      <TabGroup>
        <TabList className="ny-scroll inline-flex max-w-full gap-1 overflow-x-auto rounded-full border border-hairline bg-surface-1 p-1">
          <Tab className={TAB_CLASS}>Reminder rules</Tab>
          <Tab className={TAB_CLASS}>Invites & routing</Tab>
          <Tab className={TAB_CLASS}>Delivery log</Tab>
        </TabList>

        <TabPanels className="mt-5">
          {/* Reminder rules */}
          <TabPanel className="grid gap-5 focus:outline-none lg:grid-cols-[1.4fr_1fr]">
            <div className="ny-card divide-y divide-hairline overflow-hidden">
              {scheduled.slice(0, 6).map((e) => (
                <div key={e.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-text-primary">{e.title}</p>
                    <p className="text-xs text-text-tertiary">
                      {shortDay(e.date)} · {eatLabel(e.startTime)} · {rsvpSummary(e).pending} waiting for an answer
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {REMINDER_OFFSETS.map((r) => {
                        const on = e.reminders.includes(r.id);
                        return (
                          <span key={r.id} className={cn("ny-chip", on ? "ny-chip-success" : "opacity-60")}>
                            {on ? <BellRing className="size-3.5" aria-hidden /> : <Bell className="size-3.5" aria-hidden />}
                            {r.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => actions.openAct("reminders", { event: e.id })} className="ny-btn ny-btn-ghost ny-btn-sm">
                      Edit rules
                    </button>
                    <button type="button" onClick={() => actions.openAct("nudge", { event: e.id })} className="ny-btn ny-btn-gold ny-btn-sm">
                      Nudge pending
                    </button>
                  </div>
                </div>
              ))}
              {scheduled.length === 0 && <p className="p-6 text-sm text-text-secondary">No scheduled gatherings yet.</p>}
            </div>

            <aside className="ny-card space-y-4 p-6">
              <p className="ny-eyebrow">How reminders decide</p>
              <ul className="space-y-3 text-sm leading-relaxed text-text-secondary">
                <li><strong className="text-text-primary">E-2d:</strong> sent to every going or maybe guest, WhatsApp first, SMS fallback.</li>
                <li><strong className="text-text-primary">E-1h:</strong> a short nudge with the venue and the call link.</li>
                <li><strong className="text-text-primary">Quiet hours:</strong> nothing between 21:00 and 06:30 EAT except critical alerts.</li>
              </ul>
              <div className="rounded-2xl border border-dashed border-brand-secondary/50 p-3.5 text-xs text-text-secondary">
                Quiet hours and SMS daily caps are enforced by the scheduler once the backend is wired.
              </div>
            </aside>
          </TabPanel>

          {/* Invites & routing */}
          <TabPanel className="grid gap-5 focus:outline-none lg:grid-cols-[1.2fr_1fr]">
            <div className="ny-card space-y-5 p-6">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Gathering to invite people to</span>
                <select value={picked?.id ?? ""} onChange={(e) => setPickedId(e.target.value)} className="ny-input">
                  {scheduled.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} · {shortDay(e.date)}
                    </option>
                  ))}
                </select>
              </label>

              {picked && (
                <div className="rounded-2xl border border-hairline bg-surface-0/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Shareable RSVP link</p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <code className="min-w-0 flex-1 truncate rounded-xl bg-surface-1 px-3 py-2.5 font-mono text-xs text-brand-primary">{inviteLink}</code>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.clipboard) void navigator.clipboard.writeText(inviteLink);
                        actions.notify({ title: "RSVP link copied", body: "Paste it into any chat. Guests answer without signing in.", tone: "success" });
                      }}
                      className="ny-btn ny-btn-ghost ny-btn-sm"
                    >
                      <Copy className="size-4" aria-hidden /> Copy link
                    </button>
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "WhatsApp", value: routing.wa, icon: MessageCircle, tone: "text-[#1f7a4d]" },
                  { label: "SMS fallback", value: routing.sms, icon: Radio, tone: "text-brand-secondary" },
                  { label: "Email", value: routing.email, icon: Send, tone: "text-info" },
                ].map((c) => (
                  <div key={c.label} className="rounded-2xl bg-surface-0/80 p-4">
                    <c.icon className={cn("size-4", c.tone)} aria-hidden />
                    <p className="ny-title mt-2 text-3xl">{c.value}</p>
                    <p className="text-xs text-text-tertiary">{c.label} · living members</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-text-tertiary">Estimated SMS cost: KES {routing.cost.toFixed(0)} at KES 0.80 per message.</p>
                <button
                  type="button"
                  disabled={!picked}
                  onClick={() => picked && actions.openAct("invite", { event: picked.id })}
                  className="ny-btn ny-btn-primary ny-btn-sm"
                >
                  <Users className="size-4" aria-hidden /> Open invite wizard
                </button>
              </div>
            </div>

            <aside className="ny-card space-y-3 p-6">
              <p className="ny-eyebrow">RSVP follow-up</p>
              <p className="text-sm text-text-secondary">
                {pendingNudges > 0 ? (
                  <>
                    <span className="ny-num font-semibold text-text-primary">{pendingNudges}</span> guests have not answered for this gathering.
                  </>
                ) : (
                  "Everyone invited has answered for this gathering."
                )}
              </p>
              <button
                type="button"
                disabled={!picked || pendingNudges === 0}
                onClick={() => picked && actions.openAct("nudge", { event: picked.id })}
                className="ny-btn ny-btn-gold ny-btn-sm w-fit"
              >
                <BellRing className="size-4" aria-hidden /> Nudge the pending guests
              </button>
              <p className="pt-3 text-xs leading-relaxed text-text-tertiary">
                Event status: <EventStatusChip status={picked?.status ?? "scheduled"} date={picked?.date ?? TODAY_ISO} />
              </p>
            </aside>
          </TabPanel>

          {/* Delivery log */}
          <TabPanel className="focus:outline-none">
            <div className="ny-card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <Link2 className="size-4 text-text-tertiary" aria-hidden />
                  <p className="text-sm font-semibold text-text-primary">Receipts stream in as guests receive them</p>
                </div>
                <button type="button" onClick={() => setStreaming(true)} disabled={streaming} className="ny-btn ny-btn-ghost ny-btn-sm">
                  {streaming ? "Receiving…" : "Simulate new receipts"}
                </button>
              </div>
              <ul className="divide-y divide-hairline">
                {receipts.slice(0, 10).map((r, i) => (
                  <li key={`${r.id}-${i}`} className={cn("grid gap-2 p-4 sm:grid-cols-[7rem_1fr_auto_auto] sm:items-center sm:gap-4 sm:px-5", i === 0 && streaming && "ny-row-in")}>
                    <span className="font-mono text-xs text-text-tertiary">{r.id}</span>
                    <span className="min-w-0 truncate text-sm font-medium text-text-primary">{r.to}</span>
                    <span className="ny-chip w-fit">{r.channel}</span>
                    <span className={cn("ny-chip w-fit capitalize", RECEIPT_STYLE[r.status])}>{r.status}</span>
                  </li>
                ))}
              </ul>
              <p className="border-t border-hairline p-4 text-xs text-text-tertiary sm:px-5">
                Receipts are SIMULATED in this phase. Real delivery proof arrives with the WhatsApp Cloud and Africa&apos;s Talking webhooks.
              </p>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </section>
  );
}
