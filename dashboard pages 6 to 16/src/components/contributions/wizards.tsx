"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Building2,
  Check,
  Loader2,
  MessageSquare,
  Smartphone,
  Wallet,
} from "lucide-react";
import {
  causes as seedCauses,
  channelLabel,
  channels,
  kes,
  pct,
  purposeLabel,
  purposeTone,
  type Channel,
  type Purpose,
} from "@/data/dashboard/contributions";
import { Modal } from "@/components/ui/overlay";
import { Stepper } from "@/components/ui/primitives";

const channelIcon: Record<Channel, typeof Smartphone> = {
  mpesa: Smartphone,
  airtel: Smartphone,
  bank: Building2,
  internal: Wallet,
};

const stepsContribute = ["Cause", "Amount", "Channel", "Message", "Review"];
const stepsCreate = ["Details", "Goal", "Scope & payout", "Publish"];

export type ContributeResult = {
  ref: string;
  causeId: string;
  amount: number;
  channel: Channel;
  receipt: string;
  ledgerRef: string;
  message: string;
};

/* ------------------------------------------------------------------ */
/* M-Pesa STK phone mockup — SIMULATED, never claims a real send        */
/* ------------------------------------------------------------------ */
function StkModal({
  open,
  onClose,
  onApprove,
  amount,
  causeTitle,
  phone,
}: {
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
  amount: number;
  causeTitle: string;
  phone: string;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="M-Pesa prompt preview"
      sub="What the contributor's phone would show"
      size="sm"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel prompt
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onApprove}>
            Approve (SIMULATED)
          </button>
        </>
      }
    >
      <div className="mx-auto w-[268px] rounded-[1.6rem] border-[6px] border-[#1a2618] bg-[#0d120e] p-3 shadow-[var(--shadow-lift)]">
        <div className="mb-2 flex items-center justify-between text-[0.6rem] font-semibold text-[#9fe0a8]">
          <span>Safaricom</span>
          <span className="ny-num">09:14</span>
        </div>
        <div className="rounded-lg bg-[#f4fff6] p-3 text-[#0d120e]">
          <p className="text-[0.72rem] font-bold uppercase tracking-wide">M-Pesa</p>
          <p className="mt-1.5 text-[0.78rem] leading-snug">
            {kes(amount)} to <strong>Nalyanya Family</strong> for {causeTitle.slice(0, 26)}
            {causeTitle.length > 26 ? "…" : ""}
          </p>
          <p className="mt-1.5 text-[0.72rem] text-[#4a5b4d]">Account: {phone}</p>
          <p className="mt-2 text-[0.72rem] font-semibold">Enter M-Pesa PIN:</p>
          <div className="mt-1.5 flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-6 w-6 rounded-full border border-[#0d120e]/30 text-center text-xs leading-6">
                •
              </span>
            ))}
          </div>
          <p className="mt-2 rounded bg-[#e9f7ec] px-2 py-1 text-[0.62rem] text-[#4a5b4d]">
            SIMULATED prompt — Phase 1 sends nothing to the network.
          </p>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* S3 — Contribute wizard (multi-step modal)                            */
