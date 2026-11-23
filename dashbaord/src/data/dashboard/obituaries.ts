/* ═══════════════════════════════════════════════════════════════════════
   T-6 · IN REMEMBRANCE — page data (mock, deterministic, Kenyan family
   records). Every record here is fictional but internally consistent:
   the same people, branches, causes and albums the rest of the dashboard
   already knows about.
   ═══════════════════════════════════════════════════════════════════════ */

import type { PageConfig } from "@/types/workspace";

export const pageData: PageConfig = {
  slug: "obituaries",
  name: "In remembrance",
  eyebrow: "Our heritage",
  description:
    "A quiet place to preserve the people and stories at the heart of our family.",
  action: "Remember someone",
  panel: "memory",
  layout: "remembrance",
};

/* ─── Types ─────────────────────────────────────────────────────────────── */

export type ObituaryStatus = "published" | "draft" | "unpublished";

export type CondolenceStatus = "visible" | "pending" | "hidden";

export interface MemorialPhoto {
  id: string;
  src: string;
  alt: string;
  caption: string;
  year: string;
  credit: string;
}

export interface LifeMoment {
  year: string;
  title: string;
  detail: string;
}

export interface ProgramItem {
  time: string;
  title: string;
  detail: string;
}

export interface FuneralPlan {
  date: string;
  time: string;
  venue: string;
  town: string;
  county: string;
  coordinates: { lat: number; lng: number };
  burial: string;
  program: ProgramItem[];
}

export interface Obituary {
  id: string;
  name: string;
  shortName: string;
  born: string;
  died: string;
  birthYear: number;
  deathYear: number;
  age: number;
  gender: "male" | "female";
  branchId: string;
  relationship: string;
  generation: number;
  portrait: string;
  portraitAlt: string;
  notice: string[];
  familyStatement: string;
  status: ObituaryStatus;
  publishedAt: string;
  lifeStory: LifeMoment[];
  funeral: FuneralPlan;
  gallery: MemorialPhoto[];
  causeId: string;
  causeTitle: string;
  raised: number;
  target: number;
  anniversary: string;
  anniversaryLabel: string;
  candlesLit: number;
  views: number;
  tags: string[];
}

export interface Condolence {
  id: string;
  obituaryId: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  relation: string;
  message: string;
  postedAt: string;
  candles: number;
  status: CondolenceStatus;
  replyTo?: string;
}

export interface Anniversary {
  obituaryId: string;
  date: string;
  label: string;
  years: number;
  kind: "death" | "birth";
  reminderSet: boolean;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
  tone: "neutral" | "sensitive";
}

/* ─── The records ──────────────────────────────────────────────────────── */

const photo = (
  id: string,
  src: string,
  alt: string,
  caption: string,
  year: string,
  credit: string,
): MemorialPhoto => ({ id, src, alt, caption, year, credit });

