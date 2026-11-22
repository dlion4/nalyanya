export type Branch = {
  id: string;
  name: string;
  members: number;
  balance: number;
  growth: number;
  color: string;
};
export type Member = {
  id: string;
  name: string;
  short: string;
  branch: string;
  generation: number;
  profession: string;
  bio: string;
  image?: string;
};
export type FamilyEvent = {
  id: string;
  title: string;
  date: string;
  place: string;
  host: string;
  type: string;
  branch: string;
  attending: number;
  image: string;
  description: string;
};
export type Memory = {
  id: string;
  title: string;
  image: string;
  alt: string;
  caption: string;
  place: string;
  year: string;
  credit: string;
};
export type Contribution = {
  id: string;
  member: string;
  purpose: string;
  amount: number;
  time: string;
  status: "Recorded" | "Pending" | "Simulated";
  branch: string;
};
export type Alert = {
  id: string;
  title: string;
  text: string;
  kind: "contribution" | "chama" | "loan" | "allocation" | "event";
  time: string;
  critical?: boolean;
};
export type Workflow =
  | "deposit"
  | "withdraw"
  | "transfer"
  | "contribute"
  | "allocate"
  | "broadcast"
  | "event-create"
  | "drive"
  | "sms"
  | "whatsapp";
export type Panel =
  | Workflow
  | "actions"
  | "search"
  | "family"
  | "notifications"
  | "profile"
  | "wallet"
  | "members"
  | "contributions"
  | "events"
  | "event"
  | "memory"
  | "member"
  | "contribution"
  | "health"
  | "branch"
  | "chama"
  | "loan"
  | "allocation"
  | "alert"
  | "cause"
  | "shares"
  | "calendar"
  | "about"
  | "receipt";
export type LedgerEntry = {
  id: string;
  kind: Workflow;
  title: string;
  amount: number;
  delta: number;
  date: string;
  branch: string;
  member?: string;
  purpose?: string;
  note?: string;
};
export type SavedWorkspace = {
  elder: boolean;
  rsvps: Record<string, string>;
  read: string[];
  dismissed: string[];
  saved: string[];
  entries: LedgerEntry[];
  events: FamilyEvent[];
};
export type PageConfig = {
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  action: string;
  panel: Panel;
  layout:
    | "people"
    | "tree"
    | "events"
    | "memories"
    | "money"
    | "records"
    | "settings"
    | "messages"
    | "causes"
    | "remembrance"
    | "profile";
};
