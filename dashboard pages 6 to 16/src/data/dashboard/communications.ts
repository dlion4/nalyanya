/* T-14 Communications / Broadcasts — frontend-only Phase 1.
   Four rails, local audience resolver, simulated receipts, 1:1 mock threads, templates,
   quiet hours and daily SMS budget. No network calls. Every submit says SIMULATED.
   Dates EAT (ISO); references NY-BRD / NY-AUD; KES costs are local estimates only. */

import type { Frame } from "@/data/dashboard/contributions";

export const AS_OF = "2025-11-18";
export const ME_ID = "m05";
export const SMS_COST_KES = 1.2;

export type Channel = "whatsapp" | "sms" | "email" | "in-app";
export type BroadcastStatus = "simulated" | "scheduled" | "cancelled" | "draft";
export type DeliveryStatus = "delivered" | "failed" | "pending";
export type Branch = "Nairobi" | "Bungoma" | "Kakamega" | "Trans-Nzoia" | "Diaspora";
export type Role = "Elder" | "Family head" | "Finance officer" | "Member" | "Chama member" | "Parent";
export type TemplateKind = "event" | "funeral" | "harambee" | "reminder" | "alert" | "general";
export type AudienceKey = "all" | "branch" | "elders" | "event" | "sacco" | "role" | "selected" | "custom";

export type Person = {
  id: string;
  name: string;
  initials: string;
  branch: Branch;
  roles: Role[];
  whatsapp: boolean;
  email: boolean;
  preferred: Channel;
  phone: string;
  address: string;
};

export type Audience = {
  id: AudienceKey;
  label: string;
  hint: string;
  count: number;
  branch?: Branch;
  role?: Role;
  elders?: boolean;
  attendee?: boolean;
};

export type Template = {
  id: string;
  title: string;
  kind: TemplateKind;
  subject: string;
  body: string;
  channels: Channel[];
  media?: string;
  hint: string;
};

export type Delivery = {
  personId: string;
  channel: Channel;
  status: DeliveryStatus;
  proof: string;
  at: string;
  excerpt?: string;
};

export type Broadcast = {
  id: string;
  ref: string;
  subject: string;
  excerpt: string;
  body: string;
  audienceKey: AudienceKey;
  audienceLabel: string;
  audienceCount: number;
  branches?: Branch[];
  roles?: Role[];
  channels: Channel[];
  kind: TemplateKind;
  status: BroadcastStatus;
  createdAt: string;
  sentAt: string | null;
  scheduledAt?: string | null;
  delivered: number;
  failed: number;
  pending: number;
  smsRecipients: number;
  smsCost: number;
  media?: string;
  templateId?: string;
  deliveries: Delivery[];
};

export type Message = {
  id: string;
  from: "me" | "them";
  text: string;
  at: string;
  channel: Channel;
  status: "delivered" | "read" | "received" | "simulated";
};

export type Thread = {
  id: string;
  personId: string;
  channel: Channel;
  updatedAt: string;
  unread: number;
  messages: Message[];
};

export type Reply = { id: string; personId: string; at: string; text: string; via: "sms" | "whatsapp"; routed: boolean };

export type AuditEntry = {
  ref: string;
  at: string;
  actor: string;
  action: string;
  entity: string;
  detail: string;
  tone: "plain" | "gold" | "red";
};

export type Settings = {
  quietOn: boolean;
  quietFrom: string;
  quietTo: string;
  criticalBypass: boolean;
  smsDailyCap: number;
  smsSpentToday: number;
  retryCount: number;
  retryAfterMin: number;
  fallback: boolean;
};

export const CHANNELS: Channel[] = ["whatsapp", "sms", "email", "in-app"];
export const CHANNEL_LABEL: Record<Channel, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  "in-app": "In-app",
};
export const CHANNEL_TONE: Record<Channel, string> = {
  whatsapp: "ny-chip-ok",
  sms: "ny-chip-warn",
  email: "ny-chip-info",
  "in-app": "ny-chip-brand",
};
export const CHANNEL_DETAIL: Record<Channel, string> = {
  whatsapp: "Rich messages for WhatsApp-capable numbers",
  sms: "Africa's Talking · reaches every basic phone",
  email: "Long-form notes and diaspora updates",
  "in-app": "Always available to signed-in members",
};
export const CHANNEL_CAPABILITY: Record<Channel, string> = {
  whatsapp: "SIMULATED · template or text",
  sms: "SIMULATED · KES 1.20 per recipient",
  email: "SIMULATED · digest-friendly",
  "in-app": "LOCAL MOCK · no external rail",
};

/* Fifteen family members / friends for sample receipts and 1:1 threads.
   Audience totals reflect the 243-member family and are deliberately separate from sample size. */
