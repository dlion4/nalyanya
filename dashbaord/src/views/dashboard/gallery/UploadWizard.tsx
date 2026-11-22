"use client";

import { ArrowLeft, ArrowRight, CircleCheck, ImagePlus, UploadCloud, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { Avatar, SimulatedBadge } from "@/components/ui/Primitives";
import type { GalleryAlbum } from "@/data/dashboard/gallery";
import { EVENTS_SEED } from "@/data/dashboard/events";
import { MEMBERS } from "@/data/family/people";
import { CURRENT_USER_ID } from "@/data/dashboard/lineage";
import { cn } from "@/lib/format";
import { uploadPhotos } from "@/services/galleryService";
import { albumName } from "@/views/dashboard/gallery/galleryUi";
import type { GalleryActions } from "@/views/dashboard/gallery/types";

const STEPS = ["Choose photos", "Album", "Caption & people", "Review"] as const;
const MAX_FILES = 12;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

interface Pick {
  name: string;
  size: number;
}

/** S5 — Upload wizard: drag & drop → album → caption & tags → simulated progress. */
export function UploadWizard({ open, albums, actions }: { open: boolean; albums: GalleryAlbum[]; actions: GalleryActions }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [albumId, setAlbumId] = useState(albums[0]?.id ?? "");
  const [newAlbum, setNewAlbum] = useState("");
  const [caption, setCaption] = useState("");
  const [tagged, setTagged] = useState<string[]>([]);
  const [eventId, setEventId] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef(false);

  /* Start every wizard run from a clean slate. */
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setPicks([]);
    setAlbumId(albums[0]?.id ?? "");
    setNewAlbum("");
    setCaption("");
    setTagged([]);
    setEventId("");
    setError(null);
    setProgress(null);
    doneRef.current = false;
  }, [open, albums]);

  const addFiles = useCallback((files: FileList | File[]) => {
    setError(null);
    const list = Array.from(files);
    const accepted: Pick[] = [];
    for (const f of list) {
      const okType = f.type === "" || TYPES.includes(f.type);
      if (!okType) {
        setError(`“${f.name}” isn't a photo. Use JPG, PNG, WEBP or HEIC.`);
        continue;
      }
      if (f.size > 25 * 1024 * 1024) {
        setError(`“${f.name}” is larger than 25 MB. Choose a smaller copy.`);
        continue;
      }
      accepted.push({ name: f.name, size: f.size });
    }
    setPicks((prev) => {
      const room = Math.max(0, MAX_FILES - prev.length);
      if (accepted.length > room) setError(`Up to ${MAX_FILES} photos at a time. Only the first ${room} were added.`);
      return [...prev, ...accepted.slice(0, room)];
    });
  }, []);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const next = () => {
    if (step === 1 && picks.length === 0) return setError("Choose at least one photo to continue.");
    if (step === 2 && albumId === "new" && newAlbum.trim().length < 3) return setError("Name the new album (at least 3 letters).");
    setError(null);
    setStep((s) => (s + 1) as 1 | 2 | 3 | 4);
  };

  const totalMb = picks.reduce((s, p) => s + p.size, 0) / 1048576;

  const upload = async () => {
    if (doneRef.current) return;
    doneRef.current = true;
    /* Simulated progress: the real upload replaces this with an XHR/fetch observer. */
    setProgress(6);
    for (const mark of [28, 54, 79, 94]) {
      await new Promise<void>((r) => setTimeout(r, 240));
      setProgress(mark);
    }
    const targetAlbum = albumId === "new" ? "ALB-REUNION" : albumId;
    actions.run(
      async () => {
        const result = await uploadPhotos({ names: picks.map((p) => p.name), albumId: targetAlbum, caption, taggedIds: tagged, eventId: eventId || null, contributorId: CURRENT_USER_ID });
        return result.state;
      },
      {
        title: `${picks.length} photo${picks.length === 1 ? "" : "s"} uploaded`,
        body: `Added to ${albumId === "new" ? `“${newAlbum.trim()}” (saved into Reunions for now)` : albumName(targetAlbum)}. (SIMULATED)`,
        tone: "success",
      },
      () => actions.closeAct(),
    );
    setProgress(null);
  };

  const footer = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="text-xs font-semibold text-text-tertiary">
        Step {step} of 4 · {STEPS[step - 1]}
      </span>
      <div className="flex gap-2">
        {step > 1 ? (
          <button type="button" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)} className="ny-btn ny-btn-ghost ny-btn-sm">
            <ArrowLeft className="size-4" aria-hidden /> Back
          </button>
        ) : (
          <button type="button" onClick={actions.closeAct} className="ny-btn ny-btn-ghost ny-btn-sm">Cancel</button>
        )}
        {step < 4 ? (
          <button type="button" onClick={next} className="ny-btn ny-btn-primary ny-btn-sm">
            Continue <ArrowRight className="size-4" aria-hidden />
          </button>
        ) : (
          <button type="button" onClick={upload} disabled={progress !== null} className="ny-btn ny-btn-gold ny-btn-sm">
            <UploadCloud className="size-4" aria-hidden /> {progress !== null ? `Uploading ${progress}%` : `Upload ${picks.length} photo${picks.length === 1 ? "" : "s"}`}
          </button>
        )}
      </div>
    </div>
  );

  const taggables = MEMBERS.filter((m) => m.deathYear === undefined).slice(0, 40);
  const linkedEvents = EVENTS_SEED.filter((e) => e.status !== "cancelled");

  return (
    <ModalDialog open={open} onClose={actions.closeAct} size="lg" title="Upload photographs" description="Add phone photos to the family gallery. Uploads are simulated until storage is connected." footer={footer}>
      <div className="space-y-6">
        {/* Stepper */}
        <ol className="grid grid-cols-4 gap-2" aria-label="Upload steps">
          {STEPS.map((label, i) => {
            const n = (i + 1) as 1 | 2 | 3 | 4;
            const done = step > n;
            return (
              <li key={label} className={cn("rounded-2xl border p-2.5 text-center transition", step === n ? "border-brand-primary bg-brand-primary text-white" : done ? "border-brand-accent/60 bg-brand-accent-soft/50" : "border-hairline bg-surface-0/70 text-text-tertiary")}>
                <span className="mx-auto grid size-6 place-items-center rounded-full bg-white/20 text-xs font-bold">{done ? <CircleCheck className="size-3.5" aria-hidden /> : n}</span>
                <p className="mt-1 hidden truncate text-[11px] font-semibold sm:block">{label}</p>
              </li>
            );
          })}
        </ol>

        {error && (
          <p role="alert" className="rounded-xl bg-[#fbe5e5] p-3 text-sm text-danger">{error}</p>
        )}

        {/* STEP 1 — files */}
        {step === 1 && (
          <div className="space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={cn(
                "grid place-items-center gap-2 rounded-3xl border-2 border-dashed p-8 text-center transition",
                dragOver ? "border-brand-accent bg-brand-accent-soft/40" : "border-hairline bg-surface-0/70",
              )}
            >
              <ImagePlus className="size-9 text-brand-primary" aria-hidden />
              <p className="text-sm font-semibold text-text-primary">Drop photos here</p>
              <p className="text-xs text-text-tertiary">JPG, PNG, WEBP or HEIC · up to {MAX_FILES} at a time, 25 MB each</p>
              <button type="button" onClick={() => inputRef.current?.click()} className="ny-btn ny-btn-primary ny-btn-sm mt-1">
                Choose from this device
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                multiple
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>

            {picks.length > 0 && (
              <ul className="ny-scroll max-h-44 space-y-1.5 overflow-y-auto pr-1">
                {picks.map((p, i) => (
                  <li key={`${p.name}-${i}`} className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-surface-0/70 px-3 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <ImagePlus className="size-4 shrink-0 text-text-tertiary" aria-hidden />
                      <span className="truncate font-medium text-text-primary">{p.name}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 ny-num text-xs text-text-tertiary">
                      {(p.size / 1048576).toFixed(1)} MB
                      <button type="button" onClick={() => setPicks((prev) => prev.filter((_, j) => j !== i))} aria-label={`Remove ${p.name}`} className="grid size-6 place-items-center rounded-full hover:bg-surface-2">
                        <X className="size-3.5" aria-hidden />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* STEP 2 — album */}
        {step === 2 && (
          <div className="space-y-3">
            {albums.map((a) => (
              <label key={a.id} className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition", albumId === a.id ? "border-brand-primary bg-brand-primary/[0.06]" : "border-hairline bg-surface-0/60")}>
                <input type="radio" name="upload-album" checked={albumId === a.id} onChange={() => setAlbumId(a.id)} className="size-4 accent-brand-primary" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-text-primary">{a.name}</span>
                  <span className="block text-xs text-text-tertiary">{a.year} · {a.visibility.replace("-", " ")}</span>
                </span>
              </label>
            ))}
            <label className={cn("flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed p-3.5 transition", albumId === "new" ? "border-brand-primary bg-brand-primary/[0.06]" : "border-hairline")}>
              <input type="radio" name="upload-album" checked={albumId === "new"} onChange={() => setAlbumId("new")} className="size-4 accent-brand-primary" />
              <span className="min-w-0 flex-1 text-sm font-semibold text-text-primary">Create a new album</span>
            </label>
            {albumId === "new" && (
              <input value={newAlbum} onChange={(e) => setNewAlbum(e.target.value)} placeholder="New album name, e.g. Easter 2026" className="ny-input" aria-label="New album name" />
            )}
          </div>
        )}

        {/* STEP 3 — caption & people */}
        {step === 3 && (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Caption <span className="font-normal text-text-tertiary">(applies to every photo this time)</span></span>
              <textarea rows={2} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. The cousins at the Kimilili reunion" className="ny-input" />
            </label>
            <div>
              <p className="mb-1.5 text-sm font-semibold">People in these photos</p>
              <div className="flex flex-wrap gap-2">
                {taggables.map((m) => {
                  const on = tagged.includes(m.id);
                  return (
                    <button key={m.id} type="button" onClick={() => setTagged((prev) => (on ? prev.filter((x) => x !== m.id) : [...prev, m.id]))} aria-pressed={on} className={cn("ny-chip cursor-pointer", on && "ny-chip-solid")}>
                      <Avatar member={m} size={20} className="!rounded-full" />
                      {m.preferredName}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">From a gathering <span className="font-normal text-text-tertiary">(optional)</span></span>
              <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="ny-input">
                <option value="">Not from a gathering</option>
                {linkedEvents.map((e) => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* STEP 4 — review & progress */}
        {step === 4 && (
          <div className="space-y-4">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface-0/80 p-3.5 text-sm"><dt className="text-xs text-text-tertiary">Photos</dt><dd className="mt-0.5 font-semibold">{picks.length} · {totalMb.toFixed(1)} MB</dd></div>
              <div className="rounded-2xl bg-surface-0/80 p-3.5 text-sm"><dt className="text-xs text-text-tertiary">Album</dt><dd className="mt-0.5 font-semibold">{albumId === "new" ? `New: ${newAlbum.trim()}` : albumName(albumId)}</dd></div>
              <div className="rounded-2xl bg-surface-0/80 p-3.5 text-sm"><dt className="text-xs text-text-tertiary">Tagged</dt><dd className="mt-0.5 font-semibold">{tagged.length ? `${tagged.length} relative${tagged.length === 1 ? "" : "s"}` : "No one"}</dd></div>
              <div className="rounded-2xl bg-surface-0/80 p-3.5 text-sm"><dt className="text-xs text-text-tertiary">Gathering</dt><dd className="mt-0.5 font-semibold">{EVENTS_SEED.find((e) => e.id === eventId)?.title ?? "None"}</dd></div>
            </dl>

            {progress !== null && (
              <div className="space-y-1.5" role="status" aria-live="polite">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
                  <div className={cn("h-full rounded-full bg-brand-primary transition-[width] duration-300", actions.pending === false && progress >= 94 && "bg-success")} style={{ width: `${progress}%` }} />
                </div>
                <p className="ny-num text-xs text-text-secondary">Uploading… {progress}% (SIMULATED)</p>
              </div>
            )}

            <p className="rounded-2xl border border-dashed border-brand-secondary/50 p-3.5 text-xs leading-relaxed text-text-secondary">
              In this phase nothing leaves your device. The photos appear in the gallery from a local sample so you can see the finished result.
            </p>
            <SimulatedBadge label="Storage upload · SIMULATED" />
          </div>
        )}
      </div>
    </ModalDialog>
  );
}
