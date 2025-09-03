import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Search, Sparkles, ExternalLink, Music } from "lucide-react";
import { MusicData } from "../types";
import "../styles/input.css";

const AppleMusicPlayer: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSong, setCurrentSong] = useState<MusicData | null>(null);
  const [status, setStatus] = useState<{
    message: string;
    type: "success" | "error" | "info";
  }>({
    message: "Ready to search Apple Music",
    type: "info",
  });

  useEffect(() => {
    setupMessageListener();
  }, []);

  const setupMessageListener = () => {
    // Listen for messages from the extension
    window.addEventListener("message", (event) => {
      if (event.data.type === "SEARCH_AND_PLAY") {
        searchAndPlay(event.data.data);
      } else if (event.data.type === "AUTO_PLAY_FIRST_RESULT") {
        autoPlayFirstResult(event.data.data);
      }
    });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setStatus({ message: "Please enter a search term", type: "error" });
      return;
    }

    await searchAndPlay({
      title: searchQuery,
      artist: "",
      channel: "",
      videoId: "",
      url: "",
      songTitle: searchQuery,
      timestamp: Date.now(),
    });
  };

  const searchAndPlay = async (musicData: MusicData) => {
    try {
      setStatus({ message: "Searching Apple Music...", type: "info" });

      const query = `${musicData.title} ${musicData.artist}`.trim();
      setCurrentSong(musicData);
      setSearchQuery(query);

      // Open Apple Music search
      const searchUrl = `https://music.apple.com/search?term=${encodeURIComponent(
        query,
      )}`;
      window.open(searchUrl, "_blank");

      setStatus({
        message: `Opened Apple Music search for: ${query}`,
        type: "success",
      });
    } catch (error) {
      console.error("Error searching Apple Music:", error);
      setStatus({ message: "Error searching Apple Music", type: "error" });
    }
  };

  const autoPlayFirstResult = (musicData: MusicData) => {
    // This would attempt to automatically play the first result
    // Due to browser security restrictions, this requires user interaction
    setStatus({
      message: "Auto-play requires user interaction. Click to search manually.",
      type: "info",
    });
    setSearchQuery(`${musicData.title} ${musicData.artist}`.trim());
    setCurrentSong(musicData);
  };

  const openAppleMusic = () => {
    window.open("https://music.apple.com", "_blank");
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 apple-music-gradient rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
            🎵
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Apple Music Bridge AI
          </h1>
          <p className="text-gray-600">
            Enhanced search and play from YouTube videos
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base focus:outline-none focus:border-apple-red transition-colors"
              placeholder="Enter song title and artist..."
            />
            <Search
              className="absolute right-3 top-3.5 text-gray-400"
              size={20}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="flex-1 apple-music-gradient text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Search size={18} />
              Search & Play
            </button>

            <button
              onClick={openAppleMusic}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              title="Open Apple Music"
            >
              <ExternalLink size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Status */}
        <div
          className={`mt-6 p-4 rounded-xl text-sm font-medium ${
            status.type === "success"
              ? "bg-green-100 text-green-800"
              : status.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {status.type === "info" && <Sparkles size={16} />}
            {status.type === "success" && <Music size={16} />}
            {status.type === "error" && <ExternalLink size={16} />}
            {status.message}
          </div>
        </div>

        {/* Current Song */}
        {currentSong && (
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Music size={16} />
              Current Song
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Title:</span> {currentSong.title}
              </p>
              <p>
                <span className="font-medium">Artist:</span>{" "}
                {currentSong.artist}
              </p>
              <p>
                <span className="font-medium">Channel:</span>{" "}
                {currentSong.channel}
              </p>
              {currentSong.confidence && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentSong.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium">
                    {Math.round(currentSong.confidence * 100)}% confident
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Powered by AI-enhanced music detection</p>
        </div>
      </div>
    </div>
  );
};

// Initialize the player
const container = document.getElementById("apple-music-root");
if (container) {
  const root = createRoot(container);
  root.render(<AppleMusicPlayer />);
}
