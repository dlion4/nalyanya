/* T-13 Professions & Expertise — the directory of family members and friends who offer services
   (frontend-only Phase 1). Every count, rating, endorsement total and category figure is COMPUTED
   from the records below. Phone numbers are stored in full in the mock, but shown masked until a
   member confirms a reveal (SIMULATED). KES via kes() · EAT dates (ISO) · IDs per nalyanyaMO.md §3.4
   (NY-PRO listings · NY-END endorsements · NY-CTC contact tickets · NY-AUD audit). */

import type { Frame } from "@/data/dashboard/contributions";

export const ME_ID = "m05";
export const AS_OF = "2025-11-18";
export const THIS_MONTH = "2025-11";

export const BRANCHES: Branch[] = ["Nairobi", "Bungoma", "Kakamega", "Trans-Nzoia", "Diaspora"];

export type Kind = "family" | "friend";
export type Branch = "Nairobi" | "Bungoma" | "Kakamega" | "Trans-Nzoia" | "Diaspora";
export type Reach = "whatsapp" | "sms" | "call" | "email";
export type Urgency = "this-week" | "soon" | "flexible";
export type EndorseStatus = "pending" | "approved" | "rejected";
export type Unit = "consultation" | "visit" | "hour" | "day" | "job";
export type Tone = "plain" | "gold" | "red";

export type Category = { id: string; name: string; blurb: string; image: string; enabled: boolean };
export type Shot = { src: string; caption: string };

export type Pro = {
  id: string;
  ref: string;
  name: string;
  initials: string;
  role: string;
  kind: Kind;
  relation: string;
  categoryId: string;
  services: string[];
  town: string;
  branch: Branch;
  phone: string;
  email: string;
  whatsapp: boolean;
  verified: boolean;
  years: number;
  languages: string[];
  rateKes: number;
  rateUnit: Unit;
  transportKes: number;
  availability: string;
  image: string;
  portfolio: Shot[];
  bio: string;
  since: string;
};

export type Review = { id: string; pid: string; by: string; stars: number; text: string; at: string };
export type Endorsement = { id: string; pid: string; by: string; at: string; note: string; status: EndorseStatus; reason: string };
export type Ticket = { id: string; ref: string; pid: string; need: string; urgency: Urgency; reach: Reach; at: string; requester: string };
export type AuditEntry = { ref: string; at: string; actor: string; action: string; entity: string; detail: string; tone: Tone };

export const URGENCY_LABEL: Record<Urgency, string> = {
  "this-week": "This week",
  soon: "Within a month",
  flexible: "Flexible",
};

export const REACH_LABEL: Record<Reach, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  call: "Phone call",
  email: "Email",
};

export const UNIT_LABEL: Record<Unit, string> = {
  consultation: "per consultation",
  visit: "per visit",
  hour: "per hour",
  day: "per day",
  job: "per job",
};

/* ------------------------------------------------------------------ */
/* Categories — ten, one switched off so the manager has a real state    */
/* ------------------------------------------------------------------ */
export const categories: Category[] = [
  { id: "cat-health", name: "Health & care", blurb: "Doctors, nurses and home carers", image: "/images/cause-medical.jpg", enabled: true },
  { id: "cat-edu", name: "Education & tutoring", blurb: "Tutors, teachers and bursary help", image: "/images/cause-school.jpg", enabled: true },
  { id: "cat-build", name: "Construction & repairs", blurb: "Builders, plumbers, carpenters and engineers", image: "/images/cause-water.jpg", enabled: true },
  { id: "cat-food", name: "Catering & events", blurb: "Caterers, decorators and harambee planners", image: "/images/cause-wedding.jpg", enabled: true },
  { id: "cat-legal", name: "Legal & finance", blurb: "Advocates, accountants and tax help", image: "/images/fin-sacco.jpg", enabled: true },
  { id: "cat-agri", name: "Farming & agronomy", blurb: "Soil, seed, water and harvest advice", image: "/images/contrib-hero.jpg", enabled: true },
  { id: "cat-biz", name: "Business & trade", blurb: "Tailors, traders and small workshops", image: "/images/fin-chama-hero.jpg", enabled: true },
  { id: "cat-care", name: "Care & companionship", blurb: "Elder companions and family carers", image: "/images/frame-elder.jpg", enabled: true },
  { id: "cat-tech", name: "Tech & support", blurb: "Phones, laptops and remote help", image: "/images/frame-reunion.jpg", enabled: true },
  { id: "cat-transport", name: "Transport & driving", blurb: "Drivers and upcountry runs", image: "/images/cause-memorial.jpg", enabled: false },
];

