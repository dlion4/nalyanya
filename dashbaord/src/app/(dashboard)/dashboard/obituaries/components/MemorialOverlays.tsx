import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Camera,
  Check,
  Download,
  Flag,
  Heart,
  ImagePlus,
  Link2,
  MapPin,
  Megaphone,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { BRANCHES } from "@/data/family/branches";
import { downloadText } from "@/utils/download";
import { longDate } from "@/lib/calendar";
import type { Condolence, Obituary } from "@/data/dashboard/obituaries";
import { Field, MemorialChip, PinholeStage } from "./PinholeStage";

/* ═══════════════════════════════════════════════════════════════════════
   THE MEMORIAL OVERLAYS
   Every dialog on this page. Each one is wired to a real action: a
   condolence is written, a candle is lit, a funeral is edited, a memorial
   sheet is exported. Live channels resolve to the labelled "connects when
   the backend is wired" state — never a claim that something was sent.
   ═══════════════════════════════════════════════════════════════════════ */

const RELATIONS = [
  "Son",
  "Daughter",
  "Grandson",
  "Granddaughter",
  "Brother",
  "Sister",
  "Nephew",
  "Niece",
  "Cousin",
  "Friend of the family",
];

/* ── 1 · Write a condolence ───────────────────────────────────────────── */

