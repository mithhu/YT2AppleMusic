"use client";

import { useState, useRef, useEffect } from "react";
import type {
  SearchResult,
  AppleMusicResult,
  YouTubeResult,
} from "./api/search/route";

function getPreferredAppleMusicUrl(track: AppleMusicResult): string {
  if (typeof navigator === "undefined") {
    return track.url;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileDevice = /iphone|ipad|ipod|android/.test(userAgent);

  return isMobileDevice ? track.url : track.nativeUrl;
}

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
      <header className="sticky top-0 z-10 backdrop-blur-md" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(15,17,23,0.8)" }}>
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fb7185, #f43f5e)" }}>
              <span className="text-xs font-bold text-white">Y</span>
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-white">
              YT2Apple Music
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/youtube-to-apple-music"
              className="text-xs transition-colors"
              style={{ color: "rgba(241,245,249,0.35)" }}
              onMouseOver={(e) => (e.currentTarget.style.color = "rgba(241,245,249,0.6)")}
              onMouseOut={(e) => (e.currentTarget.style.color = "rgba(241,245,249,0.35)")}
            >
              Why upgrade?
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

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-5 pt-24 pb-16">
        {/* Hero */}
        <div className="text-center mb-12 max-w-xl animate-fade-in-up">
          <p className="text-[11px] uppercase tracking-[0.2em] mb-4 font-medium" style={{ color: "#fb7185" }}>
            For audiophiles who refuse to settle
          </p>
          <h2 className="text-4xl font-bold tracking-tight mb-4 leading-tight text-white">
            Discover on YouTube.{" "}
            <span className="gradient-text">Hear it in lossless.</span>
          </h2>
          <p className="text-[15px] leading-relaxed max-w-md mx-auto" style={{ color: "rgba(241,245,249,0.6)" }}>
            YouTube compresses audio to 128kbps. Apple Music streams up to
            24-bit/192kHz lossless. Find any song instantly.
          </p>
        </div>

        {/* Quality badge */}
        <div className="flex items-center gap-3 mb-10 animate-fade-in">
          <div className="badge-yt flex items-center gap-2 px-3.5 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
            <span className="text-[11px] font-medium">YouTube ~128kbps</span>
          </div>
          <svg width="20" height="12" viewBox="0 0 20 12" style={{ color: "rgba(241,245,249,0.35)" }}>
            <path d="M0 6h16M13 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="badge-am flex items-center gap-2 px-3.5 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] font-medium">Apple Music 24-bit/192kHz</span>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="w-full max-w-xl mb-12 animate-fade-in">
          <div className="search-glow card relative flex items-center overflow-hidden" style={{ borderRadius: "16px" }}>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Paste a YouTube URL or search "Deftones Sextape"...'
              className="flex-1 bg-transparent px-5 py-4 text-sm text-white focus:outline-none"
              style={{ color: "#f1f5f9" }}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="btn-primary mr-2.5 px-5 py-2.5 text-sm cursor-pointer"
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
          <div className="text-sm rounded-xl px-5 py-3.5 mb-6 max-w-xl w-full animate-fade-in" style={{ color: "#fda4af", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)" }}>
            {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="w-full max-w-xl animate-fade-in-up">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs" style={{ color: "rgba(241,245,249,0.35)" }}>
                {results.type === "youtube_url"
                  ? "YouTube URL detected — upgrade to lossless"
                  : `Results for "${results.query}"`}
              </span>
              {results.source === "community_db" && (
                <span className="badge-community text-[10px] px-2 py-0.5 rounded-full font-medium">
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
                <div className="flex flex-col items-center my-4 gap-1">
                  <svg width="20" height="20" viewBox="0 0 20 20" style={{ color: "rgba(52,211,153,0.5)" }}>
                    <path d="M10 4v12M6 12l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[10px] font-medium" style={{ color: "rgba(52,211,153,0.5)" }}>
                    lossless available
                  </span>
                </div>
              )}

            {results.appleMusicResults.length > 0 ? (
              <div className="space-y-3">
                {!isYoutubeMode && (
                  <p className="text-xs mb-3" style={{ color: "rgba(241,245,249,0.35)" }}>
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
              <div className="text-center py-12 text-sm card" style={{ color: "rgba(241,245,249,0.35)" }}>
                No results found. Try a different search.
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!results && !loading && !error && (
          <div className="text-center text-xs mt-6 space-y-6 animate-fade-in">
            <div className="flex items-center justify-center gap-10">
              <div className="flex flex-col items-center gap-3">
                <div className="card w-12 h-12 flex items-center justify-center" style={{ borderRadius: "12px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "rgba(241,245,249,0.6)" }}>
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ color: "rgba(241,245,249,0.6)" }}>Paste YouTube URL</span>
              </div>
              <span className="text-sm" style={{ color: "rgba(241,245,249,0.35)" }}>or</span>
              <div className="flex flex-col items-center gap-3">
                <div className="card w-12 h-12 flex items-center justify-center" style={{ borderRadius: "12px" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "rgba(241,245,249,0.6)" }}>
                    <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ color: "rgba(241,245,249,0.6)" }}>Search a song</span>
              </div>
            </div>
            <p className="max-w-xs mx-auto leading-relaxed" style={{ color: "rgba(241,245,249,0.35)" }}>
              Upgrade from compressed YouTube audio to Apple Music lossless quality
            </p>
          </div>
        )}
      </main>

      {/* Audio Quality Section */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-3 text-white">
              Why Audiophiles Choose Apple Music
            </h2>
            <p className="text-sm max-w-md mx-auto" style={{ color: "rgba(241,245,249,0.6)" }}>
              YouTube was built for video, not audio fidelity. Here&apos;s what
              you&apos;re missing.
            </p>
          </div>

          {/* Bitrate comparison */}
          <div className="grid md:grid-cols-2 gap-4 mb-16">
            <div className="yt-comparison rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(249,115,22,0.1)" }}>
                  <span className="text-sm">▶</span>
                </div>
                <h3 className="text-sm font-semibold" style={{ color: "#fed7aa" }}>YouTube</h3>
              </div>
              <div className="space-y-3 text-[13px]">
                {[
                  ["Max audio bitrate", "~128kbps AAC", "#fdba74"],
                  ["Lossless audio", "Not available", "rgba(251,146,60,0.7)"],
                  ["Spatial Audio", "Not available", "rgba(251,146,60,0.7)"],
                  ["Bit depth", "16-bit", "#fdba74"],
                  ["Sample rate", "44.1kHz", "#fdba74"],
                ].map(([label, value, color]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span style={{ color: "rgba(241,245,249,0.6)" }}>{label}</span>
                    <span className="font-medium" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="am-comparison rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)" }}>
                  <span className="text-sm">🍎</span>
                </div>
                <h3 className="text-sm font-semibold" style={{ color: "#a7f3d0" }}>Apple Music</h3>
              </div>
              <div className="space-y-3 text-[13px]">
                {[
                  ["Max audio bitrate", "256kbps AAC / Lossless", "#6ee7b7"],
                  ["Lossless audio", "ALAC up to 24-bit/192kHz", "#34d399"],
                  ["Spatial Audio", "Dolby Atmos", "#34d399"],
                  ["Bit depth", "Up to 24-bit", "#6ee7b7"],
                  ["Sample rate", "Up to 192kHz", "#6ee7b7"],
                ].map(([label, value, color]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span style={{ color: "rgba(241,245,249,0.6)" }}>{label}</span>
                    <span className="font-medium" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-3 text-white">
              From YouTube to Lossless in 3 Seconds
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="1.5">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                boxClass: "icon-box icon-box-accent",
                title: "Paste a YouTube Link",
                desc: "Found a great song on YouTube? Paste the URL. We extract the song info and find the lossless version on Apple Music.",
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
                boxClass: "icon-box icon-box-accent",
                title: "Or Search by Name",
                desc: "Search any song or artist. Get links to both Apple Music and YouTube for every result. Preview before you commit.",
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5">
                    <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="6" cy="18" r="3"/>
                    <circle cx="18" cy="16" r="3"/>
                  </svg>
                ),
                boxClass: "icon-box icon-box-green",
                title: "Listen in Lossless",
                desc: "Open directly in the Apple Music app — not the web player. Hear every detail in up to 24-bit/192kHz with Dolby Atmos.",
              },
            ].map((step) => (
              <div key={step.title} className="card p-6 text-center">
                <div className={`${step.boxClass} mx-auto mb-4`}>{step.icon}</div>
                <h3 className="text-sm font-semibold mb-2 text-white">{step.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(241,245,249,0.6)" }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Why this tool */}
          <div className="mb-16">
            <h2 className="text-xl font-bold mb-6 text-white">Why YT2Apple Music?</h2>
            <div className="space-y-1">
              {[
                { title: "Built for Audiophiles", desc: "The fastest way to go from discovering a song on YouTube to hearing it in lossless quality on Apple Music. No compressed-audio compromises." },
                { title: "Opens the Native Apple Music App", desc: "Other converters link to the web player, which doesn't support lossless. We open songs directly in the Apple Music app on Mac and iOS." },
                { title: "Community-Powered Accuracy", desc: "Our database of verified song mappings is built by real listeners. Instant, accurate matches — no guessing." },
                { title: "100% Free — No Limits, No Signup", desc: "Unlike tools that cap you at 3 searches per day or push premium plans. Unlimited searches, forever free." },
                { title: "Chrome Extension for Auto-Detection", desc: "Install our free extension and it automatically detects songs on YouTube, opening them in Apple Music with one click.", link: "https://github.com/mithhu/YT2AppleMusic/releases/latest", linkText: "Download the extension" },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 p-4 rounded-xl transition-colors" style={{ cursor: "default" }}>
                  <div className="check-icon mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-1 text-white">{item.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(241,245,249,0.6)" }}>
                      {item.desc}
                    </p>
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs mt-1.5 font-medium"
                        style={{ color: "#fb7185" }}
                      >
                        {item.linkText} &rarr;
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-xl font-bold mb-6 text-white">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {[
                { q: "Why does YouTube audio sound worse than Apple Music?", a: "YouTube compresses all audio to approximately 128kbps AAC (or lower on mobile) because it prioritizes video bandwidth. Apple Music offers lossless ALAC at up to 24-bit/192kHz — the same quality as the studio master. The difference is especially noticeable on good headphones or speakers." },
                { q: "How do I convert a YouTube link to Apple Music?", a: 'Paste any YouTube video URL into the search bar above. YT2Apple Music identifies the song and shows the matching Apple Music link. Click "Listen in Lossless" to open it directly in the Apple Music app.' },
                { q: "Is this free?", a: "Yes, completely free with no daily limits, no signup, and no premium plans. We use the iTunes Search API and a community-powered database." },
                { q: "Does the Apple Music link support lossless playback?", a: "Yes — we open songs in the native Apple Music app (not the web player). The native app supports Lossless, Hi-Res Lossless, and Dolby Atmos Spatial Audio, depending on your settings and hardware." },
                { q: "What about Spatial Audio and Dolby Atmos?", a: "Many songs on Apple Music support Dolby Atmos Spatial Audio, which creates an immersive 3D listening experience. YouTube doesn't offer this. When you open a song from YT2Apple Music, Spatial Audio plays automatically if the track supports it and you have compatible headphones." },
                { q: "How is this different from Song.link or Odesli?", a: "Song.link creates universal links but doesn't let you search by song name, doesn't open the native Apple Music app (so no lossless), and isn't designed for audiophiles. YT2Apple Music is purpose-built for people who want to upgrade from compressed YouTube audio to lossless Apple Music quality." },
              ].map((item) => (
                <details key={item.q} className="group card px-5 py-4">
                  <summary className="text-sm font-medium cursor-pointer text-white/80 hover:text-white transition-colors flex items-center">
                    {item.q}
                  </summary>
                  <p className="text-xs mt-3 ml-8 leading-relaxed" style={{ color: "rgba(241,245,249,0.6)" }}>
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} className="py-8">
        <div className="max-w-3xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "rgba(241,245,249,0.35)" }}>
            Built for audiophiles. Powered by community mappings.
          </p>
          <div className="flex items-center gap-5">
            {[
              { href: "/youtube-to-apple-music", text: "Why lossless?" },
              { href: "https://github.com/mithhu/YT2AppleMusic/releases/latest", text: "Chrome Extension", external: true },
              { href: "https://github.com/mithhu/YT2AppleMusic", text: "GitHub", external: true },
            ].map((link) => (
              <a
                key={link.text}
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="text-xs transition-colors"
                style={{ color: "rgba(241,245,249,0.35)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "rgba(241,245,249,0.6)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "rgba(241,245,249,0.35)")}
              >
                {link.text}
              </a>
            ))}
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
      className="flex items-center gap-4 card card-yt p-3.5 group"
    >
      {video.thumbnail && (
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-white/80 group-hover:text-white">
          {video.title}
        </p>
        <p className="text-xs truncate" style={{ color: "rgba(241,245,249,0.35)" }}>{video.channel}</p>
      </div>
      <div className="flex-shrink-0 text-right">
        <span className="text-[11px] px-2.5 py-1 rounded-lg block font-medium" style={{ background: "rgba(249,115,22,0.1)", color: "rgba(253,186,116,0.8)" }}>
          YouTube
        </span>
        <span className="text-[9px] mt-1 block" style={{ color: "rgba(251,146,60,0.4)" }}>
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
  const appleMusicUrl = getPreferredAppleMusicUrl(track);

  return (
    <div className="card card-am p-4 animate-fade-in">
      <div className="flex items-center gap-4">
        {track.artwork ? (
          <img
            src={track.artwork}
            alt={track.name}
            className="w-14 h-14 rounded-xl object-cover flex-shrink-0 shadow-lg"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #fb7185, #f43f5e)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate text-white">{track.name}</p>
          <p className="text-xs truncate" style={{ color: "rgba(241,245,249,0.6)" }}>{track.artist}</p>
          {track.album && (
            <p className="text-xs truncate" style={{ color: "rgba(241,245,249,0.35)" }}>{track.album}</p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {track.previewUrl && (
            <button
              onClick={onTogglePreview}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer"
              style={{
                background: isPlaying ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.04)",
                color: isPlaying ? "#fb7185" : "rgba(241,245,249,0.6)",
              }}
              title={isPlaying ? "Stop preview" : "Play 30s preview"}
            >
              {isPlaying ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
          )}
          <div className="text-right">
            <span className="text-[10px] block font-medium" style={{ color: "rgba(52,211,153,0.6)" }}>Lossless</span>
            <span className="text-[9px] block" style={{ color: "rgba(52,211,153,0.4)" }}>Spatial Audio</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3.5">
        <a
          href={appleMusicUrl}
          onClick={() => {
            fetch("/api/save-mapping", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                trackId: track.trackId,
                artist: track.artist,
                song: track.name,
              }),
            }).catch(() => {});
          }}
          className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5 text-xs"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="6" cy="18" r="3"/>
            <circle cx="18" cy="16" r="3"/>
          </svg>
          Listen in Lossless
        </a>
        {showYoutubeLink && track.youtubeUrl && (
          <a
            href={track.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs"
          >
            ▶ YouTube
          </a>
        )}
      </div>
    </div>
  );
}