export const catById = (id: string): Category | undefined => categories.find((c) => c.id === id);

/* ------------------------------------------------------------------ */
/* Listings — fifteen people, family and friends                         */
/* ------------------------------------------------------------------ */
export const pros: Pro[] = [
  {
    id: "p01", ref: "NY-PRO-0001", name: "Dr. Anyango Otieno", initials: "AO", role: "Family doctor", kind: "friend",
    relation: "Friend of the family since 2019", categoryId: "cat-health",
    services: ["General consultation", "Chronic care review", "Home visits in Nairobi"],
    town: "Kilimani, Nairobi", branch: "Nairobi", phone: "+254722501188", email: "anyango.o@clinic.example",
    whatsapp: true, verified: true, years: 12, languages: ["English", "Dholuo", "Kiswahili"],
    rateKes: 2000, rateUnit: "consultation", transportKes: 500, availability: "Mon–Sat · 08:00–17:00",
    image: "/images/cause-medical.jpg",
    portfolio: [
      { src: "/images/cause-medical.jpg", caption: "Clinic corridor on a Tuesday morning." },
      { src: "/images/frame-elder.jpg", caption: "Checking blood pressure at the bedside." },
    ],
    bio: "Has looked after three generations of Nalyanya families. Patient with elders, clear with children.",
    since: "2019-03-02",
  },
  {
    id: "p02", ref: "NY-PRO-0002", name: "Grace Kwamboka Nalyanya", initials: "GK", role: "Maternity and home-care nurse", kind: "family",
    relation: "Aunt · Kakamega", categoryId: "cat-health",
    services: ["Home nursing", "Maternity follow-up", "Post-surgery dressing"],
    town: "Kakamega Town", branch: "Kakamega", phone: "+254721004417", email: "grace.kwamboka@example.com",
    whatsapp: true, verified: true, years: 9, languages: ["English", "Kiswahili", "Luhya"],
    rateKes: 1500, rateUnit: "visit", transportKes: 300, availability: "Daily · 07:00–19:00",
    image: "/images/cause-medical.jpg",
    portfolio: [{ src: "/images/cause-medical.jpg", caption: "Dressing change after a long ward stay." }],
    bio: "A registered nurse who knows which families need a visit before they ask.",
    since: "2021-01-15",
  },
  {
    id: "p03", ref: "NY-PRO-0003", name: "Eng. Kiprono Rotich", initials: "KR", role: "Civil engineer · site supervision", kind: "friend",
    relation: "Engineer on the Musanda hall job", categoryId: "cat-build",
    services: ["Site supervision", "Structural assessment", "Borehole siting"],
    town: "Eldoret", branch: "Trans-Nzoia", phone: "+254733118204", email: "kiprono.rotich@eng.example",
    whatsapp: false, verified: false, years: 15, languages: ["English", "Kalenjin", "Kiswahili"],
    rateKes: 8000, rateUnit: "visit", transportKes: 2500, availability: "Weekdays · by appointment",
    image: "/images/cause-water.jpg",
    portfolio: [{ src: "/images/cause-water.jpg", caption: "Test pump at the Musanda borehole." }],
    bio: "Supervised the hall roof and the borehole test. Writes quotes in plain words.",
    since: "2022-06-10",
  },
  {
    id: "p04", ref: "NY-PRO-0004", name: "Fundi Juma Hassan", initials: "JH", role: "Plumber · water systems", kind: "friend",
    relation: "Recommended by the Bungoma branch", categoryId: "cat-build",
    services: ["Water tanks", "Pipe repairs", "Pump installation"],
    town: "Musanda, Bungoma", branch: "Bungoma", phone: "+254712883310", email: "",
    whatsapp: true, verified: true, years: 7, languages: ["Swahili", "Lubukusu", "English"],
    rateKes: 1200, rateUnit: "hour", transportKes: 400, availability: "Mon–Sat · 07:00–16:00",
    image: "/images/cause-water.jpg",
    portfolio: [{ src: "/images/cause-water.jpg", caption: "Hand pump and concrete apron at Musanda." }],
    bio: "Fixes the things that carry water. Comes on the first call and leaves the site clean.",
    since: "2020-09-01",
  },
  {
    id: "p05", ref: "NY-PRO-0005", name: "Asha Mohamed", initials: "AM", role: "Tailor · alterations and uniforms", kind: "friend",
    relation: "Neighbour in Ngara", categoryId: "cat-biz",
    services: ["School uniforms", "Alterations", "Wedding outfits"],
    town: "Ngara, Nairobi", branch: "Nairobi", phone: "+254740552019", email: "",
    whatsapp: true, verified: false, years: 11, languages: ["Swahili", "English", "Somali"],
    rateKes: 800, rateUnit: "job", transportKes: 0, availability: "Mon–Sat · 09:00–18:00",
    image: "/images/fin-chama-hero.jpg",
    portfolio: [{ src: "/images/frame-reunion.jpg", caption: "Matching outfits for a family reunion." }],
    bio: "Can take a school uniform in and let a wedding dress out on the same afternoon.",
    since: "2020-02-18",
  },
  {
    id: "p06", ref: "NY-PRO-0006", name: "Agnes Wanjiru Nalyanya", initials: "AW", role: "Caterer · events and harambees", kind: "family",
    relation: "Mother · Nairobi", categoryId: "cat-food",
    services: ["Harambee catering", "Wedding catering", "Funeral catering"],
    town: "Karen, Nairobi", branch: "Nairobi", phone: "+254722006612", email: "agnes.wanjiru@example.com",
    whatsapp: true, verified: true, years: 14, languages: ["Kikuyu", "Swahili", "English"],
    rateKes: 35000, rateUnit: "job", transportKes: 3000, availability: "Book two weeks ahead",
    image: "/images/cause-wedding.jpg",
    portfolio: [{ src: "/images/cause-wedding.jpg", caption: "Dancing under string lights at a Karen wedding." }],
    bio: "Feeds three hundred people without a plate running out. Keeps the harambee books clean.",
    since: "2018-05-20",
  },
  {
    id: "p07", ref: "NY-PRO-0007", name: "Advocate Wekesa Mulongo", initials: "WM", role: "Advocate · land and family law", kind: "friend",
    relation: "Family advocate since 2016", categoryId: "cat-legal",
    services: ["Land searches", "Succession", "Contracts"],
    town: "Nairobi CBD", branch: "Nairobi", phone: "+254735770014", email: "wekesa@mulongo.example",
    whatsapp: false, verified: true, years: 16, languages: ["English", "Kiswahili", "Lubukusu"],
    rateKes: 3000, rateUnit: "consultation", transportKes: 0, availability: "Mon–Fri · 09:00–16:30",
    image: "/images/fin-sacco.jpg",
    portfolio: [{ src: "/images/fin-sacco.jpg", caption: "Reading a land title at the registry counter." }],
    bio: "Has settled more family land questions than anyone should. Explains the fee before the work starts.",
    since: "2016-02-14",
  },
  {
    id: "p08", ref: "NY-PRO-0008", name: "Hamza Hassan Nalyanya", initials: "HH", role: "Accountant · tax returns and KRA", kind: "family",
    relation: "Cousin · Nairobi", categoryId: "cat-legal",
    services: ["Individual tax returns", "KRA iTax filing", "Chama bookkeeping"],
    town: "Westlands, Nairobi", branch: "Nairobi", phone: "+254712330077", email: "hamza.hassan@example.com",
    whatsapp: true, verified: true, years: 8, languages: ["English", "Kiswahili"],
    rateKes: 4500, rateUnit: "job", transportKes: 0, availability: "Mon–Fri · 10:00–18:00",
    image: "/images/contrib-hero.jpg",
    portfolio: [{ src: "/images/contrib-hero.jpg", caption: "Counting the November collection, ledger open." }],
    bio: "Files the return on time and keeps the receipts in one folder for the next year.",
    since: "2021-04-01",
  },
  {
    id: "p09", ref: "NY-PRO-0009", name: "Collins Munyasia Nalyanya", initials: "CM", role: "Agronomist · maize and beans", kind: "family",
    relation: "Brother · Bungoma", categoryId: "cat-agri",
    services: ["Soil testing advice", "Seed selection", "Farm planning"],
    town: "Musanda, Bungoma", branch: "Bungoma", phone: "+254702440911", email: "",
    whatsapp: true, verified: false, years: 10, languages: ["Lubukusu", "Swahili", "English"],
    rateKes: 1500, rateUnit: "visit", transportKes: 600, availability: "Weekends and Tue/Thu",
    image: "/images/contrib-hero.jpg",
    portfolio: [{ src: "/images/cause-water.jpg", caption: "Water and seed plan for the kitchen garden." }],
    bio: "Shows the soil results on one sheet of paper and says what to plant next season.",
    since: "2019-10-07",
  },
  {
    id: "p10", ref: "NY-PRO-0010", name: "Faith Chebet Nalyanya", initials: "FC", role: "Tutor · Maths and sciences", kind: "family",
    relation: "Sister · Nairobi", categoryId: "cat-edu",
    services: ["Maths tutoring", "Sciences", "Exam revision"],
    town: "Kileleshwa, Nairobi", branch: "Nairobi", phone: "+254707558841", email: "faith.chebet@example.com",
    whatsapp: true, verified: true, years: 6, languages: ["English", "Kiswahili"],
    rateKes: 1000, rateUnit: "hour", transportKes: 0, availability: "Mon–Fri · 16:00–19:00 · Sat morning",
    image: "/images/cause-school.jpg",
    portfolio: [{ src: "/images/cause-school.jpg", caption: "Form 2 revision class under the acacia." }],
    bio: "Makes Maths make sense. Sends a short progress note home every Friday.",
    since: "2021-07-01",
  },
  {
    id: "p11", ref: "NY-PRO-0011", name: "Peter Mutiso", initials: "PM", role: "Driver · airport and upcountry runs", kind: "friend",
    relation: "Recommended by Esther N.", categoryId: "cat-transport",
    services: ["Airport pickup", "Upcountry trips", "Clinic runs for elders"],
    town: "Kitale", branch: "Trans-Nzoia", phone: "+254726111905", email: "",
    whatsapp: true, verified: false, years: 9, languages: ["Kiswahili", "English", "Kalenjin"],
    rateKes: 6000, rateUnit: "day", transportKes: 1200, availability: "Daily · 06:00–20:00",
    image: "/images/cause-memorial.jpg",
    portfolio: [{ src: "/images/cause-memorial.jpg", caption: "Carrying the family to a send-off in Kitale." }],
    bio: "On time for the elders. Calls ahead when the road is bad.",
    since: "2023-02-03",
  },
  {
    id: "p12", ref: "NY-PRO-0012", name: "Mama Sarah Wanyonyi", initials: "SW", role: "Elder care companion", kind: "friend",
    relation: "Neighbour elder · Bungoma (not a member)", categoryId: "cat-care",
    services: ["Companion visits", "Medication reminders", "Meal support"],
    town: "Musanda, Bungoma", branch: "Bungoma", phone: "+254743990052", email: "",
    whatsapp: false, verified: false, years: 22, languages: ["Lubukusu", "Swahili"],
    rateKes: 500, rateUnit: "visit", transportKes: 200, availability: "Mon–Sat · 08:00–12:00",
    image: "/images/frame-elder.jpg",
    portfolio: [{ src: "/images/frame-elder.jpg", caption: "Tea and a conversation after the morning round." }],
    bio: "Has nursed half the village through a bad season. Speaks slowly and listens longer.",
    since: "2024-04-12",
  },
  {
    id: "p13", ref: "NY-PRO-0013", name: "Samuel Kiprop Nalyanya", initials: "SK", role: "Carpenter · furniture and repairs", kind: "family",
    relation: "Uncle · Kitale", categoryId: "cat-build",
    services: ["Doors and windows", "Furniture", "Roof timber"],
    town: "Kitale", branch: "Trans-Nzoia", phone: "+254720981174", email: "",
    whatsapp: true, verified: true, years: 25, languages: ["Kalenjin", "Swahili", "English"],
    rateKes: 2500, rateUnit: "day", transportKes: 500, availability: "Mon–Sat · 08:00–17:00",
    image: "/images/frame-reunion.jpg",
    portfolio: [{ src: "/images/frame-reunion.jpg", caption: "Timber for the reunion benches, cut in Kitale." }],
    bio: "Built the benches the family sat on at the reunion. Still sands them every year.",
    since: "2015-08-01",
  },
  {
    id: "p14", ref: "NY-PRO-0014", name: "Kevin Otieno Nalyanya", initials: "KO", role: "IT support · remote help", kind: "family",
    relation: "Cousin · London", categoryId: "cat-tech",
    services: ["Phone and laptop set-up", "Remote help", "M-Pesa and app questions"],
    town: "London (remote)", branch: "Diaspora", phone: "+447700900311", email: "kevin.otieno@example.com",
    whatsapp: true, verified: false, years: 5, languages: ["English", "Kiswahili"],
    rateKes: 2000, rateUnit: "hour", transportKes: 0, availability: "Evenings EAT · weekends",
    image: "/images/fin-chama-hero.jpg",
    portfolio: [{ src: "/images/fin-chama-hero.jpg", caption: "Setting up a phone for a savings group call." }],
    bio: "Gets phones talking across time zones. Explains M-Pesa in plain words.",
    since: "2023-10-05",
  },
  {
    id: "p15", ref: "NY-PRO-0015", name: "Lydia Atieno Nalyanya", initials: "LA", role: "Registered nurse · remote advice", kind: "family",
    relation: "Sister · Toronto", categoryId: "cat-health",
    services: ["Remote health advice", "Medication questions", "Hospital navigation"],
    town: "Toronto (remote)", branch: "Diaspora", phone: "+14165550182", email: "lydia.atieno@example.com",
    whatsapp: true, verified: false, years: 13, languages: ["English", "Dholuo"],
    rateKes: 1500, rateUnit: "consultation", transportKes: 0, availability: "Evenings EAT · Sundays",
    image: "/images/cause-medical.jpg",
    portfolio: [{ src: "/images/cause-medical.jpg", caption: "Corridor shot on a family visit to the clinic." }],
    bio: "Works nights in Toronto and answers messages at breakfast in Nairobi.",
    since: "2022-11-20",
  },
];

