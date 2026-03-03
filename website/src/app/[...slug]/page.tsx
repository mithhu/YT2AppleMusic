"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { SearchResult, AppleMusicResult } from "../api/search/route";

function extractVideoId(fullUrl: string): string | null {
  const raw = decodeURIComponent(fullUrl);

  // ?v= or &v= anywhere in the string (covers watch?v=... even when in path)
  const vParam = raw.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (vParam) return vParam[1];

  // youtu.be/ID or youtube.com/embed/ID
  const shortOrEmbed = raw.match(
    /(?:youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  );
  if (shortOrEmbed) return shortOrEmbed[1];

  // Bare 11-char video ID as the only path segment
  const bareId = raw.match(/\/([a-zA-Z0-9_-]{11})\/?$/);
  if (bareId) return bareId[1];

  return null;
}

function getPreferredUrl(track: AppleMusicResult): string {
  if (typeof navigator === "undefined") return track.url;
  return /iphone|ipad|ipod|android/i.test(navigator.userAgent)
    ? track.url
    : track.nativeUrl;
}

export default function CatchAllPage() {
  usePathname(); // trigger re-render on client navigation

  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingPreview, setPlayingPreview] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fullUrl = window.location.href;
    const videoId = extractVideoId(fullUrl);

    if (!videoId) {
      setLoading(false);
      setError("No YouTube video found in this URL.");
      return;
    }

    const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
    fetch(`/api/search?q=${encodeURIComponent(ytUrl)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Search failed");
        return res.json();
      })
      .then((data: SearchResult) => setResults(data))
      .catch(() => setError("Could not find this song. Try searching manually."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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

  const track = results?.appleMusicResults?.[0];
  const ytResult = results?.youtubeResult;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-10 backdrop-blur-md"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(15,17,23,0.8)",
        }}
      >
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
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
          <Link
            href="/"
            className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{
              background: "rgba(244,63,94,0.1)",
              border: "1px solid rgba(244,63,94,0.2)",
              color: "#fb7185",
            }}
          >
            Search more songs
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-16">
        {loading && (
          <div className="text-center animate-fade-in">
            <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
            <p className="text-sm" style={{ color: "rgba(241,245,249,0.6)" }}>
              Finding lossless version on Apple Music...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center max-w-md animate-fade-in">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-sm mb-6" style={{ color: "rgba(241,245,249,0.6)" }}>
              {error}
            </p>
            <Link href="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
              Search on YT2Apple Music
            </Link>
          </div>
        )}

        {!loading && !error && track && (
          <div className="w-full max-w-md animate-fade-in-up">
            {/* YouTube source */}
            {ytResult && (
              <div className="text-center mb-6">
                <p className="text-xs mb-2" style={{ color: "rgba(241,245,249,0.35)" }}>
                  YouTube video detected
                </p>
                <p className="text-sm font-medium text-white/80 truncate">
                  {ytResult.title}
                </p>
                <p className="text-xs" style={{ color: "rgba(241,245,249,0.35)" }}>
                  {ytResult.channel}
                </p>
              </div>
            )}

            {/* Arrow */}
            <div className="flex flex-col items-center my-4 gap-1">
              <svg width="20" height="20" viewBox="0 0 20 20" style={{ color: "rgba(52,211,153,0.5)" }}>
                <path d="M10 4v12M6 12l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[10px] font-medium" style={{ color: "rgba(52,211,153,0.5)" }}>
                lossless available
              </span>
            </div>

            {/* Apple Music card */}
            <div className="card card-am p-5 animate-fade-in">
              <div className="flex items-center gap-4 mb-4">
                {track.artwork ? (
                  <img
                    src={track.artwork}
                    alt={track.name}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-lg"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, #fb7185, #f43f5e)" }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                      <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-lg font-bold truncate text-white">{track.name}</p>
                  <p className="text-sm truncate" style={{ color: "rgba(241,245,249,0.6)" }}>
                    {track.artist}
                  </p>
                  {track.album && (
                    <p className="text-xs truncate mt-0.5" style={{ color: "rgba(241,245,249,0.35)" }}>
                      {track.album}
                    </p>
                  )}
                </div>
              </div>

              {/* Quality badges */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(52,211,153,0.1)", color: "rgba(52,211,153,0.8)" }}>
                  Lossless 24-bit/192kHz
                </span>
                <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ background: "rgba(52,211,153,0.1)", color: "rgba(52,211,153,0.8)" }}>
                  Dolby Atmos
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={getPreferredUrl(track)}
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
                  className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                  Listen in Lossless
                </a>
                {track.previewUrl && (
                  <button
                    onClick={() => togglePreview(track.trackId, track.previewUrl)}
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                    style={{
                      background: playingPreview === track.trackId ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: playingPreview === track.trackId ? "#fb7185" : "rgba(241,245,249,0.6)",
                    }}
                    title={playingPreview === track.trackId ? "Stop preview" : "Play 30s preview"}
                  >
                    {playingPreview === track.trackId ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* More results */}
            {results && results.appleMusicResults.length > 1 && (
              <div className="mt-4">
                <p className="text-xs mb-3" style={{ color: "rgba(241,245,249,0.35)" }}>
                  Other matches
                </p>
                <div className="space-y-2">
                  {results.appleMusicResults.slice(1).map((t) => (
                    <a
                      key={t.trackId}
                      href={getPreferredUrl(t)}
                      className="card flex items-center gap-3 p-3 group transition-colors"
                      style={{ cursor: "pointer" }}
                    >
                      {t.artwork && (
                        <img src={t.artwork} alt={t.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-white/80 group-hover:text-white">{t.name}</p>
                        <p className="text-xs truncate" style={{ color: "rgba(241,245,249,0.35)" }}>{t.artist}</p>
                      </div>
                      <span className="text-[10px] font-medium" style={{ color: "rgba(52,211,153,0.6)" }}>Lossless</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Source badge */}
            {results?.source === "community_db" && (
              <p className="text-center text-[10px] mt-4" style={{ color: "rgba(241,245,249,0.35)" }}>
                <span className="badge-community px-2 py-0.5 rounded-full font-medium">
                  community verified
                </span>
              </p>
            )}

            {/* How it works */}
            <div className="text-center mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xs mb-1" style={{ color: "rgba(241,245,249,0.35)" }}>
                Tip: Replace <code className="px-1 py-0.5 rounded text-[10px]" style={{ background: "rgba(255,255,255,0.06)" }}>youtube.com</code> with{" "}
                <code className="px-1 py-0.5 rounded text-[10px]" style={{ background: "rgba(255,255,255,0.06)" }}>yt2apple.vercel.app</code> in any YouTube URL
              </p>
              <p className="text-[10px]" style={{ color: "rgba(241,245,249,0.25)" }}>
                e.g. yt2apple.vercel.app/watch?v=dQw4w9WgXcQ
              </p>
            </div>
          </div>
        )}

        {!loading && !error && !track && results && (
          <div className="text-center max-w-md animate-fade-in">
            <div className="text-4xl mb-4">🎵</div>
            <p className="text-sm mb-6" style={{ color: "rgba(241,245,249,0.6)" }}>
              No Apple Music match found for this video.
            </p>
            <Link href="/" className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm">
              Try searching manually
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs" style={{ color: "rgba(241,245,249,0.25)" }}>
            <Link href="/" className="hover:underline">YT2Apple Music</Link>
            {" · "}
            Discover on YouTube, listen in lossless
          </p>
        </div>
      </footer>
    </div>
  );
}
