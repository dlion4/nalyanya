/* T-4 Events & Activities — dedicated page data (mock, deterministic, Kenyan family records). */

import { MEMBERS } from "@/data/family/people";
import { between, hashString, mulberry32 } from "@/lib/rng";
import type { Channel, Member } from "@/types/family";

export type EventKind =
  | "Reunion"
  | "Wedding"
  | "Memorial"
  | "Birthday"
  | "Graduation"
  | "Anniversary"
  | "Harambee"
  | "Meeting"
  | "Devotion"
  | "Medical camp";

export type EventStatus = "draft" | "scheduled" | "cancelled" | "done";
export type RsvpStatus = "going" | "maybe" | "declined" | "pending";
export type ReminderOffset = "E-2d" | "E-1h";

export interface EventKindMeta {
  kind: EventKind;
  blurb: string;
  accent: string;
  icon: "Users" | "Heart" | "Flower2" | "Cake" | "GraduationCap" | "Sparkles" | "HandCoins" | "Handshake" | "BookOpen" | "Stethoscope";
}

export const EVENT_KINDS: EventKindMeta[] = [
  { kind: "Reunion", blurb: "Whole-family gatherings under one tent.", accent: "#4FAE86", icon: "Users" },
  { kind: "Wedding", blurb: "Committees, introductions and the dance floor.", accent: "#A284DC", icon: "Heart" },
  { kind: "Memorial", blurb: "Remembrance services held with dignity.", accent: "#7C8FB3", icon: "Flower2" },
  { kind: "Birthday", blurb: "Candles, cake and a very long family song.", accent: "#E0764A", icon: "Cake" },
  { kind: "Graduation", blurb: "Caps, gowns and proud grandparents.", accent: "#3A7CA5", icon: "GraduationCap" },
  { kind: "Anniversary", blurb: "Years of marriage, shared at the table.", accent: "#D4A437", icon: "Sparkles" },
  { kind: "Harambee", blurb: "Pledge-led fundraising for a family need.", accent: "#D17A22", icon: "HandCoins" },
  { kind: "Meeting", blurb: "Councils, chama rounds and planning.", accent: "#2A9D8F", icon: "Handshake" },
  { kind: "Devotion", blurb: "Scripture, prayer and a shared hymn.", accent: "#5B8C5A", icon: "BookOpen" },
  { kind: "Medical camp", blurb: "Free checks, medicines and first aid.", accent: "#C62828", icon: "Stethoscope" },
];

export interface EventVenue {
  id: string;
  name: string;
  town: string;
  county: string;
  capacity: number;
  photo: string;
  amenities: string[];
  rateKes: number;
  contact: string;
}

export const VENUES: EventVenue[] = [
  { id: "V-KIM", name: "Kimilili Family Compound", town: "Kimilili", county: "Bungoma", capacity: 400, photo: "/images/family/elgon.jpg", amenities: ["Marquee tent", "Parking", "Water tanks", "Kitchen"], rateKes: 25000, contact: "Joseph · +254 733 ••• 276" },
  { id: "V-KAS", name: "Kasarani Community Hall", town: "Kasarani", county: "Nairobi", capacity: 180, photo: "/images/family/sunday-lunch.jpg", amenities: ["Projector", "Parking", "Accessible ramp", "Kitchen"], rateKes: 18000, contact: "Peter · +254 714 ••• 322" },
  { id: "V-KIT", name: "Kitale Secondary School Hall", town: "Kitale", county: "Trans-Nzoia", capacity: 260, photo: "/images/family/wedding.jpg", amenities: ["Stage", "Sound system", "Generator", "Parking"], rateKes: 22000, contact: "Ruth · +254 718 ••• 690" },
  { id: "V-ELD", name: "Eldoret Dairy Co-op Hall", town: "Eldoret", county: "Uasin Gishu", capacity: 150, photo: "/images/family/meeting.jpg", amenities: ["Projector", "Tea urn", "Parking"], rateKes: 14000, contact: "Caleb · +254 711 ••• 045" },
  { id: "V-KIS", name: "Kondele Community Centre", town: "Kisumu", county: "Kisumu", capacity: 90, photo: "/images/family/clinic.jpg", amenities: ["Shade", "Water", "Accessible ramp"], rateKes: 9000, contact: "Grace · +254 724 ••• 019" },
  { id: "V-MOM", name: "Likoni Beach Pavilion", town: "Likoni", county: "Mombasa", capacity: 160, photo: "/images/family/picnic.jpg", amenities: ["Shade", "Restrooms", "Open air", "Parking"], rateKes: 12000, contact: "Daniel · +254 797 ••• 845" },
  { id: "V-NYE", name: "Nyeri Town Library Hall", town: "Nyeri", county: "Nyeri", capacity: 70, photo: "/images/family/graduation.jpg", amenities: ["Projector", "Wi-Fi", "Accessible ramp"], rateKes: 8000, contact: "Hellen · +254 701 ••• 372" },
  { id: "V-MUM", name: "Mumias Community Hall", town: "Mumias", county: "Kakamega", capacity: 120, photo: "/images/family/birthday.jpg", amenities: ["Kitchen", "Parking", "Sound system"], rateKes: 11000, contact: "Samuel · +254 745 ••• 133" },
  { id: "V-VIRT", name: "Virtual room · WhatsApp & video", town: "Online", county: "Diaspora-ready", capacity: 999, photo: "/images/family/hands-album.jpg", amenities: ["Video call", "Captions", "Recording (with consent)"], rateKes: 0, contact: "Brian · +254 712 ••• 309" },
];

