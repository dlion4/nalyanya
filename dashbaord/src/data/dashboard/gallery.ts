/* T-5 Gallery — dedicated page data (frontend-only mock, deterministic).
   Photos are real files under /public/images/gallery and /public/images/family.
   Every record carries the *displayed* crop ratio so the masonry layout can
   reserve the right box before the image loads (no layout shift). */

import { EVENTS_SEED } from "@/data/dashboard/events";
import { MEMBERS } from "@/data/family/people";
import { between, hashString, mulberry32 } from "@/lib/rng";
import type { Member } from "@/types/family";

export type SourceKind = "google-drive" | "direct-upload" | "contributor" | "scan";
export type SyncState = "synced" | "syncing" | "paused" | "error";
export type AlbumVisibility = "all-family" | "branch" | "admins-only";
export type AuditAction = "upload" | "delete" | "restore" | "tag" | "untag" | "move" | "rename" | "cover" | "connect" | "sync";

export interface GalleryAlbum {
  id: string;
  name: string;
  year: string;
  branchId: string;
  visibility: AlbumVisibility;
  coverId: string;
  description: string;
  eventId: string | null;
  createdAt: string;
}

export interface PhotoSource {
  id: string;
  kind: SourceKind;
  label: string;
  detail: string;
  folderUrl: string | null;
  state: SyncState;
  lastSyncMinutes: number;
  photoCount: number;
  owner: string;
}

/** ratio = width / height of the *displayed* crop. */
export interface GalleryPhoto {
  id: string;
  file: string;
  /** Natural pixel size of the file. */
  w: number;
  h: number;
  /** Displayed crop ratio (width / height). */
  ratio: number;
  caption: string;
  albumId: string;
  takenOn: string;
  year: string;
  contributorId: string;
  eventId: string | null;
  taggedIds: string[];
  sourceId: string;
  /** 0–100, used to order within an album. */
  seq: number;
  favourites: number;
  bytes: number;
  /**
   * Where the most notable face sits in the frame (0–100, from top-left).
   * Used by the lightbox so the camera shutter closes onto a person rather
   * than always onto the centre. Absent when no position is known.
   */
  focus?: { x: number; y: number };
}

export interface GalleryAudit {
  id: string;
  at: string;
  actorId: string;
  action: AuditAction;
  subject: string;
  detail: string;
}

export interface TrashEntry {
  deletedAt: string;
  deletedBy: string;
  reason: string;
  /** Days remaining in the 30-day recovery window. */
  daysLeft: number;
}

export const ALBUMS: GalleryAlbum[] = [
  { id: "ALB-REUNION", name: "Reunions & gatherings", year: "2025", branchId: "nalyanya-main", visibility: "all-family", coverId: "NY-IMG-00001", description: "The whole family under one tent: Christmas in Kimilili, Easter in Nairobi and every long table in between.", eventId: "EVT-2025-112", createdAt: "2025-12-27" },
  { id: "ALB-WEDDINGS", name: "Weddings", year: "2026", branchId: "kitale-ruth", visibility: "all-family", coverId: "NY-IMG-00010", description: "Caleb and Esther's ceremonies, from the introduction to the last dance.", eventId: "EVT-2026-016", createdAt: "2026-02-14" },
  { id: "ALB-CHILDREN", name: "Little ones", year: "2026", branchId: "nalyanya-main", visibility: "branch", coverId: "NY-IMG-00018", description: "Cousins at play. Visible to the Main branch only, because these are children's photographs.", eventId: null, createdAt: "2026-01-18" },
  { id: "ALB-HOME", name: "Our homeland", year: "2024", branchId: "nalyanya-main", visibility: "all-family", coverId: "NY-IMG-00028", description: "The hills, the plains and the acacias that the diaspora asks to see every call.", eventId: null, createdAt: "2024-08-09" },
  { id: "ALB-KITCHEN", name: "Kitchen & recipes", year: "2025", branchId: "kakamega-samuel", visibility: "all-family", coverId: "NY-IMG-00036", description: "Esther's recipe book brought to life: fires, mortars and the pots that feed a hundred.", eventId: null, createdAt: "2025-06-21" },
  { id: "ALB-DEVOTION", name: "Choir & devotion", year: "2026", branchId: "nairobi-peter", visibility: "all-family", coverId: "NY-IMG-00044", description: "Sunday services, the family choir and the watch-night prayers.", eventId: "EVT-2026-002", createdAt: "2026-01-05" },
  { id: "ALB-FARM", name: "Farm & harvest", year: "2025", branchId: "eldoret-caleb", visibility: "all-family", coverId: "NY-IMG-00051", description: "Maize, dairy and the co-op fields in Mumias and Eldoret.", eventId: null, createdAt: "2025-10-30" },
  { id: "ALB-PORTRAITS", name: "Family portraits", year: "2026", branchId: "nalyanya-main", visibility: "all-family", coverId: "NY-IMG-00058", description: "Formal portraits of elders, stewards and the newest branch leaders.", eventId: null, createdAt: "2026-03-02" },
  { id: "ALB-ARCHIVE", name: "Scanned archive", year: "1978", branchId: "nalyanya-main", visibility: "admins-only", coverId: "NY-IMG-00064", description: "Prints from the trunk in Kimilili, scanned for the family. Admins-only until each face is confirmed.", eventId: null, createdAt: "2025-11-11" },
];

