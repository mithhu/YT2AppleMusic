import type { Metadata } from "next";
import Link from "next/link";
import { SUPPORT_URL } from "@/lib/site";

export const metadata: Metadata = {
  title:
    "YouTube to Apple Music - Upgrade to Lossless Audio | Free Converter",
  description:
    "YouTube compresses audio to ~128kbps. Apple Music offers 24-bit/192kHz lossless. Convert any YouTube link to Apple Music and hear the difference. Free, instant, no signup.",
  keywords: [
    "YouTube to Apple Music lossless",
    "YouTube audio quality",
    "Apple Music lossless vs YouTube",
    "convert YouTube to Apple Music",
    "audiophile streaming",
    "YouTube 128kbps vs Apple Music lossless",
    "hi-res audio streaming",
    "Apple Music Dolby Atmos",
    "upgrade YouTube audio",
  ],
  alternates: {
    canonical: "/youtube-to-apple-music",
  },
};

export default function YouTubeToAppleMusicPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur-md" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(15,17,23,0.8)" }}>
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fb7185, #f43f5e)" }}>
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
              style={{ background: "rgba(255,213,79,0.1)", border: "1px solid rgba(255,213,79,0.2)", color: "#ffd54f" }}
            >
              ☕ Support
            </a>
            <a
              href="https://github.com/mithhu/YT2AppleMusic/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
              style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", color: "#fb7185" }}
            >
              Get Extension
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-20">
        <p className="text-[11px] uppercase tracking-[0.2em] mb-4 font-medium" style={{ color: "#fb7185" }}>
          For audiophiles
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-5 leading-tight text-white">
          YouTube to Apple Music:{" "}
          <span className="gradient-text">Upgrade to Lossless Audio</span>
        </h1>
        <p className="mb-6 leading-relaxed max-w-2xl" style={{ color: "rgba(241,245,249,0.6)" }}>
          You found a great song on YouTube. But YouTube compresses audio to
          ~128kbps AAC — fine for casual listening, terrible for anyone who
          cares about sound quality. Apple Music streams the same songs in
          lossless ALAC at up to 24-bit/192kHz, plus Dolby Atmos Spatial Audio.
        </p>
        <p className="mb-10 leading-relaxed max-w-2xl" style={{ color: "rgba(241,245,249,0.6)" }}>
          YT2Apple Music bridges the gap. Paste a YouTube link, find the song
          on Apple Music, and hear it the way it was mastered — in seconds.
        </p>

        <Link
          href="/"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3.5 text-sm mb-20"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
          Try it now — paste a YouTube link
        </Link>

        {/* The quality problem */}
        <h2 className="text-xl font-bold mb-4 text-white">
          The Audio Quality Problem with YouTube
        </h2>
        <p className="text-sm mb-8 leading-relaxed" style={{ color: "rgba(241,245,249,0.6)" }}>
          YouTube was built for video, not audio fidelity. Even on
          &ldquo;premium&rdquo; quality settings, YouTube&apos;s audio tops out at
          approximately 128kbps AAC on desktop (and often lower on mobile).
          That&apos;s less than half the bitrate of a standard CD, and a
          fraction of what modern lossless streaming offers.
        </p>

        {/* Detailed comparison */}
        <div className="card overflow-hidden mb-16">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <th className="py-3.5 px-5 text-left font-medium" style={{ color: "rgba(241,245,249,0.6)" }}>Spec</th>
                <th className="py-3.5 px-5 text-left font-medium" style={{ color: "#fdba74" }}>YouTube</th>
                <th className="py-3.5 px-5 text-left font-medium" style={{ color: "#6ee7b7" }}>Apple Music</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Format", "AAC (lossy)", "AAC 256kbps + ALAC Lossless"],
                ["Max bitrate", "~128kbps", "Up to ~9,216kbps (lossless)"],
                ["Bit depth", "16-bit", "Up to 24-bit"],
                ["Sample rate", "44.1kHz", "Up to 192kHz"],
                ["Spatial Audio", "No", "Dolby Atmos"],
                ["Dynamic range", "Compressed", "Full studio master range"],
                ["Best for", "Discovering new music", "Actually listening to it"],
              ].map(([spec, yt, am], i, arr) => (
                <tr key={spec} style={i < arr.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.08)" } : {}}>
                  <td className="py-3 px-5" style={{ color: "rgba(241,245,249,0.6)" }}>{spec}</td>
                  <td className="py-3 px-5" style={{ color: "rgba(241,245,249,0.5)" }}>{yt}</td>
                  <td className="py-3 px-5" style={{ color: "rgba(52,211,153,0.8)" }}>{am}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* How it works */}
        <h2 className="text-xl font-bold mb-8 text-white">
          How to Convert YouTube to Apple Music
        </h2>
        <div className="space-y-4 mb-16">
          {[
            { num: "1", title: "Copy a YouTube URL", desc: "Find any music video, lyric video, or official audio on YouTube. Copy the URL — we support all standard YouTube link formats including youtu.be short links." },
            { num: "2", title: "Paste and Search", desc: "Paste the URL into YT2Apple Music. We check our community database of verified matches first (instant), then fall back to iTunes API search. Results include album art and 30-second previews." },
            { num: "3", title: "Listen in Lossless", desc: 'Click "Listen in Lossless" to open the song directly in the Apple Music app. Not the web player — the native app, where you get full hi-res lossless and Dolby Atmos Spatial Audio.' },
          ].map((step) => (
            <div key={step.num} className="flex gap-4 card p-5">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: "rgba(244,63,94,0.1)", color: "#fb7185" }}>
                {step.num}
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1 text-white">{step.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(241,245,249,0.6)" }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* What audiophiles hear */}
        <h2 className="text-xl font-bold mb-6 text-white">
          What You&apos;re Missing on YouTube
        </h2>
        <div className="space-y-3 mb-16">
          {[
            { title: "Instrument separation", desc: "Lossless audio preserves subtle details that get smeared together in lossy compression. Individual instruments are more distinct." },
            { title: "Dynamic range", desc: "YouTube heavily compresses dynamics. Quiet passages and crescendos lose their impact. Lossless preserves the full dynamic range of the studio master." },
            { title: "High-frequency detail", desc: "Lossy codecs cut frequencies above ~16kHz. If you're under 40 and have decent headphones, you can hear the difference." },
            { title: "Spatial Audio", desc: "Dolby Atmos creates an immersive 3D soundstage. YouTube simply doesn't offer this." },
          ].map((item) => (
            <div key={item.title} className="flex gap-3.5 p-4 rounded-xl">
              <span style={{ color: "#fb7185" }} className="mt-0.5 flex-shrink-0">&#x2022;</span>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(241,245,249,0.6)" }}>
                <strong className="text-white font-medium">{item.title}</strong>{" "}
                — {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Competitor comparison */}
        <h2 className="text-xl font-bold mb-6 text-white">
          YT2Apple Music vs Other Converters
        </h2>
        <div className="card overflow-hidden mb-16">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <th className="py-3.5 px-5 text-left font-medium" style={{ color: "rgba(241,245,249,0.6)" }}>Feature</th>
                <th className="py-3.5 px-5 text-left font-medium" style={{ color: "#6ee7b7" }}>YT2Apple Music</th>
                <th className="py-3.5 px-5 text-left font-medium" style={{ color: "rgba(241,245,249,0.6)" }}>Song.link</th>
                <th className="py-3.5 px-5 text-left font-medium" style={{ color: "rgba(241,245,249,0.6)" }}>Others</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Opens native app (lossless)", true, "web only", false],
                ["Search by song name", true, false, false],
                ["Free & unlimited", true, true, "limited"],
                ["30s preview", true, false, false],
                ["Community-verified matches", true, false, false],
                ["Chrome extension", true, true, "some"],
              ].map(([feature, yt2, songlink, others], i, arr) => (
                <tr key={i} style={i < arr.length - 1 ? { borderBottom: "1px solid rgba(255,255,255,0.08)" } : {}}>
                  <td className="py-3 px-5" style={{ color: "rgba(241,245,249,0.6)" }}>{feature as string}</td>
                  <td className="py-3 px-5">
                    {yt2 === true
                      ? <span style={{ color: "#34d399" }}>&#10003;</span>
                      : <span style={{ color: "rgba(251,146,60,0.6)" }}>&#10007;</span>}
                  </td>
                  <td className="py-3 px-5">
                    {songlink === true
                      ? <span style={{ color: "#34d399" }}>&#10003;</span>
                      : <span style={{ color: "rgba(251,146,60,0.6)" }}>&#10007; {typeof songlink === "string" ? `(${songlink})` : ""}</span>}
                  </td>
                  <td className="py-3 px-5">
                    {others === true
                      ? <span style={{ color: "#34d399" }}>&#10003;</span>
                      : others === false
                        ? <span style={{ color: "rgba(251,146,60,0.6)" }}>&#10007;</span>
                        : <span style={{ color: "rgba(251,191,36,0.6)" }} className="capitalize">{others as string}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="text-center py-12 card" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.04), transparent)" }}>
          <h2 className="text-lg font-bold mb-2 text-white">
            Stop settling for compressed audio.
          </h2>
          <p className="text-sm mb-6" style={{ color: "rgba(241,245,249,0.6)" }}>
            Free, instant, no signup. Hear the difference.
          </p>
          <Link
            href="/"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3.5 text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
            Upgrade to lossless now
          </Link>
        </div>
      </main>

      <footer className="py-8" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-3xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "rgba(241,245,249,0.35)" }}>
            Built for audiophiles. Powered by community mappings.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/" className="text-xs transition-colors" style={{ color: "rgba(241,245,249,0.35)" }}>
              Search Songs
            </Link>
            <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="text-xs transition-colors" style={{ color: "rgba(241,245,249,0.35)" }}>
              ☕ Buy me a coffee
            </a>
            <a href="https://github.com/mithhu/YT2AppleMusic/releases/latest" target="_blank" rel="noopener noreferrer" className="text-xs transition-colors" style={{ color: "rgba(241,245,249,0.35)" }}>
              Chrome Extension
            </a>
            <a href="https://github.com/mithhu/YT2AppleMusic" target="_blank" rel="noopener noreferrer" className="text-xs transition-colors" style={{ color: "rgba(241,245,249,0.35)" }}>
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
