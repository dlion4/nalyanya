import { useCallback, useState } from "react";
import { ArrowRight, Calendar, CheckCircle2, MapPin, Users, Wallet, Send, ShieldCheck } from "lucide-react";
import { Stepper, Field } from "@/app/(dashboard)/dashboard/obituaries/components/PinholeStage";
import { useWorkspace } from "@/state/Workspace";
import { kes } from "@/lib/format";

/* ══════════════════════════════════════════════════════════════════════
   S6 · CREATE CHAMA WIZARD — multi-step modal
   name → purpose → members → cadence → amount → review → create → SIMULATED
   ══════════════════════════════════════════════════════════════════════ */

interface CreateChamaWizardProps {
  open: boolean;
  onClose: () => void;
  onCreate: (chama: {
    name: string;
    purpose: string;
    cadence: string;
    contributionKes: number;
    members: number;
  }) => void;
}

const STEPS: string[] = ["Name", "Purpose", "Members", "Cadence", "Amount", "Review", "Create"];

const CADENCES: { id: string; label: string; sim: string; icon: React.ReactNode }[] = [
  { id: "Weekly", label: "Weekly", sim: "Contribute every week", icon: <Calendar size={14} aria-hidden /> },
  { id: "Fortnightly", label: "Fortnightly", sim: "Contribute every two weeks", icon: <Calendar size={14} aria-hidden /> },
  { id: "Monthly", label: "Monthly", sim: "Contribute once a month", icon: <Calendar size={14} aria-hidden /> },
];

