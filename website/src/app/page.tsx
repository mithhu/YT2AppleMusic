"use client";

import { useState, useRef, useEffect } from "react";
import type {
  SearchResult,
  AppleMusicResult,
  YouTubeResult,
} from "./api/search/route";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingPreview, setPlayingPreview] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);
    stopPreview();

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query.trim())}`
      );
      if (!res.ok) throw new Error("Search failed");
      const data: SearchResult = await res.json();
      setResults(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePreview = (trackId: number, previewUrl: string) => {
    if (playingPreview === trackId) {
      stopPreview();
      return;
    }

    stopPreview();
    const audio = new Audio(previewUrl);
    audio.volume = 0.5;
    audio.play();
    audio.onended = () => setPlayingPreview(null);
    audioRef.current = audio;
    setPlayingPreview(trackId);
  };

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingPreview(null);
  };

  const isYoutubeMode = results?.type === "youtube_url";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-10 bg-zinc-950/80">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎧</span>
            <h1 className="text-sm font-semibold tracking-tight">
              YT2Apple Music
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/youtube-to-apple-music"
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Why upgrade?
            </a>
            <a
              href="https://github.com/mithhu/YT2AppleMusic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Extension
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-4 pt-20 pb-12">
        {/* Hero */}
        <div className="text-center mb-10 max-w-xl">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-3">
            For audiophiles who refuse to settle
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-3">
            Discover on YouTube.{" "}
            <span className="bg-gradient-to-r from-[var(--apple-pink)] to-[var(--apple-red)] bg-clip-text text-transparent">
              Hear it in lossless.
            </span>
          </h2>
          <p className="text-sm text-white/50 leading-relaxed">
            YouTube compresses audio to 128kbps. Apple Music streams up to
            24-bit/192kHz lossless.
            <br />
            Find any song on Apple Music instantly — from a YouTube link or song
            name.
          </p>
        </div>

        {/* Quality badge */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <span className="text-[10px] text-red-300">
              YouTube ~128kbps AAC
            </span>
          </div>
          <span className="text-white/20 text-xs">→</span>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
            <span className="text-[10px] text-green-300">
              Apple Music up to 24-bit/192kHz
            </span>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="w-full max-w-xl mb-10">
          <div className="search-glow relative flex items-center bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all focus-within:border-white/25">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Paste a YouTube URL or search "Deftones Sextape"...'
              className="flex-1 bg-transparent px-5 py-4 text-sm text-white placeholder-white/30 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="mr-2 px-5 py-2 bg-gradient-to-r from-[var(--apple-pink)] to-[var(--apple-red)] rounded-xl text-sm font-medium disabled:opacity-30 hover:opacity-90 transition-opacity"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3 mb-6 max-w-xl w-full animate-fade-in">
            {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="w-full max-w-xl animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-white/30">
                {results.type === "youtube_url"
                  ? "YouTube URL detected — upgrade to lossless"
                  : `Results for "${results.query}"`}
              </span>
              {results.source === "community_db" && (
                <span className="text-[10px] px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
                  community verified
                </span>
              )}
            </div>

            {isYoutubeMode && results.youtubeResult && (
              <YouTubeCard video={results.youtubeResult} />
            )}

            {isYoutubeMode &&
              results.youtubeResult &&
              results.appleMusicResults.length > 0 && (
                <div className="flex flex-col items-center my-3 gap-1">
                  <span className="text-white/20 text-lg">↓</span>
                  <span className="text-[10px] text-green-400/60">
                    lossless quality available
                  </span>
                </div>
              )}

            {results.appleMusicResults.length > 0 ? (
              <div className="space-y-3">
                {!isYoutubeMode && (
                  <p className="text-xs text-white/30 mb-2">
                    Apple Music &middot; Lossless & Spatial Audio
                  </p>
                )}
                {results.appleMusicResults.map((track, i) => (
                  <AppleMusicCard
                    key={track.trackId || i}
                    track={track}
                    isPlaying={playingPreview === track.trackId}
                    onTogglePreview={() =>
                      togglePreview(track.trackId, track.previewUrl)
                    }
                    showYoutubeLink={!isYoutubeMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-white/30 text-sm">
                No results found. Try a different search.
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!results && !loading && !error && (
          <div className="text-center text-white/20 text-xs mt-10 space-y-4">
            <div className="flex items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">🔗</span>
                <span>Paste YouTube URL</span>
              </div>
              <div className="text-white/10">or</div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">🔍</span>
                <span>Search a song</span>
              </div>
            </div>
            <p className="text-white/15 max-w-xs mx-auto">
              Upgrade from compressed YouTube audio to Apple Music lossless
              quality
            </p>
          </div>
        )}
      </main>

      {/* Audio Quality Section */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-white/5">
        <h2 className="text-xl font-bold mb-2 text-center">
          Why Audiophiles Choose Apple Music Over YouTube
        </h2>
        <p className="text-xs text-white/40 text-center mb-8">
          YouTube was built for video, not audio fidelity. Here&apos;s what
          you&apos;re missing.
        </p>

        {/* Bitrate comparison */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">▶</span>
              <h3 className="text-sm font-semibold text-red-300">YouTube</h3>
            </div>
            <div className="space-y-2 text-xs text-white/40">
              <div className="flex justify-between">
                <span>Max audio bitrate</span>
                <span className="text-red-300">~128kbps AAC</span>
              </div>
              <div className="flex justify-between">
                <span>Lossless audio</span>
                <span className="text-red-400">Not available</span>
              </div>
              <div className="flex justify-between">
                <span>Spatial Audio</span>
                <span className="text-red-400">Not available</span>
              </div>
              <div className="flex justify-between">
                <span>Bit depth</span>
                <span className="text-red-300">16-bit</span>
              </div>
              <div className="flex justify-between">
                <span>Sample rate</span>
                <span className="text-red-300">44.1kHz</span>
              </div>
            </div>
          </div>

          <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm">🍎</span>
              <h3 className="text-sm font-semibold text-green-300">
                Apple Music
              </h3>
            </div>
            <div className="space-y-2 text-xs text-white/40">
              <div className="flex justify-between">
                <span>Max audio bitrate</span>
                <span className="text-green-300">256kbps AAC / Lossless</span>
              </div>
              <div className="flex justify-between">
                <span>Lossless audio</span>
                <span className="text-green-400">
                  ALAC up to 24-bit/192kHz
                </span>
              </div>
              <div className="flex justify-between">
                <span>Spatial Audio</span>
                <span className="text-green-400">Dolby Atmos</span>
              </div>
              <div className="flex justify-between">
                <span>Bit depth</span>
                <span className="text-green-300">Up to 24-bit</span>
              </div>
              <div className="flex justify-between">
                <span>Sample rate</span>
                <span className="text-green-300">Up to 192kHz</span>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <h2 className="text-xl font-bold mb-6 text-center">
          From YouTube to Lossless in 3 Seconds
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <div className="text-2xl mb-2">🔗</div>
            <h3 className="text-sm font-semibold mb-1">
              Paste a YouTube Link
            </h3>
            <p className="text-xs text-white/40 leading-relaxed">
              Found a great song on YouTube? Paste the URL. We extract the song
              info and find the lossless version on Apple Music.
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="text-sm font-semibold mb-1">
              Or Search by Name
            </h3>
            <p className="text-xs text-white/40 leading-relaxed">
              Search any song or artist. Get links to both Apple Music (lossless)
              and YouTube for every result. Preview before you commit.
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-2">🎧</div>
            <h3 className="text-sm font-semibold mb-1">
              Listen in Lossless
            </h3>
            <p className="text-xs text-white/40 leading-relaxed">
              Open directly in the Apple Music app — not the web player. Hear
              every detail in up to 24-bit/192kHz with Dolby Atmos Spatial
              Audio.
            </p>
          </div>
        </div>

        {/* Why this tool */}
        <h2 className="text-lg font-bold mb-4">
          Why YT2Apple Music?
        </h2>
        <div className="space-y-4 mb-12">
          <div className="flex gap-3">
            <span className="text-green-400 mt-0.5">✓</span>
            <div>
              <h3 className="text-sm font-medium">
                Built for Audiophiles
              </h3>
              <p className="text-xs text-white/40">
                The fastest way to go from discovering a song on YouTube to
                hearing it in lossless quality on Apple Music. No
                compressed-audio compromises.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400 mt-0.5">✓</span>
            <div>
              <h3 className="text-sm font-medium">
                Opens the Native Apple Music App
              </h3>
              <p className="text-xs text-white/40">
                Other converters link to the web player, which doesn&apos;t
                support lossless. We open songs directly in the Apple Music app
                on Mac and iOS where you get full hi-res audio.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400 mt-0.5">✓</span>
            <div>
              <h3 className="text-sm font-medium">
                Community-Powered Accuracy
              </h3>
              <p className="text-xs text-white/40">
                Our database of verified song mappings is built by real
                listeners. Instant, accurate matches — no guessing.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400 mt-0.5">✓</span>
            <div>
              <h3 className="text-sm font-medium">
                100% Free — No Limits, No Signup
              </h3>
              <p className="text-xs text-white/40">
                Unlike tools that cap you at 3 searches per day or push premium
                plans. Unlimited searches, forever free.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="text-green-400 mt-0.5">✓</span>
            <div>
              <h3 className="text-sm font-medium">
                Chrome Extension for Auto-Detection
              </h3>
              <p className="text-xs text-white/40">
                Install our free extension and it automatically detects songs on
                YouTube, opening them in Apple Music with one click. Zero
                friction.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <h2 className="text-lg font-bold mb-4">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4 mb-8">
          <details className="group">
            <summary className="text-sm font-medium cursor-pointer hover:text-white/80 transition-colors">
              Why does YouTube audio sound worse than Apple Music?
            </summary>
            <p className="text-xs text-white/40 mt-2 leading-relaxed">
              YouTube compresses all audio to approximately 128kbps AAC (or
              lower on mobile) because it prioritizes video bandwidth. Apple
              Music offers lossless ALAC at up to 24-bit/192kHz — the same
              quality as the studio master. The difference is especially
              noticeable on good headphones or speakers.
            </p>
          </details>
          <details className="group">
            <summary className="text-sm font-medium cursor-pointer hover:text-white/80 transition-colors">
              How do I convert a YouTube link to Apple Music?
            </summary>
            <p className="text-xs text-white/40 mt-2 leading-relaxed">
              Paste any YouTube video URL into the search bar above. YT2Apple
              Music identifies the song and shows the matching Apple Music link.
              Click &ldquo;Listen in Lossless&rdquo; to open it directly in the
              Apple Music app.
            </p>
          </details>
          <details className="group">
            <summary className="text-sm font-medium cursor-pointer hover:text-white/80 transition-colors">
              Is this free?
            </summary>
            <p className="text-xs text-white/40 mt-2 leading-relaxed">
              Yes, completely free with no daily limits, no signup, and no
              premium plans. We use the iTunes Search API and a
              community-powered database.
            </p>
          </details>
          <details className="group">
            <summary className="text-sm font-medium cursor-pointer hover:text-white/80 transition-colors">
              Does the Apple Music link support lossless playback?
            </summary>
            <p className="text-xs text-white/40 mt-2 leading-relaxed">
              Yes — we open songs in the native Apple Music app (not the web
              player). The native app supports Lossless, Hi-Res Lossless, and
              Dolby Atmos Spatial Audio, depending on your settings and
              hardware.
            </p>
          </details>
          <details className="group">
            <summary className="text-sm font-medium cursor-pointer hover:text-white/80 transition-colors">
              What about Spatial Audio and Dolby Atmos?
            </summary>
            <p className="text-xs text-white/40 mt-2 leading-relaxed">
              Many songs on Apple Music support Dolby Atmos Spatial Audio,
              which creates an immersive 3D listening experience. YouTube
              doesn&apos;t offer this. When you open a song from YT2Apple Music,
              Spatial Audio plays automatically if the track supports it and
              you have compatible headphones.
            </p>
          </details>
          <details className="group">
            <summary className="text-sm font-medium cursor-pointer hover:text-white/80 transition-colors">
              How is this different from Song.link or Odesli?
            </summary>
            <p className="text-xs text-white/40 mt-2 leading-relaxed">
              Song.link creates universal links but doesn&apos;t let you search
              by song name, doesn&apos;t open the native Apple Music app (so no
              lossless), and isn&apos;t designed for audiophiles. YT2Apple Music
              is purpose-built for people who want to upgrade from compressed
              YouTube audio to lossless Apple Music quality.
            </p>
          </details>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6">
        <div className="max-w-3xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/20">
            Built for audiophiles. Powered by community mappings.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="/youtube-to-apple-music"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Why lossless?
            </a>
            <a
              href="https://github.com/mithhu/YT2AppleMusic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/mithhu/YT2AppleMusic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/30 hover:text-white/60 transition-colors"
            >
              Chrome Extension
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function YouTubeCard({ video }: { video: YouTubeResult }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 bg-red-500/5 border border-red-500/15 rounded-xl p-3 hover:bg-red-500/10 transition-colors group"
    >
      {video.thumbnail && (
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-white/90">
          {video.title}
        </p>
        <p className="text-xs text-white/40 truncate">{video.channel}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded-lg block">
          YouTube
        </span>
        <span className="text-[9px] text-red-400/60 mt-0.5 block">
          ~128kbps
        </span>
      </div>
    </a>
  );
}

function AppleMusicCard({
  track,
  isPlaying,
  onTogglePreview,
  showYoutubeLink,
}: {
  track: AppleMusicResult;
  isPlaying: boolean;
  onTogglePreview: () => void;
  showYoutubeLink: boolean;
}) {
  return (
    <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-4 hover:bg-green-500/8 transition-colors animate-fade-in">
      <div className="flex items-center gap-4">
        {track.artwork ? (
          <img
            src={track.artwork}
            alt={track.name}
            className="w-14 h-14 rounded-lg object-cover flex-shrink-0 shadow-lg"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[var(--apple-pink)] to-[var(--apple-red)] flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🎵</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{track.name}</p>
          <p className="text-xs text-white/50 truncate">{track.artist}</p>
          {track.album && (
            <p className="text-xs text-white/30 truncate">{track.album}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {track.previewUrl && (
            <button
              onClick={onTogglePreview}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title={isPlaying ? "Stop preview" : "Play 30s preview"}
            >
              {isPlaying ? (
                <span className="text-xs">⏸</span>
              ) : (
                <span className="text-xs">▶</span>
              )}
            </button>
          )}
          <div className="text-right">
            <span className="text-[9px] text-green-400/80 block">
              Lossless
            </span>
            <span className="text-[9px] text-green-400/50 block">
              Spatial Audio
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <a
          href={track.nativeUrl}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-[var(--apple-pink)] to-[var(--apple-red)] rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          <span>🎧</span> Listen in Lossless
        </a>
        {showYoutubeLink && track.youtubeUrl && (
          <a
            href={track.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/50 transition-colors"
          >
            <span>▶</span> YouTube
          </a>
        )}
      </div>
    </div>
  );
}