export const people: Person[] = [
  { id: "m01", name: "Mzee Victor Nalyanya", initials: "MV", branch: "Trans-Nzoia", roles: ["Elder", "Family head"], whatsapp: false, email: false, preferred: "sms", phone: "+2547 ··· 7890", address: "Kitale" },
  { id: "m02", name: "Ruth Akinyi Nalyanya", initials: "RA", branch: "Nairobi", roles: ["Elder", "Parent"], whatsapp: true, email: true, preferred: "whatsapp", phone: "+2547 ··· 2210", address: "Nairobi" },
  { id: "m03", name: "Brian Otieno Nalyanya", initials: "BO", branch: "Bungoma", roles: ["Member"], whatsapp: true, email: false, preferred: "whatsapp", phone: "+2547 ··· 5512", address: "Bungoma" },
  { id: "m05", name: "Peter Wanyama Nalyanya", initials: "PW", branch: "Nairobi", roles: ["Finance officer", "Member"], whatsapp: true, email: true, preferred: "whatsapp", phone: "+2547 ··· 2210", address: "Nairobi" },
  { id: "m07", name: "Faith Chebet Nalyanya", initials: "FC", branch: "Nairobi", roles: ["Finance officer", "Parent"], whatsapp: true, email: true, preferred: "whatsapp", phone: "+2547 ··· 8841", address: "Nairobi" },
  { id: "m09", name: "Esther Nafula Nalyanya", initials: "EN", branch: "Trans-Nzoia", roles: ["Member"], whatsapp: false, email: false, preferred: "sms", phone: "+2547 ··· 3308", address: "Kitale" },
  { id: "m11", name: "Agnes Wanjiru Nalyanya", initials: "AW", branch: "Nairobi", roles: ["Parent", "Chama member"], whatsapp: true, email: false, preferred: "whatsapp", phone: "+2547 ··· 6612", address: "Karen" },
  { id: "m12", name: "Grace Kwamboka Nalyanya", initials: "GK", branch: "Kakamega", roles: ["Member", "Chama member"], whatsapp: true, email: true, preferred: "whatsapp", phone: "+2547 ··· 4417", address: "Kakamega" },
  { id: "m14", name: "Samuel Kiprop Nalyanya", initials: "SK", branch: "Trans-Nzoia", roles: ["Elder"], whatsapp: false, email: false, preferred: "sms", phone: "+2547 ··· 1174", address: "Kitale" },
  { id: "m15", name: "Hamza Hassan Nalyanya", initials: "HH", branch: "Nairobi", roles: ["Member", "Chama member"], whatsapp: true, email: true, preferred: "whatsapp", phone: "+2547 ··· 9920", address: "Westlands" },
  { id: "m18", name: "Dennis Barasa Nalyanya", initials: "DB", branch: "Kakamega", roles: ["Member"], whatsapp: true, email: false, preferred: "whatsapp", phone: "+2547 ··· 7726", address: "Kakamega" },
  { id: "m19", name: "Joseph Nyongesa Nalyanya", initials: "JN", branch: "Kakamega", roles: ["Elder", "Chama member"], whatsapp: false, email: false, preferred: "sms", phone: "+2547 ··· 3390", address: "Lurambi" },
  { id: "m21", name: "Millicent Aoko Nalyanya", initials: "MA", branch: "Nairobi", roles: ["Parent", "Chama member"], whatsapp: true, email: true, preferred: "whatsapp", phone: "+2547 ··· 5073", address: "Karen" },
  { id: "m22", name: "Lydia Atieno Nalyanya", initials: "LA", branch: "Diaspora", roles: ["Member"], whatsapp: true, email: true, preferred: "email", phone: "+1 416 ··· 0182", address: "Toronto" },
  { id: "m23", name: "Kevin Otieno Nalyanya", initials: "KO", branch: "Diaspora", roles: ["Member"], whatsapp: true, email: true, preferred: "email", phone: "+44 7700 ··· 311", address: "London" },
];

export const personOf = (id: string): Person | undefined => people.find((p) => p.id === id);
export const personName = (id: string): string => personOf(id)?.name ?? "Unknown member";

export const audiences: Audience[] = [
  { id: "all", label: "All family", hint: "Every active member and friend in the family", count: 243 },
  { id: "branch", label: "By branch", hint: "Choose one or more branches", count: 0 },
  { id: "elders", label: "Elders only", hint: "17 elders · WhatsApp-capable where possible", count: 17, elders: true },
  { id: "event", label: "Event attendees", hint: "Nalyanya Reunion · 96 RSVPs", count: 96, attendee: true },
  { id: "sacco", label: "Sacco members", hint: "96 share-holders", count: 96 },
  { id: "role", label: "By role", hint: "Choose a family role", count: 0 },
  { id: "selected", label: "Selected members", hint: "Choose people from the directory", count: 0 },
  { id: "custom", label: "Custom group", hint: "Save this group for later use", count: 0 },
];

