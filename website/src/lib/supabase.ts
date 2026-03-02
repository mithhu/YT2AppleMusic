import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rqdqzajpstsibfmghkcj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZHF6YWpwc3RzaWJmbWdoa2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5Mjk4MzYsImV4cCI6MjA3MjUwNTgzNn0.o046QJ5OJIrdSn1y9hlqDSsXSKDeV7lgHr9ECx52iCI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface MappingResult {
  appleMusicId: string;
  appleMusicArtist: string;
  appleMusicSong: string;
  youtubeId: string;
  youtubeTitle: string;
  confidenceScore: number;
}

export async function findMappingByYoutubeId(
  youtubeId: string
): Promise<MappingResult | null> {
  const { data, error } = await supabase.rpc("find_mapping", {
    youtube_video_id: youtubeId,
  });

  if (error || !data || data.length === 0) return null;

  const mapping = data[0];
  return {
    appleMusicId: mapping.apple_music_id,
    appleMusicArtist: mapping.apple_music_artist || "",
    appleMusicSong: mapping.apple_music_song || "",
    youtubeId,
    youtubeTitle: mapping.youtube_title || "",
    confidenceScore: mapping.confidence_score,
  };
}

/**
 * Reverse lookup: find YouTube video ID for an Apple Music track ID.
 * Uses the find_mapping RPC to search by Apple Music ID.
 * Falls back to null if no mapping exists.
 */
export async function findYoutubeIdByAppleMusicId(
  appleMusicId: string
): Promise<string | null> {
  // The secure RPC only supports YouTube ID lookup, so we query
  // the community_stats-style approach won't work here.
  // For now, we'll use a direct RPC if available, otherwise null.
  try {
    const { data, error } = await supabase.rpc("find_mapping_by_apple_music", {
      apple_music_track_id: appleMusicId,
    });

    if (error || !data || data.length === 0) return null;
    return data[0].youtube_id || null;
  } catch {
    return null;
  }
}

/**
 * Add a new mapping to the community DB from website usage.
 * Uses a "website" user ID so these can be distinguished from
 * extension-contributed mappings. Runs fire-and-forget — failures
 * are silently ignored so they don't slow down search results.
 */
export async function addMappingFromWebsite(params: {
  youtubeId: string;
  appleMusicId: string;
  youtubeTitle: string;
  youtubeChannel: string;
  appleMusicArtist: string;
  appleMusicSong: string;
}): Promise<void> {
  try {
    await supabase.rpc("add_mapping", {
      youtube_video_id: params.youtubeId,
      apple_music_track_id: params.appleMusicId,
      youtube_video_title: params.youtubeTitle,
      youtube_video_channel: params.youtubeChannel,
      apple_music_track_artist: params.appleMusicArtist,
      apple_music_track_song: params.appleMusicSong,
      user_id: "website_auto",
    });
  } catch {
    // Silently ignore — don't block search results
  }
}
