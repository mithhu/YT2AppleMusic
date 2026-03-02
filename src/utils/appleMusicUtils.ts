import {
  MusicData,
  AppleMusicSearchResult,
  AppleMusicLinkResult,
} from "../types";
import { CacheUtils } from "./cacheUtils";
import { CommunityDatabase } from "./communityDb-secure";

export class AppleMusicUtils {
  private static readonly APPLE_MUSIC_API_BASE =
    "https://api.music.apple.com/v1";
  private static readonly APPLE_MUSIC_WEB_BASE = "https://music.apple.com";

  /**
   * Opens Apple Music app natively using URL schemes
   */
  static async openInNativeApp(musicData: MusicData): Promise<boolean> {
    try {
      const optimizedQuery = this.generateOptimizedQuery(musicData);

      // First try to get direct song link
      const directLink = await this.getDirectLink(
        musicData.artist,
        musicData.songTitle,
        musicData.videoId,
      );

      let schemes = [];

      if (directLink && directLink.url && directLink.url.includes("/song/")) {
        // We have a direct song link - extract song ID (remove any existing parameters)
        const songId = directLink.url.split("/song/")[1].split("?")[0];
        schemes = [
          // Only use iTunes Store redirect - no fallbacks to avoid alert closing
          `itmss://music.apple.com/us/song/${songId}`,
        ];
        console.log(`🎯 Using ONLY itmss scheme for song ID: ${songId}`);
      } else {
        // No direct song found - don't create search URLs for non-music content
        console.log(`❌ No direct song found for: ${optimizedQuery}`);
        console.log(
          `🚫 Skipping search URLs to avoid opening non-music content`,
        );
        return false;
      }

      console.log(`Trying to open Apple Music with query: "${optimizedQuery}"`);
      console.log("Generated Apple Music URLs:");
      schemes.forEach((scheme, index) => {
        console.log(`  ${index + 1}. ${scheme}`);
      });

      // Try each scheme
      for (let i = 0; i < schemes.length; i++) {
        const scheme = schemes[i];
        try {
          console.log(
            `🎵 Attempting scheme ${i + 1}/${schemes.length}: ${scheme}`,
          );

          // Create tab with the URL scheme
          const tab = await chrome.tabs.create({
            url: scheme,
            active: true,
          });

          // NEVER automatically close tabs - let user decide
          console.log(`🎯 Opened ${scheme} - user has full control`);

          if (scheme.startsWith("itmss://")) {
            console.log("⏳ User will see Chrome prompt to open Apple Music");
            console.log("💡 NO automatic actions - user decides everything!");
          }

          return true; // Success - let user handle the prompt
        } catch (error) {
          console.log(`Failed to open with scheme ${i + 1}: ${scheme}`, error);
          continue;
        }
      }

      console.log("All schemes failed, falling back to web browser");
      return false;
    } catch (error) {
      console.error("Error opening Apple Music:", error);
      return false;
    }
  }

  /**
   * Opens Apple Music in web browser
   */
  static async openInWebBrowser(
    musicData: MusicData,
    inBackground = false,
  ): Promise<boolean> {
    try {
      // First try to get a direct song link
      const result = await this.getDirectLink(
        musicData.artist,
        musicData.songTitle,
        musicData.videoId,
      );

      if (result && result.url && result.url.includes("/song/")) {
        // We have a direct song link - open it in web browser
        console.log(`🎯 Opening direct song in web browser: ${result.url}`);
        await chrome.tabs.create({
          url: result.url,
          active: !inBackground,
        });
        return true;
      } else {
        // No direct song found - don't create search URLs for non-music content
        console.log(`❌ No direct song found for web browser opening`);
        console.log(`🚫 Not opening search URLs to avoid non-music content`);
        return false;
      }
    } catch (error) {
      console.error("Error opening Apple Music web:", error);
      return false;
    }
  }