export interface EventCause {
  id: string;
  title: string;
  target: number;
  raised: number;
  beneficiary: string;
}

export const CAUSES: EventCause[] = [
  { id: "CAU-2026-031", title: "Kimilili water project", target: 1200000, raised: 742500, beneficiary: "Kimilili village water committee" },
  { id: "CAU-2026-034", title: "Mzee Victor · clinic fund", target: 300000, raised: 186000, beneficiary: "Kimilili Sub-County Hospital" },
  { id: "CAU-2026-037", title: "Kitale dairy shed roof", target: 450000, raised: 118000, beneficiary: "Wakoli dairy co-operative" },
  { id: "CAU-2026-040", title: "Ethan's school fees", target: 60000, raised: 36000, beneficiary: "Likoni primary (guardian: Daniel)" },
];

export interface AlbumShot {
  src: string;
  alt: string;
  caption: string;
}

/** Shared pool of real family photographs used by every event album. */
export const ALBUM_POOL: AlbumShot[] = [
  { src: "/images/family/reunion.jpg", alt: "Family under a large tent at a reunion", caption: "Under the tent, everyone talking at once" },
  { src: "/images/family/wedding.jpg", alt: "Wedding guests dancing at a reception", caption: "The dance floor outlasted the generator" },
  { src: "/images/family/sunday-lunch.jpg", alt: "A family sharing a long table", caption: "A long table and short prayers" },
  { src: "/images/family/grandparents.jpg", alt: "Grandparents laughing with grandchildren", caption: "Grandparents in charge of the little ones" },
  { src: "/images/family/reunion-attire.jpg", alt: "Family in traditional attire smiling outdoors", caption: "Traditional attire, big laughter" },
  { src: "/images/family/album.jpg", alt: "Hands turning the pages of an old album", caption: "The family album, digitised" },
  { src: "/images/family/hands-album.jpg", alt: "Old family photographs spread on a table", caption: "Turning through old photographs" },
  { src: "/images/family/elder-stick.jpg", alt: "An elder with a walking stick", caption: "Mzee's stick, Mzee's stories" },
  { src: "/images/family/birthday.jpg", alt: "Family blowing candles on a birthday cake", caption: "Candles, cake and a very long song" },
  { src: "/images/family/graduation.jpg", alt: "Graduates celebrating in gowns and caps", caption: "Caps in the air at last" },
  { src: "/images/family/harambee.jpg", alt: "Community members gathered outdoors", caption: "Pledges read out loud" },
  { src: "/images/family/meeting.jpg", alt: "Community members sitting under a tree", caption: "Minutes, plans and strong tea" },
  { src: "/images/family/clinic.jpg", alt: "Volunteers at an outdoor health camp", caption: "Blood pressure checks in the shade" },
  { src: "/images/family/picnic.jpg", alt: "Family picnic on the beach", caption: "Sandwiches, sea breeze and cousins" },
  { src: "/images/family/elgon.jpg", alt: "Green hills below Mount Elgon", caption: "The hills above Kimilili" },
];

export interface EventRsvp {
  memberId: string;
  status: RsvpStatus;
  plusOnes: number;
  channel: Channel;
  arrived: boolean;
}

export interface FamilyEvent {
  id: string;
  title: string;
  kind: EventKind;
  status: EventStatus;
  date: string;
  startTime: string;
  endTime: string;
  venueId: string;
  host: string;
  branchId: string;
  description: string;
  dressCode: string;
  cover: string;
  capacity: number;
  causeId: string | null;
  album: AlbumShot[];
  albumName: string | null;
  reminders: ReminderOffset[];
  rsvps: EventRsvp[];
  cancelReason: string | null;
  log: string[];
}

