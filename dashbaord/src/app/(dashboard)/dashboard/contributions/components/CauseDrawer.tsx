import { useCallback, useState } from "react";
import { ArrowLeft, Eye, MessageSquare } from "lucide-react";
import { MemorialTabs } from "@/app/(dashboard)/dashboard/obituaries/components/PinholeStage";
import { useWorkspace } from "@/state/Workspace";
import {
  type Cause,
  type Contribution,
  type Payout,
  CONTRIBUTIONS,
  PAYOUTS,
  AUDIT,
} from "@/data/dashboard/contributions";
import { kes } from "@/lib/format";

/* ═══════════════════════════════════════════════════════════════════════
   S5 · CAUSE DETAIL DRAWER — tabs: Overview · Contributors · Payouts · Comms · Audit
   ═══════════════════════════════════════════════════════════════════════ */

interface CauseDrawerProps {
  cause: Cause | null;
  onClose: () => void;
  onContribute: (cause: Cause) => void;
  calm: boolean;
}

export function CauseDrawer({
  cause,
  onClose,
  onContribute,
  calm,
}: CauseDrawerProps) {
  const w = useWorkspace();
  const [tab, setTab] = useState<"overview" | "contributors" | "payouts" | "comms" | "audit">("overview");

  const contributorList = cause ? CONTRIBUTIONS.filter((c) => c.causeId === cause.id) : [];
  const payoutList = cause ? PAYOUTS.filter((p) => p.causeId === cause.id) : [];
  const auditList = cause ? AUDIT.filter((a) => a.causeId === cause.id) : [];

  const progress = cause ? Math.min(100, Math.round((cause.raised / cause.goal) * 100)) : 0;
  const pctStyle = { "--pct": `${progress}deg` } as React.CSSProperties;

  const items = [
    { id: "overview", label: "Overview", count: 1 },
    { id: "contributors", label: "Contributors", count: contributorList.length },
    { id: "payouts", label: "Payouts", count: payoutList.length },
    { id: "comms", label: "Comms", count: 0 },
    { id: "audit", label: "Audit", count: auditList.length },
  ];

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!cause) return null;

  const payoutStatusClass = (s: Payout["status"]) => {
    if (s === "released") return "is-confirmed";
    if (s === "queued") return "is-pending";
    return "is-failed";
  };

  const channelLabel = (ch: string) => {
    if (ch === "mpesa") return "M-Pesa";
    if (ch === "bank") return "Bank";
    if (ch === "airtel") return "Airtel Money";
    return "Family ledger";
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="cause-drawer-title">
      <div
        className="fixed inset-0 bg-brand-deep/40 backdrop-blur-sm transition duration-300 ease-out"
        onClick={close}
        style={{ pointerEvents: "auto" }}
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-start justify-end p-4 sm:p-8">
          <div
            className="flex w-full max-w-2xl flex-col bg-surface-1 shadow-lift rounded-l-[28px]"
            style={{
              transform: "translateX(0)",
              opacity: 1,
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-hairline p-5 sm:p-6">
              <div className="min-w-0 flex items-center gap-3">
                <ArrowLeft size={16} className="text-text-tertiary hover:text-give-ink cursor-pointer" onClick={close} />
                <h2 className="ny-title text-2xl" id="cause-drawer-title">
                  {cause.title}
                </h2>
              </div>
              <button type="button" onClick={close} aria-label="Close" className="ny-btn ny-btn-ghost ny-btn-sm size-10 shrink-0 p-0">
                <span aria-hidden>✕</span>
              </button>
            </header>

            <div className="ny-scroll min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <MemorialTabs items={items as any} value={tab} onChange={(id) => setTab(id as any)} />

              <div className="ny-give-panel" role="tabpanel">
                {tab === "overview" && (
                  <div className="space-y-6">
                    <div className="ny-give-overview">
                      <div className="relative">
                        <div className="ny-give-progress-ring" style={pctStyle}>
                          <div className="ny-give-progress-ring-text">
                            {progress}%
                            <small>of goal</small>
                          </div>
                        </div>
                        <div className="absolute -inset-1 rounded-full bg-[conic-gradient(var(--give-accent)_0deg,var(--give-accent)_var(--pct),transparent_var(--pct))] mask-[radial-gradient(transparent_64%,#000_66%)]" />
                      </div>
                      <div className="ny-give-cause-details">
                        <h3>{cause.title}</h3>
                        <p>{cause.description}</p>
                        <div className="space-y-3 mt-4">
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Purpose</span>
                            <span className="text-text-primary">{cause.purposeLabel}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Beneficiary</span>
                            <span className="text-text-primary">
                              {cause.beneficiaryAnonymized ? "Anonymized (sensitive)" : cause.beneficiary}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Deadline</span>
                            <span className="text-text-primary">{cause.deadline}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Payout destination</span>
                            <span className="text-text-primary font-mono text-xs">{cause.payoutDestination}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-text-secondary">Payout status</span>
                            <span className={`text-text-primary font-medium ${cause.payoutStatus === "released" ? "text-green-600" : cause.payoutStatus === "queued" ? "text-amber-600" : "text-rose-600"}`}>
                              {cause.payoutStatus}
                            </span>
                          </div>
                        </div>
                        <div className="mt-6 flex gap-3">
                          <button type="button" className="ny-btn ny-btn-primary flex-1" onClick={() => onContribute(cause)}>
                            <Eye size={14} aria-hidden />
                            Contribute
                          </button>
                          <button type="button" className="ny-btn ny-btn-ghost" onClick={() => w.setToast("Broadcast to contributors — connects to T-14 when wired.")}>
                            <MessageSquare size={14} aria-hidden />
                            Comms
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-hairline pt-6">
                      <h3 className="ny-give-subhead">Cause story</h3>
                      <p className="ny-give-section-intro">{cause.description}</p>
                    </div>
                  </div>
                )}

                {tab === "contributors" && (
                  <div className="space-y-4">
                    {contributorList.length === 0 ? (
                      <p className="text-text-tertiary text-center py-8">No contributors yet.</p>
                    ) : (
                      contributorList.map((c) => (
                        <div key={c.id} className="ny-give-contributor">
                          <div className="ny-give-contributor-avatar">
                            {c.memberImage ? <img src={c.memberImage} alt={c.member} /> : c.member.charAt(0)}
                          </div>
                          <div>
                            <div className="ny-give-contributor-name">{c.member}</div>
                            <div className="ny-give-contributor-message">{c.message ?? "—"}</div>
                            <div className="ny-give-contributor-channel">
                              <span aria-hidden>{c.channel === "mpesa" ? "📱" : c.channel === "airtel" ? "📱" : c.channel === "bank" ? "🏦" : "📒"}</span>{" "}
                              {channelLabel(c.channel)}
                            </div>
                          </div>
                          <div className="ny-give-contributor-amount">{kes(c.amount)}</div>
                          <span className={`ny-give-status-chip is-${c.status}`}>{c.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {tab === "payouts" && (
                  <div className="space-y-4">
                    {payoutList.length === 0 ? (
                      <p className="text-text-tertiary text-center py-8">No payouts yet.</p>
                    ) : (
                      payoutList.map((p) => (
                        <div key={p.id} className="ny-give-payout">
                          <div>
                            <div className="ny-give-payout-recipient">{p.recipient}</div>
                            <div className="text-xs text-text-tertiary">{new Date(p.requestedAt).toLocaleDateString("en-GB")}</div>
                          </div>
                          <div className="ny-give-payout-amount">{kes(p.amount)}</div>
                          <span className="ny-give-channel-chip" style={{ fontSize: "0.68rem" }}>
                            <span aria-hidden>{p.channel === "mpesa" ? "📱" : p.channel === "bank" ? "🏦" : "📒"}</span>{" "}
                            {channelLabel(p.channel)}
                          </span>
                          <span className={`ny-give-status-chip is-${payoutStatusClass(p.status)}`}>{p.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {tab === "comms" && (
                  <div className="space-y-4">
                    <div className="ny-give-simnote">
                      <MessageSquare size={14} aria-hidden />
                      Broadcast to all {contributorList.length} contributors of this cause.
                      <br />
                      Ready — connects when the T-14 broadcast backend is wired.
                    </div>
                    <div className="space-y-3">
                      <button type="button" className="ny-btn ny-btn-ghost w-full" onClick={() => w.setToast("SMS broadcast prepared — SIMULATED, not sent.")}>
                        <span aria-hidden>📱</span> SMS to contributors
                      </button>
                      <button type="button" className="ny-btn ny-btn-ghost w-full" onClick={() => w.setToast("WhatsApp broadcast prepared — SIMULATED, not sent.")}>
                        <span aria-hidden>💬</span> WhatsApp to contributors
                      </button>
                    </div>
                  </div>
                )}

                {tab === "audit" && (
                  <div className="space-y-4">
                    {auditList.length === 0 ? (
                      <p className="text-text-tertiary text-center py-8">No audit entries yet.</p>
                    ) : (
                      auditList.map((a) => {
                        const amountText = a.amount !== undefined ? ` · ${kes(a.amount)}` : "";
                        return (
                          <div key={a.id} className="ny-give-audit">
                            <div className="ny-give-audit-dot" aria-hidden />
                            <div>
                              <div className="ny-give-audit-head">
                                <span className="font-medium text-text-primary">{a.action.replace("_", " ")}</span>
                                <span className="text-xs text-text-tertiary">{new Date(a.at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                              </div>
                              <div className="ny-give-audit-detail">
                                <span className="font-medium">{a.actor}</span> — {a.detail}{amountText}
                              </div>
                              <div className="ny-give-audit-time">{a.at.slice(11, 16)}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            <footer className="border-t border-hairline bg-surface-0/70 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-text-tertiary">
                  {cause.contributors} contributors · {kes(cause.raised)} of {kes(cause.goal)}
                </span>
                <div className="flex items-center gap-3">
                  <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={close}>
                    <span aria-hidden>✕</span> Close
                  </button>
                  <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={() => onContribute(cause)}>
                    <Eye size={14} aria-hidden />
                    Contribute
                  </button>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