  /**
   * Search Apple Music catalog using their API
   */
  static async searchCatalog(
    query: string,
    limit = 5,
  ): Promise<AppleMusicSearchResult[]> {
    try {
      // Note: This requires Apple Music API key and proper authentication
      // For now, we'll return mock data structure
      // In production, you'd need to implement Apple Music API authentication

      const mockResults: AppleMusicSearchResult[] = [
        {
          id: "1234567890",
          type: "songs",
          attributes: {
            name: query.split(" ").slice(1).join(" ") || "Unknown Song",
            artistName: query.split(" ")[0] || "Unknown Artist",
            albumName: "Unknown Album",
            url: `${this.APPLE_MUSIC_WEB_BASE}/song/1234567890`,
            artwork: {
              url: "https://via.placeholder.com/300x300",
              width: 300,
              height: 300,
            },
          },
        },
      ];

      return mockResults;
    } catch (error) {
      console.error("Error searching Apple Music catalog:", error);
      return [];
    }
  }

  /**
   * Get direct Apple Music link for a song
   */
  static async getDirectLink(
    artist: string,
    songTitle: string,
    youtubeId?: string,
  ): Promise<AppleMusicLinkResult | null> {
    try {
      const searchQuery = `${artist} ${songTitle}`;

      // Check cache first if we have YouTube ID
      if (youtubeId) {
        const cachedSongId = await CacheUtils.getCachedSongId(youtubeId);
        if (cachedSongId) {
          const cachedUrl = `${this.APPLE_MUSIC_WEB_BASE}/us/song/${cachedSongId}`;
          console.log(`🎯 Using cached Apple Music URL: ${cachedUrl}`);

          // Check if this cached entry needs confirmation
          const cache = await CacheUtils.loadCache();
          const cacheEntry = cache.find(
            (entry: any) => entry.youtubeId === youtubeId,
          );
          if (cacheEntry && !cacheEntry.confirmed) {
            console.log(
              "🤔 Cached entry needs confirmation, triggering dialog",
            );
            // Mark that this cached entry needs confirmation
            console.log(
              "🤔 Cached entry needs confirmation - will be handled by background script",
            );
          }

          // Return both URL and confirmation data for background script to handle
          return {
            url: cachedUrl,
            needsConfirmation: cacheEntry ? !cacheEntry.confirmed : false,
            confirmationData:
              cacheEntry && !cacheEntry.confirmed
                ? {
                    youtubeId,
                    youtubeTitle: `${cacheEntry.artist} - ${cacheEntry.songTitle}`,
                    appleMusicArtist: cacheEntry.artist,
                    appleMusicSong: cacheEntry.songTitle,
                  }
                : null,
            isCached: true, // Flag to indicate this is from cache
          };
        }

        // Check community database if not in local cache
        const communityMapping = await CommunityDatabase.findMapping(youtubeId);
        if (communityMapping) {
          const communityUrl = `${this.APPLE_MUSIC_WEB_BASE}/us/song/${communityMapping.appleMusicId}`;
          console.log(`🌐 Using community database mapping: ${communityUrl}`);
          console.log(
            `📊 Community confidence: ${(
              communityMapping.confidenceScore * 100
            ).toFixed(1)}%`,
          );

          // Add to local cache as confirmed (since it's from community DB)
          await CacheUtils.addCacheEntry(
            youtubeId,
            communityMapping.appleMusicId,
            {
              artist,
              songTitle,
              videoId: youtubeId,
              title: `${artist} - ${songTitle}`,
              channel: "",
              url: "",
              timestamp: Date.now(),
              confidence: communityMapping.confidenceScore,
            },
          );
          await CacheUtils.confirmCacheEntry(youtubeId);

          return {
            url: communityUrl,
            needsConfirmation: false,
            confirmationData: null,
            isCached: false, // From community, not local cache
          };
        }
      }

      // Get song ID from iTunes API (free) but use for Apple Music
      try {
        // Use optimized query for iTunes API search (cleaner)
        const optimizedQuery = this.generateOptimizedQuery({
          artist,
          songTitle,
          title: `${artist} ${songTitle}`,
          channel: "",
          videoId: "",
          url: "",
          timestamp: Date.now(),
        });
        const iTunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(
          optimizedQuery,
        )}&media=music&entity=song&limit=1`;

        console.log(`🔍 iTunes Search Query: "${optimizedQuery}"`);
        const response = await fetch(iTunesUrl);
        const data = await response.json();

        console.log(`🎵 iTunes API Response:`, data);

        if (data.results && data.results.length > 0) {
          const song = data.results[0];

          // Use song ID to create Apple Music direct link (not iTunes)
          if (song.trackId) {
            // Use the web URL format WITHOUT auto-play parameter (will be added later)
            const appleMusicUrl = `${this.APPLE_MUSIC_WEB_BASE}/us/song/${song.trackId}`;
            console.log(`🎯 Created Apple Music direct URL: ${appleMusicUrl}`);

            // Add to cache if we have YouTube ID (unconfirmed initially)
            if (youtubeId) {
              await CacheUtils.addCacheEntry(
                youtubeId,
                song.trackId.toString(),
                {
                  artist,
                  songTitle,
                  videoId: youtubeId,
                  title: `${artist} - ${songTitle}`,
                  channel: "",
                  url: "",
                  timestamp: Date.now(),
                  confidence: 1,
                },
              );

              // NOTE: Do NOT add to community database yet - wait for user confirmation
              console.log(
                "🤔 New song needs confirmation - will be handled by background script",
              );
            }

            // Return both URL and confirmation data for background script to handle
            return {
              url: appleMusicUrl,
              needsConfirmation: true,
              confirmationData: {
                youtubeId,
                youtubeTitle: `${artist} - ${songTitle}`,
                appleMusicArtist: song.artistName,
                appleMusicSong: song.trackName,
              },
              isCached: false, // Flag to indicate this is a new song
            };
          }
        } else {
          console.log("No song found in iTunes API, falling back to search");
        }
      } catch (apiError) {
        console.error("iTunes API failed, falling back to search:", apiError);
      }

      // No direct song found - don't create search URLs for non-music content
      console.log(`❌ No song found in iTunes API for: ${searchQuery}`);
      console.log(
        `🚫 Not creating search URL to avoid opening non-music content`,
      );
      return null;
    } catch (error) {
      console.error("Error getting Apple Music link:", error);
      return null;
    }
  }

  /**
   * Try to open a specific song directly in Apple Music
   */
  static async openDirectSong(
    musicData: MusicData & { directUrl?: string },
  ): Promise<boolean> {
    try {
      const optimizedQuery = this.generateOptimizedQuery(musicData);

      // Use provided direct URL or get one
      let searchLink = musicData.directUrl;
      if (!searchLink) {
        const result = await this.getDirectLink(
          musicData.artist,
          musicData.songTitle,
          musicData.videoId,
        );
        searchLink = result?.url;
      }

      if (searchLink) {
        // Check if we got a direct song link or search link
        const isDirectSong = searchLink.includes("/song/");
        const searchQuery = encodeURIComponent(optimizedQuery);

        let schemes = [];

        if (isDirectSong) {
          // We have a direct song link - extract song ID (remove any existing parameters)
          const songId = searchLink.split("/song/")[1].split("?")[0];
          schemes = [
            // Only use iTunes Store redirect - no fallbacks to avoid alert closing
            `itmss://music.apple.com/us/song/${songId}`,
          ];
          console.log(`🎯 Using ONLY itmss scheme for song ID: ${songId}`);
        } else {
          // No direct song found - don't create search URLs for non-music content
          console.log(`❌ No direct song found, not creating search URLs`);
          console.log(
            `🚫 Avoiding search URLs to prevent opening non-music content`,
          );
          return false;
        }

