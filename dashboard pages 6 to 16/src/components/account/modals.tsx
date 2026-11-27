"use client";

import { useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Clock3, Download, Eye, EyeOff, Fingerprint, Globe, KeyRound, Loader2, Lock, Mail, MessageSquare, Pencil, Phone, ShieldCheck, Smartphone, Trash2, X } from "lucide-react";
import { Drawer, Modal } from "@/components/ui/overlay";
import { Stepper, Tabs } from "@/components/ui/primitives";
import { fmt, kes } from "@/lib/format";
import {
  CHANGE_FIELD_LABEL,
  ME_ID,
  PRIVACY_NOTICE,
  auditSeed,
  changeRequestsSeed,
  consentSeed,
  fmtDate,
  profileSeed,
  requestLabel,
  requestTone,
  sessionsSeed,
  type ChangeField,
  type ChangeRequest,
  type ConsentEntry,
  type Gender,
  type Profile,
  type Session,
} from "@/data/dashboard/account";

/* ------------------------------------------------------------------ */
/* D1 — Edit profile (self)                                              */
/* ------------------------------------------------------------------ */
export function EditProfileDrawer({
  profile,
  onClose,
  onSave,
}: {
  profile: Profile;
  onClose: () => void;
  onSave: (p: Profile) => void;
}) {
  const [tab, setTab] = useState("details");
  const [name, setName] = useState(profile.name);
  const [preferred, setPreferred] = useState(profile.preferredName);
  const [year, setYear] = useState(String(profile.birthYear));
  const [gender, setGender] = useState<Gender>(profile.gender);
  const [town, setTown] = useState(profile.town);
  const [branch, setBranch] = useState(profile.branch);
  const [bio, setBio] = useState(profile.bio);
  const [photo, setPhoto] = useState(profile.photo);
  const [busy, setBusy] = useState(false);
  const ok = name.trim().length >= 4 && town.trim().length >= 3 && bio.trim().length >= 10;
  return (
    <Drawer open onClose={onClose} title="Edit my profile" sub={`${profile.memberRef} · self-edit, audit-logged`} width="max-w-[600px]"
      footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={!ok || busy} onClick={()=>{setBusy(true);window.setTimeout(()=>{onSave({...profile,name:name.trim(),preferredName:preferred.trim(),birthYear:Number(year)||profile.birthYear,gender,town:town.trim(),branch,bio:bio.trim(),photo});setBusy(false);onClose();},600)}}>{busy?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<Check className="h-3.5 w-3.5"/>}Save changes</button></>}
    >
      <Tabs tabs={[{id:"details",label:"Details"},{id:"photo",label:"Photo"},{id:"contact",label:"Contact"}]} active={tab} onChange={setTab} />
      <div className="pt-4">
        {tab === "details" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><label className="ny-label" htmlFor="ep-name">Full name</label><input id="ep-name" className="ny-input" value={name} onChange={e=>setName(e.target.value)}/></div>
              <div><label className="ny-label" htmlFor="ep-pref">Preferred name</label><input id="ep-pref" className="ny-input" value={preferred} onChange={e=>setPreferred(e.target.value)}/></div>
              <div><label className="ny-label" htmlFor="ep-year">Birth year</label><input id="ep-year" inputMode="numeric" className="ny-input ny-num" value={year} onChange={e=>setYear(e.target.value.replace(/[^0-9]/g,"").slice(0,4))}/></div>
              <div><label className="ny-label" htmlFor="ep-gender">Gender</label><select id="ep-gender" className="ny-select" value={gender} onChange={e=>setGender(e.target.value as Gender)}><option value="male">Male</option><option value="female">Female</option><option value="prefer-not-to-say">Prefer not to say</option></select></div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><label className="ny-label" htmlFor="ep-town">Home / current town</label><input id="ep-town" className="ny-input" value={town} onChange={e=>setTown(e.target.value)}/></div>
              <div><label className="ny-label" htmlFor="ep-branch">Family branch</label><select id="ep-branch" className="ny-select" value={branch} onChange={e=>setBranch(e.target.value)}>{["Nairobi","Bungoma","Kakamega","Trans-Nzoia","Diaspora"].map(b=><option key={b}>{b}</option>)}</select></div>
            </div>
            <div><label className="ny-label" htmlFor="ep-bio">Short bio</label><textarea id="ep-bio" className="ny-textarea" value={bio} onChange={e=>setBio(e.target.value)}/></div>
          </div>
        )}
        {tab === "photo" && (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">A photograph from the family library. Real uploads connect to Drive in Phase 2.</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {["/images/frame-reunion.jpg","/images/frame-elder.jpg","/images/contrib-hero.jpg","/images/cause-school.jpg","/images/cause-water.jpg","/images/cause-medical.jpg"].map(src=><button key={src} type="button" aria-pressed={photo===src} onClick={()=>setPhoto(src)} className={`overflow-hidden rounded-lg border-2 transition ${photo===src?"border-brand-accent":"border-transparent opacity-80 hover:opacity-100"}`}><img src={src} alt="" className="h-24 w-full object-cover"/></button>)}
            </div>
            <p className="ny-chip ny-chip-sim">Photo change is SIMULATED · no upload happens</p>
          </div>
        )}
        {tab === "contact" && (
          <div className="space-y-3">
            <div className="ny-inset px-3.5 py-3"><p className="ny-hud">Email</p><p className="mt-1 text-sm font-semibold">{profile.email}</p><p className="ny-hud mt-1 !text-[0.52rem]">Used for receipts and password recovery</p></div>
            <p className="text-sm text-text-secondary">Phone, bank and wallet are edited in the money-routing section, not here.</p>
            <p className="ny-chip ny-chip-brand">{profile.twoFa ? "2FA is on" : "2FA is off"} · PIN set: {profile.pinSet ? "yes" : "no"}</p>
          </div>
        )}
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */
/* M1 — Photo editor                                                    */
/* ------------------------------------------------------------------ */
export function PhotoModal({ profile, onClose, onSave }: { profile: Profile; onClose: () => void; onSave: (photo: string) => void }) {
  const [photo, setPhoto] = useState(profile.photo);
  return <Modal open onClose={onClose} title="Change my photo" sub="From the family library · the upload rail is SIMULATED" size="sm" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={()=>{onSave(photo);onClose();}}><Check className="h-3.5 w-3.5"/>Save photo</button></>}><div className="grid grid-cols-2 gap-2">{["/images/frame-reunion.jpg","/images/frame-elder.jpg","/images/contrib-hero.jpg","/images/cause-school.jpg"].map(src=><button key={src} type="button" onClick={()=>setPhoto(src)} className={`overflow-hidden rounded-lg border-2 ${photo===src?"border-brand-accent":"border-transparent"}`}><img src={src} alt="" className="h-24 w-full object-cover"/></button>)}</div><p className="ny-chip ny-chip-sim mt-3">Uploads and Drive sync are SIMULATED in Phase 1</p></Modal>;
}

