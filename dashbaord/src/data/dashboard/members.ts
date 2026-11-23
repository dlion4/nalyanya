import type { PageConfig } from "@/types/workspace";

/* T-3 Members Directory — dedicated page data (mock, deterministic, Kenyan family records). */

export type FamilyRole =
  | "Family Head"
  | "Co-Admin / Elder"
  | "Finance Officer"
  | "Member"
  | "Ward / Minor"
  | "Viewer";

export interface RoleDefinition {
  role: FamilyRole;
  badgeTone: "solid" | "gold" | "violet" | "info" | "warning" | "neutral";
  accent: string;
  summary: string;
  scope: string;
  canEditMembers: boolean;
  canApproveRequests: boolean;
  canAssignRoles: boolean;
  canSendReceiveLinks: boolean;
  canViewPhones: boolean;
  canRemoveMembers: boolean;
}

export const FAMILY_ROLES: RoleDefinition[] = [
  {
    role: "Family Head",
    badgeTone: "solid",
    accent: "#1F4D3A",
    summary: "All permissions across all twelve branches — lineage edits, RBAC matrix, payouts and approvals.",
    scope: "All 12 branches",
    canEditMembers: true,
    canApproveRequests: true,
    canAssignRoles: true,
    canSendReceiveLinks: true,
    canViewPhones: true,
    canRemoveMembers: true,
  },
  {
    role: "Co-Admin / Elder",
    badgeTone: "gold",
    accent: "#D4A437",
    summary: "Branch elders and council stewards. Approves member requests, adds children and issues elder links.",
    scope: "Assigned branch(es)",
    canEditMembers: true,
    canApproveRequests: true,
    canAssignRoles: false,
    canSendReceiveLinks: true,
    canViewPhones: true,
    canRemoveMembers: false,
  },
  {
    role: "Finance Officer",
    badgeTone: "violet",
    accent: "#6A4C93",
    summary: "Manages Sacco shares, allocations, loan approvals and M-Pesa payouts. Cannot edit RBAC or remove members.",
    scope: "Finance & ledger",
    canEditMembers: false,
    canApproveRequests: false,
    canAssignRoles: false,
    canSendReceiveLinks: true,
    canViewPhones: true,
    canRemoveMembers: false,
  },
  {
    role: "Member",
    badgeTone: "info",
    accent: "#3A7CA5",
    summary: "Views the family tree, contributes, applies for Sacco loans, RSVPs and suggests profile edits for approval.",
    scope: "Own profile + family view",
    canEditMembers: false,
    canApproveRequests: false,
    canAssignRoles: false,
    canSendReceiveLinks: false,
    canViewPhones: false,
    canRemoveMembers: false,
  },
  {
    role: "Ward / Minor",
    badgeTone: "warning",
    accent: "#E0764A",
    summary: "Children under 18 managed by a legal guardian. View-only profile with school-fees tracking.",
    scope: "Guardian-managed",
    canEditMembers: false,
    canApproveRequests: false,
    canAssignRoles: false,
    canSendReceiveLinks: false,
    canViewPhones: false,
    canRemoveMembers: false,
  },
  {
    role: "Viewer",
    badgeTone: "neutral",
    accent: "#5A6B57",
    summary: "Read-only access for extended relatives, diaspora friends or in-laws invited to watch reunions.",
    scope: "Read-only",
    canEditMembers: false,
    canApproveRequests: false,
    canAssignRoles: false,
    canSendReceiveLinks: false,
    canViewPhones: false,
    canRemoveMembers: false,
  },
];

export const INITIAL_ROLE_MAP: Record<string, FamilyRole> = {
  "NY-MBR-00019": "Family Head",
  "NY-MBR-00001": "Co-Admin / Elder",
  "NY-MBR-00003": "Co-Admin / Elder",
  "NY-MBR-00005": "Co-Admin / Elder",
  "NY-MBR-00009": "Co-Admin / Elder",
  "NY-MBR-00006": "Finance Officer",
  "NY-MBR-00016": "Finance Officer",
  "NY-MBR-00015": "Finance Officer",
  "NY-MBR-00014": "Viewer",
  "NY-MBR-00022": "Ward / Minor",
};

export type RequestCategory = "relation" | "branch" | "profile" | "money-routing" | "guardian";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface MemberRequest {
  id: string;
  memberId: string;
  memberName: string;
  submittedBy: string;
  submittedAt: string;
  category: RequestCategory;
  title: string;
  field: string;
  before: string;
  after: string;
  reason: string;
  status: RequestStatus;
  requiresOtp?: boolean;
  decidedBy?: string;
}

