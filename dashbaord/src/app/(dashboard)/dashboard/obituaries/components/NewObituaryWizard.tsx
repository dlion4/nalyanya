import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  FileText,
  Flag,
  HandCoins,
  Lock,
  MapPin,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { BRANCHES } from "@/data/family/branches";
import { members } from "@/data/dashboard/command-center";
import { cn } from "@/lib/format";
import { Field, MemorialChip, Stepper } from "./PinholeStage";

/* ═══════════════════════════════════════════════════════════════════════
   S4 · NEW OBITUARY WIZARD
   Eight careful steps, because a notice about a death is the most
   sensitive thing this workspace ever publishes. The final confirmation
   requires the family to type why — and the publish resolves to the
   labeled "connects when the backend is wired" state.
   ═══════════════════════════════════════════════════════════════════════ */

const STEPS = [
  "Who has passed",
  "Dates",
  "The notice",
  "Funeral",
  "Contribution",
  "Scope",
  "Confirm",
  "Audit",
];

export interface ObituaryDraft {
  name: string;
  memberId: string;
  branchId: string;
  born: string;
  died: string;
  notice: string;
  statement: string;
  funeralDate: string;
  funeralTime: string;
  venue: string;
  town: string;
  burial: string;
  causeId: string;
  scope: "family" | "branch" | "admins";
  reason: string;
}

const EMPTY: ObituaryDraft = {
  name: "",
  memberId: "",
  branchId: "nalyanya-main",
  born: "",
  died: "",
  notice: "",
  statement: "",
  funeralDate: "",
  funeralTime: "10:00",
  venue: "",
  town: "",
  burial: "",
  causeId: "",
  scope: "family",
  reason: "",
};

