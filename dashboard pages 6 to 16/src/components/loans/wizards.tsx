"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Fingerprint, Loader2, ShieldCheck, Smartphone, Wallet, Building2, X } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import { Stepper } from "@/components/ui/primitives";
import { fmt, kes, kesShort } from "@/lib/format";
import {
  AS_OF,
  addMonths,
  ceilingFor,
  fmtDate,
  productOf,
  products,
  schedule,
  totalOf,
  unitValue,
  type Channel,
  type Guarantor,
  type Loan,
  type LoanView,
  type Member,
  type Policy,
  type ProductId,
  statusMeta,
} from "@/data/dashboard/loans";
import { AmortChart, channelMeta, clamp } from "./charts";
import { GuarantorPickerModal } from "./modals";

const channelIcon = { mpesa: Smartphone, bank: Building2, internal: Wallet } as const;

/* ------------------------------------------------------------------ */
/* W1 — Application wizard (six steps, deep-linkable ?o=apply&t=product) */
/* ------------------------------------------------------------------ */
export type ApplyProps = {
  onClose: () => void;
  initialProduct: ProductId | null;
  initialAmount: number | null;
  members: Member[];
  me: Member;
  rules: Policy;
  enabled: Record<ProductId, boolean>;
  obligations: number;
  activeCount: number;
  nextRef: string;
  onSubmit: (loan: Loan) => void;
};

const applySteps = ["Product", "Amount", "Terms", "Security", "Destination", "Review"];

