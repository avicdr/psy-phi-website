export const BRAND = {
  name: "PSY PHI",
  symbol: "ΨØ",
  hindiName: "साई फाई",
  domain: "psyphi.art",
  storefrontUrl: "https://www.psyphi.art",
  email: "hellopsyphi@gmail.com",
  tagline: "Notice everything.",
  headline: "Clothes get read before you speak.",
  subheadline:
    "Indian streetwear that notices. Cropped for the body that wears it. Nothing fixed.",
  collectionTitle: "DROP THE CLASS",
  collectionSubtitle: "Four pieces. Four perspectives on class.",
  shippingNote: "Free shipping, always.",
  foundingNote:
    "Founding 100 pricing while it lasts. After that, the release price kicks in.",
} as const;

export const LED_TICKER_ITEMS = [
  "PSY PHI",
  "साइ फाई",
  "সাই ফাই",
  "ਸਾਈ ਫਾਈ",
  "સાઈ ફાઈ",
  "சை ஃபை",
  "సై ఫై",
  "സൈ ഫൈ",
  "ಸೈ ಫೈ",
  "ସାଇ ଫାଇ",
  "سائ فائی",
  "サイファイ",
  "사이파이",
  "赛菲",
  "ПСИ ФИ",
  "PSI FI",
  "ΨØ",
  "NOTICE EVERYTHING",
] as const;

export const MANIFESTO_SEQUENCE = [
  {
    symbol: "Ψ",
    term: "PSI.",
    definition: "MIND.",
    note: "What notices the room before a word is spoken.",
  },
  {
    symbol: "Ø",
    term: "PHI.",
    definition: "INQUIRY.",
    note: "The refusal to treat inherited hierarchy as natural.",
  },
  {
    symbol: "ΨØ",
    term: "TOGETHER.",
    definition: "PAY ATTENTION.",
    note: "Cropped for Indian proportions on purpose.",
  },
  {
    symbol: "00",
    term: "NOTHING IS FIXED.",
    definition: "DROP THE CLASS.",
    note: "Four garments. Four counter-arguments in cotton and thread.",
  },
] as const;

export const MANIFESTO_PARAGRAPHS = [
  "We didn't start PSY PHI to sell shirts.",
  "We started it because we couldn't stop noticing things — who gets graded, who gets skipped, who gets to walk away from the class they were assigned.",
  "Psi. Mind. Phi. Inquiry. Together: pay attention.",
  "Clothes get read before you speak. Cropped for Indian proportions on purpose. ΨØ — nothing is fixed.",
  "We're not fully out of the system either. We're just trying to build something honest inside it.",
] as const;

export interface ObservationNote {
  id: string;
  code: string;
  title: string;
  subject: string;
  body: string;
  pieceHandle?: string;
}

export const CURATED_OBSERVATIONS: ObservationNote[] = [
  {
    id: "obs-01",
    code: "FIELD NOTE 01",
    title: "Why we cut cropped for Indian proportions",
    subject: "PROPORTION & SILHOUETTE",
    body: "Standard Western boxy blocks drown shorter torsos and erase posture. Every Drop the Class silhouette is cropped intentionally at the waist to sit cleanly on Indian frames without excess pooling.",
    pieceHandle: "bambai-jersey",
  },
  {
    id: "obs-02",
    code: "FIELD NOTE 02",
    title: "Manual patchwork over fast screenprints",
    subject: "CONSTRUCTION DISCIPLINE",
    body: "On the Bambai Jersey, zero ink touches the chest. Every character of बंबई, the 40 postal marker, and the back inquiry is built from cut fabric and thread by Mumbai artisans.",
    pieceHandle: "bambai-jersey",
  },
  {
    id: "obs-03",
    code: "FIELD NOTE 03",
    title: "Guilloche currency lines around a circled F",
    subject: "VISUAL SEMIOTICS",
    body: "Skip Class borrows fine-line engraving patterns from discontinued ₹2000 currency notes to frame a portrait holding a lighter — questioning who assigns value and who gets graded out.",
    pieceHandle: "skip-class-cropped-unisex-ringer-tee",
  },
  {
    id: "obs-04",
    code: "FIELD NOTE 04",
    title: "The wine menu of inherited access",
    subject: "EDUCATIONAL TIERS",
    body: "Education Pipeline lays out Reserve Collection, Classic Selection, House Options, and Unlisted seats like a sommelier card — exposing how trajectory gets priced long before choice begins.",
    pieceHandle: "education-pipeline-cropped-fit-unisex-t-shirt",
  },
];

export interface WallFragment {
  id: string;
  code: string;
  prompt: string;
  attribution: string;
  xOffset: number;
  yOffset: number;
  rotation: number;
}

export const EXHIBITION_WALL_PROMPTS: WallFragment[] = [
  {
    id: "wall-01",
    code: "EXHIBIT NOTE A-01",
    prompt: "Do you believe in life after work?",
    attribution: "PSY PHI // PIECE 01 PROMPT",
    xOffset: -4,
    yOffset: 0,
    rotation: -1.4,
  },
  {
    id: "wall-02",
    code: "EXHIBIT NOTE A-02",
    prompt: "Who assigned the grade before you entered the room?",
    attribution: "PSY PHI // PIECE 02 PROMPT",
    xOffset: 6,
    yOffset: 12,
    rotation: 1.1,
  },
  {
    id: "wall-03",
    code: "EXHIBIT NOTE A-03",
    prompt: "System update pending. Has power shifted or only changed clothes?",
    attribution: "PSY PHI // PIECE 03 PROMPT",
    xOffset: -2,
    yOffset: 4,
    rotation: -0.8,
  },
  {
    id: "wall-04",
    code: "EXHIBIT NOTE A-04",
    prompt: "Prices subject to inflation. Access subject to inheritance.",
    attribution: "PSY PHI // PIECE 04 PROMPT",
    xOffset: 4,
    yOffset: -6,
    rotation: 1.3,
  },
];

export const NAV_ITEMS = [
  { id: "hero", label: "Home", index: "00", subtitle: "Exhibition Entrance" },
  {
    id: "drop-the-class",
    label: "Drop the Class",
    index: "01",
    subtitle: "Four Perspectives on Class",
  },
  {
    id: "fitting-room",
    label: "Fitting Room",
    index: "02",
    subtitle: "Virtual Showroom & Hotspots",
  },
  {
    id: "why-psy-phi",
    label: "Why PSY PHI",
    index: "03",
    subtitle: "Mind · Inquiry · Manifesto",
  },
  {
    id: "observations",
    label: "Observations",
    index: "04",
    subtitle: "Curatorial Field Notes",
  },
  {
    id: "the-board",
    label: "The Board",
    index: "05",
    subtitle: "Observation Wall & Moderation",
  },
] as const;