export const SOURCES: PhotoSource[] = [
  { id: "SRC-DRIVE", kind: "google-drive", label: "Google Drive · Nalyanya Family Photos", detail: "Folder “Nalyanya Family Photos” · 9 sub-folders", folderUrl: "https://drive.google.com/drive/folders/ny-family-photos", state: "synced", lastSyncMinutes: 4, photoCount: 71, owner: "Brian Otieno Nalyanya" },
  { id: "SRC-CONTRIB", kind: "contributor", label: "Contributor uploads", detail: "WhatsApp forwards and phone photos from 14 relatives", folderUrl: null, state: "synced", lastSyncMinutes: 38, photoCount: 11, owner: "Peter Otieno Nalyanya" },
  { id: "SRC-DIRECT", label: "Direct uploads", kind: "direct-upload", detail: "Uploaded from this dashboard", folderUrl: null, state: "synced", lastSyncMinutes: 125, photoCount: 4, owner: "Brian Otieno Nalyanya" },
  { id: "SRC-SCAN", label: "Archive scans", kind: "scan", detail: "Kimilili prints scanned at 1200 dpi", folderUrl: null, state: "paused", lastSyncMinutes: 4320, photoCount: 2, owner: "Joseph Wafula Nalyanya" },
];

/** albumId → ordered file ids with a chosen display crop ("t" tall, "w" wide, "s" square). */
type Spec = [string, "t" | "w" | "s"][];

const RATIOS: Record<"t" | "w" | "s", number[]> = {
  t: [0.72, 0.76, 0.68, 0.8],
  w: [1.5, 1.42, 1.6],
  s: [1],
};

