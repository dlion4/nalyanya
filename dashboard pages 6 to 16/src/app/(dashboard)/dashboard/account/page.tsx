"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Bell, Download, Eye, EyeOff, Fingerprint, Globe, KeyRound, Landmark, Lock, MessageSquare, Pencil, Phone, Settings2, ShieldCheck, Sparkles, Smartphone, Trash2, Users, Wallet, X } from "lucide-react";
import { CountUp, Reveal, Tabs } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/overlay";
import { fmt, kes, kesShort } from "@/lib/format";
import {
  AS_OF,
  CHANGE_FIELD_LABEL,
  ME_ID,
  PRIVACY_NOTICE,
  approvedCount,
  auditSeed,
  changeRequestsSeed,
  consentSeed,
  finance,
  fmtDate,
  frames,
  pendingCount,
  prefsSeed,
  profileSeed,
  rejectedCount,
  requestLabel,
  requestTone,
  sessionsSeed,
  type ChangeField,
  type ChangeRequest,
  type ConsentEntry,
  type Profile,
  type Session,
} from "@/data/dashboard/account";
import { useOverlay } from "@/components/account/use-overlay";
import {
  AltChannelModal,
  AuditModal,
  BankRequestModal,
  DecisionModal,
  DeleteAccountModal,
  EditProfileDrawer,
  ExportDataModal,
  MobileRequestModal,
  PasswordModal,
  PhotoModal,
  PinRequestModal,
  PreferencesModal,
  PrivacyModal,
  RecoveryModal,
  RequestModal,
  SessionModal,
  TotpModal,
} from "@/components/account/modals";
import { FrameStrip, ShutterLightbox, ShutterStage } from "@/components/contributions/shutter-gallery";

const HERO_IMG = "/images/frame-elder.jpg";

const sections = [
  { id: "s1", label: "S1 · My identity" },
  { id: "s2", label: "S2 · Money routing" },
  { id: "s3", label: "S3 · Security" },
  { id: "s4", label: "S4 · Preferences" },
  { id: "s5", label: "S5 · Finance profile" },
  { id: "s6", label: "S6 · My change requests" },
  { id: "s7", label: "S7 · Data & privacy" },
  { id: "s8", label: "S8 · Stories" },
];

const lockedFields: { key: ChangeField; label: string; current: string; hint: string; icon: typeof Phone }[] = [
  { key: "mobile", label: "Mobile number (M-Pesa destination)", current: "+2547 ··· 2210", hint: "Payouts and loan money go to this number", icon: Smartphone },
  { key: "bank", label: "Bank account (EFT destination)", current: "Equity ···· 4471", hint: "Larger transfers and school fees route here", icon: Landmark },
  { key: "airtel", label: "Airtel number", current: "+2547 ··· 5512", hint: "A secondary rail if M-Pesa is unreachable", icon: Phone },
  { key: "pin", label: "Receive PIN (for elders)", current: "Set", hint: "Four digits on a receive link · OTP + co-sign", icon: KeyRound },
];

export default function AccountPage() {
  return <AccountView />;
}

