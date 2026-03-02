import { NextRequest, NextResponse } from "next/server";
import {
  findMappingByYoutubeId,
  findYoutubeIdByAppleMusicId,
  addMappingFromWebsite,
} from "@/lib/supabase";
import {
  searchItunes,
  getAppleMusicUrl,
  getArtworkUrl,
  lookupByTrackId,
} from "@/lib/itunes";
import {
  extractYoutubeId,
  getYoutubeInfo,
  getYoutubeUrl,
  cleanTitle,
} from "@/lib/youtube";

export interface SearchResult {
  query: string;
  type: "song_search" | "youtube_url";
  appleMusicResults: AppleMusicResult[];
  youtubeResult: YouTubeResult | null;
  source: "community_db" | "itunes_api";
}

export interface AppleMusicResult {
  trackId: number;
  name: string;
  artist: string;
  album: string;
  artwork: string;
  url: string;
  nativeUrl: string;
  previewUrl: string;
  youtubeUrl: string | null;
}

export interface YouTubeResult {
  videoId: string;
  title: string;
  channel: string;
  thumbnail: string;
  url: string;
}

function buildAppleMusicResult(
  trackId: number,
  name: string,
  artist: string,
  album: string,
  artwork: string,
  previewUrl: string,
  youtubeUrl: string | null = null
): AppleMusicResult {
  return {
    trackId,
    name,
    artist,
    album,
    artwork,
    url: `https://music.apple.com/us/song/${trackId}`,
    nativeUrl: `itmss://music.apple.com/us/song/${trackId}`,
    previewUrl,
    youtubeUrl,
  };
}

function youtubeSearchFallback(artist: string, name: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${artist} ${name} official music video`
  )}`;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing query parameter ?q=" },
      { status: 400 }
    );
  }

  const youtubeId = extractYoutubeId(query.trim());

  if (youtubeId) {
    return handleYoutubeSearch(youtubeId);
  } else {
    return handleSongSearch(query.trim());
  }
}

async function handleYoutubeSearch(youtubeId: string): Promise<NextResponse> {
  const youtubeInfo = await getYoutubeInfo(youtubeId);

  const youtubeResult: YouTubeResult | null = youtubeInfo
    ? {
        videoId: youtubeId,
        title: youtubeInfo.title,
        channel: youtubeInfo.author_name,
        thumbnail: youtubeInfo.thumbnail_url,
        url: getYoutubeUrl(youtubeId),
      }
    : null;

  // Priority 1: Check our community database
  const dbMapping = await findMappingByYoutubeId(youtubeId);
  if (dbMapping) {
    const trackId = parseInt(dbMapping.appleMusicId) || 0;
    const result: SearchResult = {
      query: youtubeId,
      type: "youtube_url",
      appleMusicResults: [
        buildAppleMusicResult(
          trackId,
          dbMapping.appleMusicSong,
          dbMapping.appleMusicArtist,
          "",
          "",
          "",
          getYoutubeUrl(youtubeId)
        ),
      ],
      youtubeResult,
      source: "community_db",
    };

    const enriched = await enrichFromItunes(result);
    return NextResponse.json(enriched);
  }

  // Priority 2: Extract title from YouTube and search iTunes
  if (!youtubeInfo) {
    return NextResponse.json({
      query: youtubeId,
      type: "youtube_url",
      appleMusicResults: [],
      youtubeResult: null,
      source: "itunes_api",
    } satisfies SearchResult);
  }

  const searchQuery = cleanTitle(youtubeInfo.title);
  const itunesResults = await searchItunes(searchQuery, 3);

  const appleMusicResults: AppleMusicResult[] = itunesResults.map((r) =>
    buildAppleMusicResult(
      r.trackId,
      r.trackName,
      r.artistName,
      r.collectionName,
      getArtworkUrl(r.artworkUrl100),
      r.previewUrl || "",
      getYoutubeUrl(youtubeId)
    )
  );

  // Auto-push the top result to community DB (fire-and-forget).
  // This grows the database passively from website usage.
  if (itunesResults.length > 0) {
    const top = itunesResults[0];
    addMappingFromWebsite({
      youtubeId,
      appleMusicId: top.trackId.toString(),
      youtubeTitle: youtubeInfo.title,
      youtubeChannel: youtubeInfo.author_name,
      appleMusicArtist: top.artistName,
      appleMusicSong: top.trackName,
    });
  }

  return NextResponse.json({
    query: youtubeInfo.title,
    type: "youtube_url",
    appleMusicResults,
    youtubeResult,
    source: "itunes_api",
  } satisfies SearchResult);
}

async function handleSongSearch(query: string): Promise<NextResponse> {
  const itunesResults = await searchItunes(query, 5);

  // For each result, try to find a YouTube video from our DB
  const appleMusicResults: AppleMusicResult[] = await Promise.all(
    itunesResults.map(async (r) => {
      const dbYoutubeId = await findYoutubeIdByAppleMusicId(
        r.trackId.toString()
      );

      const youtubeUrl = dbYoutubeId
        ? getYoutubeUrl(dbYoutubeId)
        : youtubeSearchFallback(r.artistName, r.trackName);

      return buildAppleMusicResult(
        r.trackId,
        r.trackName,
        r.artistName,
        r.collectionName,
        getArtworkUrl(r.artworkUrl100),
        r.previewUrl || "",
        youtubeUrl
      );
    })
  );

  return NextResponse.json({
    query,
    type: "song_search",
    appleMusicResults,
    youtubeResult: null,
    source: "itunes_api",
  } satisfies SearchResult);
}

async function enrichFromItunes(result: SearchResult): Promise<SearchResult> {
  if (result.appleMusicResults.length === 0) return result;

  const first = result.appleMusicResults[0];

  if (first.trackId) {
    const itunes = await lookupByTrackId(first.trackId);
    if (itunes) {
      result.appleMusicResults[0] = {
        ...first,
        name: first.name || itunes.trackName,
        artist: first.artist || itunes.artistName,
        album: first.album || itunes.collectionName,
        artwork: getArtworkUrl(itunes.artworkUrl100),
        previewUrl: first.previewUrl || itunes.previewUrl || "",
      };
      return result;
    }
  }

  if (first.artist && first.name) {
    const itunesResults = await searchItunes(
      `${first.artist} ${first.name}`,
      1
    );
    if (itunesResults.length > 0) {
      const itunes = itunesResults[0];
      result.appleMusicResults[0] = {
        ...first,
        album: first.album || itunes.collectionName,
        artwork: getArtworkUrl(itunes.artworkUrl100),
        previewUrl: first.previewUrl || itunes.previewUrl || "",
      };
    }
  }

  return result;
}
