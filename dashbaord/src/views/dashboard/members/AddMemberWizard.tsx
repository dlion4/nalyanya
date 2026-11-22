"use client";

import { ArrowLeft, ArrowRight, Check, CircleCheck, Sparkles, UserPlus } from "lucide-react";
import { useState } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { SimulatedBadge } from "@/components/ui/Primitives";
import { BRANCHES } from "@/data/family/branches";
import { FAMILY_ROLES, type FamilyRole } from "@/data/dashboard/members";
import { cn, DATA_YEAR, kes } from "@/lib/format";
import type { Channel, Gender, Member } from "@/types/family";

const STEPS = [
  { id: 1, title: "Identity", hint: "Name, birth year & gender" },
  { id: 2, title: "Placement", hint: "Branch, generation & home" },
  { id: 3, title: "Relations", hint: "Parent, spouse or guardian" },
  { id: 4, title: "Finance opt-in", hint: "Sacco shares & channels" },
  { id: 5, title: "Review & finish", hint: "Confirm & add to directory" },
] as const;

const COUNTIES = [
  "Bungoma",
  "Nairobi",
  "Kakamega",
  "Trans-Nzoia",
  "Kisumu",
  "Mombasa",
  "Nyeri",
  "Uasin Gishu",
  "Nakuru",
  "Kiambu",
  "Nandi",
  "Siaya",
  "London (UK)",
];

interface WizardForm {
  firstName: string;
  middleName: string;
  lastName: string;
  preferredName: string;
  gender: Gender;
  birthYear: string;
  branchId: string;
  generation: string;
  homeTown: string;
  county: string;
  profession: string;
  parentId: string;
  roleLabel: string;
  accessRole: FamilyRole;
  adopted: boolean;
  phone: string;
  email: string;
  preferredChannel: Channel;
  optSacco: boolean;
  initialShares: string;
  optChama: boolean;
  bio: string;
}

const DEFAULT_FORM: WizardForm = {
  firstName: "",
  middleName: "",
  lastName: "Nalyanya",
  preferredName: "",
  gender: "female",
  birthYear: "1999",
  branchId: "kimilili-joseph",
  generation: "3",
  homeTown: "Kimilili",
  county: "Bungoma",
  profession: "Civil engineer",
  parentId: "NY-MBR-00003",
  roleLabel: "Granddaughter",
  accessRole: "Member",
  adopted: false,
  phone: "+254712",
  email: "",
  preferredChannel: "WhatsApp",
  optSacco: true,
  initialShares: "10",
  optChama: true,
  bio: "",
};

interface Props {
  open: boolean;
  members: Member[];
  nextIdNumber: number;
  onClose: () => void;
  onCreate: (member: Member, accessRole: FamilyRole) => void;
}

