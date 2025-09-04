import { createClient } from "@supabase/supabase-js";
import { SUPABASE_CONFIG, isSupabaseConfigured } from "../config/supabase";
import { MusicData } from "../types";
import { CommunityMapping } from "../utils/communityDb";

/**
 * Supabase Helper for Content Script
 *
 * This runs in the content script context which has full network access,
 * unlike the service worker which has network limitations.
 */
export class ContentSupabaseHelper {
  private static supabase: any = null;
  private static initialized = false;

  /**
   * Initialize Supabase client in content script context
   */
  static async init(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      if (!isSupabaseConfigured()) {
        console.warn(
          "⚠️ Supabase not configured - community database disabled",
        );
        return false;
      }

      this.supabase = createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey,
      );
      console.log("🌐 Content script Supabase initialized");

      // Test connectivity
      const { data, error } = await this.supabase
        .from("song_mappings")
        .select("id")
        .limit(1);

      if (error) {
        console.error(
          "❌ Content script database connectivity test failed:",
          error,
        );
        return false;
      } else {
        console.log("✅ Content script database connectivity test passed");
        this.initialized = true;
        return true;
      }
    } catch (error) {
      console.error("❌ Failed to initialize content script Supabase:", error);
      return false;
    }
  }

  /**
   * Find a community mapping
   */
  static async findMapping(
    youtubeId: string,
  ): Promise<CommunityMapping | null> {
    if (!this.initialized || !this.supabase) {
      console.warn("🚫 Content script Supabase not initialized");
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from("song_mappings")
        .select("*")
        .eq("youtube_id", youtubeId)
        .gte("confidence_score", 0.7)
        .gte("user_confirmations", 2)
        .order("confidence_score", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("❌ Content script error finding mapping:", error);
        return null;
      }

      if (data) {
        console.log(
          `🌐 Content script found community mapping for ${youtubeId}:`,
          {
            appleMusicId: data.apple_music_id,
            confidence: data.confidence_score,
            confirmations: data.user_confirmations,
          },
        );
      }

      return data;
    } catch (error) {
      console.error("❌ Content script database error:", error);
      return null;
    }
  }

  /**
   * Add a new mapping
   */
  static async addMapping(
    youtubeId: string,
    appleMusicId: string,
    musicData: MusicData,
    appleMusicArtist: string,
    appleMusicSong: string,
  ): Promise<CommunityMapping | null> {
    if (!this.initialized || !this.supabase) {
      console.warn("🚫 Content script Supabase not initialized");
      return null;
    }

    try {
      // Get user ID from Chrome storage
      const result = await chrome.storage.local.get(["yt2apple_user_id"]);
      let userId = result.yt2apple_user_id;

      if (!userId) {
        userId =
          "user_" +
          Math.random().toString(36).substr(2, 9) +
          Date.now().toString(36);
        await chrome.storage.local.set({ yt2apple_user_id: userId });
      }

      const mapping = {
        youtube_id: youtubeId,
        apple_music_id: appleMusicId,
        youtube_title: musicData.title,
        youtube_channel: musicData.channel,
        apple_music_artist: appleMusicArtist,
        apple_music_song: appleMusicSong,
        confidence_score: musicData.confidence,
        user_confirmations: 1,
        user_rejections: 0,
        created_by: userId,
      };

      const { data, error } = await this.supabase
        .from("song_mappings")
        .insert(mapping)
        .select()
        .single();

      if (error) {
        console.error("❌ Content script error adding mapping:", error);
        return null;
      }

      console.log(`🌐 Content script added new community mapping:`, {
        youtubeId,
        appleMusicId,
        mappingId: data.id,
      });

      return data;
    } catch (error) {
      console.error("❌ Content script error adding mapping:", error);
      return null;
    }
  }

  /**
   * Get community stats
   */
  static async getStats(): Promise<{
    totalMappings: number;
    highConfidenceMappings: number;
    userContributions: number;
  }> {
    if (!this.initialized || !this.supabase) {
      return {
        totalMappings: 0,
        highConfidenceMappings: 0,
        userContributions: 0,
      };
    }

    try {
      // Get user ID from Chrome storage
      const result = await chrome.storage.local.get(["yt2apple_user_id"]);
      const userId = result.yt2apple_user_id || "unknown";

      const [mappingsResult, highConfidenceResult, contributionsResult] =
        await Promise.all([
          this.supabase
            .from("song_mappings")
            .select("id", { count: "exact", head: true }),
          this.supabase
            .from("song_mappings")
            .select("id", { count: "exact", head: true })
            .gte("confidence_score", 0.7)
            .gte("user_confirmations", 2),
          this.supabase
            .from("user_contributions")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId),
        ]);

      return {
        totalMappings: mappingsResult.count || 0,
        highConfidenceMappings: highConfidenceResult.count || 0,
        userContributions: contributionsResult.count || 0,
      };
    } catch (error) {
      console.error("❌ Content script error getting stats:", error);
      return {
        totalMappings: 0,
        highConfidenceMappings: 0,
        userContributions: 0,
      };
    }
  }

  /**
   * Confirm a mapping
   */
  static async confirmMapping(youtubeId: string): Promise<boolean> {
    if (!this.initialized || !this.supabase) {
      return false;
    }

    try {
      // Get user ID from Chrome storage
      const result = await chrome.storage.local.get(["yt2apple_user_id"]);
      const userId = result.yt2apple_user_id || "unknown";

      // Find the mapping
      const { data: mapping } = await this.supabase
        .from("song_mappings")
        .select("id")
        .eq("youtube_id", youtubeId)
        .single();

      if (!mapping) return false;

      // Add user contribution
      await this.supabase.from("user_contributions").insert({
        user_id: userId,
        mapping_id: mapping.id,
        action: "confirm",
      });

      // Update mapping confirmations
      await this.supabase
        .from("song_mappings")
        .update({
          user_confirmations: this.supabase.sql`user_confirmations + 1`,
        })
        .eq("id", mapping.id);

      console.log(`✅ Content script confirmed mapping for ${youtubeId}`);
      return true;
    } catch (error) {
      console.error("❌ Content script error confirming mapping:", error);
      return false;
    }
  }
}
