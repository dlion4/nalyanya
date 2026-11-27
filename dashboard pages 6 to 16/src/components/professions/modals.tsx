"use client";

import { useState } from "react";
import { BadgeCheck, Check, Fingerprint, ImagePlus, Link2, ShieldCheck, Trash2, X } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import { kes } from "@/lib/format";
import {
  PORTFOLIO_LIBRARY,
  REACH_LABEL,
  UNIT_LABEL,
  maskPhone,
  quoteOf,
  type AuditEntry,
  type Category,
  type Endorsement,
  type Pro,
  type Reach,
  type Shot,
  type Ticket,
  type Unit,
  URGENCY_LABEL,
} from "@/data/dashboard/professions";

/* ------------------------------------------------------------------ */
/* M1 — Reveal a masked phone (small). Consent is required first.          */
/* ------------------------------------------------------------------ */
export function RevealModal({ pro, onConfirm, onClose }: { pro: Pro; onConfirm: () => void; onClose: () => void }) {
  const [consent, setConsent] = useState(false);
  return (
    <Modal
      open
      onClose={onClose}
      title="Show the phone number?"
      sub={`${pro.name} · ${maskPhone(pro.phone)}`}
      size="sm"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Not now
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!consent} onClick={onConfirm}>
            <Fingerprint className="h-3.5 w-3.5" /> Show the number
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-text-secondary">
        Contact details are only shown when you need them. Every reveal is written to the audit trail with your name.
      </p>
      <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5 text-sm">
        <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--color-brand-primary)]" checked={consent} onChange={() => setConsent((v) => !v)} />
        <span>I need to contact this person about a service, and I will not share the number outside the family.</span>
      </label>
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · no call or message is placed in Phase 1</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M2 — Endorse a professional (small). Goes to moderation.                */
/* ------------------------------------------------------------------ */
export function EndorseModal({ pro, by, onSubmit, onClose }: { pro: Pro; by: string; onSubmit: (note: string) => void; onClose: () => void }) {
  const [note, setNote] = useState("");
  const ok = note.trim().length >= 6;
  return (
    <Modal
      open
      onClose={onClose}
      title={`Endorse ${pro.name}`}
      sub={`As ${by} · endorsements are moderated before they show`}
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!ok} onClick={() => onSubmit(note.trim())}>
            <BadgeCheck className="h-3.5 w-3.5" /> Send endorsement
          </button>
        </>
      }
    >
      <label className="ny-label" htmlFor="en-note">Why do you recommend them?</label>
      <textarea id="en-note" className="ny-textarea" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Came on time, explained the cost, and finished the work." />
      <p className="ny-hud mt-1.5 text-right !text-[0.52rem]">{note.length}/160</p>
      <p className="ny-chip ny-chip-sim mt-2">Pending until an admin approves it · SIMULATED</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M3 — Write a review (medium). Stars plus a short note.                  */
/* ------------------------------------------------------------------ */
export function ReviewModal({ pro, by, onSubmit, onClose }: { pro: Pro; by: string; onSubmit: (stars: number, text: string) => void; onClose: () => void }) {
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const ok = text.trim().length >= 10;
  return (
    <Modal
      open
      onClose={onClose}
      title={`Review ${pro.name}`}
      sub={`${pro.role} · ${pro.town}`}
      size="md"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!ok} onClick={() => onSubmit(stars, text.trim())}>
            <Check className="h-3.5 w-3.5" /> Post review
          </button>
        </>
      }
    >
      <span className="ny-label">How did it go?</span>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={stars === n}
            onClick={() => setStars(n)}
            className={`ny-chip ny-touch transition ${stars === n ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral hover:-translate-y-0.5"}`}
          >
            {n} star{n === 1 ? "" : "s"}
          </button>
        ))}
      </div>
      <label className="ny-label mt-4" htmlFor="rv-text">What should other families know?</label>
      <textarea id="rv-text" className="ny-textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Be specific: what was done, how long it took, and whether you would ask again." />
      <p className="ny-hud mt-1.5 !text-[0.52rem]">Posted as {by}. Reviews are visible to the family, not to the public.</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M4 — Remove a listing (small, danger, reason required). Soft delete.   */