export const INITIAL_REQUESTS: MemberRequest[] = [
  {
    id: "NY-REQ-2026-0118",
    memberId: "NY-MBR-00006",
    memberName: "Mercy Auma Nalyanya",
    submittedBy: "Mercy Auma Nalyanya (self)",
    submittedAt: "2026-05-05 10:14 EAT",
    category: "money-routing",
    title: "Update M-Pesa payout number",
    field: "Primary mobile (+254)",
    before: "+254 720 ••• 367",
    after: "+254 722 ••• 891 (OTP verified)",
    reason: "Retired old Safaricom line; new line registered under national ID.",
    status: "pending",
    requiresOtp: true,
  },
  {
    id: "NY-REQ-2026-0115",
    memberId: "NY-MBR-00017",
    memberName: "Tom Mutua Okoth",
    submittedBy: "Grace Adhiambo Nalyanya",
    submittedAt: "2026-05-04 17:42 EAT",
    category: "branch",
    title: "Confirm Ruiru sub-branch transfer",
    field: "Home town & branch",
    before: "Thika · Kisumu branch",
    after: "Ruiru · Kiambu · Tom branch",
    reason: "Transferred permanently to Ruiru Secondary School.",
    status: "pending",
  },
  {
    id: "NY-REQ-2026-0112",
    memberId: "NY-MBR-00021",
    memberName: "Lynn Ruth Wakoli",
    submittedBy: "Ruth Nekesa Nalyanya",
    submittedAt: "2026-05-03 14:05 EAT",
    category: "relation",
    title: "Link engagement / spouse record",
    field: "Spouse link",
    before: "No spouse on file",
    after: "Dr. Kevin Kiprotich (Eldoret)",
    reason: "Traditional introduction completed in Kitale last Saturday.",
    status: "pending",
  },
  {
    id: "NY-REQ-2026-0109",
    memberId: "NY-MBR-00022",
    memberName: "Ethan Wekesa Nalyanya",
    submittedBy: "Daniel Wafula Nalyanya",
    submittedAt: "2026-05-02 09:30 EAT",
    category: "guardian",
    title: "Add co-guardian for school fees",
    field: "Secondary guardian",
    before: "Daniel Wafula Nalyanya only",
    after: "Daniel Wafula + Brian Otieno Nalyanya",
    reason: "Allows Nairobi office to disburse term 2 fees directly to school paybill.",
    status: "pending",
  },
  {
    id: "NY-REQ-2026-0104",
    memberId: "NY-MBR-00012",
    memberName: "Daniel Wafula Nalyanya",
    submittedBy: "Daniel Wafula Nalyanya (self)",
    submittedAt: "2026-04-30 16:18 EAT",
    category: "profile",
    title: "Update job title & employer",
    field: "Profession",
    before: "Port officer · KPA",
    after: "Senior Port Logistics Officer · Kenya Ports Authority",
    reason: "Promoted in April; helps cousins seeking Mombasa internships.",
    status: "pending",
  },
  {
    id: "NY-REQ-2026-0099",
    memberId: "NY-MBR-00014",
    memberName: "Naomi Achieng Nalyanya",
    submittedBy: "Naomi Achieng Nalyanya (self)",
    submittedAt: "2026-04-28 20:11 EAT",
    category: "profile",
    title: "Add diaspora secondary contact",
    field: "Preferred channel",
    before: "WhatsApp only",
    after: "WhatsApp + Email digest",
    reason: "UK time difference makes email summaries easier to read.",
    status: "approved",
    decidedBy: "Brian Otieno Nalyanya",
  },
  {
    id: "NY-REQ-2026-0094",
    memberId: "NY-MBR-00004",
    memberName: "Ann Nekesa Nalyanya",
    submittedBy: "Joseph Wafula Nalyanya",
    submittedAt: "2026-04-25 11:50 EAT",
    category: "money-routing",
    title: "Reset 4-digit elder receive PIN",
    field: "Receive-link PIN",
    before: "•••• (locked after 3 tries)",
    after: "New PIN issued via Kimilili visit",
    reason: "Elder forgot PIN before the May chama allocation.",
    status: "approved",
    requiresOtp: true,
    decidedBy: "Brian Otieno Nalyanya",
  },
  {
    id: "NY-REQ-2026-0088",
    memberId: "NY-MBR-00007",
    memberName: "Samuel Kipkoech Nalyanya",
    submittedBy: "Caleb Kiprono Nalyanya",
    submittedAt: "2026-04-21 08:15 EAT",
    category: "branch",
    title: "Rename Mumias sub-county label",
    field: "Home town",
    before: "Mumias",
    after: "Mumias East",
    reason: "Duplicate of an existing profile update already applied.",
    status: "rejected",
    decidedBy: "Brian Otieno Nalyanya",
  },
  {
    id: "NY-REQ-2026-0082",
    memberId: "NY-MBR-00018",
    memberName: "Faith Chebet Nalyanya",
    submittedBy: "Brian Otieno Nalyanya",
    submittedAt: "2026-04-17 13:20 EAT",
    category: "relation",
    title: "Confirm marriage date on timeline",
    field: "Life events",
    before: "Year only",
    after: "Married Brian Otieno · August 2018, Kapsabet",
    reason: "Anniversary reminder sync for the family calendar.",
    status: "approved",
    decidedBy: "Joseph Wafula Nalyanya",
  },
  {
    id: "NY-REQ-2026-0076",
    memberId: "NY-MBR-00013",
    memberName: "Hellen Nasimiyu Nalyanya",
    submittedBy: "Hellen Nasimiyu Nalyanya (self)",
    submittedAt: "2026-04-12 15:02 EAT",
    category: "profile",
    title: "Add community health certification",
    field: "Profession",
    before: "Public health officer",
    after: "Public health officer · Red Cross First Aid Trainer",
    reason: "So branches can book first-aid sessions during reunions.",
    status: "approved",
    decidedBy: "Brian Otieno Nalyanya",
  },
];