export const proById = (id: string): Pro | undefined => pros.find((p) => p.id === id);

/* ------------------------------------------------------------------ */
/* Reviews, endorsements, tickets and the audit trail                    */
/* ------------------------------------------------------------------ */
const R = (id: string, pid: string, by: string, stars: number, text: string, at: string): Review => ({ id, pid, by, stars, text, at });
export const reviews: Review[] = [
  R("r01", "p01", "Ruth Akinyi Nalyanya", 5, "Came on a Saturday when my pressure spiked. Explained every tablet.", "2025-11-02"),
  R("r02", "p01", "Joseph Nyongesa Nalyanya", 4, "Good with the children. A short wait, but worth it.", "2025-10-14"),
  R("r03", "p02", "Dennis Barasa Nalyanya", 5, "Dressed the wound every day for a week without being asked twice.", "2025-11-06"),
  R("r04", "p02", "Esther Nafula Nalyanya", 4, "Kind and direct. She does not rush the elders.", "2025-10-27"),
  R("r05", "p03", "Collins Munyasia Nalyanya", 5, "Wrote a plain quote and stuck to it.", "2025-10-22"),
  R("r06", "p03", "Brian Otieno Nalyanya", 4, "Thorough. Took two visits to close out the roof.", "2025-09-30"),
  R("r07", "p04", "Esther Nafula Nalyanya", 5, "Fixed the tank the same afternoon.", "2025-11-10"),
  R("r08", "p05", "Millicent Aoko Nalyanya", 4, "Altered my wedding dress in two weeks. Very neat.", "2025-10-08"),
  R("r09", "p06", "Hamza Hassan Nalyanya", 5, "Three hundred guests at the Kakamega harambee. Not one plate ran out.", "2025-09-18"),
  R("r10", "p06", "Faith Chebet Nalyanya", 5, "Kept the budget on one page. The tea was excellent.", "2025-08-30"),
  R("r11", "p07", "Peter Wanyama Nalyanya", 5, "Explained the search fee before I paid anything.", "2025-11-04"),
  R("r12", "p07", "Samuel Kiprop Nalyanya", 4, "Slow to answer emails, quick to act in court.", "2025-07-19"),
  R("r13", "p08", "Lydia Atieno Nalyanya", 5, "Filed my return from Toronto without a single phone call.", "2025-11-11"),
  R("r14", "p09", "Brian Otieno Nalyanya", 4, "Showed the soil results on one sheet of paper.", "2025-06-25"),
  R("r15", "p10", "Ruth Akinyi Nalyanya", 5, "My grandson's Maths grade went from D to B.", "2025-10-30"),
  R("r16", "p10", "Esther Nafula Nalyanya", 5, "Sends a note home every Friday. Reliable.", "2025-11-14"),
  R("r17", "p11", "Mzee Victor Nalyanya", 4, "Arrived before dawn for the clinic run. Careful on the bad road.", "2025-08-12"),
  R("r18", "p12", "Grace Kwamboka Nalyanya", 5, "She sat with my mother for an afternoon and made her laugh.", "2025-10-02"),
  R("r19", "p13", "Hamza Hassan Nalyanya", 5, "Built the new benches for the reunion. They are still solid.", "2025-03-21"),
  R("r20", "p13", "Kevin Otieno Nalyanya", 4, "Fair price for the door frames.", "2025-04-02"),
  R("r21", "p14", "Peter Wanyama Nalyanya", 4, "Got my mother onto a video call in one evening.", "2025-10-19"),
  R("r22", "p15", "Ruth Akinyi Nalyanya", 5, "Answers the questions I forget to ask at the clinic.", "2025-09-09"),
];