/** S5 — 5-Step Add Member Wizard (Identity · Placement · Relations · Finance opt-in · Finish). */
export function AddMemberWizard({ open, members, nextIdNumber, onClose, onCreate }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<WizardForm>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);

  const patch = <K extends keyof WizardForm>(key: K, value: WizardForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const next = () => {
    if (step === 1) {
      if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2) {
        setError("Enter both a first name and a family name to continue.");
        return;
      }
      const yr = Number(form.birthYear);
      if (Number.isNaN(yr) || yr < 1920 || yr > DATA_YEAR) {
        setError(`Enter a valid birth year between 1920 and ${DATA_YEAR}.`);
        return;
      }
    }
    if (step === 2 && form.homeTown.trim().length < 2) {
      setError("Enter a home town so relatives know where to find them.");
      return;
    }
    setError(null);
    setStep((s) => Math.min(5, s + 1));
  };

  const finish = () => {
    const birthYear = Number(form.birthYear) || 1999;
    const isMinor = DATA_YEAR - birthYear < 18;
    const shares = form.optSacco ? Math.max(0, Number(form.initialShares) || 0) : 0;
    const id = `NY-MBR-${String(nextIdNumber).padStart(5, "0")}`;
    const preferred = form.preferredName.trim() || form.firstName.trim();

    const created: Member = {
      id,
      firstName: form.firstName.trim(),
      middleName: form.middleName.trim() || undefined,
      lastName: form.lastName.trim(),
      preferredName: preferred,
      gender: form.gender,
      generation: Number(form.generation) || 3,
      birthYear,
      branchId: form.branchId,
      parentId: form.parentId === "none" ? null : form.parentId,
      spouseId: null,
      role: form.roleLabel.trim() || "Family member",
      adopted: form.adopted || undefined,
      ward: isMinor || form.accessRole === "Ward / Minor" || undefined,
      homeTown: form.homeTown.trim(),
      county: form.county,
      profession: form.profession.trim() || (isMinor ? "Student" : "Family member"),
      phone: form.phone.trim().length >= 9 ? form.phone.trim() : undefined,
      email: form.email.trim() || undefined,
      whatsapp: form.preferredChannel === "WhatsApp",
      preferredChannel: form.preferredChannel,
      bio:
        form.bio.trim() ||
        `${preferred} joined the Nalyanya family directory from ${form.homeTown.trim()}, ${form.county}.`,
      walletKes: shares * 1250,
      saccoShares: shares,
      activeLoans: 0,
      contributionsKes: 0,
      lifeEvents: [
        { year: birthYear, label: `Born in ${form.homeTown.trim()}` },
        { year: DATA_YEAR, label: "Added to the Nalyanya family directory" },
      ],
    };

    onCreate(created, isMinor ? "Ward / Minor" : form.accessRole);
    setStep(1);
    setForm(DEFAULT_FORM);
  };

  const parentMatch = members.find((m) => m.id === form.parentId);
  const branchMatch = BRANCHES.find((b) => b.id === form.branchId);

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Add a new family member"
      description="Five quick steps: place a newborn, spouse, cousin or diaspora relative into the family directory and 3D tree."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-tertiary">Step {step} of 5</span>
            <SimulatedBadge label="Local store · SIMULATED" />
          </div>
          <div className="flex gap-2">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="ny-btn ny-btn-ghost ny-btn-sm">
                <ArrowLeft className="size-4" aria-hidden />
                Back
              </button>
            ) : (
              <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
                Cancel
              </button>
            )}
            {step < 5 ? (
              <button type="button" onClick={next} className="ny-btn ny-btn-primary ny-btn-sm">
                Continue
                <ArrowRight className="size-4" aria-hidden />
              </button>
            ) : (
              <button type="button" onClick={finish} className="ny-btn ny-btn-gold ny-btn-sm">
                <CircleCheck className="size-4" aria-hidden />
                Add to Nalyanya directory
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Stepper Header */}
        <ol className="grid grid-cols-5 gap-2" aria-label="Wizard steps">
          {STEPS.map((s) => {
            const done = step > s.id;
            const current = step === s.id;
            return (
              <li
                key={s.id}
                className={cn(
                  "rounded-2xl border p-2.5 text-center transition",
                  current
                    ? "border-brand-primary bg-brand-primary text-white"
                    : done
                      ? "border-brand-accent/60 bg-brand-accent-soft/50 text-text-primary"
                      : "border-hairline bg-surface-0/70 text-text-tertiary",
                )}
              >
                <span className="mx-auto grid size-6 place-items-center rounded-full bg-white/20 text-xs font-bold">
                  {done ? <Check className="size-3.5" /> : s.id}
                </span>
                <p className="mt-1 truncate text-[11px] font-semibold">{s.title}</p>
              </li>
            );
          })}
        </ol>

        {error && (
          <div role="alert" className="rounded-2xl border border-danger/40 bg-[#fbe5e5] px-4 py-3 text-sm font-medium text-danger">
            {error}
          </div>
        )}

        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">First name *</span>
              <input
                className="ny-input"
                value={form.firstName}
                onChange={(e) => patch("firstName", e.target.value)}
                placeholder="e.g. Amina"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Middle name</span>
              <input
                className="ny-input"
                value={form.middleName}
                onChange={(e) => patch("middleName", e.target.value)}
                placeholder="e.g. Wekesa"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Family / last name *</span>
              <input
                className="ny-input"
                value={form.lastName}
                onChange={(e) => patch("lastName", e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Preferred name</span>
              <input
                className="ny-input"
                value={form.preferredName}
                onChange={(e) => patch("preferredName", e.target.value)}
                placeholder="What family calls them"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Gender</span>
              <select
                className="ny-input"
                value={form.gender}
                onChange={(e) => patch("gender", e.target.value as Gender)}
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Birth year *</span>
              <input
                type="number"
                inputMode="numeric"
                className="ny-input"
                value={form.birthYear}
                onChange={(e) => patch("birthYear", e.target.value)}
              />
            </label>
          </div>
        )}

        {/* Step 2: Family Placement */}
        {step === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Primary branch</span>
              <select
                className="ny-input"
                value={form.branchId}
                onChange={(e) => patch("branchId", e.target.value)}
              >
                {BRANCHES.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.county})
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Generation</span>
              <select
                className="ny-input"
                value={form.generation}
                onChange={(e) => patch("generation", e.target.value)}
              >
                {[1, 2, 3, 4, 5].map((g) => (
                  <option key={g} value={String(g)}>
                    Generation {g}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Home town *</span>
              <input
                className="ny-input"
                value={form.homeTown}
                onChange={(e) => patch("homeTown", e.target.value)}
                placeholder="e.g. Kimilili, Webuye, Kasarani"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">County / Diaspora</span>
              <select className="ny-input" value={form.county} onChange={(e) => patch("county", e.target.value)}>
                {COUNTIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-sm font-semibold">Profession or school stage</span>
              <input
                className="ny-input"
                value={form.profession}
                onChange={(e) => patch("profession", e.target.value)}
                placeholder="e.g. Registered nurse, University student, Farmer"
              />
            </label>
          </div>
        )}

        {/* Step 3: Relations Seed */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Parent in the tree</span>
                <select
                  className="ny-input"
                  value={form.parentId}
                  onChange={(e) => patch("parentId", e.target.value)}
                >
                  <option value="none">No parent link (spouse / in-law)</option>
                  {members.slice(0, 40).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.preferredName} {m.lastName} · Gen {m.generation}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Lineage label</span>
                <input
                  className="ny-input"
                  value={form.roleLabel}
                  onChange={(e) => patch("roleLabel", e.target.value)}
                  placeholder="e.g. Granddaughter, Son, Spouse"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Platform access role (RBAC)</span>
              <select
                className="ny-input"
                value={form.accessRole}
                onChange={(e) => patch("accessRole", e.target.value as FamilyRole)}
              >
                {FAMILY_ROLES.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.role} — {r.scope}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-hairline bg-surface-0/70 p-4">
              <input
                type="checkbox"
                checked={form.adopted}
                onChange={(e) => patch("adopted", e.target.checked)}
                className="size-4 accent-brand-primary"
              />
              <span className="text-sm">
                <strong className="block text-text-primary">Adopted or ward placement</strong>
                <span className="text-xs text-text-secondary">
                  Draws the dashed violet ring on the 3D tree and tracks guardianship.
                </span>
              </span>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Short bio (optional)</span>
              <textarea
                rows={2}
                className="ny-input"
                value={form.bio}
                onChange={(e) => patch("bio", e.target.value)}
                placeholder="A warm sentence relatives will recognise…"
              />
            </label>
          </div>
        )}

        {/* Step 4: Finance & Channels Opt-in */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Mobile number (+254)</span>
                <input
                  className="ny-input font-mono"
                  value={form.phone}
                  onChange={(e) => patch("phone", e.target.value)}
                  placeholder="+254712345678"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Preferred broadcast channel</span>
                <select
                  className="ny-input"
                  value={form.preferredChannel}
                  onChange={(e) => patch("preferredChannel", e.target.value as Channel)}
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="SMS">SMS (basic phone friendly)</option>
                  <option value="Email">Email</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-hairline bg-surface-0/75 p-4">
                <input
                  type="checkbox"
                  checked={form.optSacco}
                  onChange={(e) => patch("optSacco", e.target.checked)}
                  className="mt-1 size-4 accent-brand-primary"
                />
                <span className="text-sm">
                  <strong className="block text-text-primary">Enrol in Nalyanya Sacco</strong>
                  <span className="text-xs text-text-secondary">Shares unlock 3× family loans at KES 1,250 per share.</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-hairline bg-surface-0/75 p-4">
                <input
                  type="checkbox"
                  checked={form.optChama}
                  onChange={(e) => patch("optChama", e.target.checked)}
                  className="mt-1 size-4 accent-brand-primary"
                />
                <span className="text-sm">
                  <strong className="block text-text-primary">Join branch chama</strong>
                  <span className="text-xs text-text-secondary">Adds member to the branch merry-go-round waiting list.</span>
                </span>
              </label>
            </div>

            {form.optSacco && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Opening Sacco shares (unit KES 1,250)</span>
                <input
                  type="number"
                  min={0}
                  max={500}
                  className="ny-input"
                  value={form.initialShares}
                  onChange={(e) => patch("initialShares", e.target.value)}
                />
                <p className="mt-1.5 text-xs text-text-tertiary">
                  Opening share value: {kes((Number(form.initialShares) || 0) * 1250)} · M-Pesa STK collection is SIMULATED.
                </p>
              </label>
            )}
          </div>
        )}

        {/* Step 5: Review & Finish */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="rounded-3xl border border-brand-accent/50 bg-brand-accent-soft/35 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand-secondary">
                <Sparkles className="size-4" aria-hidden />
                Ready to place on the Nalyanya tree
              </div>
              <h3 className="ny-title mt-2 text-2xl">
                {form.firstName} {form.middleName} {form.lastName}
              </h3>
              <p className="mt-1 text-sm text-text-secondary">
                ID NY-MBR-{String(nextIdNumber).padStart(5, "0")} · Gen {form.generation} · {branchMatch?.name}
              </p>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface-0/80 p-3.5 text-sm">
                <dt className="text-xs text-text-tertiary">Home & county</dt>
                <dd className="mt-0.5 font-semibold">{form.homeTown}, {form.county}</dd>
              </div>
              <div className="rounded-2xl bg-surface-0/80 p-3.5 text-sm">
                <dt className="text-xs text-text-tertiary">Parent link</dt>
                <dd className="mt-0.5 font-semibold">
                  {parentMatch ? `${parentMatch.preferredName} ${parentMatch.lastName}` : "No parent link"}
                </dd>
              </div>
              <div className="rounded-2xl bg-surface-0/80 p-3.5 text-sm">
                <dt className="text-xs text-text-tertiary">Access role</dt>
                <dd className="mt-0.5 font-semibold">{form.accessRole}</dd>
              </div>
              <div className="rounded-2xl bg-surface-0/80 p-3.5 text-sm">
                <dt className="text-xs text-text-tertiary">Sacco & channel</dt>
                <dd className="mt-0.5 font-semibold">
                  {form.optSacco ? `${form.initialShares} shares` : "No shares"} · {form.preferredChannel}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </ModalDialog>
  );
}

