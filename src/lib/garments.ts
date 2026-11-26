export type GarmentSize = "S" | "M" | "L" | "XL";

export type GarmentAssetMode = "studio-layer" | "gltf-model";

export type GarmentSide = "front" | "back";

export interface GarmentHotspot {
  id: string;
  side: GarmentSide;
  x: number; // Percentage 0-100 across archival photo inspector
  y: number;
  position3D: [number, number, number]; // Object-space coordinates on .glb garment mesh
  normal3D: [number, number, number]; // Outward normal for 3D camera-facing fade
  code: string;
  title: string;
  category: "Patchwork" | "Typography" | "Artwork" | "Construction" | "Fabric";
  commentary: string;
}

export interface GarmentColorway {
  id: string;
  name: string;
  swatchHex: string;
  frontImage: string;
  backImage: string;
  detailImage: string;
  ambientImage?: string;
  textureMap: string;
  normalMap: string;
  patchAtlasMap?: string;
  roughnessFactor?: number;
}

export interface GarmentVariantMap {
  [colorwayAndSizeKey: string]: number; // Real Shopify Variant ID
}

export interface Garment {
  id: number;
  number: string;
  slug: string;
  handle: string;
  title: string;
  shortTitle: string;
  garmentType: string;
  chapterTitle: string;
  chapterMood: string;
  accentHex: string;
  accentName: string;
  foundingPrice: number;
  releasePrice: number;
  fabricSpec: string;
  constructionSpec: string;
  fitSpec: string;
  summary: string;
  storyParagraphs: string[];
  sizes: GarmentSize[];
  colorways: GarmentColorway[];
  variants: GarmentVariantMap;
  hotspots: GarmentHotspot[];
  assetMode: GarmentAssetMode;
  modelUrl: string;
  mannequinUrl: string;
  supports360: boolean;
  shopifyProductUrl: string;
}

export const MANNEQUIN_MODEL_URL = "/models/mannequin-bust.glb";