const E = (id: string, pid: string, by: string, at: string, note: string, status: Endorsement["status"], reason = ""): Endorsement => ({
  id,
  pid,
  by,
  at,
  note,
  status,
  reason,
});
export const endorsements: Endorsement[] = [
  E("e01", "p01", "Faith Chebet Nalyanya", "2025-11-03", "Trustworthy with the whole family.", "approved"),
  E("e02", "p01", "Hamza Hassan Nalyanya", "2025-10-11", "Quick follow-up calls.", "approved"),
  E("e03", "p02", "Agnes Wanjiru Nalyanya", "2025-11-12", "Reliable at night as well.", "pending"),
  E("e04", "p02", "Peter Wanyama Nalyanya", "2025-09-02", "Great home visits.", "approved"),
  E("e05", "p03", "Brian Otieno Nalyanya", "2025-10-05", "Handled the Musanda inspection.", "approved"),
  E("e06", "p04", "Collins Munyasia Nalyanya", "2025-11-15", "Honest about the cost of parts.", "approved"),
  E("e07", "p05", "Grace Kwamboka Nalyanya", "2025-11-08", "Excellent with school uniforms.", "pending"),
  E("e08", "p06", "Hamza Hassan Nalyanya", "2025-11-01", "Books and food on one invoice.", "approved"),
  E("e09", "p07", "Ruth Akinyi Nalyanya", "2025-09-20", "Trusted with succession work.", "approved"),
  E("e10", "p07", "Samuel Kiprop Nalyanya", "2025-11-16", "Good with the elders.", "pending"),
  E("e11", "p08", "Peter Wanyama Nalyanya", "2025-11-10", "The tax year closed on time.", "approved"),
  E("e12", "p08", "Millicent Aoko Nalyanya", "2025-10-18", "Simple explanations.", "rejected", "Duplicate of an earlier endorsement."),
  E("e13", "p09", "Brian Otieno Nalyanya", "2025-06-28", "Knows the Bungoma soil.", "approved"),
  E("e14", "p10", "Esther Nafula Nalyanya", "2025-11-05", "Patient with my son.", "approved"),
  E("e15", "p10", "Joseph Nyongesa Nalyanya", "2025-11-17", "Makes exams less scary.", "pending"),
  E("e16", "p11", "Esther Nafula Nalyanya", "2025-08-14", "Safe driver on the Kitale road.", "rejected", "Category is switched off for now."),
  E("e17", "p12", "Grace Kwamboka Nalyanya", "2025-10-03", "Kind to my mother.", "approved"),
  E("e18", "p13", "Kevin Otieno Nalyanya", "2025-04-03", "Solid work.", "approved"),
  E("e19", "p14", "Ruth Akinyi Nalyanya", "2025-10-21", "Patient on the phone.", "approved"),
  E("e20", "p15", "Hamza Hassan Nalyanya", "2025-11-13", "Good medical sense from far away.", "pending"),
];