/** Inline S5 Launchpad Banner inside the page flow. */
export function AddMemberLaunchpad({ canAdmin, onOpenWizard, onOpenRequest }: { canAdmin: boolean; onOpenWizard: () => void; onOpenRequest: () => void }) {
  return (
    <section
      id="add-member"
      className="ny-card scroll-mt-24 grid gap-6 overflow-hidden p-6 sm:p-8 lg:grid-cols-[1.35fr_1fr] lg:items-center"
    >
      <div>
        <p className="ny-eyebrow">S5 · Add member wizard</p>
        <h2 className="ny-title mt-2 text-3xl sm:text-4xl">Welcome someone new into the directory</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">
          Our 5-step stepper mirrors onboarding (A-3): capture identity, place them in one of the twelve branches, link parents or guardians,
          opt them into the Sacco, and light up their row immediately with an audit record.
        </p>
        <ol className="mt-5 flex flex-wrap gap-2">
          {STEPS.map((s) => (
            <li key={s.id} className="ny-chip">
              <span className="font-mono text-[10px] font-bold text-brand-primary">0{s.id}</span>
              {s.title}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col">
        {canAdmin ? (
          <button type="button" onClick={onOpenWizard} className="ny-btn ny-btn-primary">
            <UserPlus className="size-4" aria-hidden />
            Launch 5-step add member wizard
          </button>
        ) : (
          <p className="rounded-2xl bg-surface-0/80 p-3 text-xs text-text-secondary">
            Viewing as non-admin role: direct creation is hidden (RBAC). Suggest a relative below instead.
          </p>
        )}
        <button type="button" onClick={onOpenRequest} className="ny-btn ny-btn-gold">
          Suggest a relative or edit for approval
        </button>
      </div>
    </section>
  );
}
