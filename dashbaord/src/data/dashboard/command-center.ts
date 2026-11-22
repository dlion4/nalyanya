import type {
  Alert,
  Branch,
  Contribution,
  FamilyEvent,
  Member,
  Memory,
} from "@/types/workspace";

export const family = {
  name: "Nalyanya",
  root: "Mzee Victor Nalyanya",
  members: 248,
  branches: 12,
  generations: 5,
  wallet: 1284500,
  contributions: 186500,
  shares: 312000,
  loans: 125000,
};
export const kes = (value: number) =>
  `KES ${Math.round(value).toLocaleString("en-KE")}`;
export const compact = (value: number) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
export const localDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {},
) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    ...options,
  }).format(new Date(date));
export const dateFromToday = (days: number, hour = 11) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(hour - 3, 0, 0, 0);
  return d.toISOString();
};
const names = [
  "Bungoma",
  "Kakamega",
  "Nairobi",
  "Trans-Nzoia",
  "Kisumu",
  "Nakuru",
  "Uasin Gishu",
  "Busia",
  "Kiambu",
  "Vihiga",
  "Mombasa",
  "Diaspora",
];
const counts = [52, 38, 34, 26, 21, 19, 15, 12, 10, 9, 7, 5];
const colors = [
  "#527859",
  "#b7814d",
  "#8992b4",
  "#ba8966",
  "#67968e",
  "#a58d51",
];
export const branches: Branch[] = names.map((name, i) => ({
  id: name.toLowerCase().replace(/ /g, "-"),
  name,
  members: counts[i],
  balance: Math.round((family.wallet * counts[i]) / 248),
  growth: [12.8, 9.4, 16.2, 8.6, 10.4, 7.5][i % 6],
  color: colors[i % 6],
}));
const people = [
  [
    "Mzee Victor Nalyanya",
    "Mzee Victor",
    "bungoma",
    1,
    "Family founder",
    "The roots of our family begin with Mzee Victor. His homestead in Bungoma remains a gathering place for every generation.",
  ],
  [
    "Mama Grace Nalyanya",
    "Mama Grace",
    "bungoma",
    2,
    "Retired teacher",
    "Keeper of family recipes, stories, and a garden that always has room for another chair.",
  ],
  [
    "Brian Otieno Nalyanya",
    "Brian",
    "nairobi",
    3,
    "Architect",
    "Our family administrator, connecting branches and keeping the family archive close at hand.",
  ],
  [
    "Faith Chebet Nalyanya",
    "Faith",
    "kakamega",
    3,
    "Teacher",
    "Faith coordinates the education fund and helps our youngest members find their next chapter.",
  ],
  [
    "Peter Wafula Nalyanya",
    "Peter",
    "bungoma",
    2,
    "Agronomist",
    "Peter tends the family farm and hosts the annual harvest lunch at the homestead.",
  ],
  [
    "Amina Hassan Nalyanya",
    "Amina",
    "nairobi",
    3,
    "Nurse",
    "Amina brings all our branches together through the family wellness circle.",
  ],
  [
    "Daniel Wekesa Nalyanya",
    "Daniel",
    "trans-nzoia",
    3,
    "Civil engineer",
    "Daniel looks after the family building projects and our shared savings records.",
  ],
  [
    "Lydia Achieng Nalyanya",
    "Lydia",
    "kisumu",
    4,
    "Photographer",
    "Lydia documents our reunions and preserves the family photo albums.",
  ],
  [
    "Joseph Barasa Nalyanya",
    "Joseph",
    "nakuru",
    3,
    "Veterinarian",
    "Joseph is a mentor to students in the family and a regular at the monthly chama.",
  ],
  [
    "Esther Nekesa Nalyanya",
    "Esther",
    "bungoma",
    4,
    "Community organizer",
    "Esther brings cousins, grandparents, and neighbours together for community days.",
  ],
  [
    "Hamza Hassan Nalyanya",
    "Hamza",
    "mombasa",
    4,
    "Designer",
    "Hamza shares the stories of our coast-based branch through photography and design.",
  ],
  [
    "Zawadi Nalyanya",
    "Zawadi",
    "kakamega",
    5,
    "Student",
    "One of the youngest leaves on the family tree, with a love of drawing and the outdoors.",
  ],
] as const;
export const members: Member[] = people.map((p, i) => ({
  id: `NY-MBR-${String(i + 1).padStart(5, "0")}`,
  name: p[0],
  short: p[1],
  branch: p[2],
  generation: p[3],
  profession: p[4],
  bio: p[5],
  image: i === 2 ? "/images/brian.webp" : undefined,
}));
export const memories: Memory[] = [
  {
    id: "roots",
    title: "Where our story begins",
    image: "/images/savannah.webp",
    alt: "The setting sun shines through a broad acacia tree on the savannah",
    caption:
      "An acacia stands against the evening sky. A reminder that strong roots make room for every branch.",
    place: "The Kenyan savannah",
    year: "2025",
    credit: "Unsplash",
  },
  {
    id: "reunion",
    title: "Together, under one roof",
    image: "/images/reunion.webp",
    alt: "A family in colourful traditional clothing sharing a happy moment together",
    caption:
      "The best part of a family gathering is the time between the photographs: the teasing, the stories, and the laughter.",
    place: "The family homestead",
    year: "2025",
    credit: "Askar Abayev / Pexels",
  },
  {
    id: "highlands",
    title: "A way back home",
    image: "/images/highlands.webp",
    alt: "Green patchwork fields and a winding road in the Kenyan highlands",
    caption:
      "A long road through the highlands always feels a little shorter when it is taking us home.",
    place: "Kenyan highlands",
    year: "2025",
    credit: "Vince Pictures / Pexels",
  },
  {
    id: "generations",
    title: "Stories across generations",
    image: "/images/grandparents.webp",
    alt: "A grandfather and young grandson laughing together",
    caption:
      "Some of our most treasured stories are passed down in the quiet, ordinary moments.",
    place: "Our family album",
    year: "2025",
    credit: "Mikhail Nilov / Pexels",
  },
  {
    id: "traditions",
    title: "Made with love",
    image: "/images/traditions.webp",
    alt: "A family making handmade gifts together at home",
    caption:
      "An afternoon of making keepsakes and passing familiar traditions on to new hands.",
    place: "The family homestead",
    year: "2024",
    credit: "Askar Abayev / Pexels",
  },
  {
    id: "garden",
    title: "An afternoon in the garden",
    image: "/images/garden.webp",
    alt: "Family members sharing a sunny afternoon in a green garden",
    caption:
      "A shared meal, a shady tree, and a long afternoon with the people we love.",
    place: "The family garden",
    year: "2024",
    credit: "Samuel Peter / Pexels",
  },
];
const eventSeeds = [
  [
    "Nalyanya family reunion",
    8,
    "Bungoma homestead",
    "Mama Grace",
    "Reunion",
    "bungoma",
    42,
    "reunion",
  ],
  [
    "Sunday at the homestead",
    11,
    "The family garden",
    "Peter Wafula",
    "Family lunch",
    "bungoma",
    18,
    "garden",
  ],
  [
    "Education fund gathering",
    14,
    "Kakamega community hall",
    "Faith Chebet",
    "Fundraiser",
    "kakamega",
    27,
    "traditions",
  ],
  [
    "Cousins in the city",
    17,
    "Karura Forest, Nairobi",
    "Brian Otieno",
    "Picnic",
    "nairobi",
    16,
    "garden",
  ],
  [
    "An evening of family stories",
    22,
    "Kitale homestead",
    "Daniel Wekesa",
    "Heritage",
    "trans-nzoia",
    21,
    "grandparents",
  ],
  [
    "Family harvest lunch",
    27,
    "Kisumu family garden",
    "Lydia Achieng",
    "Family lunch",
    "kisumu",
    24,
    "highlands",
  ],
  [
    "Wazee annual gathering",
    36,
    "Bungoma homestead",
    "Mama Grace",
    "Reunion",
    "bungoma",
    32,
    "reunion",
  ],
  [
    "Youth mentorship morning",
    41,
    "Nakuru library",
    "Joseph Barasa",
    "Mentorship",
    "nakuru",
    12,
    "garden",
  ],
  [
    "Family wellness day",
    46,
    "Uhuru Gardens",
    "Amina Hassan",
    "Wellness",
    "nairobi",
    19,
    "family-portrait",
  ],
  [
    "Coastal cousins meet-up",
    53,
    "Mombasa family home",
    "Hamza Hassan",
    "Reunion",
    "mombasa",
    14,
    "garden",
  ],
] as const;
export const events: FamilyEvent[] = eventSeeds.map((e, i) => ({
  id: `NY-EVT-${String(i + 1).padStart(4, "0")}`,
  title: e[0],
  date: dateFromToday(e[1]),
  place: e[2],
  host: e[3],
  type: e[4],
  branch: e[5],
  attending: e[6],
  image: `/images/${e[7]}.webp`,
  description:
    i === 0
      ? "Come home for a day of shared food, family photographs, and stories from our elders. Every generation and every branch is welcome."
      : "A chance to spend time together, catch up on family news, and make a few more memories. All generations are welcome.",
}));
const causes = [
  "Education fund",
  "Family welfare",
  "Reunion fund",
  "Homestead project",
];
export const contributions: Contribution[] = [
  3, 4, 5, 6, 7, 8, 9, 10, 2, 1, 5, 6,
].map((p, i) => ({
  id: `NY-CON-${String(1048 - i).padStart(5, "0")}`,
  member: members[p].name,
  purpose: causes[i % 4],
  amount: [
    5000, 3000, 10000, 2500, 7500, 5000, 4000, 8000, 12500, 2500, 6000, 3500,
  ][i],
  time: [
    "24 min ago",
    "1 hour ago",
    "2 hours ago",
    "3 hours ago",
    "4 hours ago",
    "Yesterday",
  ][Math.min(i, 5)],
  status: i % 4 === 3 ? "Pending" : "Recorded",
  branch: members[p].branch,
}));
export const alerts: Alert[] = [
  {
    id: "verify",
    title: "Contributions to review",
    text: "Three contributions are waiting for a family administrator to check their details.",
    kind: "contribution",
    time: "24 min ago",
  },
  {
    id: "rotate",
    title: "A chama rotation is approaching",
    text: "Wazee Round rotates in two days. Mama Grace is next to receive the pool; your position is four.",
    kind: "chama",
    time: "1 hour ago",
  },
  {
    id: "loan",
    title: "One instalment needs attention",
    text: "The KES 2,500 instalment for education loan NY-LON-00088 is two days overdue.",
    kind: "loan",
    time: "2 hours ago",
    critical: true,
  },
  {
    id: "receive",
    title: "An unused receive link",
    text: "Mama Grace has not opened her KES 3,000 allocation preview. Review the details before preparing a reminder.",
    kind: "allocation",
    time: "Yesterday",
  },
  {
    id: "gather",
    title: "A family gathering is on the calendar",
    text: "Mama Grace has shared the plans for our next family reunion. Let the family know if you can join.",
    kind: "event",
    time: "Yesterday",
  },
];
export const funds = [
  {
    id: "education",
    title: "Family education fund",
    raised: 145000,
    target: 200000,
    description: "School fees and learning materials for the next generation.",
    icon: "education",
  },
  {
    id: "homestead",
    title: "Our homestead project",
    raised: 86400,
    target: 120000,
    description: "Caring for the place that brings every branch together.",
    icon: "home",
  },
  {
    id: "welfare",
    title: "Family welfare circle",
    raised: 62500,
    target: 100000,
    description: "A helping hand when someone in our family needs one.",
    icon: "heart",
  },
];
export const chamas = [
  {
    id: "wazee",
    name: "Wazee Round",
    members: 18,
    pool: 90000,
    next: "Mama Grace",
    days: 2,
    position: 4,
  },
  {
    id: "umoja",
    name: "Umoja Savings",
    members: 24,
    pool: 120000,
    next: "Faith Chebet",
    days: 7,
    position: 8,
  },
  {
    id: "cousins",
    name: "Cousins Circle",
    members: 12,
    pool: 36000,
    next: "Lydia Achieng",
    days: 12,
    position: 3,
  },
];
export const financeHistory = [
  32, 33, 31, 36, 35, 41, 39, 37, 42, 48, 45, 52, 51, 58, 56, 60, 66, 63, 64,
  70, 68, 75, 71, 76, 83, 80, 83, 89, 86, 91, 88, 97,
];
