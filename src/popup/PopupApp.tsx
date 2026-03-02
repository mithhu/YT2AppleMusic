import React, { useState, useEffect } from "react";
import {
  Music,
  Settings,
  Sparkles,
  Zap,
  Database,
  Download,
  ChevronDown,
  ChevronUp,
  Globe,
  AlertCircle,
} from "lucide-react";
import { ExtensionSettings, MusicData } from "../types";
import { CacheUtils } from "../utils/cacheUtils";
import { AppleMusicUtils } from "../utils/appleMusicUtils";
import { CommunityDatabase } from "../utils/communityDb-secure";
import { SUPABASE_CONFIG, isSupabaseConfigured } from "../config/supabase";
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
  const [isCurrentVideoMapped, setIsCurrentVideoMapped] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    AppleMusicUtils.cleanupItmssTabs();
    loadSettings();
    checkCurrentTab();
    loadCacheStats();
    loadCommunityStats();
    checkForPendingConfirmation();
  }, []);

  const checkForPendingConfirmation = async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: "GET_PENDING_CONFIRMATION",
      });
      if (response.success && response.data) {
        setPendingConfirmation(response.data);
      } else {
        setPendingConfirmation(null);
      }
    } catch (error) {
      console.error("Error checking for pending confirmation:", error);
    }
  };

  const checkIfVideoIsMapped = async (youtubeId: string) => {
    try {
      const cachedSongId = await CacheUtils.getCachedSongId(youtubeId);
      if (cachedSongId) {
        setIsCurrentVideoMapped(true);
        return;
      }

      if (isSupabaseConfigured()) {
        CommunityDatabase.init(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        const communityMapping =
          await CommunityDatabase.findMapping(youtubeId);
        setIsCurrentVideoMapped(!!communityMapping);
      } else {
        setIsCurrentVideoMapped(false);
      }
    } catch (error) {
      console.error("Error checking if video is mapped:", error);
      setIsCurrentVideoMapped(false);
    }
  };

  const getVideoDataWithDatabaseConfidence = async (
    videoData: MusicData,
  ): Promise<MusicData> => {
    try {
      if (isSupabaseConfigured()) {
        CommunityDatabase.init(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        const communityMapping = await CommunityDatabase.findMapping(
          videoData.videoId,
        );

        if (communityMapping && communityMapping.confidenceScore) {
          return {
            ...videoData,
            confidence: communityMapping.confidenceScore,
          };
        }
      }
      return videoData;
    } catch (error) {
      console.error("Error getting database confidence:", error);
      return videoData;
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
      if (isSupabaseConfigured()) {
        CommunityDatabase.init(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        const stats = await CommunityDatabase.getStats();
        setCommunityStats(stats);
        return;
      }

      const response = await chrome.runtime.sendMessage({
        type: "GET_COMMUNITY_STATS",
      });
      if (response.success) {
        setCommunityStats(response.data);
      }
    } catch (error) {
      console.error("Error loading community stats:", error);
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
        const blob = new Blob([response.data], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `yt2apple-cache-${new Date().toISOString().split("T")[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showStatus("Cache exported!", "success");
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
      loadCacheStats();
      loadCommunityStats();

      if (currentVideo) {
        checkIfVideoIsMapped(currentVideo.videoId);
      }

      showStatus(
        isCorrect ? "Match confirmed!" : "Match rejected",
        "success",
      );
    } catch (error) {
      console.error("Error confirming match:", error);
      showStatus("Error processing confirmation", "error");
    }
  };

  const handleUnmapSong = async () => {
    if (!currentVideo) return;

    try {
      setIsLoading(true);

      if (isSupabaseConfigured()) {
        CommunityDatabase.init(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        const success = await CommunityDatabase.unmapMapping(
          currentVideo.videoId,
        );

        if (success) {
          showStatus("Mapping removed", "success");
          loadCommunityStats();
          setIsCurrentVideoMapped(false);
        } else {
          showStatus("Could not remove mapping", "error");
        }
      } else {
        await chrome.runtime.sendMessage({
          type: "REMOVE_CACHE_ENTRY",
          data: { youtubeId: currentVideo.videoId },
        });
        showStatus("Removed from local cache", "success");
        loadCacheStats();
        setIsCurrentVideoMapped(false);
      }
    } catch (error) {
      console.error("Error unmapping song:", error);
      showStatus("Error removing mapping", "error");
    } finally {
      setIsLoading(false);
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
          async (response) => {
            if (chrome.runtime.lastError) {
              // Content script not available -- try triggering a fresh detection
              console.log(
                "Content script not responding, trying TEST_DETECTION...",
              );
              retryWithTestDetection(tab.id!);
              return;
            }

            if (response && response.videoData) {
              await checkIfVideoIsMapped(response.videoData.videoId);
              const updatedVideoData = await getVideoDataWithDatabaseConfidence(
                response.videoData,
              );
              setCurrentVideo(updatedVideoData);
              setVideoLoading(false);
            } else {
              // Content script responded but has no data yet -- try fresh detection
              retryWithTestDetection(tab.id!);
            }
          },
        );
      } else {
        setCurrentVideo(null);
        setIsCurrentVideoMapped(false);
        setVideoLoading(false);
      }
    } catch (error) {
      console.error("Error checking current tab:", error);
      setVideoLoading(false);
    }
  };

  const retryWithTestDetection = (tabId: number) => {
    chrome.tabs.sendMessage(
      tabId,
      { type: "TEST_DETECTION" },
      async (response) => {
        if (chrome.runtime.lastError || !response?.success) {
          setCurrentVideo(null);
          setIsCurrentVideoMapped(false);
          setVideoLoading(false);
          return;
        }

        if (response.videoData) {
          await checkIfVideoIsMapped(response.videoData.videoId);
          const updatedVideoData = await getVideoDataWithDatabaseConfidence(
            response.videoData,
          );
          setCurrentVideo(updatedVideoData);
        } else {
          setCurrentVideo(null);
          setIsCurrentVideoMapped(false);
        }
        setVideoLoading(false);
      },
    );
  };

  const showStatus = (message: string, type: "success" | "error" | "info") => {
    setStatus({ message, type });
    if (type === "success" || type === "info") {
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleOpenAppleMusic = async () => {
    try {
      if (!currentVideo) {
        showStatus("No video detected", "error");
        return;
      }

      setIsLoading(true);

      const searchResponse = await chrome.runtime.sendMessage({
        type: "SEARCH_APPLE_MUSIC",
        data: {
          musicData: currentVideo,
          useNativeApp: settings.useNativeApp,
          aiEnhanced: settings.aiEnhancedSearch,
        },
      });

      if (searchResponse.success && searchResponse.data !== false) {
        showStatus(
          settings.useNativeApp
            ? "Opening Apple Music... click Play in the app"
            : "Opened in browser",
          "success",
        );
        setTimeout(() => loadCacheStats(), 1000);
        setTimeout(() => checkIfVideoIsMapped(currentVideo.videoId), 1500);
        setTimeout(() => checkForPendingConfirmation(), 2000);
      } else {
        showStatus("Could not find this song on Apple Music", "error");
      }
    } catch (error) {
      console.error("Error opening Apple Music:", error);
      showStatus("Error opening Apple Music", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const totalSongs =
    (cacheStats?.confirmed || 0) +
    (communityStats?.totalMappings || 0);

  const showConfirmation =
    pendingConfirmation &&
    (!currentVideo ||
      pendingConfirmation.youtubeId === currentVideo.videoId);

  return (
    <div className="w-80 min-h-96 gradient-bg text-white">
      <div className="p-5">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="text-2xl mb-1">🎵 ➡️ 🍎</div>
          <h1 className="text-base font-bold">YT2AppleMusic</h1>
          <p className="text-xs text-white/50 mt-0.5">
            {settings.autoPlay ? "Auto-detecting" : "Manual mode"} &middot;{" "}
            {settings.useNativeApp ? "Native app" : "Web player"}
          </p>
        </div>

        {/* Status Message */}
        {status && (
          <StatusMessage
            message={status.message}
            type={status.type}
            onClose={() => setStatus(null)}
          />
        )}

        {/* Pending Confirmation -- highest priority, shown first */}
        {showConfirmation && (
          <div className="glass-effect rounded-xl p-4 mb-4 border border-yellow-400/50">
            <p className="text-xs font-semibold text-yellow-300 mb-3">
              Is this the right match?
            </p>

            <div className="space-y-2 mb-4">
              <div className="bg-white/5 rounded-lg p-2.5">
                <p className="text-xs text-white/50 mb-0.5">YouTube</p>
                <p className="text-xs text-white font-medium">
                  {pendingConfirmation!.youtubeTitle}
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-2.5">
                <p className="text-xs text-white/50 mb-0.5">Apple Music</p>
                <p className="text-xs text-green-400 font-medium">
                  {pendingConfirmation!.appleMusicArtist} &ndash;{" "}
                  {pendingConfirmation!.appleMusicSong}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleConfirmMatch(true)}
                className="flex-1 py-2 rounded-lg bg-green-500/80 hover:bg-green-500 text-white text-xs font-semibold transition-colors"
              >
                Yes, correct
              </button>
              <button
                onClick={() => handleConfirmMatch(false)}
                className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 text-xs font-semibold transition-colors"
              >
                No, wrong
              </button>
            </div>
          </div>
        )}

        {/* Current Video -- the main content */}
        {videoLoading ? (
          <div className="glass-effect rounded-xl p-6 mb-4 text-center">
            <div className="animate-pulse-slow text-2xl mb-2">🎵</div>
            <p className="text-xs text-white/50">Detecting music...</p>
          </div>
        ) : currentVideo ? (
          <CurrentVideo
            videoData={currentVideo}
            onPlayAppleMusic={handleOpenAppleMusic}
            onUnmap={isCurrentVideoMapped ? handleUnmapSong : undefined}
            isLoading={isLoading}
          />
        ) : (
          <div className="glass-effect rounded-xl p-6 mb-4 text-center">
            <div className="text-2xl mb-2 opacity-40">🎵</div>
            <p className="text-sm text-white/50 font-medium">
              No music detected
            </p>
            <p className="text-xs text-white/30 mt-1">
              Open a YouTube music video to get started
            </p>
          </div>
        )}

        {/* Song Library -- merged cache + community stats */}
        <button
          onClick={() => setShowStats(!showStats)}
          className="w-full glass-effect rounded-xl p-3 mb-3 flex items-center justify-between hover:bg-white/15 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-purple-400" />
            <span className="text-xs font-medium">Song Library</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">
              {totalSongs} songs
            </span>
            {showStats ? (
              <ChevronUp size={14} className="text-white/40" />
            ) : (
              <ChevronDown size={14} className="text-white/40" />
            )}
          </div>
        </button>

        {showStats && (
          <div className="glass-effect rounded-xl p-4 mb-3 space-y-3">
            {communityStats && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-white/70 flex items-center gap-1.5">
                  <Globe size={10} />
                  Community
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Shared mappings</span>
                  <span className="text-blue-400">
                    {communityStats.totalMappings}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">High confidence</span>
                  <span className="text-green-400">
                    {communityStats.highConfidenceMappings}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Your contributions</span>
                  <span className="text-purple-400">
                    {communityStats.userContributions}
                  </span>
                </div>
              </div>
            )}

            {cacheStats && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-white/70 flex items-center gap-1.5">
                  <Database size={10} />
                  Local Cache
                </p>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Cached</span>
                  <span className="text-white/80">{cacheStats.total}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Confirmed</span>
                  <span className="text-green-400">{cacheStats.confirmed}</span>
                </div>
                {cacheStats.total - cacheStats.confirmed > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-white/50">Pending</span>
                    <span className="text-yellow-400">
                      {cacheStats.total - cacheStats.confirmed}
                    </span>
                  </div>
                )}
              </div>
            )}

            {cacheStats && cacheStats.total > 0 && (
              <button
                onClick={handleExportCache}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-white/50 hover:text-white/70 transition-colors"
              >
                <Download size={10} />
                Export cache
              </button>
            )}
          </div>
        )}

        {/* Settings -- collapsible */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full glass-effect rounded-xl p-3 mb-3 flex items-center justify-between hover:bg-white/15 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings size={14} className="text-white/60" />
            <span className="text-xs font-medium">Settings</span>
          </div>
          {showSettings ? (
            <ChevronUp size={14} className="text-white/40" />
          ) : (
            <ChevronDown size={14} className="text-white/40" />
          )}
        </button>

        {showSettings && (
          <div className="glass-effect rounded-xl p-4 mb-3 space-y-3">
            <ToggleSwitch
              label="Auto-detect & open"
              checked={settings.autoPlay}
              onChange={(checked) =>
                saveSettings({ ...settings, autoPlay: checked })
              }
            />

            <ToggleSwitch
              label="Native Apple Music app"
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
              <div className="p-2 bg-black/10 rounded-lg">
                <input
                  type="password"
                  placeholder="OpenAI API Key (sk-...)"
                  value={settings.openAIApiKey || ""}
                  onChange={(e) =>
                    saveSettings({ ...settings, openAIApiKey: e.target.value })
                  }
                  className="w-full px-2 py-1 text-xs bg-white/20 border border-white/30 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                />
              </div>
            )}

            <ToggleSwitch
              label="Notifications"
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
        )}
      </div>
    </div>
  );
};

export default PopupApp;
