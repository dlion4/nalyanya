"use client";

import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { StatusChip } from "@/components/ui/Primitives";
import { SHORTCUTS } from "@/data/dashboard/lineage";
import { LAYOUT } from "@/lib/family/graph";
import type { AuditEntry, Branch, Member } from "@/types/family";

export type ActionKind = "add-child" | "add-spouse" | "mark-deceased" | "edit" | "invite" | "branch";
export const ACTION_KINDS: ActionKind[] = ["add-child", "add-spouse", "mark-deceased", "edit", "invite", "branch"];

const TITLES: Record<ActionKind, string> = {
  "add-child": "Add a child",
  "add-spouse": "Add a spouse",
  "mark-deceased": "Record a passing",
  edit: "Edit a profile",
  invite: "Invite a relative",
  branch: "Create a new branch",
};

const DESCRIPTIONS: Record<ActionKind, string> = {
  "add-child": "Admins add a child straight into the tree. The change is applied and logged.",
  "add-spouse": "Link a spouse. The marriage is recorded in the audit trail.",
  "mark-deceased": "Adds a memorial halo to the node and records the date with a reason.",
  edit: "Admin edits apply at once and keep the before and after values.",
  invite: "Sends a private invitation. The person joins only after they accept (SIMULATED).",
  branch: "Opens a new branch with a founder and colour. It appears in the branches overview.",
};

const COUNTIES = ["Bungoma", "Nairobi", "Kakamega", "Trans-Nzoia", "Kisumu", "Mombasa", "Nyeri", "Uasin Gishu", "Nakuru", "Kiambu", "London (UK)"];
const COLOURS = ["#4FAE86", "#E0764A", "#6FA8DC", "#A284DC", "#D4A437", "#4FC1B0"];
const ADMIN = "Brian Otieno Nalyanya · Family Head";

type Values = Record<string, string>;

function initialValues(kind: ActionKind, member: Member | null, members: Member[]): Values {
  switch (kind) {
    case "add-child":
      return { name: "", gender: "female", year: "2024" };
    case "add-spouse":
      return { name: "", year: "", homeTown: "" };
    case "mark-deceased":
      return { year: "2026", cause: "", reason: "" };
    case "edit":
      return { field: "Phone", value: "", reason: "" };
    case "invite":
      return { name: "", contact: "", relation: "Son" };
    case "branch":
      return { name: "", county: "Bungoma", founder: member?.id ?? members[0]?.id ?? LAYOUT.root, tagline: "", colour: COLOURS[0] };
  }
}

function validate(kind: ActionKind, v: Values): Record<string, string> {
  const errors: Record<string, string> = {};
  const yearBetween = (key: string, min: number, max: number) => {
    const n = Number(v[key]);
    if (!v[key] || Number.isNaN(n) || n < min || n > max) errors[key] = `Enter a year between ${min} and ${max}.`;
  };
  const required = (key: string, label: string, min = 2) => {
    if ((v[key] ?? "").trim().length < min) errors[key] = `${label} is required.`;
  };
  switch (kind) {
    case "add-child":
      required("name", "Name");
      yearBetween("year", 1950, 2026);
      break;
    case "add-spouse":
      required("name", "Name");
      if (v.year) yearBetween("year", 1930, 2026);
      break;
    case "mark-deceased":
      yearBetween("year", 1900, 2026);
      required("reason", "A reason", 10);
      break;
    case "edit":
      required("value", "The new value");
      required("reason", "A reason", 10);
      break;
    case "invite":
      required("name", "Name");
      if (!/^(\+?\d[\d ]{7,14}|[^@\s]+@[^@\s]+\.[^@\s]+)$/.test((v.contact ?? "").trim())) errors.contact = "Enter a phone number or an email.";
      break;
    case "branch":
      required("name", "Branch name", 4);
      break;
  }
  return errors;
}