        const searchSchemes = schemes;

        console.log(`🎯 Trying to open Apple Music search: ${searchLink}`);
        console.log("Search schemes:");
        searchSchemes.forEach((scheme, index) => {
          console.log(`  ${index + 1}. ${scheme}`);
        });

        for (const scheme of searchSchemes) {
          try {
            console.log(`🎵 Trying search scheme: ${scheme}`);
            const tab = await chrome.tabs.create({
              url: scheme,
              active: true,
            });

            // Only handle itmss schemes - no automatic fallbacks
            if (scheme.startsWith("itmss://")) {
              console.log(`🎯 Opening iTunes Store redirect: ${scheme}`);
              console.log(
                "⏳ Waiting for user to approve Apple Music opening...",
              );
              console.log("💡 Take your time - no automatic fallbacks!");
              return true; // Let Chrome handle the prompt, no timeouts
            } else {
              console.log(`✅ Opened: ${scheme}`);
              return true;
            }
          } catch (error) {
            console.error(`❌ Failed search scheme: ${scheme}`, error);
            continue;
          }
        }
      }

      // If search failed, fall back to regular search
      return false;
    } catch (error) {
      console.error("Error opening Apple Music search:", error);
      return false;
    }
  }

  /**
   * Check if Apple Music app is available on the system
   */
  static async isNativeAppAvailable(): Promise<boolean> {
    try {
      // Try to detect if Apple Music app is installed
      // This is a simplified check - in reality, you'd need more sophisticated detection
      const userAgent = navigator.userAgent;
      const isMac = userAgent.includes("Mac");
      const isIOS = /iPad|iPhone|iPod/.test(userAgent);

      return isMac || isIOS;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate optimized search query for Apple Music
   */
  static generateOptimizedQuery(musicData: MusicData): string {
    // Clean up the search query for better results
    let artist = musicData.artist
      .replace(/\s*(official|vevo|records|music|entertainment)\s*/gi, "")
      .replace(/\s*-\s*topic\s*/gi, "") // Remove "- Topic" from auto-generated channels
      .trim();

    let song = musicData.songTitle
      // First, remove everything from the first opening parenthesis onwards
      .replace(/\s*\(.*$/gi, "") // Remove everything from first ( onwards
      // Then clean up other common patterns
      .replace(/\s*(official\s+)?(music\s+)?video\s*/gi, "")
      .replace(/\s*\[.*$/gi, "") // Remove everything from first [ onwards
      .replace(/\s*(ft\.?|feat\.?|featuring)\s+.*/gi, "") // Remove featuring artists
      .replace(/\s*\|\s*.*$/gi, "") // Remove everything after |
      .replace(/\s*-\s*.*lyrics.*$/gi, "") // Remove "- lyrics" suffix
      .replace(/\s*-\s*(official|music|video|lyric|audio|hd|4k|hq).*$/gi, "") // Remove dash followed by video terms
      .trim();

    // If artist and song are the same, just use one
    if (artist.toLowerCase() === song.toLowerCase()) {
      return artist;
    }

    // Build the final query
    const query = `${artist} ${song}`.trim();

    console.log(`Original: "${musicData.artist} - ${musicData.songTitle}"`);
    console.log(`Optimized: "${query}"`);

    return query;
  }

  /**
   * Show confirmation dialog for cache entry
   */
  private static async showConfirmationDialog(
    youtubeId: string,
    musicData: MusicData,
    appleMusicSong: string,
    appleMusicArtist: string,
  ): Promise<void> {
    try {
      console.log("📤 Sending SHOW_CONFIRMATION_DIALOG message:", {
        youtubeId,
        youtubeTitle: musicData.title,
        appleMusicArtist,
        appleMusicSong,
      });

      // Send message to background script to show confirmation
      const response = await chrome.runtime.sendMessage({
        type: "SHOW_CONFIRMATION_DIALOG",
        data: {
          youtubeId,
          youtubeTitle: musicData.title,
          appleMusicArtist,
          appleMusicSong,
        },
      });

      console.log("📥 SHOW_CONFIRMATION_DIALOG response:", response);
    } catch (error) {
      console.error("Error showing confirmation dialog:", error);
    }
  }
}
