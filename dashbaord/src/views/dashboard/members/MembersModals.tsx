"use client";

import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Check,
  CircleCheck,
  Copy,
  Download,
  FileSpreadsheet,
  KeyRound,
  Merge,
  MessageCircle,
  QrCode,
  Send,
  ShieldCheck,
  Smartphone,
  Trash,
  Upload,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { Avatar, BranchChip, GenChip, SimulatedBadge, StatusChip } from "@/components/ui/Primitives";
import { TiltCard } from "@/components/ui/motion";
import { BRANCHES } from "@/data/family/branches";
import {
  CSV_SAMPLE_ROWS,
  DUPLICATE_CANDIDATES,
  FAMILY_ROLES,
  type FamilyRole,
  type MemberRequest,
  type RequestCategory,
} from "@/data/dashboard/members";
import { ageOf, cn, DATA_YEAR, kes, maskPhone } from "@/lib/format";
import type { Channel, Member } from "@/types/family";

/* ─── 1. Edit Member Profile Modal (Medium) ──────────────────────────── */

export function EditMemberModal({
  member,
  onClose,
  onSave,
}: {
  member: Member | null;
  onClose: () => void;
  onSave: (memberId: string, patch: Partial<Member>, reason: string) => void;
}) {
  const [preferredName, setPreferredName] = useState(member?.preferredName ?? "");
  const [homeTown, setHomeTown] = useState(member?.homeTown ?? "");
  const [profession, setProfession] = useState(member?.profession ?? "");
  const [branchId, setBranchId] = useState(member?.branchId ?? "nalyanya-main");
  const [bio, setBio] = useState(member?.bio ?? "");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!member) return;
    if (reason.trim().length < 6) {
      setErr("Add a short reason (at least 6 characters) for the family audit log.");
      return;
    }
    onSave(
      member.id,
      {
        preferredName: preferredName.trim() || member.preferredName,
        homeTown: homeTown.trim() || member.homeTown,
        profession: profession.trim() || member.profession,
        branchId,
        bio: bio.trim() || member.bio,
      },
      reason.trim(),
    );
  };

  return (
    <ModalDialog
      open={Boolean(member)}
      onClose={onClose}
      size="md"
      title={member ? `Edit ${member.preferredName} ${member.lastName}` : "Edit member"}
      description="Admin edits apply immediately to the directory and write before/after snapshots to the audit log."
      footer={
        <div className="flex items-center justify-between gap-3">
          <SimulatedBadge label="Audited locally" />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
              Cancel
            </button>
            <button type="submit" form="edit-member-form" className="ny-btn ny-btn-primary ny-btn-sm">
              Save changes
            </button>
          </div>
        </div>
      }
    >
      {member && (
        <form id="edit-member-form" onSubmit={submit} className="space-y-4">
          {err && <p className="rounded-xl bg-[#fbe5e5] p-3 text-sm text-danger">{err}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Preferred name</span>
              <input className="ny-input" value={preferredName} onChange={(e) => setPreferredName(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Home town</span>
              <input className="ny-input" value={homeTown} onChange={(e) => setHomeTown(e.target.value)} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Branch</span>
              <select className="ny-input" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Profession</span>
              <input className="ny-input" value={profession} onChange={(e) => setProfession(e.target.value)} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Bio</span>
            <textarea rows={2} className="ny-input" value={bio} onChange={(e) => setBio(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Reason for change *</span>
            <input
              className="ny-input"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErr(null);
              }}
              placeholder="e.g. Updated after the May Kimilili call"
            />
          </label>
        </form>
      )}
    </ModalDialog>
  );
}

/* ─── 2. Assign RBAC Role Modal (Medium + 2FA Check) ─────────────────── */

export function AssignRoleModal({
  member,
  currentRole,
  onClose,
  onAssign,
}: {
  member: Member | null;
  currentRole: FamilyRole;
  onClose: () => void;
  onAssign: (memberId: string, role: FamilyRole) => void;
}) {
  const [role, setRole] = useState<FamilyRole>(currentRole);
  const [confirm2fa, setConfirm2fa] = useState(false);

  const needs2fa = role === "Family Head" || role === "Co-Admin / Elder" || role === "Finance Officer";

  return (
    <ModalDialog
      open={Boolean(member)}
      onClose={onClose}
      size="md"
      title={member ? `Assign role · ${member.preferredName}` : "Assign role"}
      description="Privileged roles require a 2FA check (SIMULATED) before permissions change."
      footer={
        <div className="flex items-center justify-between gap-3">
          <SimulatedBadge label="2FA gate SIMULATED" />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
              Cancel
            </button>
            <button
              type="button"
              disabled={!member || (needs2fa && !confirm2fa)}
              onClick={() => member && onAssign(member.id, role)}
              className="ny-btn ny-btn-primary ny-btn-sm"
            >
              <ShieldCheck className="size-4" aria-hidden />
              Apply role
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        {FAMILY_ROLES.map((def) => (
          <label
            key={def.role}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition",
              role === def.role ? "border-brand-primary bg-brand-primary/8" : "border-hairline bg-surface-0/60 hover:border-brand-primary/40",
            )}
          >
            <input
              type="radio"
              name="rbac-role"
              checked={role === def.role}
              onChange={() => setRole(def.role)}
              className="mt-1 size-4 accent-brand-primary"
            />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-text-primary">
                {def.role} <span className="font-normal text-text-tertiary">· {def.scope}</span>
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-text-secondary">{def.summary}</span>
            </span>
          </label>
        ))}

        {needs2fa && (
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-brand-accent/60 bg-brand-accent-soft/40 p-3.5 text-sm">
            <input
              type="checkbox"
              checked={confirm2fa}
              onChange={(e) => setConfirm2fa(e.target.checked)}
              className="size-4 accent-brand-primary"
            />
            <span>Confirm 2FA steward check (code 123456 · SIMULATED) to grant privileged access.</span>
          </label>
        )}
      </div>
    </ModalDialog>
  );
}

/* ─── 3. Send Elder Receive Link 3-Step Modal (Medium Multi-Step) ────── */

export function ReceiveLinkModal({
  member,
  onClose,
  onIssued,
}: {
  member: Member | null;
  onClose: () => void;
  onIssued: (member: Member, amount: number, token: string) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [amount, setAmount] = useState("5000");
  const [purpose, setPurpose] = useState("Monthly elder upkeep");
  const [channel, setChannel] = useState<"SMS" | "WhatsApp">("SMS");
  const token = member ? `NY-RCV-${member.id.slice(-3)}-${amount.slice(0, 2) || "50"}` : "NY-RCV-001";

  return (
    <ModalDialog
      open={Boolean(member)}
      onClose={onClose}
      size="md"
      title={member ? `Elder receive link · ${member.preferredName}` : "Elder receive link"}
      description="No-login link (/r/:token): the elder enters their 4-digit PIN + OTP and receives to M-Pesa in one tap."
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-text-tertiary">Step {step} of 3</span>
          <div className="flex gap-2">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => (s - 1) as 1 | 2)} className="ny-btn ny-btn-ghost ny-btn-sm">
                <ArrowLeft className="size-4" aria-hidden /> Back
              </button>
            ) : (
              <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
                Cancel
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => setStep((s) => (s + 1) as 2 | 3)} className="ny-btn ny-btn-primary ny-btn-sm">
                Next <ArrowRight className="size-4" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => member && onIssued(member, Number(amount) || 5000, token)}
                className="ny-btn ny-btn-gold ny-btn-sm"
              >
                <KeyRound className="size-4" aria-hidden />
                Issue simulated link
              </button>
            )}
          </div>
        </div>
      }
    >
      {member && (
        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-surface-0/80 p-3.5">
                <Avatar member={member} size={46} />
                <div>
                  <p className="font-semibold text-text-primary">{member.preferredName} {member.lastName}</p>
                  <p className="text-xs text-text-tertiary">M-Pesa destination: {maskPhone(member.phone)}</p>
                </div>
              </div>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Amount (KES)</span>
                <input
                  type="number"
                  min={100}
                  max={150000}
                  className="ny-input ny-num font-mono text-lg"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold">Plain-language note for the elder</span>
                <input className="ny-input" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">Choose how the one-tap receive link & 6-digit OTP should be delivered:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["SMS", "WhatsApp"] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={cn(
                      "rounded-2xl border p-4 text-left transition",
                      channel === ch ? "border-brand-primary bg-brand-primary/8" : "border-hairline bg-surface-0/70",
                    )}
                  >
                    <p className="font-semibold text-text-primary">{ch}</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {ch === "SMS" ? "Works on basic Android & feature phones" : "Rich preview card via WhatsApp Cloud"}
                    </p>
                  </button>
                ))}
              </div>
              <div className="rounded-2xl border border-dashed border-brand-secondary/50 bg-surface-0/70 p-4 text-xs text-text-secondary">
                <strong className="text-brand-secondary">Ready — connects when backend is wired:</strong> M-Pesa Daraja B2C & Africa&apos;s
                Talking OTP run in SIMULATED mode in Phase 1.
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mx-auto max-w-xs rounded-[28px] border-4 border-brand-deep bg-surface-0 p-5 text-center shadow-lift">
              <div className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-brand-primary px-3 py-1 text-[10px] font-semibold text-white">
                <Smartphone className="size-3" aria-hidden /> Elder phone preview
              </div>
              <p className="mt-4 text-xs uppercase tracking-widest text-text-tertiary">Nalyanya Family</p>
              <p className="ny-title mt-1 text-2xl">{kes(Number(amount) || 5000)}</p>
              <p className="mt-2 text-xs text-text-secondary">
                Sent to <strong>{member.preferredName}</strong> for “{purpose}”
              </p>
              <p className="mt-3 rounded-xl bg-surface-1 px-3 py-2 font-mono text-xs text-brand-primary">
                nalyanya.family/r/{token}
              </p>
              <p className="mt-3 text-[11px] text-text-tertiary">
                Requires 4-digit PIN (≤3 tries) + {channel} OTP · Expires in 7 days
              </p>
            </div>
          )}
        </div>
      )}
    </ModalDialog>
  );
}