export const templates: Template[] = [
  {
    id: "tpl-reunion",
    title: "Reunion RSVP reminder",
    kind: "event",
    subject: "Nalyanya Reunion · RSVP by Friday",
    body: "Habari {first_name}, the Nalyanya Reunion is on 21 March in Kitale. Please RSVP by Friday so we can plan transport for the elders. Karibu!\n\n— Nalyanya family",
    channels: ["whatsapp", "sms", "in-app"],
    media: "/images/frame-reunion.jpg",
    hint: "RSVP reminder for an event",
  },
  {
    id: "tpl-funeral",
    title: "Funeral notice",
    kind: "funeral",
    subject: "Family notice · the Kiprop family",
    body: "With heavy hearts, we share that Mzee Samuel Kiprop has passed. The family will gather in Trans-Nzoia on Saturday. Please hold the Kiprop family close. More details from {branch} branch to follow.",
    channels: ["whatsapp", "sms", "email", "in-app"],
    media: "/images/cause-memorial.jpg",
    hint: "Sensitive family notice",
  },
  {
    id: "tpl-harambee",
    title: "Harambee announcement",
    kind: "harambee",
    subject: "Harambee · help the Musanda hall",
    body: "Habari {first_name}, the Musanda social hall needs a new water tank. If you can, please contribute by 15 December. Every amount helps. Your {branch} branch is counting on you.",
    channels: ["whatsapp", "sms", "in-app"],
    media: "/images/cause-water.jpg",
    hint: "Fundraising announcement",
  },
  {
    id: "tpl-reminder",
    title: "Contribution reminder",
    kind: "reminder",
    subject: "A gentle reminder · this month's chama",
    body: "Habari {first_name}, just a gentle reminder that this month's chama contribution is due on the 25th. If you have already paid, asante sana. — Peter, treasurer",
    channels: ["whatsapp", "sms", "in-app"],
    hint: "Monthly reminder",
  },
  {
    id: "tpl-critical",
    title: "Urgent family alert",
    kind: "alert",
    subject: "Urgent · please call the family head",
    body: "Habari {first_name}, please call the Mzee V. office as soon as you can. This is a family matter that needs everyone's attention. Asante.",
    channels: ["whatsapp", "sms", "in-app"],
    hint: "Critical alert · can break quiet hours",
  },
  {
    id: "tpl-school",
    title: "School fees funded",
    kind: "general",
    subject: "School fees update · Brian Jr. and Sharon",
    body: "Habari {first_name}, the second term school fees for Brian Jr. and Sharon have been paid. Thank you to the {branch} family for making it happen.",
    channels: ["whatsapp", "email", "in-app"],
    media: "/images/cause-school.jpg",
    hint: "Thank-you after a release",
  },
  {
    id: "tpl-wellness",
    title: "Check on an elder",
    kind: "reminder",
    subject: "Please call Mzee Victor this weekend",
    body: "Habari {first_name}, if you have a moment this weekend, please call Mzee Victor in Kitale. He would love to hear from the {branch} family.",
    channels: ["whatsapp", "sms"],
    hint: "Elder-first reminder",
  },
  {
    id: "tpl-general",
    title: "Blank family message",
    kind: "general",
    subject: "A note from the Nalyanya family",
    body: "Habari {first_name},\n\n\n— Nalyanya family",
    channels: ["whatsapp", "sms", "email", "in-app"],
    hint: "Start with a clean message",
  },
];

const delivery = (
  ids: string[],
  channels: Channel[],
  states: DeliveryStatus[],
  prefix: string,
  at: string,
): Delivery[] =>
  ids.flatMap((id, i) => {
    const person = personOf(id);
    if (!person) return [];
    const ch: Channel = person.preferred === "email" && channels.includes("email") ? "email" : person.whatsapp && channels.includes("whatsapp") ? "whatsapp" : channels.includes("sms") ? "sms" : channels[0] ?? "in-app";
    return [{ personId: id, channel: ch, status: states[i % states.length], proof: `${prefix}${String(i + 1).padStart(4, "0")}`, at }];
  });