export const OBITUARIES: Obituary[] = [
  {
    id: "NY-OB-2019-0007",
    name: "Mzee Victor Wafula Nalyanya",
    shortName: "Mzee Victor",
    born: "1934-04-12",
    died: "2019-05-12",
    birthYear: 1934,
    deathYear: 2019,
    age: 85,
    gender: "male",
    branchId: "nalyanya-main",
    relationship: "Our patriarch · father of five",
    generation: 1,
    portrait: "/images/memorial/mzee-victor.jpg",
    portraitAlt: "Mzee Victor Wafula Nalyanya, the family patriarch",
    notice: [
      "Our family patriarch, Mzee Victor Wafula Nalyanya, went home to his Maker on Sunday 12 May 2019 after a long illness at Kimilili.",
      "He taught at Kimilili Primary School for thirty-eight years, rising from a student teacher to headteacher, and taught half of this family to read before he taught the lessons he had lived.",
      "He farmed four acres on the family homestead, chaired the harambee committee that raised school fees for his own children, and never once sat to eat before every Nalyanya had a chair at the table.",
    ],
    familyStatement:
      "A quiet man with a loud laugh. He measured a good life in people kept together — in school fees paid, in marriages not missed, in grandchildren who could quote him. We carry his stool to the front of every gathering.",
    status: "published",
    publishedAt: "2019-05-13",
    lifeStory: [
      { year: "1934", title: "Born at Kimilili", detail: "Born in Nambale village, Bungoma, the first of eight children." },
      { year: "1953", title: "Became a student teacher", detail: "Started at Bukembe Primary with a certificate and one chalk box." },
      { year: "1957", title: "Married Esther Nanjala", detail: "A church wedding in Nambale, six hundred guests, one borrowed suit." },
      { year: "1961", title: "Headteacher, Kimilili Primary", detail: "Took the headship at twenty-seven and held it for three decades." },
      { year: "1974", title: "Built the family homestead", detail: "Bought the four acres with a loan repaid in maize sacks." },
      { year: "1988", title: "The long walk home", detail: "Walked the last kilometre to the homestead every evening, and was never late." },
      { year: "2003", title: "Founded the family harambee fund", detail: "Set aside the first money that would later pay school fees for eleven cousins." },
      { year: "2019", title: "Laid to rest at Kimilili", detail: "Buried on the family homestead, facing the homestead door." },
    ],
    funeral: {
      date: "2019-05-15",
      time: "10:00",
      venue: "Kimilili Family Compound",
      town: "Kimilili",
      county: "Bungoma",
      coordinates: { lat: 0.5356, lng: 34.7511 },
      burial: "Family homestead, Kimilili — beside Esther.",
      program: [
        { time: "09:00", title: "Arrival & viewing", detail: "The body lies in state at the homestead." },
        { time: "10:00", title: "Devotion & eulogy", detail: "Led by Rev. Dr. Wanyama; eulogy by Joseph Wafula." },
        { time: "11:00", title: "Prayer for the family", detail: "Led by Mzee Esther, the matriarch." },
        { time: "12:30", title: "Interment", detail: "The homestead, behind the mango tree." },
        { time: "14:00", title: "Family lunch", detail: "Long tables under the marquee. Everybody fed." },
      ],
    },
    gallery: [
      photo("v1", "/images/memorial/mzee-victor.jpg", "Mzee Victor in his later years", "He kept his cap on the shelf, not his head.", "2017", "Family album"),
      photo("v2", "/images/memorial/memorial-school.jpg", "A rural Kenyan classroom", "Thirty-eight years of blackboards.", "1961", "Kimilili Primary"),
      photo("v3", "/images/memorial/memorial-fields.jpg", "Green fields on the family homestead", "Four acres of maize and beans.", "1974", "Joseph Wafula"),
      photo("v4", "/images/memorial/memorial-family.jpg", "The family in traditional attire", "Every generation on one side of the tent.", "1988", "Family album"),
      photo("v5", "/images/memorial/memorial-dusk.jpg", "An acacia tree at dusk on the savannah", "The last walk, at sunset.", "2019", "Brian Otieno"),
    ],
    causeId: "NY-CON-2026-0398",
    causeTitle: "Mzee Victor · homestead & bursary fund",
    raised: 386_000,
    target: 500_000,
    anniversary: "05-12",
    anniversaryLabel: "Death anniversary",
    candlesLit: 214,
    views: 3_180,
    tags: ["patriarch", "teacher", "founder", "kimilili"],
  },
  {
    id: "NY-OB-2014-0031",
    name: "Esther Nanjala Nalyanya",
    shortName: "Mzee Esther",
    born: "1938-02-08",
    died: "2014-03-21",
    birthYear: 1938,
    deathYear: 2014,
    age: 76,
    gender: "female",
    branchId: "nalyanya-main",
    relationship: "Our matriarch · keeper of the recipe book",
    generation: 1,
    portrait: "/images/memorial/esther-nanjala.jpg",
    portraitAlt: "Esther Nanjala Nalyanya, the family matriarch",
    notice: [
      "Mzee Esther Nanjala Nalyanya, our matriarch, died on Friday 21 March 2014 at Kimilili after a short illness.",
      "She ran the Saturday market stall in Kimilili for thirty years, raising five children between the tomatoes and the school fees, and she could name the price of everything in the county by memory.",
      "Her recipe book — now in the kitchen drawer in Nairobi — is still written in the back of a 1974 church hymnal, with the margin notes of four different kitchens.",
    ],
    familyStatement:
      "She spoke softly and was never obeyed loudly. Every one of us knows the exact smell of her kitchen, and every one of us still cooks her fish stew wrongly.",
    status: "published",
    publishedAt: "2014-03-22",
    lifeStory: [
      { year: "1938", title: "Born at Nambale", detail: "The second of six daughters; raised on a smallholding." },
      { year: "1957", title: "Married Victor Wafula", detail: "Brought a school certificate, a recipe book and a great deal of patience." },
      { year: "1962", title: "Opened the Saturday stall", detail: "Tomatoes, sukuma wiki and school fees, in that order." },
      { year: "1978", title: "Sent five children to school", detail: "All five, on the same term." },
      { year: "1996", title: "The church hymnal recipe book", detail: "Every family recipe copied into the back pages." },
      { year: "2014", title: "Laid to rest at Kimilili", detail: "Buried beside Victor, five years later." },
    ],
    funeral: {
      date: "2014-03-26",
      time: "11:00",
      venue: "Kimilili Family Compound",
      town: "Kimilili",
      county: "Bungoma",
      coordinates: { lat: 0.5356, lng: 34.7511 },
      burial: "Family homestead, Kimilili — beside Victor.",
      program: [
        { time: "10:00", title: "Arrival & viewing", detail: "Mourners received at the homestead gate." },
        { time: "11:00", title: "Requiem mass", detail: "At the family compound, with the choir of St. John's." },
        { time: "12:30", title: "Words of comfort", detail: "Read by her grandchildren." },
        { time: "13:30", title: "Interment", detail: "The homestead, beside Victor." },
        { time: "15:00", title: "Sharing lunch", detail: "Fish stew, as she taught it." },
      ],
    },
    gallery: [
      photo("e1", "/images/memorial/esther-nanjala.jpg", "Mzee Esther in her headwrap", "The blue one was only for church.", "2011", "Family album"),
      photo("e2", "/images/memorial/memorial-fields.jpg", "Green fields in the early morning", "The walk to the market, six kilometres.", "1970", "Joseph Wafula"),
      photo("e3", "/images/memorial/memorial-home.jpg", "A family in traditional dress", "Her sevenieth birthday.", "2008", "Family album"),
      photo("e4", "/images/memorial/memorial-dusk.jpg", "An acacia tree at dusk", "She liked the last light on the homestead.", "2014", "Brian Otieno"),
    ],
    causeId: "NY-CON-2026-0397",
    causeTitle: "Mzee Esther · market bursary fund",
    raised: 148_000,
    target: 250_000,
    anniversary: "03-21",
    anniversaryLabel: "Death anniversary",
    candlesLit: 176,
    views: 2_640,
    tags: ["matriarch", "market", "kimilili"],
  },
  {
    id: "NY-OB-2021-0019",
    name: "Joseph Ochieng Nalyanya",
    shortName: "Uncle Joseph",
    born: "1944-07-19",
    died: "2016-04-30",
    birthYear: 1944,
    deathYear: 2016,
    age: 71,
    gender: "male",
    branchId: "kimilili-joseph",
    relationship: "Uncle · the carpenter",
    generation: 2,
    portrait: "/images/memorial/joseph-wafula.jpg",
    portraitAlt: "Joseph Ochieng Nalyanya, carpenter of the Kimilili branch",
    notice: [
      "Joseph Ochieng Nalyanya, of the Kimilili branch, died on Saturday 30 April 2016 at Buyangu.",
      "He was a carpenter and a joiner by trade, and he built the pews at Kimilili's St. John's church, the first classroom at the branch school, and half the furniture in the family homestead.",
      "He kept a notebook of every debt the family owed him, and every entry reads 'no need to pay'.",
    ],
    familyStatement:
      "He spoke with his hands. Every table he built is still in service, and every one of them is slightly out of level — on purpose, so nobody forgets who made it.",
    status: "published",
    publishedAt: "2016-05-02",
    lifeStory: [
      { year: "1944", title: "Born in Nambale", detail: "Second son of the homestead." },
      { year: "1963", title: "Joined the joinery", detail: "Learned the trade in Kisumu." },
      { year: "1978", title: "Built the St. John's pews", detail: "Thirty-eight pews, still in use." },
      { year: "1992", title: "The family ledger notebook", detail: "Started writing down every family debt." },
      { year: "2016", title: "Laid to rest at Buyangu", detail: "Buried in the family ground at Buyangu." },
    ],
    funeral: {
      date: "2016-05-04",
      time: "09:30",
      venue: "Buyangu Family Ground",
      town: "Kimilili",
      county: "Bungoma",
      coordinates: { lat: 0.5438, lng: 34.7362 },
      burial: "Family ground at Buyangu, under the second mango tree.",
      program: [
        { time: "08:30", title: "Mourning", detail: "Family and neighbours at the family ground." },
        { time: "09:30", title: "Devotion", detail: "Led by Rev. Otieno; the carpenter's tools carried in." },
        { time: "10:30", title: "Eulogy", detail: "By his son, Wafula." },
        { time: "11:15", title: "Interment", detail: "Buyangu family ground." },
        { time: "13:00", title: "Family lunch", detail: "Under the marquee." },
      ],
    },
    gallery: [
      photo("j1", "/images/memorial/joseph-wafula.jpg", "Uncle Joseph in the field", "He never sat still for a portrait.", "2009", "Wafula Ochieng"),
      photo("j2", "/images/memorial/memorial-school.jpg", "A rural classroom", "The first classroom at the branch school.", "1994", "Branch records"),
      photo("j3", "/images/memorial/memorial-choir.jpg", "A church choir in robes", "The pews he built, full on Sunday.", "2010", "Family album"),
    ],
    causeId: "NY-CON-2026-0396",
    causeTitle: "Uncle Joseph · workshop bursary",
    raised: 62_000,
    target: 120_000,
    anniversary: "04-30",
    anniversaryLabel: "Death anniversary",
    candlesLit: 88,
    views: 1_120,
    tags: ["uncle", "carpenter", "kimilili", "builder"],
  },
  {
    id: "NY-OB-2020-0026",
    name: "Rebecca Auma Nalyanya",
    shortName: "Aunt Rebecca",
    born: "1946-11-03",
    died: "2020-06-02",
    birthYear: 1946,
    deathYear: 2020,
    age: 73,
    gender: "female",
    branchId: "nairobi-peter",
    relationship: "Aunt · teacher of the little ones",
    generation: 2,
    portrait: "/images/memorial/rebecca-auma.jpg",
    portraitAlt: "Rebecca Auma Nalyanya, Nairobi branch teacher",
    notice: [
      "Rebecca Auma Nalyanya died on Tuesday 2 June 2020 in Nairobi after a long illness.",
      "She taught nursery in Kibera for twenty-two years and later ran the Sunday children's class at our Nairobi branch, where she kept a box of sweets for the children who could not afford shoes.",
      "She was the one who telephoned every relative on the anniversary of her own mother's death — and she never once missed a year.",
    ],
    familyStatement:
      "She believed a child who has been taught to read cannot be lost. She taught four generations of this family to hold a pencil, and she did it with a biscuit in her pocket.",
    status: "published",
    publishedAt: "2020-06-03",
    lifeStory: [
      { year: "1946", title: "Born in Kisii", detail: "Moved to Nairobi in 1968." },
      { year: "1968", title: "Began teaching in Kibera", detail: "Nursery teacher, Kibera government school." },
      { year: "1990", title: "Started the Sunday children's class", detail: "Thirty years of the same lesson, every Sunday." },
      { year: "2004", title: "The box of sweets", detail: "For the children who could not afford shoes." },
      { year: "2020", title: "Laid to rest at Lang'ata", detail: "Buried at Lang'ata cemetery, Nairobi." },
    ],
    funeral: {
      date: "2020-06-06",
      time: "10:00",
      venue: "Lang'ata Cemetery Chapel",
      town: "Nairobi",
      county: "Nairobi",
      coordinates: { lat: -1.4492, lng: 36.7784 },
      burial: "Lang'ata cemetery, Nairobi — family grave.",
      program: [
        { time: "09:00", title: "Arrival & viewing", detail: "At the Lang'ata chapel." },
        { time: "10:00", title: "Requiem mass", detail: "With the Nairobi branch choir." },
        { time: "11:15", title: "Children's class tribute", detail: "The Sunday class spoke for their teacher." },
        { time: "12:00", title: "Interment", detail: "Lang'ata family grave." },
        { time: "13:30", title: "Family lunch", detail: "At the Nairobi family compound." },
      ],
    },
    gallery: [
      photo("r1", "/images/memorial/rebecca-auma.jpg", "Aunt Rebecca", "She wore one jacket for every funeral.", "2016", "Family album"),
      photo("r2", "/images/memorial/memorial-church.jpg", "A congregation in a bright hall", "The Sunday class, mid-hymn.", "2009", "Nairobi branch"),
      photo("r3", "/images/memorial/memorial-graduation.jpg", "Graduates in caps and gowns", "She taught the first of them.", "2004", "Naomi Achieng"),
      photo("r4", "/images/memorial/memorial-home.jpg", "The family in traditional attire", "At her mother's funeral, 1988.", "1988", "Family album"),
    ],
    causeId: "NY-CON-2026-0395",
    causeTitle: "Aunt Rebecca · school shoes fund",
    raised: 94_000,
    target: 150_000,
    anniversary: "06-02",
    anniversaryLabel: "Death anniversary",
    candlesLit: 141,
    views: 1_760,
    tags: ["aunt", "teacher", "nairobi", "sunday-class"],
  },
  {
    id: "NY-OB-2024-0112",
    name: "Faith Wanjiru Nalyanya",
    shortName: "Aunt Faith",
    born: "1972-01-26",
    died: "2024-05-18",
    birthYear: 1972,
    deathYear: 2024,
    age: 52,
    gender: "female",
    branchId: "kisumu-grace",
    relationship: "Aunt · nurse and clinic driver",
    generation: 2,
    portrait: "/images/memorial/faith-auma.jpg",
    portraitAlt: "Faith Wanjiru Nalyanya, community nurse",
    notice: [
      "Faith Wanjiru Nalyanya died on Saturday 18 May 2024 in Kisumu after a long battle with illness.",
      "She was a registered nurse with the Kisumu county health team, and for eleven years she drove the family clinic truck on Tuesdays and Thursdays to Kiboswa, Nyando and Ahero.",
      "She kept every patient's history in a hardback notebook that she carried everywhere, because she did not trust a laptop to remember a person's mother.",
    ],
    familyStatement:
      "She could read a room before a doctor entered it. If you were frightened, she sat down first, and then she explained. The notebook is now in the clinic, and it is still in her handwriting.",
    status: "published",
    publishedAt: "2024-05-19",
    lifeStory: [
      { year: "1972", title: "Born in Kisumu", detail: "Raised between Kisumu and Kitale." },
      { year: "1996", title: "Qualified as a nurse", detail: "Kenyatta Medical School, Kisumu." },
      { year: "2003", title: "Joined the county health team", detail: "Kisumu county, maternal health." },
      { year: "2013", title: "The clinic truck", detail: "Tuesdays and Thursdays, three counties." },
      { year: "2019", title: "The hardback notebook", detail: "Every patient, in her own handwriting." },
      { year: "2024", title: "Laid to rest in Kisumu", detail: "Buried at Dunga cemetery." },
    ],
    funeral: {
      date: "2024-05-22",
      time: "11:00",
      venue: "Kisumu Family Church",
      town: "Kisumu",
      county: "Kisumu",
      coordinates: { lat: -0.0917, lng: 34.768 },
      burial: "Dunga cemetery, Kisumu.",
      program: [
        { time: "10:00", title: "Arrival & viewing", detail: "At the Kisumu family church." },
        { time: "11:00", title: "Requiem", detail: "With the county health team in attendance." },
        { time: "12:15", title: "Tribute from the clinic", detail: "The notebook was carried in." },
        { time: "13:00", title: "Interment", detail: "Dunga cemetery." },
        { time: "14:30", title: "Family lunch", detail: "Kisumu family church hall." },
      ],
    },
    gallery: [
      photo("f1", "/images/memorial/faith-auma.jpg", "Aunt Faith in her scrubs", "She never wore a watch she could read.", "2020", "Grace Adhiambo"),
      photo("f2", "/images/memorial/memorial-church.jpg", "A congregation gathered in a hall", "She sang alto, badly and loudly.", "2018", "Family album"),
      photo("f3", "/images/memorial/memorial-reunion.jpg", "Relatives gathered outdoors", "The clinic team at the reunion.", "2022", "Grace Adhiambo"),
    ],
    causeId: "NY-CON-2026-0394",
    causeTitle: "Aunt Faith · clinic vehicle fund",
    raised: 214_000,
    target: 320_000,
    anniversary: "05-18",
    anniversaryLabel: "Death anniversary",
    candlesLit: 302,
    views: 4_410,
    tags: ["aunt", "nurse", "kisumu", "clinic"],
  },
  {
    id: "NY-OB-2025-0148",
    name: "Samuel Wafula Nalyanya",
    shortName: "Uncle Samuel",
    born: "1950-09-14",
    died: "2025-05-09",
    birthYear: 1950,
    deathYear: 2025,
    age: 74,
    gender: "male",
    branchId: "kitale-ruth",
    relationship: "Uncle · maize farmer and storyteller",
    generation: 2,
    portrait: "/images/memorial/samuel-kipkoech.jpg",
    portraitAlt: "Samuel Wafula Nalyanya, farmer of the Kitale branch",
    notice: [
      "Samuel Wafula Nalyanya died on Friday 9 May 2025 at his home in Kitale, surrounded by the family.",
      "He farmed maize on twelve acres in Trans-Nzoia for forty-one seasons and could forecast the rains from the behaviour of the weaver birds.",
      "He was the family's unofficial historian. If you wanted to know who married whom, or which uncle quarrelled with which aunt in 1971, you asked him, and he would tell you.",
    ],
    familyStatement:
      "He kept the family stories so that none of them were lost, and he told them so well that the rest of us remembered them too. Our histories are his notebooks.",
    status: "published",
    publishedAt: "2025-05-10",
    lifeStory: [
      { year: "1950", title: "Born in Kitale", detail: "The fourth of eight." },
      { year: "1972", title: "Bought the first twelve acres", detail: "With a loan from the cooperative." },
      { year: "1979", title: "The weaver bird forecast", detail: "Never wrong, and never doubted." },
      { year: "1991", title: "Keeper of the family stories", detail: "Five exercise books, filled." },
      { year: "2018", title: "The last full harvest", detail: "Fourteen bags from the good field." },
      { year: "2025", title: "Laid to rest at Kitale", detail: "Buried on the farm he bought in 1972." },
    ],
    funeral: {
      date: "2025-05-14",
      time: "10:30",
      venue: "Wafula Family Farm, Kitale",
      town: "Kitale",
      county: "Trans-Nzoia",
      coordinates: { lat: 0.5167, lng: 34.7833 },
      burial: "On the farm, under the shade of the big mango.",
      program: [
        { time: "09:30", title: "Arrival & viewing", detail: "At the family farm." },
        { time: "10:30", title: "Devotion & harvest tribute", detail: "Led by the Kitale branch." },
        { time: "11:45", title: "Reading of the exercise books", detail: "Five notebooks, read aloud by his children." },
        { time: "12:30", title: "Interment", detail: "On the farm." },
        { time: "14:00", title: "Family lunch", detail: "Nyama choma and ugali, in the field." },
      ],
    },
    gallery: [
      photo("s1", "/images/memorial/samuel-kipkoech.jpg", "Uncle Samuel on the farm", "In the field, as always.", "2018", "Ruth Wakoli"),
      photo("s2", "/images/memorial/memorial-fields.jpg", "Maize fields near Kitale", "Twelve acres of maize.", "2014", "Wafula Farm"),
      photo("s3", "/images/memorial/memorial-family.jpg", "The family in traditional dress", "The first of many harvests celebrated.", "1991", "Family album"),
      photo("s4", "/images/memorial/memorial-choir.jpg", "A church choir in robes", "He sang bass on the big occasions.", "2006", "Kitale branch"),
    ],
    causeId: "NY-CON-2026-0393",
    causeTitle: "Uncle Samuel · bursary for his students",
    raised: 176_000,
    target: 220_000,
    anniversary: "05-09",
    anniversaryLabel: "First death anniversary",
    candlesLit: 259,
    views: 3_940,
    tags: ["uncle", "farmer", "kitale", "storyteller", "historian"],
  },
  {
    id: "NY-OB-2023-0091",
    name: "Daniel Otieno Nalyanya",
    shortName: "Cousin Daniel",
    born: "1978-03-07",
    died: "2023-05-28",
    birthYear: 1978,
    deathYear: 2023,
    age: 45,
    gender: "male",
    branchId: "mombasa-daniel",
    relationship: "Cousin · harbour and home",
    generation: 3,
    portrait: "/images/memorial/daniel-wafula.jpg",
    portraitAlt: "Daniel Otieno Nalyanya of the Mombasa branch",
    notice: [
      "Daniel Otieno Nalyanya died on Sunday 28 May 2023 in Mombasa after a short illness.",
      "He worked the port for eighteen years, moving containers that crossed the Indian Ocean, and came home every December whether the ships had sailed or not.",
      "He built the family's Mombasa house with his own hands between 2011 and 2015, and every window in it still opens the way he left it.",
    ],
    familyStatement:
      "He could name the ship and the day of every container that mattered to this family. He was the one who made sure the port and the homestead stayed the same family.",
    status: "published",
    publishedAt: "2023-05-29",
    lifeStory: [
      { year: "1978", title: "Born in Mombasa", detail: "A childhood above the fish market." },
      { year: "2001", title: "Joined the port", detail: "Cranes, cargo and the 8:00 to 6:00 shift." },
      { year: "2008", title: "Every December, home", detail: "Whether or not the ships had sailed." },
      { year: "2011", title: "Bought the Mombasa plot", detail: "And began building it by hand." },
      { year: "2015", title: "The house finished", detail: "Every window opens the way he left it." },
      { year: "2023", title: "Laid to rest in Mombasa", detail: "Buried at Kisauni cemetery." },
    ],
    funeral: {
      date: "2023-06-02",
      time: "15:00",
      venue: "Mombasa Family House",
      town: "Mombasa",
      county: "Mombasa",
      coordinates: { lat: -4.0435, lng: 39.6682 },
      burial: "Kisauni cemetery, Mombasa.",
      program: [
        { time: "14:00", title: "Arrival & viewing", detail: "At the family house he built." },
        { time: "15:00", title: "Devotion", detail: "Led by the Mombasa branch." },
        { time: "16:00", title: "A word from the port", detail: "Read by his old shift supervisor." },
        { time: "16:45", title: "Interment", detail: "Kisauni cemetery." },
        { time: "18:00", title: "Family gathering", detail: "Nyama and pilau, at the family house." },
      ],
    },
    gallery: [
      photo("d1", "/images/memorial/daniel-wafula.jpg", "Cousin Daniel", "A Mombasa portrait, black and white.", "2019", "Family album"),
      photo("d2", "/images/memorial/memorial-reunion.jpg", "Relatives gathered outdoors", "The December homecoming.", "2019", "Family album"),
      photo("d3", "/images/memorial/memorial-dusk.jpg", "An acacia at dusk", "The coast, at sunset.", "2022", "Mombasa branch"),
    ],
    causeId: "NY-CON-2026-0392",
    causeTitle: "Cousin Daniel · Mombasa house fund",
    raised: 42_000,
    target: 180_000,
    anniversary: "05-28",
    anniversaryLabel: "Third death anniversary",
    candlesLit: 97,
    views: 1_340,
    tags: ["cousin", "mombasa", "port", "builder"],
  },
  {
    id: "NY-OB-2018-0044",
    name: "Mary Nanjala Nalyanya",
    shortName: "Aunt Mary",
    born: "1955-06-21",
    died: "2018-08-09",
    birthYear: 1955,
    deathYear: 2018,
    age: 63,
    gender: "female",
    branchId: "kakamega-samuel",
    relationship: "Aunt · tailor of the family",
    generation: 2,
    portrait: "/images/memorial/mary-nanjala.jpg",
    portraitAlt: "Mary Nanjala Nalyanya, tailor",
    notice: [
      "Mary Nanjala Nalyanya died on Thursday 9 August 2018 in Kakamega after a long illness.",
      "She was a tailor by trade and by temperament: she measured every member of this family at least once a decade, and she altered the same wedding suit for four different cousins.",
      "Her shop on the Kakamega market road was where the family went for alterations, for advice, and occasionally for shelter from the rain.",
    ],
    familyStatement:
      "She could look at a hem and tell you who had lost weight. She made sure the family was dressed for every occasion, whether or not there was money for it.",
    status: "published",
    publishedAt: "2018-08-10",
    lifeStory: [
      { year: "1955", title: "Born in Kakamega", detail: "The second of four daughters." },
      { year: "1974", title: "Learned to cut and sew", detail: "Apprenticed in Kakamega town." },
      { year: "1983", title: "Opened the market shop", detail: "A machine, one table, and a good name." },
      { year: "1997", title: "Four cousins, one suit", detail: "The same wedding suit, altered four times." },
      { year: "2018", title: "Laid to rest in Kakamega", detail: "Buried at Shieywe cemetery." },
    ],
    funeral: {
      date: "2018-08-14",
      time: "10:00",
      venue: "Kakamega Family Church",
      town: "Kakamega",
      county: "Kakamega",
      coordinates: { lat: 0.0526, lng: 34.7688 },
      burial: "Shieywe cemetery, Kakamega.",
      program: [
        { time: "09:00", title: "Arrival & viewing", detail: "At the family church." },
        { time: "10:00", title: "Requiem", detail: "Led by the Kakamega branch." },
        { time: "11:00", title: "Farewell from the shop", detail: "Her clients spoke for her." },
        { time: "11:45", title: "Interment", detail: "Shieywe cemetery." },
        { time: "13:00", title: "Family lunch", detail: "At the family church hall." },
      ],
    },
    gallery: [
      photo("m1", "/images/memorial/mary-nanjala.jpg", "Aunt Mary at the machine", "Pins in the mouth, always.", "2012", "Samuel Kipkoech"),
      photo("m2", "/images/memorial/memorial-home.jpg", "The family in traditional attire", "She made that.", "2007", "Family album"),
      photo("m3", "/images/memorial/memorial-wedding.jpg", "A wedding celebration", "Four cousins in one suit.", "1997", "Family album"),
    ],
    causeId: "NY-CON-2026-0391",
    causeTitle: "Aunt Mary · Kakamega tailoring fund",
    raised: 31_000,
    target: 90_000,
    anniversary: "08-09",
    anniversaryLabel: "Death anniversary",
    candlesLit: 64,
    views: 980,
    tags: ["aunt", "tailor", "kakamega"],
  },
  {
    id: "NY-OB-2012-0028",
    name: "Hellen Njeri Nalyanya",
    shortName: "Aunt Hellen",
    born: "1961-02-11",
    died: "2012-05-02",
    birthYear: 1961,
    deathYear: 2012,
    age: 51,
    gender: "female",
    branchId: "nyeri-hellen",
    relationship: "Aunt · midwife and community nurse",
    generation: 2,
    portrait: "/images/memorial/hellen-nasimiyu.jpg",
    portraitAlt: "Hellen Njeri Nalyanya, midwife",
    notice: [
      "Hellen Njeri Nalyanya died on Wednesday 2 May 2012 in Nyeri after a short illness.",
      "She trained as a midwife and delivered more than four thousand children in the villages around Nyeri, many of them by bicycle lamp and on foot.",
      "She named every child she delivered after a Nalyanya relative, and kept a list of all of them.",
    ],
    familyStatement:
      "She arrived before everyone else and left after the last one had gone home. She kept a list of four thousand names, and she knew each one.",
    status: "published",
    publishedAt: "2012-05-03",
    lifeStory: [
      { year: "1961", title: "Born in Nyeri", detail: "The second of three daughters." },
      { year: "1984", title: "Qualified as a midwife", detail: "Nyeri nursing training college." },
      { year: "1989", title: "The bicycle and the lamp", detail: "Night deliveries across four sub-counties." },
      { year: "1996", title: "The list of names", detail: "Started writing down every child she delivered." },
      { year: "2012", title: "Laid to rest at Nyeri", detail: "Buried at Gathiguru cemetery." },
    ],
    funeral: {
      date: "2012-05-05",
      time: "10:00",
      venue: "Gathiguru Family Ground",
      town: "Nyeri",
      county: "Nyeri",
      coordinates: { lat: -0.4167, lng: 36.95 },
      burial: "Gathiguru family ground, Nyeri.",
      program: [
        { time: "09:00", title: "Arrival & viewing", detail: "At the family ground." },
        { time: "10:00", title: "Requiem", detail: "Led by the Nyeri branch." },
        { time: "11:00", title: "Reading of the names", detail: "A page of the list, read aloud." },
        { time: "11:40", title: "Interment", detail: "Gathiguru family ground." },
        { time: "13:00", title: "Family lunch", detail: "Under the mango tree." },
      ],
    },
    gallery: [
      photo("h1", "/images/memorial/hellen-nasimiyu.jpg", "Aunt Hellen", "She never carried a bag she could not carry alone.", "2006", "Naomi Achieng"),
      photo("h2", "/images/memorial/memorial-church.jpg", "A congregation in a bright hall", "The nurses' Sunday.", "2008", "Nyeri branch"),
    ],
    causeId: "NY-CON-2026-0390",
    causeTitle: "Aunt Hellen · maternal health fund",
    raised: 118_000,
    target: 160_000,
    anniversary: "05-02",
    anniversaryLabel: "Fourteenth death anniversary",
    candlesLit: 121,
    views: 1_510,
    tags: ["aunt", "midwife", "nyeri"],
  },
  {
    id: "NY-OB-2026-0155",
    name: "Amos Wafula Nalyanya",
    shortName: "Uncle Amos",
    born: "1959-10-30",
    died: "2026-04-18",
    birthYear: 1959,
    deathYear: 2026,
    age: 66,
    gender: "male",
    branchId: "kimilili-joseph",
    relationship: "Uncle · miller and grain trader",
    generation: 2,
    portrait: "/images/memorial/mzee-victor.jpg",
    portraitAlt: "Amos Wafula Nalyanya",
    notice: [
      "Amos Wafula Nalyanya died on Saturday 18 April 2026 at Kimilili. This notice is still being prepared with the family.",
    ],
    familyStatement:
      "Draft — awaiting the family's preferred wording before publication.",
    status: "draft",
    publishedAt: "2026-04-19",
    lifeStory: [
      { year: "1959", title: "Born at Kimilili", detail: "Draft record — being confirmed with the branch." },
    ],
    funeral: {
      date: "2026-04-22",
      time: "10:00",
      venue: "Kimilili Family Compound",
      town: "Kimilili",
      county: "Bungoma",
      coordinates: { lat: 0.5356, lng: 34.7511 },
      burial: "Kimilili — to be confirmed.",
      program: [
        { time: "09:00", title: "Arrival & viewing", detail: "Draft programme — awaiting confirmation." },
        { time: "10:00", title: "Devotion", detail: "Draft programme — awaiting confirmation." },
      ],
    },
    gallery: [
      photo("a1", "/images/memorial/memorial-fields.jpg", "Fields near Kimilili", "Placeholder image — awaiting the family album.", "2026", "Pending"),
    ],
    causeId: "",
    causeTitle: "No cause linked yet",
    raised: 0,
    target: 0,
    anniversary: "04-18",
    anniversaryLabel: "First death anniversary",
    candlesLit: 12,
    views: 84,
    tags: ["draft", "kimilili"],
  },
];

