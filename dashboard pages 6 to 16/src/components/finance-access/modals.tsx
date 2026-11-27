"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Copy,
  Download,
  Fingerprint,
  Link2,
  Loader2,
  QrCode,
  RotateCcw,
  Send,
  ShieldCheck,
  Smartphone,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import { Modal, Drawer } from "@/components/ui/overlay";
import { Stepper } from "@/components/ui/primitives";
import { kes, fmt, kesShort } from "@/lib/format";
import {
  type Allocation,
  type AllocPurpose,
  type AuditEntry,
  type FaRules,
  type LedgerEntry,
  type OtpChannel,
  type PayChannel,
  type Recipient,
  ceilings,
  channelLabel,
  otpChannelLabel,
  otpChannels,
  payChannels,
  purposeLabel,
  purposeTone,
  recipients,
  rules as seedRules,
  statusMeta,
} from "@/data/dashboard/finance-access";
import { PseudoQr } from "./phone-preview";

const steps = ["Recipient", "Amount", "Purpose", "Channel", "PIN & OTP", "Expiry", "Review", "Issued"];
const channelIcon = { mpesa: Smartphone, bank: Building2, internal: Wallet } as const;

export type NewAllocation = {
  id: string;
  ref: string;
  token: string;
  recipient: string;
  recipientId: string | null;
  phone: string;
  amount: number;
  purpose: AllocPurpose;
  channel: PayChannel;
  status: "draft";
  issuedAt: string;
  expiresAt: string;
  expiryInSec: number;
  otpChannel: OtpChannel;
  pinRequired: boolean;
  note: string;
};