export const broadcasts: Broadcast[] = [
  {
    id: "b1", ref: "NY-BRD-2025-00184", subject: "Reunion RSVP · please reply by Friday", excerpt: "The Nalyanya Reunion is on 21 March in Kitale. Please RSVP by Friday…",
    body: "Habari {first_name}, the Nalyanya Reunion is on 21 March in Kitale. Please RSVP by Friday so we can plan transport for the elders. Karibu!\n\n— Nalyanya family",
    audienceKey: "event", audienceLabel: "Reunion RSVPs", audienceCount: 96, channels: ["whatsapp", "sms", "in-app"], kind: "event", status: "simulated", createdAt: "2025-11-18T09:10:00+03:00", sentAt: "2025-11-18T09:10:00+03:00", delivered: 88, failed: 3, pending: 5, smsRecipients: 31, smsCost: 37.2, media: "/images/frame-reunion.jpg", templateId: "tpl-reunion",
    deliveries: delivery(["m01", "m02", "m03", "m05", "m07", "m09", "m12", "m14", "m18", "m19", "m21", "m22", "m23"], ["whatsapp", "sms", "in-app"], ["delivered", "delivered", "delivered", "failed", "pending"], "SIM-BRD-184-", "09:10 EAT"),
  },
  {
    id: "b2", ref: "NY-BRD-2025-00183", subject: "Harambee · Musanda social hall water tank", excerpt: "The social hall needs a new 10,000-litre tank. Every amount helps…",
    body: "Habari {first_name}, the Musanda social hall needs a new water tank. If you can, please contribute by 15 December. Every amount helps. — Nalyanya family",
    audienceKey: "all", audienceLabel: "All family", audienceCount: 243, channels: ["whatsapp", "sms", "in-app"], kind: "harambee", status: "simulated", createdAt: "2025-11-17T14:30:00+03:00", sentAt: "2025-11-17T14:30:00+03:00", delivered: 229, failed: 5, pending: 9, smsRecipients: 82, smsCost: 98.4, media: "/images/cause-water.jpg", templateId: "tpl-harambee",
    deliveries: delivery(["m01", "m02", "m03", "m05", "m07", "m09", "m12", "m14", "m18", "m19", "m21", "m22", "m23"], ["whatsapp", "sms", "in-app"], ["delivered", "delivered", "failed", "pending"], "SIM-BRD-183-", "14:30 EAT"),
  },
  {
    id: "b3", ref: "NY-BRD-2025-00182", subject: "Clinic update · Mama Ruth is home", excerpt: "Mama Ruth is resting at home after her review. Asante for every call…",
    body: "Habari {first_name}, Mama Ruth is home and resting after her review at Nairobi Hospital. Asante for every call, visit and contribution. — Peter",
    audienceKey: "elders", audienceLabel: "Elders only", audienceCount: 17, channels: ["whatsapp", "sms"], kind: "general", status: "simulated", createdAt: "2025-11-16T18:05:00+03:00", sentAt: "2025-11-16T18:05:00+03:00", delivered: 16, failed: 1, pending: 0, smsRecipients: 8, smsCost: 9.6,
    deliveries: delivery(["m01", "m02", "m09", "m14", "m19"], ["whatsapp", "sms"], ["delivered", "delivered", "failed"], "SIM-BRD-182-", "18:05 EAT"),
  },
  {
    id: "b4", ref: "NY-BRD-2025-00181", subject: "School fees funded · term 2", excerpt: "The second term fees for Brian Jr. and Sharon have been paid…",
    body: "Habari {first_name}, the second term school fees for Brian Jr. and Sharon have been paid. Thank you to the {branch} family. — Nalyanya Foundation",
    audienceKey: "branch", audienceLabel: "Bungoma + Trans-Nzoia", audienceCount: 89, branches: ["Bungoma", "Trans-Nzoia"], channels: ["whatsapp", "email", "in-app"], kind: "general", status: "simulated", createdAt: "2025-11-16T11:20:00+03:00", sentAt: "2025-11-16T11:20:00+03:00", delivered: 84, failed: 2, pending: 3, smsRecipients: 0, smsCost: 0, media: "/images/cause-school.jpg", templateId: "tpl-school",
    deliveries: delivery(["m01", "m03", "m07", "m09", "m14"], ["whatsapp", "email", "in-app"], ["delivered", "delivered", "pending"], "SIM-BRD-181-", "11:20 EAT"),
  },
  {
    id: "b5", ref: "NY-BRD-2025-00180", subject: "Mzee Victor's birthday · transport check", excerpt: "The family lunch is Sunday 7 December. Which elders need a ride…",
    body: "Habari {first_name}, Mzee Victor's birthday lunch is Sunday 7 December in Kitale. Please reply to {branch} branch if an elder needs a ride.",
    audienceKey: "elders", audienceLabel: "Elders only", audienceCount: 17, channels: ["sms", "whatsapp"], kind: "event", status: "scheduled", createdAt: "2025-11-16T09:00:00+03:00", sentAt: null, scheduledAt: "2025-12-01T08:00:00+03:00", delivered: 0, failed: 0, pending: 17, smsRecipients: 8, smsCost: 9.6,
    deliveries: delivery(["m01", "m02", "m09", "m14", "m19"], ["whatsapp", "sms"], ["pending"], "SIM-BRD-180-", "scheduled"),
  },
  {
    id: "b6", ref: "NY-BRD-2025-00179", subject: "Gentle reminder · November chama contribution", excerpt: "This month's chama contribution is due on the 25th…",
    body: "Habari {first_name}, this month's chama contribution is due on the 25th. If you have already paid, asante sana. — Peter, treasurer",
    audienceKey: "sacco", audienceLabel: "Sacco and chama members", audienceCount: 96, channels: ["whatsapp", "sms", "in-app"], kind: "reminder", status: "simulated", createdAt: "2025-11-15T07:10:00+03:00", sentAt: "2025-11-15T07:10:00+03:00", delivered: 92, failed: 1, pending: 3, smsRecipients: 34, smsCost: 40.8, templateId: "tpl-reminder",
    deliveries: delivery(["m02", "m03", "m05", "m07", "m11", "m12", "m15", "m19", "m21"], ["whatsapp", "sms", "in-app"], ["delivered", "pending", "failed"], "SIM-BRD-179-", "07:10 EAT"),
  },
  {
    id: "b7", ref: "NY-BRD-2025-00178", subject: "Urgent · please call the family head", excerpt: "Please call the Mzee V. office as soon as you can…",
    body: "Habari {first_name}, please call the Mzee V. office as soon as you can. This is a family matter that needs everyone's attention.",
    audienceKey: "all", audienceLabel: "All family", audienceCount: 243, channels: ["sms", "whatsapp", "in-app"], kind: "alert", status: "simulated", createdAt: "2025-11-14T21:42:00+03:00", sentAt: "2025-11-14T21:42:00+03:00", delivered: 237, failed: 4, pending: 2, smsRecipients: 89, smsCost: 106.8,
    deliveries: delivery(["m01", "m02", "m03", "m05", "m07", "m09", "m12", "m14", "m18", "m19", "m21", "m22", "m23"], ["sms", "whatsapp", "in-app"], ["delivered", "delivered", "delivered", "failed", "pending"], "SIM-BRD-178-", "21:42 EAT"),
  },
  {
    id: "b8", ref: "NY-BRD-2025-00177", subject: "Funeral notice · the Kiprop family", excerpt: "With heavy hearts, we share that Mzee Samuel Kiprop has passed…",
    body: "With heavy hearts, we share that Mzee Samuel Kiprop has passed. The family will gather in Trans-Nzoia on Saturday. More details to follow.",
    audienceKey: "branch", audienceLabel: "All branches", audienceCount: 243, branches: ["Nairobi", "Bungoma", "Kakamega", "Trans-Nzoia", "Diaspora"], channels: ["whatsapp", "sms", "email", "in-app"], kind: "funeral", status: "simulated", createdAt: "2025-11-12T06:30:00+03:00", sentAt: "2025-11-12T06:30:00+03:00", delivered: 230, failed: 6, pending: 7, smsRecipients: 80, smsCost: 96, media: "/images/cause-memorial.jpg", templateId: "tpl-funeral",
    deliveries: delivery(["m01", "m02", "m03", "m05", "m07", "m09", "m12", "m14", "m18", "m19", "m21", "m22", "m23"], ["whatsapp", "sms", "email", "in-app"], ["delivered", "delivered", "failed", "pending"], "SIM-BRD-177-", "06:30 EAT"),
  },
  {
    id: "b9", ref: "NY-BRD-2025-00176", subject: "Sacco dividend · 2024", excerpt: "The annual dividend has been posted. Check your share statement…",
    body: "Habari {first_name}, the Nalyanya Family Sacco 2024 dividend has been posted at KES 90 per share. Your statement is in the dashboard.",
    audienceKey: "sacco", audienceLabel: "Sacco members", audienceCount: 96, channels: ["email", "in-app"], kind: "general", status: "simulated", createdAt: "2025-11-04T10:00:00+03:00", sentAt: "2025-11-04T10:00:00+03:00", delivered: 94, failed: 0, pending: 2, smsRecipients: 0, smsCost: 0,
    deliveries: delivery(["m02", "m05", "m07", "m11", "m12", "m15", "m21", "m22", "m23"], ["email", "in-app"], ["delivered", "pending"], "SIM-BRD-176-", "10:00 EAT"),
  },
  {
    id: "b10", ref: "NY-BRD-2025-00175", subject: "RSVP reminder · Nairobi branch dinner", excerpt: "Please confirm your place for the branch dinner on 30 November…",
    body: "Habari {first_name}, please confirm your place for the Nairobi branch dinner on 30 November. Reply “yes” to this message. — Agnes",
    audienceKey: "branch", audienceLabel: "Nairobi branch · 54 members", audienceCount: 54, branches: ["Nairobi"], channels: ["whatsapp", "sms"], kind: "event", status: "scheduled", createdAt: "2025-11-17T16:00:00+03:00", sentAt: null, scheduledAt: "2025-11-27T17:30:00+03:00", delivered: 0, failed: 0, pending: 54, smsRecipients: 19, smsCost: 22.8, templateId: "tpl-reunion",
    deliveries: delivery(["m02", "m05", "m07", "m11", "m15", "m21"], ["whatsapp", "sms"], ["pending"], "SIM-BRD-175-", "scheduled"),
  },
];



