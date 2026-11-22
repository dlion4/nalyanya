"use client";

import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import Link from "next/link";
import {
  Ban,
  Eye,
  EyeOff,
  KeyRound,
  MessageCircle,
  QrCode,
  ShieldCheck,
  TreeDeciduous,
  UserCog,
  UserPlus,
} from "lucide-react";
import { useState } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { Avatar, BranchChip, GenChip, SimulatedBadge } from "@/components/ui/Primitives";
import { useToast } from "@/components/ui/Toast";
import { CountUp } from "@/components/ui/motion";
import { SHARE_UNIT_VALUE_KES } from "@/data/dashboard/command-center";
import type { FamilyRole } from "@/data/dashboard/members";
import { ageOf, kes, maskPhone } from "@/lib/format";
import type { Member } from "@/types/family";

const TABS = ["Overview", "Family", "Contact", "Profession", "Finance", "Timeline"] as const;

export type DrawerQuickAction =
  | "edit-member"
  | "assign-role"
  | "receive-link"
  | "message"
  | "add-relation"
  | "member-qr"
  | "suspend"
  | "remove";

interface Props {
  member: Member | null;
  members: Member[];
  role: FamilyRole;
  suspended: boolean;
  canEdit: boolean;
  canAssignRole: boolean;
  canSendLink: boolean;
  canViewPhone: boolean;
  onClose: () => void;
  onSelectMember: (id: string) => void;
  onAction: (action: DrawerQuickAction, memberId: string) => void;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-hairline py-2.5 last:border-0">
      <dt className="text-sm text-text-tertiary">{label}</dt>
      <dd className="text-right text-sm font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

function RelativeCard({
  member,
  hint,
  onOpen,
}: {
  member: Member;
  hint: string;
  onOpen: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(member.id)}
      className="flex w-full items-center gap-3 rounded-2xl border border-hairline bg-surface-0/70 p-3 text-left transition hover:border-brand-primary hover:bg-surface-1"
    >
      <Avatar member={member} size={40} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-text-primary">
          {member.preferredName} {member.lastName}
        </span>
        <span className="block truncate text-xs text-text-tertiary">
          {hint} · Gen {member.generation} · {member.homeTown}
        </span>
      </span>
      <span className="text-xs font-semibold text-brand-primary">Open →</span>
    </button>
  );
}