/* ------------------------------------------------------------------ */
export function ContributeWizard({
  open,
  onClose,
  preselect,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  preselect?: string | null;
  onDone: (r: ContributeResult) => void;
}) {
  const [step, setStep] = useState(0);
  const [causeId, setCauseId] = useState<string>("");
  const [amount, setAmount] = useState("2000");
  const [channel, setChannel] = useState<Channel>("mpesa");
  const [phone, setPhone] = useState("+254722789014");
  const [message, setMessage] = useState("");
  const [stkOpen, setStkOpen] = useState(false);
  const [stkSent, setStkSent] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      setStep(0);
      setCauseId(preselect ?? "");
      setAmount("2000");
      setChannel("mpesa");
      setMessage("");
      setStkSent(false);
      setProcessing(false);
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, preselect]);

  const cause = seedCauses.find((c) => c.id === causeId) ?? null;
  const amt = Number(amount.replace(/[^0-9]/g, "")) || 0;
  const remaining = cause ? Math.max(0, cause.goal - cause.raised) : 0;
  const fee = channel === "bank" ? 50 : 0;
  const eta = channel === "bank" ? "same day" : channel === "internal" ? "instant" : "seconds";

  const canNext =
    (step === 0 && !!causeId) ||
    (step === 1 && amt > 0) ||
    (step === 2 && !!channel && (channel === "internal" || stkSent || channel === "bank")) ||
    step === 3;

  const finish = () => {
    setProcessing(true);
    window.setTimeout(() => {
      const seq = 452 + Math.floor(Math.random() * 40);
      onDone({
        ref: `NY-CON-2025-00${seq}`,
        causeId,
        amount: amt,
        channel,
        receipt: channel === "internal" ? `WAL-${99000 + seq}` : channel === "bank" ? `EFT-${88000 + seq}` : `RKX${Math.random().toString(36).slice(2, 6).toUpperCase()}2`,
        ledgerRef: `NY-LED-0004${seq}`,
        message,
      });
      setProcessing(false);
      onClose();
    }, 950);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Contribute to a cause"
        sub="Five steps · SIMULATED rails · never claims a real send"
        size="lg"
        footer={
          <>
            <button
              type="button"
              className="ny-btn ny-btn-ghost ny-btn-sm"
              onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
            </button>
            {step < stepsContribute.length - 1 ? (
              <button
                type="button"
                className="ny-btn ny-btn-primary ny-btn-sm"
                disabled={!canNext}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={processing || amt <= 0} onClick={finish}>
                {processing ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Posting…
                  </>
                ) : (
                  <>Confirm {kes(amt)}</>
                )}
              </button>
            )}
          </>
        }
      >
        <Stepper total={stepsContribute.length} current={step} labels={stepsContribute} />

        {step === 0 && (
          <div className="space-y-2">
            {seedCauses
              .filter((c) => c.status === "open" || c.status === "closing" || c.status === "met")
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCauseId(c.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                    causeId === c.id
                      ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]"
                      : "border-border-subtle bg-surface-1 hover:-translate-y-0.5 hover:border-border-strong"
                  }`}
                >
                  <img src={c.image} alt="" className="h-12 w-16 shrink-0 rounded-md object-cover" loading="lazy" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-text-primary">{c.title}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className={`ny-chip ${purposeTone[c.purpose]}`}>{purposeLabel[c.purpose]}</span>
                      <span className="ny-hud !text-[0.58rem]">{c.contributors} contributors</span>
                    </span>
                  </span>
                  <span className="ny-num shrink-0 text-right text-sm font-semibold">
                    {pct(c.raised, c.goal)}%
                    <span className="ny-hud block !text-[0.55rem]">{kes(c.goal - c.raised)} left</span>
                  </span>
                  {causeId === c.id && <Check className="h-4 w-4 shrink-0 text-brand-primary" />}
                </button>
              ))}
          </div>
        )}

        {step === 1 && cause && (
          <div>
            <p className="ny-hud">Amount · KES</p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {[500, 1000, 2500, 5000, 10000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(String(v))}
                  className={`ny-num rounded-lg border px-2 py-3 text-sm font-semibold transition ${
                    Number(amount) === v
                      ? "border-brand-primary bg-brand-primary text-on-brand"
                      : "border-border-subtle bg-surface-1 hover:-translate-y-0.5 hover:border-border-strong"
                  }`}
                >
                  {v.toLocaleString("en-KE")}
                </button>
              ))}
            </div>
            <label className="ny-label mt-4" htmlFor="cc-amount">
              Or type your own
            </label>
            <input
              id="cc-amount"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
              className="ny-input ny-num"
              placeholder="2000"
            />
            <div className="ny-inset mt-3 grid grid-cols-2 gap-3 px-3.5 py-3 text-sm sm:grid-cols-3">
              <span>
                <span className="ny-hud block">To {cause.title.slice(0, 22)}…</span>
                <span className="ny-num font-semibold">{kes(amt)}</span>
              </span>
              <span>
                <span className="ny-hud block">Remaining goal</span>
                <span className="ny-num font-semibold">{kes(remaining)}</span>
              </span>
              <span>
                <span className="ny-hud block">After this</span>
                <span className="ny-num font-semibold text-success">
                  {pct(cause.raised + amt, cause.goal)}%
                </span>
              </span>
            </div>
            {amt > remaining && remaining > 0 && (
              <p className="mt-2 text-sm text-brand-secondary">
                More than the remaining goal — the extra still posts to the escrow and shows on the tally.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="grid gap-2 sm:grid-cols-2">
              {channels.map((c) => {
                const Icon = channelIcon[c.id];
                const selected = channel === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChannel(c.id)}
                    className={`rounded-xl border p-3.5 text-left transition ${
                      selected
                        ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]"
                        : "border-border-subtle bg-surface-1 hover:-translate-y-0.5 hover:border-border-strong"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                        <Icon className="h-4 w-4 text-brand-primary" /> {c.label}
                      </span>
                      {c.sim ? <span className="ny-chip ny-chip-sim">SIMULATED</span> : <span className="ny-chip ny-chip-ok">local</span>}
                    </span>
                    <span className="mt-1.5 block text-xs text-text-secondary">{c.detail}</span>
                    <span className="ny-hud mt-1.5 block !text-[0.56rem]">
                      {channelLabel[c.id]} · settles in {c.eta}
                    </span>
                  </button>
                );
              })}
            </div>

            {(channel === "mpesa" || channel === "airtel") && (
              <div className="mt-4 rounded-xl border border-border-subtle bg-surface-2 p-3.5">
                <label className="ny-label" htmlFor="cc-phone">
                  Contributor phone (prefilled from your profile)
                </label>
                <input id="cc-phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="ny-input ny-num" />
                <button
                  type="button"
                  className="ny-btn ny-btn-primary ny-btn-sm mt-3"
                  onClick={() => setStkOpen(true)}
                  disabled={!cause}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  {stkSent ? "Re-send STK prompt (SIMULATED)" : "Send STK prompt (SIMULATED)"}
                </button>
                <p className="ny-hud mt-2">
                  {stkSent ? "Prompt approved — receipt will be issued at review" : "Step 2 continues only after the prompt is approved"}
                </p>
              </div>
            )}
            {channel === "bank" && (
              <div className="ny-inset mt-4 px-3.5 py-3 text-sm text-text-secondary">
                Bank EFT — KCB 522522 · Equity 247247 · Coop 400200 · NCBA 885100. Fee {kes(fee)}, settles {eta}. Reference
                will be generated when the backend is wired.
              </div>
            )}
            {channel === "internal" && (
              <div className="ny-inset mt-4 px-3.5 py-3 text-sm text-text-secondary">
                Internal wallet balance <span className="ny-num font-semibold text-text-primary">KES 24,300</span> — moves
                instantly between family accounts and posts straight to the escrow ledger.
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="ny-label" htmlFor="cc-msg">
              Message to the organizer (optional)
            </label>
            <textarea
              id="cc-msg"
              className="ny-textarea"
              maxLength={180}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Pole sana — thinking of you. From the Nairobi branch."
            />
            <p className="ny-hud mt-1.5 text-right !text-[0.58rem]">{message.length}/180</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Pole sana, get well soon.", "From the Nairobi branch.", "For the elders' transport.", "Chama is in — KES 10,000 from all of us."].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setMessage(q)}
                  className="ny-btn ny-btn-outline ny-btn-sm !normal-case"
                >
                  <MessageSquare className="h-3 w-3" /> {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && cause && (
          <div>
            <div className="ny-inset overflow-hidden">
              <div className="flex items-center gap-3 border-b border-border-subtle bg-surface-1 px-3.5 py-3">
                <img src={cause.image} alt="" className="h-12 w-16 rounded-md object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{cause.title}</p>
                  <p className="ny-hud !text-[0.58rem]">{cause.ref}</p>
                </div>
              </div>
              <dl className="divide-y divide-[color:var(--color-border-subtle)] text-sm">
                {[
                  ["Amount", kes(amt)],
                  ["Channel", `${channelLabel[channel]} · ${channel === "bank" ? "EFT" : "STK push"}`],
                  ["Fee", fee ? kes(fee) : "None"],
                  ["Settles in", eta],
                  ["Destination", cause.payoutTo],
                  ["Receipt ref", "issued on confirm"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                    <dt className="text-text-secondary">{k}</dt>
                    <dd className="ny-num text-right font-semibold text-text-primary">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-dashed border-[rgba(212,164,55,0.6)] bg-[rgba(212,164,55,0.1)] px-3.5 py-3">
              <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-[#7a5b12]" />
              <p className="text-xs leading-relaxed text-[#7a5b12]">
                <strong>SIMULATED · backend Phase 2.</strong> Confirming posts a local ledger entry, increments the cause
                tally and issues a receipt — it never claims money left any wallet. M-Pesa, Airtel and Bank rails connect
                when the backend is wired.
              </p>
            </div>
            {message && (
              <p className="mt-3 text-sm italic text-text-secondary">“{message}”</p>
            )}
          </div>
        )}
      </Modal>

      <StkModal
        open={stkOpen}
        onClose={() => setStkOpen(false)}
        amount={amt}
        causeTitle={cause?.title ?? "this cause"}
        phone={phone}
        onApprove={() => {
          setStkSent(true);
          setStkOpen(false);
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* S6 — Create cause wizard                                             */
/* ------------------------------------------------------------------ */
export type NewCause = {
  title: string;
  purpose: Purpose;
  beneficiary: string;
  goal: number;
  deadline: string;
  scope: string;
  payout: string;
};

export function CreateCauseWizard({
  open,
  onClose,
  onPublish,
}: {
  open: boolean;
  onClose: () => void;
  onPublish: (c: NewCause) => void;
}) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState<Purpose>("harambee");
  const [beneficiary, setBeneficiary] = useState("");
  const [goal, setGoal] = useState("150000");
  const [deadline, setDeadline] = useState("2026-03-31");
  const [scope, setScope] = useState<string>("All the family");
  const [channel, setChannel] = useState<Channel>("mpesa");
  const [dest, setDest] = useState("M-Pesa ···· 7890");
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      setStep(0);
      setTitle("");
      setBeneficiary("");
      setGoal("150000");
      setPublishing(false);
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  const goalN = Number(goal.replace(/[^0-9]/g, "")) || 0;
  const canNext = step === 0 ? title.trim().length > 4 && beneficiary.trim().length > 2 : step === 1 ? goalN >= 1000 : true;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a cause"
      sub="Admin or beneficiary · published to the family feed"
      size="lg"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < stepsCreate.length - 1 ? (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              className="ny-btn ny-btn-accent ny-btn-sm"
              disabled={publishing}
              onClick={() => {
                setPublishing(true);
                window.setTimeout(() => {
                  onPublish({ title, purpose, beneficiary, goal: goalN, deadline, scope, payout: `${channelLabel[channel]} · ${dest}` });
                  setPublishing(false);
                  onClose();
                }, 800);
              }}
            >
              {publishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Publish cause
            </button>
          )}
        </>
      }
    >
      <Stepper total={stepsCreate.length} current={step} labels={stepsCreate} />

      {step === 0 && (
        <div className="space-y-3.5">
          <div>
            <label className="ny-label" htmlFor="nc-title">Cause title</label>
            <input id="nc-title" className="ny-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. School fees — Sharon's term 3" />
          </div>
          <div>
            <span className="ny-label">Purpose</span>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(purposeLabel) as Purpose[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurpose(p)}
                  className={`ny-chip ny-touch transition ${purpose === p ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral hover:-translate-y-0.5"}`}
                >
                  {purposeLabel[p]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="ny-label" htmlFor="nc-ben">Beneficiary</label>
            <input id="nc-ben" className="ny-input" value={beneficiary} onChange={(e) => setBeneficiary(e.target.value)} placeholder="Name, or “minors — guardians only” to anonymise" />
            <p className="ny-hud mt-1.5">Minors and sensitive cases are anonymised in the public grid.</p>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3.5">
          <div>
            <label className="ny-label" htmlFor="nc-goal">Goal (KES)</label>
            <input id="nc-goal" inputMode="numeric" className="ny-input ny-num" value={goal} onChange={(e) => setGoal(e.target.value.replace(/[^0-9]/g, ""))} />
            <p className="ny-hud mt-1.5">Raised shows as a progress ring; contributors see the live tally.</p>
          </div>
          <div>
            <label className="ny-label" htmlFor="nc-deadline">Deadline</label>
            <input id="nc-deadline" type="date" className="ny-input" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div className="ny-inset px-3.5 py-3 text-sm text-text-secondary">
            Goal <span className="ny-num font-semibold text-text-primary">{kes(goalN)}</span> · deadline{" "}
            <span className="ny-num font-semibold text-text-primary">{deadline}</span> · a closing badge appears automatically
            7 days out.
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3.5">
          <div>
            <span className="ny-label">Who can contribute</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {["All the family", "Branch only", "Selected members"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setScope(s)}
                  className={`rounded-lg border px-3 py-3 text-sm font-semibold transition ${
                    scope === s ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="ny-label" htmlFor="nc-dest">Payout destination</label>
            <div className="flex flex-wrap gap-2">
              {channels.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setChannel(c.id)}
                  className={`ny-btn ny-btn-sm ${channel === c.id ? "ny-btn-primary" : "ny-btn-outline"}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <input id="nc-dest" className="ny-input mt-2" value={dest} onChange={(e) => setDest(e.target.value)} />
          </div>
          <p className="ny-chip ny-chip-sim">Payout release requires 2FA + audit in Phase 1 (SIMULATED)</p>
        </div>
      )}

      {step === 3 && (
        <div className="ny-inset overflow-hidden">
          <div className="border-b border-border-subtle bg-surface-1 px-3.5 py-3">
            <p className="ny-hud">Review</p>
            <p className="ny-display mt-1 text-lg leading-tight">{title || "Untitled cause"}</p>
          </div>
          <dl className="divide-y divide-[color:var(--color-border-subtle)] text-sm">
            {[
              ["Purpose", purposeLabel[purpose]],
              ["Beneficiary", beneficiary],
              ["Goal", kes(goalN)],
              ["Deadline", deadline],
              ["Scope", scope],
              ["Payout", `${channelLabel[channel]} · ${dest}`],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <dt className="text-text-secondary">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="px-3.5 py-3 text-xs leading-relaxed text-text-secondary">
            Publishing writes an audit entry (actor · action · entity) and posts to the family feed. Contributors get an
            in-app notification now; WhatsApp/SMS fanout connects in Phase 2.
          </p>
        </div>
      )}
    </Modal>
  );
}
