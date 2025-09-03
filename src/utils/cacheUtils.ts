import { MusicData } from "../types";

export interface CacheEntry {
  youtubeId: string;
  appleMusicSongId: string;
  artist: string;
  songTitle: string;
  timestamp: number;
  confirmed: boolean;
}

export class CacheUtils {
  private static readonly CACHE_KEY = "youtube_apple_music_cache";
  private static cache: Map<string, CacheEntry> = new Map();
  private static isLoaded = false;

  /**
   * Load cache from Chrome storage
   */
  static async loadCache(): Promise<CacheEntry[]> {
    if (!this.isLoaded) {
      try {
        const result = await chrome.storage.local.get([this.CACHE_KEY]);
        const cacheData = result[this.CACHE_KEY];

        if (cacheData) {
          // Parse the cache data
          const entries: CacheEntry[] = JSON.parse(cacheData);
          this.cache.clear();

          entries.forEach((entry) => {
            this.cache.set(entry.youtubeId, entry);
          });

          console.log(
            `📁 Loaded ${entries.length} cached YouTube → Apple Music mappings`,
          );
        }
      } catch (error) {
        console.error("Error loading cache:", error);
      }

      this.isLoaded = true;
    }

    // Return array of cache entries
    return Array.from(this.cache.values());
  }

  /**
   * Save cache to Chrome storage
   */
  static async saveCache(): Promise<void> {
    try {
      const entries = Array.from(this.cache.values());
      const cacheData = JSON.stringify(entries);

      await chrome.storage.local.set({
        [this.CACHE_KEY]: cacheData,
      });

      console.log(`💾 Saved ${entries.length} cached mappings to storage`);
    } catch (error) {
      console.error("Error saving cache:", error);
    }
  }

  /**
   * Check if we have a cached Apple Music song ID for this YouTube video
   */
  static async getCachedSongId(youtubeId: string): Promise<string | null> {
    await this.loadCache();

    const entry = this.cache.get(youtubeId);
    if (entry && entry.confirmed) {
      console.log(
        `🎯 Found cached Apple Music song ID for YouTube ${youtubeId}: ${entry.appleMusicSongId}`,
      );
      return entry.appleMusicSongId;
    }

    return null;
  }

  /**
   * Add a new cache entry (unconfirmed initially)
   */
  static async addCacheEntry(
    youtubeId: string,
    appleMusicSongId: string,
    musicData: MusicData,
  ): Promise<void> {
    await this.loadCache();

    const entry: CacheEntry = {
      youtubeId,
      appleMusicSongId,
      artist: musicData.artist,
      songTitle: musicData.songTitle,
      timestamp: Date.now(),
      confirmed: false,
    };

    this.cache.set(youtubeId, entry);
    await this.saveCache();

    console.log(
      `📝 Added unconfirmed cache entry: YouTube ${youtubeId} → Apple Music ${appleMusicSongId}`,
    );
  }

  /**
   * Confirm a cache entry as correct
   */
  static async confirmCacheEntry(youtubeId: string): Promise<void> {
    await this.loadCache();

    const entry = this.cache.get(youtubeId);
    if (entry) {
      entry.confirmed = true;
      entry.timestamp = Date.now(); // Update timestamp
      await this.saveCache();

      console.log(
        `✅ Confirmed cache entry: YouTube ${youtubeId} → Apple Music ${entry.appleMusicSongId}`,
      );
    }
  }

  /**
   * Remove a cache entry (if user says it was wrong)
   */
  static async removeCacheEntry(youtubeId: string): Promise<void> {
    await this.loadCache();

    if (this.cache.has(youtubeId)) {
      this.cache.delete(youtubeId);
      await this.saveCache();

      console.log(`❌ Removed incorrect cache entry for YouTube ${youtubeId}`);
    }
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{ total: number; confirmed: number }> {
    await this.loadCache();

    const total = this.cache.size;
    const confirmed = Array.from(this.cache.values()).filter(
      (entry) => entry.confirmed,
    ).length;

    return { total, confirmed };
  }

  /**
   * Export cache as text for debugging
   */
  static async exportCacheAsText(): Promise<string> {
    await this.loadCache();

    const entries = Array.from(this.cache.values());
    let text = `YouTube to Apple Music Cache Export\n`;
    text += `Generated: ${new Date().toISOString()}\n`;
    text += `Total entries: ${entries.length}\n\n`;

    entries.forEach((entry) => {
      text += `YouTube ID: ${entry.youtubeId}\n`;
      text += `Apple Music Song ID: ${entry.appleMusicSongId}\n`;
      text += `Artist: ${entry.artist}\n`;
      text += `Song: ${entry.songTitle}\n`;
      text += `Confirmed: ${entry.confirmed ? "Yes" : "No"}\n`;
      text += `Date: ${new Date(entry.timestamp).toISOString()}\n`;
      text += `---\n\n`;
    });

    return text;
  }
}
