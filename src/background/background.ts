import {
  ExtensionSettings,
  MusicData,
  ExtensionMessage,
  ExtensionResponse,
} from "../types";
import { AppleMusicUtils } from "../utils/appleMusicUtils";
import { AIUtils } from "../utils/aiUtils";
import { CacheUtils } from "../utils/cacheUtils";

class EnhancedBackgroundService {
  private appleMusicTab: number | null = null;
  private currentPendingConfirmation: {
    youtubeId: string;
    youtubeTitle: string;
    appleMusicArtist: string;
    appleMusicSong: string;
  } | null = null;
  private settings: ExtensionSettings = {
    autoPlay: true,
    showNotifications: true,
    openInBackground: true,
    useNativeApp: true,
    aiEnhancedSearch: false,
  };

  constructor() {
    console.log("🚀 Background service starting...");
    this.setupEventListeners();
    this.loadSettings();
    console.log("✅ Background service initialized");
  }

  private setupEventListeners(): void {
    console.log("🔧 Setting up background event listeners...");

    // Listen for messages from content scripts and popup
    chrome.runtime.onMessage.addListener(
      (message: ExtensionMessage, sender, sendResponse) => {
        console.log("📨 Background received message:", message.type, message);
        this.handleMessage(message, sender, sendResponse);
        return true; // Keep message channel open for async response
      },
    );

    // Listen for tab updates to track Apple Music tab
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (tab.url && tab.url.includes("music.apple.com")) {
        this.appleMusicTab = tabId;
      }
    });

    // Clean up when tabs are closed
    chrome.tabs.onRemoved.addListener((tabId) => {
      if (tabId === this.appleMusicTab) {
        this.appleMusicTab = null;
      }
    });
  }

  private async handleMessage(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ExtensionResponse) => void,
  ): Promise<void> {
    try {
      switch (message.type) {
        case "MUSIC_DETECTED":
          await this.handleMusicDetected(message.data);
          sendResponse({ success: true });
          break;

        case "SEARCH_APPLE_MUSIC":
          const result = await this.searchAppleMusic(message.data);
          sendResponse({ success: true, data: result });
          break;

        case "GET_SETTINGS":
          sendResponse({ success: true, data: this.settings });
          break;

        case "UPDATE_SETTINGS":
          await this.updateSettings(message.data);
          sendResponse({ success: true });
          break;

        case "AI_ENHANCE_SEARCH":
          const enhanced = await this.enhanceSearchWithAI(message.data);
          sendResponse({ success: true, data: enhanced });
          break;

        case "GET_CACHE_STATS":
          const stats = await CacheUtils.getCacheStats();
          sendResponse({ success: true, data: stats });
          break;

        case "EXPORT_CACHE":
          const cacheText = await CacheUtils.exportCacheAsText();
          sendResponse({ success: true, data: cacheText });
          break;

        case "SHOW_CONFIRMATION_DIALOG":
          this.currentPendingConfirmation = {
            youtubeId: message.data.youtubeId,
            youtubeTitle: message.data.youtubeTitle,
            appleMusicArtist: message.data.appleMusicArtist,
            appleMusicSong: message.data.appleMusicSong,
          };
          console.log(
            "🤔 Stored pending confirmation:",
            this.currentPendingConfirmation,
          );
          sendResponse({ success: true });
          break;

        case "GET_PENDING_CONFIRMATION":
          sendResponse({
            success: true,
            data: this.currentPendingConfirmation,
          });
          break;

        case "CONFIRM_CACHE_ENTRY":
          await this.handleCacheConfirmation(message.data.youtubeId);
          this.currentPendingConfirmation = null; // Clear after confirmation
          sendResponse({ success: true });
          break;

        case "REJECT_CACHE_ENTRY":
          await this.handleCacheRejection(message.data.youtubeId);
          this.currentPendingConfirmation = null; // Clear after rejection
          sendResponse({ success: true });
          break;

        case "STORE_PENDING_CONFIRMATION":
          this.currentPendingConfirmation = message.data;
          console.log(
            "🤔 Stored pending confirmation:",
            this.currentPendingConfirmation,
          );
          sendResponse({ success: true });
          break;

        case "SHOW_PENDING_CONFIRMATIONS":
          const pendingCount = await this.showPendingConfirmations();
          sendResponse({
            success: pendingCount > 0,
            data: { count: pendingCount },
          });
          break;

        default:
          sendResponse({ success: false, error: "Unknown message type" });
      }
    } catch (error) {
      console.error("Background script error:", error);
      sendResponse({ success: false, error: (error as Error).message });
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get({
        autoPlay: true,
        showNotifications: true,
        openInBackground: true,
        useNativeApp: true,
        aiEnhancedSearch: false,
        openAIApiKey: "",
      });
      this.settings = result as ExtensionSettings;
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  private async updateSettings(newSettings: ExtensionSettings): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await chrome.storage.sync.set(this.settings);
  }

  private async handleMusicDetected(musicData: MusicData): Promise<void> {
    console.log("🎵 handleMusicDetected called with:", musicData);
    console.log("⚙️ Current settings:", this.settings);

    if (!this.settings.autoPlay) {
      console.log("⏸️ Auto-play is disabled, skipping");
      return;
    }

    console.log("🎶 Processing music detection...");

    // Show notification
    if (this.settings.showNotifications) {
      console.log("🔔 Showing notification");
      this.showNotification(musicData);
    }

    // Enhance with AI if enabled
    let enhancedData = musicData;
    if (this.settings.aiEnhancedSearch) {
      console.log("🤖 AI enhancement is enabled, calling OpenAI...");
      console.log("🔑 API Key available:", !!this.settings.openAIApiKey);
      try {
        const aiResponse = await AIUtils.enhanceSearchWithAI(
          musicData,
          this.settings.openAIApiKey,
        );
        enhancedData = {
          ...musicData,
          artist: aiResponse.artist,
          songTitle: aiResponse.songTitle,
          confidence: aiResponse.confidence,
        };
        console.log("🤖 AI enhancement completed:", enhancedData);
      } catch (error) {
        console.error("🤖 AI enhancement failed:", error);
      }
    } else {
      console.log("🤖 AI enhancement is disabled");
    }

    // Search and play on Apple Music
    console.log("🍎 Starting Apple Music search...");
    await this.searchAndPlayOnAppleMusic(enhancedData);
  }

  private async searchAppleMusic(data: {
    musicData: MusicData;
    useNativeApp?: boolean;
    aiEnhanced?: boolean;
  }): Promise<any> {
    const {
      musicData,
      useNativeApp = this.settings.useNativeApp,
      aiEnhanced = this.settings.aiEnhancedSearch,
    } = data;

    let enhancedData = musicData;

    // Enhance with AI if requested
    if (aiEnhanced) {
      try {
        const aiResponse = await AIUtils.enhanceSearchWithAI(
          musicData,
          this.settings.openAIApiKey,
        );
        enhancedData = {
          ...musicData,
          artist: aiResponse.artist,
          songTitle: aiResponse.songTitle,
          confidence: aiResponse.confidence,
        };
      } catch (error) {
        console.error("AI enhancement failed:", error);
      }
    }

    return await this.searchAndPlayOnAppleMusic(enhancedData, useNativeApp);
  }

  private async searchAndPlayOnAppleMusic(
    musicData: MusicData,
    useNativeApp = this.settings.useNativeApp,
  ): Promise<boolean> {
    try {
      console.log("Attempting to open Apple Music for:", musicData);

      if (useNativeApp) {
        // First try to get direct link
        console.log("Trying direct song opening...");
        const result = await AppleMusicUtils.getDirectLink(
          musicData.artist,
          musicData.songTitle,
          musicData.videoId,
        );

        if (result) {
          // Create a temporary MusicData object with the URL for openDirectSong
          const tempMusicData = {
            ...musicData,
            directUrl: result.url,
          };
          const directSuccess = await AppleMusicUtils.openDirectSong(
            tempMusicData,
          );
          if (directSuccess) {
            console.log("Direct song opening successful!");

            // Handle confirmation if needed
            if (result.needsConfirmation && result.confirmationData) {
              console.log(
                "🤔 Song needs confirmation, storing data immediately",
              );
              // Store confirmation immediately - no delays needed
              this.currentPendingConfirmation = result.confirmationData;
              console.log(
                "🤔 Stored pending confirmation:",
                this.currentPendingConfirmation,
              );
            }
            return true;
          }
        }

        // If direct song failed, try regular native app opening
        console.log("Direct song failed, trying native app search...");
        const nativeSuccess = await AppleMusicUtils.openInNativeApp(musicData);
        if (nativeSuccess) {
          console.log("Native app search successful!");
          return true;
        }
      }

      // Fallback to web browser
      console.log("Falling back to web browser...");
      const webSuccess = await AppleMusicUtils.openInWebBrowser(
        musicData,
        this.settings.openInBackground,
      );

      if (webSuccess) {
        console.log("Web browser opening successful!");
      } else {
        console.log("All methods failed!");
      }

      return webSuccess;
    } catch (error) {
      console.error("Error opening Apple Music:", error);
      return false;
    }
  }

  private async enhanceSearchWithAI(musicData: MusicData): Promise<any> {
    try {
      const aiResponse = await AIUtils.enhanceSearchWithAI(
        musicData,
        this.settings.openAIApiKey,
      );
      return aiResponse;
    } catch (error) {
      console.error("AI enhancement error:", error);
      throw error;
    }
  }

  private async handleCacheConfirmation(youtubeId: string): Promise<void> {
    console.log(`✅ User confirmed cache entry for YouTube ${youtubeId}`);
    await CacheUtils.confirmCacheEntry(youtubeId);
  }

  private async handleCacheRejection(youtubeId: string): Promise<void> {
    console.log(`❌ User rejected cache entry for YouTube ${youtubeId}`);
    await CacheUtils.removeCacheEntry(youtubeId);
  }

  private async showConfirmationDialog(data: {
    youtubeId: string;
    youtubeTitle: string;
    appleMusicArtist: string;
    appleMusicSong: string;
  }): Promise<void> {
    // Create a notification tab for confirmation
    try {
      const confirmationUrl =
        chrome.runtime.getURL("confirmation.html") +
        `?youtubeId=${encodeURIComponent(data.youtubeId)}` +
        `&youtubeTitle=${encodeURIComponent(data.youtubeTitle)}` +
        `&artist=${encodeURIComponent(data.appleMusicArtist)}` +
        `&song=${encodeURIComponent(data.appleMusicSong)}`;

      await chrome.tabs.create({
        url: confirmationUrl,
        active: false,
      });

      console.log(
        `🤔 Showing confirmation dialog for YouTube ${data.youtubeId}`,
      );
    } catch (error) {
      console.error("Error showing confirmation dialog:", error);
    }
  }

  private async showPendingConfirmations(): Promise<number> {
    try {
      // Get all cache entries
      const cache = await CacheUtils.loadCache();
      const pendingEntries = cache.filter((entry: any) => !entry.confirmed);

      console.log(`📋 Found ${pendingEntries.length} pending confirmations`);

      // Show confirmation dialog for each pending entry
      for (const entry of pendingEntries) {
        await this.showConfirmationDialog({
          youtubeId: entry.youtubeId,
          youtubeTitle: `${entry.artist} - ${entry.songTitle}`,
          appleMusicArtist: entry.artist,
          appleMusicSong: entry.songTitle,
        });

        // Small delay between dialogs to avoid overwhelming
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      return pendingEntries.length;
    } catch (error) {
      console.error("Error showing pending confirmations:", error);
      return 0;
    }
  }

  private showNotification(musicData: MusicData): void {
    // Create a simple notification using the extension badge
    chrome.action.setBadgeText({ text: "♪" });
    chrome.action.setBadgeBackgroundColor({ color: "#FA233B" });

    // Clear badge after 3 seconds
    setTimeout(() => {
      chrome.action.setBadgeText({ text: "" });
    }, 3000);

    // You could also use chrome.notifications API for richer notifications
    // if you add the "notifications" permission to manifest.json
  }
}

// Initialize the enhanced background service
new EnhancedBackgroundService();
