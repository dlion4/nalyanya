/* ── H-2 About · mock data (typed, frontend-only) ───────────────────────────
   PRIVACY RULE FOR THIS PAGE: public visitors see roles, abbreviated names,
   county-level places and approximate counts only. Phone numbers, exact
   addresses, dates of birth, balances, children's names and money-routing
   details are never in this file — they live behind family sign-in.       */

import type { LucideIcon } from "lucide-react";
import {
  Church, HeartHandshake, HandHeart, TreePine, Landmark, GraduationCap, Megaphone, Images,
  Phone, MapPinned, CalendarDays, Wallet, Baby, KeyRound, Users, Globe2, Sprout,
} from "lucide-react";
import type { ShutterSlide } from "../../components/home/ApertureShutter";

import reunionImg from "../../assets/images/reunion.jpg";
import savannaImg from "../../assets/images/savanna.jpg";
import teaImg from "../../assets/images/tea-hills.jpg";
import nairobiImg from "../../assets/images/nairobi.jpg";
import familyTraditionalImg from "../../assets/images/family-traditional.jpg";
import traditionalGroupImg from "../../assets/images/traditional-group.jpg";
import grandmotherImg from "../../assets/images/grandmother.jpg";
import weddingImg from "../../assets/images/wedding.jpg";
import graduationImg from "../../assets/images/graduation.jpg";
import outdoorGraduationImg from "../../assets/images/outdoor-graduation.jpg";
import schoolImg from "../../assets/images/school.jpg";
import choirImg from "../../assets/images/choir.jpg";
import congregationImg from "../../assets/images/congregation.jpg";
import leaderHeadImg from "../../assets/images/leader-head.jpg";
import leaderMatriarchImg from "../../assets/images/leader-matriarch.jpg";
import leaderFinanceImg from "../../assets/images/leader-finance.jpg";
import leaderFoundationImg from "../../assets/images/leader-foundation.jpg";
import elderImg from "../../assets/images/elder.jpg";

/* ─── S1 · Header ─── */
export const ABOUT_HEADER = {
  eyebrow: "About the family",
  title: "Our roots",
  titleAccent: "run deep.",
  sub: "Nalyanya began as one household in Bungoma under Mzee Victor Nalyanya. Five generations later we are 240+ people in 12 branches — still one tree, still one name.",
  motto: "Imarishi",
  mottoMeaning: "we stand firm",
};

export const HEADER_SLIDES: ShutterSlide[] = [
  { src: reunionImg, alt: "Family reunion under a shade tree", meta: "Reunion · Bungoma", caption: "Every December the branches come home." },
  { src: teaImg, alt: "Green tea hills of Western Kenya", meta: "The land · Western Kenya", caption: "The hills our grandparents farmed." },
  { src: familyTraditionalImg, alt: "Family in traditional attire", meta: "Tradition", caption: "Dressed for the ceremony, together." },
  { src: savannaImg, alt: "Acacia tree at sunset", meta: "Homestead sunset", caption: "Evenings at the homestead, kept in memory." },
];

export interface GenChip { gen: string; label: string; count: number }
export const GEN_CHIPS: GenChip[] = [
  { gen: "1st", label: "The root", count: 1 },
  { gen: "2nd", label: "Founding children", count: 9 },
  { gen: "3rd", label: "Branch heads", count: 34 },
  { gen: "4th", label: "Growing stock", count: 88 },
  { gen: "5th", label: "Newest leaves", count: 110 },
];