export function CondolenceModal({
  open,
  obituary,
  onClose,
  onSubmit,
}: {
  open: boolean;
  obituary?: Obituary;
  onClose: () => void;
  onSubmit: (message: string, relation: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [relation, setRelation] = useState(RELATIONS[0]);
  const [author, setAuthor] = useState("Brian Otieno Nalyanya");

  useEffect(() => {
    if (open) {
      setMessage("");
      setRelation(RELATIONS[0]);
    }
  }, [open]);

  const trimmed = message.trim();
  const valid = trimmed.length > 8;

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Write a condolence"
      description={
        obituary
          ? `For ${obituary.name}. It is read by the family, never by anyone else.`
          : undefined
      }
      footer={
        <div className="ny-memorial-foot">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            disabled={!valid}
            onClick={() => {
              onSubmit(trimmed, relation);
              onClose();
            }}
          >
            Post the condolence
          </button>
        </div>
      }
    >
      <Field label="Your name">
        <input
          className="ny-input"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
        />
      </Field>
      <Field label="How are you related?">
        <select
          className="ny-input"
          value={relation}
          onChange={(event) => setRelation(event.target.value)}
        >
          {RELATIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="Your message"
        required
        hint={`${trimmed.length} characters · kept on this device`}
      >
        <textarea
          className="ny-input ny-textarea"
          rows={5}
          value={message}
          placeholder="Rest well…"
          onChange={(event) => setMessage(event.target.value)}
        />
      </Field>
      <p className="ny-memorial-simnote">
        <Flag size={13} aria-hidden />
        The condolence posts to this browser. A WhatsApp copy would connect
        when the backend is wired.
      </p>
    </ModalDialog>
  );
}

/* ── 2 · Moderate a condolence ────────────────────────────────────────── */

export function ModerateModal({
  open,
  condolence,
  onClose,
  onResolve,
}: {
  open: boolean;
  condolence?: Condolence;
  onClose: () => void;
  onResolve: (action: "approve" | "hide", reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [action, setAction] = useState<"approve" | "hide">("approve");

  useEffect(() => {
    if (open) {
      setReason("");
      setAction("approve");
    }
  }, [open]);

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Moderate a condolence"
      description="A family head sees this before the family does."
      footer={
        <div className="ny-memorial-foot">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            disabled={reason.trim().length < 4}
            onClick={() => {
              onResolve(action, reason.trim());
              onClose();
            }}
          >
            <ShieldCheck size={14} aria-hidden />
            {action === "approve" ? "Publish it" : "Hide it"}
          </button>
        </div>
      }
    >
      {condolence && (
        <blockquote className="ny-memorial-quote">
          <p>{condolence.message}</p>
          <cite>
            {condolence.authorName} · {condolence.relation}
          </cite>
        </blockquote>
      )}
      <div className="ny-memorial-choice">
        {(
          [
            { id: "approve" as const, label: "Publish it", detail: "The family will see it." },
            { id: "hide" as const, label: "Hide it", detail: "Kept on record, not shown." },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            className={`ny-memorial-choice-card ${action === option.id ? "is-active" : ""}`}
            aria-pressed={action === option.id}
            onClick={() => setAction(option.id)}
          >
            <b>{option.label}</b>
            <small>{option.detail}</small>
          </button>
        ))}
      </div>
      <Field label="Reason for the record" required>
        <input
          className="ny-input"
          value={reason}
          placeholder="e.g. Reviewed with the branch"
          onChange={(event) => setReason(event.target.value)}
        />
      </Field>
    </ModalDialog>
  );
}

/* ── 3 · Edit the funeral details ─────────────────────────────────────── */

export function FuneralModal({
  open,
  obituary,
  onClose,
  onSave,
}: {
  open: boolean;
  obituary?: Obituary;
  onClose: () => void;
  onSave: (values: { date: string; time: string; venue: string; town: string; burial: string }) => void;
}) {
  const [values, setValues] = useState({
    date: "",
    time: "10:00",
    venue: "",
    town: "",
    burial: "",
  });

  useEffect(() => {
    if (open && obituary) {
      setValues({
        date: obituary.funeral.date,
        time: obituary.funeral.time,
        venue: obituary.funeral.venue,
        town: obituary.funeral.town,
        burial: obituary.funeral.burial,
      });
    }
  }, [open, obituary]);

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="md"
      title="Funeral details"
      description={obituary ? `For ${obituary.name}` : undefined}
      footer={
        <div className="ny-memorial-foot">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            onClick={() => {
              onSave(values);
              onClose();
            }}
          >
            <Check size={14} aria-hidden />
            Save the funeral details
          </button>
        </div>
      }
    >
      <div className="ny-memorial-two-up">
        <Field label="Date">
          <input
            type="date"
            className="ny-input"
            value={values.date}
            onChange={(event) => setValues((v) => ({ ...v, date: event.target.value }))}
          />
        </Field>
        <Field label="Time (EAT)">
          <input
            type="time"
            className="ny-input"
            value={values.time}
            onChange={(event) => setValues((v) => ({ ...v, time: event.target.value }))}
          />
        </Field>
      </div>
      <Field label="Venue">
        <input
          className="ny-input"
          value={values.venue}
          onChange={(event) => setValues((v) => ({ ...v, venue: event.target.value }))}
        />
      </Field>
      <Field label="Town">
        <input
          className="ny-input"
          value={values.town}
          onChange={(event) => setValues((v) => ({ ...v, town: event.target.value }))}
        />
      </Field>
      <Field label="Burial place">
        <input
          className="ny-input"
          value={values.burial}
          onChange={(event) => setValues((v) => ({ ...v, burial: event.target.value }))}
        />
      </Field>
      <p className="ny-memorial-quiet">
        <MapPin size={12} aria-hidden /> The map stub updates with the venue
        and its coordinates.
      </p>
    </ModalDialog>
  );
}

/* ── 4 · Attach a contribution cause ──────────────────────────────────── */

export function CauseModal({
  open,
  obituary,
  onClose,
  onSave,
}: {
  open: boolean;
  obituary?: Obituary;
  onClose: () => void;
  onSave: (causeId: string) => void;
}) {
  const [causeId, setCauseId] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    if (open) {
      setCauseId(obituary?.causeId ?? "");
      setGoal(String(obituary?.target ?? 150000));
    }
  }, [open, obituary]);

  const causes = useMemo(
    () =>
      [
        { id: "NY-CON-2026-0398", title: "Mzee Victor · homestead & bursary fund" },
        { id: "NY-CON-2026-0397", title: "Mzee Esther · market bursary fund" },
        { id: "NY-CON-2026-0396", title: "Uncle Joseph · workshop bursary" },
        { id: "NY-CON-2026-0395", title: "Aunt Rebecca · school shoes fund" },
        { id: "NEW", title: "Create a new memorial cause" },
      ] as const,
    [],
  );

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="md"
      title="Link a contribution cause"
      description="So the family can give towards the funeral or a memorial fund."
      footer={
        <div className="ny-memorial-foot">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            onClick={() => {
              onSave(causeId);
              onClose();
            }}
          >
            <Link2 size={14} aria-hidden />
            Link the cause
          </button>
        </div>
      }
    >
      <Field label="Cause">
        <select
          className="ny-input"
          value={causeId}
          onChange={(event) => setCauseId(event.target.value)}
        >
          <option value="">— Choose a cause —</option>
          {causes.map((cause) => (
            <option key={cause.id} value={cause.id}>
              {cause.title}
            </option>
          ))}
        </select>
      </Field>
      {causeId === "NEW" && (
        <Field label="New cause title" required>
          <input
            className="ny-input"
            placeholder="e.g. Amos Wafula · school fees fund"
            onChange={(event) => setGoal(event.target.value)}
          />
        </Field>
      )}
      <Field label="Target (KES)">
        <input
          type="number"
          className="ny-input"
          value={goal}
          onChange={(event) => setGoal(event.target.value)}
        />
      </Field>
      <Link
        className="ny-btn ny-btn-ghost ny-btn-sm"
        to="/dashboard/contributions"
        search={{ contribute: causeId && causeId !== "NEW" ? causeId : undefined }}
      >
        Open the contributions hub
      </Link>
      <p className="ny-memorial-simnote">
        <Flag size={13} aria-hidden />
        M-Pesa collection connects when the backend is wired. The cause is
        created locally.
      </p>
    </ModalDialog>
  );
}

