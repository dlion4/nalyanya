import type { Member } from "@/types/family";
import { between, mulberry32, pick } from "@/lib/rng";

/* ───────────────────────────────────────────────────────────────────────
   The Nalyanya family graph (mock, deterministic).
   · 22 curated members with stable IDs (founders, spouses, Family Head).
   · A seeded generator grows the tree to ~180–200 members across five
     generations so the 3D canvas, filters and counts feel real.
   ─────────────────────────────────────────────────────────────────────── */

export const FAMILY_SEED = 20260506;
export const TARGET_MEMBERS = 200;
const DATA_YEAR = 2026;

type Core = Pick<
  Member,
  "id" | "firstName" | "lastName" | "gender" | "generation" | "birthYear" | "branchId" | "parentId" | "role" | "homeTown" | "county" | "profession" | "bio"
>;

function person(core: Core, extra: Partial<Member> = {}): Member {
  return {
    preferredName: core.firstName,
    spouseId: null,
    whatsapp: true,
    preferredChannel: "WhatsApp",
    walletKes: 0,
    saccoShares: 0,
    activeLoans: 0,
    contributionsKes: 0,
    lifeEvents: [],
    ...core,
    ...extra,
  };
}

const CURATED: Member[] = [
  person(
    {
      id: "NY-MBR-00001", firstName: "Victor", lastName: "Nalyanya", gender: "male", generation: 1, birthYear: 1934,
      branchId: "nalyanya-main", parentId: null, role: "Patriarch", homeTown: "Kimilili", county: "Bungoma",
      profession: "Retired headteacher (TSC)",
      bio: "Taught for thirty-eight years, raised five children on four acres in Kimilili, and still insists every Nalyanya has a chair at the family table.",
    },
    {
      middleName: "Wafula", preferredName: "Mzee Victor", spouseId: "NY-MBR-00002", phone: "+254722118042",
      photo: "/images/family/mzee-victor.jpg", walletKes: 184500, saccoShares: 42, contributionsKes: 120000,
      lifeEvents: [
        { year: 1957, label: "Married Esther Nanjala" },
        { year: 1974, label: "Became headteacher, Kimilili Primary" },
        { year: 2003, label: "Founded the family harambee fund" },
      ],
    },
  ),
  person(
    {
      id: "NY-MBR-00002", firstName: "Esther", lastName: "Nalyanya", gender: "female", generation: 1, birthYear: 1938,
      branchId: "nalyanya-main", parentId: null, role: "Matriarch (late)", homeTown: "Kimilili", county: "Bungoma",
      profession: "Farmer & market trader",
      bio: "Ran the Saturday market stall in Kimilili for thirty years. Her recipe book still lives in the kitchen drawer.",
    },
    {
      middleName: "Nanjala", spouseId: "NY-MBR-00001", deathYear: 2014, photo: "/images/family/esther-matriarch.jpg", walletKes: 0,
      lifeEvents: [{ year: 1957, label: "Married Victor" }, { year: 2014, label: "Laid to rest at Kimilili" }],
    },
  ),
  person(
    {
      id: "NY-MBR-00003", firstName: "Joseph", lastName: "Nalyanya", gender: "male", generation: 2, birthYear: 1958,
      branchId: "kimilili-joseph", parentId: "NY-MBR-00001", role: "Son", homeTown: "Kimilili", county: "Bungoma",
      profession: "Civil engineer · rural roads",
      bio: "The eldest son builds roads for a living and still counts the rains in the Kimilili valley every season.",
    },
    {
      middleName: "Wafula", spouseId: "NY-MBR-00004", email: "joseph@nalyanya.family", employer: "Kenya Rural Roads Authority",
      phone: "+254733401276", photo: "/images/family/joseph.jpg", walletKes: 912400, saccoShares: 65, activeLoans: 1, contributionsKes: 240000,
      lifeEvents: [{ year: 1983, label: "Graduated in civil engineering" }, { year: 1985, label: "Married Ann Nekesa" }],
    },
  ),
  person(
    {
      id: "NY-MBR-00004", firstName: "Ann", lastName: "Nalyanya", gender: "female", generation: 2, birthYear: 1963,
      branchId: "kimilili-joseph", parentId: null, role: "Spouse", homeTown: "Bungoma Town", county: "Bungoma",
      profession: "Primary school teacher",
      bio: "Keeps the family birthday calendar in her head and has never once missed a call.",
    },
    { middleName: "Nekesa", spouseId: "NY-MBR-00003", phone: "+254701556204", walletKes: 310000, saccoShares: 18 },
  ),
  person(
    {
      id: "NY-MBR-00005", firstName: "Peter", lastName: "Nalyanya", gender: "male", generation: 2, birthYear: 1961,
      branchId: "nairobi-peter", parentId: "NY-MBR-00001", role: "Son", homeTown: "Kasarani", county: "Nairobi",
      profession: "Hospital pharmacist",
      bio: "Runs the Nairobi branch group and sends the Sunday devotion to all twelve branches.",
    },
    {
      middleName: "Otieno", spouseId: "NY-MBR-00006", phone: "+254714009322", photo: "/images/family/peter.jpg", walletKes: 1450000, saccoShares: 110,
      activeLoans: 1, contributionsKes: 410000,
    },
  ),
  person(
    {
      id: "NY-MBR-00006", firstName: "Mercy", lastName: "Nalyanya", gender: "female", generation: 2, birthYear: 1966,
      branchId: "nairobi-peter", parentId: null, role: "Spouse", homeTown: "Siaya", county: "Siaya",
      profession: "Accountant",
      bio: "The family's unofficial treasurer: every merry-go-round round balances to the shilling.",
    },
    { middleName: "Auma", spouseId: "NY-MBR-00005", phone: "+254720814367", walletKes: 780000, saccoShares: 40 },
  ),
  person(
    {
      id: "NY-MBR-00007", firstName: "Samuel", lastName: "Nalyanya", gender: "male", generation: 2, birthYear: 1963,
      branchId: "kakamega-samuel", parentId: "NY-MBR-00001", role: "Son", homeTown: "Mumias", county: "Kakamega",
      profession: "Agronomist · county extension",
      bio: "Grows sugarcane and maize in Mumias and mentors every young farmer in the family group.",
    },
    {
      middleName: "Kipkoech", spouseId: "NY-MBR-00008", phone: "+254745209133", photo: "/images/family/samuel.jpg", walletKes: 530200, saccoShares: 58,
      activeLoans: 2, contributionsKes: 180000,
    },
  ),
  person(
    {
      id: "NY-MBR-00008", firstName: "Lydia", lastName: "Nalyanya", gender: "female", generation: 2, birthYear: 1968,
      branchId: "kakamega-samuel", parentId: null, role: "Spouse", homeTown: "Eldoret", county: "Uasin Gishu",
      profession: "Nurse & midwife",
      bio: "A midwife who has welcomed hundreds of babies across Western Kenya.",
    },
    { middleName: "Jepkorir", spouseId: "NY-MBR-00007", phone: "+254709882014", walletKes: 220000, saccoShares: 22 },
  ),
  person(
    {
      id: "NY-MBR-00009", firstName: "Ruth", lastName: "Nalyanya", gender: "female", generation: 2, birthYear: 1966,
      branchId: "kitale-ruth", parentId: "NY-MBR-00001", role: "Daughter", homeTown: "Kitale", county: "Trans-Nzoia",
      profession: "Secondary school principal",
      bio: "Principal of a girls' school in Kitale. She married into the Wakoli family and leads the Kitale branch with a clipboard and a laugh.",
    },
    {
      middleName: "Nekesa", spouseId: "NY-MBR-00010", phone: "+254718442690", photo: "/images/family/ruth.jpg", walletKes: 690000, saccoShares: 51,
      contributionsKes: 300000,
    },
  ),
  person(
    {
      id: "NY-MBR-00010", firstName: "Elias", lastName: "Wakoli", gender: "male", generation: 2, birthYear: 1963,
      branchId: "kitale-ruth", parentId: null, role: "Spouse (in-law)", homeTown: "Kitale", county: "Trans-Nzoia",
      profession: "Veterinary officer (late)",
      bio: "Kept the Wakoli dairy herd healthy for two decades. Remembered at every Kitale harambee.",
    },
    {
      spouseId: "NY-MBR-00009", deathYear: 2019, photo: "/images/family/elder-stick.jpg",
      lifeEvents: [{ year: 1994, label: "Married Ruth Nekesa" }, { year: 2019, label: "Passed on, remembered in Kitale" }],
    },
  ),
  person(
    {
      id: "NY-MBR-00011", firstName: "Grace", lastName: "Nalyanya", gender: "female", generation: 2, birthYear: 1969,
      branchId: "kisumu-grace", parentId: "NY-MBR-00001", role: "Daughter", homeTown: "Kisumu (Kondele)", county: "Kisumu",
      profession: "Nurse · county referral hospital",
      bio: "The family's first call for any health question. Runs the Kisumu clinic drive every December.",
    },
    { middleName: "Adhiambo", phone: "+254724667019", photo: "/images/family/grace.jpg", walletKes: 402000, saccoShares: 33, activeLoans: 1 },
  ),
  person(
    {
      id: "NY-MBR-00012", firstName: "Daniel", lastName: "Nalyanya", gender: "male", generation: 3, birthYear: 1982,
      branchId: "mombasa-daniel", parentId: "NY-MBR-00003", role: "Grandson", homeTown: "Likoni", county: "Mombasa",
      profession: "Port logistics officer",
      bio: "Moves cargo through the port by day and coordinates the coastal reunion committee by night.",
    },
    { middleName: "Wafula", phone: "+254797130845", walletKes: 215600, saccoShares: 12, activeLoans: 1 },
  ),
  person(
    {
      id: "NY-MBR-00013", firstName: "Hellen", lastName: "Nalyanya", gender: "female", generation: 3, birthYear: 1985,
      branchId: "nyeri-hellen", parentId: "NY-MBR-00003", role: "Granddaughter", homeTown: "Nyeri Town", county: "Nyeri",
      profession: "Public health officer",
      bio: "Runs the county's community health outreach and teaches first aid to every cousin who will sit still.",
    },
    { middleName: "Nasimiyu", phone: "+254701903372", walletKes: 143800, saccoShares: 8 },
  ),
  person(
    {
      id: "NY-MBR-00014", firstName: "Naomi", lastName: "Nalyanya", gender: "female", generation: 3, birthYear: 1994,
      branchId: "diaspora-naomi", parentId: "NY-MBR-00005", role: "Granddaughter", homeTown: "Croydon", county: "London (UK)",
      profession: "Software engineer",
      bio: "Writes the diaspora newsletter from London and hosts the Christmas call for everyone abroad.",
    },
    { middleName: "Achieng", phone: "+447911123456", email: "naomi@nalyanya.family", photo: "/images/family/naomi.jpg", walletKes: 640000, saccoShares: 26 },
  ),
  person(
    {
      id: "NY-MBR-00015", firstName: "Caleb", lastName: "Nalyanya", gender: "male", generation: 3, birthYear: 1989,
      branchId: "eldoret-caleb", parentId: "NY-MBR-00007", role: "Grandson", homeTown: "Eldoret", county: "Uasin Gishu",
      profession: "Dairy cooperative manager",
      bio: "Runs the Eldoret dairy cooperative and sits on the family Sacco's credit committee.",
    },
    { middleName: "Kiprono", phone: "+254711776045", walletKes: 376500, saccoShares: 27, activeLoans: 1 },
  ),
  person(
    {
      id: "NY-MBR-00016", firstName: "Esther", lastName: "Nalyanya", gender: "female", generation: 3, birthYear: 1992,
      branchId: "nakuru-esther", parentId: "NY-MBR-00007", role: "Granddaughter", homeTown: "Nakuru Town", county: "Nakuru",
      profession: "Chartered accountant",
      bio: "Audits the family Sacco's books every March and keeps every shilling accounted for.",
    },
    { middleName: "Chepkoech", phone: "+254726780931", walletKes: 488000, saccoShares: 35 },
  ),
  person(
    {
      id: "NY-MBR-00017", firstName: "Tom", lastName: "Okoth", gender: "male", generation: 3, birthYear: 1995,
      branchId: "kiambu-tom", parentId: "NY-MBR-00011", role: "Grandson", homeTown: "Ruiru", county: "Kiambu",
      profession: "Mathematics teacher",
      bio: "Teaches mathematics in Ruiru and keeps the Kiambu cousins on track in the family group chat.",
    },
    { middleName: "Mutua", phone: "+254740119083", walletKes: 198400, saccoShares: 19 },
  ),
  person(
    {
      id: "NY-MBR-00018", firstName: "Faith", lastName: "Nalyanya", gender: "female", generation: 3, birthYear: 1994,
      branchId: "nairobi-peter", parentId: null, role: "Spouse", homeTown: "Kapsabet", county: "Nandi",
      profession: "Architect",
      bio: "Designs schools and clinics across the western counties and is the family's most patient photographer.",
    },
    {
      middleName: "Chebet", spouseId: "NY-MBR-00019", phone: "+254702441928", photo: "/images/family/faith.jpg",
      walletKes: 320000, saccoShares: 14,
    },
  ),
  person(
    {
      id: "NY-MBR-00019", firstName: "Brian", lastName: "Nalyanya", gender: "male", generation: 3, birthYear: 1992,
      branchId: "nairobi-peter", parentId: "NY-MBR-00005", role: "Grandson · Family Head", homeTown: "Kasarani", county: "Nairobi",
      profession: "Product lead · fintech",
      bio: "Family Head and the builder of this platform. Keeps the books honest, the tree current, and the Sunday call on time.",
    },
    {
      middleName: "Otieno", spouseId: "NY-MBR-00018", employer: "Nairobi fintech", email: "brian@nalyanya.family", phone: "+254712654309",
      photo: "/images/family/brian.jpg", walletKes: 1248600, saccoShares: 96, activeLoans: 1, contributionsKes: 540000,
      lifeEvents: [
        { year: 2010, label: "Joined the Nalyanya Sacco as its youngest shareholder" },
        { year: 2019, label: "Co-founded the Kasarani tech hub" },
        { year: 2024, label: "Elected Family Head at the Kimilili reunion" },
      ],
    },
  ),
  person(
    {
      id: "NY-MBR-00020", firstName: "Kevin", lastName: "Wakoli", gender: "male", generation: 3, birthYear: 1990,
      branchId: "kitale-ruth", parentId: "NY-MBR-00009", role: "Grandson", homeTown: "Kitale", county: "Trans-Nzoia",
      profession: "Dairy agronomist",
      bio: "Advises smallholder dairy farmers across Trans-Nzoia and is the family's go-to for feed questions.",
    },
    { middleName: "Elias", phone: "+254758330914", walletKes: 120000, saccoShares: 9 },
  ),
  person(
    {
      id: "NY-MBR-00021", firstName: "Lynn", lastName: "Wakoli", gender: "female", generation: 3, birthYear: 1996,
      branchId: "kitale-ruth", parentId: "NY-MBR-00009", role: "Granddaughter", homeTown: "Eldoret", county: "Uasin Gishu",
      profession: "Pharmacist",
      bio: "Organises the Wakoli family's annual medical camp and never lets a cousin leave without a plan.",
    },
    { middleName: "Ruth", phone: "+254743551208", walletKes: 96000, saccoShares: 6 },
  ),
  person(
    {
      id: "NY-MBR-00022", firstName: "Ethan", lastName: "Nalyanya", gender: "male", generation: 4, birthYear: 2016,
      branchId: "mombasa-daniel", parentId: "NY-MBR-00012", role: "Great-grandson · adopted", homeTown: "Likoni", county: "Mombasa",
      profession: "Pupil (primary)",
      bio: "Joined the family in 2019 and reads to the cousins every Sunday.",
    },
    { middleName: "Wekesa", adopted: true, ward: true, photo: "/images/family/ethan.jpg" },
  ),
];