export const threads: Thread[] = [
  { id: "th01", personId: "m02", channel: "whatsapp", updatedAt: "2025-11-18T09:32:00+03:00", unread: 2, messages: [
    { id: "m01", from: "me", text: "Habari Ruth, Mama's next clinic review is Thursday at 10. Peter can drive if you need.", at: "09:14 EAT", channel: "whatsapp", status: "read" },
    { id: "m02", from: "them", text: "Asante sana. I will tell her after breakfast.", at: "09:22 EAT", channel: "whatsapp", status: "received" },
    { id: "m03", from: "them", text: "Can you also send the receipt from the pharmacy? She wants to keep it with her notes.", at: "09:32 EAT", channel: "whatsapp", status: "received" },
  ] },
  { id: "th02", personId: "m01", channel: "sms", updatedAt: "2025-11-18T08:10:00+03:00", unread: 1, messages: [
    { id: "m04", from: "me", text: "Habari Mzee, the family meeting is Sunday at 11. We will pick you up.", at: "08:03 EAT", channel: "sms", status: "delivered" },
    { id: "m05", from: "them", text: "Asante. Tell the driver the gate is open.", at: "08:10 EAT", channel: "sms", status: "received" },
  ] },
  { id: "th03", personId: "m07", channel: "whatsapp", updatedAt: "2025-11-17T19:45:00+03:00", unread: 0, messages: [
    { id: "m06", from: "me", text: "The school fees release went through. The receipt is in the records.", at: "18:50 EAT", channel: "whatsapp", status: "read" },
    { id: "m07", from: "them", text: "They have confirmed it. Brian is very grateful to everyone.", at: "19:45 EAT", channel: "whatsapp", status: "received" },
  ] },
  { id: "th04", personId: "m22", channel: "email", updatedAt: "2025-11-17T13:12:00+03:00", unread: 0, messages: [
    { id: "m08", from: "me", text: "Your Sacco dividend statement for 2024 is ready. It is attached to the statement tab.", at: "12:54 EAT", channel: "email", status: "delivered" },
    { id: "m09", from: "them", text: "Thank you Peter. I have forwarded it to my accountant in Toronto.", at: "13:12 EAT", channel: "email", status: "received" },
  ] },
  { id: "th05", personId: "m03", channel: "whatsapp", updatedAt: "2025-11-16T17:00:00+03:00", unread: 0, messages: [
    { id: "m10", from: "me", text: "The water tank quote is approved. Can you have the plumber send his invoice?", at: "16:22 EAT", channel: "whatsapp", status: "read" },
    { id: "m11", from: "them", text: "I will call him tomorrow morning.", at: "17:00 EAT", channel: "whatsapp", status: "received" },
  ] },
  { id: "th06", personId: "m12", channel: "sms", updatedAt: "2025-11-15T10:40:00+03:00", unread: 0, messages: [
    { id: "m12", from: "me", text: "Grace, I have received the invoice. I will update the ledger this afternoon.", at: "10:12 EAT", channel: "sms", status: "delivered" },
    { id: "m13", from: "them", text: "Asante. I have scanned the original as well.", at: "10:40 EAT", channel: "sms", status: "received" },
  ] },
  { id: "th07", personId: "m14", channel: "whatsapp", updatedAt: "2025-11-14T07:50:00+03:00", unread: 1, messages: [
    { id: "m14", from: "them", text: "Please tell me whether the harambee is on Saturday. I need to book the bus.", at: "07:50 EAT", channel: "whatsapp", status: "received" },
  ] },
  { id: "th08", personId: "m19", channel: "sms", updatedAt: "2025-11-13T20:11:00+03:00", unread: 0, messages: [
    { id: "m15", from: "me", text: "The receipt has been filed against the emergency allocation.", at: "19:56 EAT", channel: "sms", status: "delivered" },
    { id: "m16", from: "them", text: "Good. The family should keep a copy in case the bank asks.", at: "20:11 EAT", channel: "sms", status: "received" },
  ] },
  { id: "th09", personId: "m09", channel: "sms", updatedAt: "2025-11-12T18:03:00+03:00", unread: 0, messages: [
    { id: "m17", from: "me", text: "The transport is arranged for the elders on Sunday.", at: "17:54 EAT", channel: "sms", status: "delivered" },
    { id: "m18", from: "them", text: "I will let Samuel know. Asante.", at: "18:03 EAT", channel: "sms", status: "received" },
  ] },
  { id: "th10", personId: "m21", channel: "whatsapp", updatedAt: "2025-11-11T16:27:00+03:00", unread: 0, messages: [
    { id: "m19", from: "them", text: "The caterer has confirmed the menu. I will send the final headcount tonight.", at: "16:27 EAT", channel: "whatsapp", status: "received" },
  ] },
];