/* ── 5 · Attach a memorial album ──────────────────────────────────────── */

export function AlbumModal({
  open,
  obituary,
  onClose,
}: {
  open: boolean;
  obituary?: Obituary;
  onClose: () => void;
}) {
  const albums = [
    { id: "memorial-victor", name: "Mzee Victor · memorial album", photos: 24 },
    { id: "memorial-esther", name: "Mzee Esther · memorial album", photos: 18 },
    { id: "family-reunion-2022", name: "Kimilili reunion 2022", photos: 132 },
    { id: "family-christmas", name: "Christmas at the homestead", photos: 96 },
  ];
  const [album, setAlbum] = useState(albums[0].id);

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="md"
      title="Attach a memorial album"
      description="The gallery tab of a notice shows one album, scoped to the family."
      footer={
        <div className="ny-memorial-foot">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <Link
            className="ny-btn ny-btn-primary ny-btn-sm"
            to="/dashboard/gallery"
            search={{ album }}
          >
            <ImagePlus size={14} aria-hidden />
            Open in the gallery
          </Link>
        </div>
      }
    >
      <Field label="Album">
        <select
          className="ny-input"
          value={album}
          onChange={(event) => setAlbum(event.target.value)}
        >
          {albums.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.photos} photographs)
            </option>
          ))}
        </select>
      </Field>
      <p className="ny-memorial-quiet">
        <Camera size={12} aria-hidden /> Albums are shared with the gallery
        page; the notice only points at one of them.
      </p>
      {obituary && (
        <p className="ny-memorial-quiet">
          {obituary.name} currently shows {obituary.gallery.length} photographs
          in the drawer.
        </p>
      )}
    </ModalDialog>
  );
}

/* ── 6 · Anniversary broadcast ────────────────────────────────────────── */