export const tickets: Ticket[] = [
  { id: "t01", ref: "NY-CTC-2025-00001", pid: "p01", need: "Review my blood pressure tablets before the next visit.", urgency: "this-week", reach: "whatsapp", at: "2025-11-17", requester: "Ruth Akinyi Nalyanya" },
  { id: "t02", ref: "NY-CTC-2025-00002", pid: "p07", need: "Check a land search before we pay the registry fee.", urgency: "soon", reach: "email", at: "2025-11-14", requester: "Joseph Nyongesa Nalyanya" },
];

export const auditSeed: AuditEntry[] = [
  { ref: "NY-AUD-01160", at: "18 Nov · 09:12", actor: "Peter Wanyama Nalyanya", action: "endorsement.approve", entity: "NY-END · p08", detail: "Endorsement from Peter W. approved for Hamza H.", tone: "gold" },
  { ref: "NY-AUD-01159", at: "17 Nov · 16:40", actor: "Ruth Akinyi Nalyanya", action: "contact.ticket", entity: "NY-CTC-2025-00001", detail: "Ticket for Dr. Anyango Otieno · WhatsApp · SIMULATED", tone: "plain" },
  { ref: "NY-AUD-01158", at: "16 Nov · 11:05", actor: "Family head · Mzee V. office", action: "verify.grant", entity: "NY-PRO-0008", detail: "Verified-by-family badge granted · 2FA verified", tone: "gold" },
  { ref: "NY-AUD-01157", at: "14 Nov · 08:30", actor: "Peter Wanyama Nalyanya", action: "category.disable", entity: "cat-transport", detail: "Transport & driving switched off · reason logged", tone: "red" },
  { ref: "NY-AUD-01156", at: "12 Nov · 15:10", actor: "Peter Wanyama Nalyanya", action: "endorsement.reject", entity: "NY-END · e16", detail: "Rejected: category is switched off for now", tone: "red" },
  { ref: "NY-AUD-01155", at: "10 Nov · 09:50", actor: "Faith Chebet Nalyanya", action: "listing.edit", entity: "NY-PRO-0010", detail: "Rate changed from KES 800 to KES 1,000 per hour", tone: "plain" },
];