interface EventSeed {
  id: string;
  title: string;
  kind: EventKind;
  status: EventStatus;
  date: string;
  startTime: string;
  endTime: string;
  venueId: string;
  host: string;
  branchId: string;
  cover: string;
  capacity: number;
  description: string;
  dressCode: string;
  causeId?: string;
  albumCount?: number;
  cancelReason?: string;
}

const EVENT_SEEDS: EventSeed[] = [
  { id: "EVT-2026-011", title: "Today's family lunch · Kasarani", kind: "Reunion", status: "scheduled", date: "2026-05-06", startTime: "13:00", endTime: "15:00", venueId: "V-KAS", host: "NY-MBR-00005", branchId: "nairobi-peter", cover: "/images/family/sunday-lunch.jpg", capacity: 180, description: "Lunch for the Nairobi cousins and the Kasarani households. Bring a dish to share.", dressCode: "Smart casual" },
  { id: "EVT-2026-014", title: "Sunday devotion & family call", kind: "Devotion", status: "scheduled", date: "2026-05-10", startTime: "18:00", endTime: "19:30", venueId: "V-VIRT", host: "NY-MBR-00005", branchId: "nairobi-peter", cover: "/images/family/album.jpg", capacity: 999, description: "Scripture, a short prayer for the sick, and the branch news. Every branch joins from its own phone.", dressCode: "Any" },
  { id: "EVT-2026-016", title: "Caleb & Esther's wedding committee", kind: "Wedding", status: "scheduled", date: "2026-05-12", startTime: "17:30", endTime: "19:00", venueId: "V-ELD", host: "NY-MBR-00007", branchId: "kakamega-samuel", cover: "/images/family/wedding.jpg", capacity: 150, description: "Kitchen plan, décor, and the introduction ceremony timeline for the families.", dressCode: "Kitenge & ankara welcome" },
  { id: "EVT-2026-019", title: "Nairobi merry-go-round meeting", kind: "Meeting", status: "scheduled", date: "2026-05-14", startTime: "19:00", endTime: "20:30", venueId: "V-KAS", host: "NY-MBR-00019", branchId: "nairobi-peter", cover: "/images/family/meeting.jpg", capacity: 40, description: "Round 4 payouts, Sacco share purchases and the chama ledger review.", dressCode: "Smart casual" },
  { id: "EVT-2026-021", title: "Kisumu clinic drive planning", kind: "Medical camp", status: "scheduled", date: "2026-05-16", startTime: "10:00", endTime: "12:30", venueId: "V-KIS", host: "NY-MBR-00011", branchId: "kisumu-grace", cover: "/images/family/clinic.jpg", capacity: 90, description: "Nurses, medicines and the December clinic route. Volunteers welcome.", dressCode: "Comfortable", causeId: "CAU-2026-034" },
  { id: "EVT-2026-024", title: "Kimilili reunion committee", kind: "Meeting", status: "scheduled", date: "2026-05-24", startTime: "14:00", endTime: "16:00", venueId: "V-KIM", host: "NY-MBR-00003", branchId: "kimilili-joseph", cover: "/images/family/elgon.jpg", capacity: 80, description: "Menu, tents, transport from Nairobi and Mombasa, and the programme for reunion day.", dressCode: "Smart casual" },
  { id: "EVT-2026-027", title: "Mombasa coastal picnic", kind: "Reunion", status: "cancelled", date: "2026-05-17", startTime: "10:00", endTime: "16:00", venueId: "V-MOM", host: "NY-MBR-00012", branchId: "mombasa-daniel", cover: "/images/family/picnic.jpg", capacity: 120, description: "A day at Likoni beach with the coastal branch and their children.", dressCode: "Beachwear", cancelReason: "Heavy rain forecast at Likoni beach. It moves to July; watch the calendar." },
  { id: "EVT-2026-029", title: "Kimilili water project harambee", kind: "Harambee", status: "scheduled", date: "2026-05-31", startTime: "13:00", endTime: "17:00", venueId: "V-KIM", host: "NY-MBR-00003", branchId: "kimilili-joseph", cover: "/images/family/harambee.jpg", capacity: 250, description: "Pledge-led harambee for the village borehole and the tank line. Every pledge is read aloud and logged.", dressCode: "Traditional attire welcome", causeId: "CAU-2026-031" },
  { id: "EVT-2026-030", title: "Lynn Wakoli · pharmacy graduation dinner", kind: "Graduation", status: "scheduled", date: "2026-05-29", startTime: "18:30", endTime: "21:00", venueId: "V-KIT", host: "NY-MBR-00009", branchId: "kitale-ruth", cover: "/images/family/graduation.jpg", capacity: 150, description: "Celebrating Lynn's pharmacy licence: speeches from the elders, then dinner.", dressCode: "Smart" },
  { id: "EVT-2026-033", title: "Mzee Victor's 92nd birthday luncheon", kind: "Birthday", status: "scheduled", date: "2026-06-20", startTime: "13:00", endTime: "16:00", venueId: "V-KIM", host: "NY-MBR-00003", branchId: "nalyanya-main", cover: "/images/family/birthday.jpg", capacity: 200, description: "Lunch at the Kimilili compound with the Main branch and every household that can travel.", dressCode: "Traditional attire welcome" },
  { id: "EVT-2026-036", title: "Faith & Brian · 8th wedding anniversary", kind: "Anniversary", status: "scheduled", date: "2026-08-15", startTime: "17:00", endTime: "21:00", venueId: "V-KAS", host: "NY-MBR-00019", branchId: "nairobi-peter", cover: "/images/family/grandparents.jpg", capacity: 90, description: "A quiet dinner, a short toast, and the family's favourite playlist.", dressCode: "Elegant" },
  { id: "EVT-2026-039", title: "Nalyanya Family Reunion · Kimilili 2026", kind: "Reunion", status: "scheduled", date: "2026-07-25", startTime: "09:00", endTime: "18:00", venueId: "V-KIM", host: "NY-MBR-00003", branchId: "nalyanya-main", cover: "/images/family/reunion-attire.jpg", capacity: 400, description: "All twelve branches, the diaspora on video, the tree blessing and the clinic-fund harambee.", dressCode: "Traditional attire", causeId: "CAU-2026-034" },
  { id: "EVT-2026-041", title: "Diaspora Christmas call", kind: "Devotion", status: "draft", date: "2026-12-24", startTime: "16:00", endTime: "17:00", venueId: "V-VIRT", host: "NY-MBR-00014", branchId: "diaspora-naomi", cover: "/images/family/elgon.jpg", capacity: 500, description: "Draft for the diaspora. Waiting for the Family Head to confirm the time.", dressCode: "Any" },
  { id: "EVT-2025-112", title: "Christmas reunion · Kimilili", kind: "Reunion", status: "done", date: "2025-12-26", startTime: "11:00", endTime: "17:00", venueId: "V-KIM", host: "NY-MBR-00003", branchId: "nalyanya-main", cover: "/images/family/reunion.jpg", capacity: 400, description: "The December reunion under the mango tree, with the whole family.", dressCode: "Traditional attire", albumCount: 6 },
  { id: "EVT-2026-002", title: "New Year family devotion", kind: "Devotion", status: "done", date: "2026-01-04", startTime: "18:00", endTime: "19:00", venueId: "V-VIRT", host: "NY-MBR-00005", branchId: "nairobi-peter", cover: "/images/family/album.jpg", capacity: 999, description: "Watch-night prayers across twelve branches.", dressCode: "Any", albumCount: 3 },
  { id: "EVT-2026-006", title: "Esther Nanjala · 12th remembrance", kind: "Memorial", status: "done", date: "2026-01-25", startTime: "10:00", endTime: "13:00", venueId: "V-KIM", host: "NY-MBR-00003", branchId: "nalyanya-main", cover: "/images/family/elder-stick.jpg", capacity: 300, description: "A quiet service at the family grave, then lunch. We remember her kindness and her recipe book.", dressCode: "Modest & respectful", albumCount: 5 },
  { id: "EVT-2026-008", title: "Kimilili school bursary day", kind: "Graduation", status: "done", date: "2026-03-28", startTime: "09:00", endTime: "12:00", venueId: "V-KIM", host: "NY-MBR-00003", branchId: "kimilili-joseph", cover: "/images/family/reunion-attire.jpg", capacity: 200, description: "Bursaries handed to the Foundation's first cohort of Kimilili learners.", dressCode: "Smart", albumCount: 4 },
  { id: "EVT-2026-009", title: "Wakoli harambee · dairy shed roof", kind: "Harambee", status: "done", date: "2026-03-08", startTime: "14:00", endTime: "17:00", venueId: "V-KIT", host: "NY-MBR-00009", branchId: "kitale-ruth", cover: "/images/family/harambee.jpg", capacity: 260, description: "Pledges for the dairy co-operative's shed roof, read out loud and logged.", dressCode: "Traditional attire welcome", causeId: "CAU-2026-037", albumCount: 4 },
  { id: "EVT-2026-010", title: "Samuel's 63rd birthday", kind: "Birthday", status: "done", date: "2026-04-19", startTime: "17:00", endTime: "20:00", venueId: "V-MUM", host: "NY-MBR-00008", branchId: "kakamega-samuel", cover: "/images/family/birthday.jpg", capacity: 120, description: "Dinner in Mumias with the Kakamega branch and the Sugar Belt cousins.", dressCode: "Smart casual", albumCount: 6 },
  { id: "EVT-2026-012", title: "Easter family lunch · Nairobi", kind: "Reunion", status: "done", date: "2026-04-05", startTime: "13:00", endTime: "16:00", venueId: "V-KAS", host: "NY-MBR-00005", branchId: "nairobi-peter", cover: "/images/family/sunday-lunch.jpg", capacity: 180, description: "Easter lunch for the Nairobi households.", dressCode: "Smart casual", albumCount: 5 },
  { id: "EVT-2026-013", title: "Hellen's first-aid training", kind: "Medical camp", status: "done", date: "2026-04-12", startTime: "09:00", endTime: "13:00", venueId: "V-NYE", host: "NY-MBR-00013", branchId: "nyeri-hellen", cover: "/images/family/clinic.jpg", capacity: 70, description: "Basic first aid and CPR for cousins, with certificates at the end.", dressCode: "Comfortable", albumCount: 3 },
  { id: "EVT-2026-015", title: "Eldoret dairy co-op AGM", kind: "Meeting", status: "done", date: "2026-04-26", startTime: "10:00", endTime: "13:00", venueId: "V-ELD", host: "NY-MBR-00015", branchId: "eldoret-caleb", cover: "/images/family/meeting.jpg", capacity: 150, description: "Annual general meeting of the family-linked dairy co-operative.", dressCode: "Smart casual", albumCount: 3 },
];

