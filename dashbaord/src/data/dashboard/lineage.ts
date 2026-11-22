import type { AuditEntry, Presence } from "@/types/family";

/* T-2 Lineage — page data. Shared family graph lives in src/data/family/*. */

export const CURRENT_USER_ID = "NY-MBR-00019";

export const LINEAGE_HEADLINE = {
  eyebrow: "T-2 · Lineage",
  title: "The Nalyanya Family Tree",
  motto: "Umoja ni nguvu",
  mottoMeaning: "Unity is strength",
  lede: "Rooted at Mzee Victor Nalyanya in Kimilili. Orbit the tree, dolly into any branch, and find every place where you belong.",
};

/** Multi-presence: the Family Head also holds these positions in other branches. */
export const PRESENCES: Presence[] = [
  { id: "PRS-01", memberId: "NY-MBR-00019", branchId: "kakamega-samuel", role: "Education sponsor & guardian", generation: 3 },
  { id: "PRS-02", memberId: "NY-MBR-00019", branchId: "mombasa-daniel", role: "Ward guardian · Ethan", generation: 3 },
  { id: "PRS-03", memberId: "NY-MBR-00019", branchId: "kitale-ruth", role: "Co-trustee · Wakoli family trust", generation: 3 },
];

export const ARCHIVE_SLIDES = [
  { src: "/images/family/reunion.jpg", alt: "Family gathered outdoors for the Kimilili reunion", caption: "The Kimilili reunion — the whole family under one tent", year: "2025", place: "Kimilili, Bungoma" },
  { src: "/images/family/wedding.jpg", alt: "Wedding guests celebrating with music and dancing", caption: "Caleb & Esther's wedding — the dance floor never emptied", year: "2019", place: "Nakuru" },
  { src: "/images/family/grandparents.jpg", alt: "Grandparents and grandchildren laughing together on a sofa", caption: "Grandparents' Sunday, with the little ones in charge", year: "2025", place: "Nairobi" },
  { src: "/images/family/sunday-lunch.jpg", alt: "Family sharing a warm dinner table", caption: "Sunday lunch — the Nairobi branch table", year: "2026", place: "Kasarani" },
  { src: "/images/family/elgon.jpg", alt: "Misty green mountain landscape", caption: "The hills our grandfathers walked, Bungoma County", year: "2024", place: "Mount Elgon" },
  { src: "/images/family/archive.jpg", alt: "Black and white vintage family portrait", caption: "Found in the trunk: an early family portrait", year: "1978", place: "Kimilili" },
  { src: "/images/family/album.jpg", alt: "Hands turning through an old photo album", caption: "The family album, digitised for the Nalyanya archive", year: "2026", place: "Nairobi" },
  { src: "/images/family/reunion-attire.jpg", alt: "Family in traditional attire smiling in a park", caption: "Harambee day — traditional attire and laughter", year: "2025", place: "Kitale" },
  { src: "/images/family/tea-hills.jpg", alt: "Aerial view of green tea hills", caption: "Samuel's farm and the tea hills of Kakamega", year: "2023", place: "Kakamega" },
];

export const SAYINGS = [
  { sw: "Umoja ni nguvu, utengano ni udhaifu.", en: "Unity is strength; division is weakness.", by: "Mzee Victor Nalyanya" },
  { sw: "Haba na haba hujaza kibaba.", en: "Little by little, the measure fills.", by: "Esther Nanjala (late)" },
  { sw: "Kidole kimoja hakivunji chawa.", en: "One finger cannot crush a louse, so we lift each other.", by: "Mzee Victor Nalyanya" },
];

