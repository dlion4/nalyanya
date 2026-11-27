import { useCallback, useState } from "react";
import { ArrowRight, Calendar, CheckCircle2, MapPin, Users, Wallet, Send, ShieldCheck } from "lucide-react";
import { Stepper, Field } from "@/app/(dashboard)/dashboard/obituaries/components/PinholeStage";
import { useWorkspace } from "@/state/Workspace";
import { type CausePurpose } from "@/data/dashboard/contributions";
import { kes } from "@/lib/format";

/* ═══════════════════════════════════════════════════════════════════════
   S6 · CREATE CAUSE WIZARD — admin/beneficiary creates a new cause
   title → purpose → beneficiary → goal → deadline → scope → payout → publish → SIMULATED
   Only renders when open — no sticky backdrop when closed.
   ═══════════════════════════════════════════════════════════════════════ */

interface CreateCauseWizardProps {
  open: boolean;
  onClose: () => void;
  onCreate: (cause: {
    title: string;
    purpose: CausePurpose;
    beneficiary: string;
    goal: number;
    deadline: string;
    scope: string;
    payoutDestination: string;
    description: string;
  }) => void;
}

const STEPS: string[] = ["Cause", "Purpose", "Beneficiary", "Goal", "Deadline", "Scope", "Payout", "Publish"];

const PURPOSES: { id: CausePurpose; label: string; sim: string; emoji: string }[] = [
  { id: "wedding", label: "Wedding", sim: "Celebration gift for a new couple", emoji: "💍" },
  { id: "sickness", label: "Sickness", sim: "Medical treatment and care", emoji: "🏥" },
  { id: "funeral", label: "Funeral", sim: "Burial and farewell expenses", emoji: "⚱️" },
  { id: "project", label: "Project", sim: "Homestead, construction, land", emoji: "🏗️" },
  { id: "education", label: "Education", sim: "School fees and bursaries", emoji: "🎓" },
  { id: "emergency", label: "Emergency", sim: "Crisis relief and welfare", emoji: "🆘" },
];