/* ─── 4. Quick Message Member Modal (Medium) ─────────────────────────── */

export function MessageMemberModal({
  member,
  onClose,
  onSend,
}: {
  member: Member | null;
  onClose: () => void;
  onSend: (member: Member, channel: Channel, text: string) => void;
}) {
  const [channel, setChannel] = useState<Channel>(member?.preferredChannel ?? "WhatsApp");
  const [body, setBody] = useState(
    member ? `Jambo ${member.preferredName}, checking in from the Nalyanya family office ahead of Sunday's devotion call.` : "",
  );

  return (
    <ModalDialog
      open={Boolean(member)}
      onClose={onClose}
      size="md"
      title={member ? `Message ${member.preferredName}` : "Message member"}
      description="1:1 family outreach via WhatsApp, SMS or Email (SIMULATED — ready for Phase 2 webhooks)."
      footer={
        <div className="flex items-center justify-between gap-3">
          <SimulatedBadge label="Comms SIMULATED" />
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
              Cancel
            </button>
            <button
              type="button"
              disabled={!member || body.trim().length < 4}
              onClick={() => member && onSend(member, channel, body.trim())}
              className="ny-btn ny-btn-primary ny-btn-sm"
            >
              <Send className="size-4" aria-hidden />
              Send simulated
            </button>
          </div>
        </div>
      }
    >
      {member && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["WhatsApp", "SMS", "Email"] as Channel[]).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannel(ch)}
                className={cn("ny-chip cursor-pointer", channel === ch && "ny-chip-solid")}
              >
                <MessageCircle className="size-3.5" aria-hidden />
                {ch}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Message</span>
            <textarea rows={4} className="ny-input" value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
          <p className="text-xs text-text-tertiary">
            Recipient: {member.preferredName} {member.lastName} ({maskPhone(member.phone)}) · Est. cost: {channel === "SMS" ? "KES 0.80" : "KES 0"}
          </p>
        </div>
      )}
    </ModalDialog>
  );
}

