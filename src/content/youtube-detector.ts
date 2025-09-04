// Import types and utilities inline to avoid ES module issues
interface MusicData {
  videoId: string;
  title: string;
  channel: string;
  artist: string;
  songTitle: string;
  url: string;
  timestamp: number;
  confidence?: number;
  appleMusicUrl?: string;
  appleMusicId?: string;
}

interface ExtensionMessage {
  type: string;
  data?: any;
}

// Inline AI utilities to avoid import issues
class AIUtilsInline {
  static async analyzeMusicProbability(musicData: MusicData): Promise<number> {
    // Rule-based music probability analysis (fallback)
    const title = musicData.title.toLowerCase();
    const channel = musicData.channel?.toLowerCase() || "";

    let score = 0;

    // Strong music indicators
    const strongIndicators = [
      "official music video",
      "music video",
      "official video",
      "official audio",
      "lyric video",
      "lyrics",
    ];

    const mediumIndicators = [
      "official",
      "vevo",
      "records",
      "music",
      "audio",
      "single",
      "album",
      "ep",
      "acoustic",
      "live",
      "cover",
      "remix",
    ];

    const weakIndicators = ["feat", "ft.", "featuring", "vs", "x"];

    // Check title
    strongIndicators.forEach((indicator) => {
      if (title.includes(indicator)) score += 0.3;
    });

    mediumIndicators.forEach((indicator) => {
      if (title.includes(indicator)) score += 0.1;
    });

    weakIndicators.forEach((indicator) => {
      if (title.includes(indicator)) score += 0.05;
    });

    // Check channel
    if (channel.includes("vevo")) score += 0.4;
    if (channel.includes("records")) score += 0.3;
    if (channel.includes("music")) score += 0.2;
    if (channel.includes("official")) score += 0.2;

    // Check for artist - song pattern
    if (/[-–—]/.test(musicData.title) || /\bby\b/i.test(musicData.title)) {
      score += 0.2;
    }

    return Math.min(1, score);
  }
}

class EnhancedYouTubeDetector {
  private currentVideoData: MusicData | null = null;
  private observer: MutationObserver | null = null;
  private checkTimeout: number | null = null;
  private isCleanedUp: boolean = false;

  constructor() {
    console.log("🚀 YouTube Detector initialized on:", location.href);
    this.init();
  }

  private init(): void {
    console.log("🔧 Initializing YouTube detector...");
    console.log("📄 Document ready state:", document.readyState);

    // Wait for page to be ready
    if (document.readyState === "loading") {
      console.log("⏳ Waiting for DOMContentLoaded...");
      document.addEventListener("DOMContentLoaded", () => {
        console.log("✅ DOMContentLoaded fired, setting up detection");
        this.setupDetection();
      });
    } else {
      console.log(
        "✅ Document already ready, setting up detection immediately",
      );
      this.setupDetection();
    }
  }

  private setupDetection(): void {
    console.log("🎯 Setting up YouTube music detection...");

    // Initial check
    console.log("🔍 Performing initial video check...");
    this.checkCurrentVideo();

    // Set up observer for URL changes (YouTube is a SPA)
    console.log("🔗 Setting up URL change detection...");
    this.setupUrlObserver();

    // Set up observer for video title changes
    console.log("👁️ Setting up DOM mutation observer...");
    this.setupTitleObserver();

    // Set up message listener for popup communication
    console.log("📨 Setting up message listener...");
    this.setupMessageListener();

    console.log("✅ YouTube detector setup complete!");
  }

  private setupUrlObserver(): void {
    let lastUrl = location.href;

    // Override pushState and replaceState to detect navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const self = this;
    history.pushState = function (...args: [any, string, string?]) {
      originalPushState.apply(history, args);
      setTimeout(() => self.handleUrlChange(lastUrl, location.href), 100);
      lastUrl = location.href;
    };

    history.replaceState = function (...args: [any, string, string?]) {
      originalReplaceState.apply(history, args);
      setTimeout(() => self.handleUrlChange(lastUrl, location.href), 100);
      lastUrl = location.href;
    };

    // Also listen for popstate (back/forward buttons)
    window.addEventListener("popstate", () => {
      setTimeout(() => this.handleUrlChange(lastUrl, location.href), 100);
      lastUrl = location.href;
    });
  }

