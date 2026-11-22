"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { Avatar, BranchChip, GenChip } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { CountUp } from "@/components/ui/motion";
import { SHARE_UNIT_VALUE_KES } from "@/data/dashboard/command-center";
import { ageOf, kes, maskPhone } from "@/lib/format";
import { relativesOf, type FamilyGraph } from "@/lib/family/graph";
import type { Member } from "@/types/family";
import { cn } from "@/lib/format";

const TABS = ["Overview", "Family", "Contact", "Profession", "Finance", "Timeline"] as const;

export type InspectorAction = "add-child" | "add-spouse" | "mark-deceased" | "edit";

interface Props {
  graph: FamilyGraph;
  memberId: string;
  onClose: () => void;
  onFocus: (memberId: string) => void;
  onAction: (kind: InspectorAction, memberId: string) => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-hairline py-2.5 last:border-0">
      <dt className="text-sm text-text-tertiary">{label}</dt>
      <dd className="text-right text-sm font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

function PersonLink({ member, hint, onFocus }: { member: Member; hint: string; onFocus: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onFocus(member.id)}
      className="flex w-full items-center gap-3 rounded-2xl border border-hairline bg-surface-0/60 p-3 text-left transition hover:border-brand-primary hover:bg-surface-1"
    >
      <Avatar member={member} size={38} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text-primary">
          {member.preferredName} {member.lastName}
        </span>
        <span className="block truncate text-xs text-text-tertiary">
          {hint} · Gen {member.generation}
        </span>
      </span>
      <span className="text-xs font-semibold text-brand-primary">Focus →</span>
    </button>
  );
}

