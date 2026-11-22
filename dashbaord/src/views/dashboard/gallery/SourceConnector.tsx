"use client";

import { Cloud, FolderInput, Unplug } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { Reveal } from "@/components/ui/motion";
import { SimulatedBadge } from "@/components/ui/Primitives";
import type { PhotoSource } from "@/data/dashboard/gallery";
import { cn } from "@/lib/format";
import { connectFolder, disconnectSource, syncSource, toggleSource } from "@/services/galleryService";
import { ago, SourceCount, SourceIcon, SyncChip } from "@/views/dashboard/gallery/galleryUi";
import type { GalleryActions } from "@/views/dashboard/gallery/types";

/** S2 — Where the photographs come from, with sync state and a Drive folder connector. */
export function SourceConnector({ sources, actions }: { sources: PhotoSource[]; actions: GalleryActions }) {
  return (
    <section id="sources" aria-labelledby="sources-heading" className="scroll-mt-24 space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="ny-eyebrow">S2 · Sources</p>
          <h2 id="sources-heading" className="ny-title mt-2 text-3xl sm:text-4xl">Where the photographs come from</h2>
          <p className="mt-2 max-w-2xl text-text-secondary">
            Google Drive keeps the originals. Relatives can also send photos by WhatsApp or upload them here. Syncing is simulated in this phase.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SimulatedBadge label="Drive connection · SIMULATED" />
          <button type="button" onClick={() => actions.openAct("connect")} className="ny-btn ny-btn-primary">
            <FolderInput className="size-4" aria-hidden />
            Connect a Drive folder
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {sources.map((source, index) => (
          <Reveal key={source.id} delay={index * 0.05}>
            <article className="ny-card ny-card-3d flex h-full flex-col gap-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                  <SourceIcon kind={source.kind} className="size-5" />
                </span>
                <SyncChip state={source.state} />
              </div>
              <div className="min-w-0">
                <h3 className="ny-title text-lg leading-snug">{source.label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-text-tertiary">{source.detail}</p>
                <p className="mt-2 text-xs text-text-tertiary">Owner: {source.owner}</p>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-hairline pt-3">
                <SourceCount source={source} />
                <span className="text-xs text-text-tertiary">Synced {ago(source.lastSyncMinutes)}</span>
              </div>

              <div className="mt-auto flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={source.state === "syncing" || actions.pending}
                  onClick={() => {
                    /* The service reports how many photos were new; keep that for the toast. */
                    let imported = 0;
                    actions.run(
                      async () => {
                        const result = await syncSource(source.id);
                        imported = result.imported;
                        return result.state;
                      },
                      {
                        title: imported > 0 ? `${imported} new photo${imported === 1 ? "" : "s"} synced` : "Sync complete",
                        body: imported > 0 ? `From ${source.label}. (SIMULATED)` : `Nothing new in ${source.label}. (SIMULATED)`,
                        tone: imported > 0 ? "success" : "info",
                      },
                    );
                  }}
                  className="ny-btn ny-btn-ghost ny-btn-sm"
                >
                  <Cloud className="size-3.5" aria-hidden />
                  Sync now
                </button>
                <button
                  type="button"
                  disabled={actions.pending}
                  onClick={() => actions.run(() => toggleSource(source.id, source.state !== "paused"))}
                  aria-pressed={source.state === "paused"}
                  className={cn("ny-btn ny-btn-sm", source.state === "paused" ? "ny-btn-gold" : "ny-btn-ghost")}
                >
                  {source.state === "paused" ? "Resume" : "Pause"}
                </button>
                {source.kind === "google-drive" && (
                  <button
                    type="button"
                    disabled={actions.pending}
                    onClick={() => actions.run(() => disconnectSource(source.id), { title: "Folder disconnected", body: "Photos already in the gallery were kept.", tone: "info" })}
                    className="ny-btn ny-btn-ghost ny-btn-sm text-danger"
                  >
                    <Unplug className="size-3.5" aria-hidden />
                    Unlink
                  </button>
                )}
              </div>
            </article>
          </Reveal>
        ))}

        {/* Contributor uploads explainer */}
        <Reveal delay={0.2}>
          <article className="ny-card flex h-full flex-col gap-3 border-dashed p-5">
            <span className="ny-eyebrow">Contributor uploads</span>
            <h3 className="ny-title text-lg leading-snug">Anyone can add a photo</h3>
            <p className="text-xs leading-relaxed text-text-secondary">
              Relatives who are not admins can upload into albums the whole family can see. Their photos wait for a quick admin check before they appear.
            </p>
            <button type="button" onClick={() => actions.openAct("upload")} className="ny-btn ny-btn-primary ny-btn-sm mt-auto w-fit">
              Add photos
            </button>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

const DRIVE_URL = /^https:\/\/(drive|docs)\.google\.com\//;

/** Connect-folder form: fully built, resolves to a "ready" badge. Never claims a real sync. */
export function ConnectFolderModal({ open, actions }: { open: boolean; actions: GalleryActions }) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!DRIVE_URL.test(url.trim())) {
      setError("Paste a link that starts with https://drive.google.com/ or https://docs.google.com/.");
      return;
    }
    if (label.trim().length < 3) {
      setError("Give the folder a short name the family will recognise.");
      return;
    }
    setError(null);
    actions.run(() => connectFolder(url.trim(), label.trim()), undefined, () => {
      actions.notify({
        title: "Folder connected (SIMULATED)",
        body: "Ready. The first real sync runs when the backend and Google Drive are wired.",
        tone: "info",
      });
      actions.closeAct();
      setUrl("");
      setLabel("");
    });
  };

  return (
    <ModalDialog
      open={open}
      onClose={actions.closeAct}
      size="md"
      title="Connect a Google Drive folder"
      description="The family keeps its originals in Drive. Connecting a folder queues a first sync."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SimulatedBadge label="Ready — connects when the backend is wired" />
          <div className="flex gap-2">
            <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Cancel</button>
            <button type="submit" form="connect-folder-form" disabled={actions.pending} className="ny-btn ny-btn-primary ny-btn-sm">
              {actions.pending ? "Connecting…" : "Connect folder"}
            </button>
          </div>
        </div>
      }
    >
      <form id="connect-folder-form" onSubmit={submit} className="space-y-4" noValidate>
        {error && (
          <p role="alert" className="rounded-xl bg-[#fbe5e5] p-3 text-sm text-danger">{error}</p>
        )}
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Drive folder link</span>
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            placeholder="https://drive.google.com/drive/folders/…"
            className="ny-input font-mono text-sm"
            autoComplete="off"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Name for this folder</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Reunion 2026 originals" className="ny-input" />
        </label>
        <p className="rounded-2xl border border-dashed border-brand-secondary/50 p-3.5 text-xs leading-relaxed text-text-secondary">
          Share the folder with the family service account first. In this phase nothing is read from Drive: the folder appears as
          &ldquo;Syncing&rdquo; with zero photos until the backend is connected.
        </p>
      </form>
    </ModalDialog>
  );
}
