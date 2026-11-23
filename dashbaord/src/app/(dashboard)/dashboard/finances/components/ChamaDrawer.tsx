import { useCallback, useState } from "react";
import { ArrowRight, ChevronLeft, Eye, Plus, ScrollText, ShieldCheck, Users, Wallet } from "lucide-react";
import { MemorialTabs, MemorialTabPanel } from "@/app/(dashboard)/dashboard/obituaries/components/PinholeStage";
import { useWorkspace } from "@/state/Workspace";
import { CHAMAS, chamaById, type Chama } from "@/data/dashboard/finances";
import { kes } from "@/lib/format";

/* ══════════════════════════════════════════════════════════════════════
   S5 · CHAMA DETAIL DRAWER — tabs: Overview · Members · Payouts · Rules · Audit
   ══════════════════════════════════════════════════════════════════════ */

interface ChamaDrawerProps {
  chama: Chama;
  onClose: () => void;
  onDeposit: (chama: Chama) => void;
  calm: boolean;
}

export function ChamaDrawer({ chama, onClose, onDeposit, calm }: ChamaDrawerProps) {
  const w = useWorkspace();
  const [tab, setTab] = useState("overview");

  const members = chama.members;
  const positionPct = Math.round((chama.position / chama.of) * 100);
  const remaining = chama.of - chama.position;

  const deposit = useCallback(() => {
    onDeposit(chama);
    w.setToast(`Deposit of KES ${chama.contributionKes.toLocaleString("en-KE")} to ${chama.name} — SIMULATED.`);
    onClose();
  }, [chama, onDeposit, w, onClose]);

  return (
    <div className="ny-fin-drawer-wrap">
      <div className="ny-fin-drawer-header">
        <button type="button" onClick={onClose} aria-label="Close" className="ny-btn ny-btn-ghost ny-btn-sm size-10 shrink-0 p-0">
          <ChevronLeft size={16} className="-rotate-90" aria-hidden />
        </button>
        <div className="flex-1">
          <h2 className="font-display font-semibold text-text-primary text-lg">{chama.name}</h2>
          <p className="text-text-secondary text-sm">{chama.purpose}</p>
        </div>
        <span className={`ny-fin-chip ${chama.status === 'active' ? 'is-active' : 'is-paused'}`}>
          {chama.status === 'active' ? 'Active' : 'Paused'}
        </span>
      </div>

      <div className="ny-fin-drawer-body">
        <MemorialTabs
          items={[
            { id: "overview", label: "Overview", count: members },
            { id: "members", label: "Members", count: members },
            { id: "payouts", label: "Payouts" },
            { id: "rules", label: "Rules" },
            { id: "audit", label: "Audit" },
          ]}
          value={tab}
          onChange={setTab}
          className="mb-6"
        />

        <MemorialTabPanel id="overview" active={tab}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface-0/30 rounded-xl p-4 border border-hairline">
              <div className="text-xs text-text-tertiary uppercase tracking-wider mb-1">Rotation position</div>
              <div className="text-2xl font-bold text-text-primary">{chama.position} of {chama.of}</div>
              <div className="w-full bg-surface-1 h-2 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-give-accent" style={{ width: `${positionPct}%` }} />
              </div>
              <div className="text-xs text-text-tertiary mt-1">{remaining} positions remaining</div>
            </div>
            <div className="bg-surface-0/30 rounded-xl p-4 border border-hairline">
              <div className="text-xs text-text-tertiary uppercase tracking-wider mb-1">Next payout</div>
              <div className="text-xl font-bold text-text-primary">{chama.nextPayout}</div>
              <div className="text-xs text-text-tertiary mt-1">To {chama.recipient}</div>
            </div>
            <div className="bg-surface-0/30 rounded-xl p-4 border border-hairline">
              <div className="text-xs text-text-tertiary uppercase tracking-wider mb-1">Pool</div>
              <div className="text-xl font-bold text-text-primary is-gold font-mono">{kes(chama.pool)}</div>
              <div className="text-xs text-text-tertiary mt-1">{chama.cadence} • {chama.members} members</div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface-0/30 rounded-xl p-5 border border-hairline">
              <h3 className="font-medium text-text-primary mb-3">About this chama</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {chama.purpose}
              </p>
              <div className="mt-4 flex items-center gap-8">
                <span className="text-xs text-text-tertiary font-mono">Contribution per member</span>
                <b className="text-text-primary font-mono">{kes(chama.contributionKes)}</b>
                <span className="text-xs text-text-tertiary font-mono">per {chama.cadence.toLowerCase()}</span>
              </div>
            </div>

            <div className="bg-surface-0/30 rounded-xl p-5 border border-hairline">
              <h3 className="font-medium text-text-primary mb-3">Featured photographs</h3>
              <div className="grid grid-cols-2 gap-3">
                {chama.gallery.map((img) => (
                  <div key={img.id} className="aspect-square rounded-lg overflow-hidden border border-hairline bg-surface-1 relative group">
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/images/family/reunion.jpg"; }}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Eye size={14} className="text-[#fdfbf5]" aria-hidden />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="text-xs text-[#fdfbf5] font-medium">{img.caption}</div>
                      <div className="text-[10px] text-[#fdfbf5]/70">{img.year} · {img.credit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MemorialTabPanel>

        <MemorialTabPanel id="members" active={tab}>
          <div className="space-y-3">
            {[
              { name: "Peter Otieno Nalyanya", role: "Current recipient", joined: "Jan 2024", image: "/images/family/peter.jpg" },
              { name: "Grace Adhiambo Nalyanya", role: "Previous recipient", joined: "Mar 2024", image: "/images/family/grace.jpg" },
              { name: "Samuel Kipkoech Nalyanya", role: "Treasurer", joined: "Jun 2023", image: "/images/family/samuel.jpg" },
              { name: "Joseph Wafula Nalyanya", role: "Secretary", joined: "Jan 2023", image: "/images/family/joseph.jpg" },
            ].map((m, i) => (
              <div key={m.name} className="flex items-center gap-8 px-3 py-3 rounded-lg border border-hairline bg-surface-0/30">
                <img src={m.image} alt={m.name} className="w-8 h-8 rounded-full object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).src = "/images/family/reunion.jpg"; }} />
                <div className="flex-1">
                  <div className="font-medium text-text-primary">{m.name}</div>
                  <div className="text-xs text-text-secondary">{m.role}</div>
                </div>
                <div className="text-xs text-text-tertiary font-mono">{m.joined}</div>
                <button type="button" className="text-text-tertiary hover:text-text-primary transition" onClick={() => w.setToast(`Messaging ${m.name} — SIMULATED.`)} aria-label={`Message ${m.name}`}>
                  <ScrollText size={12} aria-hidden />
                </button>
              </div>
            ))}
          </div>
        </MemorialTabPanel>

        <MemorialTabPanel id="payouts" active={tab}>
          <div className="space-y-3">
            {[
              { date: "Wed 13 May", member: "Peter Otieno Nalyanya", amount: "480,000", status: "upcoming" },
              { date: "Mon 29 Apr", member: "Naomi Achieng Nalyanya", amount: "480,000", status: "paid" },
              { date: "Mon 15 Apr", member: "Caleb Kiprono Nalyanya", amount: "480,000", status: "paid" },
            ].map((p) => (
              <div key={p.date} className="flex items-center justify-between px-3 py-3 rounded-lg border border-hairline bg-surface-0/30">
                <div>
                  <div className="font-medium text-text-primary">{p.member}</div>
                  <div className="text-xs text-text-secondary">{p.date}</div>
                </div>
                <div className="text-right">
                  <div className={`font-medium font-mono ${p.status === 'upcoming' ? 'text-text-primary' : 'text-green-600'}`}>
                    {p.status === 'upcoming' ? '+' : ''}KES {p.amount}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider {p.status === 'upcoming' ? 'text-amber-400' : 'text-green-600'}">
                    {p.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </MemorialTabPanel>

        <MemorialTabPanel id="rules" active={tab}>
          <div className="space-y-4">
            {[
              { title: "Rotation order", body: "Positions are drawn at chama formation and cannot be changed mid-cycle." },
              { title: "Contribution deadline", body: "Contributions are due 2 days before each payout date. Late contributions incur a 5% fee." },
              { title: "Payout method", body: "Payouts are disbursed via M-Pesa to the registered recipient number." },
              { title: "Exit clause", body: "A member may exit after completing one full rotation, subject to committee approval." },
            ].map((r) => (
              <div key={r.title} className="p-4 rounded-xl border border-hairline bg-surface-0/30">
                <div className="font-medium text-text-primary mb-1">{r.title}</div>
                <div className="text-sm text-text-secondary">{r.body}</div>
              </div>
            ))}
          </div>
        </MemorialTabPanel>

        <MemorialTabPanel id="audit" active={tab}>
          <div className="space-y-3">
            {[
              { date: "2 min ago", actor: "System", action: "Rotation position confirmed", ref: "NY-AUD-001" },
              { date: "1 h ago", actor: "Peter Otieno", action: "Contribution of KES 40,000 recorded", ref: "NY-AUD-002" },
              { date: "3 h ago", actor: "Committee", action: "Payout approved for position 4", ref: "NY-AUD-003" },
              { date: "1 day ago", actor: "System", action: "Chama rules updated", ref: "NY-AUD-004" },
            ].map((a) => (
              <div key={a.ref} className="flex items-start justify-between px-3 py-3 rounded-lg border border-hairline bg-surface-0/30">
                <div className="flex-1">
                  <div className="font-medium text-text-primary">{a.action}</div>
                  <div className="text-xs text-text-secondary">{a.actor} • {a.date}</div>
                </div>
                <div className="text-[10px] text-text-tertiary font-mono">{a.ref}</div>
              </div>
            ))}
          </div>
        </MemorialTabPanel>
      </div>

      <div className="ny-fin-drawer-footer">
        <div className="flex items-center justify-between gap-4">
          <button type="button" className="ny-btn ny-btn-ghost ny-btn-sm" onClick={onClose}>
            Close
          </button>
          <button type="button" className="ny-btn ny-btn-primary ny-btn-sm" onClick={deposit}>
            <Plus size={14} aria-hidden />
            Deposit KES {kes(chama.contributionKes).replace("KES ", "")}
          </button>
        </div>
        <p className="text-[11px] text-text-tertiary mt-2">
          Deposits are SIMULATED — connect when the backend is wired.
        </p>
      </div>
    </div>
  );
}
