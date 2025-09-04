import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { MusicData } from "../types";

// Community database interfaces
export interface CommunityMapping {
  id?: number;
  youtube_id: string;
  apple_music_id: string;
  youtube_title: string;
  youtube_channel: string;
  apple_music_artist: string;
  apple_music_song: string;
  confidence_score: number;
  user_confirmations: number;
  user_rejections: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserContribution {
  id?: number;
  user_id: string;
  mapping_id: number;
  action: "confirm" | "reject" | "submit";
  created_at?: string;
}

export class CommunityDatabase {
  private static supabase: SupabaseClient | null = null;
  private static readonly CONFIDENCE_THRESHOLD = 0.7; // 70% confidence required
  private static readonly MIN_CONFIRMATIONS = 2; // Minimum confirmations needed

  /**
   * Initialize Supabase client
   */
  static async init(supabaseUrl: string, supabaseKey: string) {
    try {
      this.supabase = createClient(supabaseUrl, supabaseKey);
      console.log("🌐 Community database initialized");
      console.log("🔗 Supabase URL:", supabaseUrl);
      console.log(
        "🔑 Supabase Key (first 20 chars):",
        supabaseKey.substring(0, 20) + "...",
      );

      // Test connectivity with a simple query
      try {
        const { data, error } = await this.supabase
          .from("song_mappings")
          .select("id")
          .limit(1);

        if (error) {
          console.error("❌ Database connectivity test failed:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          // Don't fail initialization - just log the error
          console.warn(
            "⚠️ Community database will be disabled due to connectivity issues",
          );
        } else {
          console.log("✅ Database connectivity test passed");
        }
      } catch (networkError) {
        console.error(
          "❌ Network error during connectivity test:",
          networkError,
        );
        console.warn(
          "⚠️ Community database will be disabled due to network issues",
        );
        // Don't set this.supabase = null here - keep it for retry attempts
      }
    } catch (error) {
      console.error("❌ Failed to create Supabase client:", error);
      this.supabase = null;
    }
  }

  /**
   * Get anonymous user ID (consistent across sessions)
   */
  private static async getUserId(): Promise<string> {
    try {
      const result = await chrome.storage.local.get(["yt2apple_user_id"]);
      let userId = result.yt2apple_user_id;

      if (!userId) {
        userId =
          "user_" +
          Math.random().toString(36).substr(2, 9) +
          Date.now().toString(36);
        await chrome.storage.local.set({ yt2apple_user_id: userId });
      }

      return userId;
    } catch (error) {
      console.error("Error getting user ID:", error);
      // Fallback to a session-based ID
      return (
        "user_" +
        Math.random().toString(36).substr(2, 9) +
        Date.now().toString(36)
      );
    }
  }

  /**
   * Find a high-confidence mapping in the community database
   */
  static async findMapping(
    youtubeId: string,
  ): Promise<CommunityMapping | null> {
    if (!this.supabase) {
      console.warn("🚫 Community database not initialized");
      return null;
    }

    try {
      const { data, error } = await this.supabase
        .from("song_mappings")
        .select("*")
        .eq("youtube_id", youtubeId)
        .gte("confidence_score", this.CONFIDENCE_THRESHOLD)
        .gte("user_confirmations", this.MIN_CONFIRMATIONS)
        .order("confidence_score", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows found
        console.error("❌ Error finding community mapping:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        return null;
      }

      if (data) {
        console.log(`🌐 Found community mapping for ${youtubeId}:`, {
          appleMusicId: data.apple_music_id,
          confidence: data.confidence_score,
          confirmations: data.user_confirmations,
        });
      }

      return data;
    } catch (error) {
      console.error("❌ Community database error:", error);
      return null;
    }
  }

  /**
   * Add a new mapping to the community database
   */
  static async addMapping(
    youtubeId: string,
    appleMusicId: string,
    musicData: MusicData,
    appleMusicArtist: string,
    appleMusicSong: string,
  ): Promise<CommunityMapping | null> {
    if (!this.supabase) {
      console.warn("🚫 Community database not initialized");
      return null;
    }

    try {
      const mapping: Omit<
        CommunityMapping,
        "id" | "created_at" | "updated_at"
      > = {
        youtube_id: youtubeId,
        apple_music_id: appleMusicId,
        youtube_title: musicData.title,
        youtube_channel: musicData.channel,
        apple_music_artist: appleMusicArtist,
        apple_music_song: appleMusicSong,
        confidence_score: 0.5, // Initial confidence
        user_confirmations: 0,
        user_rejections: 0,
      };

      const { data, error } = await this.supabase
        .from("song_mappings")
        .insert(mapping)
        .select()
        .single();

      if (error) {
        console.error("❌ Error adding community mapping:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          mapping: mapping,
        });
        console.error("❌ Full error object:", error);
        return null;
      }

      console.log(`🌐 Added new community mapping:`, {
        youtubeId,
        appleMusicId,
        mappingId: data.id,
      });

      // Track user contribution
      await this.trackContribution(data.id!, "submit");

      return data;
    } catch (error) {
      console.error("❌ Community database error:", error);
      return null;
    }
  }

  /**
   * Confirm a mapping as correct
   */
  static async confirmMapping(mappingId: number): Promise<boolean> {
    if (!this.supabase) {
      console.warn("🚫 Community database not initialized");
      return false;
    }

    try {
      // Check if user already voted on this mapping
      const userId = await this.getUserId();
      const { data: existingVote } = await this.supabase
        .from("user_contributions")
        .select("action")
        .eq("user_id", userId)
        .eq("mapping_id", mappingId)
        .in("action", ["confirm", "reject"])
        .single();

      if (existingVote) {
        console.log("🔄 User already voted on this mapping");
        return false;
      }

      // Increment confirmations and update confidence
      const { error } = await this.supabase.rpc("confirm_mapping", {
        mapping_id: mappingId,
      });

      if (error) {
        console.error("❌ Error confirming mapping:", error);
        return false;
      }

      // Track user contribution
      await this.trackContribution(mappingId, "confirm");

      console.log(`✅ Confirmed community mapping ${mappingId}`);
      return true;
    } catch (error) {
      console.error("❌ Community database error:", error);
      return false;
    }
  }

  /**
   * Reject a mapping as incorrect
   */
  static async rejectMapping(mappingId: number): Promise<boolean> {
    if (!this.supabase) {
      console.warn("🚫 Community database not initialized");
      return false;
    }

    try {
      // Check if user already voted on this mapping
      const userId = await this.getUserId();
      const { data: existingVote } = await this.supabase
        .from("user_contributions")
        .select("action")
        .eq("user_id", userId)
        .eq("mapping_id", mappingId)
        .in("action", ["confirm", "reject"])
        .single();

      if (existingVote) {
        console.log("🔄 User already voted on this mapping");
        return false;
      }

      // Increment rejections and update confidence
      const { error } = await this.supabase.rpc("reject_mapping", {
        mapping_id: mappingId,
      });

      if (error) {
        console.error("❌ Error rejecting mapping:", error);
        return false;
      }

      // Track user contribution
      await this.trackContribution(mappingId, "reject");

      console.log(`❌ Rejected community mapping ${mappingId}`);
      return true;
    } catch (error) {
      console.error("❌ Community database error:", error);
      return false;
    }
  }

  /**
   * Track user contribution
   */
  private static async trackContribution(
    mappingId: number,
    action: "confirm" | "reject" | "submit",
  ): Promise<void> {
    if (!this.supabase) return;

    try {
      const contribution: Omit<UserContribution, "id" | "created_at"> = {
        user_id: await this.getUserId(),
        mapping_id: mappingId,
        action,
      };

      await this.supabase.from("user_contributions").insert(contribution);

      console.log(
        `📊 Tracked user contribution: ${action} for mapping ${mappingId}`,
      );
    } catch (error) {
      console.error("❌ Error tracking contribution:", error);
    }
  }

  /**
   * Get community database statistics
   */
  static async getStats(): Promise<{
    totalMappings: number;
    highConfidenceMappings: number;
    userContributions: number;
  }> {
    if (!this.supabase) {
      console.warn("🚫 Community database not initialized");
      return {
        totalMappings: 0,
        highConfidenceMappings: 0,
        userContributions: 0,
      };
    }

    try {
      const [mappingsResult, highConfidenceResult, contributionsResult] =
        await Promise.all([
          this.supabase
            .from("song_mappings")
            .select("id", { count: "exact", head: true }),
          this.supabase
            .from("song_mappings")
            .select("id", { count: "exact", head: true })
            .gte("confidence_score", this.CONFIDENCE_THRESHOLD)
            .gte("user_confirmations", this.MIN_CONFIRMATIONS),
          this.supabase
            .from("user_contributions")
            .select("id", { count: "exact", head: true })
            .eq("user_id", await this.getUserId()),
        ]);

      return {
        totalMappings: mappingsResult.count || 0,
        highConfidenceMappings: highConfidenceResult.count || 0,
        userContributions: contributionsResult.count || 0,
      };
    } catch (error) {
      console.error("❌ Error getting community stats:", error);
      // Return fallback stats when database is unavailable
      return {
        totalMappings: 0,
        highConfidenceMappings: 0,
        userContributions: 0,
      };
    }
  }

  /**
   * Search for similar mappings (for duplicate detection)
   */
  static async findSimilarMappings(
    youtubeTitle: string,
    appleMusicArtist: string,
    appleMusicSong: string,
  ): Promise<CommunityMapping[]> {
    if (!this.supabase) {
      console.warn("🚫 Community database not initialized");
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from("song_mappings")
        .select("*")
        .or(
          `youtube_title.ilike.%${youtubeTitle}%,apple_music_artist.ilike.%${appleMusicArtist}%`,
        )
        .limit(5);

      if (error) {
        console.error("❌ Error finding similar mappings:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("❌ Community database error:", error);
      return [];
    }
  }
}
