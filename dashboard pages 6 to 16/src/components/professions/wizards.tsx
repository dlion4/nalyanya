"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, MessageSquare, Phone, Mail } from "lucide-react";
import { Modal } from "@/components/ui/overlay";
import { Stepper } from "@/components/ui/primitives";
import { kes } from "@/lib/format";
import {
  BRANCHES,
  PORTFOLIO_LIBRARY,
  REACH_LABEL,
  UNIT_LABEL,
  URGENCY_LABEL,
  type Branch,
  type Category,
  type Kind,
  type Pro,
  type Reach,
  type Shot,
  type Unit,
  type Urgency,
} from "@/data/dashboard/professions";

/* ------------------------------------------------------------------ */
/* W1 — Add a listing (six steps). Self or admin; a new listing is unverified. */
/* ------------------------------------------------------------------ */
export type NewListing = Omit<Pro, "id" | "ref" | "verified" | "since">;

const LISTING_STEPS = ["Person", "Work", "Where", "Contact", "Portfolio", "Rates & publish"];

export function AddListingWizard({
  cats,
  nextRef,
  onPublish,
  onClose,
}: {
  cats: Category[];
  nextRef: string;
  onPublish: (input: NewListing) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<Kind>("friend");
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [role, setRole] = useState("");
  const [categoryId, setCategoryId] = useState(cats[0]?.id ?? "");
  const [services, setServices] = useState("");
  const [years, setYears] = useState("5");
  const [town, setTown] = useState("");
  const [branch, setBranch] = useState<Branch>("Nairobi");
  const [availability, setAvailability] = useState("Mon–Fri · 09:00–17:00");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState(true);
  const [picks, setPicks] = useState<Shot[]>([]);
  const [rate, setRate] = useState("1500");
  const [unit, setUnit] = useState<Unit>("visit");
  const [transport, setTransport] = useState("0");
  const [bio, setBio] = useState("");
  const [busy, setBusy] = useState(false);

  const serviceList = services.split(",").map((s) => s.trim()).filter(Boolean);
  const digits = phone.replace(/\D/g, "");
  const canNext = [
    name.trim().length >= 3 && relation.trim().length >= 3,
    role.trim().length >= 3 && categoryId !== "" && serviceList.length >= 1,
    town.trim().length >= 3,
    digits.length >= 9,
    picks.length >= 1,
    Number(rate) > 0 && bio.trim().length >= 10,
  ][step];

  const toggleShot = (s: Shot) =>
    setPicks((prev) => (prev.some((x) => x.src === s.src) ? prev.filter((x) => x.src !== s.src) : prev.length >= 3 ? prev : [...prev, s]));

  const publish = () => {
    setBusy(true);
    const initials = name
      .split(" ")
      .filter((w) => /^[A-Za-z]/.test(w))
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
    window.setTimeout(() => {
      onPublish({
        name: name.trim(),
        initials: initials || "NN",
        role: role.trim(),
        kind,
        relation: relation.trim(),
        categoryId,
        services: serviceList,
        town: town.trim(),
        branch,
        phone: `+254${digits.slice(-9)}`,
        email: email.trim(),
        whatsapp,
        years: Number(years) || 0,
        languages: ["English", "Kiswahili"],
        rateKes: Number(rate) || 0,
        rateUnit: unit,
        transportKes: Number(transport) || 0,
        availability: availability.trim(),
        image: picks[0]?.src ?? "/images/frame-reunion.jpg",
        portfolio: picks,
        bio: bio.trim(),
      });
      setBusy(false);
      onClose();
    }, 700);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Add a listing"
      sub={`${nextRef} · six steps · a new listing is unverified until an admin grants the badge`}
      size="lg"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < LISTING_STEPS.length - 1 ? (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={busy || !canNext} onClick={publish}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Publish listing
            </button>
          )}
        </>
      }
    >
      <Stepper total={LISTING_STEPS.length} current={step} labels={LISTING_STEPS} />

      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
            {(["family", "friend"] as Kind[]).map((k) => (
              <button key={k} type="button" onClick={() => setKind(k)} className={`rounded-xl border p-3.5 text-left transition ${kind === k ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                <span className="block text-sm font-semibold">{k === "family" ? "A family member" : "A friend of the family"}</span>
                <span className="mt-1 block text-xs text-text-secondary">{k === "family" ? "Listed by their branch and relation" : "Listed with how the family knows them"}</span>
              </button>
            ))}
          </div>
          <div>
            <label className="ny-label" htmlFor="al-name">Full name</label>
            <input id="al-name" className="ny-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name as they would like it shown" />
          </div>
          <div>
            <label className="ny-label" htmlFor="al-rel">How they are connected to the family</label>
            <input id="al-rel" className="ny-input" value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="Cousin · Nairobi" />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="ny-label" htmlFor="al-role">What they do</label>
            <input id="al-role" className="ny-input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Electrician · wiring and solar" />
          </div>
          <div>
            <span className="ny-label">Category</span>
            <div className="flex flex-wrap gap-1.5">
              {cats.map((c) => (
                <button key={c.id} type="button" aria-pressed={categoryId === c.id} onClick={() => setCategoryId(c.id)} className={`ny-chip ny-touch transition ${categoryId === c.id ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral hover:-translate-y-0.5"}`}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
            <div>
              <label className="ny-label" htmlFor="al-svc">Services (comma separated)</label>
              <input id="al-svc" className="ny-input" value={services} onChange={(e) => setServices(e.target.value)} placeholder="House wiring, solar installs, repairs" />
              <p className="ny-hud mt-1 !text-[0.52rem]">{serviceList.length} service{serviceList.length === 1 ? "" : "s"} listed</p>
            </div>
            <div>
              <label className="ny-label" htmlFor="al-years">Years</label>
              <input id="al-years" inputMode="numeric" className="ny-input ny-num" value={years} onChange={(e) => setYears(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))} />
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="ny-label" htmlFor="al-town">Town</label>
            <input id="al-town" className="ny-input" value={town} onChange={(e) => setTown(e.target.value)} placeholder="Kitale" />
          </div>
          <div>
            <span className="ny-label">Branch</span>
            <div className="flex flex-wrap gap-1.5">
              {BRANCHES.map((b) => (
                <button key={b} type="button" aria-pressed={branch === b} onClick={() => setBranch(b)} className={`ny-chip ny-touch transition ${branch === b ? "!bg-brand-primary !text-on-brand !border-transparent" : "ny-chip-neutral hover:-translate-y-0.5"}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="ny-label" htmlFor="al-av">When they are free</label>
            <input id="al-av" className="ny-input" value={availability} onChange={(e) => setAvailability(e.target.value)} />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="ny-label" htmlFor="al-phone">Phone number</label>
            <input id="al-phone" inputMode="tel" className="ny-input ny-num" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0722 123 456" />
            <p className="ny-hud mt-1 !text-[0.52rem]">Stored in full, shown masked until a member confirms a reveal</p>
          </div>
          <div>
            <label className="ny-label" htmlFor="al-mail">Email (optional)</label>
            <input id="al-mail" className="ny-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3">
            <div>
              <p className="text-sm font-semibold">Reachable on WhatsApp</p>
              <p className="ny-hud mt-0.5 !text-[0.52rem]">Requests can be sent as a WhatsApp message</p>
            </div>
            <button type="button" role="switch" aria-checked={whatsapp} aria-label="Reachable on WhatsApp" className="pf-switch" onClick={() => setWhatsapp((v) => !v)} />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <p className="ny-hud">Pick up to three photographs · {picks.length} chosen</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PORTFOLIO_LIBRARY.map((s) => {
              const on = picks.some((x) => x.src === s.src);
              return (
                <button key={s.src} type="button" aria-pressed={on} onClick={() => toggleShot(s)} className={`pf-pick text-left ${on ? "is-on" : ""}`}>
                  <img src={s.src} alt="" loading="lazy" decoding="async" />
                  <span className="block truncate px-2 py-1.5 text-xs text-text-secondary">{s.caption}</span>
                </button>
              );
            })}
          </div>
          <p className="ny-chip ny-chip-sim">
            <ImagePlus className="mr-1 inline h-3 w-3" /> SIMULATED · the first photograph becomes the card image
          </p>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-4">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
            <div>
              <label className="ny-label" htmlFor="al-rate">Rate (KES)</label>
              <input id="al-rate" inputMode="numeric" className="ny-input ny-num" value={rate} onChange={(e) => setRate(e.target.value.replace(/[^0-9]/g, ""))} />
            </div>
            <div>
              <label className="ny-label" htmlFor="al-unit">Charged</label>
              <select id="al-unit" className="ny-select" value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
                {(Object.keys(UNIT_LABEL) as Unit[]).map((u) => (
                  <option key={u} value={u}>
                    {UNIT_LABEL[u]}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="ny-label" htmlFor="al-tr">Transport (KES, 0 if none)</label>
              <input id="al-tr" inputMode="numeric" className="ny-input ny-num" value={transport} onChange={(e) => setTransport(e.target.value.replace(/[^0-9]/g, ""))} />
            </div>
          </div>
          <div>
            <label className="ny-label" htmlFor="al-bio">A short introduction</label>
            <textarea id="al-bio" className="ny-textarea" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What the family should know about the way they work." />
          </div>
          <dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">
            {[
              ["Name", name || "—"],
              ["Category", cats.find((c) => c.id === categoryId)?.name ?? "—"],
              ["Rate", `${kes(Number(rate) || 0)} ${UNIT_LABEL[unit]}`],
              ["Verified", "No · an admin grants the badge later"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <dt className="text-text-secondary">{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="ny-chip ny-chip-sim">SIMULATED · publishing writes an audit row and appears in the directory at once</p>
        </div>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* W2 — Ask for help (three steps). Logs a SIMULATED contact ticket.       */
/* ------------------------------------------------------------------ */
const REQUEST_STEPS = ["What you need", "When", "How to reach"];

export function ContactWizard({
  pro,
  onSubmit,
  onClose,
}: {
  pro: Pro;
  onSubmit: (d: { need: string; urgency: Urgency; reach: Reach }) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [need, setNeed] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("soon");
  const [reach, setReach] = useState<Reach>(pro.whatsapp ? "whatsapp" : "call");
  const options: Reach[] = [
    ...(pro.whatsapp ? (["whatsapp"] as Reach[]) : []),
    "sms",
    "call",
    ...(pro.email ? (["email"] as Reach[]) : []),
  ];
  const icon = { whatsapp: MessageSquare, sms: MessageSquare, call: Phone, email: Mail } as const;
  const canNext = step === 0 ? need.trim().length >= 12 : true;

  return (
    <Modal
      open
      onClose={onClose}
      title={`Ask ${pro.name} for help`}
      sub={`${pro.role} · ${pro.town} · the request is queued, not sent`}
      size="md"
      tone="gold"
      footer={
        <>
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>
            <ArrowLeft className="h-3.5 w-3.5" /> {step === 0 ? "Cancel" : "Back"}
          </button>
          {step < REQUEST_STEPS.length - 1 ? (
            <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>
              Continue <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => onSubmit({ need: need.trim(), urgency, reach })}>
              <Check className="h-3.5 w-3.5" /> Log the request
            </button>
          )}
        </>
      }
    >
      <Stepper total={REQUEST_STEPS.length} current={step} labels={REQUEST_STEPS} />

      {step === 0 && (
        <div>
          <label className="ny-label" htmlFor="rq-need">What do you need done?</label>
          <textarea id="rq-need" className="ny-textarea" value={need} onChange={(e) => setNeed(e.target.value)} placeholder="Describe the job or question in a few plain sentences." />
          <p className="ny-hud mt-1.5 text-right !text-[0.52rem]">{need.length}/400</p>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-3">
          <span className="ny-label">How soon</span>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-3">
            {(Object.keys(URGENCY_LABEL) as Urgency[]).map((u) => (
              <button key={u} type="button" onClick={() => setUrgency(u)} className={`rounded-xl border p-3.5 text-left transition ${urgency === u ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                <span className="block text-sm font-semibold">{URGENCY_LABEL[u]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <span className="ny-label">Best way to reach them</span>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
            {options.map((r) => {
              const Icon = icon[r];
              return (
                <button key={r} type="button" onClick={() => setReach(r)} className={`rounded-xl border p-3.5 text-left transition ${reach === r ? "border-brand-primary bg-[rgba(31,77,58,0.07)] shadow-[var(--shadow-raise)]" : "border-border-subtle bg-surface-1 hover:-translate-y-0.5"}`}>
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <Icon className="h-4 w-4 text-brand-primary" /> {REACH_LABEL[r]}
                  </span>
                  <span className="ny-chip ny-chip-sim mt-2">SIMULATED</span>
                </button>
              );
            })}
          </div>
          <p className="ny-chip ny-chip-sim">Only the ways this person has agreed to be reached are offered</p>
        </div>
      )}
    </Modal>
  );
}