function AccountView() {
  const toast = useToast();
  const ov = useOverlay();

  const [profile, setProfile] = useState<Profile>(profileSeed);
  const [requests, setRequests] = useState<ChangeRequest[]>(changeRequestsSeed);
  const [sessions, setSessions] = useState<Session[]>(sessionsSeed);
  const [consents, setConsents] = useState<ConsentEntry[]>(consentSeed);
  const [prefs, setPrefs] = useState(prefsSeed);
  const [audit, setAudit] = useState(auditSeed);
  const [decision, setDecision] = useState<{ title: string; body: string; tone: "ok" | "warn" } | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [session, setSession] = useState(0);

  const liveRequests = useMemo(() => requests, [requests]);
  const pending = pendingCount(liveRequests);
  const nextRef = `NY-CHG-2025-${String(42 + requests.length - changeRequestsSeed.length).padStart(5, "0")}`;

  const targetReq = ov.id ? requests.find((r) => r.id === ov.id) ?? null : null;
  const targetSession = ov.id ? sessions.find((s) => s.id === ov.id) ?? null : null;
  const targetAudit = ov.id ? audit.find((a) => a.ref === ov.id) ?? null : null;

  const open = (key: Parameters<typeof ov.open>[0], id?: string, t?: string) => ov.open(key, id || t ? { id, t } : undefined);
  const bump = () => setSession((s) => s + 1);
  const log = (action: string, entity: string, detail: string, tone: ChangeRequest["tone"] = "plain") =>
    setAudit((prev) => [{ ref: `NY-AUD-${String(1211 + prev.length).padStart(5, "0")}`, at: "18 Nov · 11:05", actor: profile.name, action, entity, detail, tone }, ...prev]);

  const fieldFor = (key: ChangeField) => lockedFields.find((f) => f.key === key)!;

  const saveProfile = (p: Profile) => {
    setProfile(p);
    log("profile.edit", profile.memberRef, "Self-edit saved · audit row written", "gold");
    bump();
    setDecision({ title: "Profile saved", body: "Your details are updated. Identity and payout fields did not change.", tone: "ok" });
  };

  const requestMobile = (number: string, reason: string) => {
    const req: ChangeRequest = { id: `r${Date.now().toString(36)}`, ref: nextRef, field: "mobile", label: "Mobile number", current: profile.phone, requested: number, reason, submitted: AS_OF, status: "submitted", adminNote: "Waiting for the finance officer's co-sign.", tone: "plain" };
    setRequests((prev) => [req, ...prev]);
    log("change.request", req.ref, `Mobile change · ${number} · OTP on current number · SIMULATED`, "gold");
    ov.close();
    setDecision({ title: "Change request sent", body: "The old number stays active until an admin approves.", tone: "ok" });
  };

  const requestBank = (bank: string, account: string, reason: string) => {
    const req: ChangeRequest = { id: `r${Date.now().toString(36)}`, ref: nextRef, field: "bank", label: "Bank account", current: profile.bank, requested: `${bank} ···· ${account.slice(-4)}`, reason, submitted: AS_OF, status: "submitted", adminNote: "Waiting for the finance officer's co-sign.", tone: "plain" };
    setRequests((prev) => [req, ...prev]);
    log("change.request", req.ref, `Bank change · ${bank} · OTP on current number · SIMULATED`, "gold");
    ov.close();
    setDecision({ title: "Bank change request sent", body: "The old account stays active until an admin approves.", tone: "ok" });
  };

  const requestAlt = (channel: string, reason: string) => {
    const req: ChangeRequest = { id: `r${Date.now().toString(36)}`, ref: nextRef, field: "airtel", label: "Alternative channel", current: profile.airtel, requested: channel, reason, submitted: AS_OF, status: "submitted", adminNote: "Waiting for the finance officer's co-sign.", tone: "plain" };
    setRequests((prev) => [req, ...prev]);
    log("change.request", req.ref, `${channel} change · OTP on current number · SIMULATED`, "gold");
    ov.close();
    setDecision({ title: "Change request sent", body: "The current channel stays active until an admin approves.", tone: "ok" });
  };

  const requestPin = (pin: string, reason: string) => {
    const req: ChangeRequest = { id: `r${Date.now().toString(36)}`, ref: nextRef, field: "pin", label: "Receive PIN", current: "••••", requested: "New 4-digit PIN", reason, submitted: AS_OF, status: "submitted", adminNote: "OTP and family-head co-sign attached.", tone: "plain" };
    setRequests((prev) => [req, ...prev]);
    log("change.request", req.ref, "Receive PIN change · OTP + co-sign · SIMULATED", "gold");
    ov.close();
    setDecision({ title: "PIN change request sent", body: "The current PIN stays active until the co-sign is approved.", tone: "ok" });
  };

  const withdraw = (req: ChangeRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, status: "rejected", adminNote: "Withdrawn by the member." } : r)));
    log("change.withdraw", req.ref, "Withdrawn by the member", "red");
    ov.close();
    setDecision({ title: "Request withdrawn", body: `${req.ref} · nothing changed`, tone: "warn" });
  };

  const revokeSession = (session: Session) => {
    setSessions((prev) => prev.filter((s) => s.id !== session.id));
    log("session.revoke", session.id, `${session.device} revoked · location ${session.location}`, "red");
    ov.close();
    setDecision({ title: "Session revoked", body: `${session.device} · ${session.location} can no longer sign in.`, tone: "warn" });
  };

  const changePassword = () => {
    log("security.password", profile.memberRef, "Password changed · current-password gate passed · SIMULATED", "gold");
    ov.close();
    setDecision({ title: "Password changed", body: "A new password is active on this device. Others sign out on the next login.", tone: "ok" });
  };

  const enableTotp = () => {
    log("security.totp", profile.memberRef, "TOTP re-enrolled · SIMULATED", "gold");
    ov.close();
    setDecision({ title: "Two-factor re-enrolled", body: "A new authenticator secret is stored. Old codes no longer work.", tone: "ok" });
  };

  const savePrefs = (p: typeof prefs) => {
    setPrefs(p);
    log("preferences.edit", profile.memberRef, `Elder Mode ${p.elderMode ? "on" : "off"} · ${p.currency} · ${p.language}`, "plain");
    ov.close();
    setDecision({ title: "Preferences saved", body: "Saved locally. Elder Mode and currency apply immediately on this device.", tone: "ok" });
  };

  const queueExport = () => {
    log("data.export", profile.memberRef, "My-data ZIP queued · DPA 2019", "gold");
    ov.close();
    setDecision({ title: "Export queued (SIMULATED)", body: "A signed ZIP is generated by the backend in Phase 2. Nothing is produced here.", tone: "ok" });
  };

  const submitDelete = () => {
    log("account.delete", profile.memberRef, "Deletion requested · OTP + typed confirm · admin review required", "red");
    ov.close();
    setDecision({ title: "Deletion request sent", body: "The account stays active while the family head reviews it. Ledger and audit history are retained.", tone: "warn" });
  };

  return (
    <div className="page-dash-account mx-auto max-w-[1500px]">
      {/* ================= HERO ================= */}
      <Reveal>
        <header className="ac-hero mb-6">
          <img src={HERO_IMG} alt="An elder's hands on the family ledger" className="ac-hero__img" fetchPriority="high" />
          <div className="ac-hero__shade" />
          <div className="ac-hero__body grid grid-cols-[minmax(0,1fr)] gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-end">
            <div className="min-w-0">
              <span className="gd-code">T-15 · Account</span>
              <h1 className="ny-display mt-3 max-w-[20ch] text-[clamp(1.9rem,4.6vw,3.3rem)] leading-[1.02] text-on-brand">Your account, your identity, your money rules.</h1>
              <p className="mt-2.5 max-w-[60ch] text-sm leading-relaxed text-on-brand/85 sm:text-base">
                Names, photo, preferences and security are yours to change. The number and account that receive money need a reason,
                an OTP and a second set of eyes — so nobody can quietly redirect the family&apos;s money.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="ny-btn ny-btn-accent" onClick={() => open("edit")}><Pencil className="h-4 w-4"/> Edit profile</button>
                <button type="button" className="ny-btn ny-btn-outline !border-on-brand/50 !text-on-brand hover:!bg-on-brand/10" onClick={() => open("privacy")}><Globe className="h-4 w-4"/> Privacy &amp; consent</button>
                <button type="button" className="ny-btn ny-btn-ghost !text-on-brand/90 hover:!bg-on-brand/10" onClick={() => open("delete")}><Trash2 className="h-4 w-4"/> Delete account</button>
              </div>
            </div>
            <div className="ac-glass p-4">
              <p className="ny-hud !text-on-brand/70">Member</p>
              <p className="ny-display mt-1 text-[clamp(1.6rem,3vw,2.2rem)] leading-none">{profile.preferredName} Nalyanya</p>
              <p className="mt-1.5 text-xs text-on-brand/75">{profile.memberRef} · {profile.branch} branch · {profile.role}</p>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-on-brand/20 pt-3">
                <span className="ny-hud !text-on-brand/75">2FA · receive PIN</span>
                <span className="ny-chip ny-chip-ok">{profile.twoFa ? "On" : "Off"}</span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="ny-hud !text-on-brand/75">Change requests waiting</span>
                <span className={`ny-chip ${pending ? "ny-chip-warn ny-pulse" : "ny-chip-ok"}`}>{pending}</span>
              </div>
            </div>
          </div>
        </header>
      </Reveal>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-5 xl:grid-cols-[210px_minmax(0,1fr)]">
        <nav className="cc-rail" aria-label="Section index">
          <p className="ny-hud px-2 pb-1">Sections</p>
          {sections.map((s) => <a key={s.id} href={`#${s.id}`}>{s.label}</a>)}
          <span className="ny-hud mt-2 border-t border-border-subtle px-2 pt-2 !text-[0.56rem]">8 sections · 18 overlays</span>
        </nav>

        <div className="min-w-0">
          {/* S1 PROFILE */}
          <section id="s1" className="mb-8 scroll-mt-24" aria-label="My identity">
            <div className="cc-sec-head"><div><p className="ny-hud">S1 · Identity</p><h2 className="ny-display text-[1.45rem] leading-tight">My profile</h2></div><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("edit")}><Pencil className="h-3.5 w-3.5"/> Edit</button></div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="ac-photo h-72">
                <img src={profile.photo} alt="My profile photo" className="ac-photo__img" />
                <div className="ac-photo__overlay">
                  <div className="text-left text-on-brand">
                    <p className="ny-display text-xl leading-tight">{profile.preferredName} Nalyanya</p>
                    <p className="ny-hud !text-on-brand/80">{profile.branch} branch</p>
                  </div>
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm !border-on-brand/50 !text-on-brand hover:!bg-on-brand/10" onClick={() => open("photo")}><Pencil className="h-3.5 w-3.5"/> Change</button>
                </div>
              </div>
              <div className="ny-card p-4 sm:p-5">
                <p className="ny-hud">Who I am</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {[["Name", profile.name], ["Preferred name", profile.preferredName], ["Born", String(profile.birthYear)], ["Gender", profile.gender], ["Home / town", profile.town], ["Branch", profile.branch]].map(([k, v]) => <div key={k} className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5"><dt className="ny-hud">{k}</dt><dd className="mt-1 font-medium">{v}</dd></div>)}
                </dl>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{profile.bio}</p>
                <p className="ny-hud mt-3 !text-[0.52rem]">Self-edit saves immediately and writes an audit row. Money-routing fields are not here.</p>
              </div>
            </div>
          </section>

          {/* S2 MONEY ROUTING */}
          <section id="s2" className="mb-8 scroll-mt-24" aria-label="Money routing">
            <div className="cc-sec-head"><div><p className="ny-hud">S2 · Admin-gated</p><h2 className="ny-display text-[1.45rem] leading-tight">Money routing</h2><p className="mt-1 max-w-[64ch] text-sm text-text-secondary">Changing where payouts land needs a request, an OTP on the current number, and a family-head co-sign. The old value stays active until approved.</p></div></div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {lockedFields.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Reveal key={f.key} delay={i * 50}>
                    <article className="ac-lock">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="ny-hud">{f.label}</p>
                          <p className="ac-lock__value ny-num mt-1 text-base font-semibold">{f.current}</p>
                          <p className="mt-1 text-xs text-text-secondary">{f.hint}</p>
                        </div>
                        <span className="ac-lock__glyph"><Lock className="h-4 w-4 text-danger" aria-hidden /></span>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="ny-chip ny-chip-danger">Locked</span>
                        <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open(f.key)}><ArrowRight className="h-3.5 w-3.5"/> Request change</button>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
            <div className="ny-inset mt-3 flex items-start gap-2.5 px-4 py-3">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              <p className="text-xs leading-relaxed text-text-secondary">
                This block is deliberate: it stops a stolen password from silently redirecting a loan payout to a new number.
                A change only takes effect after the admin queue has approved it.
              </p>
            </div>
          </section>

          {/* S3 SECURITY */}
          <section id="s3" className="mb-8 scroll-mt-24" aria-label="Security">
            <div className="cc-sec-head"><div><p className="ny-hud">S3 · Security</p><h2 className="ny-display text-[1.45rem] leading-tight">Security</h2></div><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("password")}><KeyRound className="h-3.5 w-3.5"/> Change password</button></div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="flex flex-col gap-3 lg:col-span-5">
                <button type="button" className="gd-section-item w-full text-left" onClick={() => open("password")}>
                  <span><span className="block text-sm font-semibold">Password</span><span className="ny-hud block !text-[0.52rem]">Current-password gate · SIMULATED</span></span>
                  <ArrowRight className="h-4 w-4 text-brand-primary"/>
                </button>
                <button type="button" className="gd-section-item w-full text-left" onClick={() => open("totp")}>
                  <span><span className="block text-sm font-semibold">Two-factor authentication</span><span className="ny-hud block !text-[0.52rem]">TOTP · {profile.twoFa ? "on" : "off"} · re-enrol</span></span>
                  <ShieldCheck className="h-4 w-4 text-brand-primary"/>
                </button>
                <button type="button" className="gd-section-item w-full text-left" onClick={() => open("recovery")}>
                  <span><span className="block text-sm font-semibold">Recovery codes</span><span className="ny-hud block !text-[0.52rem]">Use one if the phone is lost</span></span>
                  <Fingerprint className="h-4 w-4 text-brand-primary"/>
                </button>
              </div>
              <div className="lg:col-span-7">
                <div className="ny-card p-4 sm:p-5">
                  <p className="ny-hud">Active sessions</p>
                  <ul className="mt-3 space-y-2">{sessions.map(s => (
                    <li key={s.id} className="ac-session rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5">
                      <span className={`ac-session__dot ${s.current ? "bg-success" : "bg-text-tertiary"}`}/>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{s.device}</span>
                        <span className="ny-hud block !text-[0.52rem]">{s.location} · {s.ip} · {s.at}</span>
                      </span>
                      <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm !px-2" onClick={() => open("session", s.id)}>{s.current ? "Details" : "Revoke"}</button>
                    </li>
                  ))}</ul>
                  <p className="ny-hud mt-3 !text-[0.52rem]">Sign out everywhere else is a one-tap revoke on each device. Unknown sessions are flagged.</p>
                </div>
              </div>
            </div>
          </section>

          {/* S4 PREFERENCES */}
          <section id="s4" className="mb-8 scroll-mt-24" aria-label="Preferences">
            <div className="cc-sec-head"><div><p className="ny-hud">S4 · Preferences</p><h2 className="ny-display text-[1.45rem] leading-tight">Preferences</h2></div><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("pref")}><Settings2 className="h-3.5 w-3.5"/> Edit preferences</button></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="ny-card p-4"><p className="ny-hud">Elder Mode</p><p className="ny-display mt-1 text-lg">{prefs.elderMode ? "On" : "Off"}</p><p className="mt-1 text-xs text-text-secondary">Bigger type, larger targets, reduced motion</p></div>
              <div className="ny-card p-4"><p className="ny-hud">Currency</p><p className="ny-display mt-1 text-lg">{prefs.currency}</p><p className="mt-1 text-xs text-text-secondary">KES · USD · EUR display toggle</p></div>
              <div className="ny-card p-4"><p className="ny-hud">Language</p><p className="ny-display mt-1 text-lg">{prefs.language === "en" ? "English" : "Kiswahili"}</p><p className="mt-1 text-xs text-text-secondary">Mock strings only in Phase 1</p></div>
              <div className="ny-card p-4"><p className="ny-hud">Channels</p><p className="ny-display mt-1 text-lg">{Object.values(prefs.channels).filter(Boolean).length}/4</p><p className="mt-1 text-xs text-text-secondary">WhatsApp · SMS · email · in-app</p></div>
            </div>
          </section>

          {/* S5 FINANCE PROFILE */}
          <section id="s5" className="mb-8 scroll-mt-24" aria-label="Finance profile">
            <div className="cc-sec-head"><div><p className="ny-hud">S5 · Finance profile</p><h2 className="ny-display text-[1.45rem] leading-tight">My money standing</h2></div><Link href="/dashboard/finances" className="ny-btn ny-btn-outline ny-btn-sm">Open chama &amp; sacco (T-8) <ArrowRight className="h-3.5 w-3.5"/></Link></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <div className="ny-card p-4"><p className="ny-hud">Sacco shares</p><p className="ny-display mt-1 text-xl">{fmt(finance.saccoShares)}</p><p className="mt-1 text-xs text-text-secondary">Worth {kes(finance.saccoValue)} at {kesShort(1200)} each</p></div>
              <div className="ny-card p-4"><p className="ny-hud">Chamas</p><p className="ny-display mt-1 text-xl">{finance.chamaMemberships}</p><p className="mt-1 text-xs text-text-secondary">Savings, merry-go-round and investment</p></div>
              <div className="ny-card p-4"><p className="ny-hud">Can borrow up to</p><p className="ny-display mt-1 text-xl">{kesShort(finance.loanEligible)}</p><p className="mt-1 text-xs text-text-secondary">3× shares minus active loans</p></div>
              <div className="ny-card p-4"><p className="ny-hud">Active loans</p><p className="ny-display mt-1 text-xl">{finance.activeLoans}</p><p className="mt-1 text-xs text-text-secondary">Current repayment accounts</p></div>
              <div className="ny-card p-4"><p className="ny-hud">Payout channels</p><p className="ny-display mt-1 text-xl">{finance.payoutChannels.length}</p><p className="mt-1 text-xs text-text-secondary">M-Pesa · bank · Airtel · wallet</p></div>
            </div>
          </section>

          {/* S6 MY CHANGE REQUESTS */}
          <section id="s6" className="mb-8 scroll-mt-24" aria-label="My change requests">
            <div className="cc-sec-head"><div><p className="ny-hud">S6 · Requests</p><h2 className="ny-display text-[1.45rem] leading-tight">My change requests</h2><p className="mt-1 text-sm text-text-secondary">Submitted · under review · approved · rejected. The old value stays active until approval.</p></div><span className="ny-chip ny-chip-warn">{pending} waiting</span></div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {liveRequests.map((r) => (
                <button key={r.id} type="button" className="ac-request w-full text-left" onClick={() => open("request", r.id)}>
                  <div className="flex items-start justify-between gap-2"><span className="ny-hud">{r.ref}</span><span className={`ny-chip ${requestTone[r.status]}`}>{requestLabel[r.status]}</span></div>
                  <p className="mt-2 text-sm font-semibold">{r.label}</p>
                  <p className="mt-1 text-xs text-text-secondary">{r.current} → {r.requested}</p>
                  <p className="ny-hud mt-2 !text-[0.52rem]">Submitted {fmtDate(r.submitted)} · {r.reason}</p>
                </button>
              ))}
              {liveRequests.length === 0 && <p className="ny-inset px-4 py-6 text-center text-sm text-text-secondary">No requests yet. Mobile, bank and PIN changes create one here.</p>}
            </div>
          </section>

          {/* S7 DATA & PRIVACY */}
          <section id="s7" className="mb-8 scroll-mt-24" aria-label="Data and privacy">
            <div className="cc-sec-head"><div><p className="ny-hud">S7 · Data &amp; privacy</p><h2 className="ny-display text-[1.45rem] leading-tight">Data &amp; privacy</h2></div><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => open("export-data")}><Download className="h-3.5 w-3.5"/> Export my data</button></div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="ny-card flex flex-col gap-3 p-4 sm:p-5 lg:col-span-7">
                <p className="ny-hud">Kenya DPA 2019</p>
                <p className="text-sm leading-relaxed text-text-secondary">{PRIVACY_NOTICE.body}</p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => open("privacy")}><Globe className="h-3.5 w-3.5"/> Consent log</button>
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm" onClick={() => open("export-data")}><Download className="h-3.5 w-3.5"/> Export my data</button>
                </div>
              </div>
              <div className="ny-card ac-danger flex flex-col gap-3 p-4 sm:p-5 lg:col-span-5">
                <p className="ny-hud">Danger zone</p>
                <p className="text-sm leading-relaxed text-text-secondary">Deleting the account needs identity verification, a typed confirmation and an admin review. Ledger and audit history stay for the family&apos;s protection.</p>
                <button type="button" className="ny-btn ny-btn-danger w-full" onClick={() => open("delete")}><Trash2 className="h-4 w-4"/> Delete account</button>
              </div>
            </div>
          </section>

          {/* S8 STORIES (camera pinhole) */}
          <section id="s8" className="mb-8 scroll-mt-24" aria-label="Stories behind the account">
            <div className="cc-sec-head"><div><p className="ny-hud">S8 · Camera pinhole</p><h2 className="ny-display text-[1.45rem] leading-tight">Why the money-routing rules exist</h2><p className="mt-1 max-w-[62ch] text-sm text-text-secondary">The iris closes to a pinhole, the exposure flashes, and the next family photograph opens.</p></div><button type="button" className="ny-btn ny-btn-accent ny-btn-sm" onClick={() => setLightbox(true)}>Full contact sheet</button></div>
            <Reveal>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="min-w-0">
                  <ShutterStage frames={frames} index={frameIndex} onIndexChange={setFrameIndex}/>
                  <div className="mt-3"><FrameStrip frames={frames} index={frameIndex} onIndexChange={setFrameIndex}/></div>
                </div>
                <aside className="ny-card p-4">
                  <p className="ny-hud">Frame notes</p>
                  <ul className="mt-2 space-y-2.5">
                    {[{k:"Transition",v:"iris, pinhole, flash, open"},{k:"Timing",v:"400ms close · 440ms open"},{k:"Depth",v:"CSS 3D perspective 1400px"},{k:"Accessibility",v:"reduced motion snaps instantly"}].map(x=><li key={x.k} className="ny-inset px-3 py-2.5"><span className="ny-hud block !text-[0.55rem]">{x.k}</span><span className="text-sm font-medium">{x.v}</span></li>)}
                  </ul>
                  <button type="button" className="ny-btn ny-btn-outline ny-btn-sm mt-3 w-full" onClick={() => setLightbox(true)}><Sparkles className="h-3.5 w-3.5"/> Expand</button>
                  <p className="ny-hud mt-3">Drive connector SIMULATED · Phase 2</p>
                </aside>
              </div>
            </Reveal>
          </section>

          <Reveal><footer className="rounded-xl border border-dashed border-border-strong bg-surface-2 px-5 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-text-secondary"><strong className="text-text-primary">Frontend-only Phase 1.</strong> Money-routing changes are SIMULATED. OTP and co-sign flows are local previews.</p><div className="flex flex-wrap gap-1.5">{["SMS OTP", "WhatsApp OTP", "2FA TOTP", "M-Pesa", "Bank EFT", "Drive export"].map(r=><span key={r} className="ny-chip ny-chip-sim">{r}</span>)}</div></div></footer></Reveal>
        </div>
      </div>

      {/* Overlays */}
      {ov.key === "edit" && <EditProfileDrawer profile={profile} onClose={ov.close} onSave={saveProfile} />}
      {ov.key === "photo" && <PhotoModal profile={profile} onClose={ov.close} onSave={(photo) => { setProfile({ ...profile, photo }); ov.close(); log("profile.photo", profile.memberRef, "Profile photo changed · SIMULATED", "gold"); }} />}
      {ov.key === "password" && <PasswordModal onClose={ov.close} onSave={changePassword} />}
      {ov.key === "totp" && <TotpModal onClose={ov.close} onSave={enableTotp} />}
      {ov.key === "recovery" && <RecoveryModal onClose={ov.close} />}
      {ov.key === "session" && targetSession && <SessionModal session={targetSession} onClose={ov.close} onRevoke={() => revokeSession(targetSession)} />}
      {ov.key === "mobile" && <MobileRequestModal profile={profile} onClose={ov.close} onSubmit={requestMobile} />}
      {ov.key === "bank" && <BankRequestModal profile={profile} onClose={ov.close} onSubmit={requestBank} />}
      {ov.key === "airtel" && <AltChannelModal profile={profile} onClose={ov.close} onSubmit={requestAlt} />}
      {ov.key === "pin" && <PinRequestModal profile={profile} onClose={ov.close} onSubmit={requestPin} />}
      {ov.key === "request" && targetReq && <RequestModal req={targetReq} onClose={ov.close} onWithdraw={() => withdraw(targetReq)} />}
      {ov.key === "export-data" && <ExportDataModal profile={profile} onClose={ov.close} onQueue={queueExport} />}
      {ov.key === "privacy" && <PrivacyModal entries={consents} onClose={ov.close} onWithdraw={() => { setConsents((prev) => [{ id: `c${prev.length + 1}`, action: "withdrawn", at: "18 Nov 2025 11:05", note: "Consent withdrawn for the secondary email by the member.", tone: "red" }, ...prev]); ov.close(); }} />}
      {ov.key === "delete" && <DeleteAccountModal profile={profile} onClose={ov.close} onSubmit={submitDelete} />}
      {ov.key === "audit" && targetAudit && <AuditModal entry={targetAudit} onClose={ov.close} />}
      {ov.key === "pref" && <PreferencesModal prefs={prefs} onClose={ov.close} onSave={savePrefs} />}
      {decision && <DecisionModal data={decision} onClose={() => setDecision(null)} />}
      <ShutterLightbox open={lightbox} onClose={() => setLightbox(false)} index={frameIndex} onIndexChange={setFrameIndex} frames={frames} />
    </div>
  );
}