/* ─── Condolences ──────────────────────────────────────────────────────── */

export const CONDOLENCES: Condolence[] = [
  {
    id: "NY-CDN-0041",
    obituaryId: "NY-OB-2019-0007",
    authorId: "NY-MBR-00019",
    authorName: "Brian Otieno Nalyanya",
    authorImage: "/images/family/brian.jpg",
    relation: "Grandson",
    message:
      "We buried Mzee Victor with the stool he never sat on. Rest well, grandfather — the table is still full.",
    postedAt: "2026-05-10T07:42:00+03:00",
    candles: 41,
    status: "visible",
  },
  {
    id: "NY-CDN-0042",
    obituaryId: "NY-OB-2019-0007",
    authorId: "NY-MBR-00003",
    authorName: "Joseph Wafula Nalyanya",
    authorImage: "/images/family/joseph.jpg",
    relation: "Son",
    message:
      "Thirty years of reading to you at the kitchen table. I still hear your voice when I correct a pupil.",
    postedAt: "2026-05-11T18:05:00+03:00",
    candles: 63,
    status: "visible",
  },
  {
    id: "NY-CDN-0043",
    obituaryId: "NY-OB-2019-0007",
    authorId: "NY-MBR-00014",
    authorName: "Naomi Achieng Nalyanya",
    authorImage: "/images/family/naomi.jpg",
    relation: "Granddaughter",
    message:
      "The story you told me about the long walk home is the first thing I tell my own children now.",
    postedAt: "2026-05-12T09:20:00+03:00",
    candles: 28,
    status: "visible",
  },
  {
    id: "NY-CDN-0044",
    obituaryId: "NY-OB-2025-0148",
    authorId: "NY-MBR-00009",
    authorName: "Ruth Wakoli Nalyanya",
    authorImage: "/images/family/ruth.jpg",
    relation: "Sister",
    message:
      "Five exercise books of family history, and now we have to learn to carry them ourselves. We will.",
    postedAt: "2026-05-09T21:12:00+03:00",
    candles: 55,
    status: "visible",
  },
  {
    id: "NY-CDN-0045",
    obituaryId: "NY-OB-2025-0148",
    authorId: "NY-MBR-00007",
    authorName: "Samuel Kipkoech Nalyanya",
    authorImage: "/images/family/samuel.jpg",
    relation: "Brother",
    message:
      "The weaver birds are wrong this year. You would have known why.",
    postedAt: "2026-05-10T06:55:00+03:00",
    candles: 37,
    status: "visible",
  },
  {
    id: "NY-CDN-0046",
    obituaryId: "NY-OB-2024-0112",
    authorId: "NY-MBR-00011",
    authorName: "Grace Adhiambo Nalyanya",
    authorImage: "/images/family/grace.jpg",
    relation: "Sister",
    message:
      "The notebook stays in the clinic. Every page in your handwriting, exactly as you wanted.",
    postedAt: "2026-05-19T13:30:00+03:00",
    candles: 72,
    status: "visible",
  },
  {
    id: "NY-CDN-0047",
    obituaryId: "NY-OB-2024-0112",
    authorId: "NY-MBR-00022",
    authorName: "Ethan Nalyanya",
    authorImage: "/images/family/ethan.jpg",
    relation: "Grandnephew",
    message:
      "You taught me to read by letting me choose the words. I am in university now because of that.",
    postedAt: "2026-05-20T08:02:00+03:00",
    candles: 19,
    status: "visible",
  },
  {
    id: "NY-CDN-0048",
    obituaryId: "NY-OB-2020-0026",
    authorId: "NY-MBR-00005",
    authorName: "Peter Otieno Nalyanya",
    authorImage: "/images/family/peter.jpg",
    relation: "Nephew",
    message:
      "The Sunday class still opens with a prayer and a sweet. Nobody wanted to change it.",
    postedAt: "2026-06-02T10:14:00+03:00",
    candles: 44,
    status: "visible",
  },
  {
    id: "NY-CDN-0049",
    obituaryId: "NY-OB-2020-0026",
    authorId: "NY-MBR-00013",
    authorName: "Hellen Nasimiyu Nalyanya",
    authorImage: "/images/family/hellen.jpg",
    relation: "Niece",
    message:
      "Aunt Rebecca called every single year on the anniversary. Not one missed. Not one.",
    postedAt: "2026-06-03T16:40:00+03:00",
    candles: 31,
    status: "visible",
  },
  {
    id: "NY-CDN-0050",
    obituaryId: "NY-OB-2014-0031",
    authorId: "NY-MBR-00004",
    authorName: "Ann Nalyanya",
    relation: "Daughter",
    message:
      "I finally wrote the fish stew down properly. It still tastes like hers.",
    postedAt: "2026-03-21T12:00:00+03:00",
    candles: 58,
    status: "visible",
  },
  {
    id: "NY-CDN-0051",
    obituaryId: "NY-OB-2014-0031",
    authorId: "NY-MBR-00015",
    authorName: "Caleb Kiprono Nalyanya",
    authorImage: "/images/family/ethan.jpg",
    relation: "Grandson",
    message:
      "Saturday market, six in the morning, for thirty years. I have never known anyone work harder for a Sunday.",
    postedAt: "2026-03-22T09:25:00+03:00",
    candles: 26,
    status: "visible",
  },
  {
    id: "NY-CDN-0052",
    obituaryId: "NY-OB-2023-0091",
    authorId: "NY-MBR-00012",
    authorName: "Daniel Wafula Nalyanya",
    authorImage: "/images/family/daniel.jpg",
    relation: "Brother",
    message:
      "The house is finished the way you left it. Nobody has changed a single window.",
    postedAt: "2026-05-28T19:00:00+03:00",
    candles: 33,
    status: "visible",
  },
  {
    id: "NY-CDN-0053",
    obituaryId: "NY-OB-2023-0091",
    authorId: "NY-MBR-00019",
    authorName: "Brian Otieno Nalyanya",
    authorImage: "/images/family/brian.jpg",
    relation: "Cousin",
    message:
      "We sailed a container of his books to Mombasa last month. Still in his handwriting.",
    postedAt: "2026-05-29T08:12:00+03:00",
    candles: 12,
    status: "pending",
  },
  {
    id: "NY-CDN-0054",
    obituaryId: "NY-OB-2018-0044",
    authorId: "NY-MBR-00019",
    authorName: "Brian Otieno Nalyanya",
    authorImage: "/images/family/brian.jpg",
    relation: "Nephew",
    message: "She altered my graduation suit twice and was right both times.",
    postedAt: "2026-08-09T11:30:00+03:00",
    candles: 9,
    status: "pending",
  },
];

