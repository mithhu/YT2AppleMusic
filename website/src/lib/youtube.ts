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