const REUNION_CAPTIONS = [
  "The reunion committee under the tent",
  "Three generations at the front step",
  "Sunday lunch on the long table",
  "A game of cards before the speeches",
  "The little ones take over the sofa",
  "Grandparents' corner, as always",
  "Washing up, together",
  "The group photograph, third attempt",
  "The last plate of the afternoon",
];
const WEDDING_CAPTIONS = [
  "The couple at the church door",
  "Traditional attire for the introduction",
  "Florals and a quiet moment",
  "The first look",
  "Laughing at the vows",
  "Zaria relatives who travelled for us",
  "The first dance",
  "A gaze across the room",
];
const CHILDREN_CAPTIONS = [
  "Three friends and one sunny afternoon",
  "Race you to the gate",
  "Mum joins the game",
  "The night before the reunion",
  "Sticks, grass and a whole afternoon",
  "Bright clothes, brighter smiles",
  "The slide at the public playground",
  "Hide and seek near the hedge",
  "Near the clotheslines",
  "The neighbourhood crew",
];
const HOME_CAPTIONS = [
  "A wildebeest at dusk",
  "Zebras at the watering hole",
  "The lone acacia",
  "Sunset over the plains",
  "The plain at golden hour",
  "Springbok under a blue sky",
  "The lioness near Mombasa",
  "A giraffe at sunset",
];
const KITCHEN_CAPTIONS = [
  "Stirring the pot over the fire",
  "Kneading in the big cauldron",
  "Preparing vegetables outdoors",
  "The mortar and pestle",
  "Cooking in the courtyard",
  "Sunday's Ugali, step one",
  "Esther's open-fire kitchen",
  "The indoor kitchen, in black and white",
];
const DEVOTION_CAPTIONS = [
  "The choir in the morning light",
  "Singing with everything",
  "Sunrays through the window",
  "Clapping along",
  "The Sunday service",
  "The pastor leads the hymn",
  "Hands lifted, eyes closed",
];
const FARM_CAPTIONS = [
  "Harvesting maize, cob by cob",
  "Peeling the husk",
  "Hands in the field",
  "A ripe cob in Kagera",
  "Maize cobs at the market",
  "The yellow shirt in the field",
  "Checking the crop",
];
const PORTRAIT_CAPTIONS = [
  "Mzee Victor, at home in Kimilili",
  "Esther Nanjala, remembered",
  "Joseph, the eldest son",
  "Peter, the Nairobi steward",
  "Samuel among the cane",
  "Ruth, the Kitale principal",
  "Grace in her scrubs",
  "Elias Wakoli, remembered",
  "Brian and Faith, the Family Head's house",
  "Naomi, writing from London",
  "Ethan, the great-grandson",
];
const ARCHIVE_CAPTIONS = [
  "A portrait from the trunk, circa 1978",
  "The album, before it was scanned",
  "Hands on the old prints",
];

const SPECS: Record<string, Spec> = {
  "ALB-REUNION": [
    ["g-r01", "w"], ["g-r02", "w"], ["g-r03", "w"], ["g-r04", "w"], ["g-r05", "w"], ["g-r06", "w"], ["g-r07", "w"], ["g-r08", "w"], ["g-r09", "w"],
  ],
  "ALB-WEDDINGS": [["g-w01", "t"], ["g-w02", "t"], ["g-w03", "t"], ["g-w04", "t"], ["g-w05", "t"], ["g-w06", "t"], ["g-w07", "t"], ["g-w08", "t"]],
  "ALB-CHILDREN": [["g-c01", "t"], ["g-c02", "t"], ["g-c03", "t"], ["g-c04", "t"], ["g-c05", "t"], ["g-c06", "t"], ["g-c07", "t"], ["g-c08", "t"], ["g-c09", "t"], ["g-c10", "t"]],
  "ALB-HOME": [["g-s01", "w"], ["g-s02", "w"], ["g-s03", "t"], ["g-s04", "w"], ["g-s05", "w"], ["g-s06", "w"], ["g-s07", "t"], ["g-s08", "t"]],
  "ALB-KITCHEN": [["g-k01", "t"], ["g-k02", "t"], ["g-k03", "t"], ["g-k04", "t"], ["g-k05", "t"], ["g-k06", "t"], ["g-k07", "t"], ["g-k08", "t"]],
  "ALB-DEVOTION": [["g-d01", "t"], ["g-d02", "t"], ["g-d03", "t"], ["g-d04", "t"], ["g-d05", "t"], ["g-d06", "t"], ["g-d07", "t"]],
  "ALB-FARM": [["g-f01", "t"], ["g-f02", "t"], ["g-f03", "t"], ["g-f04", "t"], ["g-f05", "t"], ["g-f06", "t"], ["g-f07", "t"]],
  "ALB-PORTRAITS": [
    ["mzee-victor", "t"], ["esther-matriarch", "t"], ["joseph", "t"], ["peter", "t"], ["samuel", "t"], ["ruth", "t"], ["grace", "t"], ["elder-stick", "t"], ["brian", "t"], ["naomi", "t"], ["ethan", "t"],
  ],
  "ALB-ARCHIVE": [["archive", "w"], ["album", "w"], ["hands-album", "w"]],
};

