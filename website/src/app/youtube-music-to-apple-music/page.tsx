import type { Metadata } from "next";
import Link from "next/link";
import { CHROME_EXTENSION_URL, SUPPORT_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "YouTube Music to Apple Music Transfer (Free, Fast)",
  description:
    "Transfer songs from YouTube Music to Apple Music in seconds. Paste YouTube links or playlists and get direct Apple Music matches. Free and no signup.",
  keywords: [
    "youtube music to apple music",
    "transfer youtube music to apple music",
    "youtube playlist to apple music",
    "move from youtube music to apple music",
    "youtube to apple music converter",
  ],
  alternates: {
    canonical: "/youtube-music-to-apple-music",
  },
};

const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to transfer from YouTube Music to Apple Music",
  description:
    "Paste YouTube URLs or playlist links, get matched songs, and open them in Apple Music.",
  step: [
    {
      "@type": "HowToStep",
      name: "Copy your YouTube Music or YouTube link",
      text: "Copy a song URL or playlist URL from YouTube.",
    },
    {
      "@type": "HowToStep",
      name: "Paste into YT2Apple Music",
      text: "Use single search for one song or bulk converter for playlists.",
    },
    {
      "@type": "HowToStep",
      name: "Open in Apple Music",
      text: "Click Listen in Lossless to open the native Apple Music app.",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can I transfer YouTube Music playlists to Apple Music?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Paste a YouTube playlist URL on the bulk converter page and YT2Apple Music matches songs to Apple Music links.",
      },
    },
    {
      "@type": "Question",
      name: "Is this free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. YT2Apple Music is free with no signup required.",
      },
    },
    {
      "@type": "Question",
      name: "Does it open the Apple Music app or web player?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It is designed to open songs in the native Apple Music app so you can listen in lossless quality.",
      },
    },
  ],
};

export default function YouTubeMusicToAppleMusicPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header
        className="sticky top-0 z-10 backdrop-blur-md"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(15,17,23,0.8)",
        }}
      >
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #fb7185, #f43f5e)" }}
            >
              <span className="text-xs font-bold text-white">Y</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              YT2Apple Music
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
              style={{
                background: "rgba(255,213,79,0.1)",
                border: "1px solid rgba(255,213,79,0.2)",
                color: "#ffd54f",
              }}
            >
              ☕ Support
            </a>
            <a
              href={CHROME_EXTENSION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
              style={{
                background: "rgba(244,63,94,0.1)",
                border: "1px solid rgba(244,63,94,0.2)",
                color: "#fb7185",
              }}
            >
              Get Extension
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-20">
        <p
          className="text-[11px] uppercase tracking-[0.2em] mb-4 font-medium"
          style={{ color: "#fb7185" }}
        >
          Playlist transfer
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-5 leading-tight text-white">
          YouTube Music to Apple Music:{" "}
          <span className="gradient-text">Fast Transfer Guide</span>
        </h1>
        <p
          className="mb-6 leading-relaxed max-w-2xl"
          style={{ color: "rgba(241,245,249,0.6)" }}
        >
          Moving from YouTube Music to Apple Music? YT2Apple Music helps you
          match songs quickly, open them in Apple Music, and avoid manual
          searching one by one.
        </p>

        <div className="flex flex-wrap gap-3 mb-12">
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 px-5 py-3 text-sm"
          >
            Transfer single song
          </Link>
          <Link
            href="/bulk"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm rounded-xl border transition-colors"
            style={{
              borderColor: "rgba(255,255,255,0.15)",
              color: "rgba(241,245,249,0.85)",
            }}
          >
            Transfer playlist in bulk
          </Link>
        </div>

        <h2 className="text-xl font-bold mb-6 text-white">
          How to transfer from YouTube Music to Apple Music
        </h2>
        <div className="space-y-4 mb-14">
          {[
            {
              num: "1",
              title: "Copy a YouTube URL",
              desc: "Use a song URL for one match, or a playlist URL for bulk conversion.",
            },
            {
              num: "2",
              title: "Paste in YT2Apple Music",
              desc: "Single links go on the homepage, playlists go to the bulk converter.",
            },
            {
              num: "3",
              title: "Open in Apple Music",
              desc: "Click Listen in Lossless to open songs in Apple Music app.",
            },
          ].map((step) => (
            <div key={step.num} className="flex gap-4 card p-5">
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: "rgba(244,63,94,0.1)", color: "#fb7185" }}
              >
                {step.num}
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1 text-white">
                  {step.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "rgba(241,245,249,0.6)" }}
                >
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-5 text-white">Common questions</h2>
        <div className="space-y-3">
          {[
            {
              q: "Does this work with playlists?",
              a: "Yes. Paste your playlist URL in the bulk page and it will process each video.",
            },
            {
              q: "Do I need to sign in?",
              a: "No signup needed to use YT2Apple Music.",
            },
            {
              q: "Can I do this directly from YouTube?",
              a: "Yes. Use the URL prefix trick or install the Chrome extension for faster workflow.",
            },
          ].map((item) => (
            <div key={item.q} className="card p-4">
              <h3 className="text-sm font-semibold text-white mb-1">{item.q}</h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "rgba(241,245,249,0.6)" }}
              >
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