export function NewObituaryWizard({
  open,
  onClose,
  onPublish,
}: {
  open: boolean;
  onClose: () => void;
  onPublish: (draft: ObituaryDraft) => void;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ObituaryDraft>(EMPTY);
  const [touched, setTouched] = useState(false);

  const patch = (values: Partial<ObituaryDraft>) =>
    setDraft((d) => ({ ...d, ...values }));

  const age = useMemo(() => {
    if (!draft.born || !draft.died) return null;
    const b = new Date(draft.born);
    const d = new Date(draft.died);
    if (Number.isNaN(b.getTime()) || Number.isNaN(d.getTime())) return null;
    let years = d.getFullYear() - b.getFullYear();
    const before =
      d.getMonth() < b.getMonth() ||
      (d.getMonth() === b.getMonth() && d.getDate() < b.getDate());
    if (before) years -= 1;
    return years;
  }, [draft.born, draft.died]);

  const stepValid = (() => {
    switch (step) {
      case 0:
        return draft.name.trim().length > 2;
      case 1:
        return Boolean(draft.born && draft.died);
      case 2:
        return draft.notice.trim().length > 20;
      case 6:
        return draft.reason.trim().length > 8;
      default:
        return true;
    }
  })();

  const close = () => {
    setStep(0);
    setDraft(EMPTY);
    setTouched(false);
    onClose();
  };

  const finish = () => {
    onPublish(draft);
    setStep(0);
    setDraft(EMPTY);
  };

  return (
    <ModalDialog
      open={open}
      onClose={close}
      size="lg"
      title="Remember someone"
      description="A careful, eight-step record. Nothing is published until the family confirms."
      footer={
        <div className="ny-memorial-wizard-foot">
          <button
            type="button"
            className="ny-btn ny-btn-ghost ny-btn-sm"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft size={14} aria-hidden />
            Back
          </button>
          <span className="ny-memorial-wizard-count ny-num">
            Step {step + 1} of {STEPS.length}
          </span>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="ny-btn ny-btn-primary ny-btn-sm"
              onClick={() => {
                setTouched(true);
                if (stepValid) setStep((s) => s + 1);
              }}
            >
              Continue
              <ArrowRight size={14} aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              className="ny-btn ny-btn-primary ny-btn-sm"
              onClick={finish}
            >
              <Check size={14} aria-hidden />
              Publish the notice
            </button>
          )}
        </div>
      }
    >
      <Stepper steps={STEPS} current={step} />

      <div className="ny-memorial-wizard-body">
        {step === 0 && (
          <div className="ny-memorial-step-body">
            <h3>
              <Users size={16} aria-hidden />
              Who has passed?
            </h3>
            <p className="ny-memorial-step-intro">
              Choose a member of the family tree, or type the name for
              someone outside the tree.
            </p>
            <Field label="Family member">
              <select
                className="ny-input"
                value={draft.memberId}
                onChange={(event) => {
                  const id = event.target.value;
                  const person = members.find((m) => m.id === id);
                  patch({
                    memberId: id,
                    name: person?.name ?? draft.name,
                    branchId: person?.branch ?? draft.branchId,
                  });
                }}
              >
                <option value="">— Not in the tree —</option>
                {members.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} · {person.profession}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Full name" required>
              <input
                className="ny-input"
                value={draft.name}
                placeholder="e.g. Amos Wafula Nalyanya"
                onChange={(event) => patch({ name: event.target.value })}
              />
            </Field>
            <Field label="Branch" hint="Determines who the notice is addressed to.">
              <select
                className="ny-input"
                value={draft.branchId}
                onChange={(event) => patch({ branchId: event.target.value })}
              >
                {BRANCHES.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </Field>
            {touched && draft.name.trim().length <= 2 && (
              <p className="ny-memorial-error">
                <AlertTriangle size={13} aria-hidden />
                Please enter the full name.
              </p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="ny-memorial-step-body">
            <h3>
              <Sparkles size={16} aria-hidden />
              The dates
            </h3>
            <p className="ny-memorial-step-intro">
              The years appear on the card; the age is worked out for you.
            </p>
            <div className="ny-memorial-two-up">
              <Field label="Born" required>
                <input
                  type="date"
                  className="ny-input"
                  value={draft.born}
                  onChange={(event) => patch({ born: event.target.value })}
                />
              </Field>
              <Field label="Died" required>
                <input
                  type="date"
                  className="ny-input"
                  value={draft.died}
                  onChange={(event) => patch({ died: event.target.value })}
                />
              </Field>
            </div>
            <p className="ny-memorial-age">
              {age !== null ? (
                <>
                  <b className="ny-num">{age}</b> years old
                </>
              ) : (
                "Both dates are needed to work out the age."
              )}
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="ny-memorial-step-body">
            <h3>
              <FileText size={16} aria-hidden />
              The notice
            </h3>
            <p className="ny-memorial-step-intro">
              Write it as you would say it. The family statement carries the
              feeling; the notice carries the facts.
            </p>
            <Field label="Notice" required hint="Shown at the top of the card and in the drawer.">
              <textarea
                className="ny-input ny-textarea"
                rows={6}
                value={draft.notice}
                placeholder="Our family patriarch …"
                onChange={(event) => patch({ notice: event.target.value })}
              />
            </Field>
            <Field label="Family statement" hint="One paragraph, in the family's own voice.">
              <textarea
                className="ny-input ny-textarea"
                rows={3}
                value={draft.statement}
                placeholder="A quiet man with a loud laugh…"
                onChange={(event) => patch({ statement: event.target.value })}
              />
            </Field>
            {touched && draft.notice.trim().length <= 20 && (
              <p className="ny-memorial-error">
                <AlertTriangle size={13} aria-hidden />
                The notice needs at least a sentence or two.
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="ny-memorial-step-body">
            <h3>
              <MapPin size={16} aria-hidden />
              Funeral details
            </h3>
            <p className="ny-memorial-step-intro">
              These are shown on the funeral tab with a small map. You can
              leave them empty and add them later.
            </p>
            <div className="ny-memorial-two-up">
              <Field label="Date">
                <input
                  type="date"
                  className="ny-input"
                  value={draft.funeralDate}
                  onChange={(event) => patch({ funeralDate: event.target.value })}
                />
              </Field>
              <Field label="Time (EAT)">
                <input
                  type="time"
                  className="ny-input"
                  value={draft.funeralTime}
                  onChange={(event) => patch({ funeralTime: event.target.value })}
                />
              </Field>
            </div>
            <Field label="Venue">
              <input
                className="ny-input"
                value={draft.venue}
                placeholder="e.g. Kimilili Family Compound"
                onChange={(event) => patch({ venue: event.target.value })}
              />
            </Field>
            <Field label="Town">
              <input
                className="ny-input"
                value={draft.town}
                placeholder="e.g. Kimilili"
                onChange={(event) => patch({ town: event.target.value })}
              />
            </Field>
            <Field label="Burial place">
              <input
                className="ny-input"
                value={draft.burial}
                placeholder="e.g. Family homestead, Kimilili"
                onChange={(event) => patch({ burial: event.target.value })}
              />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="ny-memorial-step-body">
            <h3>
              <HandCoins size={16} aria-hidden />
              Contribution hook
            </h3>
            <p className="ny-memorial-step-intro">
              Link a cause so the family can contribute towards the funeral
              or a memorial fund.
            </p>
            <Field label="Existing cause" hint="Leave empty to create one after the notice is published.">
              <select
                className="ny-input"
                value={draft.causeId}
                onChange={(event) => patch({ causeId: event.target.value })}
              >
                <option value="">— No cause linked —</option>
                <option value="NY-CON-2026-0398">Mzee Victor · homestead & bursary fund</option>
                <option value="NY-CON-2026-0397">Mzee Esther · market bursary fund</option>
                <option value="NY-CON-2026-0396">Uncle Joseph · workshop bursary</option>
                <option value="NEW">Create a new memorial cause</option>
              </select>
            </Field>
            <p className="ny-memorial-simnote">
              <Flag size={13} aria-hidden />
              M-Pesa collection connects when the backend is wired — the
              cause itself is created locally.
            </p>
          </div>
        )}

        {step === 5 && (
          <div className="ny-memorial-step-body">
            <h3>
              <Eye size={16} aria-hidden />
              Who sees this notice
            </h3>
            <p className="ny-memorial-step-intro">
              The family can publish to everyone, to one branch, or keep it
              among the admins until the branch is ready.
            </p>
            <div className="ny-memorial-scope">
              {(
                [
                  {
                    id: "family" as const,
                    icon: Users,
                    label: "The whole family",
                    detail: "Every signed-in relative can read the notice.",
                  },
                  {
                    id: "branch" as const,
                    icon: Flag,
                    label: "One branch only",
                    detail: "Only the chosen branch sees it first.",
                  },
                  {
                    id: "admins" as const,
                    icon: Lock,
                    label: "Admins only for now",
                    detail: "A private draft until the branch approves.",
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={cn(
                    "ny-memorial-scope-card",
                    draft.scope === option.id && "is-active",
                  )}
                  aria-pressed={draft.scope === option.id}
                  onClick={() => patch({ scope: option.id })}
                >
                  <option.icon size={17} aria-hidden />
                  <span>
                    <b>{option.label}</b>
                    <small>{option.detail}</small>
                  </span>
                  {draft.scope === option.id && (
                    <Check size={15} aria-hidden className="ny-memorial-check" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="ny-memorial-step-body">
            <h3>
              <ShieldCheck size={16} aria-hidden />
              Confirm with a reason
            </h3>
            <p className="ny-memorial-step-intro">
              This reason is written into the audit trail and cannot be
              edited later.
            </p>
            <div className="ny-memorial-review">
              <div>
                <span>Name</span>
                <b>{draft.name || "—"}</b>
              </div>
              <div>
                <span>Dates</span>
                <b className="ny-num">
                  {draft.born || "—"} → {draft.died || "—"}
                  {age !== null ? ` · ${age} years` : ""}
                </b>
              </div>
              <div>
                <span>Branch</span>
                <b>
                  {BRANCHES.find((b) => b.id === draft.branchId)?.name ?? "—"}
                </b>
              </div>
              <div>
                <span>Scope</span>
                <b className="capitalize">{draft.scope}</b>
              </div>
              <div>
                <span>Funeral</span>
                <b>
                  {draft.funeralDate || "Not set"} · {draft.venue || "No venue"}
                </b>
              </div>
            </div>
            <Field
              label="Reason for the record"
              required
              hint="e.g. The family confirmed the wording at the branch meeting on 6 May."
            >
              <textarea
                className="ny-input ny-textarea"
                rows={3}
                value={draft.reason}
                placeholder="Why is this notice being published now?"
                onChange={(event) => patch({ reason: event.target.value })}
              />
            </Field>
            {touched && draft.reason.trim().length <= 8 && (
              <p className="ny-memorial-error">
                <AlertTriangle size={13} aria-hidden />
                A short reason is required before publishing.
              </p>
            )}
          </div>
        )}

        {step === 7 && (
          <div className="ny-memorial-step-body">
            <h3>
              <ScrollText size={16} aria-hidden />
              What will be recorded
            </h3>
            <p className="ny-memorial-step-intro">
              The audit trail keeps every change to a notice, forever, for
              the family head.
            </p>
            <ul className="ny-memorial-audit-preview">
              {[
                `Notice published for ${draft.name || "the departed"}`,
                `Scope set to ${draft.scope}`,
                draft.causeId
                  ? `Contribution cause ${draft.causeId} linked`
                  : "No contribution cause linked",
                `Reason recorded: “${draft.reason || "—"}”`,
                "Every future edit, unpublish and export is appended to this record",
              ].map((line) => (
                <li key={line}>
                  <Check size={13} aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            <p className="ny-memorial-simnote">
              <Flag size={13} aria-hidden />
              Publishing writes to this browser only. It connects when the
              backend is wired — the notice is never claimed as sent.
            </p>
          </div>
        )}
      </div>
    </ModalDialog>
  );
}