export function BroadcastModal({
  open,
  obituary,
  onClose,
  onSend,
}: {
  open: boolean;
  obituary?: Obituary;
  onClose: () => void;
  onSend: (channel: string, message: string) => void;
}) {
  const [channel, setChannel] = useState("WhatsApp");
  const [message, setMessage] = useState(
    "On this day we remember Mzee Victor. Light a candle with us.",
  );

  useEffect(() => {
    if (open && obituary) {
      setMessage(
        `On this day we remember ${obituary.shortName}. Light a candle with us.`,
      );
    }
  }, [open, obituary]);

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="md"
      title="A remembrance broadcast"
      description="Bring the family back to the story on the anniversary."
      footer={
        <div className="ny-memorial-foot">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            onClick={() => {
              onSend(channel, message);
              onClose();
            }}
          >
            <Megaphone size={14} aria-hidden />
            Prepare the broadcast
          </button>
        </div>
      }
    >
      <Field label="Channel">
        <select
          className="ny-input"
          value={channel}
          onChange={(event) => setChannel(event.target.value)}
        >
          <option>WhatsApp</option>
          <option>SMS</option>
          <option>Email</option>
          <option>In-app only</option>
        </select>
      </Field>
      <Field label="Message" required>
        <textarea
          className="ny-input ny-textarea"
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
      </Field>
      <Link
        className="ny-btn ny-btn-ghost ny-btn-sm"
        to="/dashboard/communications"
        search={{ compose: "anniversary" }}
      >
        Open the broadcast composer
      </Link>
      <p className="ny-memorial-simnote">
        <Flag size={13} aria-hidden />
        The broadcast is prepared locally and marked SIMULATED. It connects
        when the backend is wired — nothing is claimed as sent.
      </p>
    </ModalDialog>
  );
}

/* ── 7 · Export a memorial sheet ──────────────────────────────────────── */