/* ------------------------------------------------------------------ */
/* M2 — Change password (current-password gate)                          */
/* ------------------------------------------------------------------ */
export function PasswordModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const ok = cur.trim().length >= 1 && next.length >= 8 && next === repeat;
  return <Modal open onClose={onClose} title="Change my password" sub="The current password is checked before the new one is saved" size="sm" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!ok||busy} onClick={()=>{setBusy(true);window.setTimeout(()=>{onSave();setBusy(false);},700)}}>{busy?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<Check className="h-3.5 w-3.5"/>}Change password</button></>}><div className="space-y-3"><div><label className="ny-label" htmlFor="pw-cur">Current password</label><input id="pw-cur" type="password" className="ny-input" value={cur} onChange={e=>setCur(e.target.value)}/></div><div><label className="ny-label" htmlFor="pw-next">New password</label><input id="pw-next" type="password" className="ny-input" value={next} onChange={e=>setNext(e.target.value)}/><p className="ny-hud mt-1 !text-[0.52rem]">At least 8 characters</p></div><div><label className="ny-label" htmlFor="pw-rep">Repeat the new password</label><input id="pw-rep" type="password" className="ny-input" value={repeat} onChange={e=>setRepeat(e.target.value)}/></div><p className="ny-chip ny-chip-sim">SIMULATED · the credential is stored locally only</p></div></Modal>;
}