/* The photographs behind the directory — reused for stories, galleries and uploads. */
export const PORTFOLIO_LIBRARY: Shot[] = [
  { src: "/images/cause-medical.jpg", caption: "Clinic corridor, shot on a family visit." },
  { src: "/images/cause-school.jpg", caption: "Revision class under the acacia tree." },
  { src: "/images/cause-water.jpg", caption: "Borehole and water point, Musanda." },
  { src: "/images/cause-wedding.jpg", caption: "Dancing under string lights at a wedding." },
  { src: "/images/fin-sacco.jpg", caption: "A land title on the registry counter." },
  { src: "/images/contrib-hero.jpg", caption: "Counting the November collection." },
  { src: "/images/frame-elder.jpg", caption: "Tea and conversation after the morning round." },
  { src: "/images/frame-reunion.jpg", caption: "Five generations on the homestead steps." },
];

export const frames: Frame[] = [
  { id: "fp1", src: "/images/cause-medical.jpg", title: "Clinic corridor", caption: "A nurse walks a grandmother to the consulting room. The listing says who will be there.", frame: "51", lens: "35mm", exposure: "1/60 · f2", place: "Nairobi" },
  { id: "fp2", src: "/images/cause-school.jpg", title: "Revision class", caption: "Form 2 under the acacia. The tutor is a cousin who charges a fair hour rate.", frame: "52", lens: "50mm", exposure: "1/500 · f2.8", place: "Nairobi" },
  { id: "fp3", src: "/images/cause-water.jpg", title: "The borehole", caption: "The water point the plumber and the engineer checked together, before the hall opened.", frame: "53", lens: "28mm", exposure: "1/1000 · f5.6", place: "Musanda" },
  { id: "fp4", src: "/images/cause-wedding.jpg", title: "The wedding floor", caption: "Caterer and decorator on the same invoice, the night the dancing started.", frame: "54", lens: "35mm", exposure: "1/30 · f1.8", place: "Karen" },
  { id: "fp5", src: "/images/fin-sacco.jpg", title: "The registry", caption: "An advocate reads the title before anyone pays a fee. That is the whole point of the directory.", frame: "55", lens: "50mm", exposure: "1/80 · f2.8", place: "Nairobi" },
  { id: "fp6", src: "/images/frame-elder.jpg", title: "Mama's round", caption: "A neighbour elder brings tea and an hour of company. Some help is not measured in visits.", frame: "56A", lens: "90mm", exposure: "1/45 · f2.8", place: "Musanda" },
  { id: "fp7", src: "/images/frame-reunion.jpg", title: "The benches", caption: "Built by a carpenter in Kitale, still in use at every reunion since.", frame: "57", lens: "85mm", exposure: "1/250 · f4", place: "Trans-Nzoia" },
  { id: "fp8", src: "/images/contrib-hero.jpg", title: "The harambee table", caption: "Where the family first asked each other who could help. The directory keeps that question alive.", frame: "58", lens: "35mm", exposure: "1/125 · f2.8", place: "Bungoma" },
];