export function ExportModal({
  open,
  obituaries,
  focus,
  onClose,
}: {
  open: boolean;
  obituaries: Obituary[];
  focus?: Obituary;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<"one" | "year" | "branch">(
    focus ? "one" : "year",
  );
  const [year, setYear] = useState(String(focus?.deathYear ?? 2019));
  const [branch, setBranch] = useState(focus?.branchId ?? "all");

  const years = Array.from(new Set(obituaries.map((o) => o.deathYear))).sort(
    (a, b) => b - a,
  );

  const rows = useMemo(() => {
    if (mode === "one" && focus) return [focus];
    if (mode === "branch" && branch !== "all")
      return obituaries.filter((o) => o.branchId === branch);
    return obituaries.filter((o) => String(o.deathYear) === year);
  }, [mode, focus, branch, year, obituaries]);

  const sheet = () => {
    const body = rows
      .map(
        (o) => `  <article>
    <h2>${o.name}</h2>
    <p>${o.birthYear} — ${o.deathYear} · ${o.relationship}</p>
    <p>${o.notice[0]}</p>
    <blockquote>${o.familyStatement}</blockquote>
    <p>Funeral: ${o.funeral.date} ${o.funeral.time} EAT · ${o.funeral.venue}, ${o.funeral.town}</p>
    <p>Burial: ${o.funeral.burial}</p>
  </article>`,
      )
      .join("\n");
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Nalyanya memorial sheet</title>
<style>
  body{font-family:Georgia,serif;max-width:44rem;margin:3rem auto;padding:0 1.5rem;color:#1a2618;line-height:1.65}
  h1{font-size:2rem;margin-bottom:.25rem} .meta{color:#5a6b57;font-size:.9rem}
  article{border-top:1px solid #e6ddc8;padding-top:1.25rem;margin-top:1.75rem;break-inside:avoid}
  h2{font-size:1.3rem;margin:0 0 .25rem} blockquote{border-left:3px solid #d4a437;margin:1rem 0;padding-left:1rem;font-style:italic}
  footer{margin-top:3rem;font-size:.8rem;color:#8a9686}
  @media print{body{margin:0}}
</style></head>
<body>
  <h1>In remembrance</h1>
  <p class="meta">Nalyanya family memorial sheet · prepared ${longDate("2026-05-06")} · ${rows.length} notice${rows.length === 1 ? "" : "s"}</p>
${body}
  <footer>Prepared in the Nalyanya family workspace. Frontend simulation — connect the backend to publish this sheet officially.</footer>
</body></html>`;
    downloadText(
      `nalyanya-memorial-sheet-${mode}-${year}.html`,
      html,
      "text/html;charset=utf-8",
    );
  };

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="md"
      title="Export a memorial sheet"
      description="A printable sheet for elders who are not on the app, or for the family file."
      footer={
        <div className="ny-memorial-foot">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={sheet}>
            <Download size={14} aria-hidden />
            Download the sheet
          </button>
        </div>
      }
    >
      <div className="ny-memorial-choice">
        {(
          [
            { id: "one" as const, label: "One person", detail: "A single notice" },
            { id: "year" as const, label: "One year", detail: "Every notice from a year" },
            { id: "branch" as const, label: "One branch", detail: "Every notice from a branch" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            className={`ny-memorial-choice-card ${mode === option.id ? "is-active" : ""}`}
            aria-pressed={mode === option.id}
            onClick={() => setMode(option.id)}
          >
            <b>{option.label}</b>
            <small>{option.detail}</small>
          </button>
        ))}
      </div>

      {mode === "year" && (
        <Field label="Year">
          <select
            className="ny-input"
            value={year}
            onChange={(event) => setYear(event.target.value)}
          >
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </Field>
      )}
      {mode === "branch" && (
        <Field label="Branch">
          <select
            className="ny-input"
            value={branch}
            onChange={(event) => setBranch(event.target.value)}
          >
            <option value="all">All branches</option>
            {BRANCHES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <p className="ny-memorial-quiet">
        <ScrollText size={12} aria-hidden /> The sheet prints as one page per
        notice, with the notice, the family statement and the funeral
        details. PDF export connects when the backend is wired.
      </p>
    </ModalDialog>
  );
}

/* ── 8 · Unpublish a notice ───────────────────────────────────────────── */

export function UnpublishModal({
  open,
  obituary,
  onClose,
  onConfirm,
}: {
  open: boolean;
  obituary?: Obituary;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setConfirm("");
    }
  }, [open]);

  const typeToConfirm = obituary?.shortName ?? "";

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Unpublish this notice"
      description="The notice is withdrawn from the family view. The record stays in the audit trail."
      footer={
        <div className="ny-memorial-foot">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Keep it published
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            disabled={
              reason.trim().length < 6 || confirm.trim().toLowerCase() !== typeToConfirm.toLowerCase()
            }
            onClick={() => {
              onConfirm(reason.trim());
              onClose();
            }}
          >
            <AlertTriangle size={14} aria-hidden />
            Unpublish
          </button>
        </div>
      }
    >
      <Field label="Reason for the record" required>
        <input
          className="ny-input"
          value={reason}
          placeholder="e.g. The family asked us to wait until the memorial is complete"
          onChange={(event) => setReason(event.target.value)}
        />
      </Field>
      <Field
        label={`Type “${typeToConfirm}” to confirm`}
        required
        hint="A deliberate act on a death notice always asks you to type the name."
      >
        <input
          className="ny-input"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
        />
      </Field>
    </ModalDialog>
  );
}

/* ── 9 · Light a candle ───────────────────────────────────────────────── */

export function TributeModal({
  open,
  obituary,
  onClose,
  onLight,
}: {
  open: boolean;
  obituary?: Obituary;
  onClose: () => void;
  onLight: (note: string) => void;
}) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) setNote("");
  }, [open]);

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Light a candle"
      description={
        obituary ? `For ${obituary.name}` : undefined
      }
      footer={
        <div className="ny-memorial-foot">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            onClick={() => {
              onLight(note.trim());
              onClose();
            }}
          >
            <Sparkles size={14} aria-hidden />
            Light it
          </button>
        </div>
      }
    >
      <div className="ny-memorial-candle-scene" aria-hidden>
        <span className="ny-candle is-lit">
          <i className="ny-candle-flame" />
          <i className="ny-candle-body" />
        </span>
        <span className="ny-candle is-lit">
          <i className="ny-candle-flame" />
          <i className="ny-candle-body" />
        </span>
        <span className="ny-candle is-lit">
          <i className="ny-candle-flame" />
          <i className="ny-candle-body" />
        </span>
      </div>
      <Field label="Add a note" hint="Optional — up to one line, shown with your candle.">
        <input
          className="ny-input"
          value={note}
          placeholder="Rest well, Mzee"
          onChange={(event) => setNote(event.target.value)}
        />
      </Field>
    </ModalDialog>
  );
}

/* ── 10 · Edit the family statement ───────────────────────────────────── */

export function StatementModal({
  open,
  obituary,
  onClose,
  onSave,
}: {
  open: boolean;
  obituary?: Obituary;
  onClose: () => void;
  onSave: (statement: string) => void;
}) {
  const [statement, setStatement] = useState("");

  useEffect(() => {
    if (open && obituary) setStatement(obituary.familyStatement);
  }, [open, obituary]);

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="md"
      title="The family statement"
      description="The words the family agrees on, shown beneath the notice."
      footer={
        <div className="ny-memorial-foot">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            onClick={() => {
              onSave(statement.trim());
              onClose();
            }}
          >
            <Check size={14} aria-hidden />
            Save the statement
          </button>
        </div>
      }
    >
      <Field label="Statement" required>
        <textarea
          className="ny-input ny-textarea"
          rows={5}
          value={statement}
          onChange={(event) => setStatement(event.target.value)}
        />
      </Field>
      <p className="ny-memorial-quiet">
        <Heart size={12} aria-hidden /> Keep it in the family's own voice. The
        previous wording is kept in the audit trail.
      </p>
    </ModalDialog>
  );
}

/* ── 11 · Add a life-story moment ─────────────────────────────────────── */

export function StoryModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (year: string, title: string, detail: string) => void;
}) {
  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    if (open) {
      setYear("");
      setTitle("");
      setDetail("");
    }
  }, [open]);

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="md"
      title="Add a moment to the life story"
      description="One year, one line, one memory."
      footer={
        <div className="ny-memorial-foot">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            disabled={!year.trim() || title.trim().length < 3}
            onClick={() => {
              onSave(year.trim(), title.trim(), detail.trim());
              onClose();
            }}
          >
            Add to the timeline
          </button>
        </div>
      }
    >
      <div className="ny-memorial-two-up">
        <Field label="Year" required>
          <input
            className="ny-input"
            value={year}
            placeholder="1997"
            onChange={(event) => setYear(event.target.value)}
          />
        </Field>
        <Field label="Title" required>
          <input
            className="ny-input"
            value={title}
            placeholder="Opened the market shop"
            onChange={(event) => setTitle(event.target.value)}
          />
        </Field>
      </div>
      <Field label="Detail">
        <textarea
          className="ny-input ny-textarea"
          rows={3}
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
        />
      </Field>
    </ModalDialog>
  );
}

/* ── 12 · Publish scope ───────────────────────────────────────────────── */

export function ScopeModal({
  open,
  obituary,
  onClose,
  onSave,
}: {
  open: boolean;
  obituary?: Obituary;
  onClose: () => void;
  onSave: (scope: "family" | "branch" | "admins") => void;
}) {
  const [scope, setScope] = useState<"family" | "branch" | "admins">("family");

  useEffect(() => {
    if (open) setScope("family");
  }, [open]);

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Who can see this notice"
      description="Scope can be widened later, but narrowing it is deliberate."
      footer={
        <div className="ny-memorial-foot">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            onClick={() => {
              onSave(scope);
              onClose();
            }}
          >
            Save the scope
          </button>
        </div>
      }
    >
      <div className="ny-memorial-choice">
        {(
          [
            { id: "family" as const, label: "The whole family", detail: "Every relative can read it" },
            { id: "branch" as const, label: "One branch", detail: "The branch reads it first" },
            { id: "admins" as const, label: "Admins only", detail: "Held privately for now" },
          ] as const
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            className={`ny-memorial-choice-card ${scope === option.id ? "is-active" : ""}`}
            aria-pressed={scope === option.id}
            onClick={() => setScope(option.id)}
          >
            <b>{option.label}</b>
            <small>{option.detail}</small>
          </button>
        ))}
      </div>
      {obituary && (
        <p className="ny-memorial-quiet">
          <Users size={12} aria-hidden /> {obituary.name} is currently visible
          to the whole family.
        </p>
      )}
    </ModalDialog>
  );
}

/* ── 13 · The audit trail ─────────────────────────────────────────────── */

export function AuditModal({
  open,
  entries,
  onClose,
}: {
  open: boolean;
  entries: Array<{ id: string; at: string; actor: string; action: string; detail: string; tone: string }>;
  onClose: () => void;
}) {
  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="md"
      title="The audit trail"
      description="Every publish, edit, moderation and withdrawal, kept for the family head."
      footer={
        <div className="ny-memorial-foot">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            onClick={() => {
              downloadText(
                "nalyanya-obituary-audit.json",
                JSON.stringify({ mode: "SIMULATED", entries }, null, 2),
                "application/json",
              );
              onClose();
            }}
          >
            <Download size={14} aria-hidden />
            Export the audit
          </button>
        </div>
      }
    >
      <ol className="ny-memorial-audit">
        {entries.map((entry) => (
          <li key={entry.id} className={entry.tone === "sensitive" ? "is-sensitive" : ""}>
            <span className="ny-memorial-audit-dot" aria-hidden />
            <div>
              <p className="ny-memorial-audit-head">
                <b>{entry.action}</b>
                <MemorialChip tone="quiet">{entry.actor}</MemorialChip>
              </p>
              <p className="ny-memorial-audit-detail">{entry.detail}</p>
              <time className="ny-memorial-audit-time ny-num" dateTime={entry.at}>
                {new Date(entry.at).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Africa/Nairobi",
                })}
              </time>
            </div>
          </li>
        ))}
      </ol>
    </ModalDialog>
  );
}

/* ── 14 · The camera viewer ───────────────────────────────────────────── */

export function MemorialLightbox({
  open,
  photos,
  index,
  onIndexChange,
  onClose,
  calm,
}: {
  open: boolean;
  photos: Obituary["gallery"];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  calm: boolean;
}) {
  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="lg"
      title="The memorial album"
      description="Move through the photographs the way a camera changes frame."
    >
      <div className="ny-memorial-lightbox">
        <PinholeStage
          photos={photos}
          index={index}
          onIndexChange={onIndexChange}
          calm={calm}
          focus={{ x: 50, y: 48 }}
          label="Memorial photographs"
        />
        <div className="ny-memorial-lightbox-caption">
          <p>{photos[index]?.caption}</p>
          <span className="ny-num">
            {photos[index]?.year} · {photos[index]?.credit}
          </span>
        </div>
        <div className="ny-memorial-lightbox-thumbs">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              className={i === index ? "is-active" : ""}
              aria-label={`Show ${photo.caption}`}
              onClick={() => onIndexChange(i)}
            >
              <img src={photo.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </ModalDialog>
  );
}

/* ── 15 · Archive filters ─────────────────────────────────────────────── */

export function ArchiveFilterModal({
  open,
  year,
  branch,
  onClose,
  onApply,
}: {
  open: boolean;
  year: string;
  branch: string;
  onClose: () => void;
  onApply: (year: string, branch: string) => void;
}) {
  const [nextYear, setNextYear] = useState(year);
  const [nextBranch, setNextBranch] = useState(branch);

  useEffect(() => {
    if (open) {
      setNextYear(year);
      setNextBranch(branch);
    }
  }, [open, year, branch]);

  const years = [2026, 2025, 2024, 2023, 2021, 2020, 2019, 2018, 2016, 2014, 2012];

  return (
    <ModalDialog
      open={open}
      onClose={onClose}
      size="sm"
      title="Filter the archive"
      description="Narrow the record by the year of passing, or by branch."
      footer={
        <div className="ny-memorial-foot">
          <button
            type="button"
            className="ny-btn ny-btn-ghost ny-btn-sm"
            onClick={() => {
              onApply("all", "all");
              onClose();
            }}
          >
            Clear
          </button>
          <button
            type="button"
            className="ny-btn ny-btn-primary ny-btn-sm"
            onClick={() => {
              onApply(nextYear, nextBranch);
              onClose();
            }}
          >
            Apply the filter
          </button>
        </div>
      }
    >
      <Field label="Year of passing">
        <select
          className="ny-input"
          value={nextYear}
          onChange={(event) => setNextYear(event.target.value)}
        >
          <option value="all">All years</option>
          {years.map((y) => (
            <option key={y} value={String(y)}>
              {y}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Branch">
        <select
          className="ny-input"
          value={nextBranch}
          onChange={(event) => setNextBranch(event.target.value)}
        >
          <option value="all">All branches</option>
          {BRANCHES.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </Field>
    </ModalDialog>
  );
}
