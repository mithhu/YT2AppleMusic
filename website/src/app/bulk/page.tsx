"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { BulkItem } from "../api/bulk/route";
import { SUPPORT_URL } from "@/lib/site";

function isPlaylistUrl(text: string): boolean {
  return /[?&]list=[a-zA-Z0-9_-]+/.test(text);
}

function parseInput(text: string): { videoIds: string[]; rawUrls: string[] } {
  const videoIds: string[] = [];
  const rawUrls: string[] = [];

  const lines = text.split(/[\n,]+/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Playlist URL — pass to server for resolution
    if (isPlaylistUrl(trimmed)) {
      rawUrls.push(trimmed);
      continue;
    }

    // Standard YouTube URL with v= parameter
    const vMatch = trimmed.match(
      /(?:youtube\.com\/watch\?[^\s]*v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    );
    if (vMatch) {
      videoIds.push(vMatch[1]);
      continue;
    }

    // Bare 11-char video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      videoIds.push(trimmed);
      continue;
    }

    // videoId JSON format (e.g. from pasting HTML)
    const jsonMatches = trimmed.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g);
    for (const m of jsonMatches) videoIds.push(m[1]);
  }

  return { videoIds: [...new Set(videoIds)], rawUrls };
}

function getInputSummary(text: string): string {
  const { videoIds, rawUrls } = parseInput(text);
  const parts: string[] = [];
  if (videoIds.length > 0) parts.push(`${videoIds.length} video(s)`);
  if (rawUrls.length > 0) parts.push(`${rawUrls.length} playlist(s)`);
  return parts.length > 0 ? parts.join(" + ") + " detected" : "";
}

function getPreferredUrl(
  url: string | null,
  nativeUrl: string | null,
): string | null {
  if (!url) return null;
  if (typeof navigator === "undefined") return url;
  return /iphone|ipad|ipod|android/i.test(navigator.userAgent)
    ? url
    : nativeUrl || url;
}

interface BulkResponse {
  results: BulkItem[];
  total: number;
  matched: number;
  invalid: string[];
}