export const replySeeds: Reply[] = [
  { id: "r01", personId: "m02", at: "09:31 EAT", text: "Yes, we will be there. Please add Mama Ruth to the transport list.", via: "whatsapp", routed: true },
  { id: "r02", personId: "m14", at: "09:44 EAT", text: "Niko hapo. One seat for Samuel please.", via: "sms", routed: false },
  { id: "r03", personId: "m22", at: "10:02 EAT", text: "We land Friday night. Can someone collect us in Kitale?", via: "whatsapp", routed: true },
  { id: "r04", personId: "m09", at: "10:16 EAT", text: "Asante. I will bring the chairs from the hall.", via: "whatsapp", routed: true },
];

export const auditSeed: AuditEntry[] = [
  { ref: "NY-AUD-01171", at: "18 Nov · 09:10", actor: "Peter Wanyama Nalyanya", action: "broadcast.simulate", entity: "NY-BRD-2025-00184", detail: "RSVP reminder · 96 recipients · WhatsApp + SMS + In-app · SIMULATED", tone: "gold" },
  { ref: "NY-AUD-01170", at: "17 Nov · 16:40", actor: "Agnes Wanjiru Nalyanya", action: "thread.reply", entity: "NY-THR-00010", detail: "Reply about the Nairobi branch dinner · WhatsApp · SIMULATED", tone: "plain" },
  { ref: "NY-AUD-01169", at: "16 Nov · 11:20", actor: "System", action: "broadcast.schedule", entity: "NY-BRD-2025-00180", detail: "Mzee Victor birthday · 17 elders · 1 Dec at 08:00 EAT", tone: "plain" },
  { ref: "NY-AUD-01168", at: "15 Nov · 07:10", actor: "System", action: "broadcast.simulate", entity: "NY-BRD-2025-00179", detail: "Chama reminder · 96 recipients · SMS and WhatsApp · SIMULATED", tone: "gold" },
  { ref: "NY-AUD-01167", at: "14 Nov · 21:42", actor: "Peter Wanyama Nalyanya", action: "broadcast.critical", entity: "NY-BRD-2025-00178", detail: "Critical alert sent through quiet hours · 243 recipients · SIMULATED", tone: "red" },
  { ref: "NY-AUD-01166", at: "12 Nov · 06:30", actor: "Peter Wanyama Nalyanya", action: "broadcast.simulate", entity: "NY-BRD-2025-00177", detail: "Funeral notice · all branches · WhatsApp, SMS, email and in-app", tone: "gold" },
];

