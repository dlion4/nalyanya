import type { FamilyEvent } from "@/data/dashboard/events";

/** Every overlay on the Events page is addressed by ?act=… so back closes it and reload restores it. */
export type ActKind =
  | "create"
  | "edit"
  | "reschedule"
  | "cancel"
  | "rsvp"
  | "invite"
  | "reminders"
  | "cause"
  | "album"
  | "ics"
  | "album-view"
  | "checkin"
  | "upload"
  | "delete"
  | "share"
  | "venue"
  | "nudge";

export type Tone = "success" | "info" | "warning" | "danger";

export interface ToastInput {
  title: string;
  body?: string;
  tone?: Tone;
}

export type UrlPatch = Record<string, string | null | undefined>;

export interface EventsActions {
  openEvent: (id: string) => void;
  openAct: (act: ActKind, extra?: UrlPatch) => void;
  closeAct: () => void;
  closeDrawer: () => void;
  setParams: (patch: UrlPatch, mode?: "push" | "replace") => void;
  run: (job: () => Promise<FamilyEvent[]>, ok?: ToastInput, after?: (list: FamilyEvent[]) => void) => void;
  notify: (toast: ToastInput) => void;
  pending: boolean;
}

export interface EventsParams {
  q: string;
  kind: string;
  status: string;
  branch: string;
  month: string;
  cv: "month" | "week" | "agenda";
  day: string;
  year: string;
  event: string | null;
  act: ActKind | null;
  tab: string | null;
  venue: string | null;
  type: string | null;
  date: string | null;
}