/* ------------------------------------------------------------------ */
/* M3 — TOTP 2FA re-enrol (admin-visible flow, dev code)                  */
/* ------------------------------------------------------------------ */
export function TotpModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [code, setCode] = useState("");
  const [scan, setScan] = useState(false);
  const ok = code.length === 6;
  return <Modal open onClose={onClose} title="Re-enrol two-factor authentication" sub="Time-based authenticator · SIMULATED in Phase 1" size="sm" tone="gold" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!ok} onClick={onSave}><Fingerprint className="h-3.5 w-3.5"/> Confirm 2FA</button></>}><div className="mx-auto w-[200px] rounded-xl border border-border-subtle bg-surface-2 p-4 text-center"><div className="mx-auto grid h-40 w-40 grid-cols-6 gap-0.5 rounded-lg bg-white p-2">{Array.from({length:36}).map((_,i)=><span key={i} className={`rounded-sm ${((i*7+i*i)%3)===0?"bg-text-primary":"bg-surface-3"}`}/>)}</div><p className="ny-hud mt-2 !text-[0.5rem]">Scan with an authenticator app</p></div><label className="ny-label mt-4" htmlFor="tf-code"><Fingerprint className="mr-1 inline h-3.5 w-3.5"/> Six-digit code</label><input id="tf-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}/><p className="ny-chip ny-chip-sim mt-3">SIMULATED · any 6 digits work in dev</p></Modal>;
}

/* ------------------------------------------------------------------ */
/* M4 — Recovery codes                                                   */
/* ------------------------------------------------------------------ */
export function RecoveryModal({ onClose }: { onClose: () => void }) {
  const codes = ["9KFJ-2281-PQW4", "3MVD-8841-ZTRN", "0LQE-5531-XCVA", "7HBN-1920-QWER", "2PLM-7734-BVCX", "6JHG-4451-KLIO"];
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  return <Modal open onClose={onClose} title="Recovery codes" sub="Use one of these if you lose your phone. Each works once." size="sm" tone="gold" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Close</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={()=>{setRevealed(true);setCopied(true);window.setTimeout(()=>setCopied(false),1400);}}>{copied?"Copied":"Reveal and copy"}</button></>}><div className="grid grid-cols-1 gap-2 sm:grid-cols-2">{codes.map(c=><code key={c} className={`rounded-lg border border-border-subtle px-3 py-2 text-center text-sm font-mono ${revealed?"bg-surface-1":"bg-surface-2"}`}>{revealed?c:"••••-••••-••••"}</code>)}</div><p className="ny-chip ny-chip-sim mt-3">SIMULATED · codes are placeholders until the backend is wired</p></Modal>;
}

/* ------------------------------------------------------------------ */
/* M5 — Session detail and revoke                                        */
/* ------------------------------------------------------------------ */
export function SessionModal({ session, onClose, onRevoke }: { session: Session; onClose: () => void; onRevoke: () => void }) {
  return <Modal open onClose={onClose} title={session.device} sub={`${session.location} · ${session.ip}`} size="sm" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Close</button>{!session.current&&<button type="button" className="ny-btn ny-btn-danger ny-btn-sm" onClick={onRevoke}><Trash2 className="h-3.5 w-3.5"/> Revoke session</button>}</>}><dl className="grid grid-cols-2 gap-2 text-sm">{[["Device",session.device],["Location",session.location],["IP",session.ip],["Last active",session.at]].map(([k,v])=><div key={k} className="rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5"><dt className="ny-hud">{k}</dt><dd className="mt-1 font-medium">{v}</dd></div>)}</dl>{session.current&&<p className="ny-chip ny-chip-ok mt-3">This is the current session · it cannot be revoked here</p>}</Modal>;
}