export function ApplyWizard({ onClose, initialProduct, initialAmount, members, me, rules, enabled, obligations, activeCount, nextRef, onSubmit }: ApplyProps) {
  const visible = products.filter((p) => enabled[p.id]);
  const [step, setStep] = useState(0);
  const [pid, setPid] = useState<ProductId>(initialProduct && enabled[initialProduct] ? initialProduct : visible[0]?.id ?? "short-term");
  const [co, setCo] = useState<string[]>([]);
  const [amountStr, setAmountStr] = useState(String(initialAmount ?? 50000));
  const [term, setTerm] = useState(12);
  const [purpose, setPurpose] = useState("");
  const [school, setSchool] = useState({ name: "", paybill: "" });
  const [guarantors, setGuarantors] = useState<Guarantor[]>([]);
  const [coll, setColl] = useState({ desc: "", value: "" });
  const [channel, setChannel] = useState<Channel>("mpesa");
  const [destination, setDestination] = useState("M-Pesa ···· 2210");
  const [decl, setDecl] = useState([false, false]);
  const [picker, setPicker] = useState(false);

  const p = productOf(pid);
  const amt = Number(amountStr.replace(/\D/g, "")) || 0;
  const t = p.freq === "single" ? 1 : clamp(term, p.termMin, p.termMax);
  const borrowers = [me, ...members.filter((m) => co.includes(m.id))];
  const cap = ceilingFor(p, borrowers, guarantors, rules, obligations);
  const rows = schedule({ amount: amt, rate: p.rate, method: p.method, freq: p.freq, termMonths: t, start: AS_OF });
  const total = totalOf(rows);

  const needCo = p.scope === "family" ? 1 : p.scope === "group" ? 2 : 0;
  const scopeOK = co.length >= needCo;
  const activeOK = activeCount < rules.maxActive;
  const amountOK = amt >= p.min && amt <= cap.available && amt > 0;
  const schoolOK = !p.school || (school.name.trim().length > 2 && school.paybill.trim().length > 3);
  const purposeOK = purpose.trim().length > 3;
  const guarantorsOK = guarantors.length >= p.guarantors;
  const collOK = !p.collateral || (coll.desc.trim().length > 3 && Number(coll.value) > 0);
  const declOK = decl[0] && decl[1];

  const canNext = [
    scopeOK && activeOK,
    amountOK && schoolOK && purposeOK,
    true,
    guarantorsOK && collOK,
    channel !== undefined,
    declOK,
  ][step];

  const candidates = members.filter((m) => !borrowers.some((b) => b.id === m.id));

  const submit = () => {
    onSubmit({
      id: `ln-${nextRef.slice(-5)}`,
      ref: nextRef,
      product: pid,
      title: `${p.name} — ${purpose.trim()}`,
      purpose: purpose.trim(),
      borrowers: borrowers.map((b) => b.id),
      branch: me.branch,
      amount: amt,
      rate: p.rate,
      method: p.method,
      freq: p.freq,
      termMonths: t,
      start: null,
      applied: AS_OF,
      channel,
      destination,
      stored: "under-review",
      paid: 0,
      priorPaid: 0,
      restructures: 0,
      penaltyWaived: false,
      guarantors,
      collateral: p.collateral ? { desc: coll.desc.trim(), value: Number(coll.value) } : null,
      school: p.school ? { name: school.name.trim(), paybill: school.paybill.trim() } : null,
      image: p.image,
      note: "Submitted from the application wizard. Waiting for the review queue.",
    });
  };

  return (
    <>
      <Modal
        open
        onClose={onClose}
        title="Apply for a loan"
        sub="Six steps · live eligibility · SIMULATED disbursement"
        size="lg"
        tone="gold"
        footer={
          <>
            <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>
              <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
            </button>
            {step < applySteps.length - 1 ? (
              <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
                Continue <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={!declOK} onClick={submit}>
                <Check className="h-3.5 w-3.5" /> Submit application
              </button>
            )}
          </>
        }
      >
        <Stepper total={applySteps.length} current={step} labels={applySteps} />

        {step === 0 && (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {visible.map((x) => (
                <button key={x.id} type="button" onClick={() => setPid(x.id)} className={`rounded-xl border p-3 text-left transition ${pid === x.id ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{x.name}</span>
                    <span className={`ny-chip ${x.tone}`}>{x.chip}</span>
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-text-secondary">{x.blurb}</span>
                </button>
              ))}
            </div>
            <div>
              <span className="ny-label">Borrowing as</span>
              <p className="text-sm text-text-secondary">
                {p.scope === "individual" && "Just you. Add a co-borrower below only if the product allows it."}
                {p.scope === "family" && "A family joint loan needs at least one family co-borrower."}
                {p.scope === "group" && "A chama group loan needs at least two co-signers from your circle."}
              </p>
              {p.scope !== "individual" && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {members.filter((m) => m.id !== me.id).map((m) => {
                    const on = co.includes(m.id);
                    return (
                      <button key={m.id} type="button" onClick={() => setCo((prev) => (on ? prev.filter((x) => x !== m.id) : [...prev, m.id]))} className={`ny-chip ny-touch transition ${on ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral hover:-translate-y-0.5"}`}>
                        {m.name.split(" ")[0]} {m.name.split(" ")[1]}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="ny-hud mt-2">
                {co.length} co-borrower{co.length === 1 ? "" : "s"} · need {needCo}
              </p>
            </div>
            {!activeOK && (
              <p className="ny-chip ny-chip-danger">You already have {activeCount} active loans. The family limit is {rules.maxActive}.</p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="ny-inset grid grid-cols-2 gap-3 px-3.5 py-3 text-sm sm:grid-cols-3">
              <span>
                <span className="ny-hud block">You can borrow up to</span>
                <span className="ny-num font-semibold">{kesShort(cap.available)}</span>
              </span>
              <span>
                <span className="ny-hud block">Product range</span>
                <span className="ny-num font-semibold">{kesShort(p.min)} – {kesShort(p.max)}</span>
              </span>
              <span>
                <span className="ny-hud block">Basis</span>
                <span className="font-semibold">{cap.basis}</span>
              </span>
            </div>
            <div>
              <label className="ny-label" htmlFor="aw-amt">Amount (KES)</label>
              <input id="aw-amt" inputMode="numeric" className="ny-input ny-num" value={amountStr} onChange={(e) => setAmountStr(e.target.value.replace(/[^0-9]/g, ""))} />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[5000, 10000, 25000, 50000, 100000].filter((v) => v <= cap.available).map((v) => (
                  <button key={v} type="button" onClick={() => setAmountStr(String(v))} className="ny-chip ny-chip-neutral ny-touch hover:-translate-y-0.5">
                    {fmt(v)}
                  </button>
                ))}
              </div>
              {amt > cap.available && <p className="mt-2 text-sm text-danger">Above what you can borrow right now ({kes(cap.available)}).</p>}
              {amt > 0 && amt < p.min && <p className="mt-2 text-sm text-danger">This product starts at {kes(p.min)}.</p>}
            </div>
            {p.freq === "monthly" && (
              <div>
                <label className="ny-label" htmlFor="aw-term">Term · {t} months</label>
                <input id="aw-term" type="range" min={p.termMin} max={p.termMax} value={t} onChange={(e) => setTerm(Number(e.target.value))} className="w-full accent-[var(--color-brand-primary)]" />
              </div>
            )}
            <div>
              <label className="ny-label" htmlFor="aw-purpose">What is the money for?</label>
              <input id="aw-purpose" className="ny-input" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="School fees for term 1, a hospital review, stock for the shop…" />
            </div>
            {p.school && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="ny-label" htmlFor="aw-school">School</label>
                  <input id="aw-school" className="ny-input" value={school.name} onChange={(e) => setSchool({ ...school, name: e.target.value })} placeholder="Bungoma High School" />
                </div>
                <div>
                  <label className="ny-label" htmlFor="aw-pay">School paybill and account</label>
                  <input id="aw-pay" className="ny-input ny-num" value={school.paybill} onChange={(e) => setSchool({ ...school, paybill: e.target.value })} placeholder="Paybill 400200 · acct BHS-0412" />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              {[
                ["Interest", p.method === "flat" ? "Flat" : "Reducing"],
                ["Rate", `${p.rate}% a year`],
                [p.freq === "single" ? "One payment" : "Each month", kes(rows[0]?.instalment ?? 0)],
                ["Total back", kes(total)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                  <dt className="ny-hud">{k}</dt>
                  <dd className="ny-num mt-1 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <AmortChart rows={rows} amount={amt} height={170} />
            <p className="ny-hud">
              First instalment {fmtDate(rows[0]?.due ?? AS_OF)} · interest {kes(total - amt)} · the schedule is computed from these terms
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {p.guarantors === 0 && !p.collateral && (
              <div className="ny-inset px-4 py-5 text-sm text-text-secondary">
                <span className="font-semibold text-text-primary">No guarantors or collateral needed.</span> This product is secured by your shares or your salary.
              </div>
            )}
            {p.guarantors > 0 && (
              <div className="ny-card-flat p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="ny-hud">Guarantors</p>
                    <p className="text-sm text-text-secondary">
                      Needs {p.guarantors}. Each guarantor’s shares count at {rules.pledgePct}% toward your ceiling.
                    </p>
                  </div>
                  <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => setPicker(true)}>
                    Choose guarantors
                  </button>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {guarantors.map((g) => {
                    const m = members.find((x) => x.id === g.id);
                    return (
                      <li key={g.id} className="ny-inset flex items-center justify-between gap-3 px-3 py-2 text-sm">
                        <span className="font-medium">{m?.name ?? "Member"}</span>
                        <span className="ny-num">{fmt(g.shares)} shares · {kes((g.shares * unitValue * rules.pledgePct) / 100)} pledged</span>
                      </li>
                    );
                  })}
                </ul>
                <p className={`ny-chip mt-3 ${guarantorsOK ? "ny-chip-ok" : "ny-chip-warn"}`}>
                  {guarantors.length}/{p.guarantors} guarantors chosen
                </p>
              </div>
            )}
            {p.collateral && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="ny-label" htmlFor="aw-coll">Collateral you are pledging</label>
                  <input id="aw-coll" className="ny-input" value={coll.desc} onChange={(e) => setColl({ ...coll, desc: e.target.value })} placeholder="Two sewing machines and a cutting table" />
                </div>
                <div>
                  <label className="ny-label" htmlFor="aw-cv">Estimated value (KES)</label>
                  <input id="aw-cv" inputMode="numeric" className="ny-input ny-num" value={coll.value} onChange={(e) => setColl({ ...coll, value: e.target.value.replace(/[^0-9]/g, "") })} />
                </div>
                <p className="ny-hud self-end !text-[0.55rem]">A valuation can be attached in Phase 2</p>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              {(["mpesa", "bank", "internal"] as Channel[]).map((c) => {
                const Icon = channelIcon[c];
                return (
                  <button key={c} type="button" onClick={() => setChannel(c)} className={`rounded-xl border p-3.5 text-left transition ${channel === c ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                    <span className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <Icon className="h-4 w-4 text-brand-primary" /> {channelMeta[c].label}
                      </span>
                    </span>
                    <span className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="ny-hud !text-[0.55rem]">settles {channelMeta[c].eta}</span>
                      {channelMeta[c].sim ? <span className="ny-chip ny-chip-sim">SIMULATED</span> : <span className="ny-chip ny-chip-ok">local</span>}
                    </span>
                  </button>
                );
              })}
            </div>
            {p.school ? (
              <div className="ny-inset px-3.5 py-3">
                <p className="ny-hud">Paid direct to the school</p>
                <p className="mt-1 text-sm font-semibold">{school.name || "School"} · {school.paybill || "paybill to be added"}</p>
              </div>
            ) : (
              <div>
                <label className="ny-label" htmlFor="aw-dest">Account (masked)</label>
                <select id="aw-dest" className="ny-select" value={destination} onChange={(e) => setDestination(e.target.value)}>
                  {["M-Pesa ···· 2210", "Equity ···· 4471", "Wallet · KES 24,300"].map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
              {[
                ["Product", p.name],
                ["Borrowers", borrowers.map((b) => b.name.split(" ")[0]).join(" + ")],
                ["Amount", kes(amt)],
                ["Term", p.freq === "single" ? "One payday" : `${t} months`],
                ["Each instalment", kes(rows[0]?.instalment ?? 0)],
                ["Total repayable", kes(total)],
                ["Guarantors", guarantors.length ? `${guarantors.length} chosen` : "None"],
                ["Paid to", p.school ? school.name : destination],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                  <dt className="text-text-secondary">{k}</dt>
                  <dd className="ny-num text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="space-y-2">
              {[
                "I understand this loan must be repaid on the schedule shown, and that late instalments carry a penalty.",
                "I confirm the guarantors have agreed, and that the purpose above is true.",
              ].map((text, i) => (
                <label key={text} className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5 text-sm">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--color-brand-primary)]" checked={decl[i]} onChange={() => setDecl((d) => d.map((v, j) => (j === i ? !v : v)))} />
                  <span>{text}</span>
                </label>
              ))}
            </div>
            <p className="ny-chip ny-chip-sim">Submitting logs a SIMULATED application · status becomes “under review”</p>
          </div>
        )}
      </Modal>

      <GuarantorPickerModal
        open={picker}
        onClose={() => setPicker(false)}
        candidates={candidates}
        selected={guarantors}
        onChange={setGuarantors}
        pledgePct={rules.pledgePct}
        needed={p.guarantors}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* W2 — Make a payment (three steps)                                    */
/* ------------------------------------------------------------------ */
export function PaymentWizard({ view, onPay, onClose }: { view: LoanView; onPay: (amt: number, ch: Channel) => void; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [amtStr, setAmtStr] = useState(String(view.next?.instalment ?? view.outstanding));
  const [ch, setCh] = useState<Channel>(view.loan.channel);
  const [busy, setBusy] = useState(false);
  const n = Number(amtStr.replace(/\D/g, "")) || 0;
  const quick = [
    { label: "Next instalment", v: view.next?.instalment ?? 0 },
    { label: "Clear overdue", v: view.overdueAmt },
    { label: "Pay off the balance", v: view.outstanding },
  ].filter((q) => q.v > 0);
  const amountOK = n > 0 && n <= view.outstanding;
  const labels = ["Amount", "Channel", "Confirm"];
  const canNext = step === 0 ? amountOK : true;

  return (
    <Modal
      open
      onClose={onClose}
      title="Make a payment"
      sub={`${view.loan.ref} · ${view.loan.title}`}
      size="md"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < 2 ? (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              className="ny-btn ny-btn-accent ny-btn-sm"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                window.setTimeout(() => onPay(n, ch), 650);
              }}
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Post {kes(n)} (SIMULATED)
            </button>
          )}
        </>
      }
    >
      <Stepper total={3} current={step} labels={labels} />

      {step === 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {quick.map((q) => (
              <button key={q.label} type="button" onClick={() => setAmtStr(String(q.v))} className={`ny-chip ny-touch ${n === q.v ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral"}`}>
                {q.label} · {kesShort(q.v)}
              </button>
            ))}
          </div>
          <label className="ny-label" htmlFor="pay-amt">Amount (KES)</label>
          <input id="pay-amt" inputMode="numeric" className="ny-input ny-num" value={amtStr} onChange={(e) => setAmtStr(e.target.value.replace(/[^0-9]/g, ""))} />
          {n > view.outstanding && <p className="text-sm text-danger">More than the {kes(view.outstanding)} left on this loan.</p>}
          <div className="ny-inset grid grid-cols-2 gap-3 px-3.5 py-3 text-sm">
            <span>
              <span className="ny-hud block">Balance after</span>
              <span className="ny-num font-semibold">{kes(Math.max(0, view.outstanding - n))}</span>
            </span>
            <span>
              <span className="ny-hud block">Instalments cleared</span>
              <span className="ny-num font-semibold">{view.k} of {view.rows.length}</span>
            </span>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-2 sm:grid-cols-3">
          {(["mpesa", "bank", "internal"] as Channel[]).map((c) => {
            const Icon = channelIcon[c];
            return (
              <button key={c} type="button" onClick={() => setCh(c)} className={`rounded-xl border p-3.5 text-left transition ${ch === c ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Icon className="h-4 w-4 text-brand-primary" /> {channelMeta[c].label}
                </span>
                <span className="mt-1.5 flex items-center justify-between gap-2">
                  <span className="ny-hud !text-[0.55rem]">settles {channelMeta[c].eta}</span>
                  {channelMeta[c].sim ? <span className="ny-chip ny-chip-sim">SIMULATED</span> : <span className="ny-chip ny-chip-ok">local</span>}
                </span>
              </button>
            );
          })}
          {ch === "bank" && <p className="ny-chip ny-chip-warn sm:col-span-3">Bank transfers only count once the reference lands — they post as pending.</p>}
          {ch === "mpesa" && <p className="ny-chip ny-chip-sim sm:col-span-3">An STK prompt would go to +2547 ··· 2210 — SIMULATED, nothing is sent.</p>}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
            {[
              ["Loan", view.loan.ref],
              ["Amount", kes(n)],
              ["Channel", channelMeta[ch].label],
              ["Counts as", ch === "bank" ? "Pending until the reference lands" : "Confirmed on posting"],
              ["Left after", kes(Math.max(0, view.outstanding - (ch === "bank" ? 0 : n)))],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <dt className="text-text-secondary">{k}</dt>
                <dd className="ny-num text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="ny-chip ny-chip-sim">SIMULATED · a ledger entry posts and the progress ring updates</p>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* W3 — Restructure (admin: reason + 2FA, three steps)                   */
/* ------------------------------------------------------------------ */
export function RestructureWizard({ view, onApply, onClose }: { view: LoanView; onApply: (term: number, reason: string) => void; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [add, setAdd] = useState(6);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const loan = view.loan;
  const newTerm = Math.min(60, loan.termMonths + add);
  const newRows = schedule({ amount: view.principalLeft, rate: loan.rate, method: loan.method, freq: loan.freq, termMonths: newTerm, start: AS_OF });
  const oldRemainingInterest = view.rows.slice(view.k).reduce((s, r) => s + r.interest, 0);
  const newInterest = totalOf(newRows) - view.principalLeft;
  const labels = ["Option", "Preview", "Authorise"];
  const canNext = step === 0 ? true : step === 1 ? true : reason.trim().length >= 6 && code.length === 6;

  return (
    <Modal
      open
      onClose={onClose}
      title="Restructure this loan"
      sub={`${loan.ref} · ${fmt(view.principalLeft)} KES principal left · admin only`}
      size="lg"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < 2 ? (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={!canNext} onClick={() => onApply(newTerm, reason)}>
              <ShieldCheck className="h-3.5 w-3.5" /> Restructure (SIMULATED)
            </button>
          )}
        </>
      }
    >
      <Stepper total={3} current={step} labels={labels} />

      {step === 0 && (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-text-secondary">
            Restructuring starts a fresh schedule on what is still owed. A longer term means a smaller instalment and more interest overall.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {[6, 12, 18].map((m) => (
              <button key={m} type="button" onClick={() => setAdd(m)} className={`rounded-xl border p-4 text-left transition ${add === m ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                <span className="ny-display block text-lg">+{m} months</span>
                <span className="ny-hud mt-1 block !text-[0.55rem]">term {loan.termMonths + m} months</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <dl className="grid grid-cols-2 gap-2 text-sm">
            {[
              ["Instalment now", kes(view.instalment)],
              ["Instalment after", kes(newRows[0]?.instalment ?? 0)],
              ["Interest left now", kes(oldRemainingInterest)],
              ["Interest after", kes(newInterest)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                <dt className="ny-hud">{k}</dt>
                <dd className="ny-num mt-1 font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <AmortChart rows={newRows} amount={view.principalLeft} height={170} />
          <p className="ny-hud">New first instalment {fmtDate(newRows[0]?.due ?? AS_OF)}</p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <label className="ny-label" htmlFor="rs-reason">Reason (logged)</label>
          <input id="rs-reason" className="ny-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Harvest was late — agreed with the guarantors" />
          <label className="ny-label" htmlFor="rs-code"><Fingerprint className="mr-1 inline h-3.5 w-3.5" /> 2FA code</label>
          <input id="rs-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
          <p className="ny-chip ny-chip-sim">Restructures are audited with before and after · dev mode accepts any 6 digits</p>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* W4 — Approve or decline (finance officer: checks → decision → authorise) */
/* ------------------------------------------------------------------ */
export function ApproveWizard({
  view,
  available,
  activeOK,
  rules,
  onDecide,
  onClose,
}: {
  view: LoanView;
  available: number;
  activeOK: boolean;
  rules: Policy;
  onDecide: (d: { decision: "approve" | "decline"; channel: Channel; reason: string }) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [decision, setDecision] = useState<"approve" | "decline">("approve");
  const [channel, setChannel] = useState<Channel>(view.loan.channel);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const [code2, setCode2] = useState("");
  const loan = view.loan;
  const p = productOf(loan.product);
  const checks = [
    { label: `Within the ceiling (${kes(available)} available)`, pass: loan.amount <= available },
    { label: `Guarantors: ${loan.guarantors.length} of ${p.guarantors} needed`, pass: loan.guarantors.length >= p.guarantors },
    { label: "Collateral documented", pass: !p.collateral || !!loan.collateral },
    { label: "School paybill on file", pass: !p.school || !!loan.school },
    { label: "Borrower under the active-loan limit", pass: activeOK },
    { label: "Purpose recorded", pass: loan.purpose.trim().length > 3 },
  ];
  const allPass = checks.every((c) => c.pass);
  const twoFA = loan.amount > rules.twoFactorAbove;
  const fourEyes = loan.amount > rules.fourEyesAbove;
  const labels = ["Checks", "Decision", "Authorise"];
  const authOK =
    decision === "decline"
      ? reason.trim().length >= 6
      : (!twoFA || code.length === 6) && (!fourEyes || code2.length === 6);
  const canNext = step === 0 ? true : step === 1 ? decision === "decline" || allPass : true;

  return (
    <Modal
      open
      onClose={onClose}
      title="Review application"
      sub={`${loan.ref} · ${p.name} · ${kes(loan.amount)}`}
      size="md"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Close" : "Back"}
          </button>
          {step < 2 ? (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button type="button" className={`ny-btn ny-btn-sm ${decision === "approve" ? "ny-btn-accent" : "ny-btn-danger"}`} disabled={!authOK} onClick={() => onDecide({ decision, channel, reason })}>
              {decision === "approve" ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
              {decision === "approve" ? "Approve and disburse" : "Decline application"}
            </button>
          )}
        </>
      }
    >
      <Stepper total={3} current={step} labels={labels} />

      {step === 0 && (
        <ul className="space-y-2">
          {checks.map((c) => (
            <li key={c.label} className={`ln-check ${c.pass ? "is-pass" : "is-fail"}`}>
              <span className="ln-check__mark">{c.pass ? "✓" : "!"}</span>
              <span className="text-sm">{c.label}</span>
            </li>
          ))}
          {!allPass && <p className="ny-chip ny-chip-warn mt-2">Approval unlocks when every check passes. You can still decline with a reason.</p>}
        </ul>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" disabled={!allPass} onClick={() => setDecision("approve")} className={`rounded-xl border p-4 text-left transition disabled:opacity-50 ${decision === "approve" ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1"}`}>
              <span className="ny-display block text-base">Approve and disburse</span>
              <span className="mt-1 block text-sm text-text-secondary">Money goes out through the channel you pick.</span>
            </button>
            <button type="button" onClick={() => setDecision("decline")} className={`rounded-xl border p-4 text-left transition ${decision === "decline" ? "border-danger bg-[rgba(198,40,40,0.06)]" : "border-border-subtle bg-surface-1"}`}>
              <span className="ny-display block text-base">Decline</span>
              <span className="mt-1 block text-sm text-text-secondary">Needs a reason the borrower can read.</span>
            </button>
          </div>
          {decision === "approve" && (
            <div>
              <span className="ny-label">Disburse through</span>
              <div className="flex flex-wrap gap-2">
                {(["mpesa", "bank", "internal"] as Channel[]).map((c) => (
                  <button key={c} type="button" onClick={() => setChannel(c)} className={`ny-btn ny-btn-sm ${channel === c ? "ny-btn-primary" : "ny-btn-outline"}`}>
                    {channelMeta[c].label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 2 && decision === "decline" && (
        <div className="space-y-3">
          <label className="ny-label" htmlFor="ap-reason">Reason for the borrower</label>
          <textarea id="ap-reason" className="ny-textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Guarantor cover is below half the amount requested." />
          <p className="ny-chip ny-chip-sim">Logged to the audit trail · the borrower is told in the app</p>
        </div>
      )}

      {step === 2 && decision === "approve" && (
        <div className="space-y-3">
          <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
            {[
              ["Disburses", kes(loan.amount)],
              ["Channel", channelMeta[channel].label],
              ["First instalment", fmtDate(addMonths(AS_OF, 1))],
              ["Requires", [twoFA ? "2FA" : null, fourEyes ? "second approver" : null].filter(Boolean).join(" + ") || "Standard approval"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <dt className="text-text-secondary">{k}</dt>
                <dd className="ny-num text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          {twoFA && (
            <div>
              <label className="ny-label" htmlFor="ap-2fa"><Fingerprint className="mr-1 inline h-3.5 w-3.5" /> Your 2FA code</label>
              <input id="ap-2fa" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
            </div>
          )}
          {fourEyes && (
            <div>
              <label className="ny-label" htmlFor="ap-4e">Second approver’s 2FA code</label>
              <input id="ap-4e" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code2} onChange={(e) => setCode2(e.target.value.replace(/\D/g, "").slice(0, 6))} />
            </div>
          )}
          <p className="ny-chip ny-chip-sim">SIMULATED disbursement · dev mode accepts any 6 digits</p>
        </div>
      )}
      <p className="ny-hud mt-3 !text-[0.52rem]">Status: {statusMeta[view.status].label}</p>
    </Modal>
  );
}