function rsvpsFor(seedKey: string, status: EventStatus, capacity: number): EventRsvp[] {
  if (status === "draft") return [];
  const rand = mulberry32(Math.max(1, Math.floor(hashString(seedKey) * 2147483647)));
  const pool = MEMBERS.slice(0, 160);
  const n = Math.min(64, Math.max(10, Math.round(capacity / 6)));
  const used = new Set<number>();
  const chosen: Member[] = [];
  while (chosen.length < n) {
    const i = Math.floor(rand() * pool.length);
    if (!used.has(i)) {
      used.add(i);
      chosen.push(pool[i]);
    }
  }
  const done = status === "done";
  return chosen.map((m) => {
    const r = rand();
    const st: RsvpStatus = done
      ? r < 0.9 ? "going" : "declined"
      : r < 0.55 ? "going" : r < 0.7 ? "maybe" : r < 0.82 ? "pending" : "declined";
    return {
      memberId: m.id,
      status: status === "cancelled" ? "declined" : st,
      plusOnes: st === "going" && rand() < 0.3 ? between(rand, 1, 2) : 0,
      channel: m.whatsapp ? "WhatsApp" : "SMS",
      arrived: done && st === "going" && rand() < 0.86,
    };
  });
}

function albumFor(seedKey: string, count: number): AlbumShot[] {
  const start = Math.floor(hashString(seedKey) * ALBUM_POOL.length);
  return Array.from({ length: count }, (_, i) => ALBUM_POOL[(start + i) % ALBUM_POOL.length]);
}