const CAPTIONS: Record<string, string[]> = {
  "ALB-REUNION": REUNION_CAPTIONS,
  "ALB-WEDDINGS": WEDDING_CAPTIONS,
  "ALB-CHILDREN": CHILDREN_CAPTIONS,
  "ALB-HOME": HOME_CAPTIONS,
  "ALB-KITCHEN": KITCHEN_CAPTIONS,
  "ALB-DEVOTION": DEVOTION_CAPTIONS,
  "ALB-FARM": FARM_CAPTIONS,
  "ALB-PORTRAITS": PORTRAIT_CAPTIONS,
  "ALB-ARCHIVE": ARCHIVE_CAPTIONS,
};

/** Where each album's photos were taken, and roughly when. */
const ALBUM_PLACE: Record<string, { place: string; base: string; span: number }> = {
  "ALB-REUNION": { place: "Kimilili · Nairobi", base: "2025-12-20", span: 110 },
  "ALB-WEDDINGS": { place: "Kitale · Eldoret", base: "2026-02-10", span: 80 },
  "ALB-CHILDREN": { place: "Kimilili · Kasarani", base: "2026-01-10", span: 100 },
  "ALB-HOME": { place: "Rift Valley", base: "2024-08-01", span: 40 },
  "ALB-KITCHEN": { place: "Mumias · Kimilili", base: "2025-06-15", span: 150 },
  "ALB-DEVOTION": { place: "Nairobi · Nyeri", base: "2026-01-04", span: 120 },
  "ALB-FARM": { place: "Eldoret · Mumias", base: "2025-09-20", span: 70 },
  "ALB-PORTRAITS": { place: "Kimilili · diaspora", base: "2026-03-01", span: 50 },
  "ALB-ARCHIVE": { place: "Kimilili", base: "2025-11-10", span: 2 },
};

const ALBUM_SOURCE: Record<string, string> = {
  "ALB-REUNION": "SRC-DRIVE",
  "ALB-WEDDINGS": "SRC-DRIVE",
  "ALB-CHILDREN": "SRC-CONTRIB",
  "ALB-HOME": "SRC-DRIVE",
  "ALB-KITCHEN": "SRC-CONTRIB",
  "ALB-DEVOTION": "SRC-DRIVE",
  "ALB-FARM": "SRC-DRIVE",
  "ALB-PORTRAITS": "SRC-DIRECT",
  "ALB-ARCHIVE": "SRC-SCAN",
};

/** Members who appear in each album (curated, real ids). */
const ALBUM_TAGS: Record<string, string[]> = {
  "ALB-REUNION": ["NY-MBR-00001", "NY-MBR-00003", "NY-MBR-00005", "NY-MBR-00019", "NY-MBR-00018", "NY-MBR-00009"],
  "ALB-WEDDINGS": ["NY-MBR-00015", "NY-MBR-00016", "NY-MBR-00009", "NY-MBR-00007"],
  "ALB-CHILDREN": ["NY-MBR-00022", "NY-MBR-00012"],
  "ALB-HOME": [],
  "ALB-KITCHEN": ["NY-MBR-00002", "NY-MBR-00008", "NY-MBR-00004"],
  "ALB-DEVOTION": ["NY-MBR-00005", "NY-MBR-00006", "NY-MBR-00013"],
  "ALB-FARM": ["NY-MBR-00007", "NY-MBR-00015", "NY-MBR-00020"],
  "ALB-PORTRAITS": ["NY-MBR-00001", "NY-MBR-00002", "NY-MBR-00003", "NY-MBR-00005", "NY-MBR-00007", "NY-MBR-00009", "NY-MBR-00011", "NY-MBR-00010", "NY-MBR-00019", "NY-MBR-00018", "NY-MBR-00014", "NY-MBR-00022"],
  "ALB-ARCHIVE": ["NY-MBR-00001", "NY-MBR-00002"],
};

