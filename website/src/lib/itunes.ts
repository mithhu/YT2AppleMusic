export interface ITunesResult {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  artworkUrl100: string;
  trackViewUrl: string;
  previewUrl: string;
}

export async function searchItunes(
  query: string,
  limit = 5
): Promise<ITunesResult[]> {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
    query
  )}&media=music&entity=song&limit=${limit}`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  return data.results || [];
}

export function getAppleMusicUrl(trackId: number): string {
  return `https://music.apple.com/us/song/${trackId}`;
}

export function getArtworkUrl(url: string, size = 300): string {
  return url.replace("100x100bb", `${size}x${size}bb`);
}

export async function lookupByTrackId(
  trackId: number
): Promise<ITunesResult | null> {
  const url = `https://itunes.apple.com/lookup?id=${trackId}&entity=song`;
  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  if (data.results && data.results.length > 0) {
    return data.results.find(
      (r: ITunesResult) => r.trackId === trackId
    ) || data.results[0];
  }
  return null;
}