export interface PortraitSpotlightItem {
  memberId: string;
  src: string;
  alt: string;
  caption: string;
  year: string;
  place: string;
  fStop: string;
  shutter: string;
  lens: string;
  generation: number;
  quote: string;
}

export const PORTRAIT_SPOTLIGHTS: PortraitSpotlightItem[] = [
  {
    memberId: "NY-MBR-00001",
    src: "/images/family/mzee-victor.jpg",
    alt: "Mzee Victor Nalyanya smiling warmly",
    caption: "Mzee Victor Nalyanya · Patriarch (Gen 1)",
    year: "1934",
    place: "Kimilili, Bungoma",
    fStop: "f/2.0",
    shutter: "1/250s",
    lens: "85mm Heritage",
    generation: 1,
    quote: "Every grandchild has a chair at this table — even the ones we haven't met yet.",
  },
  {
    memberId: "NY-MBR-00003",
    src: "/images/family/joseph.jpg",
    alt: "Joseph Wafula Nalyanya smiling outdoors",
    caption: "Joseph Wafula Nalyanya · Eldest Son (Gen 2)",
    year: "1958",
    place: "Kimilili, Bungoma",
    fStop: "f/2.8",
    shutter: "1/320s",
    lens: "50mm Prime",
    generation: 2,
    quote: "Roads connect counties, but a good family phone call connects hearts.",
  },
  {
    memberId: "NY-MBR-00005",
    src: "/images/family/peter.jpg",
    alt: "Peter Otieno Nalyanya in traditional attire",
    caption: "Peter Otieno Nalyanya · Nairobi Branch Steward (Gen 2)",
    year: "1961",
    place: "Kasarani, Nairobi",
    fStop: "f/1.8",
    shutter: "1/160s",
    lens: "85mm Portrait",
    generation: 2,
    quote: "Sunday evening devotion keeps twelve branches singing from one hymn book.",
  },
  {
    memberId: "NY-MBR-00009",
    src: "/images/family/ruth.jpg",
    alt: "Ruth Nekesa Nalyanya smiling in eyeglasses",
    caption: "Ruth Nekesa Nalyanya · Kitale Principal (Gen 2)",
    year: "1966",
    place: "Kitale, Trans-Nzoia",
    fStop: "f/2.2",
    shutter: "1/200s",
    lens: "50mm Classic",
    generation: 2,
    quote: "Educate one daughter and you lift two branches at once.",
  },
  {
    memberId: "NY-MBR-00011",
    src: "/images/family/grace.jpg",
    alt: "Grace Adhiambo Nalyanya in blue scrubs",
    caption: "Grace Adhiambo Nalyanya · Kisumu Nurse (Gen 2)",
    year: "1969",
    place: "Kondele, Kisumu",
    fStop: "f/2.0",
    shutter: "1/180s",
    lens: "85mm Portrait",
    generation: 2,
    quote: "When someone is unwell at midnight, family is the first ambulance.",
  },
  {
    memberId: "NY-MBR-00019",
    src: "/images/family/brian.jpg",
    alt: "Brian Otieno Nalyanya smiling confidently",
    caption: "Brian Otieno Nalyanya · Family Head (Gen 3)",
    year: "1992",
    place: "Kasarani, Nairobi",
    fStop: "f/2.4",
    shutter: "1/250s",
    lens: "50mm Prime",
    generation: 3,
    quote: "We built this home so grandparents and grandchildren can walk side by side.",
  },
  {
    memberId: "NY-MBR-00018",
    src: "/images/family/faith.jpg",
    alt: "Faith Chebet Nalyanya smiling warmly",
    caption: "Faith Chebet Nalyanya · Family Architect & Photographer (Gen 3)",
    year: "1994",
    place: "Kapsabet / Nairobi",
    fStop: "f/1.4",
    shutter: "1/400s",
    lens: "35mm Cinema",
    generation: 3,
    quote: "A photograph saved today becomes a grandchild's treasure in fifty years.",
  },
  {
    memberId: "NY-MBR-00014",
    src: "/images/family/naomi.jpg",
    alt: "Naomi Achieng Nalyanya smiling with books",
    caption: "Naomi Achieng Nalyanya · Diaspora Lead (Gen 3)",
    year: "1994",
    place: "Croydon, London (UK)",
    fStop: "f/2.8",
    shutter: "1/200s",
    lens: "50mm Prime",
    generation: 3,
    quote: "Six thousand kilometres away, yet the Kimilili call feels like the next room.",
  },
  {
    memberId: "NY-MBR-00022",
    src: "/images/family/ethan.jpg",
    alt: "Ethan Wekesa Nalyanya smiling with backpack",
    caption: "Ethan Wekesa Nalyanya · Great-Grandson & Ward (Gen 4)",
    year: "2016",
    place: "Likoni, Mombasa",
    fStop: "f/2.0",
    shutter: "1/500s",
    lens: "50mm Prime",
    generation: 4,
    quote: "Next reunion I am reading the opening psalm for Grandpa Victor.",
  },
];

