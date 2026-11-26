import type { Metadata, Viewport } from "next";
import {
  IBM_Plex_Mono,
  Instrument_Serif,
  Noto_Sans_Devanagari,
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { LenisProvider } from "@/lib/lenis-provider";
import { GARMENTS } from "@/lib/garments";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-ibm-mono",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["500", "700", "800"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PSY PHI (ΨØ) — Drop the Class | Clothes Get Read Before You Speak",
  description:
    "Indian streetwear that notices. Cropped for the body that wears it. Explore Drop the Class in an interactive 3D exhibition and virtual fitting studio.",
  metadataBase: new URL("https://www.psyphi.art"),
  openGraph: {
    title: "PSY PHI (ΨØ) — Drop the Class",
    description:
      "Wearable social commentary. Four pieces, four perspectives on class. Cropped for Indian proportions on purpose.",
    type: "website",
    siteName: "PSY PHI",
    images: [
      {
        url: "/images/garments/bambai-front-close.jpg",
        width: 1200,
        height: 2133,
        alt: "PSY PHI Bambai Jersey — Drop the Class Exhibition",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PSY PHI (ΨØ) — Clothes Get Read Before You Speak",
    description:
      "Indian streetwear that notices. Explore Bambai Jersey, Skip Class, Inherited Postures, and Education Pipeline.",
  },
  keywords: [
    "PSY PHI",
    "Drop the Class",
    "Indian streetwear",
    "Bambai Jersey",
    "Skip Class Ringer Tee",
    "Inherited Postures",
    "Education Pipeline",
    "cropped streetwear India",
  ],
};

export const viewport: Viewport = {
  themeColor: "#060605",
  width: "device-width",
  initialScale: 1,
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Brand",
      name: "PSY PHI",
      alternateName: "ΨØ PSY PHI",
      url: "https://www.psyphi.art",
      slogan: "Clothes get read before you speak. Nothing is fixed.",
      email: "hellopsyphi@gmail.com",
    },
    {
      "@type": "ItemList",
      name: "Drop the Class — Collection 01",
      itemListElement: GARMENTS.map((garment, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Product",
          name: garment.title,
          description: garment.summary,
          brand: { "@type": "Brand", name: "PSY PHI" },
          url: garment.shopifyProductUrl,
          image: `https://www.psyphi.art${garment.colorways[0].frontImage}`,
          offers: {
            "@type": "Offer",
            priceCurrency: "INR",
            price: garment.foundingPrice,
            availability: "https://schema.org/InStock",
            url: garment.shopifyProductUrl,
          },
        },
      })),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plusJakarta.variable} ${instrumentSerif.variable} ${ibmPlexMono.variable} ${notoDevanagari.variable}`}
    >
      <body className="min-h-screen bg-[#060605] text-[#F4EFE4] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <LenisProvider>
          <CartProvider>{children}</CartProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
