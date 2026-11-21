/* ── H-3 Professions · mock data (typed, frontend-only) ─────────────────────
   PRIVACY: public visitors see a trade, a shortened name and a county.
   Phone numbers are always the same mask — never a dialable number.
   "Ask for help" does not reveal a contact; it queues a note for the
   family office and resolves SIMULATED. No home addresses, no fees tied
   to a person, no children's names.                                       */

import type { LucideIcon } from "lucide-react";
import {
  HeartPulse, Hammer, Zap, Wrench, GraduationCap, UtensilsCrossed,
  Music2, Camera, Scissors, Bike, Sprout, Scale,
} from "lucide-react";
import type { ShutterSlide } from "../../components/home/ApertureShutter";

import nurseImg from "../../assets/images/trade-nurse.jpg";
import fundiImg from "../../assets/images/trade-fundi.jpg";
import chefImg from "../../assets/images/trade-chef.jpg";
import photoImg from "../../assets/images/trade-photo.jpg";
import mechanicImg from "../../assets/images/trade-mechanic.jpg";
import schoolImg from "../../assets/images/school.jpg";
import electricImg from "../../assets/images/trade-electric.jpg";
import masonImg from "../../assets/images/trade-mason.jpg";
import tailorImg from "../../assets/images/trade-tailor.jpg";
import bodaImg from "../../assets/images/trade-boda.jpg";
import djImg from "../../assets/images/trade-dj.jpg";
import farmerImg from "../../assets/images/trade-farmer.jpg";
import accountsImg from "../../assets/images/leader-finance.jpg";
import weddingImg from "../../assets/images/wedding.jpg";
import teaImg from "../../assets/images/tea-hills.jpg";
import graduationImg from "../../assets/images/graduation.jpg";

export const MASKED_PHONE = "+254 7•• ••• •••";

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  blurb: string;
  range: string;
  image: string;
}

export const CATEGORIES: Category[] = [
  { id: "health", label: "Health", icon: HeartPulse, color: "#C62828", blurb: "Nurses and clinicians the family already trusts.", range: "Visit help, not a clinic bill", image: nurseImg },
  { id: "building", label: "Building", icon: Hammer, color: "#B5532A", blurb: "Masons and fundi for homes, repairs and harambee projects.", range: "Quoted per job, in person", image: masonImg },
  { id: "electrical", label: "Electrical", icon: Zap, color: "#D4A437", blurb: "Wiring, solar and the things that should not be guessed at.", range: "Quoted after a look", image: electricImg },
  { id: "mechanic", label: "Mechanics", icon: Wrench, color: "#1F4D3A", blurb: "Cars, motorbikes and the school bus that always needs something.", range: "Parts plus labour, agreed first", image: mechanicImg },
  { id: "teaching", label: "Teaching", icon: GraduationCap, color: "#2E7D32", blurb: "Holiday tuition and exam help, at the student's pace.", range: "A small thank-you, or free", image: schoolImg },
  { id: "food", label: "Food", icon: UtensilsCrossed, color: "#B5532A", blurb: "Caterers for weddings, funerals and the December reunion.", range: "Per head, agreed in writing", image: chefImg },
  { id: "events", label: "Events", icon: Music2, color: "#6A4C93", blurb: "DJs, MCs and planners who already know the family songs.", range: "Half-day or full-day", image: djImg },
  { id: "photos", label: "Photos", icon: Camera, color: "#1F4D3A", blurb: "Graduations, weddings and the reunion album.", range: "Album packages, no surprise extras", image: photoImg },
  { id: "tailoring", label: "Tailoring", icon: Scissors, color: "#6A4C93", blurb: "Uniforms, ceremony outfits and repairs before Sunday.", range: "Per garment", image: tailorImg },
  { id: "transport", label: "Transport", icon: Bike, color: "#D4A437", blurb: "Boda and errands inside the county — not long-distance.", range: "Town rates, agreed before you ride", image: bodaImg },
  { id: "farming", label: "Farming", icon: Sprout, color: "#2E7D32", blurb: "Seed, harvest hands and advice for the home shamba.", range: "Day rates at harvest", image: farmerImg },
  { id: "accounts", label: "Accounts & law", icon: Scale, color: "#1F4D3A", blurb: "Plain-language help with papers, tax and land questions.", range: "First conversation is free", image: accountsImg },
];

export interface Professional {
  id: string;
  name: string;
  initials: string;
  trade: string;
  category: string;
  county: string;
  photo: string;
  family: boolean;
  verified: boolean;
  years: number;
  blurb: string;
  helps: string[];
  featured?: boolean;
}