const ALBUM_CONTRIBUTORS: Record<string, string[]> = {
  "ALB-REUNION": ["NY-MBR-00019", "NY-MBR-00018", "NY-MBR-00014"],
  "ALB-WEDDINGS": ["NY-MBR-00018", "NY-MBR-00016"],
  "ALB-CHILDREN": ["NY-MBR-00005", "NY-MBR-00006"],
  "ALB-HOME": ["NY-MBR-00014", "NY-MBR-00012"],
  "ALB-KITCHEN": ["NY-MBR-00008", "NY-MBR-00004"],
  "ALB-DEVOTION": ["NY-MBR-00005", "NY-MBR-00013"],
  "ALB-FARM": ["NY-MBR-00015", "NY-MBR-00007"],
  "ALB-PORTRAITS": ["NY-MBR-00018", "NY-MBR-00019"],
  "ALB-ARCHIVE": ["NY-MBR-00003"],
};

const EVENT_OF_ALBUM: Record<string, string | null> = {
  "ALB-REUNION": "EVT-2025-112",
  "ALB-WEDDINGS": "EVT-2026-016",
  "ALB-DEVOTION": "EVT-2026-002",
};

const CONTRIBUTOR_IDS = ["NY-MBR-00019", "NY-MBR-00018", "NY-MBR-00014", "NY-MBR-00016", "NY-MBR-00005", "NY-MBR-00006", "NY-MBR-00012", "NY-MBR-00008", "NY-MBR-00004", "NY-MBR-00013", "NY-MBR-00015", "NY-MBR-00007", "NY-MBR-00003"];

const TAG_POOL = ["NY-MBR-00001", "NY-MBR-00003", "NY-MBR-00004", "NY-MBR-00005", "NY-MBR-00006", "NY-MBR-00007", "NY-MBR-00008", "NY-MBR-00009", "NY-MBR-00011", "NY-MBR-00012", "NY-MBR-00013", "NY-MBR-00014", "NY-MBR-00015", "NY-MBR-00016", "NY-MBR-00017", "NY-MBR-00018", "NY-MBR-00019", "NY-MBR-00020", "NY-MBR-00021", "NY-MBR-00022"];

function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + n));
  const p = (x: number) => String(x).padStart(2, "0");
  return `${date.getUTCFullYear()}-${p(date.getUTCMonth() + 1)}-${p(date.getUTCDate())}`;
}

const FAMILY_FILE = /^(mzee-victor|esther-matriarch|joseph|peter|samuel|ruth|grace|elder-stick|brian|naomi|ethan|archive|album|hands-album)$/;

/** Real pixel size of each file on disk, as measured after download. */
/** Landscape files on disk. Gallery keys are written with their `g-` prefix. */
const LANDSCAPE_GALLERY = new Set(["r01", "r02", "r03", "r04", "r05", "r06", "r07", "r08", "r09", "s01", "s02", "s04", "s05", "s06"]);
const LANDSCAPE_FAMILY = new Set(["archive", "album", "hands-album"]);

/** A gallery file is stored as g-<key>.jpg; ids in specs may omit the `g-`. */
function galleryKey(file: string): string {
  return file.startsWith("g-") ? file.slice(2) : file;
}

function naturalSize(file: string): { w: number; h: number } {
  if (FAMILY_FILE.test(file)) return LANDSCAPE_FAMILY.has(file) ? { w: 1600, h: 900 } : { w: 800, h: 1000 };
  return LANDSCAPE_GALLERY.has(galleryKey(file)) ? { w: 1350, h: 900 } : { w: 900, h: 1200 };
}

export function photoUrl(file: string): string {
  if (FAMILY_FILE.test(file)) return `/images/family/${file}.jpg`;
  return `/images/gallery/g-${galleryKey(file)}.jpg`;
}