/* ─── Anniversaries ────────────────────────────────────────────────────── */

export const ANNIVERSARIES: Anniversary[] = [
  { obituaryId: "NY-OB-2025-0148", date: "2026-05-09", label: "Samuel Wafula Nalyanya", years: 1, kind: "death", reminderSet: true },
  { obituaryId: "NY-OB-2019-0007", date: "2026-05-12", label: "Mzee Victor Wafula Nalyanya", years: 7, kind: "death", reminderSet: true },
  { obituaryId: "NY-OB-2024-0112", date: "2026-05-18", label: "Faith Wanjiru Nalyanya", years: 2, kind: "death", reminderSet: false },
  { obituaryId: "NY-OB-2023-0091", date: "2026-05-28", label: "Daniel Otieno Nalyanya", years: 3, kind: "death", reminderSet: false },
  { obituaryId: "NY-OB-2020-0026", date: "2026-06-02", label: "Rebecca Auma Nalyanya", years: 6, kind: "death", reminderSet: false },
  { obituaryId: "NY-OB-2018-0044", date: "2026-08-09", label: "Mary Nanjala Nalyanya", years: 8, kind: "death", reminderSet: false },
  { obituaryId: "NY-OB-2012-0028", date: "2027-05-02", label: "Hellen Njeri Nalyanya", years: 15, kind: "death", reminderSet: false },
];