/* ------------------------------------------------------------------ */
/* Derived helpers — every count and rating the page shows              */
/* ------------------------------------------------------------------ */
export const maskPhone = (phone: string): string => `${phone.slice(0, 5)} ··· ${phone.slice(-4)}`;

export function ratingOf(pid: string, list: Review[]): { avg: number; count: number } {
  const mine = list.filter((r) => r.pid === pid);
  if (mine.length === 0) return { avg: 0, count: 0 };
  const sum = mine.reduce((s, r) => s + r.stars, 0);
  return { avg: Math.round((sum / mine.length) * 10) / 10, count: mine.length };
}

export const approvedOf = (pid: string, list: Endorsement[]): number =>
  list.filter((e) => e.pid === pid && e.status === "approved").length;

export const pendingCount = (list: Endorsement[]): number => list.filter((e) => e.status === "pending").length;

export const monthApproved = (list: Endorsement[]): number =>
  list.filter((e) => e.status === "approved" && e.at.startsWith(THIS_MONTH)).length;

export const quoteOf = (p: Pro, qty: number, travel: boolean): number => p.rateKes * qty + (travel ? p.transportKes : 0);

export const fmtDate = (iso: string): string => {
  const M = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [y, m, d] = iso.split("-");
  return `${Number(d)} ${M[Number(m) - 1]} ${y}`;
};