function buildEvent(seed: EventSeed): FamilyEvent {
  const venue = VENUES.find((v) => v.id === seed.venueId);
  const host = MEMBERS.find((m) => m.id === seed.host);
  const album = seed.status === "done" && seed.albumCount ? albumFor(seed.id, seed.albumCount) : [];
  return {
    id: seed.id,
    title: seed.title,
    kind: seed.kind,
    status: seed.status,
    date: seed.date,
    startTime: seed.startTime,
    endTime: seed.endTime,
    venueId: seed.venueId,
    host: seed.host,
    branchId: seed.branchId,
    description: seed.description,
    dressCode: seed.dressCode,
    cover: seed.cover,
    capacity: seed.capacity,
    causeId: seed.causeId ?? null,
    album,
    albumName: album.length > 0 ? `${seed.title} · album` : null,
    reminders: seed.status === "scheduled" ? ["E-2d", "E-1h"] : [],
    rsvps: rsvpsFor(seed.id, seed.status, seed.capacity),
    cancelReason: seed.cancelReason ?? null,
    log: [
      `Created by ${host ? `${host.preferredName} ${host.lastName}` : "the family office"} · family office`,
      `Venue ${seed.status === "done" ? "held" : "confirmed"} · ${venue?.name ?? "Venue to confirm"}`,
      ...(seed.status === "cancelled" ? ["Cancelled · guests notified (SIMULATED)"] : []),
    ],
  };
}