/* ─── 5. Link Family Relation Modal (Medium) ─────────────────────────── */

export function AddRelationModal({
  member,
  members,
  onClose,
  onLink,
}: {
  member: Member | null;
  members: Member[];
  onClose: () => void;
  onLink: (member: Member, relationType: string, targetName: string) => void;
}) {
  const [relationType, setRelationType] = useState("Child");
  const [targetId, setTargetId] = useState(members[0]?.id ?? "");

  return (
    <ModalDialog
      open={Boolean(member)}
      onClose={onClose}
      size="md"
      title={member ? `Link relation · ${member.preferredName}` : "Link relation"}
      description="Connects a spouse, child, sibling or ward guardian across branches."
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!member) return;
              const target = members.find((m) => m.id === targetId);
              onLink(member, relationType, target ? `${target.preferredName} ${target.lastName}` : targetId);
            }}
            className="ny-btn ny-btn-primary ny-btn-sm"
          >
            Save relation link
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Relationship kind</span>
          <select className="ny-input" value={relationType} onChange={(e) => setRelationType(e.target.value)}>
            <option>Spouse</option>
            <option>Child</option>
            <option>Parent</option>
            <option>Sibling</option>
            <option>Ward / Guardian</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Relative in directory</span>
          <select className="ny-input" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
            {members
              .filter((m) => m.id !== member?.id)
              .slice(0, 50)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.preferredName} {m.lastName} · Gen {m.generation} ({m.homeTown})
                </option>
              ))}
          </select>
        </label>
      </div>
    </ModalDialog>
  );
}

/* ─── 6. Member Digital Heritage ID & QR Card Modal (Small/Medium) ───── */