function buildPhotos(): GalleryPhoto[] {
  const out: GalleryPhoto[] = [];
  let n = 0;
  for (const album of ALBUMS) {
    const spec = SPECS[album.id] ?? [];
    const captions = CAPTIONS[album.id] ?? [];
    const meta = ALBUM_PLACE[album.id];
    const tags = ALBUM_TAGS[album.id] ?? [];
    const contributors = ALBUM_CONTRIBUTORS[album.id] ?? [];
    const eventId = EVENT_OF_ALBUM[album.id] ?? null;
    spec.forEach(([file, shape], i) => {
      n += 1;
      const id = `NY-IMG-${String(n).padStart(5, "0")}`;
      const rand = mulberry32(Math.floor(hashString(`${album.id}:${file}`) * 2147483647) + n);
      const choices = RATIOS[shape];
      const ratio = choices[Math.floor(rand() * choices.length)];
      const size = naturalSize(file);
      const tagged = tags.length === 0 ? [] : tags.filter(() => rand() < 0.4).slice(0, 3);
      out.push({
        id,
        file,
        w: size.w,
        h: size.h,
        ratio,
        caption: captions[i] ?? `Photograph ${i + 1} from ${album.name}`,
        albumId: album.id,
        takenOn: addDays(meta.base, between(rand, 0, meta.span)),
        year: addDays(meta.base, 0).slice(0, 4),
        contributorId: contributors.length ? contributors[Math.floor(rand() * contributors.length)] : "NY-MBR-00019",
        eventId,
        taggedIds: tagged,
        sourceId: ALBUM_SOURCE[album.id] ?? "SRC-DRIVE",
        seq: n,
        favourites: between(rand, 0, 24),
        bytes: between(rand, 180, 2400) * 1024,
      });
    });
  }
  return out;
}

export const PHOTOS_SEED: GalleryPhoto[] = buildPhotos();

/* ─── Trash: recoverable for 30 days ─────────────────────────────────── */

/* Three removed photos, named by the real photo they came from. Kept out of the live grid. */
const TRASH_META: Array<{ photoId: string; deletedOn: string; deletedBy: string; reason: string; daysLeft: number }> = [
  { photoId: "NY-IMG-00004", deletedOn: "2026-04-18", deletedBy: "NY-MBR-00019", reason: "Blurry beyond repair", daysLeft: 12 },
  { photoId: "NY-IMG-00007", deletedOn: "2026-04-21", deletedBy: "NY-MBR-00018", reason: "Duplicate of an earlier frame", daysLeft: 9 },
  { photoId: "NY-IMG-00034", deletedOn: "2026-04-24", deletedBy: "NY-MBR-00003", reason: "Wrong album; re-uploaded in Family portraits", daysLeft: 3 },
];

function buildTrash(): Array<{ photo: GalleryPhoto; entry: TrashEntry }> {
  const removed: Array<{ photo: GalleryPhoto; entry: TrashEntry }> = [];
  for (const [i, meta] of TRASH_META.entries()) {
    const original = PHOTOS_SEED.find((p) => p.id === meta.photoId);
    /* Skip quietly if a seed id is ever renamed, rather than crashing the page. */
    if (!original) continue;
    removed.push({
      photo: { ...original, id: `NY-IMG-9${String(10 + i).padStart(4, "0")}` },
      entry: { deletedAt: meta.deletedOn, deletedBy: meta.deletedBy, reason: meta.reason, daysLeft: meta.daysLeft },
    });
  }
  return removed;
}

export const TRASH_SEED: Array<{ photo: GalleryPhoto; entry: TrashEntry }> = buildTrash();