/* ─── Seeded generator for the remaining members ─────────────────────── */

const MALE_FIRST = [
  "Kevin", "Dennis", "Felix", "Moses", "Collins", "Eric", "Isaac", "Titus", "Oscar", "Abel", "Nelson", "Calvin",
  "Mark", "Ian", "Ronald", "Edwin", "Simon", "Lawrence", "Stephen", "Evans", "Gideon", "Japhet", "Martin", "Wycliffe",
  "Dan", "Ezra", "Jacob", "Lucas", "Amos", "Ben", "Wesley", "Tobias",
];
const FEMALE_FIRST = [
  "Lilian", "Joy", "Caroline", "Winnie", "Beatrice", "Rose", "Sharon", "Pauline", "Brenda", "Sylvia", "Gladys", "Irene",
  "Joyce", "Lucy", "Ivy", "Purity", "Doreen", "Agnes", "Violet", "Nancy", "Vera", "Lorna", "Sheila", "Leah", "Diana", "Judith",
];
const MIDDLE = [
  "Wafula", "Otieno", "Kiprono", "Chebet", "Nekesa", "Auma", "Atieno", "Wanjiku", "Njeri", "Chepkoech", "Jepkorir",
  "Wekesa", "Kamau", "Mutua", "Kipchirchir", "Akinyi", "Nasimiyu", "Kiptoo", "Wangari", "Muthoni", "Nyambura", "Anyango",
];
const SURNAMES = [
  "Odhiambo", "Kamau", "Mutiso", "Kiptoo", "Wanyonyi", "Njoroge", "Mwangi", "Kipkemboi", "Kiprotich", "Musyoka",
  "Macharia", "Simiyu", "Kibet", "Ochieng", "Mwende", "Barasa",
];
const CHILD_SURNAME: Record<string, string> = {
  "NY-MBR-00009": "Wakoli",
  "NY-MBR-00011": "Okoth",
  "NY-MBR-00013": "Kariuki",
  "NY-MBR-00014": "Mwenda",
  "NY-MBR-00016": "Kiptoo",
};
const TOWNS: Record<string, string[]> = {
  Bungoma: ["Kimilili", "Bungoma Town", "Webuye", "Kamukuywa", "Sirisia"],
  Nairobi: ["Kasarani", "Ruaraka", "Embakasi", "South B", "Kayole"],
  Kakamega: ["Mumias", "Kakamega Town", "Malava", "Butere"],
  "Trans-Nzoia": ["Kitale", "Kiminini", "Endebess"],
  Kisumu: ["Kisumu (Kondele)", "Ahero", "Maseno"],
  Mombasa: ["Likoni", "Nyali", "Changamwe"],
  Nyeri: ["Nyeri Town", "Karatina", "Mukurweini"],
  "London (UK)": ["Croydon", "Manchester", "Birmingham"],
  "Uasin Gishu": ["Eldoret", "Burnt Forest", "Turbo"],
  Nakuru: ["Nakuru Town", "Naivasha", "Molo"],
  Kiambu: ["Ruiru", "Thika", "Kiambu Town"],
  Nandi: ["Kapsabet", "Nandi Hills"],
  Siaya: ["Siaya Town", "Bondo"],
};
const JOBS = [
  "Primary school teacher", "Registered nurse", "Civil engineer", "Software developer", "Accountant",
  "Farmer & agri-trader", "Agronomist", "Pharmacist", "Logistics coordinator", "Mechanic & fabricator", "Pastor",
  "Lawyer", "Journalist", "Boda fleet owner", "Electrician", "Chef & caterer", "Community health worker",
  "Bank officer", "Tailor & designer", "Veterinary officer", "Digital marketer", "Architect",
];
const BITS = [
  "keeps the family's Sunday rota up to date",
  "grows maize and beans on a family plot",
  "volunteers with the church youth choir",
  "runs a small shop and sends money home every month",
  "is learning to code after work",
  "looks after the family orchard",
  "never misses a harambee call",
  "mentors young cousins into their first job",
  "cooks for every reunion and insists on the recipe",
  "keeps the branch WhatsApp group alive",
];