export function MemberQrModal({
  member,
  role,
  onClose,
  onCopy,
}: {
  member: Member | null;
  role: FamilyRole;
  onClose: () => void;
  onCopy: (text: string) => void;
}) {
  return (
    <ModalDialog
      open={Boolean(member)}
      onClose={onClose}
      size="sm"
      title="Nalyanya Digital Heritage Card"
      description="Shareable family badge for reunions, harambees and Sacco verification."
      footer={
        <div className="flex justify-between gap-2">
          <button
            type="button"
            onClick={() => member && onCopy(`nalyanya.family/dashboard/members?member=${member.id}`)}
            className="ny-btn ny-btn-gold ny-btn-sm"
          >
            <Copy className="size-4" aria-hidden />
            Copy deep link
          </button>
          <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
            Done
          </button>
        </div>
      }
    >
      {member && (
        <div className="ny-stage-3d py-2">
          <TiltCard max={8}>
            <div className="ny-id-card rounded-[24px] p-6 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-accent">
                    Nalyanya Family · Kenya
                  </p>
                  <h3 className="ny-title mt-1 text-2xl !text-white">
                    {member.preferredName} {member.lastName}
                  </h3>
                  <p className="font-mono text-xs text-white/75">{member.id}</p>
                </div>
                <Avatar member={member} size={56} className="!ring-brand-accent" />
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5">
                <GenChip generation={member.generation} className="!bg-white/15 !text-white !border-white/25" />
                <BranchChip branchId={member.branchId} className="!bg-white/15 !text-white !border-white/25" />
                <span className="ny-chip !bg-brand-accent !text-brand-deep !border-transparent">{role}</span>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/15 pt-4">
                <div className="text-xs text-white/80">
                  <p>{member.homeTown}, {member.county}</p>
                  <p className="mt-0.5 text-brand-accent">Born {member.birthYear} · {member.saccoShares} Sacco shares</p>
                </div>
                <div className="grid size-16 place-items-center rounded-2xl bg-white p-2 text-brand-deep" aria-label="QR code preview">
                  <QrCode className="size-11" />
                </div>
              </div>
            </div>
          </TiltCard>
        </div>
      )}
    </ModalDialog>
  );
}

/* ─── 7. Suspend / Restore Confirm Modal (Small) ─────────────────────── */

export function SuspendMemberModal({
  member,
  isSuspended,
  onClose,
  onConfirm,
}: {
  member: Member | null;
  isSuspended: boolean;
  onClose: () => void;
  onConfirm: (memberId: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <ModalDialog
      open={Boolean(member)}
      onClose={onClose}
      size="sm"
      title={isSuspended ? "Restore member access?" : "Suspend member access?"}
      description={
        member
          ? isSuspended
            ? `Restores ${member.preferredName} ${member.lastName}'s sign-in and Sacco access.`
            : `Pauses ${member.preferredName} ${member.lastName}'s login and allocations without erasing lineage history.`
          : undefined
      }
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
            Cancel
          </button>
          <button
            type="button"
            disabled={!member || (!isSuspended && reason.trim().length < 5)}
            onClick={() => member && onConfirm(member.id, reason.trim() || "Access restored")}
            className={cn("ny-btn ny-btn-sm", isSuspended ? "ny-btn-primary" : "bg-danger text-white")}
          >
            <Ban className="size-4" aria-hidden />
            {isSuspended ? "Restore access" : "Suspend member"}
          </button>
        </div>
      }
    >
      {!isSuspended && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Reason for audit log *</span>
          <textarea
            rows={3}
            className="ny-input"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Lost phone — temporarily pausing payouts until SIM replacement"
          />
        </label>
      )}
    </ModalDialog>
  );
}

/* ─── 8. Remove Member Strict Confirm Modal (Small) ──────────────────── */

export function RemoveMemberModal({
  member,
  onClose,
  onConfirm,
}: {
  member: Member | null;
  onClose: () => void;
  onConfirm: (memberId: string, reason: string) => void;
}) {
  const [typed, setTyped] = useState("");
  const [reason, setReason] = useState("");
  const matches = member ? typed.trim().toLowerCase() === member.lastName.toLowerCase() || typed.trim() === member.id : false;

  return (
    <ModalDialog
      open={Boolean(member)}
      onClose={onClose}
      size="sm"
      title="Remove member from directory?"
      description="Destructive action: removes the duplicate or erroneous entry from the active list and logs the reason."
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
            Cancel
          </button>
          <button
            type="button"
            disabled={!member || !matches || reason.trim().length < 5}
            onClick={() => member && onConfirm(member.id, reason.trim())}
            className="ny-btn ny-btn-sm bg-danger text-white"
          >
            <Trash className="size-4" aria-hidden />
            Confirm removal
          </button>
        </div>
      }
    >
      {member && (
        <div className="space-y-4">
          <p className="rounded-2xl bg-[#fbe5e5] p-3.5 text-sm text-danger">
            Type <strong>{member.lastName}</strong> or <strong>{member.id}</strong> to confirm removing {member.preferredName} {member.lastName}.
          </p>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Confirmation text</span>
            <input className="ny-input" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={member.lastName} />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Audit reason *</span>
            <input className="ny-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Duplicate test record" />
          </label>
        </div>
      )}
    </ModalDialog>
  );
}

/* ─── 9. Review Member Request Diff Modal (Large) ────────────────────── */