/* ─── Audit ────────────────────────────────────────────────────────────── */

export const OBITUARY_AUDIT: AuditEntry[] = [
  { id: "aud-1", at: "2026-05-12T07:40:00+03:00", actor: "Brian Otieno Nalyanya", action: "Condolence posted", detail: "On Mzee Victor's notice — candle count 41.", tone: "neutral" },
  { id: "aud-2", at: "2026-05-11T16:02:00+03:00", actor: "Brian Otieno Nalyanya", action: "Anniversary reminder set", detail: "Seventh death anniversary of Mzee Victor (12 May).", tone: "neutral" },
  { id: "aud-3", at: "2026-05-09T21:30:00+03:00", actor: "Brian Otieno Nalyanya", action: "Notice published", detail: "Uncle Samuel Wafula Nalyanya — 9 May 2025, Kitale branch.", tone: "neutral" },
  { id: "aud-4", at: "2026-05-03T09:12:00+03:00", actor: "Ruth Wakoli Nalyanya", action: "Family statement edited", detail: "Seventh death anniversary notice refreshed with two family photographs.", tone: "neutral" },
  { id: "aud-5", at: "2026-04-19T10:05:00+03:00", actor: "Brian Otieno Nalyanya", action: "Draft created", detail: "Uncle Amos Wafula Nalyanya — awaiting the family's preferred wording.", tone: "sensitive" },
  { id: "aud-6", at: "2026-04-02T14:18:00+03:00", actor: "Brian Otieno Nalyanya", action: "Notice unpublished", detail: "Withdrawn at the family's request; no public notice was shown. Reason: family request.", tone: "sensitive" },
];

/* ─── The quiet statement on the header ────────────────────────────────── */

export const REMEMBRANCE_STATEMENT =
  "We do not lose our people. We carry them — in the recipes, in the names we give, in the chairs we keep empty at the table until the next gathering.";

/* ─── Helpers ──────────────────────────────────────────────────────────── */

export const OBITUARY_YEARS: number[] = Array.from(
  new Set(OBITUARIES.map((o) => o.deathYear)),
).sort((a, b) => b - a);

export const OBITUARY_TAGS: string[] = Array.from(
  new Set(OBITUARIES.flatMap((o) => o.tags)),
).sort();

export function obituaryById(id: string | undefined): Obituary | undefined {
  if (!id) return undefined;
  return OBITUARIES.find((o) => o.id === id);
}

export function condolencesFor(id: string | undefined): Condolence[] {
  if (!id) return [];
  return CONDOLENCES.filter((c) => c.obituaryId === id);
}

export function publishedObituaries(): Obituary[] {
  return OBITUARIES.filter((o) => o.status === "published");
}

/** Years since someone was born — used in the life-story header. */
export function yearsSince(year: number): number {
  return 2026 - year;
}