/** The seeded event list — the single source the service layer hands to the page. */
export const EVENTS_SEED: FamilyEvent[] = EVENT_SEEDS.map(buildEvent);

export const REMINDER_OFFSETS: Array<{ id: ReminderOffset; label: string; hint: string }> = [
  { id: "E-2d", label: "Two days before", hint: "WhatsApp first, SMS for basic phones" },
  { id: "E-1h", label: "One hour before", hint: "Going and maybe guests only" },
];

export const INVITE_AUDIENCES = [
  { id: "all", label: "Whole family", note: "Every member with a phone or email" },
  { id: "branch", label: "One branch", note: "Pick one of the twelve branches" },
  { id: "gen", label: "One generation", note: "Pick a generation, e.g. Gen 3 cousins" },
  { id: "elders", label: "Council of Elders (60+)", note: "Routed to SMS for basic phones" },
  { id: "pending", label: "Pending RSVPs only", note: "Gently nudge the people who have not answered" },
] as const;

export type AudienceId = (typeof INVITE_AUDIENCES)[number]["id"];

export interface DeliveryReceipt {
  id: string;
  to: string;
  channel: Channel;
  status: "delivered" | "read" | "pending" | "failed";
  at: string;
  eventId: string;
}

export const DELIVERY_SEED: DeliveryReceipt[] = [
  { id: "RCP-7741", to: "Mercy Auma Nalyanya", channel: "WhatsApp", status: "read", at: "09:41 EAT", eventId: "EVT-2026-014" },
  { id: "RCP-7742", to: "Ann Nekesa Nalyanya", channel: "SMS", status: "delivered", at: "09:41 EAT", eventId: "EVT-2026-014" },
  { id: "RCP-7743", to: "Naomi Achieng Nalyanya", channel: "Email", status: "delivered", at: "09:42 EAT", eventId: "EVT-2026-014" },
  { id: "RCP-7744", to: "Samuel Kipkoech Nalyanya", channel: "WhatsApp", status: "pending", at: "09:44 EAT", eventId: "EVT-2026-016" },
  { id: "RCP-7745", to: "Lydia Jepkorir Nalyanya", channel: "SMS", status: "failed", at: "09:44 EAT", eventId: "EVT-2026-016" },
  { id: "RCP-7746", to: "Ethan Wekesa Nalyanya (guardian)", channel: "WhatsApp", status: "read", at: "09:46 EAT", eventId: "EVT-2026-029" },
  { id: "RCP-7747", to: "Daniel Wafula Nalyanya", channel: "WhatsApp", status: "delivered", at: "09:47 EAT", eventId: "EVT-2026-024" },
];

/* ─── Pure helpers used by every view ─────────────────────────────────── */

export function venueById(id: string): EventVenue | undefined {
  return VENUES.find((v) => v.id === id);
}

export function kindMeta(kind: EventKind): EventKindMeta {
  return EVENT_KINDS.find((k) => k.kind === kind) ?? EVENT_KINDS[0];
}

export function causeById(id: string | null): EventCause | undefined {
  return id ? CAUSES.find((c) => c.id === id) : undefined;
}

export function memberById(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export function rsvpSummary(event: FamilyEvent) {
  let going = 0;
  let maybe = 0;
  let declined = 0;
  let pending = 0;
  let plusOnes = 0;
  let arrived = 0;
  for (const r of event.rsvps) {
    if (r.status === "going") {
      going += 1;
      plusOnes += r.plusOnes;
      if (r.arrived) arrived += 1;
    } else if (r.status === "maybe") maybe += 1;
    else if (r.status === "declined") declined += 1;
    else pending += 1;
  }
  return { going, maybe, declined, pending, plusOnes, expected: going + plusOnes, arrived, total: event.rsvps.length };
}

export function sortByStart(list: FamilyEvent[]): FamilyEvent[] {
  return [...list].sort((a, b) => (a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)));
}