export const GARMENTS: Garment[] = [
  {
    id: 11155846135844,
    number: "01",
    slug: "bambai-jersey",
    handle: "bambai-jersey",
    title: "Bambai Jersey",
    shortTitle: "Bambai",
    garmentType: "Cropped Baseball Jersey",
    chapterTitle: "BAMBAI JERSEY",
    chapterMood: "Industrial & athletic documentary",
    accentHex: "#B23A2E",
    accentName: "Mumbai Insignia Oxblood",
    foundingPrice: 3499,
    releasePrice: 7999,
    fabricSpec:
      "Black foma cotton body with breathable high-grade mesh side & sleeve panels",
    constructionSpec:
      "Zero prints — 100% manual artisan cut-and-sew patchwork and satin embroidery",
    fitSpec: "Unisex cropped baseball block calibrated for Indian torso proportions",
    summary:
      "Cropped baseball jersey in black foma cotton, mesh sides. Hours of manual patchwork only, no prints. Arms carry 40 and the PSY PHI mark. Back asks: do you believe in life after work?",
    storyParagraphs: [
      "A cropped baseball jersey that stands apart from anything you'd see in this space. The very first garment designed for PSY PHI to come to life.",
      "Walking through the streets of Mumbai, you begin to notice the hidden layers and structures that quietly support the functioning of this humongous city of dreams. Handmade in black foma cotton with high-quality mesh side panels that allow breathability, movement, and space to exist freely.",
      "There isn't a single print on the fabric. Every detail you see has been brought to life by artisans through manual patchwork and embroidery. The story begins with the 'Access Pass to Reality Check.' Each arm holds symbolic patchwork: '40' representing the first two digits of Mumbai's zip code, and the PSY PHI insignia, marking a station in a city that never waits.",
      "Flip the jersey over and you're met with a question: 'Do you believe in life after work?' We use 'Bambai' to reclaim the city's colonial name—not out of gratitude, but as remembrance.",
    ],
    sizes: ["S", "M", "L", "XL"],
    colorways: [
      {
        id: "black-white",
        name: "Black / Bone Mesh",
        swatchHex: "#181715",
        frontImage: "/images/garments/bambai-front-close.jpg",
        backImage: "/images/garments/bambai-back.jpg",
        detailImage: "/images/garments/bambai-front-street.jpg",
        ambientImage: "/images/garments/bambai-front-street.jpg",
        textureMap: "/textures/garments/bambai-jersey.png",
        normalMap: "/textures/garments/normal-cotton.png",
        roughnessFactor: 0.86,
      },
    ],
    variants: {
      "black-white:S": 51294743068708,
      "black-white:M": 51294743101476,
      "black-white:L": 51294743134244,
      "black-white:XL": 51294743167012,
    },
    hotspots: [
      {
        id: "bambai-chest",
        side: "front",
        x: 47,
        y: 70,
        position3D: [0.0, 0.08, 0.165],
        normal3D: [0, 0, 1],
        code: "01-A",
        title: "बंबई Hand-Cut Patchwork",
        category: "Patchwork",
        commentary:
          "Reclaiming 'Bambai' not out of nostalgia, but remembrance. Built from layered twill and dense satin stitching with zero screenprint ink.",
      },
      {
        id: "bambai-sleeve-40",
        side: "front",
        x: 19,
        y: 59,
        position3D: [0.305, 0.165, 0.035],
        normal3D: [0.85, 0.35, 0.35],
        code: "01-B",
        title: "Postal Prefix '40' & Mesh Panels",
        category: "Construction",
        commentary:
          "First two digits of Mumbai's postal code stitched onto breathable mesh contrast sleeves — marking a station in a city that never slows.",
      },
      {
        id: "bambai-hem-tag",
        side: "front",
        x: 79,
        y: 79,
        position3D: [0.138, -0.155, 0.148],
        normal3D: [0.35, 0, 0.92],
        code: "01-C",
        title: "Access Pass Woven Label",
        category: "Construction",
        commentary:
          "Exterior hem specimen tag indexing 'Access Pass to Reality Check' on heavy foma cotton.",
      },
      {
        id: "bambai-back-inquiry",
        side: "back",
        x: 50,
        y: 44,
        position3D: [0.0, 0.10, -0.158],
        normal3D: [0, 0, -1],
        code: "01-D",
        title: "DO YOU BELIEVE IN LIFE AFTER WORK?",
        category: "Typography",
        commentary:
          "Full-back stitched manifesto beneath PSYPHI ΨØ — confronting millions of daily commutes spent living on someone else's clock.",
      },
    ],
    assetMode: "gltf-model",
    modelUrl: "/models/bambai-jersey.glb",
    mannequinUrl: MANNEQUIN_MODEL_URL,
    supports360: true,
    shopifyProductUrl: "https://www.psyphi.art/products/bambai-jersey",
  },
  {
    id: 11155862028324,
    number: "02",
    slug: "skip-class",
    handle: "skip-class-cropped-unisex-ringer-tee",
    title: "Skip Class Cropped Unisex Ringer Tee",
    shortTitle: "Skip Class",
    garmentType: "Cropped Unisex Ringer Tee",
    chapterTitle: "SKIP CLASS",
    chapterMood: "Rebellious wall-signage defiance",
    accentHex: "#6B5382",
    accentName: "Defiant Bruise Plum",
    foundingPrice: 2299,
    releasePrice: 4999,
    fabricSpec:
      "Structured heavyweight combed cotton with contrast bone ringer collar & cuffs",
    constructionSpec:
      "Devanagari wall-signage crest front, high-detail monochrome etched back graphic & custom woven neck tape",
    fitSpec: "Cropped unisex ringer block with reinforced rib trim",
    summary:
      "Hand-painted PSY PHI in Hindi like local wall signage. Back: a portrait, a lighter, a circled F. She chooses to skip the class she was assigned.",
    storyParagraphs: [
      "A ringer tee that looks simple at first—PSY PHI hand-painted in Hindi across the front, echoing the maximalist street art of Indian walls. But flip it over.",
      "The back tells a story. 'Skip Class' in Devanagari sits above a portrait of a woman who refused to accept the life society assigned her. Born into a red light area, told her destiny was written. She holds a lighter. A circled 'F'—the grade society gave her, the class she was supposed to belong to. In that moment, she chooses differently.",
      "The etched lines framing her mirror the patterns on ₹2000 notes—symbols of wealth, identity, and self-determination reclaimed.",
    ],
    sizes: ["S", "M", "L", "XL"],
    colorways: [
      {
        id: "black",
        name: "Black",
        swatchHex: "#151412",
        frontImage: "/images/garments/skipclass-black-front-hanger.jpg",
        backImage: "/images/garments/skipclass-black-back.jpg",
        detailImage: "/images/garments/skipclass-black-front-model.jpg",
        ambientImage: "/images/garments/skipclass-black-profile.jpg",
        textureMap: "/textures/garments/skip-class-black.png",
        normalMap: "/textures/garments/normal-cotton.png",
        roughnessFactor: 0.88,
      },
      {
        id: "purple",
        name: "Purple",
        swatchHex: "#6B5382",
        frontImage: "/images/garments/skipclass-purple-front.jpg",
        backImage: "/images/garments/skipclass-purple-back-blue.jpg",
        detailImage: "/images/garments/skipclass-purple-detail.jpg",
        ambientImage: "/images/garments/skipclass-purple-back.jpg",
        textureMap: "/textures/garments/skip-class-purple.png",
        normalMap: "/textures/garments/normal-cotton.png",
        roughnessFactor: 0.86,
      },
    ],
    variants: {
      "black:S": 51294771576868,
      "purple:S": 51294771609636,
      "black:M": 51294771642404,
      "purple:M": 51294771675172,
      "black:L": 51294771707940,
      "purple:L": 51294771740708,
      "black:XL": 51294771773476,
      "purple:XL": 51294771806244,
    },
    hotspots: [
      {
        id: "skip-hindi-crest",
        side: "front",
        x: 62,
        y: 35,
        position3D: [0.092, 0.230, 0.145],
        normal3D: [0.28, 0, 0.95],
        code: "02-A",
        title: "साई फाई Street-Signage Crest",
        category: "Typography",
        commentary:
          "Hand-painted Devanagari wordmark echoing Indian local storefront and wall signage inside a crisp oval badge.",
      },
      {
        id: "skip-neck-tape",
        side: "front",
        x: 49,
        y: 18,
        position3D: [0.0, 0.365, 0.082],
        normal3D: [0, 0.45, 0.88],
        code: "02-B",
        title: "Interior Collar Contrast & Binding",
        category: "Construction",
        commentary:
          "Bone-white ringer rib collar and interior neck tape reading 'NOTHING CHANGES IF NOTHING CHANGES.'",
      },
      {
        id: "skip-devanagari-header",
        side: "back",
        x: 49,
        y: 31,
        position3D: [0.0, 0.215, -0.145],
        normal3D: [0, 0, -1],
        code: "02-C",
        title: "स्किप क्लास Headline Banner",
        category: "Typography",
        commentary:
          "Bold Devanagari transliteration of 'Skip Class' bridging street vernacular with critique of assigned social tiers.",
      },
      {
        id: "skip-currency-portrait",
        side: "back",
        x: 49,
        y: 53,
        position3D: [0.0, 0.03, -0.155],
        normal3D: [0, 0, -1],
        code: "02-D",
        title: "Lighter, Circled 'F' & ₹2000 Note Etching",
        category: "Artwork",
        commentary:
          "Guilloche filigree borrowed from ₹2000 banknotes frames a portrait rejecting her assigned destiny and burning the grade.",
      },
    ],
    assetMode: "gltf-model",
    modelUrl: "/models/skip-class.glb",
    mannequinUrl: MANNEQUIN_MODEL_URL,
    supports360: true,
    shopifyProductUrl:
      "https://www.psyphi.art/products/skip-class-cropped-unisex-ringer-tee",
  },
  {
    id: 11155870777380,
    number: "03",
    slug: "inherited-postures",
    handle: "inherited-postures-unisex-cropped-fit-patchwork-shirt",
    title: "Inherited Postures UNISEX Cropped-Fit Patchwork Shirt",
    shortTitle: "Inherited Postures",
    garmentType: "Cropped-Fit Patchwork Shirt",
    chapterTitle: "INHERITED POSTURES",
    chapterMood: "Restrained pinstripe grid vs raw historical critique",
    accentHex: "#D4CBB8",
    accentName: "Archival Stripe Bone",
    foundingPrice: 2299,
    releasePrice: 4999,
    fabricSpec:
      "Woven fine vertical pinstripe shirting with raw-edge heavy canvas back patches",
    constructionSpec:
      "Camp-collar half-sleeve button-up with hand-stitched PSY PHI chest tab and multi-panel back archive collage",
    fitSpec: "Boxy cropped half-sleeve shirting silhouette",
    summary:
      "Quiet striped front. On the back: king and subjects, a shoe being polished, a hand outstretched, and one word—progress? System update pending.",
    storyParagraphs: [
      "A striped, half-sleeve button-up that feels understated from the front, with a single PSY PHI logo patch-worked (by hand) on the chest. But the back carries the weight of the piece.",
      "It begins with an image of an antiquated king, surrounded by subjects and slaves bowing before him—the larger man, the wealthier man, the one in power. Below it, another moment: a man bent over, polishing a shoe.",
      "To the side, a more recent scene—a homeless man standing outside a car, head lowered, hand outstretched, palm open. Beneath it, a single word in a raw punk font: 'progress?' Between these images sits a central patch reading: 'system update pending.'",
      "The piece questions whether anything has truly changed, or if power has simply shifted forms.",
    ],
    sizes: ["S", "M", "L", "XL"],
    colorways: [
      {
        id: "beige",
        name: "Beige",
        swatchHex: "#B5A895",
        frontImage: "/images/garments/postures-beige-front.jpg",
        backImage: "/images/garments/postures-beige-back-close.jpg",
        detailImage: "/images/garments/postures-patches-flat.jpg",
        ambientImage: "/images/garments/postures-beige-back-full.jpg",
        textureMap: "/textures/garments/postures-beige.png",
        normalMap: "/textures/garments/normal-pinstripe.png",
        patchAtlasMap: "/textures/garments/postures-patches-atlas.png",
        roughnessFactor: 0.78,
      },
      {
        id: "black",
        name: "Black",
        swatchHex: "#242423",
        frontImage: "/images/garments/postures-black-front-chest.jpg",
        backImage: "/images/garments/postures-black-back.jpg",
        detailImage: "/images/garments/postures-black-detail.jpg",
        ambientImage: "/images/garments/postures-patches-flat.jpg",
        textureMap: "/textures/garments/postures-black.png",
        normalMap: "/textures/garments/normal-pinstripe.png",
        patchAtlasMap: "/textures/garments/postures-patches-atlas.png",
        roughnessFactor: 0.80,
      },
    ],
    variants: {
      "black:XL": 51296010993700,
      "black:L": 51296011026468,
      "black:M": 51296011059236,
      "black:S": 51296011092004,
      "beige:XL": 51296011124772,
      "beige:L": 51296011157540,
      "beige:M": 51296011190308,
      "beige:S": 51296011223076,
    },
    hotspots: [
      {
        id: "postures-chest-tab",
        side: "front",
        x: 59,
        y: 34,
        position3D: [0.105, 0.155, 0.155],
        normal3D: [0.28, 0, 0.95],
        code: "03-A",
        title: "Hand-Patchworked PSY PHI Tab",
        category: "Patchwork",
        commentary:
          "Deliberately quiet front posture—uniform vertical pinstripes interrupted only by a raw sewn chest badge.",
      },
      {
        id: "postures-king-woodcut",
        side: "back",
        x: 50,
        y: 44,
        position3D: [0.0, 0.165, -0.158],
        normal3D: [0, 0, -1],
        code: "03-B",
        title: "Antiquated King & Bowing Subjects",
        category: "Artwork",
        commentary:
          "Historical woodcut panel depicting bowed subjects before an oversized monarch—establishing centuries of bodily submission.",
      },
      {
        id: "postures-system-update",
        side: "back",
        x: 51,
        y: 78,
        position3D: [-0.025, -0.065, -0.165],
        normal3D: [0, 0, -1],
        code: "03-C",
        title: "SYSTEM UPDATE PENDING.",
        category: "Typography",
        commentary:
          "Raw frayed canvas patch bridging shoe-polishing labor and contemporary street poverty under the interrogation 'progress?'.",
      },
    ],
    assetMode: "gltf-model",
    modelUrl: "/models/inherited-postures.glb",
    mannequinUrl: MANNEQUIN_MODEL_URL,
    supports360: true,
    shopifyProductUrl:
      "https://www.psyphi.art/products/inherited-postures-unisex-cropped-fit-patchwork-shirt",
  },
  {
    id: 11155939459108,
    number: "04",
    slug: "education-pipeline",
    handle: "education-pipeline-cropped-fit-unisex-t-shirt",
    title: "Education Pipeline Cropped-fit Unisex T-SHIRT",
    shortTitle: "Education Pipeline",
    garmentType: "Cropped-Fit Unisex T-Shirt",
    chapterTitle: "EDUCATION PIPELINE",
    chapterMood: "Chiaroscuro threshold & institutional menu satire",
    accentHex: "#C48E78",
    accentName: "Pipeline Dusty Peach & Blue",
    foundingPrice: 1399,
    releasePrice: 2999,
    fabricSpec:
      "Soft-cool cotton-lycra knit with matte high-density screenprint & woven hem tag",
    constructionSpec:
      "High-definition doorway light print front; full typographic tier menu across back panel",
    fitSpec: "Relaxed cropped unisex tee with dropped shoulder",
    summary:
      "Front: a door with light. EDUCATION IS YOUR EXIT. Back reads like a wine menu of access tiers. Prices subject to inflation. Access subject to inheritance.",
    storyParagraphs: [
      "A cotton-lycra blend that feels soft and cool on the skin, yet carries a sharp, almost abrasive narrative on the outside.",
      "On the front, a slightly open door lets light spill through. Beside it, in HD screenprint: 'EDUCATION IS YOUR EXIT'. Turn it around, and the story expands.",
      "The back is designed like a wine menu: 'The Education Pipeline — Curated since Inheritance — Est. Access Dependent'. Divided into Reserve Collection, Classic Selection, House Options, and Unlisted—each representing different tiers of educational access available to Indian students.",
      "At the bottom, two final lines: Prices Subject to Inflation. Access Subject to Inheritance.",
    ],
    sizes: ["S", "M", "L", "XL"],
    colorways: [
      {
        id: "dusty-peach",
        name: "Dusty Peach",
        swatchHex: "#B57E69",
        frontImage: "/images/garments/pipeline-peach-front.png",
        backImage: "/images/garments/pipeline-peach-back.jpg",
        detailImage: "/images/garments/pipeline-peach-ambient.jpg",
        ambientImage: "/images/garments/pipeline-peach-ambient.jpg",
        textureMap: "/textures/garments/pipeline-dusty-peach.png",
        normalMap: "/textures/garments/normal-cotton.png",
        roughnessFactor: 0.72,
      },
      {
        id: "dusty-blue",
        name: "Dusty Blue",
        swatchHex: "#6E7F8D",
        frontImage: "/images/garments/pipeline-peach-front.png",
        backImage: "/images/garments/pipeline-blue-back.jpg",
        detailImage: "/images/garments/pipeline-blue-back.jpg",
        ambientImage: "/images/garments/pipeline-blue-back.jpg",
        textureMap: "/textures/garments/pipeline-dusty-blue.png",
        normalMap: "/textures/garments/normal-cotton.png",
        roughnessFactor: 0.72,
      },
    ],
    variants: {
      "dusty-blue:S": 51295398625316,
      "dusty-blue:M": 51295398658084,
      "dusty-blue:L": 51295398690852,
      "dusty-blue:XL": 51295398723620,
      "dusty-peach:S": 51295398756388,
      "dusty-peach:M": 51295398789156,
      "dusty-peach:L": 51295398821924,
      "dusty-peach:XL": 51295398854692,
    },
    hotspots: [
      {
        id: "pipeline-door-exit",
        side: "front",
        x: 61,
        y: 54,
        position3D: [0.095, 0.135, 0.156],
        normal3D: [0.28, 0, 0.95],
        code: "04-A",
        title: "Open Doorway & EDUCATION IS YOUR EXIT",
        category: "Artwork",
        commentary:
          "Chiaroscuro HD screenprint of a cracked threshold spilling light—the seductive myth sold to every Indian student.",
      },
      {
        id: "pipeline-wine-menu",
        side: "back",
        x: 50,
        y: 52,
        position3D: [0.0, 0.11, -0.156],
        normal3D: [0, 0, -1],
        code: "04-B",
        title: "Curated Since Inheritance Menu",
        category: "Typography",
        commentary:
          "Reserve Collection, Classic Selection, House Options, Unlisted — satirizing educational access as an exclusive sommelier cellar.",
      },
      {
        id: "pipeline-hem-footnote",
        side: "back",
        x: 49,
        y: 74,
        position3D: [0.215, -0.11, -0.055],
        normal3D: [0.8, 0, -0.58],
        code: "04-C",
        title: "Access Subject to Inheritance",
        category: "Typography",
        commentary:
          "Fine-print institutional disclaimer paired with the lower-left PSY PHI woven side-seam label.",
      },
    ],
    assetMode: "gltf-model",
    modelUrl: "/models/education-pipeline.glb",
    mannequinUrl: MANNEQUIN_MODEL_URL,
    supports360: true,
    shopifyProductUrl:
      "https://www.psyphi.art/products/education-pipeline-cropped-fit-unisex-t-shirt",
  },
];

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function getVariantId(
  garment: Garment,
  colorwayId: string,
  size: GarmentSize
): number | null {
  const key = `${colorwayId}:${size}`;
  return garment.variants[key] ?? null;
}

export function getShopifyCheckoutUrl(
  items: { variantId: number; quantity: number }[]
): string {
  if (!items.length) return "https://www.psyphi.art/cart";
  const pairs = items.map((item) => `${item.variantId}:${item.quantity}`);
  return `https://www.psyphi.art/cart/${pairs.join(",")}`;
}