export function CreateChamaWizard({ open, onClose, onCreate }: CreateChamaWizardProps) {
  if (!open) return null;

  const w = useWorkspace();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<{
    name: string;
    purpose: string;
    cadence: string;
    contributionKes: number;
    members: number;
  }>({
    name: "",
    purpose: "",
    cadence: "Fortnightly",
    contributionKes: 0,
    members: 0,
  });

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };
  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const created = step === STEPS.length - 1;

  const handleCreate = useCallback(() => {
    onCreate({ ...draft });
    w.setToast(`Chama "${draft.name}" created on this device — Ready — connects when the backend is wired.`);
    setStep(0);
    onClose();
  }, [draft, onCreate, w, onClose]);

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-chama-title"
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
                <h2 className="ny-title text-2xl" id="create-chama-title">Create a new chama</h2>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  Set up a merry-go-round or savings circle. Admin gate — SIMULATED until the backend is wired.
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="ny-btn ny-btn-ghost ny-btn-sm size-10 shrink-0 p-0">
                <span aria-hidden>✕</span>
              </button>
            </header>

            <div className="ny-scroll min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              {created ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-3 py-8">
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle2 size={32} strokeWidth={2.5} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-text-primary">Chama created</h3>
                      <p className="text-text-secondary text-sm">The chama is live on this device.</p>
                    </div>
                  </div>
                  <div className="ny-give-review">
                    <div>
                      <span>Name</span>
                      <b>{draft.name}</b>
                    </div>
                    <div>
                      <span>Cadence</span>
                      <b>{draft.cadence}</b>
                    </div>
                    <div>
                      <span>Members</span>
                      <b>{draft.members}</b>
                    </div>
                    <div>
                      <span>Contribution</span>
                      <b>{kes(draft.contributionKes)}</b>
                    </div>
                    <div>
                      <span>Pool (projected)</span>
                      <b className="is-gold font-mono">{kes(draft.contributionKes * draft.members)}</b>
                    </div>
                  </div>
                  <div className="ny-give-simnote">
                    <ShieldCheck size={14} aria-hidden />
                    The chama is published on this device. Contributions and
                    payouts connect when the backend is wired.
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
                        <Field label="Chama name" hint="What is this saving circle called?">
                          <input
                            className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none"
                            value={draft.name}
                            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                            placeholder="e.g. Wazee Round"
                          />
                        </Field>
                      </div>
                    )}
                    {step === 1 && (
                      <div className="space-y-3">
                        <Field label="Purpose" hint="What is the chama for?">
                          <textarea
                            className="ny-textarea block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none"
                            value={draft.purpose}
                            onChange={(e) => setDraft({ ...draft, purpose: e.target.value })}
                            placeholder="e.g. School fees, medical fund, harambee…"
                          />
                        </Field>
                      </div>
                    )}
                    {step === 2 && (
                      <div className="space-y-3">
                        <Field label="Number of members" hint="How many family members will contribute?">
                          <input
                            type="number"
                            min="2"
                            className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none"
                            value={draft.members}
                            onChange={(e) => setDraft({ ...draft, members: Number(e.target.value) || 0 })}
                          />
                        </Field>
                      </div>
                    )}
                    {step === 3 && (
                      <div className="space-y-3">
                        <Field label="Contribution cadence" hint="How often do members contribute?">
                          <div className="space-y-2">
                            {CADENCES.map((c) => {
                              const active = draft.cadence === c.id;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  className={`w-full flex items-center gap-8 px-4 py-3 rounded-lg border transition ${active ? "border-give-ink bg-[#16211b] text-[#fdfbf5]" : "border-hairline bg-surface-0 text-text-secondary hover:border-give-accent"}`}
                                  onClick={() => setDraft({ ...draft, cadence: c.id })}
                                >
                                  {c.icon}
                                  <div>
                                    <div className={active ? "font-medium text-[#fdfbf5]" : "font-medium text-text-primary"}>
                                      {c.label}
                                    </div>
                                    <div className={active ? "text-xs text-[#fdfbf5]/80" : "text-xs text-text-tertiary"}>
                                      {c.sim}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </Field>
                      </div>
                    )}
                    {step === 4 && (
                      <div className="space-y-3">
                        <Field label="Contribution amount (KES)" hint="How much does each member contribute?">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">KES</span>
                            <input
                              type="number"
                              min="0"
                              className="block w-full pl-10 rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none"
                              value={draft.contributionKes}
                              onChange={(e) => setDraft({ ...draft, contributionKes: Number(e.target.value) || 0 })}
                            />
                          </div>
                          <div className="mt-2 text-xs text-text-tertiary">
                            Projected pool: <b>{kes(draft.contributionKes * draft.members)}</b>
                          </div>
                        </Field>
                      </div>
                    )}
                    {step === 5 && (
                      <div className="space-y-4">
                        <div className="ny-give-review">
                          <div>
                            <span>Name</span>
                            <b>{draft.name}</b>
                          </div>
                          <div>
                            <span>Purpose</span>
                            <b>{draft.purpose}</b>
                          </div>
                          <div>
                            <span>Members</span>
                            <b>{draft.members}</b>
                          </div>
                          <div>
                            <span>Cadence</span>
                            <b>{draft.cadence}</b>
                          </div>
                          <div>
                            <span>Contribution</span>
                            <b>{kes(draft.contributionKes)}</b>
                          </div>
                          <div>
                            <span>Projected pool</span>
                            <b className="is-gold font-mono">{kes(draft.contributionKes * draft.members)}</b>
                          </div>
                        </div>
                        <div className="ny-give-simnote">
                          <ShieldCheck size={14} aria-hidden />
                          Creating the chama makes it visible to the family.
                          Contributions connect when the backend is wired.
                        </div>
                        <div className="ny-give-candle-scene">
                          <span className="ny-candle is-lit" aria-hidden>
                            <i className="ny-candle-flame" />
                            <i className="ny-candle-body" />
                          </span>
                          <span className="text-text-tertiary text-sm">Candle lit for the new chama</span>
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
                    <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={handleCreate}>
                      Create <Send size={14} aria-hidden />
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
    if (step === 0) return draft.name.length > 0;
    if (step === 1) return draft.purpose.length > 0;
    if (step === 2) return draft.members > 0;
    if (step === 4) return draft.contributionKes > 0;
    return true;
  }
}