export const settingsSeed: Settings = {
  quietOn: true,
  quietFrom: "21:00",
  quietTo: "07:00",
  criticalBypass: true,
  smsDailyCap: 1200,
  smsSpentToday: 246,
  retryCount: 2,
  retryAfterMin: 10,
  fallback: true,
};

/* Image-led family frames for the camera-pinhole section. Reuse local stock photos already in /public. */
export const frames: Frame[] = [
  { id: "fc1", src: "/images/frame-reunion.jpg", title: "Reunion steps", caption: "Five generations on the homestead steps. One note reaches every branch before lunch.", frame: "61", lens: "85mm", exposure: "1/250 · f4", place: "Trans-Nzoia" },
  { id: "fc2", src: "/images/contrib-hero.jpg", title: "The harambee table", caption: "Bungoma veranda — the announcement went out by word of mouth here first.", frame: "62A", lens: "35mm", exposure: "1/125 · f2.8", place: "Bungoma" },
  { id: "fc3", src: "/images/cause-memorial.jpg", title: "Send-off", caption: "A funeral notice needs the right tone, the right people, and no quiet-hour delay.", frame: "63", lens: "50mm", exposure: "1/125 · f2.8", place: "Trans-Nzoia" },
  { id: "fc4", src: "/images/cause-school.jpg", title: "Term reopens", caption: "The school fees update that thanked every branch, by name.", frame: "64", lens: "50mm", exposure: "1/500 · f2.8", place: "Kimilili" },
  { id: "fc5", src: "/images/cause-medical.jpg", title: "Clinic corridor", caption: "The message to Mama Ruth went first to her WhatsApp, then to Peter by SMS.", frame: "65A", lens: "35mm", exposure: "1/60 · f2", place: "Nairobi" },
  { id: "fc6", src: "/images/cause-water.jpg", title: "First water", caption: "A project update for Musanda, with one photograph and a deadline.", frame: "66", lens: "28mm", exposure: "1/1000 · f5.6", place: "Musanda" },
  { id: "fc7", src: "/images/fin-sacco.jpg", title: "The counters", caption: "A dividend statement belongs in email; the reminder belongs on WhatsApp.", frame: "67", lens: "50mm", exposure: "1/80 · f2.8", place: "Nairobi" },
  { id: "fc8", src: "/images/frame-elder.jpg", title: "Mzee's ledger", caption: "One short SMS is sometimes the kindest thing a busy family can send.", frame: "68A", lens: "90mm macro", exposure: "1/45 · f2.8", place: "Kitale" },
];

/* ------------------------------------------------------------------ */
/* Audience resolver and channel routing (all local)                    */
/* ------------------------------------------------------------------ */
export type AudienceSpec = { key: AudienceKey; branches: Branch[]; role: Role | "all"; selected: string[]; eventOnly: boolean };
export const DEFAULT_AUDIENCE: AudienceSpec = { key: "all", branches: [], role: "all", selected: [], eventOnly: false };