function surnameFor(parent: Member, rand: () => number): string {
  if (parent.gender === "male") return parent.lastName;
  return CHILD_SURNAME[parent.id] ?? pick(rand, SURNAMES);
}

function relationFor(gender: Member["gender"], generation: number): string {
  if (generation <= 2) return gender === "male" ? "Son" : "Daughter";
  if (generation === 3) return gender === "male" ? "Grandson" : "Granddaughter";
  if (generation === 4) return gender === "male" ? "Great-grandson" : "Great-granddaughter";
  return "Great-great-grandchild";
}

function generateTree(curated: Member[]): Member[] {
  const rand = mulberry32(FAMILY_SEED);
  const out: Member[] = [...curated];
  let counter = 23;

  for (let cursor = 0; cursor < out.length && out.length < TARGET_MEMBERS; cursor++) {
    const parent = out[cursor];
    if (parent.generation >= 5 || parent.role.startsWith("Spouse")) continue;

    const addCount =
      parent.generation === 1
        ? 0
        : parent.generation === 2
          ? 3
          : parent.generation === 3
            ? 3 + (rand() < 0.8 ? 1 : 0)
            : 1 + (rand() < 0.5 ? 1 : 0);

    for (let i = 0; i < addCount && out.length < TARGET_MEMBERS; i++) {
      const birthYear = parent.birthYear + between(rand, 18, 25);
      if (birthYear > DATA_YEAR) continue;

      const generation = parent.generation + 1;
      const gender: Member["gender"] = rand() < 0.5 ? "male" : "female";
      const firstName = gender === "male" ? pick(rand, MALE_FIRST) : pick(rand, FEMALE_FIRST);
      const age = DATA_YEAR - birthYear;
      const adult = age >= 18;
      const homeTown = pick(rand, TOWNS[parent.county] ?? [parent.county]);
      const profession =
        age < 6 ? "Pre-school learner" : age < 18 ? "Pupil" : age < 24 ? "University student" : pick(rand, JOBS);
      const whatsapp = adult ? rand() < 0.8 : false;
      const bio =
        age < 6
          ? `${firstName} is a happy toddler who already knows every cousin's name.`
          : age < 18
            ? `${firstName} is in school and loves football on Sunday afternoons.`
            : `${firstName} ${pick(rand, BITS)}.`;

      out.push(
        person(
          {
            id: `NY-MBR-${String(counter++).padStart(5, "0")}`,
            firstName,
            lastName: surnameFor(parent, rand),
            gender,
            generation,
            birthYear,
            branchId: parent.branchId,
            parentId: parent.id,
            role: relationFor(gender, generation),
            homeTown,
            county: parent.county,
            profession,
            bio,
          },
          {
            middleName: pick(rand, MIDDLE),
            phone: adult && rand() < 0.85
              ? `+2547${String(between(rand, 0, 99)).padStart(2, "0")}${String(between(rand, 0, 999999)).padStart(6, "0")}`
              : undefined,
            whatsapp,
            preferredChannel: whatsapp ? "WhatsApp" : "SMS",
            walletKes: adult ? between(rand, 0, 280000) : 0,
            saccoShares: adult ? between(rand, 0, 30) : 0,
            activeLoans: adult && rand() < 0.12 ? 1 : 0,
            contributionsKes: adult ? between(rand, 0, 60000) : 0,
            ward: !adult,
            lifeEvents: adult
              ? [
                  { year: birthYear, label: `Born in ${homeTown}` },
                  { year: birthYear + 22, label: "Joined the Nalyanya Sacco" },
                ]
              : [{ year: birthYear, label: `Born in ${homeTown}` }],
          },
        ),
      );
    }
  }

  return out;
}

/** Every family member (curated + generated), in stable order. */
export const MEMBERS: Member[] = generateTree(CURATED);