export const AUDIT_SEED: GalleryAudit[] = [
  { id: "NY-GA-2026-0412", at: "2026-05-06 08:52 EAT", actorId: "NY-MBR-00019", action: "tag", subject: "NY-IMG-00058", detail: "Tagged Mzee Victor in a family portrait" },
  { id: "NY-GA-2026-0411", at: "2026-05-06 08:31 EAT", actorId: "NY-MBR-00018", action: "upload", subject: "NY-IMG-00062", detail: "Uploaded 4 photos to Family portraits" },
  { id: "NY-GA-2026-0410", at: "2026-05-05 19:14 EAT", actorId: "NY-MBR-00019", action: "sync", subject: "SRC-DRIVE", detail: "Drive sync complete · 6 new photos" },
  { id: "NY-GA-2026-0409", at: "2026-05-05 16:02 EAT", actorId: "NY-MBR-00016", action: "tag", subject: "NY-IMG-00013", detail: "Tagged Caleb and Esther in the first dance" },
  { id: "NY-GA-2026-0408", at: "2026-05-04 11:40 EAT", actorId: "NY-MBR-00019", action: "delete", subject: "NY-IMG-9012", detail: "Moved a duplicate frame to trash" },
  { id: "NY-GA-2026-0407", at: "2026-05-03 20:05 EAT", actorId: "NY-MBR-00005", action: "upload", subject: "NY-IMG-00027", detail: "Contributor upload from WhatsApp" },
  { id: "NY-GA-2026-0406", at: "2026-05-02 09:27 EAT", actorId: "NY-MBR-00019", action: "cover", subject: "ALB-REUNION", detail: "Set a new album cover" },
  { id: "NY-GA-2026-0405", at: "2026-04-30 14:12 EAT", actorId: "NY-MBR-00019", action: "restore", subject: "NY-IMG-9007", detail: "Restored a photo from trash" },
  { id: "NY-GA-2026-0404", at: "2026-04-29 07:55 EAT", actorId: "NY-MBR-00003", action: "untag", subject: "NY-IMG-00066", detail: "Removed an incorrect face tag in the scanned archive" },
  { id: "NY-GA-2026-0403", at: "2026-04-27 18:33 EAT", actorId: "NY-MBR-00019", action: "move", subject: "NY-IMG-00044", detail: "Moved a photo to Choir & devotion" },
  { id: "NY-GA-2026-0402", at: "2026-04-25 10:08 EAT", actorId: "NY-MBR-00019", action: "connect", subject: "SRC-DRIVE", detail: "Connected the Google Drive folder" },
  { id: "NY-GA-2026-0401", at: "2026-04-24 13:46 EAT", actorId: "NY-MBR-00019", action: "rename", subject: "ALB-KITCHEN", detail: "Renamed album to “Kitchen & recipes”" },
];

/**
 * Seeded face positions for the portrait album, as % from the top-left.
 * These are hand-set for the twelve portraits where a face is clearly the subject.
 */
const PORTRAIT_FOCUS: Record<string, { x: number; y: number }> = {
  "NY-IMG-00058": { x: 50, y: 34 },
  "NY-IMG-00059": { x: 50, y: 32 },
  "NY-IMG-00060": { x: 50, y: 30 },
  "NY-IMG-00061": { x: 52, y: 31 },
  "NY-IMG-00062": { x: 50, y: 33 },
  "NY-IMG-00063": { x: 50, y: 30 },
  "NY-IMG-00064": { x: 50, y: 31 },
  "NY-IMG-00065": { x: 50, y: 32 },
  "NY-IMG-00066": { x: 48, y: 34 },
  "NY-IMG-00067": { x: 50, y: 30 },
  "NY-IMG-00068": { x: 50, y: 33 },
};

for (const photo of PHOTOS_SEED) {
  const focus = PORTRAIT_FOCUS[photo.id];
  if (focus) photo.focus = focus;
}

/* ─── Pure helpers ───────────────────────────────────────────────────── */

export function albumById(id: string): GalleryAlbum | undefined {
  return ALBUMS.find((a) => a.id === id);
}

export function memberById(id: string): Member | undefined {
  return MEMBERS.find((m) => m.id === id);
}

export function eventTitle(id: string | null): string | null {
  return id ? (EVENTS_SEED.find((e) => e.id === id)?.title ?? null) : null;
}

/** Filenames in a direct upload pick real files from this pool (round-robin). */
export const UPLOAD_POOL: string[] = ["r03", "c03", "w04", "s04", "k04", "d03", "f03"];

/** Living relatives who can be tagged in a photo (adults first, then wards). */
export const TAGGABLE_MEMBERS: string[] = TAG_POOL.filter((id) => {
  const m = MEMBERS.find((x) => x.id === id);
  return Boolean(m) && m?.deathYear === undefined;
});

/** Every relative who has contributed at least one photo, most photos first. */
export const CONTRIBUTOR_LIST: string[] = CONTRIBUTOR_IDS.filter((id) => PHOTOS_SEED.some((p) => p.contributorId === id)).sort(
  (a, b) => PHOTOS_SEED.filter((p) => p.contributorId === b).length - PHOTOS_SEED.filter((p) => p.contributorId === a).length,
);