/* ------------------------------------------------------------------ */
/* M6 — Change mobile number (request wizard)                            */
/* ------------------------------------------------------------------ */
export function MobileRequestModal({ profile, onClose, onSubmit }: { profile: Profile; onClose: () => void; onSubmit: (number: string, reason: string) => void }) {
  const [step, setStep] = useState(0);
  const [next, setNext] = useState("");
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const digits = next.replace(/\D/g, "");
  const ok = [digits.length >= 9, reason.trim().length >= 8, code.length === 6][step];
  const labels = ["New number", "Reason", "Verify OTP"];
  return (
    <Modal open onClose={onClose} title="Request a new mobile number" sub="The old number stays active until an admin approves" size="md" tone="gold"
      footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={()=>step===0?onClose():setStep(s=>s-1)}><ArrowLeft className="h-3.5 w-3.5"/> {step===0?"Cancel":"Back"}</button>{step<2?<button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!ok} onClick={()=>setStep(s=>s+1)}>Continue <ArrowRight className="h-3.5 w-3.5"/></button>:<button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={!ok||busy} onClick={()=>{setBusy(true);window.setTimeout(()=>{onSubmit(`+254${digits.slice(-9)}`,reason);setBusy(false);},700)}}>{busy?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<Check className="h-3.5 w-3.5"/>} Send to the admin queue</button>}</>}
    >
      <Stepper total={3} current={step} labels={labels} />
      {step===0&&<div className="space-y-3"><p className="ny-inset px-3.5 py-3 text-sm text-text-secondary">Current mobile · {profile.phone}</p><div><label className="ny-label" htmlFor="mc-next">New mobile number</label><input id="mc-next" inputMode="tel" className="ny-input ny-num" value={next} onChange={e=>setNext(e.target.value)} placeholder="0722 123 456"/><p className="ny-hud mt-1 !text-[0.52rem]">Numbers are normalised to +254 before they are checked</p></div></div>}
      {step===1&&<div><label className="ny-label" htmlFor="mc-reason">Why is the number changing?</label><textarea id="mc-reason" className="ny-textarea" value={reason} onChange={e=>setReason(e.target.value)} placeholder="A new SIM, a stolen phone, a change of address…" /><p className="ny-hud mt-1 !text-[0.52rem]">A clear reason helps the family head review it quickly</p></div>}
      {step===2&&<div><label className="ny-label" htmlFor="mc-code"><Fingerprint className="mr-1 inline h-3.5 w-3.5"/> Code sent to the current number</label><input id="mc-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}/><p className="ny-chip ny-chip-sim mt-3">SIMULATED · dev mode accepts any 6 digits</p></div>}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M7 — Change bank account (request wizard)                              */
/* ------------------------------------------------------------------ */
export function BankRequestModal({ profile, onClose, onSubmit }: { profile: Profile; onClose: () => void; onSubmit: (bank: string, account: string, reason: string) => void }) {
  const [step, setStep] = useState(0);
  const [bank, setBank] = useState("Equity");
  const [account, setAccount] = useState("");
  const [accountName, setAccountName] = useState(profile.name);
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const ok = [bank.length >= 2 && account.replace(/\D/g, "").length >= 8, reason.trim().length >= 8, code.length === 6][step];
  const labels = ["Bank & account", "Reason", "Verify OTP"];
  return (
    <Modal open onClose={onClose} title="Request a new bank account" sub="Paid-out money goes only to the approved account" size="md" tone="gold"
      footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={()=>step===0?onClose():setStep(s=>s-1)}><ArrowLeft className="h-3.5 w-3.5"/> {step===0?"Cancel":"Back"}</button>{step<2?<button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!ok} onClick={()=>setStep(s=>s+1)}>Continue <ArrowRight className="h-3.5 w-3.5"/></button>:<button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={!ok||busy} onClick={()=>{setBusy(true);window.setTimeout(()=>{onSubmit(bank,account,reason);setBusy(false);},700)}}>{busy?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<Check className="h-3.5 w-3.5"/>} Send to the admin queue</button>}</>}
    >
      <Stepper total={3} current={step} labels={labels} />
      {step===0&&<div className="space-y-3"><p className="ny-inset px-3.5 py-3 text-sm text-text-secondary">Current bank · {profile.bank}</p><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className="ny-label" htmlFor="bk-bank">Bank</label><select id="bk-bank" className="ny-select" value={bank} onChange={e=>setBank(e.target.value)}>{["KCB","Equity","Coop","NCBA","ABSA","Stanbic","Standard Chartered","I&M","DTB","Family Bank"].map(b=><option key={b}>{b}</option>)}</select></div><div><label className="ny-label" htmlFor="bk-account">Account number</label><input id="bk-account" inputMode="numeric" className="ny-input ny-num" value={account} onChange={e=>setAccount(e.target.value.replace(/[^0-9]/g, ""))}/></div></div><div><label className="ny-label" htmlFor="bk-name">Name on the account</label><input id="bk-name" className="ny-input" value={accountName} onChange={e=>setAccountName(e.target.value)}/></div></div>}
      {step===1&&<div><label className="ny-label" htmlFor="bk-reason">Why is the account changing?</label><textarea id="bk-reason" className="ny-textarea" value={reason} onChange={e=>setReason(e.target.value)} placeholder="A new payroll account, a bank closure, a joint account…"/></div>}
      {step===2&&<div><label className="ny-label" htmlFor="bk-code"><Fingerprint className="mr-1 inline h-3.5 w-3.5"/> Code sent to {profile.phone}</label><input id="bk-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}/><p className="ny-chip ny-chip-sim mt-3">SIMULATED · the real OTP is delivered by SMS in Phase 2</p></div>}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M8 — Change Airtel / alternative channel (same gating)                 */
/* ------------------------------------------------------------------ */
export function AltChannelModal({ profile, onClose, onSubmit }: { profile: Profile; onClose: () => void; onSubmit: (channel: string, reason: string) => void }) {
  const [channel, setChannel] = useState("Airtel");
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const ok = reason.trim().length >= 8 && code.length === 6;
  return (
    <Modal open onClose={onClose} title="Request an alternative channel change" sub="Airtel or the internal wallet · same admin queue and audit trail" size="md" tone="gold"
      footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={!ok||busy} onClick={()=>{setBusy(true);window.setTimeout(()=>{onSubmit(channel,reason);setBusy(false);},650)}}>{busy?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<Check className="h-3.5 w-3.5"/>} Send to the admin queue</button></>}
    >
      <div className="space-y-3">
        <p className="ny-inset px-3.5 py-3 text-sm text-text-secondary">Current alternative · {profile.airtel} · wallet {profile.wallet}</p>
        <div><label className="ny-label" htmlFor="alt-ch">Channel</label><select id="alt-ch" className="ny-select" value={channel} onChange={e=>setChannel(e.target.value)}><option>Airtel</option><option>Internal wallet</option></select></div>
        <div><label className="ny-label" htmlFor="alt-reason">Reason</label><textarea id="alt-reason" className="ny-textarea" value={reason} onChange={e=>setReason(e.target.value)} placeholder="I want the payout to reach my Airtel line in Kitale…"/></div>
        <div><label className="ny-label" htmlFor="alt-code"><Fingerprint className="mr-1 inline h-3.5 w-3.5"/> Code sent to {profile.phone}</label><input id="alt-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}/></div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M9 — Change receive PIN (OTP + admin co-sign)                          */
/* ------------------------------------------------------------------ */
export function PinRequestModal({ profile, onClose, onSubmit }: { profile: Profile; onClose: () => void; onSubmit: (pin: string, reason: string) => void }) {
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [code, setCode] = useState("");
  const [cosign, setCosign] = useState("");
  const [busy, setBusy] = useState(false);
  const ok = pin.length === 4 && pin === pin2 && code.length === 6 && cosign.length === 6;
  return (
    <Modal open onClose={onClose} title="Change my receive PIN" sub="OTP on the current number + a second family head's co-sign" size="md" tone="gold"
      footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-accent ny-btn-sm" disabled={!ok||busy} onClick={()=>{setBusy(true);window.setTimeout(()=>{onSubmit(pin,"PIN updated");setBusy(false);},650)}}>{busy?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<Check className="h-3.5 w-3.5"/>} Change PIN</button></>}
    >
      <div className="grid grid-cols-2 gap-3">
        <div><label className="ny-label" htmlFor="pn-p1">New 4-digit PIN</label><input id="pn-p1" inputMode="numeric" maxLength={4} className="ny-input ny-num tracking-[0.3em]" placeholder="••••" value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,"").slice(0,4))}/></div>
        <div><label className="ny-label" htmlFor="pn-p2">Repeat it</label><input id="pn-p2" inputMode="numeric" maxLength={4} className="ny-input ny-num tracking-[0.3em]" placeholder="••••" value={pin2} onChange={e=>setPin2(e.target.value.replace(/\D/g,"").slice(0,4))}/></div>
      </div>
      {pin&&pin2&&pin!==pin2&&<p className="ny-chip ny-chip-danger mt-3">The two PINs do not match</p>}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div><label className="ny-label" htmlFor="pn-code">Code sent to {profile.phone}</label><input id="pn-code" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,"").slice(0,6))}/></div>
        <div><label className="ny-label" htmlFor="pn-co">Second family head&apos;s 2FA</label><input id="pn-co" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={cosign} onChange={e=>setCosign(e.target.value.replace(/\D/g,"").slice(0,6))}/></div>
      </div>
      <p className="ny-chip ny-chip-sim mt-4">SIMULATED · dev mode accepts any 6 digits</p>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M10 — Change request detail                                          */