export type AudienceCounts = { total: number; whatsapp: number; sms: number; email: number; inApp: number; elders: number; family: number; friends: number };

export function audienceCounts(spec: AudienceSpec): AudienceCounts {
  let total: number;
  if (spec.key === "all") total = 243;
  else if (spec.key === "elders") total = 17;
  else if (spec.key === "event") total = 96;
  else if (spec.key === "sacco") total = 96;
  else if (spec.key === "branch") total = spec.branches.reduce((s, b) => s + ({ Nairobi: 54, Bungoma: 61, Kakamega: 44, "Trans-Nzoia": 38, Diaspora: 22 }[b] ?? 0), 0);
  else if (spec.key === "role") total = spec.role === "all" ? 243 : spec.role === "Elder" ? 17 : spec.role === "Finance officer" ? 11 : spec.role === "Chama member" ? 96 : 141;
  else total = spec.selected.length || 0;
  const samplePeople = resolveSample(spec);
  const wa = total === 0 ? 0 : spec.key === "elders" ? 6 : Math.round(total * 0.64);
  const email = total === 0 ? 0 : Math.round(total * 0.48);
  return {
    total,
    whatsapp: wa,
    sms: total === 0 ? 0 : total - wa,
    email,
    inApp: total,
    elders: spec.key === "elders" ? total : spec.key === "all" ? 17 : samplePeople.filter((p) => p.roles.includes("Elder")).length,
    family: samplePeople.filter((p) => p.id.startsWith("m")).length,
    friends: 0,
  };
}

export function resolveSample(spec: AudienceSpec): Person[] {
  if (spec.key === "selected") return people.filter((p) => spec.selected.includes(p.id));
  if (spec.key === "branch") return people.filter((p) => spec.branches.includes(p.branch));
  if (spec.key === "elders") return people.filter((p) => p.roles.includes("Elder"));
  if (spec.key === "role" && spec.role !== "all") return people.filter((p) => p.roles.includes(spec.role as Role));
  if (spec.key === "event") return people.filter((p) => ["m01", "m02", "m03", "m05", "m07", "m09", "m12", "m14", "m19", "m21", "m22", "m23"].includes(p.id));
  if (spec.key === "sacco") return people.filter((p) => p.roles.includes("Chama member"));
  return people;
}

export function chooseChannel(person: Person, selected: Channel[]): Channel {
  if (selected.includes("in-app") && person.id.startsWith("m")) return "in-app";
  if (selected.includes("whatsapp") && person.whatsapp) return "whatsapp";
  if (selected.includes("sms")) return "sms";
  if (selected.includes("email") && person.email) return "email";
  return selected[0] ?? "in-app";
}

export const channelCountPreview = (counts: AudienceCounts, selected: Channel[]) => ({
  whatsapp: selected.includes("whatsapp") ? counts.whatsapp : 0,
  sms: selected.includes("sms") ? counts.sms : 0,
  email: selected.includes("email") ? counts.email : 0,
  "in-app": selected.includes("in-app") ? counts.inApp : 0,
});

export const safeMerge = (text: string, person: Person): string =>
  text.replaceAll("{first_name}", person.name.split(" ")[0]).replaceAll("{branch}", person.branch);

export function estimateSms(count: number, selected: Channel[], smsCap: number, smsSpent: number): { smsRecipients: number; cost: number; remaining: number; capped: boolean } {
  const smsRecipients = selected.includes("sms") ? count : 0;
  const cost = Math.round(smsRecipients * SMS_COST_KES * 100) / 100;
  const remaining = Math.max(0, smsCap - smsSpent);
  return { smsRecipients, cost, remaining, capped: cost > remaining };
}

export function broadcastStats(list: Broadcast[]) {
  const thisMonth = list.filter((b) => b.status === "simulated" && b.sentAt?.startsWith("2025-11"));
  const delivered = thisMonth.reduce((s, b) => s + b.delivered, 0);
  const failed = thisMonth.reduce((s, b) => s + b.failed, 0);
  const reached = thisMonth.reduce((s, b) => s + b.audienceCount, 0);
  const pending = list.filter((b) => b.status === "scheduled").length + list.filter((b) => b.status === "simulated").reduce((s, b) => s + b.pending, 0);
  return {
    sent: thisMonth.length,
    reached,
    delivered,
    failed,
    rate: delivered + failed === 0 ? 0 : Math.round((100 * delivered) / (delivered + failed)),
    pending,
  };
}

export const chooseReceipts = (spec: AudienceSpec, selected: Channel[], ref: string): Delivery[] => {
  const sample = resolveSample(spec);
  const states: DeliveryStatus[] = ["delivered", "delivered", "delivered", "pending", "failed"];
  return sample.map((p, i) => ({
    personId: p.id,
    channel: chooseChannel(p, selected),
    status: states[i % states.length],
    proof: `SIM-${ref.slice(-3)}-${String(i + 1).padStart(4, "0")}`,
    at: "just now · EAT",
  }));
};
