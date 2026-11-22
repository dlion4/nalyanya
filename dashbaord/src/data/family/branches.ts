import type { Branch } from "@/types/family";

/** Twelve family branches. Each founder is a curated member (see people.ts). */
export const BRANCHES: Branch[] = [
  { id: "nalyanya-main", name: "Nalyanya Main", shortName: "Main", county: "Bungoma", founderId: "NY-MBR-00001", color: "#4fae86", tagline: "The patriarch's household at Kimilili" },
  { id: "kimilili-joseph", name: "Kimilili · Joseph", shortName: "Joseph", county: "Bungoma", founderId: "NY-MBR-00003", color: "#e0764a", tagline: "Roads, rain gauges and the Kimilili harambee" },
  { id: "nairobi-peter", name: "Nairobi · Peter", shortName: "Peter", county: "Nairobi", founderId: "NY-MBR-00005", color: "#6fa8dc", tagline: "Pharmacy, fintech and the Sunday devotion call" },
  { id: "kakamega-samuel", name: "Kakamega · Samuel", shortName: "Samuel", county: "Kakamega", founderId: "NY-MBR-00007", color: "#a284dc", tagline: "Sugarcane, maize and mentorship" },
  { id: "kitale-ruth", name: "Kitale · Ruth & the Wakolis", shortName: "Ruth", county: "Trans-Nzoia", founderId: "NY-MBR-00009", color: "#d4a437", tagline: "Schools, dairy and the Wakoli cousins" },
  { id: "kisumu-grace", name: "Kisumu · Grace", shortName: "Grace", county: "Kisumu", founderId: "NY-MBR-00011", color: "#4fc1b0", tagline: "Nursing, the lake and the clinic drive" },
  { id: "mombasa-daniel", name: "Mombasa · Daniel", shortName: "Daniel", county: "Mombasa", founderId: "NY-MBR-00012", color: "#d86b9b", tagline: "Port logistics and the coastal reunion" },
  { id: "nyeri-hellen", name: "Nyeri · Hellen", shortName: "Hellen", county: "Nyeri", founderId: "NY-MBR-00013", color: "#9bb85a", tagline: "Community health outreach in Nyeri" },
  { id: "diaspora-naomi", name: "Diaspora · Naomi", shortName: "Naomi", county: "London (UK)", founderId: "NY-MBR-00014", color: "#c9a27a", tagline: "London and the Christmas call" },
  { id: "eldoret-caleb", name: "Eldoret · Caleb", shortName: "Caleb", county: "Uasin Gishu", founderId: "NY-MBR-00015", color: "#f09a4a", tagline: "Dairy co-op and the credit committee" },
  { id: "nakuru-esther", name: "Nakuru · Esther", shortName: "Esther", county: "Nakuru", founderId: "NY-MBR-00016", color: "#7c8fb3", tagline: "Audit, accounts and the Sacco ledger" },
  { id: "kiambu-tom", name: "Kiambu · Tom", shortName: "Tom", county: "Kiambu", founderId: "NY-MBR-00017", color: "#7fbf7a", tagline: "Mathematics classrooms in Ruiru" },
];

export const BRANCH_BY_ID: Record<string, Branch> = Object.fromEntries(
  BRANCHES.map((branch) => [branch.id, branch]),
);