export const AUDIT_SEED: AuditEntry[] = [
  { id: "NY-AUD-2026-0412", at: "2026-05-04 09:12 EAT", actor: "Brian Otieno Nalyanya · Family Head", action: "relation.added", entity: "NY-MBR-00018", summary: "Linked Faith Chebet Nalyanya as spouse", before: "No spouse on file", after: "Spouse: NY-MBR-00018", reason: "Marriage certificate verified", status: "applied" },
  { id: "NY-AUD-2026-0409", at: "2026-05-03 16:40 EAT", actor: "Brian Otieno Nalyanya · Family Head", action: "member.deceased", entity: "NY-MBR-00010", summary: "Recorded Elias Wakoli as passed (2019)", before: "Living", after: "Deceased 2019", reason: "Confirmed by the Wakoli family council", status: "applied" },
  { id: "NY-AUD-2026-0405", at: "2026-05-02 11:05 EAT", actor: "Mercy Auma Nalyanya · member", action: "edit.requested", entity: "NY-MBR-00006", summary: "Requested a new contact number", before: "+254 720 ••• 367", after: "New number (pending OTP)", reason: "Changed SIM; old number retired", status: "pending" },
  { id: "NY-AUD-2026-0398", at: "2026-04-29 08:30 EAT", actor: "Brian Otieno Nalyanya · Family Head", action: "member.added", entity: "NY-MBR-00022", summary: "Recorded Ethan Wekesa Nalyanya as adopted ward of Daniel", before: "—", after: "Ward · adopted 2019", reason: "Guardianship letter filed with the family council", status: "applied" },
  { id: "NY-AUD-2026-0391", at: "2026-04-27 14:21 EAT", actor: "Grace Adhiambo Nalyanya · member", action: "edit.requested", entity: "NY-MBR-00017", summary: "Proposed Tom's new home town (Ruiru)", before: "Thika", after: "Ruiru", reason: "Moved for the new teaching post", status: "pending" },
  { id: "NY-AUD-2026-0386", at: "2026-04-25 10:02 EAT", actor: "Brian Otieno Nalyanya · Family Head", action: "branch.created", entity: "kiambu-tom", summary: "Opened the Kiambu · Tom branch", before: "—", after: "12 branches", reason: "Tom's household settled in Ruiru", status: "applied" },
  { id: "NY-AUD-2026-0380", at: "2026-04-20 19:44 EAT", actor: "Brian Otieno Nalyanya · Family Head", action: "member.edited", entity: "NY-MBR-00012", summary: "Updated Daniel's profession", before: "Port officer", after: "Port logistics officer", reason: "Promotion confirmed", status: "applied" },
  { id: "NY-AUD-2026-0371", at: "2026-04-12 13:10 EAT", actor: "Brian Otieno Nalyanya · Family Head", action: "relation.added", entity: "NY-MBR-00021", summary: "Linked Lynn Wakoli as child of Ruth Nekesa", before: "Unlinked", after: "Parent: NY-MBR-00009", reason: "Birth record reconciled", status: "applied" },
  { id: "NY-AUD-2026-0364", at: "2026-04-02 08:00 EAT", actor: "Samuel Kipkoech Nalyanya · member", action: "edit.requested", entity: "NY-MBR-00007", summary: "Asked to change the home town spelling", before: "Mumias", after: "Mumias East", reason: "Rejected — duplicate of an existing record", status: "rejected" },
  { id: "NY-AUD-2026-0352", at: "2026-03-28 17:15 EAT", actor: "Brian Otieno Nalyanya · Family Head", action: "member.edited", entity: "NY-MBR-00001", summary: "Set Mzee Victor's preferred name", before: "Victor Wafula Nalyanya", after: "Mzee Victor", reason: "Family council preference", status: "applied" },
];

export const SHORTCUTS: Array<{ keys: string[]; label: string }> = [
  { keys: ["←", "→"], label: "Move to the previous or next family member" },
  { keys: ["↑"], label: "Jump to the parent of the selected member" },
  { keys: ["↓"], label: "Jump to the first child of the selected member" },
  { keys: ["F"], label: "Fit the whole family in view" },
  { keys: ["B"], label: "Fit the selected branch in view" },
  { keys: ["R"], label: "Reset the camera" },
  { keys: ["W"], label: "Toggle “Where am I?” connectors" },
  { keys: ["Esc"], label: "Close the inspector or a dialog" },
  { keys: ["?"], label: "Open this list" },
];
