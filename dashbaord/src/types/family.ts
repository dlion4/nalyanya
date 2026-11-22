/* Nalyanya domain types — frontend mock phase. Shapes mirror the future REST API. */

export type Gender = "male" | "female";
export type Channel = "WhatsApp" | "SMS" | "Email";

export interface Branch {
  id: string;
  name: string;
  shortName: string;
  county: string;
  founderId: string;
  color: string;
  tagline: string;
}

export interface LifeEvent {
  year: number;
  label: string;
}

export interface Member {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName: string;
  gender: Gender;
  generation: number;
  birthYear: number;
  deathYear?: number;
  branchId: string;
  parentId: string | null;
  spouseId: string | null;
  role: string;
  adopted?: boolean;
  ward?: boolean;
  homeTown: string;
  county: string;
  profession: string;
  employer?: string;
  phone?: string;
  email?: string;
  whatsapp: boolean;
  preferredChannel: Channel;
  bio: string;
  photo?: string;
  walletKes: number;
  saccoShares: number;
  activeLoans: number;
  contributionsKes: number;
  lifeEvents: LifeEvent[];
}

/** A second position the same person holds in another branch (father here, guardian there). */
export interface Presence {
  id: string;
  memberId: string;
  branchId: string;
  role: string;
  generation: number;
}

export type AuditAction =
  | "member.added"
  | "member.edited"
  | "member.deceased"
  | "relation.added"
  | "branch.created"
  | "edit.requested";

export type AuditStatus = "applied" | "pending" | "rejected";

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: AuditAction;
  entity: string;
  summary: string;
  before: string;
  after: string;
  reason: string;
  status: AuditStatus;
}
