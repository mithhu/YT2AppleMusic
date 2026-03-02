import type { Metadata } from "next";
import Link from "next/link";

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
      <header className="border-b border-[var(--border)] backdrop-blur-md sticky top-0 z-10 bg-[#0f1117]/80">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--accent-soft)] to-[var(--accent)] flex items-center justify-center">
              <span className="text-xs font-bold text-white">Y</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">
              YT2Apple Music
            </span>
          </Link>
          <a
            href="https://github.com/mithhu/YT2AppleMusic/releases/latest"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/15 border border-[var(--accent)]/20 rounded-lg text-[var(--accent-soft)] hover:text-[var(--accent)] transition-all"
          >
            Get Extension
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-20">
        <p className="text-[11px] text-[var(--accent-soft)] uppercase tracking-[0.2em] mb-4 font-medium">
          For audiophiles
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-5 leading-tight">
          YouTube to Apple Music:{" "}
          <span className="bg-gradient-to-r from-[var(--accent-soft)] to-[var(--accent)] bg-clip-text text-transparent">
            Upgrade to Lossless Audio
          </span>
        </h1>
        <p className="text-[var(--text-secondary)] mb-6 leading-relaxed max-w-2xl">
          You found a great song on YouTube. But YouTube compresses audio to
          ~128kbps AAC — fine for casual listening, terrible for anyone who
          cares about sound quality. Apple Music streams the same songs in
          lossless ALAC at up to 24-bit/192kHz, plus Dolby Atmos Spatial Audio.
        </p>
        <p className="text-[var(--text-secondary)] mb-10 leading-relaxed max-w-2xl">
          YT2Apple Music bridges the gap. Paste a YouTube link, find the song
          on Apple Music, and hear it the way it was mastered — in seconds.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[var(--accent-soft)] to-[var(--accent)] rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity mb-20"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
          Try it now — paste a YouTube link
        </Link>

        {/* The quality problem */}
        <h2 className="text-xl font-bold mb-4">
          The Audio Quality Problem with YouTube
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed">
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
              <tr className="border-b border-[var(--border)]">
                <th className="py-3.5 px-5 text-left text-[var(--text-secondary)] font-medium">Spec</th>
                <th className="py-3.5 px-5 text-left text-orange-300 font-medium">
                  YouTube
                </th>
                <th className="py-3.5 px-5 text-left text-emerald-300 font-medium">
                  Apple Music
                </th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              <tr className="border-b border-[var(--border)]">
                <td className="py-3 px-5">Format</td>
                <td className="py-3 px-5">AAC (lossy)</td>
                <td className="py-3 px-5 text-emerald-400/80">
                  AAC 256kbps + ALAC Lossless
                </td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3 px-5">Max bitrate</td>
                <td className="py-3 px-5">~128kbps</td>
                <td className="py-3 px-5 text-emerald-400/80">
                  Up to ~9,216kbps (lossless)
                </td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3 px-5">Bit depth</td>
                <td className="py-3 px-5">16-bit</td>
                <td className="py-3 px-5 text-emerald-400/80">Up to 24-bit</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3 px-5">Sample rate</td>
                <td className="py-3 px-5">44.1kHz</td>
                <td className="py-3 px-5 text-emerald-400/80">Up to 192kHz</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3 px-5">Spatial Audio</td>
                <td className="py-3 px-5 text-orange-400/60">No</td>
                <td className="py-3 px-5 text-emerald-400/80">
                  Dolby Atmos
                </td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-3 px-5">Dynamic range</td>
                <td className="py-3 px-5">Compressed</td>
                <td className="py-3 px-5 text-emerald-400/80">
                  Full studio master range
                </td>
              </tr>
              <tr>
                <td className="py-3 px-5">Best for</td>
                <td className="py-3 px-5">Discovering new music</td>
                <td className="py-3 px-5 text-emerald-400/80">
                  Actually listening to it
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* How it works */}
        <h2 className="text-xl font-bold mb-8">
          How to Convert YouTube to Apple Music
        </h2>
        <div className="space-y-4 mb-16">
          {[
            {
              num: "1",
              title: "Copy a YouTube URL",
              desc: "Find any music video, lyric video, or official audio on YouTube. Copy the URL — we support all standard YouTube link formats including youtu.be short links."
            },
            {
              num: "2",
              title: "Paste and Search",
              desc: "Paste the URL into YT2Apple Music. We check our community database of verified matches first (instant), then fall back to iTunes API search. Results include album art and 30-second previews."
            },
            {
              num: "3",
              title: "Listen in Lossless",
              desc: 'Click "Listen in Lossless" to open the song directly in the Apple Music app. Not the web player — the native app, where you get full hi-res lossless and Dolby Atmos Spatial Audio.'
            },
          ].map((step) => (
            <div key={step.num} className="flex gap-4 card p-5">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center text-sm font-bold text-[var(--accent-soft)]">
                {step.num}
              </div>
              <div>
                <h3 className="text-sm font-semibold mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* What audiophiles hear */}
        <h2 className="text-xl font-bold mb-6">
          What You&apos;re Missing on YouTube
        </h2>
        <div className="space-y-3 mb-16">
          {[
            {
              title: "Instrument separation",
              desc: "Lossless audio preserves subtle details that get smeared together in lossy compression. Individual instruments are more distinct."
            },
            {
              title: "Dynamic range",
              desc: "YouTube heavily compresses dynamics. Quiet passages and crescendos lose their impact. Lossless preserves the full dynamic range of the studio master."
            },
            {
              title: "High-frequency detail",
              desc: "Lossy codecs cut frequencies above ~16kHz. If you're under 40 and have decent headphones, you can hear the difference."
            },
            {
              title: "Spatial Audio",
              desc: "Dolby Atmos creates an immersive 3D soundstage. YouTube simply doesn't offer this."
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3.5 p-4 rounded-xl hover:bg-[var(--surface)] transition-colors">
              <span className="text-[var(--accent-soft)] mt-0.5 flex-shrink-0">&#x2022;</span>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                <strong className="text-[var(--text-primary)] font-medium">{item.title}</strong>{" "}
                — {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Competitor comparison */}
        <h2 className="text-xl font-bold mb-6">
          YT2Apple Music vs Other Converters
        </h2>
        <div className="card overflow-hidden mb-16">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-3.5 px-5 text-left text-[var(--text-secondary)] font-medium">
                  Feature
                </th>
                <th className="py-3.5 px-5 text-left text-emerald-300 font-medium">
                  YT2Apple Music
                </th>
                <th className="py-3.5 px-5 text-left text-[var(--text-secondary)] font-medium">
                  Song.link
                </th>
                <th className="py-3.5 px-5 text-left text-[var(--text-secondary)] font-medium">
                  Others
                </th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              {[
                ["Opens native app (lossless)", true, false, false],
                ["Search by song name", true, false, false],
                ["Free & unlimited", true, true, "limited"],
                ["30s preview", true, false, false],
                ["Community-verified matches", true, false, false],
                ["Chrome extension", true, true, "some"],
              ].map(([feature, yt2, songlink, others], i) => (
                <tr key={i} className={i < 5 ? "border-b border-[var(--border)]" : ""}>
                  <td className="py-3 px-5">{feature as string}</td>
                  <td className="py-3 px-5">
                    {yt2 === true ? (
                      <span className="text-emerald-400">&#10003;</span>
                    ) : (
                      <span className="text-orange-400/60">&#10007;</span>
                    )}
                  </td>
                  <td className="py-3 px-5">
                    {songlink === true ? (
                      <span className="text-emerald-400">&#10003;</span>
                    ) : (
                      <span className="text-orange-400/60">&#10007; {typeof songlink === "string" ? `(${songlink})` : "(web only)"}</span>
                    )}
                  </td>
                  <td className="py-3 px-5">
                    {others === true ? (
                      <span className="text-emerald-400">&#10003;</span>
                    ) : others === false ? (
                      <span className="text-orange-400/60">&#10007;</span>
                    ) : (
                      <span className="text-amber-400/60 capitalize">{others as string}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="text-center py-12 card bg-gradient-to-b from-[var(--surface)] to-transparent">
          <h2 className="text-lg font-bold mb-2">
            Stop settling for compressed audio.
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Free, instant, no signup. Hear the difference.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[var(--accent-soft)] to-[var(--accent)] rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
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

      <footer className="border-t border-[var(--border)] py-8">
        <div className="max-w-3xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-muted)]">
            Built for audiophiles. Powered by community mappings.
          </p>
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Search Songs
            </Link>
            <a
              href="https://github.com/mithhu/YT2AppleMusic/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Chrome Extension
            </a>
            <a
              href="https://github.com/mithhu/YT2AppleMusic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