export default function BulkPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{
    sent: number;
    total: number;
  } | null>(null);
  const [results, setResults] = useState<BulkItem[] | null>(null);
  const [stats, setStats] = useState<{
    total: number;
    matched: number;
    invalid: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playingPreview, setPlayingPreview] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const { videoIds, rawUrls } = parseInput(input);
    if (videoIds.length === 0 && rawUrls.length === 0) {
      setError("No YouTube video IDs or playlists found. Paste YouTube URLs, one per line.");
      return;
    }

    if (videoIds.length > 50) {
      setError("Maximum 50 videos per batch. Please reduce your list.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setStats(null);
    stopPreview();

    const urls = [
      ...videoIds.map((id) => `https://www.youtube.com/watch?v=${id}`),
      ...rawUrls,
    ];
    setProgress({ sent: urls.length, total: urls.length });

    try {
      const res = await fetch("/api/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Bulk processing failed");
      }

      const data: BulkResponse = await res.json();
      setResults(data.results);
      setStats({
        total: data.total,
        matched: data.matched,
        invalid: data.invalid.length,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const matchedResults = results?.filter((r) => r.source !== "not_found") || [];
  const unmatchedResults = results?.filter((r) => r.source === "not_found") || [];

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
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #fb7185, #f43f5e)",
              }}
            >
              <span className="text-xs font-bold text-white">Y</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">
              YT2Apple Music
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs transition-colors"
              style={{ color: "rgba(241,245,249,0.35)" }}
            >
              Single search
            </Link>
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
              href="https://github.com/mithhu/YT2AppleMusic/releases/latest"
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

      {/* Main */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 pt-16 pb-16">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-in-up">
          <p
            className="text-[11px] uppercase tracking-[0.2em] mb-4 font-medium"
            style={{ color: "#fb7185" }}
          >
            Bulk converter
          </p>
          <h1 className="text-3xl font-bold tracking-tight mb-4 leading-tight text-white">
            Convert multiple YouTube songs{" "}
            <span className="gradient-text">at once</span>
          </h1>
          <p
            className="text-[15px] leading-relaxed max-w-lg mx-auto"
            style={{ color: "rgba(241,245,249,0.6)" }}
          >
            Paste a YouTube playlist URL, multiple video links, or a list of
            video IDs. We&apos;ll find the Apple Music lossless version for each.
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="mb-10 animate-fade-in">
          <div
            className="card p-1"
            style={{ borderRadius: "20px" }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Paste YouTube URLs here (one per line, max 50)...\n\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\nhttps://youtu.be/9bZkp7q19f0\nhttps://www.youtube.com/watch?v=kJQP7kiw5Fk`}
              rows={6}
              className="w-full bg-transparent px-5 py-4 text-sm text-white focus:outline-none resize-none"
              style={{ color: "#f1f5f9" }}
            />
            <div className="flex items-center justify-between px-4 pb-3">
              <span
                className="text-xs"
                style={{ color: "rgba(241,245,249,0.35)" }}
              >
                {input.trim()
                  ? getInputSummary(input) || "Paste YouTube URLs or playlist links"
                  : "Supports YouTube URLs, playlist links, and bare video IDs"}
              </span>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="btn-primary px-6 py-2.5 text-sm cursor-pointer"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Convert All"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Progress */}
        {loading && progress && (
          <div className="card p-5 mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-medium"
                style={{ color: "rgba(241,245,249,0.6)" }}
              >
                Processing {progress.total} videos...
              </span>
              <span
                className="text-xs"
                style={{ color: "rgba(241,245,249,0.35)" }}
              >
                This may take a moment
              </span>
            </div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full animate-pulse"
                style={{
                  width: "60%",
                  background:
                    "linear-gradient(to right, #fb7185, #f43f5e)",
                }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="text-sm rounded-xl px-5 py-3.5 mb-6 animate-fade-in"
            style={{
              color: "#fda4af",
              background: "rgba(244,63,94,0.1)",
              border: "1px solid rgba(244,63,94,0.2)",
            }}
          >
            {error}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-8 animate-fade-in">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p
                className="text-xs mt-1"
                style={{ color: "rgba(241,245,249,0.5)" }}
              >
                Videos processed
              </p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: "#34d399" }}>
                {stats.matched}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "rgba(241,245,249,0.5)" }}
              >
                Apple Music matches
              </p>
            </div>
            <div className="card p-4 text-center">
              <p
                className="text-2xl font-bold"
                style={{
                  color:
                    stats.total - stats.matched > 0
                      ? "#fdba74"
                      : "rgba(241,245,249,0.5)",
                }}
              >
                {stats.total - stats.matched}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "rgba(241,245,249,0.5)" }}
              >
                Not found
              </p>
            </div>
          </div>
        )}

        {/* Results - matched */}
        {matchedResults.length > 0 && (
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-white">
                Matched Songs
              </h2>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "rgba(52,211,153,0.1)",
                  color: "#6ee7b7",
                }}
              >
                {matchedResults.length}
              </span>
            </div>
            <div className="space-y-2">
              {matchedResults.map((item) => (
                <ResultCard
                  key={item.youtubeId}
                  item={item}
                  playingPreview={playingPreview}
                  onTogglePreview={(trackId, url) => {
                    if (playingPreview === trackId) {
                      stopPreview();
                      return;
                    }
                    stopPreview();
                    const audio = new Audio(url);
                    audio.volume = 0.5;
                    audio.play();
                    audio.onended = () => setPlayingPreview(null);
                    audioRef.current = audio;
                    setPlayingPreview(trackId);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results - unmatched */}
        {unmatchedResults.length > 0 && (
          <div className="mb-8 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-semibold text-white">Not Found</h2>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "rgba(249,115,22,0.1)",
                  color: "#fdba74",
                }}
              >
                {unmatchedResults.length}
              </span>
            </div>
            <div className="space-y-2">
              {unmatchedResults.map((item) => (
                <div
                  key={item.youtubeId}
                  className="card p-3.5 flex items-center gap-3"
                  style={{ opacity: 0.6 }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(249,115,22,0.08)" }}
                  >
                    <span className="text-sm">▶</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate text-white/70">
                      {item.youtubeTitle || item.youtubeId}
                    </p>
                    {item.youtubeChannel && (
                      <p
                        className="text-xs truncate"
                        style={{ color: "rgba(241,245,249,0.35)" }}
                      >
                        {item.youtubeChannel}
                      </p>
                    )}
                  </div>
                  <a
                    href={item.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg transition-all flex-shrink-0"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(241,245,249,0.5)",
                    }}
                  >
                    Open on YouTube
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!results && !loading && !error && (
          <div className="text-center mt-6 animate-fade-in">
            <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {[
                {
                  icon: "🔗",
                  title: "YouTube URLs",
                  desc: "Paste multiple YouTube video URLs, one per line",
                },
                {
                  icon: "📋",
                  title: "Playlist support",
                  desc: "Paste any YouTube playlist URL and we'll extract all songs automatically",
                },
                {
                  icon: "⚡",
                  title: "Batch processing",
                  desc: "Up to 50 songs converted in a single request",
                },
              ].map((item) => (
                <div key={item.title} className="card p-5 text-center">
                  <div className="text-2xl mb-3">{item.icon}</div>
                  <h3 className="text-sm font-medium text-white mb-1">
                    {item.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "rgba(241,245,249,0.5)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="py-8"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p
            className="text-xs"
            style={{ color: "rgba(241,245,249,0.35)" }}
          >
            Built for audiophiles. Powered by community mappings.
          </p>
          <div className="flex items-center gap-5">
            {[
              { href: "/", text: "Search" },
              { href: "/youtube-to-apple-music", text: "Why lossless?" },
              {
                href: SUPPORT_URL,
                text: "☕ Buy me a coffee",
                external: true,
              },
              {
                href: "https://github.com/mithhu/YT2AppleMusic",
                text: "GitHub",
                external: true,
              },
            ].map((link) => (
              <a
                key={link.text}
                href={link.href}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="text-xs transition-colors"
                style={{ color: "rgba(241,245,249,0.35)" }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.color = "rgba(241,245,249,0.6)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.color = "rgba(241,245,249,0.35)")
                }
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

function ResultCard({
  item,
  playingPreview,
  onTogglePreview,
}: {
  item: BulkItem;
  playingPreview: number | null;
  onTogglePreview: (trackId: number, previewUrl: string) => void;
}) {
  const appleMusicUrl = getPreferredUrl(
    item.appleMusicUrl,
    item.appleMusicNativeUrl,
  );
  const isPlaying = playingPreview === item.appleMusicTrackId;

  return (
    <div className="card card-am p-3.5 flex items-center gap-3">
      {item.appleMusicArtwork ? (
        <img
          src={item.appleMusicArtwork}
          alt={item.appleMusicName || ""}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #fb7185, #f43f5e)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
          >
            <path
              d="M9 18V5l12-2v13"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate text-white">
          {item.appleMusicName || item.youtubeTitle}
        </p>
        <p
          className="text-xs truncate"
          style={{ color: "rgba(241,245,249,0.5)" }}
        >
          {item.appleMusicArtist || item.youtubeChannel}
          {item.appleMusicAlbum ? ` · ${item.appleMusicAlbum}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {item.source === "community_db" && (
          <span className="badge-community text-[9px] px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
            verified
          </span>
        )}
        <span
          className="text-[10px] font-medium hidden sm:block"
          style={{ color: "rgba(52,211,153,0.6)" }}
        >
          Lossless
        </span>
        {appleMusicUrl && (
          <a
            href={appleMusicUrl}
            className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M9 18V5l12-2v13"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            Listen
          </a>
        )}
      </div>
    </div>
  );
}