export const PROFESSIONALS: Professional[] = [
  { id: "mercy", name: "Mercy A. N.", initials: "MN", trade: "Nurse", category: "health", county: "Bungoma", photo: nurseImg, family: true, verified: true, years: 9, featured: true,
    blurb: "Helps the family read clinic notes and know when to go in — not a substitute for a hospital.", helps: ["Clinic-note reading", "First-aid refreshers", "Elder check-ins"] },
  { id: "peter", name: "Peter W. N.", initials: "PN", trade: "Fundi", category: "building", county: "Kakamega", photo: fundiImg, family: true, verified: true, years: 14, featured: true,
    blurb: "Roofs, doors and the small repairs that wait until someone is home.", helps: ["Roof patches", "Doors & windows", "Reunion stage"] },
  { id: "amina", name: "Amina K.", initials: "AK", trade: "Caterer", category: "food", county: "Nairobi", photo: chefImg, family: false, verified: true, years: 8, featured: true,
    blurb: "Cooks for family gatherings. A friend of the family, vouched for by the council.", helps: ["Wedding meals", "Funeral tea", "Reunion lunch"] },
  { id: "brian", name: "Brian O. N.", initials: "BN", trade: "Photographer", category: "photos", county: "Trans-Nzoia", photo: photoImg, family: true, verified: true, years: 6, featured: true,
    blurb: "Keeps the albums the gallery is built from. Children's photos stay with the family.", helps: ["Graduations", "Weddings", "Reunion day"] },
  { id: "hamza", name: "Hamza H.", initials: "HH", trade: "Mechanic", category: "mechanic", county: "Bungoma", photo: mechanicImg, family: false, verified: true, years: 11, featured: true,
    blurb: "The garage the matatu and the boda riders already use. Vetted, not a relative.", helps: ["Service", "Brakes", "Motorbikes"] },
  { id: "faith", name: "Faith C. N.", initials: "FN", trade: "Teacher", category: "teaching", county: "Nairobi", photo: schoolImg, family: true, verified: true, years: 7, featured: true,
    blurb: "Holiday maths and English for secondary students. No child's name is listed here.", helps: ["Holiday tuition", "Exam practice", "Reading help"] },
  { id: "david", name: "David K. N.", initials: "DN", trade: "Electrician", category: "electrical", county: "Kakamega", photo: electricImg, family: true, verified: true, years: 10,
    blurb: "House wiring and small solar. He will not start until the power is off.", helps: ["House wiring", "Solar", "Fault finding"] },
  { id: "joseph", name: "Joseph M.", initials: "JM", trade: "Mason", category: "building", county: "Trans-Nzoia", photo: masonImg, family: false, verified: true, years: 16,
    blurb: "Brick and foundation work. A family friend, checked by two branch heads.", helps: ["House walls", "Floors", "Water tanks"] },
  { id: "nelly", name: "Nelly S. N.", initials: "NS", trade: "Tailor", category: "tailoring", county: "Bungoma", photo: tailorImg, family: true, verified: true, years: 12,
    blurb: "Ceremony outfits and school-uniform repairs, finished before the date.", helps: ["Ceremony wear", "Uniforms", "Repairs"] },
  { id: "samuel", name: "Samuel O.", initials: "SO", trade: "Boda rider", category: "transport", county: "Bungoma", photo: bodaImg, family: false, verified: true, years: 5,
    blurb: "Errands and short rides inside the county. Night rides are not offered.", helps: ["Market runs", "Clinic rides", "Parcel drops"] },
  { id: "kevin", name: "Kevin N. N.", initials: "KN", trade: "DJ & MC", category: "events", county: "Nairobi", photo: djImg, family: true, verified: true, years: 8,
    blurb: "Knows which songs the elders will actually dance to.", helps: ["Weddings", "Reunion night", "Introductions"] },
  { id: "paul", name: "Paul B. N.", initials: "PB", trade: "Farmer", category: "farming", county: "Bungoma", photo: farmerImg, family: true, verified: true, years: 22,
    blurb: "Harvest hands and seed advice for the home shamba. No land papers shared here.", helps: ["Harvest days", "Seed choice", "Soil advice"] },
  { id: "grace", name: "Grace N. N.", initials: "GN", trade: "Accountant", category: "accounts", county: "Nairobi", photo: accountsImg, family: true, verified: true, years: 9,
    blurb: "Helps members read a payslip or a land form. She does not keep your papers.", helps: ["Payslips", "Simple tax", "Form reading"] },
  { id: "linda", name: "Linda W.", initials: "LW", trade: "Event planner", category: "events", county: "Kakamega", photo: weddingImg, family: false, verified: false, years: 4,
    blurb: "New to the directory — listed, not yet verified. Ask the council before you book.", helps: ["Guest lists", "Tent & chairs", "Day-of running"] },
];

