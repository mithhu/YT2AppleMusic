/**
 * 🔒 SECURE Community Database Integration
 *
 * This version uses ONLY secure RPC functions to prevent direct table access.
 * No one can use SELECT * to see your data - all access is controlled by secure functions.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Community Supabase project - shared by all users
// This enables a true community database where everyone contributes
export const SUPABASE_CONFIG = {
  url: "https://rqdqzajpstsibfmghkcj.supabase.co",

  // Supabase anon/public key - safe to expose in client-side code
  // This key only allows access to secure RPC functions, NOT direct table access
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZHF6YWpwc3RzaWJmbWdoa2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5Mjk4MzYsImV4cCI6MjA3MjUwNTgzNn0.o046QJ5OJIrdSn1y9hlqDSsXSKDeV7lgHr9ECx52iCI",
};

// Validate configuration
export const isSupabaseConfigured = (): boolean => {
  return (
    SUPABASE_CONFIG.url !== "" &&
    SUPABASE_CONFIG.anonKey !== "" &&
    SUPABASE_CONFIG.url.includes("supabase.co") &&
    SUPABASE_CONFIG.anonKey.startsWith("eyJ") // JWT tokens start with eyJ
  );
};

export interface CommunityMapping {
  id: number;
  youtubeId: string;
  appleMusicId: string;
  youtubeTitle: string;
  youtubeChannel: string;
  appleMusicArtist: string;
  appleMusicSong: string;
  confidenceScore: number;
  userConfirmations: number;
  userRejections: number;
  createdAt: string;
}

export interface CommunityStats {
  totalMappings: number;
  highConfidenceMappings: number;
  userContributions: number;
}

export class CommunityDatabase {
  private static supabase: SupabaseClient | null = null;
  private static readonly CONFIDENCE_THRESHOLD = 0.5; // Relaxed: 50% confidence
  private static readonly MIN_CONFIRMATIONS = 1; // Relaxed: 1 confirmation

  /**
   * Initialize the community database connection
   */
  static init(url?: string, anonKey?: string): void {
    try {
      const supabaseUrl = url || SUPABASE_CONFIG.url;
      const supabaseKey = anonKey || SUPABASE_CONFIG.anonKey;

      if (!supabaseUrl || !supabaseKey) {
        console.warn("🚫 Supabase configuration missing");
        return;
      }

      console.log("🔗 Initializing secure community database connection...");
      this.supabase = createClient(supabaseUrl, supabaseKey);

      // Test connectivity with secure function
      this.testConnection();
      console.log("✅ Community database initialized securely");
    } catch (error) {
      console.error("❌ Failed to initialize community database:", error);
      this.supabase = null;
    }
  }

  /**
   * Test database connectivity using secure function
   */
  private static async testConnection(): Promise<void> {
    try {
      if (!this.supabase) return;

      const { data, error } = await this.supabase.rpc("get_community_stats");

      if (error) {
        console.error("❌ Community database connectivity test failed:", error);
      } else {
        console.log("✅ Community database connectivity test passed:", data);
      }
    } catch (error) {
      console.error("❌ Community database connectivity error:", error);
    }
  }

  /**
   * Get or create anonymous user ID
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
   * 🔒 SECURE: Find mapping using RPC function (only returns high-confidence mappings)
   */
  static async findMapping(
    youtubeId: string,
  ): Promise<CommunityMapping | null> {
    if (!this.supabase) {
      console.warn("🚫 Community database not initialized");
      return null;
    }

    try {
      console.log(`🔍 Looking up community mapping for: ${youtubeId}`);

      // Use secure RPC function - no direct table access possible
      const { data, error } = await this.supabase.rpc("find_mapping", {
        youtube_video_id: youtubeId,
      });

      if (error) {
        console.error("❌ Community database lookup error:", {
          code: error.code,
          message: error.message,
          youtubeId: youtubeId,
        });
        return null;
      }

      if (!data || data.length === 0) {
        console.log(`📭 No high-confidence mapping found for: ${youtubeId}`);
        return null;
      }

      const mapping = data[0];
      console.log(`✅ Found community mapping:`, {
        youtubeId,
        appleMusicId: mapping.apple_music_id,
        confidence: mapping.confidence_score,
        confirmations: mapping.user_confirmations,
      });

      // Return only essential data (secure function doesn't expose all fields)
      return {
        id: 0, // ID not exposed by secure function
        youtubeId: youtubeId,
        appleMusicId: mapping.apple_music_id,
        youtubeTitle: "", // Not exposed by secure function
        youtubeChannel: "", // Not exposed by secure function
        appleMusicArtist: "", // Not exposed by secure function
        appleMusicSong: "", // Not exposed by secure function
        confidenceScore: mapping.confidence_score,
        userConfirmations: mapping.user_confirmations,
        userRejections: 0, // Not exposed by secure function
        createdAt: "", // Not exposed by secure function
      };
    } catch (error) {
      console.error("❌ Community database error:", error);
      return null;
    }
  }

  /**
   * 🔒 SECURE: Add new mapping using RPC function
   */
  static async addMapping(
    youtubeId: string,
    appleMusicId: string,
    youtubeTitle: string,
    youtubeChannel: string,
    appleMusicArtist: string,
    appleMusicSong: string,
  ): Promise<CommunityMapping | null> {
    if (!this.supabase) {
      console.warn("🚫 Community database not initialized");
      return null;
    }

    try {
      const userId = await this.getUserId();
      console.log(`🌐 Adding new community mapping for: ${youtubeId}`);

      // Parameters must match exact order and names from schema
      const params = {
        youtube_video_id: youtubeId,
        apple_music_track_id: appleMusicId,
        youtube_video_title: youtubeTitle,
        youtube_video_channel: youtubeChannel,
        apple_music_track_artist: appleMusicArtist,
        apple_music_track_song: appleMusicSong,
        user_id: userId,
      };
      console.log("🔍 Adding mapping:", { youtubeId, appleMusicId });
      console.log("🔍 RPC params:", params);

      // Use secure RPC function with exact parameter names from database
      const { data, error } = await this.supabase.rpc("add_mapping", params);

      if (error) {
        console.error("❌ Community database add error:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          youtubeId: youtubeId,
        });
        console.error("❌ Full add mapping error:", error);
        return null;
      }

      if (!data || data === 0) {
        console.log(
          `📭 Mapping already exists for: ${youtubeId} (this is normal, not an error)`,
        );
        // Return a success object even though mapping already exists
        return {
          id: 0,
          youtubeId,
          appleMusicId,
          youtubeTitle,
          youtubeChannel,
          appleMusicArtist,
          appleMusicSong,
          confidenceScore: 0.5,
          userConfirmations: 0, // Existing mappings start with 0 confirmations
          userRejections: 0,
          createdAt: new Date().toISOString(),
        };
      }

      console.log(`✅ Added new community mapping:`, {
        youtubeId,
        appleMusicId,
        mappingId: data,
      });

      // Return minimal mapping data
      return {
        id: data,
        youtubeId,
        appleMusicId,
        youtubeTitle,
        youtubeChannel,
        appleMusicArtist,
        appleMusicSong,
        confidenceScore: 0.5,
        userConfirmations: 0, // New mappings start with 0 confirmations
        userRejections: 0,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Community database error:", error);
      return null;
    }
  }

  /**
   * 🔒 SECURE: Confirm mapping using RPC function
   */
  static async confirmMapping(youtubeId: string): Promise<boolean> {
    if (!this.supabase) {
      console.warn("🚫 Community database not initialized");
      return false;
    }

    try {
      const userId = await this.getUserId();
      console.log(`👍 Confirming mapping for: ${youtubeId}`);

      // Use secure RPC function - no direct table access possible
      const { data, error } = await this.supabase.rpc("confirm_mapping", {
        youtube_video_id: youtubeId,
        user_id: userId,
      });

      if (error) {
        console.error("❌ Community database confirm error:", {
          code: error.code,
          message: error.message,
          youtubeId: youtubeId,
        });
        return false;
      }

      if (data) {
        console.log(`✅ Confirmed mapping for: ${youtubeId}`);
        return true;
      } else {
        console.log(
          `📭 Could not confirm mapping for: ${youtubeId} (already voted or not found)`,
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Community database error:", error);
      return false;
    }
  }

  /**
   * 🔒 SECURE: Reject mapping using RPC function
   */
  static async rejectMapping(youtubeId: string): Promise<boolean> {
    if (!this.supabase) {
      console.warn("🚫 Community database not initialized");
      return false;
    }

    try {
      const userId = await this.getUserId();
      console.log(`👎 Rejecting mapping for: ${youtubeId}`);

      // Use secure RPC function - no direct table access possible
      const { data, error } = await this.supabase.rpc("reject_mapping", {
        youtube_video_id: youtubeId,
        user_id: userId,
      });

      if (error) {
        console.error("❌ Community database reject error:", {
          code: error.code,
          message: error.message,
          youtubeId: youtubeId,
        });
        return false;
      }

      if (data) {
        console.log(`✅ Rejected mapping for: ${youtubeId}`);
        return true;
      } else {
        console.log(
          `📭 Could not reject mapping for: ${youtubeId} (already voted or not found)`,
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Community database error:", error);
      return false;
    }
  }

  /**
   * 🔒 SECURE: Unmap (remove) a mapping using RPC function
   */
  static async unmapMapping(youtubeId: string): Promise<boolean> {
    if (!this.supabase) {
      console.warn("🚫 Community database not initialized");
      return false;
    }

    try {
      const userId = await this.getUserId();
      console.log(`🗑️ Unmapping (removing) mapping for: ${youtubeId}`);

      // Use secure RPC function - no direct table access possible
      const { data, error } = await this.supabase.rpc("unmap_mapping", {
        youtube_video_id: youtubeId,
        user_id: userId,
      });

      if (error) {
        console.error("❌ Community database unmap error:", {
          code: error.code,
          message: error.message,
          youtubeId: youtubeId,
        });
        return false;
      }

      if (data) {
        console.log(`✅ Successfully unmapped: ${youtubeId}`);
        return true;
      } else {
        console.log(
          `📭 Could not unmap mapping for: ${youtubeId} (not found or no permission)`,
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Community database error:", error);
      return false;
    }
  }

  /**
   * 🔒 SECURE: Get community stats using RPC function (only aggregated data)
   */
  static async getStats(): Promise<CommunityStats> {
    if (!this.supabase) {
      console.warn("🚫 Community database not initialized");
      return {
        totalMappings: 0,
        highConfidenceMappings: 0,
        userContributions: 0,
      };
    }

    try {
      console.log("📊 Getting community stats...");

      // Use secure RPC function - only returns aggregated data
      const { data, error } = await this.supabase.rpc("get_community_stats");

      if (error) {
        console.error("❌ Community database stats error:", {
          code: error.code,
          message: error.message,
        });
        return {
          totalMappings: 0,
          highConfidenceMappings: 0,
          userContributions: 0,
        };
      }

      if (!data || data.length === 0) {
        console.log("📭 No community stats available");
        return {
          totalMappings: 0,
          highConfidenceMappings: 0,
          userContributions: 0,
        };
      }

      const stats = data[0];

      // Get user's personal contribution count
      const userId = await this.getUserId();
      const { data: userContribData, error: userError } =
        await this.supabase.rpc("get_user_contributions", {
          user_id: userId,
        });

      const userContributions = userError ? 0 : userContribData || 0;

      const result = {
        totalMappings: parseInt(stats.total_mappings) || 0,
        highConfidenceMappings: parseInt(stats.high_confidence_mappings) || 0,
        userContributions: parseInt(userContributions) || 0,
      };

      console.log("✅ Community stats:", result);
      return result;
    } catch (error) {
      console.error("❌ Community database error:", error);
      return {
        totalMappings: 0,
        highConfidenceMappings: 0,
        userContributions: 0,
      };
    }
  }
}

export default CommunityDatabase;