/* ─── S2 · Origin story (scroll-driven shutter) ─── */
export interface OriginChapter { year: string; title: string; copy: string; slide: ShutterSlide }
export const ORIGIN_CHAPTERS: OriginChapter[] = [
  { year: "1938", title: "Mzee Victor Nalyanya plants the root", copy: "A young farmer clears land near the slopes of Mt Elgon and builds the first house. The family name begins here.",
    slide: { src: elderImg, alt: "Portrait of an elder in warm light", meta: "1938 · Bungoma", caption: "The root of the tree." } },
  { year: "1946", title: "The matriarchs of the house", copy: "The household grows around the women who held it together — the keepers of the stories, songs and recipes we still use.",
    slide: { src: grandmotherImg, alt: "Grandmother with granddaughters", meta: "1946 · The homestead", caption: "The keepers of the stories." } },
  { year: "1958", title: "Nine founding children", copy: "Nine children grow up on the farm. Each one will later become the head of a branch of the family.",
    slide: { src: teaImg, alt: "Green farmland hills", meta: "1958 · The farm", caption: "Nine children, one farm." } },
  { year: "1972", title: "Branches take root", copy: "Marriages and new homes form the first branches — in Bungoma, Kakamega and Trans-Nzoia — without ever leaving home.",
    slide: { src: weddingImg, alt: "A couple blessed by elders", meta: "1972 · First branches", caption: "Blessings that became branches." } },
  { year: "1989", title: "Western Kenya → Nairobi → the world", copy: "Work and school take the next generation to Nairobi, then Kampala and the United States. The tree stretches; the roots hold.",
    slide: { src: nairobiImg, alt: "Nairobi skyline", meta: "1989 · Migration", caption: "From the farm to the city." } },
  { year: "2025", title: "One living tree", copy: "Today 240+ members across 5 generations keep the lineage, the money pool and the memories in one shared home.",
    slide: { src: reunionImg, alt: "Large family gathering outdoors", meta: "2025 · Today", caption: "Still one tree." } },
];

/* ─── S3 · Generations (3D) ─── */
export interface Generation { id: number; gen: string; title: string; approx: number; copy: string; color: string }
export const GENERATIONS: Generation[] = [
  { id: 0, gen: "1st", title: "The root", approx: 1, copy: "Mzee Victor Nalyanya — the gold centre every branch grows from.", color: "#D4A437" },
  { id: 1, gen: "2nd", title: "Founding children", approx: 9, copy: "The nine children of the farm; each became the head of a branch.", color: "#1F4D3A" },
  { id: 2, gen: "3rd", title: "Branch heads", approx: 34, copy: "The generation that built homes in four counties and started the chama.", color: "#B5532A" },
  { id: 3, gen: "4th", title: "Growing stock", approx: 88, copy: "Teachers, nurses, engineers and farmers — the family's working backbone.", color: "#6A4C93" },
  { id: 4, gen: "5th", title: "Newest leaves", approx: 110, copy: "Students and little ones. Their profiles are guardian-managed and never public.", color: "#2E7D32" },
];

/* ─── S4 · Values & traditions (flip cards) ─── */
export interface Value { id: string; icon: LucideIcon; title: string; image: string; copy: string; shows: string[]; accent: string }
export const VALUES: Value[] = [
  { id: "faith", icon: Church, title: "Faith", image: congregationImg, accent: "#D4A437",
    copy: "We begin gatherings with prayer and end them with thanks. Faith is the quiet strength that kept the family steady through hard seasons.",
    shows: ["Sunday blessing at the reunion", "Prayers before every harambee", "Thanksgiving for each new birth"] },
  { id: "family", icon: HeartHandshake, title: "Family", image: familyTraditionalImg, accent: "#1F4D3A",
    copy: "Nobody walks alone. A father in one branch is an uncle in another — and everyone is responsible for everyone.",
    shows: ["The annual December reunion", "The chama and the merry-go-round", "Elders consulted before big decisions"] },
  { id: "service", icon: HandHeart, title: "Service", image: schoolImg, accent: "#6A4C93",
    copy: "We lift the next one up — in the family and in the villages we come from — through the Nalyanya Foundation.",
    shows: ["School fees and books for students", "Medical support for members", "Community projects at home"] },
];

/* ─── S5 · The family today ─── */
export interface TodayStat { value: number; suffix: string; label: string; icon: LucideIcon }
export const TODAY_STATS: TodayStat[] = [
  { value: 240, suffix: "+", label: "members", icon: Users },
  { value: 12, suffix: "", label: "branches", icon: TreePine },
  { value: 5, suffix: "", label: "generations", icon: Sprout },
  { value: 4, suffix: "", label: "counties", icon: MapPinned },
  { value: 3, suffix: "", label: "countries", icon: Globe2 },
];