export function ReviewRequestModal({
  request,
  canApprove,
  onClose,
  onDecide,
}: {
  request: MemberRequest | null;
  canApprove: boolean;
  onClose: () => void;
  onDecide: (id: string, status: "approved" | "rejected", note: string) => void;
}) {
  const [note, setNote] = useState("");
  return (
    <ModalDialog
      open={Boolean(request)}
      onClose={onClose}
      size="lg"
      title={request ? request.title : "Review request"}
      description={request ? `${request.id} · Submitted by ${request.submittedBy} · ${request.submittedAt}` : undefined}
      footer={
        request && request.status === "pending" && canApprove ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SimulatedBadge label="Writes audit entry" />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onDecide(request.id, "rejected", note.trim() || "Declined by Family Head")}
                className="ny-btn ny-btn-ghost ny-btn-sm text-danger"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => onDecide(request.id, "approved", note.trim() || "Approved by Family Head")}
                className="ny-btn ny-btn-primary ny-btn-sm"
              >
                <CircleCheck className="size-4" aria-hidden />
                Approve & apply
              </button>
            </div>
          </div>
        ) : undefined
      }
    >
      {request && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="ny-chip ny-chip-info capitalize">{request.category.replace("-", " ")}</span>
            <StatusChip status={request.status === "approved" ? "applied" : request.status} />
            {request.requiresOtp && <span className="ny-chip ny-chip-danger">Admin-gated money-routing field · OTP verified</span>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-hairline p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Current ({request.field})</p>
              <p className="mt-2 font-mono text-sm text-text-secondary">{request.before}</p>
            </div>
            <div className="rounded-2xl border border-brand-accent/60 bg-brand-accent-soft/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-secondary">Proposed</p>
              <p className="mt-2 font-mono text-sm font-semibold text-text-primary">{request.after}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-surface-0/80 p-4 text-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Member&apos;s reason</p>
            <p className="mt-1 text-text-primary">{request.reason}</p>
          </div>

          {request.status === "pending" && canApprove && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Decision note (optional)</span>
              <input
                className="ny-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Confirmed with elder by phone"
              />
            </label>
          )}
        </div>
      )}
    </ModalDialog>
  );
}

/* ─── 10. Submit New Change Request Modal (Medium) ───────────────────── */

export function NewRequestModal({
  open,
  members,
  onClose,
  onCreate,
}: {
  open: boolean;
  members: Member[];
  onClose: () => void;
  onCreate: (req: MemberRequest) => void;
}) {
  const [memberId, setMemberId] = useState(members[0]?.id ?? "NY-MBR-00019");
  const [category, setCategory] = useState<RequestCategory>("profile");
  const [title, setTitle] = useState("");
  const [afterVal, setAfterVal] = useState("");
  const [reason, setReason] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const target = members.find((m) => m.id === memberId);
    if (!target || title.trim().length < 3 || afterVal.trim().length < 2) return;
    onCreate({
      id: `NY-REQ-2026-${String(Math.floor(120 + Math.random() * 800))}`,
      memberId: target.id,
      memberName: `${target.preferredName} ${target.lastName}`,
      submittedBy: "Brian Otieno Nalyanya",
      submittedAt: "Just now · EAT",
      category,
      title: title.trim(),
      field: category === "branch" ? "Branch" : category === "relation" ? "Relation" : "Profile field",
      before: `${target.homeTown} · ${target.profession}`,
      after: afterVal.trim(),
      reason: reason.trim() || "Submitted from Members Directory",
      status: "pending",
      requiresOtp: category === "money-routing",
    });
    setTitle("");
    setAfterVal("");
    setReason("");
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="md"
      title="Suggest a profile or relation edit"
      description="Queues your proposed change for the Family Head / Council of Elders to approve."
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
            Cancel
          </button>
          <button type="submit" form="new-request-form" className="ny-btn ny-btn-primary ny-btn-sm">
            Submit to queue
          </button>
        </div>
      }
    >
      <form id="new-request-form" onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Member</span>
            <select className="ny-input" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
              {members.slice(0, 40).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.preferredName} {m.lastName}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Category</span>
            <select className="ny-input" value={category} onChange={(e) => setCategory(e.target.value as RequestCategory)}>
              <option value="profile">Profile update</option>
              <option value="relation">Relation link</option>
              <option value="branch">Branch transfer</option>
              <option value="guardian">Ward guardian</option>
              <option value="money-routing">M-Pesa / Bank (OTP gated)</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Summary title *</span>
          <input className="ny-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Update phone number or add spouse" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Proposed new value *</span>
          <input className="ny-input" value={afterVal} onChange={(e) => setAfterVal(e.target.value)} placeholder="e.g. Transferred to Eldoret · Caleb branch" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Reason</span>
          <textarea rows={2} className="ny-input" value={reason} onChange={(e) => setReason(e.target.value)} />
        </label>
      </form>
    </ModalDialog>
  );
}

/* ─── 11. Bulk Broadcast 2-Step Modal (Medium Multi-Step) ────────────── */

