export function extractYoutubeId(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export interface YouTubeOEmbed {
  title: string;
  author_name: string;
  thumbnail_url: string;
}

export async function getYoutubeInfo(
  videoId: string
): Promise<YouTubeOEmbed | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function getYoutubeUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Search YouTube for a song and return the first video ID.
 * Uses YouTube's page HTML to extract the first result — no API key needed.
 * Returns null on failure so it never blocks search results.
 */
export async function searchYoutubeVideoId(
  artist: string,
  song: string
): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${artist} ${song} official audio`);
    const res = await fetch(
      `https://www.youtube.com/results?search_query=${query}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      }
    );
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Extract a YouTube playlist ID from a URL.
 * Supports youtube.com/playlist?list=... and &list=... in watch URLs.
 */
export function extractPlaylistId(input: string): string | null {
  const match = input.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Fetch video IDs from a YouTube playlist by scraping the playlist page HTML.
 * No API key needed. Returns up to ~200 unique video IDs.
 */
export async function getPlaylistVideoIds(
  playlistId: string,
): Promise<string[]> {
  try {
    const res = await fetch(
      `https://www.youtube.com/playlist?list=${playlistId}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      },
    );
    if (!res.ok) return [];
    const html = await res.text();
    const ids: string[] = [];
    const matches = html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g);
    for (const m of matches) ids.push(m[1]);
    return [...new Set(ids)];
  } catch {
    return [];
  }
}

export function cleanTitle(title: string): string {
  return title
    .replace(/\s*\(.*$/gi, "")
    .replace(/\s*\[.*$/gi, "")
    .replace(/\s*(official\s+)?(music\s+)?video\s*/gi, "")
    .replace(/\s*(ft\.?|feat\.?|featuring)\s+.*/gi, "")
    .replace(/\s*\|\s*.*$/gi, "")
    .replace(/\s*-\s*.*lyrics.*$/gi, "")
    .replace(/\s*-\s*(official|music|video|lyric|audio|hd|4k|hq).*$/gi, "")
    .trim();
}