export const towns = (list: Pro[]): string[] => Array.from(new Set(list.map((p) => p.town))).sort();

/* ------------------------------------------------------------------ */
/* Filters                                                              */
/* ------------------------------------------------------------------ */
export type Filters = {
  q: string;
  cat: string;
  branch: "all" | Branch;
  town: string;
  kind: "all" | Kind;
  verified: boolean;
};

export const emptyFilters: Filters = { q: "", cat: "all", branch: "all", town: "all", kind: "all", verified: false };

export function countFilters(f: Filters): number {
  return (f.q ? 1 : 0) + (f.cat !== "all" ? 1 : 0) + (f.branch !== "all" ? 1 : 0) + (f.town !== "all" ? 1 : 0) + (f.kind !== "all" ? 1 : 0) + (f.verified ? 1 : 0);
}

export function applyFilters(list: Pro[], f: Filters): Pro[] {
  const q = f.q.trim().toLowerCase();
  return list.filter((p) => {
    if (f.cat !== "all" && p.categoryId !== f.cat) return false;
    if (f.branch !== "all" && p.branch !== f.branch) return false;
    if (f.town !== "all" && p.town !== f.town) return false;
    if (f.kind !== "all" && p.kind !== f.kind) return false;
    if (f.verified && !p.verified) return false;
    if (q && !`${p.name} ${p.role} ${p.services.join(" ")} ${p.town} ${catById(p.categoryId)?.name ?? ""}`.toLowerCase().includes(q)) return false;
    return true;
  });
}