export function BulkBroadcastModal({
  open,
  recipients,
  onClose,
  onSend,
}: {
  open: boolean;
  recipients: Member[];
  onClose: () => void;
  onSend: (count: number, channel: string) => void;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [channel, setChannel] = useState<"Smart (WhatsApp → SMS)" | "SMS only" | "Email">("Smart (WhatsApp → SMS)");
  const [message, setMessage] = useState("Jambo {first_name}, quick reminder from the Nalyanya family office: check the calendar for this weekend's branch call.");

  const waCount = recipients.filter((r) => r.whatsapp).length;
  const smsFallback = recipients.length - waCount;
  const smsCost = (channel === "SMS only" ? recipients.length : smsFallback) * 0.8;

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="md"
      title={`Broadcast to ${recipients.length} selected members`}
      description="Routes to WhatsApp where available and falls back to SMS for elders on basic phones (SIMULATED)."
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-text-tertiary">Step {step} of 2</span>
          <div className="flex gap-2">
            {step === 2 ? (
              <button type="button" onClick={() => setStep(1)} className="ny-btn ny-btn-ghost ny-btn-sm">
                Back
              </button>
            ) : (
              <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
                Cancel
              </button>
            )}
            {step === 1 ? (
              <button type="button" onClick={() => setStep(2)} className="ny-btn ny-btn-primary ny-btn-sm">
                Preview cost & routing →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onSend(recipients.length, channel);
                  setStep(1);
                }}
                className="ny-btn ny-btn-gold ny-btn-sm"
              >
                <Send className="size-4" aria-hidden />
                Dispatch (SIMULATED)
              </button>
            )}
          </div>
        </div>
      }
    >
      {step === 1 ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(["Smart (WhatsApp → SMS)", "SMS only", "Email"] as const).map((c) => (
              <button key={c} type="button" onClick={() => setChannel(c)} className={cn("ny-chip cursor-pointer", channel === c && "ny-chip-solid")}>
                {c}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Message body (supports {"{first_name}"})</span>
            <textarea rows={4} className="ny-input" value={message} onChange={(e) => setMessage(e.target.value)} />
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-surface-0/80 p-3">
              <p className="text-xs text-text-tertiary">WhatsApp</p>
              <p className="ny-title mt-1 text-2xl">{channel === "Smart (WhatsApp → SMS)" ? waCount : 0}</p>
            </div>
            <div className="rounded-2xl bg-surface-0/80 p-3">
              <p className="text-xs text-text-tertiary">SMS</p>
              <p className="ny-title mt-1 text-2xl">{channel === "SMS only" ? recipients.length : channel === "Email" ? 0 : smsFallback}</p>
            </div>
            <div className="rounded-2xl bg-surface-0/80 p-3">
              <p className="text-xs text-text-tertiary">Est. SMS cost</p>
              <p className="ny-title mt-1 text-2xl">KES {smsCost.toFixed(0)}</p>
            </div>
          </div>
          <p className="rounded-2xl border border-dashed border-brand-secondary/50 p-3.5 text-xs text-text-secondary">
            Sample rendered for <strong>{recipients[0]?.preferredName ?? "Member"}</strong>:{" "}
            “{message.replace("{first_name}", recipients[0]?.preferredName ?? "Relative")}”
          </p>
        </div>
      )}
    </ModalDialog>
  );
}

/* ─── 12. Bulk Branch Transfer Modal (Small/Medium) ──────────────────── */

export function BulkBranchModal({
  open,
  count,
  onClose,
  onTransfer,
}: {
  open: boolean;
  count: number;
  onClose: () => void;
  onTransfer: (branchId: string, reason: string) => void;
}) {
  const [branchId, setBranchId] = useState(BRANCHES[0].id);
  const [reason, setReason] = useState("");
  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="sm"
      title={`Transfer ${count} members to branch`}
      description="Moves selected households into the chosen branch and records an audit note."
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onTransfer(branchId, reason.trim() || "Bulk branch update")}
            className="ny-btn ny-btn-primary ny-btn-sm"
          >
            Transfer branch
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Destination branch</span>
          <select className="ny-input" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            {BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.county})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Reason</span>
          <input className="ny-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Branch consolidation" />
        </label>
      </div>
    </ModalDialog>
  );
}

/* ─── 13. Bulk CSV Import 3-Step Wizard (Large Multi-Step) ───────────── */