function eatStamp(date: Date): string {
  const t = new Date(date.getTime() + 3 * 60 * 60 * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${t.getUTCFullYear()}-${p(t.getUTCMonth() + 1)}-${p(t.getUTCDate())} ${p(t.getUTCHours())}:${p(t.getUTCMinutes())} EAT`;
}

function buildEntry(
  kind: ActionKind,
  v: Values,
  member: Member | null,
  members: Member[],
  auditNo: number,
): { entry: AuditEntry; branch?: Branch } {
  const who = member ? `${member.preferredName} ${member.lastName}` : "the family";
  const entity = member?.id ?? LAYOUT.root;
  const base = {
    id: `NY-AUD-2026-${String(auditNo).padStart(4, "0")}`,
    at: eatStamp(new Date()),
    actor: ADMIN,
    entity,
    before: "—",
    after: "—",
    reason: v.reason?.trim() || "Admin change",
  };
  switch (kind) {
    case "add-child":
      return {
        entry: {
          ...base,
          action: "member.added",
          summary: `Added ${v.name.trim()} as a child of ${who}`,
          after: `Gen ${(member?.generation ?? 1) + 1} · born ${v.year}`,
          reason: "Birth recorded by the Family Head",
          status: "applied",
        },
      };
    case "add-spouse":
      return {
        entry: {
          ...base,
          action: "relation.added",
          summary: `Linked ${v.name.trim()} as spouse of ${who}`,
          after: `Spouse · ${v.homeTown?.trim() || "home not set"}`,
          reason: "Marriage recorded by the Family Head",
          status: "applied",
        },
      };
    case "mark-deceased":
      return {
        entry: {
          ...base,
          action: "member.deceased",
          summary: `Recorded ${who} as passed in ${v.year}`,
          before: "Living",
          after: `Deceased ${v.year}`,
          status: "applied",
        },
      };
    case "edit":
      return {
        entry: {
          ...base,
          action: "member.edited",
          summary: `Updated ${v.field.toLowerCase()} for ${who}`,
          before: "Previous value",
          after: v.value.trim(),
          status: "applied",
        },
      };
    case "invite":
      return {
        entry: {
          ...base,
          action: "member.added",
          entity: v.contact.trim(),
          summary: `Invitation sent to ${v.name.trim()} (${v.relation})`,
          before: "Not on the tree",
          after: "Invited · awaiting acceptance",
          reason: "Consent required before joining",
          status: "pending",
        },
      };
    case "branch": {
      const founder = members.find((m) => m.id === v.founder);
      const branch: Branch = {
        id: `branch-${auditNo}`,
        name: v.name.trim(),
        shortName: v.name.trim().split(" ")[0] ?? "New",
        county: v.county || "Bungoma",
        founderId: v.founder,
        color: v.colour || COLOURS[0],
        tagline: v.tagline?.trim() || "A new branch of the family",
      };
      return {
        entry: {
          ...base,
          action: "branch.created",
          entity: branch.id,
          summary: `Opened the ${branch.name} branch`,
          after: `Founder: ${founder?.preferredName ?? v.founder}`,
          status: "applied",
        },
        branch,
      };
    }
  }
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-text-primary">
        {label}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}

interface ActionDialogProps {
  kind: ActionKind | null;
  member: Member | null;
  members: Member[];
  nextAuditNo: number;
  onClose: () => void;
  onSubmit: (entry: AuditEntry, extra?: { branch?: Branch }) => void;
}

/** Overlay wizard for admin tree edits. Keyed by the parent so each open starts clean. */
export function ActionDialog({ kind, member, members, nextAuditNo, onClose, onSubmit }: ActionDialogProps) {
  const [values, setValues] = useState<Values>(() => (kind ? initialValues(kind, member, members) : {}));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!kind) return;
    const found = validate(kind, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const built = buildEntry(kind, values, member, members, nextAuditNo);
    onSubmit(built.entry, built.branch ? { branch: built.branch } : undefined);
  };

  const inputClass = "ny-input";
  const footer = kind ? (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="max-w-sm text-xs leading-relaxed text-text-tertiary">
        Saves to the local tree and the audit trail. Connects to the backend when it is wired (SIMULATED).
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={onClose} className="ny-btn ny-btn-ghost ny-btn-sm">
          Cancel
        </button>
        <button type="submit" form="lineage-action-form" className="ny-btn ny-btn-primary ny-btn-sm">
          {kind === "invite" ? "Send invitation" : kind === "branch" ? "Create branch" : "Save change"}
        </button>
      </div>
    </div>
  ) : undefined;

  return (
    <ModalDialog
      open={kind !== null}
      onClose={onClose}
      title={kind ? TITLES[kind] : "Edit"}
      description={kind ? `${DESCRIPTIONS[kind]}${member && kind !== "branch" ? ` Context: ${member.preferredName} ${member.lastName}.` : ""}` : undefined}
      footer={footer}
    >
      {kind && (
        <form id="lineage-action-form" onSubmit={submit} noValidate className="space-y-5">
          {kind === "add-child" && (
            <>
              <Field id="af-name" label="Child's full name" error={errors.name}>
                <input id="af-name" className={inputClass} value={values.name ?? ""} onChange={set("name")} placeholder="e.g. Amina Wekesa Nalyanya" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="af-gender" label="Gender">
                  <select id="af-gender" className={inputClass} value={values.gender} onChange={set("gender")}>
                    <option value="female">Girl</option>
                    <option value="male">Boy</option>
                  </select>
                </Field>
                <Field id="af-year" label="Year of birth" error={errors.year}>
                  <input id="af-year" type="number" inputMode="numeric" className={inputClass} value={values.year ?? ""} onChange={set("year")} />
                </Field>
              </div>
            </>
          )}

          {kind === "add-spouse" && (
            <>
              <Field id="as-name" label="Spouse's full name" error={errors.name}>
                <input id="as-name" className={inputClass} value={values.name ?? ""} onChange={set("name")} placeholder="Full name" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="as-year" label="Year of birth (optional)" error={errors.year}>
                  <input id="as-year" type="number" inputMode="numeric" className={inputClass} value={values.year ?? ""} onChange={set("year")} />
                </Field>
                <Field id="as-home" label="Home town">
                  <input id="as-home" className={inputClass} value={values.homeTown ?? ""} onChange={set("homeTown")} />
                </Field>
              </div>
            </>
          )}

          {kind === "mark-deceased" && (
            <>
              <Field id="md-year" label="Year of passing" error={errors.year}>
                <input id="md-year" type="number" inputMode="numeric" className={inputClass} value={values.year ?? ""} onChange={set("year")} />
              </Field>
              <Field id="md-cause" label="Cause (optional, private)">
                <input id="md-cause" className={inputClass} value={values.cause ?? ""} onChange={set("cause")} />
              </Field>
              <Field id="md-reason" label="Reason for the record" error={errors.reason}>
                <textarea id="md-reason" rows={3} className={inputClass} value={values.reason ?? ""} onChange={set("reason")} placeholder="e.g. Confirmed by the family council" />
              </Field>
            </>
          )}

          {kind === "edit" && (
            <>
              <Field id="ed-field" label="What changes">
                <select id="ed-field" className={inputClass} value={values.field} onChange={set("field")}>
                  <option>Phone</option>
                  <option>Home town</option>
                  <option>Profession</option>
                  <option>Bio</option>
                </select>
              </Field>
              <Field id="ed-value" label="New value" error={errors.value}>
                <input id="ed-value" className={inputClass} value={values.value ?? ""} onChange={set("value")} />
              </Field>
              <Field id="ed-reason" label="Reason" error={errors.reason}>
                <textarea id="ed-reason" rows={3} className={inputClass} value={values.reason ?? ""} onChange={set("reason")} />
              </Field>
            </>
          )}

          {kind === "invite" && (
            <>
              <Field id="iv-name" label="Relative's name" error={errors.name}>
                <input id="iv-name" className={inputClass} value={values.name ?? ""} onChange={set("name")} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="iv-contact" label="Phone or email" error={errors.contact}>
                  <input id="iv-contact" className={inputClass} value={values.contact ?? ""} onChange={set("contact")} placeholder="+2547… or name@mail" />
                </Field>
                <Field id="iv-relation" label="Relation">
                  <select id="iv-relation" className={inputClass} value={values.relation} onChange={set("relation")}>
                    <option>Son</option>
                    <option>Daughter</option>
                    <option>Spouse</option>
                    <option>Cousin</option>
                    <option>Other</option>
                  </select>
                </Field>
              </div>
            </>
          )}

          {kind === "branch" && (
            <>
              <Field id="br-name" label="Branch name" error={errors.name}>
                <input id="br-name" className={inputClass} value={values.name ?? ""} onChange={set("name")} placeholder="e.g. Machakos · Mutua" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="br-county" label="County">
                  <select id="br-county" className={inputClass} value={values.county} onChange={set("county")}>
                    {COUNTIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field id="br-founder" label="Founder">
                  <select id="br-founder" className={inputClass} value={values.founder} onChange={set("founder")}>
                    {members.slice(0, 60).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.preferredName} {m.lastName} · Gen {m.generation}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field id="br-tagline" label="Tagline (optional)">
                <input id="br-tagline" className={inputClass} value={values.tagline ?? ""} onChange={set("tagline")} />
              </Field>
              <fieldset>
                <legend className="mb-1.5 text-sm font-semibold text-text-primary">Branch colour</legend>
                <div className="flex flex-wrap gap-2">
                  {COLOURS.map((c) => (
                    <label key={c} className="cursor-pointer">
                      <input type="radio" name="br-colour" value={c} checked={values.colour === c} onChange={set("colour")} className="peer sr-only" />
                      <span className="block size-9 rounded-full border-2 border-white shadow ring-1 ring-hairline peer-checked:ring-2 peer-checked:ring-brand-primary peer-focus-visible:ring-2" style={{ background: c }} />
                    </label>
                  ))}
                </div>
              </fieldset>
            </>
          )}
        </form>
      )}
    </ModalDialog>
  );
}

export function ShortcutsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalDialog open={open} onClose={onClose} title="Keyboard shortcuts" description="Click the tree first so it has focus, then use these keys.">
      <ul className="divide-y divide-hairline">
        {SHORTCUTS.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-4 py-3">
            <span className="text-sm text-text-secondary">{s.label}</span>
            <span className="flex shrink-0 gap-1.5">
              {s.keys.map((k) => (
                <kbd key={k} className="ny-kbd">
                  {k}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </ModalDialog>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl bg-surface-0/70 p-4">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">{label}</dt>
      <dd className="mt-1.5 break-words text-sm font-semibold text-text-primary">{value}</dd>
    </div>
  );
}

export function AuditDialog({ entry, onClose, onApprove }: { entry: AuditEntry | null; onClose: () => void; onApprove: (id: string) => void }) {
  return (
    <ModalDialog
      open={entry !== null}
      onClose={onClose}
      wide
      title={entry ? entry.summary : "Audit entry"}
      description={entry ? `${entry.id} · ${entry.at}` : undefined}
      footer={
        entry?.status === "pending" ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-secondary">Approving applies the change to the tree (SIMULATED).</p>
            <button type="button" onClick={() => onApprove(entry.id)} className="ny-btn ny-btn-primary ny-btn-sm">
              Approve change
            </button>
          </div>
        ) : undefined
      }
    >
      {entry && (
        <div className="space-y-5">
          <dl className="grid gap-3 sm:grid-cols-2">
            <Info label="Actor" value={entry.actor} />
            <Info label="Action" value={entry.action} />
            <Info label="Entity" value={entry.entity} />
            <Info label="Status" value={<StatusChip status={entry.status} />} />
          </dl>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-hairline p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Before</p>
              <p className="mt-2 break-words font-mono text-sm text-text-secondary">{entry.before}</p>
            </div>
            <div className="rounded-2xl border border-brand-accent/50 bg-brand-accent-soft/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-secondary">After</p>
              <p className="mt-2 break-words font-mono text-sm text-text-primary">{entry.after}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-surface-0/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Reason</p>
            <p className="mt-1.5 text-sm text-text-primary">{entry.reason}</p>
          </div>
        </div>
      )}
    </ModalDialog>
  );
}
