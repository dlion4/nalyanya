"use client";

import { useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Loader2, PiggyBank, RotateCw, Shuffle, Landmark, TrendingUp } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import { Stepper } from "@/components/ui/primitives";
import {
  type Channel,
  type Chama,
  type Cycle,
  type ProductId,
  type SkipPolicy,
  cycleLabel,
  cycleSeconds,
  eligibleAmount,
  nameOf,
  productTypes,
  roster,
  sacco,
  skipLabel,
} from "@/data/dashboard/finances";
import { fmt, kes, kesShort } from "@/lib/format";
import { channelMeta, StkPromptModal, type ShareReceipt } from "./modals";

const typeIcon: Record<ProductId, typeof RotateCw> = {
  "merry-go-round": RotateCw,
  savings: PiggyBank,
  investment: TrendingUp,
  sacco: Landmark,
};

/* ------------------------------------------------------------------ */
/* Buy shares — 4-step multi-step modal (S3)                            */
/* ------------------------------------------------------------------ */
export function BuySharesWizard({
  open,
  onClose,
  unitValue,
  owned,
  multiplier,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  unitValue: number;
  owned: number;
  multiplier: number;
  onDone: (r: ShareReceipt) => void;
}) {
  const [step, setStep] = useState(0);
  const [shares, setShares] = useState("5");
  const [monthly, setMonthly] = useState(false);
  const [day, setDay] = useState(5);
  const [channel, setChannel] = useState<Channel>("mpesa");
  const [stkOpen, setStkOpen] = useState(false);
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);

  const n = Math.max(0, Number(shares) || 0);
  const amount = n * unitValue;
  const needsStk = channel === "mpesa" || channel === "airtel";
  const fee = channel === "bank" ? 50 : 0;
  const labels = ["Shares", "Plan", "Channel", "Review"];
  const canNext = step === 0 ? n >= 1 : step === 2 ? !needsStk || approved : true;

  const confirm = () => {
    setBusy(true);
    window.setTimeout(() => {
      onDone({
        ref: `NY-SHR-2025-${String(Math.floor(Math.random() * 90000) + 10000)}`,
        shares: n,
        amount,
        channel,
        monthly,
        day,
        newTotal: owned + n,
        ledger: `NY-LED-00045${Math.floor(Math.random() * 90 + 10)}`,
      });
      setBusy(false);
      onClose();
    }, 900);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Buy Sacco shares"
        sub={`Unit value ${kes(unitValue)} · you hold ${fmt(owned)} shares`}
        size="lg"
        tone="gold"
        footer={
          <>
            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>
              <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
            </button>
            {step < labels.length - 1 ? (
              <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={busy || n < 1} onClick={confirm}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Buy {n} {n === 1 ? "share" : "shares"} · {kes(amount)}
              </button>
            )}
          </>
        }
      >
        <Stepper total={labels.length} current={step} labels={labels} />

        {step === 0 && (
          <div>
            <p className="ny-hud">How many shares?</p>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {[1, 5, 10, 25, 50].map((v) => (
                <button key={v} type="button" onClick={() => setShares(String(v))} className={`ny-num rounded-lg border px-2 py-3 text-sm font-semibold transition ${Number(shares) === v ? "border-brand-primary bg-brand-primary text-on-brand" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                  {v}
                </button>
              ))}
            </div>
            <label className="ny-label mt-4" htmlFor="bs-n">Or type a number</label>
            <input id="bs-n" inputMode="numeric" className="ny-input ny-num" value={shares} onChange={(e) => setShares(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))} />
            <div className="ny-inset mt-3 grid grid-cols-2 gap-3 px-3.5 py-3 sm:grid-cols-3">
              <span>
                <span className="ny-hud block">You pay</span>
                <span className="ny-num font-semibold">{kes(amount)}</span>
              </span>
              <span>
                <span className="ny-hud block">Total after</span>
                <span className="ny-num font-semibold">{fmt(owned + n)} shares</span>
              </span>
              <span>
                <span className="ny-hud block">Can borrow after</span>
                <span className="ny-num font-semibold text-success">{kesShort(eligibleAmount(owned + n, unitValue, multiplier))}</span>
              </span>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => setMonthly(false)} className={`fin-type ${!monthly ? "is-on" : ""}`}>
              <span className="ny-display block text-base">One-off top-up</span>
              <span className="mt-1 block text-sm text-text-secondary">Pay {kes(amount)} once, today.</span>
            </button>
            <button type="button" onClick={() => setMonthly(true)} className={`fin-type ${monthly ? "is-on" : ""}`}>
              <span className="ny-display block text-base">Monthly auto-debit</span>
              <span className="mt-1 block text-sm text-text-secondary">Same shares every month — the Sacco&apos;s steady savers rule.</span>
            </button>
            {monthly && (
              <div className="sm:col-span-2">
                <span className="ny-label">Debit on day of the month</span>
                <div className="flex flex-wrap gap-2">
                  {[1, 5, 15, 25].map((d) => (
                    <button key={d} type="button" onClick={() => setDay(d)} className={`ny-chip ny-touch ${day === d ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                      {d}
                    </button>
                  ))}
                </div>
                <p className="ny-chip ny-chip-sim mt-3">Standing order SIMULATED · {kes(amount)} on day {day} each month</p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="grid gap-2 sm:grid-cols-2">
              {(Object.keys(channelMeta) as Channel[]).map((c) => {
                const m = channelMeta[c];
                const Icon = m.icon;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setChannel(c);
                      setApproved(false);
                    }}
                    className={`rounded-xl border p-3.5 text-left transition ${channel === c ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <Icon className="h-4 w-4 text-brand-primary" /> {m.label}
                      </span>
                      {m.sim ? <span className="ny-chip ny-chip-sim">SIMULATED</span> : <span className="ny-chip ny-chip-ok">local</span>}
                    </span>
                    <span className="ny-hud mt-1.5 block !text-[0.56rem]">settles {m.eta}</span>
                  </button>
                );
              })}
            </div>
            {needsStk && (
              <div className="ny-inset mt-4 flex flex-wrap items-center justify-between gap-3 px-3.5 py-3">
                <p className="text-sm">{approved ? "STK prompt approved — SIMULATED" : "Approve the M-Pesa prompt to continue"}</p>
                <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => setStkOpen(true)}>
                  {approved ? "Preview again" : "Send STK prompt"}
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div>
            <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
              {[
                ["Shares", `+${n}`],
                ["Amount", kes(amount)],
                ["Fee", fee ? kes(fee) : "None"],
                ["Plan", monthly ? `Monthly, day ${day}` : "One-off"],
                ["Channel", channelMeta[channel].label],
                ["New total", `${fmt(owned + n)} shares`],
                ["Borrowing power after", kes(eligibleAmount(owned + n, unitValue, multiplier))],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <dt className="text-text-secondary">{k}</dt>
                  <dd className="ny-num font-semibold text-text-primary">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="ny-inset mt-3 px-3.5 py-3">
              <p className="ny-hud">Double-entry preview</p>
              <p className="mt-1.5 text-sm text-text-secondary">
                Debit <strong className="text-text-primary">{channelMeta[channel].label} clearing</strong> → credit{" "}
                <strong className="text-text-primary">Sacco share capital</strong> {kes(amount)}.
              </p>
            </div>
            <p className="ny-chip ny-chip-sim mt-3">SIMULATED · local share ledger posts; no money leaves a wallet</p>
          </div>
        )}
      </Modal>

      <StkPromptModal
        open={stkOpen}
        onClose={() => setStkOpen(false)}
        onApprove={() => {
          setApproved(true);
          setStkOpen(false);
        }}
        amount={amount}
        label={sacco.name}
        phone="+2547 ··· 2210"
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Create a chama / Sacco product — 6-step wizard (S6)                  */
/* ------------------------------------------------------------------ */
export function CreateProductWizard({
  open,
  onClose,
  preType,
  nextRef,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  preType: ProductId;
  nextRef: string;
  onSave: (c: Chama) => void;
}) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<ProductId>(preType);
  const [name, setName] = useState("");
  const [branch, setBranch] = useState("Nairobi");
  const [amount, setAmount] = useState("10000");
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const [goal, setGoal] = useState("500000");
  const [members, setMembers] = useState<string[]>(["m02", "m05", "m07", "m11"]);
  const [penalty, setPenalty] = useState("500");
  const [grace, setGrace] = useState(3);
  const [skip, setSkip] = useState<SkipPolicy>("once-a-year");
  const [order, setOrder] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const labels = ["Type & name", "Money & cycle", "Members", "Rules", "Order", "Review"];
  const mgr = type === "merry-go-round";
  const amt = Number(amount) || 0;
  const goalN = Number(goal) || 0;
  const pen = Number(penalty) || 0;
  const potPerRound = amt * members.length;
  const canNext =
    step === 0 ? name.trim().length >= 4 : step === 1 ? amt >= 500 : step === 2 ? members.length >= 4 : true;

  const orderedMembers = (mgr ? order : []).filter((id) => members.includes(id));
  const move = (i: number, dir: -1 | 1) =>
    setOrder((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const save = () => {
    setSaving(true);
    window.setTimeout(() => {
      const finalOrder = mgr ? (orderedMembers.length ? orderedMembers : members) : [];
      const chamaType = type === "sacco" ? "savings" : type;
      const image =
        type === "merry-go-round" ? "/images/frame-elder.jpg" : type === "savings" ? "/images/frame-reunion.jpg" : type === "investment" ? "/images/cause-water.jpg" : sacco.image;
      onSave({
        id: `ch-${Date.now().toString(36)}`,
        ref: nextRef,
        name: name.trim(),
        type: chamaType,
        branch,
        cycle,
        contribution: amt,
        memberIds: members,
        orderIds: finalOrder,
        round: mgr ? 1 : 0,
        totalRounds: mgr ? finalOrder.length : 0,
        recipientIdx: 0,
        pool: 0,
        target: mgr ? potPerRound : goalN,
        targetLabel: mgr ? "this round's pot" : name.trim(),
        paidIds: [],
        nextInSec: cycleSeconds(cycle),
        nextLabel: `First ${cycleLabel[cycle].toLowerCase()} ${mgr ? "round" : "period"} opens soon`,
        image,
        blurb:
          type === "sacco"
            ? `Share-based Sacco product · ${members.length} members · shares unlock loans at 3×.`
            : `${members.length} members · ${kes(amt)} ${cycleLabel[cycle].toLowerCase()} · ${skipLabel[skip].toLowerCase()}.`,
        penalty: pen,
        graceDays: grace,
        skip,
        roi: type === "investment" ? 14 : null,
        payoutLabels: mgr ? finalOrder.map((_, i) => `Round ${i + 1}`) : [],
        statements: [],
        opened: "18 Nov 2025",
      });
      setSaving(false);
      onClose();
    }, 800);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create a chama or Sacco product"
      sub="Admin only · every save writes an audit row and needs 2FA"
      size="lg"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < labels.length - 1 ? (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={saving} onClick={save}>
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save product
            </button>
          )}
        </>
      }
    >
      <Stepper total={labels.length} current={step} labels={labels} />

      {step === 0 && (
        <div className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            {productTypes.map((t) => {
              const Icon = typeIcon[t.id];
              return (
                <button key={t.id} type="button" onClick={() => setType(t.id)} className={`fin-type ${type === t.id ? "is-on" : ""}`}>
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-brand-primary" /> {t.label}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-text-secondary">{t.blurb}</span>
                </button>
              );
            })}
          </div>
          <div>
            <label className="ny-label" htmlFor="cp-name">Name</label>
            <input id="cp-name" className="ny-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Kakamega Fortnightly Circle" />
          </div>
          <div>
            <label className="ny-label" htmlFor="cp-branch">Branch</label>
            <select id="cp-branch" className="ny-select" value={branch} onChange={(e) => setBranch(e.target.value)}>
              {["Nairobi", "Bungoma", "Kakamega", "Trans-Nzoia", "Diaspora"].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="ny-label" htmlFor="cp-amt">{mgr ? "Contribution per member (KES)" : "Contribution (KES)"}</label>
            <input id="cp-amt" inputMode="numeric" className="ny-input ny-num" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))} />
          </div>
          <div>
            <span className="ny-label">Cycle</span>
            <div className="flex flex-wrap gap-2">
              {(["weekly", "fortnightly", "monthly"] as Cycle[]).map((c) => (
                <button key={c} type="button" onClick={() => setCycle(c)} className={`ny-btn ny-btn-sm ${cycle === c ? "ny-btn-primary" : "ny-btn-outline"}`}>
                  {cycleLabel[c]}
                </button>
              ))}
            </div>
          </div>
          {!mgr && (
            <div>
              <label className="ny-label" htmlFor="cp-goal">Goal (KES)</label>
              <input id="cp-goal" inputMode="numeric" className="ny-input ny-num" value={goal} onChange={(e) => setGoal(e.target.value.replace(/[^0-9]/g, ""))} />
            </div>
          )}
          <p className="ny-inset px-3.5 py-3 text-sm text-text-secondary">
            {mgr ? (
              <>Each round the pot is <strong className="text-text-primary">{kes(potPerRound)}</strong> ({members.length} × {kes(amt)}).</>
            ) : (
              <>Target <strong className="text-text-primary">{kes(goalN)}</strong> — shown as the progress ring on the card.</>
            )}
          </p>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="ny-hud">Pick at least 4 members · {members.length} selected</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {roster.map((p) => {
              const on = members.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setMembers((prev) => (on ? prev.filter((x) => x !== p.id) : [...prev, p.id]));
                    setOrder((prev) => (on ? prev.filter((x) => x !== p.id) : [...prev, p.id]));
                  }}
                  className={`ny-chip ny-touch transition ${on ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral hover:-translate-y-0.5"}`}
                >
                  {p.name.split(" ")[0]} {p.name.split(" ").slice(-2, -1)[0]}
                </button>
              );
            })}
          </div>
          <p className="ny-hud mt-3">{members.length < 4 ? "Need at least 4 to continue" : "Good — the rotation order is set next"}</p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="ny-label" htmlFor="cp-pen">Late penalty (KES)</label>
            <input id="cp-pen" inputMode="numeric" className="ny-input ny-num" value={penalty} onChange={(e) => setPenalty(e.target.value.replace(/[^0-9]/g, ""))} />
          </div>
          <div>
            <span className="ny-label">Grace period (days)</span>
            <div className="flex flex-wrap gap-2">
              {[0, 2, 3, 5, 7].map((g) => (
                <button key={g} type="button" onClick={() => setGrace(g)} className={`ny-chip ny-touch ${grace === g ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="ny-label">Skip policy</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(skipLabel) as SkipPolicy[]).map((s) => (
                <button key={s} type="button" onClick={() => setSkip(s)} className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${skip === s ? "border-brand-primary bg-[rgba(31,77,58,0.07)] font-semibold" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                  {skipLabel[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          {!mgr ? (
            <div className="ny-inset px-4 py-6 text-center">
              <p className="ny-display text-base">Nothing to order</p>
              <p className="mt-1 text-sm text-text-secondary">Only merry-go-round products rotate. This pool is released by the trustees instead.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="ny-hud">Rotation order · round 1 first</p>
                <button
                  type="button"
                  className="ny-btn ny-btn-outline ny-btn-sm"
                  onClick={() => {
                    const base = orderedMembers.length ? orderedMembers : members;
                    setOrder([...base].sort(() => Math.random() - 0.5));
                  }}
                >
                  <Shuffle className="h-3.5 w-3.5" /> Shuffle (SIMULATED)
                </button>
              </div>
              <ol className="space-y-1.5">
                {(orderedMembers.length ? orderedMembers : members).map((id, i) => (
                  <li key={id} className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2">
                    <span className="ny-hud w-12 shrink-0">Round {i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{nameOf(id)}</span>
                    <button type="button" aria-label={`Move ${nameOf(id)} up`} className="ny-btn ny-btn-ghost ny-btn-sm !px-2" onClick={() => move(i, -1)}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" aria-label={`Move ${nameOf(id)} down`} className="ny-btn ny-btn-ghost ny-btn-sm !px-2" onClick={() => move(i, 1)}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ol>
              {orderedMembers.length === 0 && (
                <p className="ny-hud">Using selection order until you move someone</p>
              )}
            </>
          )}
        </div>
      )}

      {step === 5 && (
        <div className="space-y-3">
          <div className="ny-inset px-4 py-3.5">
            <p className="ny-hud">Review</p>
            <p className="ny-display mt-1 text-lg">{name || "Untitled product"}</p>
            <p className="mt-1 text-sm text-text-secondary">{productTypes.find((t) => t.id === type)?.label} · {branch} · {cycleLabel[cycle]}</p>
          </div>
          <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
            {[
              ["Contribution", kes(amt)],
              ["Members", `${members.length} people`],
              [mgr ? "Pot per round" : "Goal", kes(mgr ? potPerRound : goalN)],
              ["Late penalty", `${kes(pen)} after ${grace} days`],
              ["Skip policy", skipLabel[skip]],
              ["Rotation", mgr ? `${members.length} rounds` : "Trustee release"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <dt className="text-text-secondary">{k}</dt>
                <dd className="ny-num font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="ny-chip ny-chip-sim">Saved to the audit trail · 2FA of the family head · SIMULATED</p>
          <p className="ny-hud">Pot at scale: {kesShort(potPerRound)} per round</p>
        </div>
      )}
    </Modal>
  );
}
