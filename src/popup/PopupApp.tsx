import React, { useState, useEffect } from "react";
import {
  Music,
  Settings,
  Search,
  TestTube,
  ExternalLink,
  Sparkles,
  Zap,
  Database,
  Download,
} from "lucide-react";
import { ExtensionSettings, MusicData } from "../types";
import ToggleSwitch from "./components/ToggleSwitch";
import StatusMessage from "./components/StatusMessage";
import CurrentVideo from "./components/CurrentVideo";
import ActionButton from "./components/ActionButton";

const PopupApp: React.FC = () => {
  const [settings, setSettings] = useState<ExtensionSettings>({
    autoPlay: true,
    showNotifications: true,
    openInBackground: true,
    useNativeApp: true,
    aiEnhancedSearch: false,
    openAIApiKey: "",
  });

  const [currentVideo, setCurrentVideo] = useState<MusicData | null>(null);
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState<{
    total: number;
    confirmed: number;
  } | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    youtubeId: string;
    youtubeTitle: string;
    appleMusicArtist: string;
    appleMusicSong: string;
  } | null>(null);

  const [communityStats, setCommunityStats] = useState<{
    totalMappings: number;
    highConfidenceMappings: number;
    userContributions: number;
  } | null>(null);

  useEffect(() => {
    loadSettings();
    checkCurrentTab();
    loadCacheStats();
    loadCommunityStats();
    checkForPendingConfirmation();
  }, []);

  const checkForPendingConfirmation = async () => {
    try {
      console.log("🔍 Popup: Checking for pending confirmation...");
      const response = await chrome.runtime.sendMessage({
        type: "GET_PENDING_CONFIRMATION",
      });
      console.log("🔍 Popup: GET_PENDING_CONFIRMATION response:", response);
      if (response.success && response.data) {
        console.log("✅ Popup: Found pending confirmation:", response.data);
        setPendingConfirmation(response.data);
      } else {
        console.log("❌ Popup: No pending confirmation found");
        setPendingConfirmation(null);
      }
    } catch (error) {
      console.error(
        "❌ Popup: Error checking for pending confirmation:",
        error,
      );
    }
  };

  const loadSettings = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "GET_SETTINGS",
      });
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async (newSettings: ExtensionSettings) => {
    try {
      await chrome.runtime.sendMessage({
        type: "UPDATE_SETTINGS",
        data: newSettings,
      });
      setSettings(newSettings);
      showStatus("Settings saved!", "success");
    } catch (error) {
      console.error("Error saving settings:", error);
      showStatus("Error saving settings", "error");
    }
  };

  const loadCacheStats = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "GET_CACHE_STATS",
      });
      if (response.success) {
        setCacheStats(response.data);
      }
    } catch (error) {
      console.error("Error loading cache stats:", error);
    }
  };

  const loadCommunityStats = async () => {
    try {
      // Try direct Supabase access from popup first
      const { CommunityDatabase } = await import("../utils/communityDb");
      const { SUPABASE_CONFIG, isSupabaseConfigured } = await import(
        "../config/supabase"
      );

      if (isSupabaseConfigured()) {
        console.log("🔍 Popup: Attempting direct Supabase access...");
        CommunityDatabase.init(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        const stats = await CommunityDatabase.getStats();
        console.log("✅ Popup: Community stats retrieved directly:", stats);
        setCommunityStats(stats);
        return;
      }

      // Fallback to background script
      const response = await chrome.runtime.sendMessage({
        type: "GET_COMMUNITY_STATS",
      });
      if (response.success) {
        setCommunityStats(response.data);
      }
    } catch (error) {
      console.error("Error loading community stats:", error);
      // Set fallback stats
      setCommunityStats({
        totalMappings: 0,
        highConfidenceMappings: 0,
        userContributions: 0,
      });
    }
  };

  const handleExportCache = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "EXPORT_CACHE",
      });
      if (response.success) {
        // Create and download the cache file
        const blob = new Blob([response.data], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `youtube-apple-music-cache-${
          new Date().toISOString().split("T")[0]
        }.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showStatus("Cache exported successfully!", "success");
      }
    } catch (error) {
      console.error("Error exporting cache:", error);
      showStatus("Error exporting cache", "error");
    }
  };

  const handleConfirmMatch = async (isCorrect: boolean) => {
    if (!pendingConfirmation) return;

    try {
      const messageType = isCorrect
        ? "CONFIRM_CACHE_ENTRY"
        : "REJECT_CACHE_ENTRY";
      await chrome.runtime.sendMessage({
        type: messageType,
        data: { youtubeId: pendingConfirmation.youtubeId },
      });

      setPendingConfirmation(null);
      loadCacheStats(); // Refresh cache stats
      loadCommunityStats(); // Refresh community stats
      showStatus(
        isCorrect ? "✅ Match confirmed!" : "❌ Match rejected!",
        "success",
      );
    } catch (error) {
      console.error("Error confirming match:", error);
      showStatus("Error processing confirmation", "error");
    }
  };

  const checkCurrentTab = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab.url && tab.url.includes("youtube.com/watch")) {
        chrome.tabs.sendMessage(
          tab.id!,
          { type: "GET_CURRENT_VIDEO" },
          (response) => {
            if (chrome.runtime.lastError) {
              setCurrentVideo(null);
              return;
            }

            if (response && response.videoData) {
              setCurrentVideo(response.videoData);
            }
          },
        );
      } else {
        showStatus("Open a YouTube video to use this extension", "info");
      }
    } catch (error) {
      console.error("Error checking current tab:", error);
    }
  };

  const showStatus = (message: string, type: "success" | "error" | "info") => {
    setStatus({ message, type });
    if (type === "success" || type === "info") {
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleSearchCurrent = async () => {
    setIsLoading(true);
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.url || !tab.url.includes("youtube.com/watch")) {
        showStatus("Please open a YouTube video first", "error");
        return;
      }

      showStatus("Extracting video information...", "info");

      chrome.tabs.sendMessage(
        tab.id!,
        { type: "GET_CURRENT_VIDEO" },
        async (response) => {
          if (chrome.runtime.lastError) {
            showStatus("Error: Please refresh the YouTube page", "error");
            return;
          }

          if (response && response.videoData) {
            const videoData = response.videoData;
            setCurrentVideo(videoData);

            const searchResponse = await chrome.runtime.sendMessage({
              type: "SEARCH_APPLE_MUSIC",
              data: {
                ...videoData,
                useNativeApp: settings.useNativeApp,
                aiEnhanced: settings.aiEnhancedSearch,
              },
            });

            if (searchResponse.success) {
              showStatus(
                settings.useNativeApp
                  ? "Opened in Apple Music app"
                  : "Opened Apple Music search",
                "success",
              );
              // Refresh cache stats after search
              setTimeout(() => loadCacheStats(), 1000);
            } else {
              showStatus("Error searching Apple Music", "error");
            }
          } else {
            showStatus("Could not extract video information", "error");
          }
        },
      );
    } catch (error) {
      console.error("Error searching current video:", error);
      showStatus("Error occurred while searching", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAppleMusic = async () => {
    try {
      const url = settings.useNativeApp
        ? "music://"
        : "https://music.apple.com";
      await chrome.tabs.create({
        url,
        active: !settings.openInBackground,
      });
      showStatus("Opened Apple Music", "success");
    } catch (error) {
      console.error("Error opening Apple Music:", error);
      showStatus("Error opening Apple Music", "error");
    }
  };

  const handleTestDetection = async () => {
    setIsLoading(true);
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab.url || !tab.url.includes("youtube.com")) {
        showStatus("Please open YouTube first", "error");
        return;
      }

      showStatus("Testing detection...", "info");

      chrome.tabs.sendMessage(
        tab.id!,
        { type: "TEST_DETECTION" },
        (response) => {
          if (chrome.runtime.lastError) {
            showStatus("Error: Please refresh the YouTube page", "error");
            return;
          }

          if (response && response.success) {
            showStatus("Detection test completed", "success");
            if (response.videoData) {
              setCurrentVideo(response.videoData);
            }
          } else {
            showStatus("Detection test failed", "error");
          }
        },
      );
    } catch (error) {
      console.error("Error testing detection:", error);
      showStatus("Error during test", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-80 min-h-96 gradient-bg text-white">
      <div className="p-5">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-3xl mb-2 bounce-icon">🎵 ➡️ 🍎</div>
          <h1 className="text-lg font-semibold mb-1">
            YouTube to Apple Music AI
          </h1>
          <p className="text-xs opacity-80">
            AI-powered music bridge with native app support
          </p>
        </div>

        {/* Settings Section */}
        <div className="glass-effect rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Settings size={16} />
            Settings
          </h3>

          <div className="space-y-3">
            <ToggleSwitch
              label="Auto-play detected music"
              checked={settings.autoPlay}
              onChange={(checked) =>
                saveSettings({ ...settings, autoPlay: checked })
              }
            />

            <ToggleSwitch
              label="Use native Apple Music app"
              checked={settings.useNativeApp}
              onChange={(checked) =>
                saveSettings({ ...settings, useNativeApp: checked })
              }
              icon={<Zap size={12} />}
            />

            <ToggleSwitch
              label="AI-enhanced search"
              checked={settings.aiEnhancedSearch}
              onChange={(checked) =>
                saveSettings({ ...settings, aiEnhancedSearch: checked })
              }
              icon={<Sparkles size={12} />}
            />

            {settings.aiEnhancedSearch && (
              <div className="mt-2 p-2 bg-black/10 rounded-lg">
                <input
                  type="password"
                  placeholder="Enter OpenAI API Key (sk-...)"
                  value={settings.openAIApiKey || ""}
                  onChange={(e) =>
                    saveSettings({ ...settings, openAIApiKey: e.target.value })
                  }
                  className="w-full px-2 py-1 text-xs bg-white/20 border border-white/30 rounded text-white placeholder-white/60 focus:outline-none focus:border-white/50"
                />
                <p className="text-xs text-white/70 mt-1">
                  Get your key from{" "}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-white"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>
            )}

            <ToggleSwitch
              label="Show notifications"
              checked={settings.showNotifications}
              onChange={(checked) =>
                saveSettings({ ...settings, showNotifications: checked })
              }
            />

            <ToggleSwitch
              label="Open in background"
              checked={settings.openInBackground}
              onChange={(checked) =>
                saveSettings({ ...settings, openInBackground: checked })
              }
            />
          </div>
        </div>

        {/* Actions Section */}
        <div className="glass-effect rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Music size={16} />
            Actions
          </h3>

          <div className="space-y-2">
            <ActionButton
              onClick={handleSearchCurrent}
              disabled={isLoading}
              className="apple-music-gradient"
              icon={<Search size={16} />}
            >
              {isLoading ? "Searching..." : "Search Current Video"}
            </ActionButton>

            <ActionButton
              onClick={handleOpenAppleMusic}
              icon={<ExternalLink size={16} />}
            >
              Open Apple Music
            </ActionButton>

            <ActionButton
              onClick={handleTestDetection}
              disabled={isLoading}
              icon={<TestTube size={16} />}
            >
              Test Detection
            </ActionButton>

            <ActionButton
              onClick={checkForPendingConfirmation}
              icon={<Database size={16} />}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Check Confirmation
            </ActionButton>
          </div>
        </div>

        {/* Pending Confirmation Section */}
        {pendingConfirmation && (
          <div className="glass-effect rounded-xl p-4 mb-4 border-2 border-yellow-400">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Music size={16} />
              Confirm Apple Music Match
            </h3>

            <div className="space-y-3 mb-4">
              <div>
                <div className="text-xs text-white/60 mb-1">YouTube Video:</div>
                <div className="text-xs text-white bg-white/10 rounded p-2">
                  {pendingConfirmation.youtubeTitle}
                </div>
              </div>

              <div>
                <div className="text-xs text-white/60 mb-1">
                  Found on Apple Music:
                </div>
                <div className="text-xs text-green-400 bg-white/10 rounded p-2 font-medium">
                  {pendingConfirmation.appleMusicArtist} -{" "}
                  {pendingConfirmation.appleMusicSong}
                </div>
              </div>

              <div className="text-xs text-white/70 text-center">
                Is this the correct match?
              </div>
            </div>

            <div className="flex gap-2">
              <ActionButton
                onClick={() => handleConfirmMatch(true)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-xs"
                icon={<span>✓</span>}
              >
                Yes, Correct
              </ActionButton>
              <ActionButton
                onClick={() => handleConfirmMatch(false)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-xs"
                icon={<span>✗</span>}
              >
                No, Wrong
              </ActionButton>
            </div>
          </div>
        )}

        {/* Cache Section */}
        <div className="glass-effect rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Database size={16} />
            Cache Status
          </h3>

          {cacheStats ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Total Mappings:</span>
                <span className="text-white">{cacheStats.total}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Confirmed:</span>
                <span className="text-green-400">{cacheStats.confirmed}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Pending:</span>
                <span className="text-yellow-400">
                  {cacheStats.total - cacheStats.confirmed}
                </span>
              </div>

              {cacheStats.total > 0 && (
                <ActionButton
                  onClick={handleExportCache}
                  icon={<Download size={16} />}
                  className="mt-2 text-xs"
                >
                  Export Cache
                </ActionButton>
              )}
            </div>
          ) : (
            <div className="text-xs text-white/60">
              No cached mappings yet. Use the extension to build your cache!
            </div>
          )}
        </div>

        {/* Community Database Stats */}
        <div className="glass-effect rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Sparkles size={16} />
            Community Database
          </h3>

          {communityStats ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Total Community Mappings:</span>
                <span className="text-blue-400">
                  {communityStats.totalMappings}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">High Confidence:</span>
                <span className="text-green-400">
                  {communityStats.highConfidenceMappings}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60">Your Contributions:</span>
                <span className="text-purple-400">
                  {communityStats.userContributions}
                </span>
              </div>

              <div className="mt-3 p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg">
                <p className="text-xs text-white/80 text-center">
                  🌟 Help grow the community database by confirming matches!
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-white/60">
              Community database not available. Check your connection.
            </div>
          )}
        </div>

        {/* Status */}
        {status && (
          <StatusMessage
            message={status.message}
            type={status.type}
            onClose={() => setStatus(null)}
          />
        )}

        {/* Current Video */}
        {currentVideo && <CurrentVideo videoData={currentVideo} />}

        {/* Footer */}
        <div className="text-center text-xs opacity-70 mt-4">
          <p>
            Detected music videos will open in{" "}
            {settings.useNativeApp ? "Apple Music app" : "Apple Music web"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PopupApp;