export interface CountyPin { id: string; name: string; x: number; y: number; branches: number; root?: boolean }
export const COUNTY_PINS: CountyPin[] = [
  { id: "bungoma", name: "Bungoma", x: 26, y: 146, branches: 4, root: true },
  { id: "kakamega", name: "Kakamega", x: 33, y: 158, branches: 3 },
  { id: "trans-nzoia", name: "Trans-Nzoia", x: 41, y: 129, branches: 2 },
  { id: "nairobi", name: "Nairobi", x: 103, y: 208, branches: 3 },
];
export const DIASPORA = [
  { code: "UG", name: "Uganda", note: "Kampala households" },
  { code: "US", name: "United States", note: "Diaspora cousins" },
];

/* ─── S6 · Branches (12) — house names only, counts approximate ─── */
export interface Branch { name: string; county: string; members: number; color: string }
export const BRANCHES: Branch[] = [
  { name: "House of Wafula", county: "Bungoma", members: 31, color: "#1F4D3A" },
  { name: "House of Nekesa", county: "Bungoma", members: 24, color: "#B5532A" },
  { name: "House of Barasa", county: "Kakamega", members: 22, color: "#6A4C93" },
  { name: "House of Nafula", county: "Trans-Nzoia", members: 19, color: "#D4A437" },
  { name: "House of Wanjala", county: "Nairobi", members: 23, color: "#2E7D32" },
  { name: "House of Simiyu", county: "Bungoma", members: 18, color: "#1F4D3A" },
  { name: "House of Khaemba", county: "Kakamega", members: 17, color: "#B5532A" },
  { name: "House of Nasimiyu", county: "Nairobi", members: 20, color: "#6A4C93" },
  { name: "House of Wekesa", county: "Trans-Nzoia", members: 16, color: "#D4A437" },
  { name: "House of Makokha", county: "Kakamega", members: 15, color: "#2E7D32" },
  { name: "House of Juma", county: "Bungoma · diaspora", members: 18, color: "#1F4D3A" },
  { name: "House of Chebet", county: "Nairobi · diaspora", members: 19, color: "#B5532A" },
];

/* ─── S7 · Gatherings (shutter carousel) ─── */
export interface Gathering { id: string; title: string; when: string; copy: string; slide: ShutterSlide }
export const GATHERINGS: Gathering[] = [
  { id: "reunion", title: "The December reunion", when: "Every December · Bungoma", copy: "Three days, every branch, one homestead.",
    slide: { src: reunionImg, alt: "Family reunion", meta: "Reunion", caption: "All branches, one yard." } },
  { id: "blessing", title: "Sunday blessing", when: "Reunion Sunday", copy: "Elders bless the newly married and the newly born.",
    slide: { src: weddingImg, alt: "Elders blessing a couple", meta: "Blessing", caption: "Elders bless the next generation." } },
  { id: "graduations", title: "Graduation send-offs", when: "Whenever one of us finishes", copy: "The whole family shows up — in person or on video.",
    slide: { src: graduationImg, alt: "Graduates celebrating", meta: "Graduations", caption: "One graduates, everyone celebrates." } },
  { id: "harambee", title: "Harambee", when: "When someone needs help", copy: "We pull together for school fees, hospital bills and projects.",
    slide: { src: traditionalGroupImg, alt: "Community gathering in traditional attire", meta: "Harambee", caption: "Pulling together." } },
  { id: "choir", title: "Choir & thanksgiving", when: "Reunion evenings", copy: "Songs passed from the matriarchs to the youngest voices.",
    slide: { src: choirImg, alt: "School choir outside a church", meta: "Thanksgiving", caption: "Songs that outlive us." } },
  { id: "graduation-field", title: "Foundation day", when: "Every March", copy: "The Foundation celebrates the students it sponsors.",
    slide: { src: outdoorGraduationImg, alt: "Outdoor graduation ceremony", meta: "Foundation", caption: "Lifting the next one up." } },
];

