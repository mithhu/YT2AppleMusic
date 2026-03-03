import { NextRequest, NextResponse } from "next/server";
import { findMappingByYoutubeId, addMappingFromWebsite } from "@/lib/supabase";
import { searchItunes, getArtworkUrl } from "@/lib/itunes";
import {
  extractYoutubeId,
  extractPlaylistId,
  getPlaylistVideoIds,
  getYoutubeInfo,
  getYoutubeUrl,
  cleanTitle,
} from "@/lib/youtube";

export interface BulkItem {
  youtubeId: string;
  youtubeTitle: string;
  youtubeChannel: string;
  youtubeUrl: string;
  appleMusicTrackId: number | null;
  appleMusicName: string | null;
  appleMusicArtist: string | null;
  appleMusicAlbum: string | null;
  appleMusicArtwork: string | null;
  appleMusicUrl: string | null;
  appleMusicNativeUrl: string | null;
  source: "community_db" | "itunes_api" | "not_found";
  error: string | null;
}

const MAX_URLS = 50;

async function processOneVideo(youtubeId: string): Promise<BulkItem> {
  const base: BulkItem = {
    youtubeId,
    youtubeTitle: "",
    youtubeChannel: "",
    youtubeUrl: getYoutubeUrl(youtubeId),
    appleMusicTrackId: null,
    appleMusicName: null,
    appleMusicArtist: null,
    appleMusicAlbum: null,
    appleMusicArtwork: null,
    appleMusicUrl: null,
    appleMusicNativeUrl: null,
    source: "not_found",
    error: null,
  };

  try {
    const [youtubeInfo, dbMapping] = await Promise.all([
      getYoutubeInfo(youtubeId),
      findMappingByYoutubeId(youtubeId),
    ]);

    if (youtubeInfo) {
      base.youtubeTitle = youtubeInfo.title;
      base.youtubeChannel = youtubeInfo.author_name;
    }

    if (dbMapping) {
      const trackId = parseInt(dbMapping.appleMusicId) || 0;
      base.appleMusicTrackId = trackId;
      base.appleMusicName = dbMapping.appleMusicSong;
      base.appleMusicArtist = dbMapping.appleMusicArtist;
      base.appleMusicUrl = `https://music.apple.com/us/song/${trackId}`;
      base.appleMusicNativeUrl = `itmss://music.apple.com/us/song/${trackId}`;
      base.source = "community_db";
      return base;
    }

    if (!youtubeInfo) {
      base.error = "Could not fetch YouTube video info";
      return base;
    }

    const searchQuery = cleanTitle(youtubeInfo.title);
    const itunesResults = await searchItunes(searchQuery, 1);

    if (itunesResults.length === 0) {
      return base;
    }

    const top = itunesResults[0];
    base.appleMusicTrackId = top.trackId;
    base.appleMusicName = top.trackName;
    base.appleMusicArtist = top.artistName;
    base.appleMusicAlbum = top.collectionName;
    base.appleMusicArtwork = getArtworkUrl(top.artworkUrl100);
    base.appleMusicUrl = `https://music.apple.com/us/song/${top.trackId}`;
    base.appleMusicNativeUrl = `itmss://music.apple.com/us/song/${top.trackId}`;
    base.source = "itunes_api";

    addMappingFromWebsite({
      youtubeId,
      appleMusicId: top.trackId.toString(),
      youtubeTitle: youtubeInfo.title,
      youtubeChannel: youtubeInfo.author_name,
      appleMusicArtist: top.artistName,
      appleMusicSong: top.trackName,
    });

    return base;
  } catch {
    base.error = "Processing failed";
    return base;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls } = body as { urls: string[] };

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: "Provide an array of YouTube URLs in { urls: [...] }" },
        { status: 400 },
      );
    }

    const videoIds: string[] = [];
    const invalid: string[] = [];

    for (const url of urls) {
      const trimmed = url.trim();
      const id = extractYoutubeId(trimmed);
      if (id) {
        videoIds.push(id);
        continue;
      }

      const playlistId = extractPlaylistId(trimmed);
      if (playlistId) {
        const playlistIds = await getPlaylistVideoIds(playlistId);
        videoIds.push(...playlistIds);
        continue;
      }

      invalid.push(trimmed);
    }

    const unique = [...new Set(videoIds)].slice(0, MAX_URLS);

    // Process in batches of 5 to avoid overwhelming external APIs
    const BATCH_SIZE = 5;
    const results: BulkItem[] = [];

    for (let i = 0; i < unique.length; i += BATCH_SIZE) {
      const batch = unique.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((id) => processOneVideo(id)),
      );
      results.push(...batchResults);
    }

    return NextResponse.json({
      results,
      total: unique.length,
      matched: results.filter((r) => r.source !== "not_found").length,
      invalid,
    });
  } catch {
    return NextResponse.json(
      { error: "Bulk processing failed" },
      { status: 500 },
    );
  }
}
