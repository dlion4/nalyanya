import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  Check,
  CheckCheck,
  FlaskConical,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { z } from "zod/mini";
import {
  dateFromToday,
  family,
  funds,
  kes,
  localDate,
  members,
} from "@/data/dashboard/command-center";
import { Simulated } from "@/components/shared/Primitives";
import { useWorkspace } from "@/state/Workspace";
import { simulate } from "@/services/adapters/local";
import type { Workflow } from "@/types/workspace";

export const workflowTitles: Record<Workflow, string> = {
  deposit: "Deposit funds",
  withdraw: "Withdraw funds",
  transfer: "Transfer funds",
  contribute: "Make a contribution",
  allocate: "Prepare an elder receive link",
  broadcast: "Family broadcast",
  "event-create": "Plan a family gathering",
  drive: "Connect a photo folder",
  sms: "Prepare an SMS",
  whatsapp: "Prepare a WhatsApp update",
};
export function WorkflowForm({ kind }: { kind: Workflow }) {
  const w = useWorkspace();
  const [step, setStep] = useState(1),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [ref, setRef] = useState("");
  const [amount, setAmount] = useState("5000"),
    [phone, setPhone] = useState("0700000001"),
    [recipient, setRecipient] = useState(members[1].id),
    [purpose, setPurpose] = useState(
      funds.find((f) => f.id === w.query.id)?.title || funds[0].title,
    ),
    [channel, setChannel] = useState(kind === "sms" ? "SMS" : "WhatsApp"),
    [audience, setAudience] = useState("Current branch"),
    [message, setMessage] = useState(""),
    [title, setTitle] = useState(""),
    [place, setPlace] = useState(""),
    [date, setDate] = useState(dateFromToday(7).slice(0, 10)),
    [time, setTime] = useState("11:00"),
    [folder, setFolder] = useState("");
  const money = [
      "deposit",
      "withdraw",
      "transfer",
      "contribute",
      "allocate",
    ].includes(kind),
    event = kind === "event-create",
    drive = kind === "drive",
    messaging = !money && !event && !drive;
  const member = members.find((m) => m.id === recipient)!;
  const total =
    audience === "All family members"
      ? family.members
      : w.branch?.members || family.members;
  const review = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (money) {
      const parsed = z.coerce
        .number()
        .check(z.int(), z.minimum(1), z.maximum(150000))
        .safeParse(amount);
      if (!parsed.success) {
        setError("Enter a whole amount from KES 1 to KES 150,000.");
        return;
      }
      if (
        ["withdraw", "transfer", "allocate"].includes(kind) &&
        Number(amount) > w.balance
      ) {
        setError("The amount must not exceed the available demo balance.");
        return;
      }
      if (
        !["transfer", "allocate"].includes(kind) &&
        !/^(?:\+254|0)(?:7|1)\d{8}$/.test(phone.replace(/[\s-]/g, ""))
      ) {
        setError("Use a Kenyan demo number, for example 0700000001.");
        return;
      }
    }
    if (
      event &&
      (!title.trim() ||
        !place.trim() ||
        new Date(`${date}T${time}:00+03:00`).getTime() <= Date.now())
    ) {
      setError("Add a name, a location, and a future date and time.");
      return;
    }
    if (messaging && message.trim().length < 5) {
      setError("Write a family message with at least five characters.");
      return;
    }
    if (
      drive &&
      (!title.trim() ||
        !/^(?:https:\/\/drive\.google\.com\/drive\/(?:u\/\d+\/)?folders\/)?[\w-]{10,}(?:\?.*)?$/.test(
          folder.trim(),
        ))
    ) {
      setError(
        "Enter an album label and a valid Google Drive folder URL or folder ID.",
      );
      return;
    }
    setStep(2);
  };
  const submit = async () => {
    if (busy) return;
    setBusy(true);
    if (event) {
      const id = `NY-EVT-${crypto.randomUUID().slice(0, 7).toUpperCase()}`;
      w.addEvent({
        id,
        title: title.trim(),
        date: new Date(`${date}T${time}:00+03:00`).toISOString(),
        place: place.trim(),
        host: "Brian Otieno Nalyanya",
        type: "Family gathering",
        branch: w.branch?.id || "bungoma",
        attending: 0,
        image: "/images/garden.webp",
        description:
          message.trim() ||
          "A family gathering planned in this local workspace.",
      });
      setRef(id);
    } else {
      const entry = await simulate({
        kind,
        title: workflowTitles[kind],
        amount: money ? Number(amount) : 0,
        branch: w.branch?.id || "nairobi",
        member: money ? member.name : undefined,
        purpose: kind === "contribute" ? purpose : undefined,
        note: messaging
          ? `${channel} preview for ${total} family members. ${message.trim()}`
          : drive
            ? `Folder preview: ${title.trim()}`
            : kind === "allocate"
              ? `Local allocation for ${member.short}. No receive link was delivered.`
              : `Local ${kind} preview. No external payment was made.`,
      });
      w.addEntry(entry);
      setRef(entry.id);
    }
    setBusy(false);
    setStep(3);
  };
  const rows: [string, string][] = money
    ? [
        ["Amount", kes(Number(amount) || 0)],
        [
          "From",
          kind === "deposit" || kind === "contribute"
            ? "Demo M-Pesa number"
            : "Family wallet",
        ],
        [
          "To",
          kind === "transfer" || kind === "allocate"
            ? member.name
            : kind === "withdraw"
              ? `M-Pesa ending ${phone.slice(-4)}`
              : kind === "contribute"
                ? purpose
                : "Family wallet",
        ],
        ["Branch", w.branch?.name || "All branches"],
      ]
    : event
      ? [
          ["Gathering", title],
          ["Location", place],
          [
            "Date",
            localDate(`${date}T${time}:00+03:00`, {
              weekday: "short",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            }) + " EAT",
          ],
          ["Host", "Brian Nalyanya"],
        ]
      : drive
        ? [
            ["Album", title],
            ["Source", folder],
            ["Access", "Read-only, simulated"],
          ]
        : [
            ["Channel", channel],
            ["Audience", `${total} demo recipients`],
            ["Message", message],
            ...(channel === "SMS"
              ? ([
                  [
                    "Estimated cost",
                    kes(total * Math.ceil(message.length / 160)),
                  ],
                ] as [string, string][])
              : []),
          ];
  if (step === 3)
    return (
      <div className="ny-receipt">
        <div className="ny-receipt-icon">
          {event ? <CalendarCheck2 size={31} /> : <ShieldCheck size={31} />}
        </div>
        {!event && <Simulated />}
        <h3>
          {event
            ? "Your gathering is on the calendar."
            : "Your preview is ready."}
        </h3>
        <p>
          {event
            ? "Saved on this device. No invitations have been sent."
            : "Ready. Connects when the backend is wired."}
        </p>
        <div className="ny-notice">
          <LockKeyhole size={17} />
          <p>
            {event
              ? "You can review the gathering, export its calendar file, and save a local RSVP."
              : money
                ? "No money was moved. This is a simulated entry in your local family ledger."
                : drive
                  ? "No account was connected and no files were accessed. The gallery still uses local sample photographs."
                  : "No messages were sent. Your message has been saved as a local simulation."}
          </p>
        </div>
        <div className="ny-reference">
          <small>LOCAL REFERENCE</small>
          <code>{ref}</code>
        </div>
        <button
          className="ny-btn ny-btn-primary"
          onClick={() =>
            event ? w.open("event", ref) : w.open("receipt", ref)
          }
        >
          {event ? "View gathering" : "View simulation record"}
          <ArrowRight size={14} />
        </button>
        <button className="ny-btn ny-btn-secondary" onClick={w.close}>
          Back to workspace
        </button>
      </div>
    );
  return (
    <div className="ny-workflow">
      <div className="ny-stepper">
        <span className={step === 1 ? "current" : "complete"}>
          <i>{step > 1 ? <Check size={11} /> : 1}</i>Details
        </span>
        <b />
        <span className={step === 2 ? "current" : ""}>
          <i>2</i>Review
        </span>
        <b />
        <span>
          <i>3</i>
          {event ? "Saved" : "Preview"}
        </span>
      </div>
      {!event && (
        <div className="ny-simulation-strip">
          <Simulated />
          <span>
            Frontend preview. No live{" "}
            {money ? "payments" : drive ? "connections" : "messages"}.
          </span>
        </div>
      )}
      {step === 1 ? (
        <form onSubmit={review} className="ny-form">
          {money && (
            <>
              <label>
                Amount in KES
                <div className="ny-amount-input">
                  <span>KES</span>
                  <input
                    type="number"
                    min="1"
                    max="150000"
                    step="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </label>
              <p className="ny-field-help">
                Family wallet: {kes(w.balance)}. Demo limit: KES 150,000.
              </p>
              {["transfer", "allocate"].includes(kind) ? (
                <label>
                  Family recipient
                  <select
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  >
                    {members
                      .filter((m) => m.id !== members[2].id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                </label>
              ) : (
                <label>
                  Demo M-Pesa number
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="off"
                  />
                  <small>
                    Use a sample number. No STK request will be made.
                  </small>
                </label>
              )}
              {kind === "contribute" && (
                <label>
                  Family cause
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                  >
                    {funds.map((f) => (
                      <option key={f.id}>{f.title}</option>
                    ))}
                    <option>Reunion fund</option>
                    <option>Wazee Round</option>
                  </select>
                </label>
              )}
            </>
          )}
          {event && (
            <>
              <label>
                Gathering name
                <input
                  required
                  maxLength={80}
                  placeholder="e.g. Sunday at the homestead"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <div className="ny-form-columns">
                <label>
                  Date
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
                <label>
                  Time (EAT)
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </label>
              </div>
              <label>
                Location
                <input
                  required
                  maxLength={100}
                  placeholder="e.g. Bungoma homestead"
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                />
              </label>
              <label>
                A note for the family
                <textarea
                  maxLength={1000}
                  rows={3}
                  placeholder="What should everyone know?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>
            </>
          )}
          {messaging && (
            <>
              <div className="ny-form-columns">
                <label>
                  Channel
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                  >
                    <option>WhatsApp</option>
                    <option>SMS</option>
                    <option>In-app</option>
                  </select>
                </label>
                <label>
                  Audience
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  >
                    <option>Current branch</option>
                    <option>All family members</option>
                  </select>
                </label>
              </div>
              <label>
                Message template
                <select
                  defaultValue=""
                  onChange={(e) => setMessage(e.target.value)}
                >
                  <option value="">Write your own message</option>
                  <option value="Karibuni, family! Please let us know if you can join our next family reunion at the Bungoma homestead.">
                    Reunion reminder
                  </option>
                  <option value="Hello, family. This is a friendly reminder to review this month's contribution to our education fund.">
                    Contribution reminder
                  </option>
                  <option value="Our next Wazee Round gathering is approaching. We look forward to catching up with everyone.">
                    Chama update
                  </option>
                </select>
              </label>
              <label>
                Your message
                <textarea
                  required
                  minLength={5}
                  maxLength={1000}
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Karibuni, family..."
                />
                <small>
                  {message.length}/1000 characters &middot; {total} sample
                  recipients
                </small>
              </label>
            </>
          )}
          {drive && (
            <>
              <label>
                Album label
                <input
                  required
                  maxLength={80}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Our reunion photographs"
                />
              </label>
              <label>
                Google Drive folder URL or ID
                <input
                  required
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/..."
                />
                <small>
                  No sign-in, credentials, or file permissions are requested.
                </small>
              </label>
              <button
                type="button"
                className="ny-text-link"
                onClick={() => {
                  setFolder("nalyanya-demo-album-2026");
                  setTitle("Family reunion album");
                }}
              >
                Use a sample folder
                <ArrowRight size={12} />
              </button>
            </>
          )}
          {error && (
            <p className="ny-form-error" role="alert">
              {error}
            </p>
          )}
          <div className="ny-form-actions">
            <button
              type="button"
              className="ny-btn ny-btn-secondary"
              onClick={w.close}
            >
              Cancel
            </button>
            <button className="ny-btn ny-btn-primary" type="submit">
              Review {event ? "gathering" : "preview"}
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      ) : (
        <div className="ny-review">
          <p>
            Check the details before{" "}
            {event
              ? "saving this gathering on your device."
              : "creating your local simulation."}
          </p>
          <dl className="ny-detail-list">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {!event && (
            <div className="ny-notice">
              <FlaskConical size={16} />
              <p>
                This action only updates your local demo. No external service
                will be contacted.
              </p>
            </div>
          )}
          <div className="ny-form-actions">
            <button
              className="ny-btn ny-btn-secondary"
              disabled={busy}
              onClick={() => setStep(1)}
            >
              <ArrowLeft size={13} />
              Edit details
            </button>
            <button
              className="ny-btn ny-btn-primary"
              disabled={busy}
              onClick={() => void submit()}
            >
              {busy ? (
                <LoaderCircle className="animate-spin" size={14} />
              ) : (
                <CheckCheck size={14} />
              )}{" "}
              {busy
                ? "Preparing..."
                : event
                  ? "Save gathering"
                  : "Confirm simulation"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