export function BulkImportWizard({
  open,
  nextIdNumber,
  onClose,
  onImport,
}: {
  open: boolean;
  nextIdNumber: number;
  onClose: () => void;
  onImport: (newMembers: Member[]) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [csv, setCsv] = useState(CSV_SAMPLE_ROWS);

  const parsed = csv
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.split(",").map((s) => s.trim()))
    .filter((cols) => cols.length >= 8 && cols[0] && cols[2]);

  const commit = () => {
    const created: Member[] = parsed.map((cols, idx) => {
      const birthYear = Number(cols[4]) || 1998;
      return {
        id: `NY-MBR-${String(nextIdNumber + idx).padStart(5, "0")}`,
        firstName: cols[0],
        middleName: cols[1] || undefined,
        lastName: cols[2],
        preferredName: cols[0],
        gender: cols[3] === "male" ? "male" : "female",
        generation: 3,
        birthYear,
        branchId: BRANCHES.some((b) => b.id === cols[5]) ? cols[5] : "kimilili-joseph",
        parentId: "NY-MBR-00003",
        spouseId: null,
        role: "Cousin · imported",
        homeTown: cols[6] || "Kimilili",
        county: cols[7] || "Bungoma",
        profession: cols[8] || "Family member",
        phone: cols[9] || undefined,
        whatsapp: true,
        preferredChannel: "WhatsApp",
        bio: `${cols[0]} was added during the May branch spreadsheet import.`,
        walletKes: 0,
        saccoShares: 0,
        activeLoans: 0,
        contributionsKes: 0,
        lifeEvents: [{ year: birthYear, label: `Born in ${cols[6] || "Bungoma"}` }, { year: DATA_YEAR, label: "Imported into Nalyanya directory" }],
      };
    });
    onImport(created);
    setStep(1);
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Bulk CSV member import"
      description="Import relatives from a branch spreadsheet in three guided steps."
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-text-tertiary">Step {step} of 3 · {parsed.length} valid rows</span>
          <div className="flex gap-2">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => (s - 1) as 1 | 2)} className="ny-btn ny-btn-ghost ny-btn-sm">
                Back
              </button>
            ) : (
              <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
                Cancel
              </button>
            )}
            {step < 3 ? (
              <button type="button" disabled={parsed.length === 0} onClick={() => setStep((s) => (s + 1) as 2 | 3)} className="ny-btn ny-btn-primary ny-btn-sm">
                Continue →
              </button>
            ) : (
              <button type="button" disabled={parsed.length === 0} onClick={commit} className="ny-btn ny-btn-gold ny-btn-sm">
                <Upload className="size-4" aria-hidden />
                Import {parsed.length} members
              </button>
            )}
          </div>
        </div>
      }
    >
      {step === 1 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Paste CSV rows (header included)</span>
            <button type="button" onClick={() => setCsv(CSV_SAMPLE_ROWS)} className="ny-btn ny-btn-quiet ny-btn-sm">
              <FileSpreadsheet className="size-4" aria-hidden /> Load sample branch CSV
            </button>
          </div>
          <textarea rows={7} className="ny-input font-mono text-xs" value={csv} onChange={(e) => setCsv(e.target.value)} />
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">Detected columns and Kenyan format validation:</p>
          <div className="overflow-x-auto rounded-2xl border border-hairline">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-0/80 text-text-tertiary">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Born</th>
                  <th className="px-3 py-2">Branch</th>
                  <th className="px-3 py-2">County</th>
                  <th className="px-3 py-2">Phone</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {parsed.map((cols, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 font-semibold">{cols[0]} {cols[2]}</td>
                    <td className="px-3 py-2">{cols[4]}</td>
                    <td className="px-3 py-2">{cols[5]}</td>
                    <td className="px-3 py-2">{cols[7]}</td>
                    <td className="px-3 py-2 font-mono">{cols[9] || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-2xl border border-brand-accent/60 bg-brand-accent-soft/35 p-5 text-sm">
          <p className="font-semibold text-text-primary">Ready to insert {parsed.length} new relatives</p>
          <p className="mt-1 text-text-secondary">
            Each imported member receives a unique NY-MBR ID, lights up at the top of the directory table with a gold entrance highlight, and logs
            to the session activity journal.
          </p>
        </div>
      )}
    </ModalDialog>
  );
}

/* ─── 14. Merge Duplicate Members 3-Step Wizard (Large Multi-Step) ───── */

export function MergeDuplicatesWizard({
  open,
  members,
  onClose,
  onMerge,
}: {
  open: boolean;
  members: Member[];
  onClose: () => void;
  onMerge: (primaryId: string, duplicateId: string) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [pickedId, setPickedId] = useState(DUPLICATE_CANDIDATES[0].id);
  const candidate = DUPLICATE_CANDIDATES.find((c) => c.id === pickedId) ?? DUPLICATE_CANDIDATES[0];
  const primary = members.find((m) => m.id === candidate.primaryId);
  const duplicate = members.find((m) => m.id === candidate.duplicateId);

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Merge duplicate member records"
      description="Safely combine duplicate entries while keeping Sacco shares, wallet balances and lineage links intact."
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-text-tertiary">Step {step} of 3</span>
          <div className="flex gap-2">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => (s - 1) as 1 | 2)} className="ny-btn ny-btn-ghost ny-btn-sm">
                Back
              </button>
            ) : (
              <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
                Cancel
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => setStep((s) => (s + 1) as 2 | 3)} className="ny-btn ny-btn-primary ny-btn-sm">
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onMerge(candidate.primaryId, candidate.duplicateId);
                  setStep(1);
                }}
                className="ny-btn ny-btn-gold ny-btn-sm"
              >
                <Merge className="size-4" aria-hidden />
                Merge & archive duplicate
              </button>
            )}
          </div>
        </div>
      }
    >
      {step === 1 && (
        <div className="space-y-3">
          {DUPLICATE_CANDIDATES.map((cand) => {
            const p = members.find((m) => m.id === cand.primaryId);
            const d = members.find((m) => m.id === cand.duplicateId);
            return (
              <label
                key={cand.id}
                className={cn(
                  "flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4 transition",
                  pickedId === cand.id ? "border-brand-primary bg-brand-primary/8" : "border-hairline bg-surface-0/70",
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="dup-pair"
                    checked={pickedId === cand.id}
                    onChange={() => setPickedId(cand.id)}
                    className="mt-1 size-4 accent-brand-primary"
                  />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {p ? `${p.preferredName} ${p.lastName}` : cand.primaryId} ({cand.primaryId}) ↔{" "}
                      {d ? `${d.preferredName} ${d.lastName}` : cand.duplicateId} ({cand.duplicateId})
                    </p>
                    <p className="mt-1 text-xs text-text-secondary">{cand.reason}</p>
                  </div>
                </div>
                <span className="ny-chip ny-chip-warning shrink-0">{cand.confidence}% match</span>
              </label>
            );
          })}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">Primary profile kept ({primary?.id}); secondary record folded in:</p>
          <div className="divide-y divide-hairline rounded-2xl border border-hairline">
            {candidate.conflicts.map((c) => (
              <div key={c.field} className="grid gap-2 p-3.5 sm:grid-cols-3 sm:items-center">
                <span className="text-xs font-semibold uppercase text-text-tertiary">{c.field}</span>
                <span className="ny-chip ny-chip-success w-fit">Keep: {c.primaryVal}</span>
                <span className="text-xs text-text-tertiary line-through">Fold: {c.duplicateVal}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3 rounded-2xl border border-brand-accent/60 bg-brand-accent-soft/35 p-5 text-sm">
          <p className="flex items-center gap-2 font-semibold text-text-primary">
            <Check className="size-4 text-success" aria-hidden />
            Ready to merge {duplicate?.preferredName ?? candidate.duplicateId} into {primary?.preferredName ?? candidate.primaryId}
          </p>
          <p className="text-text-secondary">
            Wallet balances and Sacco shares are summed into the primary member, and the duplicate record is archived cleanly.
          </p>
        </div>
      )}
    </ModalDialog>
  );
}

/* ─── 15. Export Directory Modal (Small/Medium) ──────────────────────── */

export function ExportDirectoryModal({
  open,
  filteredCount,
  totalCount,
  onClose,
  onExport,
}: {
  open: boolean;
  filteredCount: number;
  totalCount: number;
  onClose: () => void;
  onExport: (format: "csv" | "json", scope: "filtered" | "all") => void;
}) {
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [scope, setScope] = useState<"filtered" | "all">("filtered");

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Export family directory"
      description="Phone numbers stay masked in exports by default to protect family privacy (DPA 2019 Kenya)."
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
            Cancel
          </button>
          <button type="button" onClick={() => onExport(format, scope)} className="ny-btn ny-btn-primary ny-btn-sm">
            <Download className="size-4" aria-hidden />
            Download {format.toUpperCase()}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setScope("filtered")}
            className={cn("rounded-2xl border p-3 text-left text-sm", scope === "filtered" ? "border-brand-primary bg-brand-primary/8" : "border-hairline")}
          >
            <strong className="block">Current view</strong>
            <span className="text-xs text-text-tertiary">{filteredCount} members</span>
          </button>
          <button
            type="button"
            onClick={() => setScope("all")}
            className={cn("rounded-2xl border p-3 text-left text-sm", scope === "all" ? "border-brand-primary bg-brand-primary/8" : "border-hairline")}
          >
            <strong className="block">Full directory</strong>
            <span className="text-xs text-text-tertiary">{totalCount} members</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(["csv", "json"] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => setFormat(fmt)}
              className={cn("rounded-2xl border p-3 text-left text-sm uppercase", format === fmt ? "border-brand-accent bg-brand-accent-soft/45" : "border-hairline")}
            >
              <strong className="block">{fmt}</strong>
              <span className="text-xs normal-case text-text-tertiary">
                {fmt === "csv" ? "Excel / Google Sheets" : "Structured archive"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </ModalDialog>
  );
}

/* helper re-export so modals know age formatting if needed */
export { ageOf };