/** S4 — Member Detail Drawer (reuses T-2 S4's 6 tabs, deep-linkable via ?member=NY-MBR-…). */
export function MemberDetailDrawer(props: Props) {
  const {
    member,
    members,
    role,
    suspended,
    canEdit,
    canAssignRole,
    canSendLink,
    canViewPhone,
    onClose,
    onSelectMember,
    onAction,
  } = props;

  const [revealed, setRevealed] = useState(false);
  const { notify } = useToast();

  if (!member) {
    return (
      <ModalDialog open={false} onClose={onClose} side="right" title="Member profile">
        <div />
      </ModalDialog>
    );
  }

  const byId = new Map(members.map((m) => [m.id, m]));
  const parent = member.parentId ? byId.get(member.parentId) ?? null : null;
  const spouse = member.spouseId ? byId.get(member.spouseId) ?? null : null;
  const children = members.filter((m) => m.parentId === member.id);
  const siblings = member.parentId
    ? members.filter((m) => m.parentId === member.parentId && m.id !== member.id)
    : [];

  const deceased = member.deathYear !== undefined;
  const age = ageOf(member.birthYear, member.deathYear);
  const sharesKes = member.saccoShares * SHARE_UNIT_VALUE_KES;
  const events = [...member.lifeEvents].sort((a, b) => a.year - b.year);

  return (
    <ModalDialog
      open={Boolean(member)}
      onClose={onClose}
      side="right"
      title={`${member.preferredName} ${member.lastName}`}
      description={`${member.id} · ${role} · ${member.homeTown}, ${member.county}`}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href={`/dashboard/lineage?focus=${member.id}`} className="ny-btn ny-btn-primary ny-btn-sm">
            <TreeDeciduous className="size-4" aria-hidden />
            View in 3D tree
          </Link>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onAction("member-qr", member.id)}
              className="ny-btn ny-btn-ghost ny-btn-sm"
            >
              <QrCode className="size-4" aria-hidden />
              ID Card
            </button>
            {canSendLink && (
              <button
                type="button"
                onClick={() => onAction("receive-link", member.id)}
                className="ny-btn ny-btn-gold ny-btn-sm"
              >
                <KeyRound className="size-4" aria-hidden />
                Receive link
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Identity banner */}
        <div className="flex items-start gap-4 rounded-2xl border border-hairline bg-surface-0/75 p-4">
          <Avatar member={member} size={68} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-1.5">
              <GenChip generation={member.generation} />
              <BranchChip branchId={member.branchId} />
              <span className="ny-chip ny-chip-solid">{role}</span>
              {suspended && <span className="ny-chip ny-chip-danger">Suspended</span>}
              {deceased && <span className="ny-chip">† {member.deathYear}</span>}
              {member.adopted && <span className="ny-chip ny-chip-violet">Adopted</span>}
              {member.ward && <span className="ny-chip ny-chip-info">Ward · minor</span>}
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              {member.firstName} {member.middleName ? `${member.middleName} ` : ""}
              {member.lastName} · {member.role}
            </p>
          </div>
        </div>

        {/* 6-Tab Spine (reuses T-2 S4 structure) */}
        <TabGroup>
          <TabList className="ny-scroll flex gap-1 overflow-x-auto border-b border-hairline pb-2">
            {TABS.map((tab) => (
              <Tab
                key={tab}
                className="shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold text-text-secondary outline-none transition data-focus:ring-2 data-focus:ring-brand-accent data-selected:bg-brand-primary data-selected:text-white"
              >
                {tab}
              </Tab>
            ))}
          </TabList>

          <TabPanels className="mt-5">
            {/* OVERVIEW */}
            <TabPanel className="space-y-5 focus:outline-none">
              {member.photo && (
                <img
                  src={member.photo}
                  alt={`Portrait of ${member.preferredName}`}
                  className="h-52 w-full rounded-2xl object-cover shadow-soft"
                  decoding="async"
                />
              )}
              <dl>
                <Row label="Full name" value={`${member.firstName} ${member.middleName ?? ""} ${member.lastName}`.trim()} />
                <Row label="Born" value={`${member.birthYear}${deceased ? ` · passed ${member.deathYear}` : ""}`} />
                <Row label={deceased ? "Age at passing" : "Age"} value={<CountUp value={age} />} />
                <Row label="Home town" value={`${member.homeTown}, ${member.county}`} />
                <Row label="Lineage role" value={member.role} />
                <Row label="Platform role" value={role} />
              </dl>
              <p className="rounded-2xl bg-surface-0/80 p-4 text-sm leading-relaxed text-text-secondary">{member.bio}</p>

              <div className="flex flex-wrap gap-2">
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onAction("edit-member", member.id)}
                    className="ny-btn ny-btn-primary ny-btn-sm"
                  >
                    <ShieldCheck className="size-4" aria-hidden />
                    Edit profile
                  </button>
                )}
                {canAssignRole && (
                  <button
                    type="button"
                    onClick={() => onAction("assign-role", member.id)}
                    className="ny-btn ny-btn-ghost ny-btn-sm"
                  >
                    <UserCog className="size-4" aria-hidden />
                    Assign role
                  </button>
                )}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onAction("suspend", member.id)}
                    className="ny-btn ny-btn-ghost ny-btn-sm text-danger"
                  >
                    <Ban className="size-4" aria-hidden />
                    {suspended ? "Restore member" : "Suspend"}
                  </button>
                )}
              </div>
            </TabPanel>

            {/* FAMILY */}
            <TabPanel className="space-y-4 focus:outline-none">
              {spouse ? (
                <RelativeCard member={spouse} hint="Spouse" onOpen={onSelectMember} />
              ) : (
                <p className="rounded-2xl bg-surface-0/70 p-3.5 text-sm text-text-secondary">No spouse recorded yet.</p>
              )}
              {parent && <RelativeCard member={parent} hint="Parent" onOpen={onSelectMember} />}

              {siblings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                    Siblings · {siblings.length}
                  </p>
                  {siblings.slice(0, 6).map((s) => (
                    <RelativeCard key={s.id} member={s} hint="Sibling" onOpen={onSelectMember} />
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                  Children · {children.length}
                </p>
                {children.length === 0 ? (
                  <p className="text-sm text-text-secondary">No children recorded on file.</p>
                ) : (
                  children.slice(0, 10).map((c) => (
                    <RelativeCard key={c.id} member={c} hint="Child" onOpen={onSelectMember} />
                  ))
                )}
              </div>

              {canEdit && (
                <div className="border-t border-hairline pt-4">
                  <button
                    type="button"
                    onClick={() => onAction("add-relation", member.id)}
                    className="ny-btn ny-btn-gold ny-btn-sm"
                  >
                    <UserPlus className="size-4" aria-hidden />
                    Add spouse, child or guardian
                  </button>
                </div>
              )}
            </TabPanel>

            {/* CONTACT */}
            <TabPanel className="space-y-4 focus:outline-none">
              <div className="rounded-2xl border border-hairline bg-surface-0/75 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                  M-Pesa & contact number
                </p>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <p className="ny-num font-mono text-base font-semibold text-text-primary">
                    {revealed && member.phone ? member.phone : maskPhone(member.phone)}
                  </p>
                  {member.phone && canViewPhone && (
                    <button
                      type="button"
                      onClick={() => {
                        setRevealed((v) => !v);
                        if (!revealed) {
                          notify({
                            title: "Phone reveal audited",
                            body: "Viewing full +254 contact numbers writes to the audit trail (SIMULATED).",
                            tone: "info",
                          });
                        }
                      }}
                      className="ny-btn ny-btn-ghost ny-btn-sm"
                    >
                      {revealed ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                      {revealed ? "Hide" : "Reveal"}
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-text-tertiary">
                  Money-routing phone changes require OTP + Family Head approval (T-15 admin-gated rule).
                </p>
              </div>

              <dl>
                <Row label="Email" value={member.email ?? "Not on file"} />
                <Row label="WhatsApp" value={member.whatsapp ? "Capable" : "SMS fallback"} />
                <Row label="Preferred channel" value={member.preferredChannel} />
              </dl>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onAction("message", member.id)}
                  className="ny-btn ny-btn-primary ny-btn-sm"
                >
                  <MessageCircle className="size-4" aria-hidden />
                  Send quick message
                </button>
                <SimulatedBadge label="WhatsApp / SMS SIMULATED" />
              </div>
            </TabPanel>

            {/* PROFESSION */}
            <TabPanel className="space-y-4 focus:outline-none">
              <dl>
                <Row label="Profession" value={member.profession} />
                <Row label="Employer / Practice" value={member.employer ?? "Self-employed or not shared"} />
                <Row label="Location" value={`${member.homeTown}, ${member.county}`} />
              </dl>
              <Link href={`/dashboard/professions?member=${member.id}`} className="ny-btn ny-btn-ghost ny-btn-sm">
                View in professions directory (T-13) →
              </Link>
            </TabPanel>

            {/* FINANCE */}
            <TabPanel className="space-y-4 focus:outline-none">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-surface-0/80 p-4">
                  <p className="text-xs text-text-tertiary">Family wallet</p>
                  <p className="ny-title ny-num mt-1 text-xl">{kes(member.walletKes)}</p>
                </div>
                <div className="rounded-2xl bg-surface-0/80 p-4">
                  <p className="text-xs text-text-tertiary">Sacco shares</p>
                  <p className="ny-title ny-num mt-1 text-xl">{member.saccoShares}</p>
                  <p className="text-xs text-text-tertiary">≈ {kes(sharesKes, { compact: true })}</p>
                </div>
                <div className="rounded-2xl bg-surface-0/80 p-4">
                  <p className="text-xs text-text-tertiary">Active loans</p>
                  <p className="ny-title ny-num mt-1 text-xl">{member.activeLoans}</p>
                </div>
                <div className="rounded-2xl bg-surface-0/80 p-4">
                  <p className="text-xs text-text-tertiary">Contributions</p>
                  <p className="ny-title ny-num mt-1 text-xl">{kes(member.contributionsKes, { compact: true })}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {canSendLink && (
                  <button
                    type="button"
                    onClick={() => onAction("receive-link", member.id)}
                    className="ny-btn ny-btn-gold ny-btn-sm"
                  >
                    <KeyRound className="size-4" aria-hidden />
                    Issue elder receive link
                  </button>
                )}
                <Link href={`/dashboard/finances?member=${member.id}`} className="ny-btn ny-btn-ghost ny-btn-sm">
                  Open Sacco & chama →
                </Link>
              </div>
            </TabPanel>

            {/* TIMELINE */}
            <TabPanel className="focus:outline-none">
              <ol className="relative space-y-5 border-l-2 border-hairline pl-6">
                {events.map((ev) => (
                  <li key={`${ev.year}-${ev.label}`} className="relative">
                    <span
                      className="absolute -left-[31px] top-1 grid size-4 place-items-center rounded-full border-2 border-brand-accent bg-surface-1"
                      aria-hidden
                    />
                    <p className="font-display text-lg font-semibold text-text-primary">{ev.year}</p>
                    <p className="text-sm leading-relaxed text-text-secondary">{ev.label}</p>
                  </li>
                ))}
              </ol>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </ModalDialog>
  );
}