export function CreateCauseWizard({
  open,
  onClose,
  onCreate,
}: CreateCauseWizardProps) {
  if (!open) return null;

  const w = useWorkspace();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<{
    title: string;
    purpose: CausePurpose;
    beneficiary: string;
    goal: number;
    deadline: string;
    scope: string;
    payoutDestination: string;
    description: string;
  }>({
    title: "",
    purpose: "wedding",
    beneficiary: "",
    goal: 0,
    deadline: "",
    scope: "all",
    payoutDestination: "",
    description: "",
  });

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  };
  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  const published = step === STEPS.length - 1;

  const handlePublish = useCallback(() => {
    onCreate({ ...draft });
    w.setToast(
      `Cause "${draft.title}" created on this device — Ready — connects when the backend is wired.`,
    );
    setStep(0);
    onClose();
  }, [draft, onCreate, w, onClose]);

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-cause-title"
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
                <h2 className="ny-title text-2xl" id="create-cause-title">
                  Create a new cause
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                  Set up a family giving cause. Admin gate — SIMULATED until the backend is wired.
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="ny-btn ny-btn-ghost ny-btn-sm size-10 shrink-0 p-0">
                <span aria-hidden>✕</span>
              </button>
            </header>

            <div className="ny-scroll min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              {published ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-3 py-8">
                    <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                      <CheckCircle2 size={32} strokeWidth={2.5} className="text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-text-primary">Cause created</h3>
                      <p className="text-text-secondary text-sm">The cause is live on this device.</p>
                    </div>
                  </div>
                  <div className="ny-give-review">
                    <div>
                      <span>Title</span>
                      <b>{draft.title}</b>
                    </div>
                    <div>
                      <span>Purpose</span>
                      <b>{draft.purpose}</b>
                    </div>
                    <div>
                      <span>Beneficiary</span>
                      <b>{draft.beneficiary}</b>
                    </div>
                    <div>
                      <span>Goal</span>
                      <b>{kes(draft.goal)}</b>
                    </div>
                    <div>
                      <span>Deadline</span>
                      <b>{draft.deadline}</b>
                    </div>
                    <div>
                      <span>Scope</span>
                      <b>{draft.scope}</b>
                    </div>
                    <div>
                      <span>Payout destination</span>
                      <b className="font-mono text-xs">{draft.payoutDestination}</b>
                    </div>
                  </div>
                  <div className="ny-give-simnote">
                    <ShieldCheck size={14} aria-hidden />
                    The cause is published on this device. Contributions and
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
                        <Field label="Cause title" hint="What is this cause called?">
                          <input
                            className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none"
                            value={draft.title}
                            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                            placeholder="e.g. Grace's Wedding Harambee"
                          />
                        </Field>
                      </div>
                    )}
                    {step === 1 && (
                      <div className="space-y-3">
                        <Field label="Purpose" hint="What kind of cause is this?">
                          <div className="grid grid-cols-2 gap-3">
                            {PURPOSES.map((p) => {
                              const active = draft.purpose === p.id;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  className={`flex flex-col items-center gap-2 px-3 py-4 rounded-lg border transition ${active ? "border-give-ink bg-[#16211b] text-[#fdfbf5]" : "border-hairline bg-surface-0 text-text-secondary hover:border-give-accent"}`}
                                  onClick={() => setDraft({ ...draft, purpose: p.id })}
                                >
                                  <span className="text-xl" aria-hidden>{p.emoji}</span>
                                  <span className="text-sm font-medium">{p.label}</span>
                                  <span className="text-xs text-text-tertiary">{p.sim}</span>
                                </button>
                              );
                            })}
                          </div>
                        </Field>
                      </div>
                    )}
                    {step === 2 && (
                      <div className="space-y-3">
                        <Field label="Beneficiary" hint="Who benefits? Can be anonymized if sensitive.">
                          <input
                            className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none"
                            value={draft.beneficiary}
                            onChange={(e) => setDraft({ ...draft, beneficiary: e.target.value })}
                            placeholder="e.g. Grace Adhiambo Nalyanya"
                          />
                        </Field>
                        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-hairline"
                            readOnly
                          />
                          Anonymize beneficiary (minors / sensitive)
                        </label>
                      </div>
                    )}
                    {step === 3 && (
                      <div className="space-y-3">
                        <Field label="Goal amount (KES)" hint="How much does this cause need to raise?">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">KES</span>
                            <input
                              type="number"
                              min="0"
                              className="block w-full pl-10 rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none"
                              value={draft.goal}
                              onChange={(e) => setDraft({ ...draft, goal: Number(e.target.value) || 0 })}
                            />
                          </div>
                        </Field>
                      </div>
                    )}
                    {step === 4 && (
                      <div className="space-y-3">
                        <Field label="Deadline" hint="When should contributions close?">
                          <div className="relative">
                            <input
                              type="date"
                              className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none"
                              value={draft.deadline}
                              onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
                            />
                            <Calendar size={14} className="text-text-tertiary absolute right-3 top-1/2 -translate-y-1/2" aria-hidden />
                          </div>
                        </Field>
                      </div>
                    )}
                    {step === 5 && (
                      <div className="space-y-3">
                        <Field label="Contributors scope" hint="Who can contribute to this cause?">
                          <div className="space-y-2">
                            {[
                              { id: "all", label: "All family members", sim: "Anyone in the Nalyanya family" },
                              { id: "branch", label: "Branch only", sim: "Members of one branch" },
                              { id: "selected", label: "Selected members", sim: "Chosen relatives only" },
                            ].map((s) => {
                              const active = draft.scope === s.id;
                              return (
                                <button
                                  key={s.id}
                                  type="button"
                                  className={`w-full flex items-center gap-8 px-4 py-3 rounded-lg border transition ${active ? "border-give-ink bg-[#16211b] text-[#fdfbf5]" : "border-hairline bg-surface-0 text-text-secondary hover:border-give-accent"}`}
                                  onClick={() => setDraft({ ...draft, scope: s.id })}
                                >
                                  <Users size={14} aria-hidden />
                                  <div>
                                    <div className={active ? "font-medium text-[#fdfbf5]" : "font-medium text-text-primary"}>
                                      {s.label}
                                    </div>
                                    <div className={active ? "text-xs text-[#fdfbf5]/80" : "text-xs text-text-tertiary"}>
                                      {s.sim}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </Field>
                      </div>
                    )}
                    {step === 6 && (
                      <div className="space-y-3">
                        <Field label="Payout destination" hint="Where are funds released when the goal is met?">
                          <input
                            className="block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none"
                            value={draft.payoutDestination}
                            onChange={(e) => setDraft({ ...draft, payoutDestination: e.target.value })}
                            placeholder="e.g. M-Pesa 07XX XXX XXX or Bank account"
                          />
                        </Field>
                        <Field label="Description" hint="Tell the family what this cause is for.">
                          <textarea
                            className="ny-textarea block w-full rounded-lg border border-hairline bg-surface-0 px-3 py-2 text-sm focus:border-give-accent focus:outline-none"
                            value={draft.description}
                            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                            placeholder="Why this cause matters to the family…"
                          />
                        </Field>
                      </div>
                    )}
                    {step === 7 && (
                      <div className="space-y-4">
                        <div className="ny-give-review">
                          <div>
                            <span>Title</span>
                            <b>{draft.title}</b>
                          </div>
                          <div>
                            <span>Purpose</span>
                            <b>{draft.purpose}</b>
                          </div>
                          <div>
                            <span>Beneficiary</span>
                            <b>{draft.beneficiary}</b>
                          </div>
                          <div>
                            <span>Goal</span>
                            <b>{kes(draft.goal)}</b>
                          </div>
                          <div>
                            <span>Deadline</span>
                            <b>{draft.deadline}</b>
                          </div>
                          <div>
                            <span>Scope</span>
                            <b>{draft.scope}</b>
                          </div>
                          <div>
                            <span>Payout</span>
                            <b className="font-mono text-xs">{draft.payoutDestination}</b>
                          </div>
                        </div>
                        <div className="ny-give-simnote">
                          <ShieldCheck size={14} aria-hidden />
                          Publishing makes the cause visible to the family.
                          Contributions connect when the backend is wired.
                        </div>
                        <div className="ny-give-candle-scene">
                          <span className="ny-candle is-lit" aria-hidden>
                            <i className="ny-candle-flame" />
                            <i className="ny-candle-body" />
                          </span>
                          <span className="text-text-tertiary text-sm">Candle lit for the new cause</span>
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
                    <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={handlePublish}>
                      Publish <Send size={14} aria-hidden />
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
    if (step === 0) return draft.title.length > 0;
    if (step === 2) return draft.beneficiary.length > 0;
    if (step === 3) return draft.goal > 0;
    if (step === 4) return draft.deadline.length > 0;
    if (step === 6) return draft.payoutDestination.length > 0 && draft.description.length > 0;
    return true;
  }
}