/** S4 — the member preview drawer. Non-modal: the tree keeps moving while you read. */
export function MemberInspector({ graph, memberId, onClose, onFocus, onAction }: Props) {
  const member = graph.memberById.get(memberId);
  const [revealed, setRevealed] = useState(false);
  const { notify } = useToast();
  if (!member) return null;

  const rel = relativesOf(graph, memberId);
  const deceased = member.deathYear !== undefined;
  const age = ageOf(member.birthYear, member.deathYear);
  const shares = member.saccoShares * SHARE_UNIT_VALUE_KES;
  const events = [...member.lifeEvents].sort((a, b) => a.year - b.year);

  return (
    <motion.aside
      role="dialog"
      aria-label={`${member.preferredName} ${member.lastName} profile`}
      initial={{ opacity: 0, x: 36 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 36 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-x-2 bottom-2 z-20 flex max-h-[80%] flex-col overflow-hidden rounded-[26px] border border-hairline bg-surface-1 shadow-lift sm:bottom-3 sm:left-auto sm:right-3 sm:top-16 sm:max-h-none sm:w-[25rem]"
    >
      <header className="flex items-start gap-4 border-b border-hairline p-5">
        <Avatar member={member} size={60} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] tracking-wide text-text-tertiary">{member.id}</p>
          <h3 className="ny-title mt-0.5 text-2xl leading-tight">
            {member.preferredName} {member.lastName}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <GenChip generation={member.generation} />
            <BranchChip branchId={member.branchId} />
            <span className="ny-chip">{member.role}</span>
            {deceased && <span className="ny-chip">† {member.deathYear}</span>}
            {member.adopted && <span className="ny-chip ny-chip-violet">Adopted</span>}
            {member.ward && <span className="ny-chip ny-chip-info">Ward · minor</span>}
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label="Close profile" className="ny-btn ny-btn-ghost ny-btn-sm size-9 shrink-0 p-0">
          <X className="size-4" aria-hidden />
        </button>
      </header>

      <TabGroup className="flex min-h-0 flex-1 flex-col">
        <TabList className="ny-scroll flex gap-1 overflow-x-auto border-b border-hairline px-3 pt-2">
          {TABS.map((tab) => (
            <Tab
              key={tab}
              className="shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold text-text-secondary outline-none transition data-focus:ring-2 data-focus:ring-brand-accent data-selected:bg-brand-primary data-selected:text-white"
            >
              {tab}
            </Tab>
          ))}
        </TabList>

        <TabPanels className="ny-scroll min-h-0 flex-1 overflow-y-auto p-5">
          {/* OVERVIEW */}
          <TabPanel className="space-y-5 focus:outline-none">
            {member.photo && (
              <img src={member.photo} alt={`Photo of ${member.preferredName}`} className="h-44 w-full rounded-2xl object-cover" decoding="async" />
            )}
            <dl>
              <Row label="Born" value={`${member.birthYear}${deceased ? ` · died ${member.deathYear}` : ""}`} />
              <Row
                label={deceased ? "Age at passing" : "Age"}
                value={<CountUp value={age} />}
              />
              <Row label="Home" value={`${member.homeTown}, ${member.county}`} />
              <Row label="Role" value={member.role} />
            </dl>
            <p className="rounded-2xl bg-surface-0/70 p-4 text-sm leading-relaxed text-text-secondary">{member.bio}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => onAction("edit", member.id)} className="ny-btn ny-btn-primary ny-btn-sm">
                <ShieldCheck className="size-4" aria-hidden />
                Edit (admin)
              </button>
              <Link href={`/dashboard/members?focus=${member.id}`} className="ny-btn ny-btn-ghost ny-btn-sm">
                Open in members →
              </Link>
            </div>
          </TabPanel>

          {/* FAMILY */}
          <TabPanel className="space-y-5 focus:outline-none">
            {rel.spouse && <PersonLink member={rel.spouse} hint="Spouse" onFocus={onFocus} />}
            {!rel.spouse && member.spouseId === null && <p className="text-sm text-text-secondary">No spouse on file.</p>}
            {rel.parent && <PersonLink member={rel.parent} hint="Parent" onFocus={onFocus} />}
            {rel.siblings.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Siblings</p>
                {rel.siblings.slice(0, 6).map((s) => (
                  <PersonLink key={s.id} member={s} hint="Sibling" onFocus={onFocus} />
                ))}
              </div>
            )}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                Children · {rel.children.length}
              </p>
              {rel.children.length === 0 && <p className="text-sm text-text-secondary">No children recorded yet.</p>}
              {rel.children.slice(0, 12).map((c) => (
                <PersonLink key={c.id} member={c} hint="Child" onFocus={onFocus} />
              ))}
              {rel.children.length > 12 && <p className="text-xs text-text-tertiary">+{rel.children.length - 12} more in the tree</p>}
            </div>
            <div className="flex flex-wrap gap-2 border-t border-hairline pt-4">
              <button type="button" onClick={() => onAction("add-child", member.id)} className="ny-btn ny-btn-gold ny-btn-sm">
                Add child
              </button>
              <button
                type="button"
                onClick={() => onAction("add-spouse", member.id)}
                disabled={Boolean(member.spouseId)}
                className="ny-btn ny-btn-ghost ny-btn-sm"
              >
                {member.spouseId ? "Spouse on file" : "Add spouse"}
              </button>
            </div>
            <p className="text-xs text-text-tertiary">Admin edits apply and are written to the audit trail (SIMULATED until the backend is wired).</p>
          </TabPanel>

          {/* CONTACT */}
          <TabPanel className="space-y-5 focus:outline-none">
            <div className="rounded-2xl border border-hairline bg-surface-0/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Phone</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="ny-num font-mono text-lg font-semibold text-text-primary">
                  {revealed && member.phone ? member.phone : maskPhone(member.phone)}
                </p>
                {member.phone && (
                  <button
                    type="button"
                    onClick={() => {
                      setRevealed((v) => !v);
                      if (!revealed) notify({ title: "Reveal logged", body: "Viewing a phone number is recorded in the audit trail (SIMULATED).", tone: "info" });
                    }}
                    className="ny-btn ny-btn-ghost ny-btn-sm"
                    aria-pressed={revealed}
                  >
                    {revealed ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                    {revealed ? "Hide" : "Reveal"}
                  </button>
                )}
              </div>
            </div>
            <dl>
              <Row label="Email" value={member.email ?? "Not on file"} />
              <Row label="WhatsApp" value={member.whatsapp ? "Capable" : "Not on WhatsApp"} />
              <Row label="Preferred channel" value={member.preferredChannel} />
            </dl>
            <Link href={`/dashboard/communications?to=${member.id}`} className="ny-btn ny-btn-primary ny-btn-sm">
              Send a message →
            </Link>
          </TabPanel>

          {/* PROFESSION */}
          <TabPanel className="space-y-5 focus:outline-none">
            <dl>
              <Row label="Profession" value={member.profession} />
              <Row label="Employer" value={member.employer ?? "Self-employed or not shared"} />
            </dl>
            <Link href={`/dashboard/professions?member=${member.id}`} className="ny-btn ny-btn-ghost ny-btn-sm">
              View in the professions directory →
            </Link>
          </TabPanel>

          {/* FINANCE */}
          <TabPanel className="space-y-5 focus:outline-none">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-surface-0/70 p-4">
                <p className="text-xs text-text-tertiary">Wallet</p>
                <p className="ny-title mt-1 text-xl">{kes(member.walletKes)}</p>
              </div>
              <div className="rounded-2xl bg-surface-0/70 p-4">
                <p className="text-xs text-text-tertiary">Sacco shares</p>
                <p className="ny-title mt-1 text-xl">{member.saccoShares}</p>
                <p className="text-xs text-text-tertiary">≈ {kes(shares, { compact: true })}</p>
              </div>
              <div className="rounded-2xl bg-surface-0/70 p-4">
                <p className="text-xs text-text-tertiary">Active loans</p>
                <p className="ny-title mt-1 text-xl">{member.activeLoans}</p>
              </div>
              <div className="rounded-2xl bg-surface-0/70 p-4">
                <p className="text-xs text-text-tertiary">Contributed</p>
                <p className="ny-title mt-1 text-xl">{kes(member.contributionsKes, { compact: true })}</p>
              </div>
            </div>
            <Link href={`/dashboard/finance-access?member=${member.id}`} className="ny-btn ny-btn-gold ny-btn-sm">
              Send an elder receive link →
            </Link>
          </TabPanel>

          {/* TIMELINE */}
          <TabPanel className="focus:outline-none">
            <ol className="relative space-y-5 border-l-2 border-hairline pl-6">
              {events.map((event) => (
                <li key={`${event.year}-${event.label}`} className="relative">
                  <span className="absolute -left-[31px] top-1 grid size-4 place-items-center rounded-full border-2 border-brand-accent bg-surface-1" aria-hidden />
                  <p className="font-display text-lg font-semibold text-text-primary">{event.year}</p>
                  <p className={cn("text-sm leading-relaxed text-text-secondary")}>{event.label}</p>
                </li>
              ))}
            </ol>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </motion.aside>
  );
}
