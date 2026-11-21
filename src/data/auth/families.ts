/* ── AUTH · mock data (typed, frontend-only) ────────────────────────────────
   Privacy: seeded members are shortened names + role + county only. No phone,
   date of birth, address or salary is anywhere in this file.                 */

export const KENYA_PHONE_RE = /^(\+?254|0)[\s-]?[17]\d{2}[\s-]?\d{3}[\s-]?\d{3}$/;
export const IDENTIFIER_RE = /^((\+?254|0)[\s-]?[17]\d{2}[\s-]?\d{3}[\s-]?\d{3}|[^\s@]+@[^\s@]+\.[^\s@]{2,})$/;

/* ─── families on Nalyanya ─── */
export interface Family {
  id: string;
  name: string;
  root: string;
  members: number;
  branches: { id: string; name: string }[];
  tagline: string;
}

export const FAMILIES: Family[] = [
  { id: "nalyanya", name: "Nalyanya", root: "Mzee Victor Nalyanya", members: 240, tagline: "Bungoma · 5 generations", branches: [
    { id: "bungoma-east", name: "Bungoma · East" }, { id: "kakamega", name: "Kakamega" }, { id: "trans-nzoia", name: "Trans-Nzoia" }, { id: "nairobi", name: "Nairobi" }, { id: "uganda", name: "Uganda · Kampala" }, { id: "us", name: "United States" },
  ] },
  { id: "wakoli", name: "Wakoli", root: "Mzee Elias Wakoli", members: 186, tagline: "Bungoma · 4 generations", branches: [
    { id: "bungoma", name: "Bungoma" }, { id: "nairobi", name: "Nairobi" },
  ] },
  { id: "barasa", name: "Barasa", root: "Mzee Moses Barasa", members: 132, tagline: "Kakamega · 4 generations", branches: [
    { id: "kakamega-north", name: "Kakamega · North" }, { id: "nairobi", name: "Nairobi" }, { id: "mombasa", name: "Mombasa" },
  ] },
  { id: "chebet", name: "Chebet", root: "Mzee Kiprotich Chebet", members: 97, tagline: "Trans-Nzoia · 3 generations", branches: [
    { id: "kitale", name: "Kitale" }, { id: "us", name: "United States" },
  ] },
  { id: "mwangi", name: "Mwangi", root: "Mzee Kamau Mwangi", members: 214, tagline: "Murang'a · 5 generations", branches: [
    { id: "muranga", name: "Murang'a" }, { id: "nairobi", name: "Nairobi" },
  ] },
];

/* ─── seeded relatives for the "Link me to a member" search ─── */
export interface Relative { id: string; label: string; role: string; house: string; county: string }
export const RELATIVES: Relative[] = [
  { id: "rel-01", label: "Joseph W. N.", role: "Family Head", house: "House of Wafula", county: "Bungoma" },
  { id: "rel-02", label: "Mama Agnes N.", role: "Council of Elders", house: "House of Nekesa", county: "Kakamega" },
  { id: "rel-03", label: "Faith C. N.", role: "Finance Officer", house: "House of Chebet", county: "Nairobi" },
  { id: "rel-04", label: "Brian O. N.", role: "Teacher · 4th generation", house: "House of Barasa", county: "Trans-Nzoia" },
  { id: "rel-05", label: "Hamza H.", role: "Mechanic · friend of the family", house: "House of Juma", county: "Bungoma" },
  { id: "rel-06", label: "Grace N. N.", role: "Foundation Chair", house: "House of Nafula", county: "Nairobi" },
  { id: "rel-07", label: "Paul B. N.", role: "Farmer · 3rd generation", house: "House of Wafula", county: "Bungoma" },
  { id: "rel-08", label: "Mercy A. N.", role: "Nurse · 4th generation", house: "House of Nekesa", county: "Bungoma" },
];

export const RELATIONSHIP_PICKS = [
  "Son / daughter",
  "Father / mother",
  "Uncle / aunt",
  "Cousin",
  "Spouse",
  "In-law",
  "Grandchild",
  "Other",
] as const;

export const CONSENTS = [
  { id: "data", title: "My data stays in the family", copy: "Names and roles are visible to members. Numbers, birth dates and money-routing details stay hidden behind sign-in." },
  { id: "dpa", title: "Kenya Data Protection Act 2019", copy: "Minimum data, consent first. You can ask for your record to be corrected or removed." },
  { id: "conduct", title: "Family code of conduct", copy: "Old and young together. No solicitation, no shaming in the broadcast channels." },
] as const;

/* Simulated OTP for this phase — the UI always says so. */
export const SIMULATED_CODE = "123456";