  private setupTitleObserver(): void {
    if (this.isCleanedUp) return;

    // Watch for changes in video title (for when video changes without URL change)
    this.observer = new MutationObserver((mutations) => {
      if (this.isCleanedUp) return;

      let shouldCheck = false;
      mutations.forEach((mutation) => {
        if (
          mutation.type === "childList" ||
          mutation.type === "characterData"
        ) {
          shouldCheck = true;
        }
      });

      if (shouldCheck) {
        console.log("🔍 DOM mutation detected, triggering video check");
        this.debounceCheck();
      }
    });

    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  private setupMessageListener(): void {
    try {
      chrome.runtime.onMessage.addListener(
        (message: ExtensionMessage, sender, sendResponse) => {
          try {
            switch (message.type) {
              case "GET_CURRENT_VIDEO":
                sendResponse({ videoData: this.currentVideoData });
                break;

              case "TEST_DETECTION":
                this.checkCurrentVideo()
                  .then(() => {
                    sendResponse({
                      success: true,
                      videoData: this.currentVideoData,
                    });
                  })
                  .catch((error) => {
                    sendResponse({
                      success: false,
                      error:
                        error instanceof Error ? error.message : String(error),
                    });
                  });
                return true; // Keep message channel open

              case "CONTENT_SUPABASE_GET_STATS":
                this.handleSupabaseGetStats(sendResponse);
                return true;

              case "CONTENT_SUPABASE_FIND_MAPPING":
                this.handleSupabaseFindMapping(message.data, sendResponse);
                return true;

              case "CONTENT_SUPABASE_ADD_MAPPING":
                this.handleSupabaseAddMapping(message.data, sendResponse);
                return true;

              case "CONTENT_SUPABASE_CONFIRM_MAPPING":
                this.handleSupabaseConfirmMapping(message.data, sendResponse);
                return true;

              default:
                sendResponse({ success: false, error: "Unknown message type" });
            }
          } catch (error) {
            if (
              error instanceof Error &&
              error.message?.includes("Extension context invalidated")
            ) {
              console.log(
                "🔄 Extension context invalidated in message listener",
              );
              this.cleanup();
              return;
            }
            console.error("Error in message listener:", error);
            sendResponse({
              success: false,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        },
      );
    } catch (error) {
      console.error("Error setting up message listener:", error);
    }
  }

  private debounceCheck(): void {
    if (this.isCleanedUp) {
      console.log("🚫 Debounce check skipped - detector is cleaned up");
      return;
    }

    console.log("⏱️ Debouncing video check...");
    if (this.checkTimeout) {
      clearTimeout(this.checkTimeout);
    }
    this.checkTimeout = window.setTimeout(() => {
      if (!this.isCleanedUp) {
        console.log("⏰ Debounce timeout reached, checking video...");
        this.checkCurrentVideo();
      } else {
        console.log("🚫 Timeout reached but detector is cleaned up");
      }
    }, 500);
  }

  /**
   * Clean up resources when extension context is invalidated
   */
  private cleanup(): void {
    console.log("🧹 Cleaning up YouTube detector");
    this.isCleanedUp = true;

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.checkTimeout) {
      clearTimeout(this.checkTimeout);
      this.checkTimeout = null;
    }

    this.currentVideoData = null;
  }

  private handleUrlChange(oldUrl: string, newUrl: string): void {
    if (this.isVideoUrl(newUrl) && oldUrl !== newUrl) {
      console.log(`🔄 URL changed from ${oldUrl} to ${newUrl}`);

      // Clear cached video data immediately when URL changes
      this.currentVideoData = null;
      console.log("🗑️ Cleared cached video data for new video");

      // Wait a bit for the page to update, then check new video
      setTimeout(() => this.checkCurrentVideo(), 1000);
    }
  }

  private isVideoUrl(url: string): boolean {
    return url.includes("/watch?v=") || url.includes("/shorts/");
  }

  private async checkCurrentVideo(): Promise<void> {
    if (this.isCleanedUp || !this.isVideoUrl(location.href)) {
      console.log("🚫 Skipping - cleaned up or not video URL");
      return;
    }

    console.log("🔍 Checking current video...");
    const videoData = await this.extractVideoData();

    if (!videoData) {
      console.log("❌ No video data extracted");
      return;
    }

    console.log("📹 Video data extracted:", {
      videoId: videoData.videoId,
      title: videoData.title,
      channel: videoData.channel,
      artist: videoData.artist,
      songTitle: videoData.songTitle,
    });

    // Enhanced music detection with AI probability
    const musicProbability = await this.calculateMusicProbability(videoData);

    console.log(
      `🎵 Music probability: ${(musicProbability * 100).toFixed(1)}%`,
    );

    if (musicProbability < 0.6) {
      console.log("⚠️ Low confidence, skipping...");
      return;
    }

    // Add confidence score
    videoData.confidence = musicProbability;

    // Check if this is a new video
    if (this.isDifferentVideo(videoData)) {
      this.currentVideoData = videoData;
      this.handleMusicVideoDetected(videoData);
    } else {
      console.log("🔄 Same video, not processing again");
    }
  }

  private async extractVideoData(): Promise<MusicData | null> {
    try {
      // Wait for elements to be available
      await this.waitForElement(
        "h1.ytd-watch-metadata yt-formatted-string",
        5000,
      );

      const titleElement = document.querySelector(
        "h1.ytd-watch-metadata yt-formatted-string",
      );
      const channelElement =
        document.querySelector("#owner #channel-name a") ||
        document.querySelector("#upload-info #channel-name a") ||
        document.querySelector("ytd-channel-name a");

      if (!titleElement) {
        return null;
      }

      const title = titleElement.textContent?.trim();
      const channel = channelElement?.textContent?.trim();
      const videoId = this.getVideoId();

      if (!title) {
        return null;
      }

      // Try to extract artist and song from title
      const { artist, songTitle } = this.parseTitle(title, channel);

      return {
        videoId,
        title,
        channel: channel || "Unknown Channel",
        artist,
        songTitle: songTitle || title,
        url: location.href,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error extracting video data:", error);
      return null;
    }
  }

  private waitForElement(selector: string, timeout = 5000): Promise<Element> {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  private getVideoId(): string {
    const urlParams = new URLSearchParams(window.location.search);
    return (
      urlParams.get("v") || window.location.pathname.split("/").pop() || ""
    );
  }

  private parseTitle(
    title: string,
    channel?: string,
  ): { artist: string; songTitle: string } {
    // Clean title by removing common video suffixes
    const cleanTitle = title
      .replace(/\s*\(.*?(official|music|video|audio|lyric|live).*?\)/gi, "")
      .replace(/\s*\[.*?(official|music|video|audio|lyric|live).*?\]/gi, "")
      .trim();

    // Enhanced parsing with more patterns
    const patterns = [
      // "Artist - Song Title" (but avoid splitting on hyphens within artist names)
      // Look for patterns like "Artist Name - Song Title" where there's space around the hyphen
      /^(.+?)\s+[-–—]\s+(.+)$/,
      // "Song Title by Artist"
      /^(.+?)\s+by\s+(.+)$/i,
      // "Artist: Song Title"
      /^(.+?):\s*(.+)$/,
      // "Artist | Song Title"
      /^(.+?)\s*\|\s*(.+)$/,
      // "Artist • Song Title"
      /^(.+?)\s*•\s*(.+)$/,
    ];

    for (const pattern of patterns) {
      const match = cleanTitle.match(pattern);
      if (match) {
        const part1 = match[1].trim();
        const part2 = match[2].trim();

        // If channel name matches one of the parts, that's likely the artist
        if (channel && part1.toLowerCase().includes(channel.toLowerCase())) {
          return { artist: part1, songTitle: part2 };
        } else if (
          channel &&
          part2.toLowerCase().includes(channel.toLowerCase())
        ) {
          return { artist: part2, songTitle: part1 };
        } else {
          // Default: first part is artist
          return { artist: part1, songTitle: part2 };
        }
      }
    }

    // If no pattern matches, check if channel looks like an artist name
    if (channel && this.isLikelyArtistChannel(channel)) {
      // For official artist channels, use channel as artist and title as song
      return {
        artist: channel,
        songTitle: cleanTitle,
      };
    }

    // Last resort: try to detect if title contains artist name
    const possibleArtistInTitle = this.extractArtistFromTitle(cleanTitle);
    if (possibleArtistInTitle) {
      return {
        artist: possibleArtistInTitle.artist,
        songTitle: possibleArtistInTitle.song,
      };
    }

    // Final fallback
    return {
      artist: channel || "Unknown Artist",
      songTitle: cleanTitle,
    };
  }

  private isLikelyArtistChannel(channel: string): boolean {
    const channel_lower = channel.toLowerCase();

    // Strong indicators this is an official artist channel
    const officialIndicators = ["official", "vevo", "records", "music"];

    // Weak indicators this might NOT be an artist channel
    const nonArtistIndicators = [
      "tv",
      "channel",
      "network",
      "media",
      "entertainment",
      "productions",
      "studio",
      "label",
    ];

    // Check for official indicators
    const hasOfficialIndicator = officialIndicators.some((indicator) =>
      channel_lower.includes(indicator),
    );

    // Check for non-artist indicators
    const hasNonArtistIndicator = nonArtistIndicators.some((indicator) =>
      channel_lower.includes(indicator),
    );

    // If it has official indicators and no non-artist indicators, likely an artist
    if (hasOfficialIndicator && !hasNonArtistIndicator) {
      return true;
    }

    // If channel name is relatively short and doesn't have non-artist indicators,
    // it's likely an artist name (e.g., "Green Day", "Taylor Swift")
    if (channel.length <= 30 && !hasNonArtistIndicator) {
      return true;
    }

    return false;
  }

  private extractArtistFromTitle(
    title: string,
  ): { artist: string; song: string } | null {
    // Look for common patterns where artist might be embedded in title
    const patterns = [
      // "Song Title - Artist Name" (reverse pattern)
      /^(.+?)\s*[-–—]\s*(.+)$/,
      // Look for featuring patterns and extract main artist
      /^(.+?)\s+(?:feat\.?|ft\.?|featuring)\s+(.+)$/i,
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        const part1 = match[1].trim();
        const part2 = match[2].trim();

        // Simple heuristic: shorter part is more likely to be artist
        if (part2.length < part1.length && part2.length <= 25) {
          return { artist: part2, song: part1 };
        } else if (part1.length <= 25) {
          return { artist: part1, song: part2 };
        }
      }
    }

    return null;
  }

  private async calculateMusicProbability(
    videoData: MusicData,
  ): Promise<number> {
    // Use our improved rule-based calculation directly
    return this.calculateMusicProbabilityRuleBased(videoData);
  }

  private calculateMusicProbabilityRuleBased(videoData: MusicData): number {
    const title = videoData.title.toLowerCase();
    const channel = videoData.channel?.toLowerCase() || "";

    let score = 0;

    // Strong music indicators
    const strongIndicators = [
      "official music video",
      "music video",
      "official video",
      "official audio",
      "lyric video",
      "lyrics",
    ];

    const mediumIndicators = [
      "official",
      "vevo",
      "records",
      "music",
      "audio",
      "single",
      "album",
      "ep",
      "acoustic",
      "live",
      "cover",
      "remix",
    ];

    const weakIndicators = ["feat", "ft.", "featuring", "vs", "x"];

    // Check title
    strongIndicators.forEach((indicator) => {
      if (title.includes(indicator)) score += 0.3;
    });

    mediumIndicators.forEach((indicator) => {
      if (title.includes(indicator)) score += 0.1;
    });

    weakIndicators.forEach((indicator) => {
      if (title.includes(indicator)) score += 0.05;
    });

    // Check channel
    if (channel.includes("vevo")) score += 0.4;
    if (channel.includes("records")) score += 0.3;
    if (channel.includes("music")) score += 0.2;
    if (channel.includes("official")) score += 0.2;

    // Check for artist - song pattern
    if (/[-–—|•]/.test(videoData.title) || /\bby\b/i.test(videoData.title)) {
      score += 0.2;
    }

    // Check for official artist channel badge (music note icon)
    const hasOfficialMusicBadge = this.checkForOfficialMusicBadge();
    if (hasOfficialMusicBadge) {
      score += 0.4; // Very strong indicator - YouTube verified music artist
    }

    // Boost score if channel name matches artist name (official artist channel)
    if (videoData.channel && videoData.artist) {
      const channelLower = videoData.channel.toLowerCase();
      const artistLower = videoData.artist.toLowerCase();

      // Check for exact match (very strong indicator)
      if (channelLower === artistLower) {
        score += 0.5; // Very strong indicator - exact match (increased from 0.4)
        console.log(
          "🎯 EXACT channel-artist match:",
          videoData.channel,
          "=",
          videoData.artist,
          "-> +50% bonus!",
        );
      }
      // Check if channel name contains artist name or vice versa
      else if (
        channelLower.includes(artistLower) ||
        artistLower.includes(channelLower)
      ) {
        score += 0.3; // Strong indicator of official artist channel
        console.log(
          "🎯 Channel-artist partial match:",
          videoData.channel,
          "~",
          videoData.artist,
        );
      }
    }

    // Boost score for clean artist-song format without extra words
    if (/^[^-]+ - [^-]+$/.test(videoData.title.trim())) {
      score += 0.2; // Clean "Artist - Song" format
    }

    // Video duration check (if available)
    const durationElement = document.querySelector(".ytp-time-duration");
    if (durationElement) {
      const duration = durationElement.textContent;
      if (duration) {
        const minutes = this.parseDuration(duration);
        // Music videos are typically 2-8 minutes
        if (minutes >= 2 && minutes <= 8) {
          score += 0.1;
          console.log("🎵 Duration bonus:", minutes, "minutes");
        }
      }
    }

    const finalScore = Math.min(1, score);
    console.log("🎵 Score breakdown:", {
      title: videoData.title,
      channel: videoData.channel,
      artist: videoData.artist,
      rawScore: score,
      finalScore: finalScore,
      percentage: `${(finalScore * 100).toFixed(1)}%`,
    });
    return finalScore;
  }

  private parseDuration(duration: string): number {
    const parts = duration.split(":").map(Number);
    if (parts.length === 2) {
      return parts[0] + parts[1] / 60; // minutes + seconds/60
    } else if (parts.length === 3) {
      return parts[0] * 60 + parts[1] + parts[2] / 60; // hours*60 + minutes + seconds/60
    }
    return 0;
  }

  private checkForOfficialMusicBadge(): boolean {
    try {
      console.log("🔍 Checking for official music badge...");

      // Look for YouTube's official artist channel badge (music note icon)
      const badgeSelectors = [
        // Various selectors for the music badge
        'ytd-badge-supported-renderer[aria-label*="Official Artist Channel"]',
        'ytd-badge-supported-renderer[aria-label*="Music"]',
        ".badge-style-type-verified-artist",
        '.ytd-badge-supported-renderer .yt-icon[d*="music"]',
        // Look for music note icon paths
        'svg path[d*="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"]',
        // Check for channel badges container with music icon
        "#owner-sub-count + .badge-style-type-verified-artist",
        // Alternative selectors for different YouTube layouts
        ".ytd-c4-tabbed-header-renderer .badge-style-type-verified-artist",
        "ytd-channel-name .badge-style-type-verified-artist",
        // More generic selectors
        "ytd-badge-supported-renderer",
        ".badge",
        '[aria-label*="verified"]',
        '[aria-label*="official"]',
      ];

      console.log("🔍 Testing", badgeSelectors.length, "badge selectors...");

      for (const selector of badgeSelectors) {
        const badges = document.querySelectorAll(selector);
        if (badges.length > 0) {
          console.log(
            `🎵 Found ${badges.length} elements with selector:`,
            selector,
          );
          badges.forEach((badge, index) => {
            console.log(`  Badge ${index}:`, {
              tagName: badge.tagName,
              className: badge.className,
              ariaLabel: badge.getAttribute("aria-label"),
              title: badge.getAttribute("title"),
              textContent: badge.textContent?.trim(),
              innerHTML: badge.innerHTML.substring(0, 100) + "...",
            });
          });
          return true;
        }
      }

      // Also check for aria-labels or titles that indicate official artist
      const channelElements = document.querySelectorAll(
        "#owner #channel-name, ytd-channel-name, #channel-name",
      );
      console.log(
        `🔍 Found ${channelElements.length} channel elements to check`,
      );

      for (const element of channelElements) {
        const ariaLabel = element.getAttribute("aria-label") || "";
        const title = element.getAttribute("title") || "";
        console.log("🔍 Channel element:", {
          tagName: element.tagName,
          ariaLabel,
          title,
          textContent: element.textContent?.trim(),
        });

        if (
          ariaLabel.includes("Official Artist") ||
          title.includes("Official Artist")
        ) {
          console.log("🎵 Found official artist indicator in aria-label/title");
          return true;
        }
      }

      console.log("❌ No official music badge found");
      return false;
    } catch (error) {
      console.error("Error checking for official music badge:", error);
      return false;
    }
  }

  private isDifferentVideo(videoData: MusicData): boolean {
    const isDifferent =
      !this.currentVideoData ||
      this.currentVideoData.videoId !== videoData.videoId ||
      this.currentVideoData.timestamp < Date.now() - 30000; // 30 second cooldown

    console.log(`🔍 Checking if video is different:`, {
      hasCurrentData: !!this.currentVideoData,
      currentVideoId: this.currentVideoData?.videoId,
      newVideoId: videoData.videoId,
      isDifferent,
    });

    return isDifferent;
  }

  private handleMusicVideoDetected(videoData: MusicData): void {
    console.log("🎵 Enhanced music video detected:", videoData);
    console.log("🚀 Sending message to background script...");

    // Send message to background script with proper error handling
    try {
      chrome.runtime
        .sendMessage({
          type: "MUSIC_DETECTED",
          data: videoData,
        } as ExtensionMessage)
        .then((response) => {
          console.log("✅ Background script responded:", response);
        })
        .catch((error) => {
          console.error("❌ Error sending message to background:", error);

          // Check if extension context is invalidated
          if (
            chrome.runtime.lastError ||
            error.message?.includes("Extension context invalidated") ||
            error.message?.includes("Could not establish connection")
          ) {
            console.log(
              "🔄 Extension connection lost - background script may not be running",
            );
            console.log(
              "💡 Try reloading the extension in chrome://extensions/",
            );
            return;
          }
        });
    } catch (error) {
      console.error("❌ Synchronous error in handleMusicVideoDetected:", error);

      // Handle synchronous errors (like extension context invalidated)
      if (
        error instanceof Error &&
        error.message?.includes("Extension context invalidated")
      ) {
        console.log(
          "🔄 Extension context invalidated, stopping content script",
        );
        this.cleanup();
        return;
      }
    }
  }

  // Supabase handler methods for content script operations
  private async handleSupabaseGetStats(sendResponse: Function) {
    try {
      // Use fallback - content script Supabase operations not available due to module restrictions
      console.log(
        "⚠️ Content script Supabase operations not available in this context",
      );
      sendResponse({
        success: false,
        error: "Content script Supabase not available",
      });
    } catch (error) {
      console.error("❌ Content script Supabase getStats error:", error);
      sendResponse({
        success: false,
        error: "Failed to get community stats from content script",
      });
    }
  }

  private async handleSupabaseFindMapping(data: any, sendResponse: Function) {
    try {
      console.log("⚠️ Content script Supabase findMapping not available");
      sendResponse({
        success: false,
        error: "Content script Supabase not available",
      });
    } catch (error) {
      console.error("❌ Content script Supabase findMapping error:", error);
      sendResponse({
        success: false,
        error: "Failed to find mapping from content script",
      });
    }
  }

  private async handleSupabaseAddMapping(data: any, sendResponse: Function) {
    try {
      console.log("⚠️ Content script Supabase addMapping not available");
      sendResponse({
        success: false,
        error: "Content script Supabase not available",
      });
    } catch (error) {
      console.error("❌ Content script Supabase addMapping error:", error);
      sendResponse({
        success: false,
        error: "Failed to add mapping from content script",
      });
    }
  }

  private async handleSupabaseConfirmMapping(
    data: any,
    sendResponse: Function,
  ) {
    try {
      console.log("⚠️ Content script Supabase confirmMapping not available");
      sendResponse({
        success: false,
        error: "Content script Supabase not available",
      });
    } catch (error) {
      console.error("❌ Content script Supabase confirmMapping error:", error);
      sendResponse({
        success: false,
        error: "Failed to confirm mapping from content script",
      });
    }
  }
}

// Initialize the enhanced detector
new EnhancedYouTubeDetector();