export interface DuplicateCandidate {
  id: string;
  primaryId: string;
  duplicateId: string;
  confidence: number;
  reason: string;
  conflicts: Array<{ field: string; primaryVal: string; duplicateVal: string }>;
}

export const DUPLICATE_CANDIDATES: DuplicateCandidate[] = [
  {
    id: "DUP-01",
    primaryId: "NY-MBR-00016",
    duplicateId: "NY-MBR-00044",
    confidence: 86,
    reason: "Same surname, adjacent birth years, shared Nakuru/Kakamega branch link.",
    conflicts: [
      { field: "Home town", primaryVal: "Nakuru Town", duplicateVal: "Nakuru West" },
      { field: "Phone", primaryVal: "+254 726 ••• 931", duplicateVal: "Not on file" },
      { field: "Sacco shares", primaryVal: "35 shares", duplicateVal: "0 shares" },
    ],
  },
  {
    id: "DUP-02",
    primaryId: "NY-MBR-00020",
    duplicateId: "NY-MBR-00051",
    confidence: 78,
    reason: "Matching first name (Kevin) and Trans-Nzoia / Kitale home county.",
    conflicts: [
      { field: "Profession", primaryVal: "Dairy agronomist", duplicateVal: "Farmer & agri-trader" },
      { field: "WhatsApp", primaryVal: "Capable", duplicateVal: "Capable" },
      { field: "Wallet", primaryVal: "KES 120,000", duplicateVal: "KES 14,500" },
    ],
  },
];

export const CSV_SAMPLE_ROWS = `firstName,middleName,lastName,gender,birthYear,branchId,homeTown,county,profession,phone
Amina,Wekesa,Nalyanya,female,1998,kimilili-joseph,Webuye,Bungoma,Clinical officer,+254719442018
Collins,Barasa,Wakoli,male,1993,kitale-ruth,Kiminini,Trans-Nzoia,Solar technician,+254723881042
Joy,Akinyi,Okoth,female,2001,kisumu-grace,Maseno,Kisumu,Graphic designer,+254708339120`;

export const AGE_BANDS = [
  { key: "all", label: "All ages" },
  { key: "minor", label: "Minors (<18)" },
  { key: "youth", label: "Youth (18–35)" },
  { key: "adult", label: "Adults (36–64)" },
  { key: "elder", label: "Elders (65+)" },
] as const;

export type AgeBand = (typeof AGE_BANDS)[number]["key"];

/* The module shell reads its header copy from here. */
export const pageData: PageConfig = {
  slug: "members",
  name: "Family members",
  eyebrow: "Our people",
  description:
    "Every Nalyanya across twelve branches — searchable, sortable, and always reachable.",
  action: "Add a member",
  panel: "members",
  layout: "people",
};