/* ─── S8 · Membership (accordion) ─── */
export interface MembershipItem { id: string; icon: LucideIcon; title: string; summary: string; points: string[]; simulated?: boolean }
export const MEMBERSHIP: MembershipItem[] = [
  { id: "lineage", icon: TreePine, title: "Your place in the 3D family tree", summary: "See where you sit — and every role you hold.",
    points: ["Walk all 5 generations in 3D", "One person can be a son here and an uncle there", "Ask an admin to fix or add a relative"] },
  { id: "sacco", icon: Landmark, title: "The family Sacco & chama", summary: "Save together, borrow fairly, rotate the pot.", simulated: true,
    points: ["Buy shares and watch them grow", "Borrow up to 3× your shares", "Merry-go-round payouts by M-Pesa (connects in Phase 2)"] },
  { id: "foundation", icon: GraduationCap, title: "The Nalyanya Foundation", summary: "School fees, hospital bills, emergencies.",
    points: ["Apply for help in plain language", "Give once or monthly", "Every shilling is recorded and auditable"] },
  { id: "broadcasts", icon: Megaphone, title: "Family broadcasts", summary: "News reaches everyone — even without a smartphone.", simulated: true,
    points: ["WhatsApp for those who have it", "SMS for those who don't", "Funeral notices and reunion reminders in one tap"] },
  { id: "gallery", icon: Images, title: "The family gallery", summary: "Every photo, kept with its album and year.", simulated: true,
    points: ["Weddings, graduations, in-memoriam", "Pull albums from Google Drive (Phase 2)", "Children's photos visible to members only"] },
];

/* ─── S9 · Leadership roll (privacy-safe) ─── */
export interface Leader { role: string; name: string; branch: string; photo: string; since: string; duty: string; accent: string }
export const LEADERS: Leader[] = [
  { role: "Family Head", name: "Joseph W. N.", branch: "House of Wafula", photo: leaderHeadImg, since: "Since 2016", duty: "Chairs the family council and the reunion.", accent: "#D4A437" },
  { role: "Council of Elders", name: "Mama Agnes N.", branch: "House of Nekesa", photo: leaderMatriarchImg, since: "Since 2009", duty: "Keeps traditions and settles disputes kindly.", accent: "#1F4D3A" },
  { role: "Finance Officer", name: "Faith C. N.", branch: "House of Chebet", photo: leaderFinanceImg, since: "Since 2021", duty: "Runs the Sacco, chama rounds and the ledger.", accent: "#B5532A" },
  { role: "Foundation Chair", name: "Dr. Grace N. N.", branch: "House of Nafula", photo: leaderFoundationImg, since: "Since 2019", duty: "Leads education and medical grants.", accent: "#6A4C93" },
];

/* ─── S10 · Privacy promise ─── */
export interface PrivacyRow { icon: LucideIcon; label: string }
export const PUBLIC_SHOWS: PrivacyRow[] = [
  { icon: Users, label: "Roles and shortened names" },
  { icon: MapPinned, label: "County-level places only" },
  { icon: TreePine, label: "Approximate member counts" },
  { icon: Images, label: "Photos shared with consent" },
];
export const PRIVATE_KEEPS: PrivacyRow[] = [
  { icon: Phone, label: "Phone numbers & emails" },
  { icon: MapPinned, label: "Home addresses & villages" },
  { icon: CalendarDays, label: "Dates of birth & IDs" },
  { icon: Wallet, label: "Balances, M-Pesa & bank details" },
  { icon: Baby, label: "Children's names & photos" },
  { icon: KeyRound, label: "Receive PINs & OTP codes" },
];

export const VEIL_FIELDS = [
  { label: "Phone", value: "+254 7•• ••• •••" },
  { label: "Village", value: "••••••••, Bungoma" },
  { label: "Born", value: "•• / •• / 19••" },
  { label: "Sacco shares", value: "KES ••,•••" },
];

/* ─── S11 · CTA ─── */
export const ABOUT_CTA = {
  eyebrow: "Your place is waiting",
  title: "See yourself",
  titleAccent: "in the tree.",
  copy: "Sign in to find your branch, your generation and every role you hold in the family.",
};