/* ------------------------------------------------------------------ */
export function RemoveModal({ pro, onConfirm, onClose }: { pro: Pro; onConfirm: (reason: string) => void; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const ok = reason.trim().length >= 6;
  return (
    <Modal
      open
      onClose={onClose}
      title="Remove this listing?"
      sub={`${pro.ref} · ${pro.name}`}
      size="sm"
      tone="danger"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Keep it
          </button>
          <button type="button" className="ny-btn ny-btn-danger ny-btn-sm" disabled={!ok} onClick={() => onConfirm(reason.trim())}>
            <Trash2 className="h-3.5 w-3.5" /> Remove listing
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-text-secondary">
        The listing is archived, not erased. Reviews, endorsements and contact history stay in the audit trail, and it can be restored by an admin.
      </p>
      <label className="ny-label mt-4" htmlFor="rm-reason">Reason (logged)</label>
      <input id="rm-reason" className="ny-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Moved away from the area" />
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M5 — Edit a listing (medium). Rates, services, availability, contact.  */
/* ------------------------------------------------------------------ */
export type ListingPatch = Partial<Pick<Pro, "services" | "town" | "availability" | "rateKes" | "rateUnit" | "transportKes" | "email" | "whatsapp">>;

export function EditModal({ pro, onSave, onClose }: { pro: Pro; onSave: (patch: ListingPatch) => void; onClose: () => void }) {
  const [services, setServices] = useState(pro.services.join(", "));
  const [town, setTown] = useState(pro.town);
  const [availability, setAvailability] = useState(pro.availability);
  const [rate, setRate] = useState(String(pro.rateKes));
  const [unit, setUnit] = useState<Unit>(pro.rateUnit);
  const [transport, setTransport] = useState(String(pro.transportKes));
  const [email, setEmail] = useState(pro.email);
  const [whatsapp, setWhatsapp] = useState(pro.whatsapp);
  const ok = services.trim().length > 3 && Number(rate) > 0;
  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit listing for ${pro.name}`}
      sub={`${pro.ref} · changes are audited`}
      size="md"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            disabled={!ok}
            onClick={() =>
              onSave({
                services: services.split(",").map((s) => s.trim()).filter(Boolean),
                town: town.trim(),
                availability: availability.trim(),
                rateKes: Number(rate) || 0,
                rateUnit: unit,
                transportKes: Number(transport) || 0,
                email: email.trim(),
                whatsapp,
              })
            }
          >
            <Check className="h-3.5 w-3.5" /> Save listing
          </button>
        </>
      }
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="ny-label" htmlFor="ed-services">Services (comma separated)</label>
          <input id="ed-services" className="ny-input" value={services} onChange={(e) => setServices(e.target.value)} />
        </div>
        <div>
          <label className="ny-label" htmlFor="ed-town">Town</label>
          <input id="ed-town" className="ny-input" value={town} onChange={(e) => setTown(e.target.value)} />
        </div>
        <div>
          <label className="ny-label" htmlFor="ed-av">Availability</label>
          <input id="ed-av" className="ny-input" value={availability} onChange={(e) => setAvailability(e.target.value)} />
        </div>
        <div>
          <label className="ny-label" htmlFor="ed-rate">Rate (KES)</label>
          <input id="ed-rate" inputMode="numeric" className="ny-input ny-num" value={rate} onChange={(e) => setRate(e.target.value.replace(/[^0-9]/g, ""))} />
        </div>
        <div>
          <label className="ny-label" htmlFor="ed-unit">Charged</label>
          <select id="ed-unit" className="ny-select" value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
            {(Object.keys(UNIT_LABEL) as Unit[]).map((u) => (
              <option key={u} value={u}>
                {UNIT_LABEL[u]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="ny-label" htmlFor="ed-tr">Transport (KES)</label>
          <input id="ed-tr" inputMode="numeric" className="ny-input ny-num" value={transport} onChange={(e) => setTransport(e.target.value.replace(/[^0-9]/g, ""))} />
        </div>
        <div>
          <label className="ny-label" htmlFor="ed-mail">Email</label>
          <input id="ed-mail" className="ny-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" />
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3">
          <span className="text-sm font-semibold">WhatsApp</span>
          <button type="button" role="switch" aria-checked={whatsapp} aria-label="WhatsApp available" className="pf-switch" onClick={() => setWhatsapp((v) => !v)} />
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M6 — Grant the verified-by-family badge (small, admin, 2FA).           */
/* ------------------------------------------------------------------ */
export function VerifyModal({ pro, onConfirm, onClose }: { pro: Pro; onConfirm: () => void; onClose: () => void }) {
  const [code, setCode] = useState("");
  return (
    <Modal
      open
      onClose={onClose}
      title="Grant the family badge?"
      sub={`${pro.ref} · ${pro.name}`}
      size="sm"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={code.length !== 6} onClick={onConfirm}>
            <ShieldCheck className="h-3.5 w-3.5" /> Grant badge
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-text-secondary">
        “Verified by family” means an admin has checked this person and vouches for them. It is not a government licence check.
      </p>
      <label className="ny-label mt-4" htmlFor="vf-code">
        <Fingerprint className="mr-1 inline h-3.5 w-3.5" /> Your 2FA code
      </label>
      <input id="vf-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · dev mode accepts any 6 digits</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M7 — Moderate an endorsement (small). Reject needs a reason.           */
/* ------------------------------------------------------------------ */
export function ModerateModal({
  endorsement,
  proName,
  onDecide,
  onClose,
}: {
  endorsement: Endorsement;
  proName: string;
  onDecide: (status: "approved" | "rejected", reason: string) => void;
  onClose: () => void;
}) {
  const [pick, setPick] = useState<"approved" | "rejected">("approved");
  const [reason, setReason] = useState("");
  const ok = pick === "approved" || reason.trim().length >= 6;
  return (
    <Modal
      open
      onClose={onClose}
      title="Moderate this endorsement"
      sub={`${endorsement.id} · for ${proName} · from ${endorsement.by}`}
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Later
          </button>
          <button type="button" className={`ny-btn ny-btn-sm ${pick === "approved" ? "ny-btn-accent" : "ny-btn-danger"}`} disabled={!ok} onClick={() => onDecide(pick, reason.trim())}>
            {pick === "approved" ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            {pick === "approved" ? "Approve" : "Reject"}
          </button>
        </>
      }
    >
      <blockquote className="ny-inset px-3.5 py-3 text-sm italic text-text-secondary">&ldquo;{endorsement.note}&rdquo;</blockquote>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => setPick("approved")} className={`rounded-xl border p-3 text-left transition ${pick === "approved" ? "border-brand-primary bg-[rgba(31,77,58,0.07)]" : "border-border-subtle bg-surface-1"}`}>
          <span className="block text-sm font-semibold">Approve</span>
          <span className="ny-hud mt-1 block !text-[0.52rem]">Shows on the listing</span>
        </button>
        <button type="button" onClick={() => setPick("rejected")} className={`rounded-xl border p-3 text-left transition ${pick === "rejected" ? "border-danger bg-[rgba(198,40,40,0.06)]" : "border-border-subtle bg-surface-1"}`}>
          <span className="block text-sm font-semibold">Reject</span>
          <span className="ny-hud mt-1 block !text-[0.52rem]">Needs a reason</span>
        </button>
      </div>
      {pick === "rejected" && (
        <div className="mt-3">
          <label className="ny-label" htmlFor="md-reason">Reason</label>
          <input id="md-reason" className="ny-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Duplicate, or the person is not known to the family" />
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M8 — Add or rename a category (small).                                 */
/* ------------------------------------------------------------------ */
export function CatEditModal({
  cat,
  onSave,
  onClose,
}: {
  cat: Category | null;
  onSave: (name: string, blurb: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(cat?.name ?? "");
  const [blurb, setBlurb] = useState(cat?.blurb ?? "");
  const ok = name.trim().length >= 3 && blurb.trim().length >= 6;
  return (
    <Modal
      open
      onClose={onClose}
      title={cat ? "Rename category" : "Add a category"}
      sub={cat ? cat.id : "Admin only · shows on the public H-3 directory after the next sync"}
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!ok} onClick={() => onSave(name.trim(), blurb.trim())}>
            <Check className="h-3.5 w-3.5" /> Save category
          </button>
        </>
      }
    >
      <label className="ny-label" htmlFor="ct-name">Name</label>
      <input id="ct-name" className="ny-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Solar and power" />
      <label className="ny-label mt-3" htmlFor="ct-blurb">What it covers</label>
      <input id="ct-blurb" className="ny-input" value={blurb} onChange={(e) => setBlurb(e.target.value)} placeholder="Installers and repairers of solar kits" />
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M9 — Switch a category off (small, danger). Shows what it affects.     */
/* ------------------------------------------------------------------ */
export function CatDisableModal({
  cat,
  affected,
  onConfirm,
  onClose,
}: {
  cat: Category;
  affected: number;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const ok = reason.trim().length >= 6;
  return (
    <Modal
      open
      onClose={onClose}
      title={`Switch off ${cat.name}?`}
      sub={`${affected} listing${affected === 1 ? "" : "s"} will be hidden from new searches`}
      size="sm"
      tone="danger"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Keep it on
          </button>
          <button type="button" className="ny-btn ny-btn-danger ny-btn-sm" disabled={!ok} onClick={() => onConfirm(reason.trim())}>
            Switch off
          </button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-text-secondary">
        Existing listings are kept and their history is untouched. Nobody can start a new contact in this category until it is switched back on.
      </p>
      <label className="ny-label mt-4" htmlFor="cd-reason">Reason (logged)</label>
      <input id="cd-reason" className="ny-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Too few active listings this season" />
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M10 — One portfolio photograph, large (medium). Step with prev/next.   */
/* ------------------------------------------------------------------ */
export function PhotoModal({
  pro,
  index,
  onStep,
  onClose,
}: {
  pro: Pro;
  index: number;
  onStep: (delta: number) => void;
  onClose: () => void;
}) {
  const shot = pro.portfolio[index] ?? pro.portfolio[0];
  const n = pro.portfolio.length;
  return (
    <Modal
      open
      onClose={onClose}
      title={`${pro.name} · portfolio`}
      sub={`Photo ${index + 1} of ${n}`}
      size="lg"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" disabled={n < 2} onClick={() => onStep(-1)}>
            Previous
          </button>
          <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" disabled={n < 2} onClick={() => onStep(1)}>
            Next
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      {shot && (
        <figure>
          <img src={shot.src} alt={shot.caption} className="h-auto max-h-[52vh] w-full rounded-xl object-cover" />
          <figcaption className="mt-3 text-sm leading-relaxed text-text-secondary">{shot.caption}</figcaption>
        </figure>
      )}
      <p className="ny-chip ny-chip-sim mt-3">Portfolio images are stored with the listing in Phase 1 · uploads connect in Phase 2</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M11 — Add portfolio photos from the library (small, SIMULATED upload). */
/* ------------------------------------------------------------------ */
export function PhotoAddModal({ pro, onSave, onClose }: { pro: Pro; onSave: (shots: Shot[]) => void; onClose: () => void }) {
  const have = new Set(pro.portfolio.map((s) => s.src));
  const [picked, setPicked] = useState<string[]>([]);
  const addable = PORTFOLIO_LIBRARY.filter((s) => !have.has(s.src));
  return (
    <Modal
      open
      onClose={onClose}
      title="Add portfolio photos"
      sub={`${pro.name} · pick up to three`}
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            disabled={picked.length === 0}
            onClick={() => {
              onSave(PORTFOLIO_LIBRARY.filter((s) => picked.includes(s.src)));
              onClose();
            }}
          >
            <ImagePlus className="h-3.5 w-3.5" /> Add {picked.length || ""} photo{picked.length === 1 ? "" : "s"}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        {addable.slice(0, 6).map((s) => {
          const on = picked.includes(s.src);
          return (
            <button
              key={s.src}
              type="button"
              aria-pressed={on}
              onClick={() =>
                setPicked((prev) => (on ? prev.filter((x) => x !== s.src) : prev.length >= 3 ? prev : [...prev, s.src]))
              }
              className={`pf-pick text-left ${on ? "is-on" : ""}`}
            >
              <img src={s.src} alt="" loading="lazy" decoding="async" />
              <span className="block truncate px-2 py-1.5 text-xs text-text-secondary">{s.caption}</span>
            </button>
          );
        })}
      </div>
      {addable.length === 0 && <p className="ny-inset px-3.5 py-3 text-sm text-text-secondary">All library photographs are already in this portfolio.</p>}
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED upload · real photo storage connects in Phase 2</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M12 — Share the profile link (small). Copies a link; nothing is published. */
/* ------------------------------------------------------------------ */
export function ShareModal({ pro, onCopy, onClose }: { pro: Pro; onCopy: () => void; onClose: () => void }) {
  const link = `nalyanya.app/pro/${pro.id}`;
  return (
    <Modal
      open
      onClose={onClose}
      title="Share this profile"
      sub="Family members can open it. Nothing is published to the public page."
      size="sm"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onCopy}>
            <Link2 className="h-3.5 w-3.5" /> Copy link
          </button>
        </>
      }
    >
      <div className="ny-inset px-3.5 py-3">
        <p className="ny-hud !text-[0.52rem]">Family link</p>
        <p className="fa-token mt-1 truncate text-sm font-semibold">{link}</p>
      </div>
      <p className="ny-chip ny-chip-sim mt-3">SIMULATED · the public listing is shown on H-3 after an admin publishes it</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M13 — Contact ticket receipt (small). The request is queued, not sent. */
/* ------------------------------------------------------------------ */
export function TicketModal({ ticket, pro, onClose }: { ticket: Ticket; pro: Pro | undefined; onClose: () => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      title="Request logged"
      sub={`${ticket.ref} · ${pro?.name ?? "professional"}`}
      size="sm"
      tone="gold"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className="pf-ticket">
        <p className="ny-hud !text-[0.52rem]">Ticket</p>
        <p className="ny-num ny-display mt-1 text-lg">{ticket.ref}</p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="ny-hud !text-[0.5rem]">Urgency</dt>
            <dd className="font-semibold">{URGENCY_LABEL[ticket.urgency]}</dd>
          </div>
          <div>
            <dt className="ny-hud !text-[0.5rem]">Reach by</dt>
            <dd className="font-semibold">{REACH_LABEL[ticket.reach]}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">{ticket.need}</p>
      </div>
      <p className="ny-chip ny-chip-sim mt-3">Queued, not sent · the message connects when the backend is wired</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M14 — Generic decision confirmation (small).                           */
/* ------------------------------------------------------------------ */
export function DecisionModal({ data, onClose }: { data: { title: string; body: string; tone: "ok" | "warn" }; onClose: () => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      title={data.title}
      size="sm"
      tone={data.tone === "warn" ? "danger" : "gold"}
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className="rounded-xl border border-border-subtle bg-surface-2 p-4 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[rgba(212,164,55,0.2)]">
          <BadgeCheck className={`h-6 w-6 ${data.tone === "ok" ? "text-[#7a5b12]" : "text-danger"}`} />
        </span>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">{data.body}</p>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M15 — Audit row detail (small).                                        */
/* ------------------------------------------------------------------ */
export function AuditModal({ entry, onClose }: { entry: AuditEntry; onClose: () => void }) {
  return (
    <Modal
      open
      onClose={onClose}
      title={`Audit · ${entry.action}`}
      sub={`${entry.ref} · ${entry.at}`}
      size="sm"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Close
        </button>
      }
    >
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
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M16 — Quote calculator (small): amount plus travel, from the listing's own rate. */
/* ------------------------------------------------------------------ */
export function QuoteModal({ pro, onClose }: { pro: Pro; onClose: () => void }) {
  const [qty, setQty] = useState(1);
  const [travel, setTravel] = useState(pro.transportKes > 0);
  const total = quoteOf(pro, qty, travel);
  return (
    <Modal
      open
      onClose={onClose}
      title="Rough quote"
      sub={`${pro.name} · ${UNIT_LABEL[pro.rateUnit]}`}
      size="sm"
      footer={
        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>
          Done
        </button>
      }
    >
      <label className="ny-label" htmlFor="qt-qty">How many {pro.rateUnit === "hour" ? "hours" : pro.rateUnit === "day" ? "days" : pro.rateUnit === "job" ? "jobs" : pro.rateUnit === "visit" ? "visits" : "consultations"}?</label>
      <input id="qt-qty" type="range" min={1} max={12} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="w-full accent-[var(--color-brand-primary)]" />
      <p className="ny-num mt-1 text-sm font-semibold">{qty}</p>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3">
        <span className="text-sm font-semibold">Add transport ({kes(pro.transportKes)})</span>
        <button type="button" role="switch" aria-checked={travel} aria-label="Add transport" className="pf-switch" onClick={() => setTravel((v) => !v)} disabled={pro.transportKes === 0} />
      </div>
      <div className="ny-inset mt-4 flex items-center justify-between gap-3 px-4 py-3">
        <span className="ny-hud">Rough total</span>
        <span className="ny-num ny-display text-xl">{kes(total)}</span>
      </div>
      <p className="ny-hud mt-3 !text-[0.52rem]">Worked out from the rate on the listing. The professional confirms the final figure.</p>
    </Modal>
  );
}