export const FEATURED = PROFESSIONALS.filter((p) => p.featured);

export function categoryOf(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function countIn(categoryId: string): number {
  return PROFESSIONALS.filter((p) => p.category === categoryId).length;
}

export function matches(p: Professional, query: string, category: string): boolean {
  if (category !== "all" && p.category !== category) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const cat = categoryOf(p.category)?.label ?? "";
  return [p.name, p.trade, p.county, p.blurb, cat, p.family ? "family" : "friend"].join(" ").toLowerCase().includes(q);
}

/* ── Header shutter ── */
export const TRADE_SLIDES: ShutterSlide[] = [
  { src: electricImg, alt: "An electrician working on a wiring job", meta: "Electrical · Kakamega", caption: "The jobs the family already knows how to do." },
  { src: masonImg, alt: "A mason laying bricks", meta: "Building", caption: "Homes, tanks and the reunion stage." },
  { src: chefImg, alt: "A cook finishing a dish", meta: "Food · Nairobi", caption: "Meals for the days we gather." },
  { src: bodaImg, alt: "A motorcycle taxi rider on a city street", meta: "Transport · Bungoma", caption: "Short rides. County only." },
  { src: farmerImg, alt: "A farmer with a harvest", meta: "Farming", caption: "Harvest hands for the home shamba." },
  { src: djImg, alt: "A DJ at a mixer", meta: "Events", caption: "Songs the elders will dance to." },
];

/* ── Hire flow ── */
export const HIRE_STEPS = [
  { n: "01", title: "Browse", copy: "Pick a trade and a county. You see a role and a shortened name — never a phone number." },
  { n: "02", title: "Send a note", copy: "Say what you need. The family office forwards it. This page does not dial anyone." },
  { n: "03", title: "Agree first", copy: "Price, day and place are agreed between you, in person or on a call they start." },
  { n: "04", title: "Rate after", copy: "A short note helps the next relative. It never includes a phone or an address." },
];

/* ── Endorsements — no identifying detail beyond role + branch ── */
export interface Endorsement { quote: string; name: string; role: string; frame: number }
export const ENDORSEMENTS: Endorsement[] = [
  { quote: "We needed a roof before the rains. The fundi was one of us, and the price was the price we agreed.", name: "House of Wafula", role: "Bungoma branch", frame: 1 },
  { quote: "Tuition over the holiday, and no one had to share a child's full name on a form.", name: "A parent, 4th generation", role: "Nairobi", frame: 5 },
  { quote: "The caterer fed the whole reunion and still had tea for the late arrivals.", name: "Reunion hosts", role: "Kakamega", frame: 2 },
  { quote: "I sent a note, not a phone number. Someone called me back the same day.", name: "Family member", role: "Trans-Nzoia", frame: 0 },
];

export const ENDORSEMENT_SLIDES: ShutterSlide[] = [
  { src: electricImg, alt: "Electrical work", meta: "A note, not a number", caption: "The office calls back. The page never does." },
  { src: fundiImg, alt: "A fundi on a ladder", meta: "Building", caption: "Agreed before the work starts." },
  { src: chefImg, alt: "Cooking for a gathering", meta: "Food", caption: "Enough for the late arrivals." },
  { src: tailorImg, alt: "A tailor at a sewing machine", meta: "Tailoring", caption: "Finished before the ceremony." },
  { src: teaImg, alt: "Green hills of Western Kenya", meta: "The home counties", caption: "Help stays close to home." },
  { src: graduationImg, alt: "A graduation celebration", meta: "Teaching", caption: "Holiday help, no public names." },
];

/* ── Coverage ── */
export const COUNTIES = ["Bungoma", "Kakamega", "Nairobi", "Trans-Nzoia"] as const;

/* ── Verification + list-your-skill ── */
export const VERIFY_STEPS = [
  { title: "Someone in the family knows you", copy: "A branch head or the council confirms you are who you say you are." },
  { title: "Two members speak for the trade", copy: "Not a certificate check — a 'yes, they did this job well' from two relatives." },
  { title: "The chip appears", copy: "Verified by family. Until then the listing says so, in plain words." },
];

export const CHANNELS = [
  { id: "office", label: "Family office note", detail: "Default. A person reads it and passes it on." },
  { id: "whatsapp", label: "WhatsApp", detail: "Only if they already use it. We never publish the number." },
  { id: "sms", label: "SMS", detail: "For people without WhatsApp. Same rule: the number stays hidden." },
] as const;

export const PROFESSIONS_CTA = {
  eyebrow: "Family helping family",
  title: "Have a skill",
  titleAccent: "the family can use?",
  copy: "Join the directory. Your phone stays behind sign-in — this public page never prints it.",
};