/* ------------------------------------------------------------------ */
export function RequestModal({ req, onClose, onWithdraw }: { req: ChangeRequest; onClose: () => void; onWithdraw: () => void }) {
  return <Modal open onClose={onClose} title={`${CHANGE_FIELD_LABEL[req.field]} request`} sub={`${req.ref} · submitted ${fmtDate(req.submitted)}`} size="sm" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Close</button>{req.status!=="approved"&&req.status!=="rejected"&&<button type="button" className="ny-btn ny-btn-danger ny-btn-sm" onClick={onWithdraw}>Withdraw request</button>}</>}>
    <div className={`rounded-xl border border-border-subtle p-4 ${req.status==="approved"?"bg-[rgba(46,125,50,0.08)]":req.status==="rejected"?"bg-[rgba(198,40,40,0.06)]":"bg-surface-2"}`}>
      <span className={`ny-chip ${requestTone[req.status]}`}>{requestLabel[req.status]}</span>
      <p className="mt-3 text-sm font-semibold">{req.label}</p>
      <dl className="mt-2 space-y-1.5 text-sm"><div className="flex justify-between"><dt className="text-text-secondary">Current</dt><dd className="font-medium">{req.current}</dd></div><div className="flex justify-between"><dt className="text-text-secondary">Requested</dt><dd className="font-medium">{req.requested}</dd></div><div className="flex justify-between"><dt className="text-text-secondary">Reason</dt><dd className="text-right">{req.reason}</dd></div></dl>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">{req.adminNote}</p>
    </div>
    {req.status==="approved"&&<p className="ny-chip ny-chip-ok mt-3">The new value is active. Old value is now archive.</p>}
    {req.status==="rejected"&&<p className="ny-chip ny-chip-danger mt-3">Declined · contact the family head for details.</p>}
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M11 — Export my data                                                  */
/* ------------------------------------------------------------------ */
export function ExportDataModal({ profile, onClose, onQueue }: { profile: Profile; onClose: () => void; onQueue: () => void }) {
  return <Modal open onClose={onClose} title="Export my data" sub="Kenya DPA 2019 · my information in one bundle" size="sm" tone="gold" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onQueue}><Download className="h-3.5 w-3.5"/> Queue export (SIMULATED)</button></>}>
    <div className="space-y-2 text-sm">
      <p className="text-text-secondary">A ZIP of everything this family account holds about you, generated locally and signed when the backend is wired.</p>
      <ul className="space-y-1.5">{["Profile and identity", "Contact and money-routing fields", "Contribution, chama and loan history", "Consents and audit rows", "Sessions and devices"].map(x=><li key={x} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-success"/> {x}</li>)}</ul>
      <p className="ny-inset px-3.5 py-3 text-xs leading-relaxed text-text-secondary">Account: {profile.memberRef} · {profile.email}</p>
    </div>
    <p className="ny-chip ny-chip-sim mt-3">SIMULATED · download starts when the job is ready</p>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M12 — Privacy / consent log                                           */
/* ------------------------------------------------------------------ */
export function PrivacyModal({ entries, onClose, onWithdraw }: { entries: ConsentEntry[]; onClose: () => void; onWithdraw: () => void }) {
  return <Modal open onClose={onClose} title="Privacy & consent" sub={`${PRIVACY_NOTICE.version} · ${PRIVACY_NOTICE.title}`} size="md" footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Close</button><button type="button" className="ny-btn ny-btn-danger ny-btn-sm" onClick={onWithdraw}>Withdraw consent (logged)</button></>}>
    <p className="text-sm leading-relaxed text-text-secondary">{PRIVACY_NOTICE.body}</p>
    <p className="ny-hud mt-4">Consent log</p>
    <ul className="mt-2 space-y-1.5">{entries.map(c=><li key={c.id} className="flex items-start gap-2.5 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2.5"><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${c.tone==="gold"?"bg-brand-accent":c.tone==="red"?"bg-danger":"bg-text-tertiary"}`}/><span className="min-w-0"><span className="block text-sm font-medium">{c.action}</span><span className="ny-hud block !text-[0.52rem]">{c.at}</span><span className="block text-xs text-text-secondary">{c.note}</span></span></li>)}</ul>
  </Modal>;
}

/* ------------------------------------------------------------------ */
/* M13 — Delete account (multi-step danger flow)                          */
/* ------------------------------------------------------------------ */
export function DeleteAccountModal({ profile, onClose, onSubmit }: { profile: Profile; onClose: () => void; onSubmit: () => void }) {
  const [step, setStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const ok = [otp.length === 6, reason.trim().length >= 8, confirmText.trim().toLowerCase() === "delete my account"][step];
  const labels = ["Verify identity", "Reason", "Final confirmation"];
  return (
    <Modal open onClose={onClose} title="Delete my account?" sub="Admin review required · the ledger and audit history stay for the family's protection" size="md" tone="danger"
      footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={()=>step===0?onClose():setStep(s=>s-1)}><ArrowLeft className="h-3.5 w-3.5"/> {step===0?"Cancel":"Back"}</button>{step<2?<button type="button" className="ny-btn ny-btn-primary ny-btn-sm" disabled={!ok} onClick={()=>setStep(s=>s+1)}>Continue <ArrowRight className="h-3.5 w-3.5"/></button>:<button type="button" className="ny-btn ny-btn-danger ny-btn-sm" disabled={!ok||busy} onClick={()=>{setBusy(true);window.setTimeout(()=>{onSubmit();setBusy(false);},800)}}>{busy?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<Trash2 className="h-3.5 w-3.5"/>} Send deletion request</button>}</>}
    >
      <Stepper total={3} current={step} labels={labels} />
      {step===0&&<div><label className="ny-label" htmlFor="del-otp"><Fingerprint className="mr-1 inline h-3.5 w-3.5"/> Code sent to {profile.phone}</label><input id="del-otp" inputMode="numeric" maxLength={6} className="ny-input ny-num tracking-[0.4em]" placeholder="••••••" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,"").slice(0,6))}/><p className="ny-chip ny-chip-sim mt-3">SIMULATED · dev mode accepts any 6 digits</p></div>}
      {step===1&&<div><label className="ny-label" htmlFor="del-reason">Why are you leaving?</label><textarea id="del-reason" className="ny-textarea" value={reason} onChange={e=>setReason(e.target.value)} placeholder="This helps the family close the account properly…"/></div>}
      {step===2&&<div><label className="ny-label" htmlFor="del-confirm">Type <strong>delete my account</strong> to confirm</label><input id="del-confirm" className="ny-input" value={confirmText} onChange={e=>setConfirmText(e.target.value)} placeholder="delete my account"/><p className="ny-hud mt-2">The account is not removed immediately. An admin reviews the request first.</p></div>}
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M14 — Preference edit (elder mode, currency, language, channels)      */
/* ------------------------------------------------------------------ */
export function PreferencesModal({ prefs, onClose, onSave }: { prefs: { elderMode: boolean; currency: "KES" | "USD" | "EUR"; language: "en" | "sw"; channels: Record<"whatsapp"|"sms"|"email"|"inApp", boolean> }; onClose: () => void; onSave: (p: typeof prefs) => void }) {
  const [draft, setDraft] = useState(prefs);
  const set = <K extends keyof typeof prefs>(k: K, v: typeof prefs[K]) => setDraft(p => ({ ...p, [k]: v }));
  return (
    <Modal open onClose={onClose} title="Preferences" sub="Elder Mode, display currency, language and communication channels" size="md"
      footer={<><button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>Cancel</button><button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={()=>onSave(draft)}><Check className="h-3.5 w-3.5"/> Save preferences</button></>}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-2 px-3.5 py-3"><div><p className="text-sm font-semibold">Elder Mode</p><p className="ny-hud mt-0.5 !text-[0.52rem]">Larger type, reduced motion, bigger touch targets</p></div><button type="button" role="switch" aria-checked={draft.elderMode} aria-label="Elder Mode" className="ac-switch" onClick={()=>set("elderMode",!draft.elderMode)}/></div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div><label className="ny-label" htmlFor="pf-cur">Display currency</label><select id="pf-cur" className="ny-select" value={draft.currency} onChange={e=>set("currency",e.target.value as "KES"|"USD"|"EUR")}>{["KES","USD","EUR"].map(c=><option key={c}>{c}</option>)}</select></div>
          <div><label className="ny-label" htmlFor="pf-lang">Language</label><select id="pf-lang" className="ny-select" value={draft.language} onChange={e=>set("language",e.target.value as "en"|"sw")}><option value="en">English</option><option value="sw">Kiswahili (mock)</option></select></div>
        </div>
        <div>
          <p className="ny-label">Communication channels</p>
          <div className="space-y-1.5">{(["whatsapp","sms","email","inApp"] as const).map(c=><div key={c} className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle bg-surface-1 px-3 py-2"><span className="text-sm font-medium capitalize">{c==="inApp"?"In-app":c.toUpperCase()}</span><button type="button" role="switch" aria-checked={draft.channels[c]} aria-label={`${c} channel`} className="ac-switch" onClick={()=>set("channels",{...draft.channels,[c]:!draft.channels[c]})}/></div>)}</div>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* M15 — Audit row detail                                                */
/* ------------------------------------------------------------------ */
export function AuditModal({ entry, onClose }: { entry: { ref: string; at: string; actor: string; action: string; entity: string; detail: string; tone: string }; onClose: () => void }) {
  return <Modal open onClose={onClose} title={`Audit · ${entry.action}`} sub={`${entry.ref} · ${entry.at}`} size="sm" footer={<button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>Close</button>}><dl className="divide-y divide-[color:var(--color-border-subtle)] rounded-xl border border-border-subtle text-sm">{[["Actor",entry.actor],["Entity",entry.entity],["Detail",entry.detail],["Time",`${entry.at} EAT`],["Integrity","Append-only · HMAC in Phase 2"]].map(([k,v])=><div key={k} className="flex items-start justify-between gap-3 px-3.5 py-2.5"><dt className="shrink-0 text-text-secondary">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl></Modal>;
}

/* ------------------------------------------------------------------ */
/* M16 — Confirmation after a gated action                                */
/* ------------------------------------------------------------------ */
export function DecisionModal({ data, onClose }: { data: { title: string; body: string; tone: "ok"|"warn" }; onClose: () => void }) {
  return <Modal open onClose={onClose} title={data.title} size="sm" tone={data.tone==="warn"?"danger":"gold"} footer={<button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={onClose}>Done</button>}><div className="rounded-xl border border-border-subtle bg-surface-2 p-4 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[rgba(212,164,55,0.2)]"><Check className="h-6 w-6 text-[#7a5b12]"/></span><p className="mt-3 text-sm leading-relaxed text-text-secondary">{data.body}</p></div><p className="ny-chip ny-chip-sim mt-3">SIMULATED · no credential changed until the admin queue approves</p></Modal>;
}
