import { useCallback, useState } from "react";
import { ArrowRight, CheckCircle2, CreditCard, Landmark, Phone, Send, ShieldCheck } from "lucide-react";
import { Stepper, Field } from "@/app/(dashboard)/dashboard/obituaries/components/PinholeStage";
import { useWorkspace } from "@/state/Workspace";
import { type ContributionChannel } from "@/data/dashboard/contributions";
import { kes } from "@/lib/format";

/* ═══════════════════════════════════════════════════════════════════════
   S3 · CONTRIBUTE WIZARD — multi-step modal
   cause → amount → channel → phone → message → review → confirm → SIMULATED receipt
   Only renders when open — no sticky backdrop when closed.
   ═══════════════════════════════════════════════════════════════════════ */

interface ContributeWizardProps {
  open: boolean;
  onClose: () => void;
  causes: { id: string; title: string }[];
  onContribute: (payload: {
    causeId: string;
    amount: number;
    channel: ContributionChannel;
    message?: string;
  }) => void;
}

const STEPS: string[] = [
  "Cause",
  "Amount",
  "Channel",
  "Phone / account",
  "Message",
  "Review",
  "Confirm",
  "Receipt",
];

export function ContributeWizard({
  open,
  onClose,
  causes,
  onContribute,
}: ContributeWizardProps) {
  if (!open) return null;

  const w = useWorkspace();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<{
    causeId: string;
    amount: number;
    channel: ContributionChannel;
    phone?: string;
    message?: string;
  }>({
    causeId: causes[0]?.id ?? "",
    amount: 0,
    channel: "mpesa",
    phone: "",
    message: "",
  });

  const cause = causes.find((c) => c.id === draft.causeId);

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };
  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const channels: { id: ContributionChannel; label: string; sim: string; icon: React.ReactNode }[] = [
    { id: "mpesa", label: "M-Pesa", sim: "SIMULATED — M-Pesa Daraya", icon: <Phone size={14} aria-hidden /> },
    { id: "airtel", label: "Airtel Money", sim: "SIMULATED — Airtel Money", icon: <Phone size={14} aria-hidden /> },
    { id: "bank", label: "Bank transfer", sim: "SIMULATED — Bank to Family Sacco", icon: <CreditCard size={14} aria-hidden /> },
    { id: "internal", label: "Family ledger", sim: "SIMULATED — Internal transfer", icon: <Landmark size={14} aria-hidden /> },
  ];

  const confirmed = step === STEPS.length - 1;

  const handleConfirm = useCallback(() => {
    onContribute({
      causeId: draft.causeId,
      amount: draft.amount,
      channel: draft.channel,
      message: draft.message,
    });
    w.setToast(
      `Receipt NY-CON-2026-${String(Math.floor(Math.random() * 9000) + 1000)} — contribution recorded on this device. Ready — connects when the backend is wired.`,
    );
    setStep(0);
    onClose();
  }, [draft, onContribute, w, onClose]);

  const channelLabel = (ch: string) => {
    if (ch === "mpesa") return "M-Pesa";
    if (ch === "bank") return "Bank";
    if (ch === "airtel") return "Airtel Money";
    return "Family ledger";
  };

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contribute-wizard-title"
    >
      <div
        className="fixed inset-0 bg-brand-deep/40 backdrop-blur-sm transition duration-300 ease-out"
        onClick={onClose}
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
          <div
            className="relative flex w-full max-w-lg flex-col bg-surface-1 shadow-lift rounded-[28px]"
            style={{
              transform: "scale(1) translateY(0)",
              opacity: 1,
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-hairline p-5 sm:p-6">
              <div className="min-w-0">
                <h2 className="ny-title text-2xl" id="contribute-wizard-title">
                  Contribute to {cause?.title ?? "a cause"}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  Every contribution is recorded on the family ledger. Payments
                  are SIMULATED until the backend is wired.
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="ny-btn ny-btn-ghost ny-btn-sm size-10 shrink-0 p-0">
                <span aria-hidden>✕</span>
              </button>
            </header>

            <div className="ny-scroll min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              {confirmed ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-3 py-8">
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle2 size={32} strokeWidth={2.5} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-text-primary">Contribution confirmed</h3>
                      <p className="text-text-secondary text-sm">Your gift has been recorded on the family ledger.</p>
                    </div>
                  </div>
                  <div className="ny-give-receipt">
                    <div className="ny-give-receipt-head">
                      <span className="ny-give-receipt-no">Receipt NY-CON-2026-0000</span>
                      <span className="text-text-tertiary text-xs">{new Date().toISOString().slice(0, 16)}</span>
                    </div>
                    <div className="ny-give-receipt-line">
                      <span>Cause</span>
                      <b>{cause?.title ?? "—"}</b>
                    </div>
                    <div className="ny-give-receipt-line">
                      <span>Amount</span>
                      <b>{kes(draft.amount)}</b>
                    </div>
                    <div className="ny-give-receipt-line">
                      <span>Channel</span>
                      <b>{channelLabel(draft.channel)}</b>
                    </div>
                    <div className="ny-give-receipt-line">
                      <span>Status</span>
                      <b className="text-green-600 font-semibold">Confirmed (SIMULATED)</b>
                    </div>
                    <div className="ny-give-receipt-line">
                      <span>Ledger ref</span>
                      <b className="font-mono text-xs">NY-LED-2026-00000</b>
                    </div>
                    <div className="ny-give-receipt-foot">
                      This receipt is generated on this device. Ready — connects when the backend is wired.
                    </div>
                  </div>
                  <div className="ny-give-foot">
                    <button type="button" className="ny-btn ny-btn-primary" onClick={onClose}>
                      <Send size={14} aria-hidden />
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Stepper steps={STEPS} current={step} />
                  <div className="space-y-4">
                    {step === 0 && (
                      <div className="space-y-3">
                        <Field label="Choose a cause" hint="Which cause are you contributing to?">
                          <select
                            className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none"
                            value={draft.causeId}
                            onChange={(e) => setDraft({ ...draft, causeId: e.target.value })}
                          >
                            {causes.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    )}
                    {step === 1 && (
                      <div className="space-y-3">
                        <Field label="Amount (KES)" hint="How much would you like to give?">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">KES</span>
                            <input
                              type="number"
                              min="0"
                              className="block w-full pl-10 rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none"
                              value={draft.amount}
                              onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) || 0 })}
                            />
                          </div>
                        </Field>
                        {draft.amount > 0 && (
                          <div className="ny-give-simnote">
                            <ShieldCheck size={14} aria-hidden />
                            Your KES {draft.amount.toLocaleString("en-KE")} goes toward{" "}
                            <b>{cause?.title}</b>. Fees and ETA are calculated
                            on confirm — SIMULATED.
                          </div>
                        )}
                      </div>
                    )}
                    {step === 2 && (
                      <div className="space-y-3">
                        <Field label="Payment channel" hint="How will you send the contribution?">
                          <div className="space-y-2">
                            {channels.map((ch) => {
                              const active = draft.channel === ch.id;
                              return (
                                <button
                                  key={ch.id}
                                  type="button"
                                  className={`w-full flex items-center gap-8 px-4 py-3 rounded-lg border transition ${active ? "border-give-ink bg-[#16211b] text-[#fdfbf5]" : "border-hairline bg-surface-0 text-text-secondary hover:border-give-accent"}`}
                                  onClick={() => setDraft({ ...draft, channel: ch.id })}
                                >
                                  {ch.icon}
                                  <div>
                                    <div className={active ? "font-medium text-[#fdfbf5]" : "font-medium text-text-primary"}>
                                      {ch.label}
                                    </div>
                                    <div className={active ? "text-xs text-[#fdfbf5]/80" : "text-xs text-text-tertiary"}>
                                      {ch.sim}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </Field>
                      </div>
                    )}
                    {step === 3 && (
                      <div className="space-y-3">
                        <Field label="Phone / account number" hint="Prefilled from your profile where available.">
                          <input
                            type="tel"
                            className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none"
                            value={draft.phone ?? ""}
                            placeholder="07XX XXX XXX"
                            onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                          />
                        </Field>
                        <p className="text-xs text-text-tertiary">
                          Channel {channelLabel(draft.channel)} — SIMULATED, no real
                          money moves until the backend is wired.
                        </p>
                      </div>
                    )}
                    {step === 4 && (
                      <div className="space-y-3">
                        <Field label="Message (optional)" hint="A short note that goes with your contribution.">
                          <textarea
                            className="ny-textarea block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none"
                            value={draft.message ?? ""}
                            placeholder="e.g. Congratulations Grace!"
                            onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                          />
                        </Field>
                      </div>
                    )}
                    {step === 5 && (
                      <div className="space-y-4">
                        <div className="ny-give-review">
                          <div>
                            <span>Cause</span>
                            <b>{cause?.title}</b>
                          </div>
                          <div>
                            <span>Amount</span>
                            <b>{kes(draft.amount)}</b>
                          </div>
                          <div>
                            <span>Channel</span>
                            <b>{channelLabel(draft.channel)}</b>
                          </div>
                          <div>
                            <span>Phone / account</span>
                            <b>{draft.phone ?? "—"}</b>
                          </div>
                          <div>
                            <span>Message</span>
                            <b>{draft.message ?? "—"}</b>
                          </div>
                          <div>
                            <span>Estimated arrival</span>
                            <b>Instant (SIMULATED)</b>
                          </div>
                        </div>
                        <div className="ny-give-simnote">
                          <ShieldCheck size={14} aria-hidden />
                          No money is sent yet. Tap <b>Confirm</b> to generate a
                          simulated receipt — connects when the backend is wired.
                        </div>
                      </div>
                    )}
                    {step === 6 && (
                      <div className="space-y-4">
                        <div className="ny-give-simnote">
                          <ShieldCheck size={14} aria-hidden />
                          Confirming records this contribution on the family
                          ledger and generates receipt NY-CON-2026-0000. This is
                          <b>SIMULATED</b> — no real payment is made.
                        </div>
                        <div className="ny-give-candle-scene">
                          <span className="ny-candle is-lit" aria-hidden>
                            <i className="ny-candle-flame" />
                            <i className="ny-candle-body" />
                          </span>
                          <span className="text-text-tertiary text-sm">Candle lit for your giving</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <footer className="border-t border-hairline bg-surface-0/70 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-text-tertiary">
                  Step {step + 1} of {STEPS.length}
                </span>
                <div className="flex items-center gap-3">
                  {step > 0 && (
                    <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={back} disabled={step === 0}>
                      <ArrowRight className="-rotate-180" size={14} aria-hidden />
                      Back
                    </button>
                  )}
                  {step < STEPS.length - 1 ? (
                    <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={next} disabled={!canProceed()}>
                      Next <ArrowRight size={14} aria-hidden />
                    </button>
                  ) : (
                    <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={handleConfirm}>
                      Confirm <Send size={14} aria-hidden />
                    </button>
                  )}
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );

  function canProceed() {
    if (step === 0) return !!draft.causeId;
    if (step === 1) return draft.amount > 0;
    if (step === 2) return !!draft.channel;
    if (step === 3) return !!draft.phone;
    return true;
  }
}
