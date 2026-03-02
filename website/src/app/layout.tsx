import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = getSiteUrl();
const SITE_NAME = "YT2Apple Music";
const SITE_DESCRIPTION =
  "Upgrade from compressed YouTube audio to Apple Music lossless quality. Paste a YouTube link or search any song — get instant Apple Music links with hi-res lossless and Dolby Atmos. Free, no signup.";

export const metadata: Metadata = {
  title: {
    default:
      "YT2Apple Music - YouTube to Apple Music Lossless | Audiophile Song Search",
    template: "%s | YT2Apple Music",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "YouTube to Apple Music",
    "YouTube to Apple Music lossless",
    "convert YouTube link to Apple Music",
    "Apple Music lossless audio",
    "YouTube audio quality vs Apple Music",
    "audiophile music streaming",
    "Apple Music hi-res lossless",
    "YouTube Apple Music converter",
    "Apple Music spatial audio",
    "Dolby Atmos music",
    "lossless music streaming",
    "find song on Apple Music from YouTube",
    "YouTube music to Apple Music link",
    "Apple Music song finder",
    "best audio quality streaming",
    "Apple Music 24-bit 192kHz",
    "upgrade YouTube audio quality",
    "free music link converter",
  ],
  authors: [{ name: "YT2Apple Music" }],
  creator: "YT2Apple Music",
  publisher: "YT2Apple Music",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "YT2Apple Music - Discover on YouTube, Listen in Lossless",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YT2Apple Music - Convert YouTube to Apple Music",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YT2Apple Music - YouTube to Apple Music Lossless",
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these once you have them:
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: "MusicApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Upgrade YouTube compressed audio to Apple Music lossless",
      "Search songs across Apple Music and YouTube",
      "Open songs directly in Apple Music app with hi-res lossless",
      "Dolby Atmos Spatial Audio support",
      "Free with no signup required",
      "Community-powered song database for instant matching",
      "30-second song previews",
      "Chrome extension for auto-detection on YouTube",
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why does YouTube audio sound worse than Apple Music?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "YouTube compresses all audio to approximately 128kbps AAC because it prioritizes video bandwidth. Apple Music offers lossless ALAC at up to 24-bit/192kHz — the same quality as the studio master. The difference is especially noticeable on good headphones or speakers.",
        },
      },
      {
        "@type": "Question",
        name: "How do I convert a YouTube link to Apple Music?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Paste any YouTube video URL into the search bar on YT2Apple Music. The tool identifies the song and provides a direct Apple Music link that opens in the native app with lossless audio support.",
        },
      },
      {
        "@type": "Question",
        name: "Is YT2Apple Music free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free with no signup required. No daily limits or premium plans. Unlimited searches, forever free.",
        },
      },
      {
        "@type": "Question",
        name: "Does Apple Music really support lossless audio?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Apple Music supports Lossless (ALAC up to 24-bit/48kHz), Hi-Res Lossless (up to 24-bit/192kHz), and Dolby Atmos Spatial Audio. YT2Apple Music opens songs in the native app where all these formats are available.",
        },
      },
      {
        "@type": "Question",
        name: "How is this different from Song.link or Odesli?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Song.link creates universal links but doesn't let you search by song name, doesn't open the native Apple Music app (so no lossless), and isn't designed for audiophiles. YT2Apple Music is purpose-built for upgrading from compressed YouTube audio to lossless Apple Music quality.",
        },
      },
    ],
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