/* ------------------------------------------------------------------ */
/* S2 — Allocate wizard (8-step multi-step modal)                       */
/* ------------------------------------------------------------------ */
export function AllocateWizard({
  open,
  onClose,
  preselect,
  onIssue,
  onPickRecipient,
}: {
  open: boolean;
  onClose: () => void;
  preselect: string | null;
  onIssue: (a: NewAllocation) => void;
  onPickRecipient: () => void;
}) {
  const [step, setStep] = useState(0);
  const [recipientId, setRecipientId] = useState<string>(preselect ?? "e1");
  const [customPhone, setCustomPhone] = useState("");
  const [amount, setAmount] = useState("12000");
  const [purpose, setPurpose] = useState<AllocPurpose>("medical");
  const [channel, setChannel] = useState<PayChannel>("mpesa");
  const [pinRequired, setPinRequired] = useState(true);
  const [otpChannel, setOtpChannel] = useState<OtpChannel>("sms");
  const [expiryHrs, setExpiryHrs] = useState(24);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const picked = recipients.find((r) => r.id === recipientId) ?? recipients[0];
  const isCustom = recipientId === "custom";
  const amt = Number(amount) || 0;
  const canNext =
    step === 0 ? (isCustom ? customPhone.replace(/\D/g, "").length >= 9 : !!picked) : step === 1 ? amt > 0 : true;

  const issue = () => {
    setBusy(true);
    window.setTimeout(() => {
      const seq = Math.floor(Math.random() * 9000) + 1000;
      onIssue({
        id: `a-${seq}`,
        ref: `NY-ALC-2025-00${seq}`,
        token: `NY-RCV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        recipient: isCustom ? "Non-member elder" : picked.name,
        recipientId: isCustom ? null : picked.id,
        phone: isCustom ? customPhone : picked.phone,
        amount: amt,
        purpose,
        channel,
        status: "draft",
        issuedAt: "18 Nov · 09:45",
        expiresAt: `19 Nov · 09:45`,
        expiryInSec: expiryHrs * 3600,
        otpChannel,
        pinRequired,
        note: note || `${purposeLabel[purpose]} allocation issued from the finance-access page.`,
      });
      setBusy(false);
      onClose();
    }, 900);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Allocate money to a member"
      sub="Issues a no-login receive link · PIN + OTP · SIMULATED rails"
      size="lg"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < steps.length - 1 ? (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={busy} onClick={issue}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Done
            </button>
          )}
        </>
      }
    >
      <Stepper total={steps.length} current={step} labels={steps} />

      {step === 0 && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="ny-hud">Who is receiving?</p>
            <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={onPickRecipient}>
              <UserRound className="h-3.5 w-3.5" /> Full member picker
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {recipients.slice(0, 5).map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRecipientId(r.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                  recipientId === r.id ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"
                }`}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-primary text-[0.72rem] font-bold text-on-brand">{r.initials}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{r.name}</span>
                  <span className="ny-hud block !text-[0.55rem]">
                    {r.relation} · {r.phone}
                  </span>
                </span>
                {r.elder && <span className="ny-chip ny-chip-warn shrink-0">elder</span>}
                {!r.member && <span className="ny-chip ny-chip-neutral shrink-0">non-member</span>}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setRecipientId("custom")}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                isCustom ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"
              }`}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-strong text-text-secondary">
                <Link2 className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">Someone outside the family list</span>
                <span className="ny-hud block !text-[0.55rem]">Any phone number · they need no account</span>
              </span>
            </button>
            {isCustom && (
              <div>
                <label className="ny-label" htmlFor="aw-phone">Phone number</label>
                <input id="aw-phone" className="ny-input ny-num" value={customPhone} onChange={(e) => setCustomPhone(e.target.value)} placeholder="+254712 345 678" />
              </div>
            )}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <p className="ny-hud">Amount · KES</p>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {[2000, 5000, 12000, 25000, 50000].map((v) => (
              <button key={v} type="button" onClick={() => setAmount(String(v))} className={`ny-num rounded-lg border px-2 py-3 text-sm font-semibold transition ${amt === v ? "border-brand-primary bg-brand-primary text-on-brand" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                {fmt(v)}
              </button>
            ))}
          </div>
          <label className="ny-label mt-4" htmlFor="aw-amt">Or type an amount</label>
          <input id="aw-amt" inputMode="numeric" className="ny-input ny-num" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} />
          <div className="ny-inset mt-3 grid grid-cols-2 gap-3 px-3.5 py-3 text-sm sm:grid-cols-3">
            <span>
              <span className="ny-hud block">Your per-tx cap</span>
              <span className="ny-num font-semibold">{kesShort(seedRules.perTxCap)}</span>
            </span>
            <span>
              <span className="ny-hud block">Left today</span>
              <span className="ny-num font-semibold">{kesShort(seedRules.dailyCap - 79000)}</span>
            </span>
            <span>
              <span className="ny-hud block">4-eyes above</span>
              <span className="ny-num font-semibold">{kesShort(seedRules.fourEyesAbove)}</span>
            </span>
          </div>
          {amt > seedRules.fourEyesAbove && (
            <p className="mt-2 text-sm text-brand-secondary">Above {kes(seedRules.fourEyesAbove)} — a second family head must approve before release.</p>
          )}
          {amt > seedRules.perTxCap && <p className="ny-chip ny-chip-danger mt-2">Above your per-transaction cap</p>}
        </div>
      )}

      {step === 2 && (
        <div>
          <span className="ny-label">Purpose</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["personal", "family", "medical", "school", "emergency"] as AllocPurpose[]).map((p) => (
              <button key={p} type="button" onClick={() => setPurpose(p)} className={`rounded-xl border p-3 text-left transition ${purpose === p ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{purposeLabel[p]}</span>
                  <span className={`ny-chip ${purposeTone[p]}`}>{p === "emergency" ? "same day" : "24h link"}</span>
                </span>
              </button>
            ))}
          </div>
          <label className="ny-label mt-4" htmlFor="aw-note">Note (shown to the elder)</label>
          <textarea id="aw-note" className="ny-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="For your clinic review on Thursday. Pole sana." />
          <p className="ny-hud mt-1.5">{note.length}/180 · plain language, big type on the elder&apos;s screen</p>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-2 sm:grid-cols-3">
          {payChannels.map((c) => {
            const Icon = channelIcon[c.id];
            return (
              <button key={c.id} type="button" onClick={() => setChannel(c.id)} className={`rounded-xl border p-3.5 text-left transition ${channel === c.id ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-brand-primary" /> {c.label}
                  </span>
                  {c.sim ? <span className="ny-chip ny-chip-sim">SIMULATED</span> : <span className="ny-chip ny-chip-ok">local</span>}
                </span>
                <span className="mt-1.5 block text-xs leading-relaxed text-text-secondary">{c.detail}</span>
                <span className="ny-hud mt-1.5 block !text-[0.55rem]">settles in {c.eta}</span>
              </button>
            );
          })}
          <p className="ny-chip ny-chip-sim sm:col-span-3">Release resolves to “Ready — connects when the backend is wired”</p>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3">
            <div>
              <p className="text-sm font-semibold">Require the elder&apos;s 4-digit PIN</p>
              <p className="ny-hud mt-0.5 !text-[0.55rem]">Recommended · 3 tries, then a 15 minute lock</p>
            </div>
            <button type="button" role="switch" aria-checked={pinRequired} aria-label="Require PIN" className="fa-switch" onClick={() => setPinRequired((v) => !v)} />
          </div>
          <div>
            <span className="ny-label">Send the one-time code by</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {otpChannels.map((c) => (
                <button key={c.id} type="button" onClick={() => setOtpChannel(c.id)} className={`rounded-xl border p-3 text-left transition ${otpChannel === c.id ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                  <span className="block text-sm font-semibold">{c.label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-text-secondary">{c.detail}</span>
                  <span className="ny-hud mt-1.5 block !text-[0.55rem]">{c.cost}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="ny-chip ny-chip-sim">OTP delivery SIMULATED in Phase 1 · prefilled demo code in the preview</p>
        </div>
      )}

      {step === 5 && (
        <div>
          <span className="ny-label">Link expires after</span>
          <div className="flex flex-wrap gap-2">
            {[6, 12, 24, 48, 72].map((h) => (
              <button key={h} type="button" onClick={() => setExpiryHrs(h)} className={`ny-chip ny-touch ${expiryHrs === h ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                {h} hours
              </button>
            ))}
          </div>
          <div className="ny-inset mt-4 px-3.5 py-3 text-sm text-text-secondary">
            <p>
              After <strong className="text-text-primary">{expiryHrs} hours</strong> the link dies automatically. Nothing was
              paid out meanwhile, so an expired link costs the family nothing — just issue a new one.
            </p>
            <p className="ny-hud mt-2 !text-[0.55rem]">Maximum {seedRules.maxExpiryHrs} hours · default {seedRules.defaultExpiryHrs} hours</p>
          </div>
        </div>
      )}

      {step === 6 && (
        <div>
          <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
            {[
              ["Recipient", isCustom ? `${customPhone} (non-member)` : `${picked.name} · ${picked.phone}`],
              ["Amount", kes(amt)],
              ["Purpose", purposeLabel[purpose]],
              ["Channel", channelLabel[channel]],
              ["PIN required", pinRequired ? "Yes · 3 tries, 15 min lock" : "No"],
              ["One-time code", `${otpChannelLabel[otpChannel]} · 3 tries, 15 min lock`],
              ["Link expires", `in ${expiryHrs} hours`],
              ["Note", note || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <dt className="text-text-secondary">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="ny-inset mt-3 px-3.5 py-3">
            <p className="ny-hud">What happens on issue</p>
            <p className="mt-1.5 text-sm text-text-secondary">
              A token like <span className="fa-token font-semibold text-text-primary">NY-RCV-8H2K4Q</span> is created and the
              link is sent to the elder. No money moves until they complete PIN + OTP — then the payout runs as a{" "}
              <strong className="text-text-primary">SIMULATED</strong> B2C.
            </p>
          </div>
          <p className="ny-chip ny-chip-sim mt-3">Ready — connects when the backend is wired</p>
        </div>
      )}

      {step === 7 && (
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[rgba(46,125,50,0.14)] text-success">
            <Check className="h-6 w-6" />
          </span>
          <p className="ny-display mt-3 text-xl">Link issued</p>
          <p className="mt-1.5 text-sm text-text-secondary">
            {kes(amt)} for {isCustom ? customPhone : picked.name.split(" ")[0]} · expires in {expiryHrs} hours
          </p>
          <div className="fa-qr-card mx-auto mt-4 w-[172px] p-3">
            <PseudoQr value="nalyanya.app/r/NY-RCV-preview" size={148} />
            <p className="ny-hud mt-2 !text-[0.52rem]">QR preview · SIMULATED link</p>
          </div>
          <p className="ny-chip ny-chip-sim mt-4">Money leg SIMULATED · the elder flow is live in the preview</p>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* QR / link card                                                       */
/* ------------------------------------------------------------------ */
export function QrModal({ open, onClose, allocation, onCopy, onResend }: { open: boolean; onClose: () => void; allocation: Allocation | null; onCopy: () => void; onResend: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Receive link"
      sub={allocation ? `${allocation.ref} · ${allocation.recipient}` : ""}
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onResend}>
            <Send className="h-3.5 w-3.5" /> Send again
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onCopy}>
            <Copy className="h-3.5 w-3.5" /> Copy link
          </button>
        </>
      }
    >
      {allocation && (
        <>
          <div className="fa-qr-card p-4">
            <div className="fa-reveal is-open">
              <PseudoQr value={allocation.token} size={168} />
            </div>
            <p className="ny-hud mt-3 text-center !text-[0.55rem]">Scan or send the link — no app needed</p>
            <p className="fa-token mt-1 text-center text-sm font-semibold">nalyanya.app/r/{allocation.token.replace("NY-RCV-", "").toLowerCase()}</p>
          </div>
          <dl className="mt-3 divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
            {[
              ["Amount", kes(allocation.amount)],
              ["Purpose", purposeLabel[allocation.purpose]],
              ["PIN", allocation.pinRequired ? "Required · 3 tries" : "Not required"],
              ["Code via", otpChannelLabel[allocation.otpChannel]],
              ["Expires", allocation.expiresAt],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <dt className="text-text-secondary">{k}</dt>
                <dd className="ny-num text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="ny-chip ny-chip-sim mt-3">QR preview · SIMULATED link</p>
        </>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Revoke — confirm + reason + 2FA                                      */
/* ------------------------------------------------------------------ */
export function RevokeModal({ open, onClose, allocation, onConfirm }: { open: boolean; onClose: () => void; allocation: Allocation | null; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const ok = reason.trim().length >= 6 && code.length === 6;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Revoke this link?"
      sub={allocation ? `${allocation.ref} · ${kes(allocation.amount)} · ${allocation.recipient}` : ""}
      size="sm"
      tone="danger"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Keep it
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-danger ny-btn-sm"
            disabled={!ok}
            onClick={() => {
              onConfirm(reason);
              setReason("");
              setCode("");
              onClose();
            }}
          >
            <X className="h-3.5 w-3.5" /> Revoke link
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-xl border border-[rgba(198,40,40,0.3)] bg-[rgba(198,40,40,0.07)] px-4 py-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
        <p className="text-sm leading-relaxed text-text-secondary">
          The elder can no longer receive this money, and the link shows a clear “this link was cancelled” page. The
          amount stays in the family account so you can issue a fresh link.
        </p>
      </div>
      <label className="ny-label mt-4" htmlFor="rv-reason">Reason (logged)</label>
      <input id="rv-reason" className="ny-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Sent to the wrong number" />
      <label className="ny-label mt-3" htmlFor="rv-code">
        <Fingerprint className="mr-1 inline h-3.5 w-3.5" /> 2FA code
      </label>
      <input id="rv-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · dev mode accepts any 6 digits</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Resend — channel choice                                              */
/* ------------------------------------------------------------------ */
export function ResendModal({ open, onClose, allocation, onSend }: { open: boolean; onClose: () => void; allocation: Allocation | null; onSend: (ch: OtpChannel) => void }) {
  const [ch, setCh] = useState<OtpChannel>("sms");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send the link again"
      sub={allocation ? `To ${allocation.recipient} · ${allocation.phone}` : ""}
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onSend(ch)}>
            <Send className="h-3.5 w-3.5" /> Send (SIMULATED)
          </button>
        </>
      }
    >
      <div className="grid gap-2 sm:grid-cols-3">
        {otpChannels.map((c) => (
          <button key={c.id} type="button" onClick={() => setCh(c.id)} className={`rounded-xl border p-3 text-left transition ${ch === c.id ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
            <span className="block text-sm font-semibold">{c.label}</span>
            <span className="ny-hud mt-1 block !text-[0.55rem]">{c.cost}</span>
          </button>
        ))}
      </div>
      <div className="ny-inset mt-4 px-3.5 py-3">
        <p className="ny-hud">Message preview</p>
        <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
          “Habari. {allocation?.recipient.split(" ")[0] ?? ""}, you have been sent {kes(allocation?.amount ?? 0)} from the
          Nalyanya family. Open nalyanya.app/r/{(allocation?.token ?? "").replace("NY-RCV-", "").toLowerCase()} and enter
          your PIN.”
        </p>
      </div>
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED delivery · no message leaves this device</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Mark settled                                                         */
/* ------------------------------------------------------------------ */
export function SettleModal({ open, onClose, allocation, onConfirm }: { open: boolean; onClose: () => void; allocation: Allocation | null; onConfirm: (ref: string) => void }) {
  const [ref, setRef] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mark as settled"
      sub={allocation ? `${allocation.ref} · ${kes(allocation.amount)}` : ""}
      size="sm"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Not yet
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-accent ny-btn-sm"
            onClick={() => {
              onConfirm(ref || "B2C-MANUAL");
              setRef("");
              onClose();
            }}
          >
            <Check className="h-3.5 w-3.5" /> Mark settled
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-text-secondary">
        Use this when the elder confirms the money arrived but the confirmation webhook has not come back yet. It posts a
        ledger entry and an audit row naming you as the actor.
      </p>
      <label className="ny-label mt-4" htmlFor="st-ref">Payout reference (optional)</label>
      <input id="st-ref" className="ny-input ny-num" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="B2C-RKX7H8KP" />
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · the real settle arrives via /api/webhooks/receive/:token</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Change receive PIN (admin-gated)                                     */
/* ------------------------------------------------------------------ */
export function PinChangeModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (pin: string) => void }) {
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const ok = otp.length === 6 && pin.length === 4 && pin === pin2;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change the elder's receive PIN"
      sub="Needs a code on their current number and an admin co-sign"
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            disabled={!ok}
            onClick={() => {
              onSave(pin);
              setOtp("");
              setPin("");
              setPin2("");
              onClose();
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Save new PIN
          </button>
        </>
      }
    >
      <label className="ny-label" htmlFor="pc-otp">Code sent to +2547 ··· 7890</label>
      <input id="pc-otp" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.35em]" placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="ny-label" htmlFor="pc-p1">New 4-digit PIN</label>
          <input id="pc-p1" inputMode="numeric" maxLength={4} className="ny-input ny-num tracking-[0.3em]" placeholder="••••" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
        </div>
        <div>
          <label className="ny-label" htmlFor="pc-p2">Repeat it</label>
          <input id="pc-p2" inputMode="numeric" maxLength={4} className="ny-input ny-num tracking-[0.3em]" placeholder="••••" value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, "").slice(0, 4))} />
        </div>
      </div>
      {pin && pin2 && pin !== pin2 && <p className="ny-chip ny-chip-danger mt-3">The two PINs do not match</p>}
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · dev mode accepts any 6-digit code</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Rules & limits (admin)                                               */
/* ------------------------------------------------------------------ */
export function RulesLimitsModal({ open, onClose, rules, onSave }: { open: boolean; onClose: () => void; rules: FaRules; onSave: (r: FaRules) => void }) {
  const [r, setR] = useState<FaRules>(rules);
  const [code, setCode] = useState("");
  const set = <K extends keyof FaRules>(k: K, v: FaRules[K]) => setR((prev) => ({ ...prev, [k]: v }));
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Rules & limits"
      sub="Family-wide · changing these needs 2FA and writes an audit row"
      size="lg"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            disabled={code.length < 6}
            onClick={() => {
              onSave(r);
              setCode("");
              onClose();
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" /> Save rules
          </button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="ny-label" htmlFor="rl-tx">Per-transaction cap (KES)</label>
          <input id="rl-tx" inputMode="numeric" className="ny-input ny-num" value={r.perTxCap} onChange={(e) => set("perTxCap", Number(e.target.value.replace(/[^0-9]/g, "")) || 0)} />
        </div>
        <div>
          <label className="ny-label" htmlFor="rl-day">Daily cap (KES)</label>
          <input id="rl-day" inputMode="numeric" className="ny-input ny-num" value={r.dailyCap} onChange={(e) => set("dailyCap", Number(e.target.value.replace(/[^0-9]/g, "")) || 0)} />
        </div>
        <div>
          <label className="ny-label" htmlFor="rl-mem">Per-member monthly cap (KES)</label>
          <input id="rl-mem" inputMode="numeric" className="ny-input ny-num" value={r.memberMonthlyCap} onChange={(e) => set("memberMonthlyCap", Number(e.target.value.replace(/[^0-9]/g, "")) || 0)} />
        </div>
        <div>
          <label className="ny-label" htmlFor="rl-4e">4-eyes approval above (KES)</label>
          <input id="rl-4e" inputMode="numeric" className="ny-input ny-num" value={r.fourEyesAbove} onChange={(e) => set("fourEyesAbove", Number(e.target.value.replace(/[^0-9]/g, "")) || 0)} />
        </div>
        <div>
          <span className="ny-label">PIN tries before lock · {r.pinAttempts}</span>
          <input type="range" min={1} max={5} value={r.pinAttempts} onChange={(e) => set("pinAttempts", Number(e.target.value))} className="w-full accent-[var(--color-brand-primary)]" aria-label="PIN attempts" />
        </div>
        <div>
          <span className="ny-label">OTP tries before lock · {r.otpAttempts}</span>
          <input type="range" min={1} max={5} value={r.otpAttempts} onChange={(e) => set("otpAttempts", Number(e.target.value))} className="w-full accent-[var(--color-brand-primary)]" aria-label="OTP attempts" />
        </div>
        <div>
          <span className="ny-label">Lock length · {r.lockMinutes} minutes</span>
          <input type="range" min={5} max={60} step={5} value={r.lockMinutes} onChange={(e) => set("lockMinutes", Number(e.target.value))} className="w-full accent-[var(--color-brand-primary)]" aria-label="Lock length" />
        </div>
        <div>
          <span className="ny-label">Default link expiry · {r.defaultExpiryHrs}h</span>
          <input type="range" min={6} max={72} step={6} value={r.defaultExpiryHrs} onChange={(e) => set("defaultExpiryHrs", Number(e.target.value))} className="w-full accent-[var(--color-brand-primary)]" aria-label="Default expiry" />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3">
          <div>
            <p className="text-sm font-semibold">Require the 4-digit PIN by default</p>
            <p className="ny-hud mt-0.5 !text-[0.55rem]">Strongly recommended for elders</p>
          </div>
          <button type="button" role="switch" aria-checked={r.pinRequired} aria-label="Require PIN by default" className="fa-switch" onClick={() => set("pinRequired", !r.pinRequired)} />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3">
          <div>
            <p className="text-sm font-semibold">Whitelist only approved members</p>
            <p className="ny-hud mt-0.5 !text-[0.55rem]">When on, only listed people can receive allocations</p>
          </div>
          <button type="button" role="switch" aria-checked={r.whitelist} aria-label="Whitelist only" className="fa-switch" onClick={() => set("whitelist", !r.whitelist)} />
        </div>
      </div>

      <label className="ny-label mt-4" htmlFor="rl-code">
        <Fingerprint className="mr-1 inline h-3.5 w-3.5" /> 2FA code
      </label>
      <input id="rl-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · dev mode accepts any 6 digits</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Ceiling matrix                                                       */
/* ------------------------------------------------------------------ */
export function CeilingMatrixModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Who can allocate what"
      sub="Ceilings by role · hidden, never disabled"
      size="md"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
      <div className="cc-table-wrap">
        <table className="cc-table">
          <thead>
            <tr>
              <th>Role</th>
              <th className="text-right">Per transaction</th>
              <th className="text-right">Per day</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {ceilings.map((c) => (
              <tr key={c.role}>
                <td data-label="Role" className="font-semibold">{c.role}</td>
                <td data-label="Per transaction" className="ny-num text-right">{c.perTx ? kes(c.perTx) : "—"}</td>
                <td data-label="Per day" className="ny-num text-right">{c.daily ? kes(c.daily) : "—"}</td>
                <td data-label="Note" className="text-text-secondary">{c.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ny-hud mt-3">Permissions are hidden, not greyed out — if it isn&apos;t your job, you never see the button.</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Export                                                               */
/* ------------------------------------------------------------------ */
export function ExportModal({ open, onClose, scope, onQueue }: { open: boolean; onClose: () => void; scope: string; onQueue: (format: string) => void }) {
  const [format, setFormat] = useState("CSV");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export"
      sub={`${scope} · queued locally · signed file in Phase 2`}
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onQueue(format)}>
            <Download className="h-3.5 w-3.5" /> Queue {format}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-2">
        {["CSV", "XLSX", "PDF"].map((f) => (
          <button key={f} type="button" onClick={() => setFormat(f)} className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${format === f ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
            {f}
          </button>
        ))}
      </div>
      <p className="ny-chip ny-chip-sim mt-4">SIMULATED · KES amounts · EAT timestamps</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Walkthrough — how the elder flow works                               */
/* ------------------------------------------------------------------ */
export function WalkthroughModal({ open, onClose, steps: stepsData }: { open: boolean; onClose: () => void; steps: { step: string; title: string; body: string }[] }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="How the receive link works"
      sub="Five steps · no app, no login, no account"
      size="md"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Got it
        </button>
      }
    >
      <ol className="space-y-3">
        {stepsData.map((s) => (
          <li key={s.step} className="flex gap-3">
            <span className="ny-num grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-primary text-sm font-bold text-on-brand">
              {s.step}
            </span>
            <div>
              <p className="text-sm font-semibold text-text-primary">{s.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">{s.body}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="ny-inset mt-4 flex items-start gap-2.5 px-3.5 py-3">
        <QrCode className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
        <p className="text-xs leading-relaxed text-text-secondary">
          The whole flow is live in the phone preview on this page — try the wrong PIN three times to see the lock.
        </p>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Elder view — fullscreen phone for a chosen allocation                */
/* ------------------------------------------------------------------ */
export function ElderViewModal({ open, onClose, allocation, phone }: { open: boolean; onClose: () => void; allocation: Allocation | null; phone: React.ReactNode }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="What the elder sees"
      sub={allocation ? `${allocation.ref} · ${allocation.recipient} · ${allocation.phone}` : ""}
      size="md"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={onClose}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset the demo
          </button>
        </>
      }
    >
      <div className="flex justify-center py-1">{phone}</div>
      <p className="ny-hud mt-3 text-center">
        Larger type, one question per screen, and a PIN instead of a password — Elder Mode by default on /r/:token.
      </p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Channel capability matrix                                            */
/* ------------------------------------------------------------------ */
export function ChannelMatrixModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Payout & code delivery rails"
      sub="What each one allows when the backend is wired"
      size="md"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
      <div className="cc-table-wrap">
        <table className="cc-table">
          <thead>
            <tr>
              <th>Rail</th>
              <th>Used for</th>
              <th>Settles</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payChannels.map((c) => (
              <tr key={c.id}>
                <td data-label="Rail" className="font-semibold">{c.label}</td>
                <td data-label="Used for" className="text-text-secondary">{c.detail}</td>
                <td data-label="Settles">{c.eta}</td>
                <td data-label="Status">
                  {c.sim ? <span className="ny-chip ny-chip-sim">SIMULATED</span> : <span className="ny-chip ny-chip-ok">local</span>}
                </td>
              </tr>
            ))}
            {otpChannels.map((c) => (
              <tr key={c.id}>
                <td data-label="Rail" className="font-semibold">{c.label}</td>
                <td data-label="Used for" className="text-text-secondary">{c.detail}</td>
                <td data-label="Settles">{c.cost}</td>
                <td data-label="Status">
                  <span className="ny-chip ny-chip-sim">SIMULATED</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ny-hud mt-3">Every ✓ is built in the UI and resolves to “Ready — connects when the backend is wired”.</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Audit + ledger detail                                                */
/* ------------------------------------------------------------------ */
export function AuditDetailModal({ open, onClose, entry }: { open: boolean; onClose: () => void; entry: AuditEntry | null }) {
  return (
    <Modal open={open} onClose={onClose} title={entry ? `Audit · ${entry.action}` : "Audit"} sub={entry ? `${entry.ref} · ${entry.at}` : ""} size="sm"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
      {entry && (
        <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
          {[
            ["Actor", entry.actor],
            ["Entity", entry.entity],
            ["Detail", entry.detail],
            ["Timestamp", `${entry.at} EAT`],
            ["Integrity", "Append-only · HMAC export in Phase 2"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-start justify-between gap-3 px-3.5 py-2.5">
              <dt className="shrink-0 text-text-secondary">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </Modal>
  );
}

export function LedgerModal({ open, onClose, entry }: { open: boolean; onClose: () => void; entry: LedgerEntry | null }) {
  return (
    <Modal open={open} onClose={onClose} title="Double-entry post" sub={entry ? `${entry.ref} · ${entry.at}` : ""} size="sm"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
      {entry && (
        <>
          <div className="overflow-hidden rounded-xl border border-border-subtle text-sm">
            <div className="flex items-center justify-between gap-3 bg-surface-2 px-3.5 py-2.5">
              <span className="ny-hud">Debit</span>
              <span className="font-semibold">{entry.debit}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border-subtle px-3.5 py-2.5">
              <span className="ny-hud">Credit</span>
              <span className="font-semibold">{entry.credit}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border-subtle bg-[rgba(31,77,58,0.06)] px-3.5 py-3">
              <span className="ny-hud">Amount</span>
              <span className="ny-num ny-display text-lg">{kes(entry.amount)}</span>
            </div>
          </div>
          <p className="ny-hud mt-3">Source {entry.source} · debits and credits stay balanced by construction</p>
        </>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Recipient picker drawer                                              */
/* ------------------------------------------------------------------ */
export function RecipientPickerDrawer({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (r: Recipient) => void }) {
  const [q, setQ] = useState("");
  const list = recipients.filter((r) => `${r.name} ${r.relation} ${r.branch}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Pick a recipient"
      sub="Members first · any phone number works for a non-member elder"
      footer={
        <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
      <input autoFocus className="ny-input" placeholder="Search by name, branch or relation…" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="mt-3 space-y-2">
        {list.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl border border-border-subtle bg-surface-1 px-3 py-2.5 text-left transition hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-raise)]"
              onClick={() => {
                onPick(r);
                onClose();
              }}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-primary text-[0.72rem] font-bold text-on-brand">{r.initials}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{r.name}</span>
                <span className="ny-hud block !text-[0.55rem]">
                  {r.relation} · {r.branch} · {r.phone}
                </span>
              </span>
              {r.elder && <span className="ny-chip ny-chip-warn shrink-0">elder</span>}
            </button>
          </li>
        ))}
        {list.length === 0 && (
          <li className="ny-inset px-4 py-8 text-center text-sm text-text-secondary">
            Nobody matches “{q}”. You can still send to any phone number from the wizard.
          </li>
        )}
      </ul>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* Allocation filters drawer                                            */
/* ------------------------------------------------------------------ */
export type FaFilters = { q: string; status: string; purpose: string; channel: string };
export const emptyFaFilters: FaFilters = { q: "", status: "all", purpose: "all", channel: "all" };

export function FiltersDrawer({ open, onClose, value, onChange }: { open: boolean; onClose: () => void; value: FaFilters; onChange: (f: FaFilters) => void }) {
  const set = <K extends keyof FaFilters>(k: K, v: FaFilters[K]) => onChange({ ...value, [k]: v });
  const chip = (on: boolean) => `ny-chip ny-touch ${on ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`;
  const active = (value.q ? 1 : 0) + (value.status !== "all" ? 1 : 0) + (value.purpose !== "all" ? 1 : 0) + (value.channel !== "all" ? 1 : 0);
  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filter allocations"
      sub={`${active} filter${active === 1 ? "" : "s"} active`}
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => onChange(emptyFaFilters)}>
            Clear all
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
            Show results
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="ny-label" htmlFor="ff-q">Search recipient, ref or token</label>
          <input id="ff-q" className="ny-input" value={value.q} onChange={(e) => set("q", e.target.value)} placeholder="Victor, NY-ALC, NY-RCV…" />
        </div>
        <div>
          <span className="ny-label">Status</span>
          <div className="flex flex-wrap gap-1.5">
            {["all", "draft", "link-issued", "pin-entered", "otp-verified", "released", "settled", "expired", "failed"].map((s) => (
              <button key={s} type="button" className={chip(value.status === s)} onClick={() => set("status", s)}>
                {s === "all" ? "any" : s.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="ny-label">Purpose</span>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className={chip(value.purpose === "all")} onClick={() => set("purpose", "all")}>any</button>
            {(["personal", "family", "medical", "school", "emergency"] as AllocPurpose[]).map((p) => (
              <button key={p} type="button" className={chip(value.purpose === p)} onClick={() => set("purpose", p)}>
                {purposeLabel[p]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className="ny-label">Channel</span>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" className={chip(value.channel === "all")} onClick={() => set("channel", "all")}>any</button>
            {(["mpesa", "bank", "internal"] as PayChannel[]).map((c) => (
              <button key={c} type="button" className={chip(value.channel === c)} onClick={() => set("channel", c)}>
                {channelLabel[c]}
              </button>
            ))}
          </div>
        </div>
        <div className="ny-inset flex items-start gap-2.5 px-3.5 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
          <p className="text-xs leading-relaxed text-text-secondary">
            Filters apply instantly to the allocations table and stay in the URL, so a filtered view can be shared.
          </p>
        </div>
      </div>
    </Drawer>
  );
}

/* Small helper used by the page for the status pipeline */
export function StatusPipeline({ status }: { status: Allocation["status"] }) {
  const order = ["draft", "link-issued", "pin-entered", "otp-verified", "released", "settled"] as const;
  const current = order.indexOf(status as (typeof order)[number]);
  return (
    <div className="fa-pipeline">
      {order.map((s, i) => (
        <div key={s} className={`fa-node ${current > i ? "is-done" : ""} ${current === i ? "is-current" : ""}`}>
          {i > 0 && <span className="fa-node__link" />}
          <span className="fa-node__dot">{current > i ? "✓" : i + 1}</span>
          <span className="fa-node__label">{statusMeta[s].label}</span>
        </div>
      ))}
    </div>
  );
}
