/* ── A-4 Family / lineage creator · page data (typed, frontend-only) ──────────
   Privacy: only the founder's public facts are asked — root name, origin
   town/county, motto. Co-admin is a phone the founder types themselves.   */

import type { ShutterSlide } from "../../components/home/ApertureShutter";
import type { AuthVisual } from "../../components/auth/AuthShell";
import savannaImg from "../../assets/images/savanna.jpg";
import teaHillsImg from "../../assets/images/tea-hills.jpg";
import traditionalGroupImg from "../../assets/images/traditional-group.jpg";
import congregationImg from "../../assets/images/congregation.jpg";

export const CREATE_VISUAL: AuthVisual = {
  src: savannaImg,
  alt: "Acacia trees on the savanna at golden hour",
  kicker: "Plant a new lineage",
  line: "Every great tree was once a seed.",
  caption: "Name the root, raise the first branch — the family grows from there.",
};

export const CREATE_SLIDES: ShutterSlide[] = [
  { src: savannaImg, alt: "Acacia trees on the savanna at golden hour", meta: "The land", caption: "Every lineage starts with a place." },
  { src: teaHillsImg, alt: "Green tea hills under a wide sky", meta: "The origin", caption: "Name the hills you come from." },
  { src: traditionalGroupImg, alt: "Family members in traditional dress", meta: "The people", caption: "One root ancestor, one first branch." },
  { src: congregationImg, alt: "A community gathered together", meta: "The future", caption: "Invite the branch heads. Grow." },
];

export const CREATE_STEPS = ["Identity", "Root & branch", "Story & heads"] as const;

export interface CrestOption { id: string; label: string; bg: string; fg: string; glyph: "tree" | "sun" | "shield" | "river" | "drum" | "horn" | "star" | "knot" }

export const CRESTS: CrestOption[] = [
  { id: "acacia", label: "Acacia", bg: "#1F4D3A", fg: "#F3D488", glyph: "tree" },
  { id: "sunrise", label: "Sunrise", bg: "#B5532A", fg: "#FFF6E3", glyph: "sun" },
  { id: "shield", label: "Shield", bg: "#143527", fg: "#D4A437", glyph: "shield" },
  { id: "river", label: "River", bg: "#2E5F74", fg: "#EAF6FF", glyph: "river" },
  { id: "drum", label: "Drum", bg: "#6A4C93", fg: "#F1E8FF", glyph: "drum" },
  { id: "horn", label: "Horn", bg: "#8A5A2B", fg: "#FFF1D6", glyph: "horn" },
  { id: "star", label: "Morning star", bg: "#3A3A5C", fg: "#FFE9A8", glyph: "star" },
  { id: "knot", label: "Knot", bg: "#5C2E2E", fg: "#FFE3D6", glyph: "knot" },
];

export const BRANCH_COLORS = ["#1F4D3A", "#B5532A", "#D4A437", "#6A4C93", "#2E7D32", "#2E5F74"] as const;

export const ORIGIN_COUNTIES = ["Bungoma", "Kakamega", "Trans-Nzoia", "Nairobi", "Murang'a", "Mombasa", "Other"] as const;

export const TIMELINE_SEEDS = [
  { id: "founding", label: "Founding", hint: "e.g. 1938 — the first house is built" },
  { id: "migration", label: "Migrations", hint: "e.g. 1989 — work takes a branch to Nairobi" },
  { id: "present", label: "Present", hint: "e.g. 2025 — the branches gather every December" },
] as const;

export const CUSTOM_FAMILY_KEY = "ny-custom-family";
