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
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-10 bg-zinc-950/80">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-lg">🎧</span>
            <span className="text-sm font-semibold tracking-tight">
              YT2Apple Music
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-6 py-16">
        <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
          For audiophiles
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          YouTube to Apple Music: Upgrade to Lossless Audio
        </h1>
        <p className="text-white/50 mb-8 leading-relaxed">
          You found a great song on YouTube. But YouTube compresses audio to
          ~128kbps AAC — fine for casual listening, terrible for anyone who
          cares about sound quality. Apple Music streams the same songs in
          lossless ALAC at up to 24-bit/192kHz, plus Dolby Atmos Spatial Audio.
        </p>
        <p className="text-white/50 mb-8 leading-relaxed">
          YT2Apple Music bridges the gap. Paste a YouTube link, find the song
          on Apple Music, and hear it the way it was mastered — in seconds.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--apple-pink)] to-[var(--apple-red)] rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity mb-16"
        >
          🎧 Try it now — paste a YouTube link →
        </Link>

        {/* The quality problem */}
        <h2 className="text-xl font-bold mb-6">
          The Audio Quality Problem with YouTube
        </h2>
        <p className="text-sm text-white/40 mb-6 leading-relaxed">
          YouTube was built for video, not audio fidelity. Even on
          &ldquo;premium&rdquo; quality settings, YouTube&apos;s audio tops out at
          approximately 128kbps AAC on desktop (and often lower on mobile).
          That&apos;s less than half the bitrate of a standard CD, and a
          fraction of what modern lossless streaming offers.
        </p>

        {/* Detailed comparison */}
        <div className="overflow-x-auto mb-12">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="py-3 pr-4 text-white/60 font-medium">Spec</th>
                <th className="py-3 px-4 text-red-300 font-medium">
                  YouTube
                </th>
                <th className="py-3 pl-4 text-green-300 font-medium">
                  Apple Music
                </th>
              </tr>
            </thead>
            <tbody className="text-white/40">
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4">Format</td>
                <td className="py-3 px-4">AAC (lossy)</td>
                <td className="py-3 pl-4 text-green-400">
                  AAC 256kbps + ALAC Lossless
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4">Max bitrate</td>
                <td className="py-3 px-4">~128kbps</td>
                <td className="py-3 pl-4 text-green-400">
                  Up to ~9,216kbps (lossless)
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4">Bit depth</td>
                <td className="py-3 px-4">16-bit</td>
                <td className="py-3 pl-4 text-green-400">Up to 24-bit</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4">Sample rate</td>
                <td className="py-3 px-4">44.1kHz</td>
                <td className="py-3 pl-4 text-green-400">Up to 192kHz</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4">Spatial Audio</td>
                <td className="py-3 px-4 text-red-400">No</td>
                <td className="py-3 pl-4 text-green-400">
                  Dolby Atmos
                </td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-3 pr-4">Dynamic range</td>
                <td className="py-3 px-4">Compressed</td>
                <td className="py-3 pl-4 text-green-400">
                  Full studio master range
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4">Best for</td>
                <td className="py-3 px-4">Discovering new music</td>
                <td className="py-3 pl-4 text-green-400">
                  Actually listening to it
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* How it works */}
        <h2 className="text-xl font-bold mb-6">
          How to Convert YouTube to Apple Music
        </h2>
        <div className="space-y-6 mb-12">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">
                Copy a YouTube URL
              </h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Find any music video, lyric video, or official audio on YouTube.
                Copy the URL — we support all standard YouTube link formats
                including youtu.be short links.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">
                Paste and Search
              </h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Paste the URL into YT2Apple Music. We check our community
                database of verified matches first (instant), then fall back to
                iTunes API search. Results include album art and 30-second
                previews.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">
                Listen in Lossless
              </h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Click &ldquo;Listen in Lossless&rdquo; to open the song
                directly in the Apple Music app. Not the web player — the native
                app, where you get full hi-res lossless and Dolby Atmos Spatial
                Audio.
              </p>
            </div>
          </div>
        </div>

        {/* What audiophiles hear */}
        <h2 className="text-xl font-bold mb-4">
          What You&apos;re Missing on YouTube
        </h2>
        <div className="space-y-3 mb-12">
          <div className="flex gap-3">
            <span className="text-white/20 mt-0.5">•</span>
            <p className="text-xs text-white/40 leading-relaxed">
              <strong className="text-white/70">Instrument separation</strong>{" "}
              — Lossless audio preserves subtle details that get smeared
              together in lossy compression. Individual instruments are more
              distinct.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-white/20 mt-0.5">•</span>
            <p className="text-xs text-white/40 leading-relaxed">
              <strong className="text-white/70">Dynamic range</strong> — YouTube
              heavily compresses dynamics. Quiet passages and crescendos lose
              their impact. Lossless preserves the full dynamic range of the
              studio master.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-white/20 mt-0.5">•</span>
            <p className="text-xs text-white/40 leading-relaxed">
              <strong className="text-white/70">High-frequency detail</strong>{" "}
              — Lossy codecs cut frequencies above ~16kHz. If you&apos;re under
              40 and have decent headphones, you can hear the difference.
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-white/20 mt-0.5">•</span>
            <p className="text-xs text-white/40 leading-relaxed">
              <strong className="text-white/70">Spatial Audio</strong> — Dolby
              Atmos creates an immersive 3D soundstage. YouTube simply
              doesn&apos;t offer this.
            </p>
          </div>
        </div>

        {/* Competitor comparison */}
        <h2 className="text-xl font-bold mb-6">
          YT2Apple Music vs Other Converters
        </h2>
        <div className="overflow-x-auto mb-12">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="py-3 pr-4 text-white/60 font-medium">
                  Feature
                </th>
                <th className="py-3 px-4 text-green-300 font-medium">
                  YT2Apple Music
                </th>
                <th className="py-3 px-4 text-white/60 font-medium">
                  Song.link
                </th>
                <th className="py-3 pl-4 text-white/60 font-medium">
                  Others
                </th>
              </tr>
            </thead>
            <tbody className="text-white/40">
              <tr className="border-b border-white/5">
                <td className="py-2.5 pr-4">Opens native app (lossless)</td>
                <td className="py-2.5 px-4 text-green-400">✓</td>
                <td className="py-2.5 px-4 text-red-400">✗ (web only)</td>
                <td className="py-2.5 pl-4 text-red-400">✗</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2.5 pr-4">Search by song name</td>
                <td className="py-2.5 px-4 text-green-400">✓</td>
                <td className="py-2.5 px-4 text-red-400">✗</td>
                <td className="py-2.5 pl-4 text-red-400">✗</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2.5 pr-4">Free & unlimited</td>
                <td className="py-2.5 px-4 text-green-400">✓</td>
                <td className="py-2.5 px-4 text-green-400">✓</td>
                <td className="py-2.5 pl-4 text-yellow-400">Limited</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2.5 pr-4">30s preview</td>
                <td className="py-2.5 px-4 text-green-400">✓</td>
                <td className="py-2.5 px-4 text-red-400">✗</td>
                <td className="py-2.5 pl-4 text-red-400">✗</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2.5 pr-4">Community-verified matches</td>
                <td className="py-2.5 px-4 text-green-400">✓</td>
                <td className="py-2.5 px-4 text-red-400">✗</td>
                <td className="py-2.5 pl-4 text-red-400">✗</td>
              </tr>
              <tr>
                <td className="py-2.5 pr-4">Chrome extension</td>
                <td className="py-2.5 px-4 text-green-400">✓</td>
                <td className="py-2.5 px-4 text-green-400">✓</td>
                <td className="py-2.5 pl-4 text-yellow-400">Some</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="text-center py-10 bg-white/5 border border-white/10 rounded-2xl">
          <h2 className="text-lg font-bold mb-2">
            Stop settling for compressed audio.
          </h2>
          <p className="text-xs text-white/40 mb-4">
            Free, instant, no signup. Hear the difference.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--apple-pink)] to-[var(--apple-red)] rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            🎧 Upgrade to lossless now →
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/5 py-6">
        <div className="max-w-3xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/20">
            Built for audiophiles. Powered by community mappings.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Search Songs
            </Link>
            <a
              href="https://github.com/mithhu/YT2AppleMusic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
