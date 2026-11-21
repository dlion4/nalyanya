/* ── Family / lineage chooser — the defining step of A-1 and A-2 ─────────────
   Searchable, keyboard-navigable (combobox pattern). Selecting a family lets
   the member pick one primary branch. If their family isn't listed, they can
   start the create-family wizard instead.                                    */

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Check, Plus, Search, Users, X } from "lucide-react";
import { Link } from "react-router-dom";
import { FAMILIES, type Family } from "../../data/auth/families";
import { cn } from "../../utils/cn";

interface Props {
  chosen: Family | null;
  branch: string | null;
  onFamily: (f: Family | null) => void;
  onBranch: (id: string | null) => void;
  createTo?: string;
  autoFocus?: boolean;
}

export default function FamilyChooser({ chosen, branch, onFamily, onBranch, createTo = "/auth/create-family", autoFocus = true }: Props) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAMILIES;
    return FAMILIES.filter((f) => [f.name, f.root, f.tagline, f.members.toString()].join(" ").toLowerCase().includes(q));
  }, [query]);

  useEffect(() => { setHighlight(0); }, [results.length, query]);

  const choose = (f: Family | null) => {
    onFamily(f);
    onBranch(null);
    setOpen(false);
    setQuery("");
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && results.length) { e.preventDefault(); setOpen(true); setHighlight((h) => (h + 1) % results.length); }
    else if (e.key === "ArrowUp" && results.length) { e.preventDefault(); setHighlight((h) => (h - 1 + results.length) % results.length); }
    else if (e.key === "Enter" && open && results[highlight]) { e.preventDefault(); choose(results[highlight]); }
    else if (e.key === "Escape") { setOpen(false); setQuery(""); }
  };

  if (chosen) {
    return (
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-text-primary">Your family</legend>
        <div className="auth-family is-chosen">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-primary font-display text-xl font-semibold text-brand-accent" aria-hidden="true">
            {chosen.name.charAt(0)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg font-semibold text-text-primary">{chosen.name}</span>
            <span className="block truncate text-xs font-medium text-text-secondary">Root: {chosen.root}</span>
            <span className="ny-num mt-1 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-text-tertiary">
              <Users className="size-3.5" aria-hidden="true" />{chosen.members}+ members · {chosen.branches.length} branches
            </span>
          </span>
          <button type="button" onClick={() => choose(null)} aria-label="Change family" className="ny-touch shrink-0 rounded-pill border border-surface-3 px-3.5 py-2 text-xs font-bold text-brand-primary hover:border-brand-primary/40 hover:bg-brand-primary-tint">
            Change
          </button>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold text-text-secondary">Your primary branch <span className="font-normal text-text-tertiary">(you can join more later)</span></legend>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Choose your primary branch">
            {chosen.branches.map((b) => (
              <button key={b.id} type="button" role="radio" aria-checked={branch === b.id} onClick={() => onBranch(branch === b.id ? null : b.id)}
                className={cn("ny-chip ny-touch transition-transform", branch === b.id ? "border-brand-primary bg-brand-primary text-surface-0 scale-[1.03]" : "hover:border-brand-primary/40")}>
                {branch === b.id && <Check className="size-3.5" aria-hidden="true" />}
                {chosen.name} — {b.name}
              </button>
            ))}
          </div>
        </fieldset>
      </fieldset>
    );
  }

  return (
    <fieldset
      className="space-y-2"
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false); }}
    >
      <legend className="text-sm font-semibold text-text-primary">Find your family</legend>
      <label htmlFor={`${listId}-q`} className="sr-only">Search families — e.g. Nalyanya, Wakoli, Barasa…</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          id={`${listId}-q`}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls={`${listId}-list`}
          aria-activedescendant={open && results[highlight] ? `${listId}-opt-${results[highlight].id}` : undefined}
          placeholder="e.g. Nalyanya, Wakoli, Barasa…"
          className="auth-input auth-input--flush pl-12 pr-11"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }} aria-label="Clear search"
            className="ny-touch absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-pill text-text-tertiary hover:bg-surface-2">
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* result list */}
      {open && (
        <ul id={`${listId}-list`} role="listbox" aria-label="Families on Nalyanya" className="max-h-56 space-y-2 overflow-y-auto overscroll-contain rounded-2xl border border-surface-3 bg-surface-1 p-2 shadow-lift">
          {results.length === 0 && (
            <li className="rounded-xl border border-dashed border-surface-3 p-4 text-center text-sm text-text-secondary">
              No family matches “{query.trim()}”.
              <Link to={`${createTo}${query.trim() ? `?seed=${encodeURIComponent(query.trim())}` : ""}`} className="mt-2 flex items-center justify-center gap-1.5 font-bold text-brand-primary hover:underline">
                <Plus className="size-4" aria-hidden="true" /> Create “{query.trim() || "my family"}” →
              </Link>
            </li>
          )}
          {results.map((f, i) => (
            <li key={f.id} id={`${listId}-opt-${f.id}`} role="option" aria-selected={i === highlight}>
              <button type="button" onClick={() => choose(f)} onPointerEnter={() => setHighlight(i)}
                className={cn("auth-family !border-0 bg-transparent shadow-none hover:translate-y-0 hover:border-transparent hover:bg-brand-primary-tint/60 hover:shadow-none", i === highlight && "bg-brand-primary-tint")}>
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-primary font-display text-lg font-semibold text-brand-accent" aria-hidden="true">{f.name.charAt(0)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-semibold text-text-primary">{f.name}</span>
                  <span className="block truncate text-[11px] font-medium text-text-secondary">Root: {f.root}</span>
                  <span className="ny-num mt-0.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-text-tertiary">{f.members}+ members · {f.tagline}</span>
                </span>
                <span className="shrink-0 rounded-pill bg-brand-accent px-3 py-2 text-[11px] font-bold text-brand-primary-deep">This is mine</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Link to={`${createTo}${query.trim() ? `?seed=${encodeURIComponent(query.trim())}` : ""}`} className="inline-flex items-center gap-1.5 px-1 py-1 text-sm font-bold text-brand-secondary hover:underline">
        + My family isn't here yet — create it →
      </Link>
    </fieldset>
  );
}
