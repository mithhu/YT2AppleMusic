import React from "react";
import { Music, User, Trash2, ExternalLink } from "lucide-react";
import { MusicData } from "../../types";

interface CurrentVideoProps {
  videoData: MusicData;
  onUnmap?: () => void;
  onPlayAppleMusic: () => void;
  isLoading?: boolean;
}

const CurrentVideo: React.FC<CurrentVideoProps> = ({
  videoData,
  onUnmap,
  onPlayAppleMusic,
  isLoading = false,
}) => {
  const confidencePercent = videoData.confidence
    ? Math.round(videoData.confidence * 100)
    : null;

  const confidenceColor =
    confidencePercent && confidencePercent >= 80
      ? "text-green-400"
      : confidencePercent && confidencePercent >= 60
        ? "text-yellow-400"
        : "text-orange-400";

  const confidenceBarColor =
    confidencePercent && confidencePercent >= 80
      ? "bg-green-400"
      : confidencePercent && confidencePercent >= 60
        ? "bg-yellow-400"
        : "bg-orange-400";

  return (
    <div className="glass-effect rounded-xl p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
          <Music size={20} className="text-apple-pink" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">
            {videoData.songTitle}
          </p>
          <p className="text-xs text-white/60 truncate flex items-center gap-1">
            <User size={10} />
            {videoData.artist}
          </p>
        </div>
        {confidencePercent && (
          <span className={`text-xs font-medium shrink-0 ${confidenceColor}`}>
            {confidencePercent}%
          </span>
        )}
      </div>

      {confidencePercent && (
        <div className="w-full bg-white/10 rounded-full h-1 mb-4">
          <div
            className={`${confidenceBarColor} h-1 rounded-full transition-all duration-500`}
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
      )}

      <button
        onClick={onPlayAppleMusic}
        disabled={isLoading}
        className="w-full py-2.5 rounded-lg text-sm font-semibold apple-music-gradient text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ExternalLink size={14} />
        Play on Apple Music
      </button>

      {onUnmap && (
        <button
          onClick={onUnmap}
          disabled={isLoading}
          className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 text-red-400/70 hover:text-red-400 text-xs transition-colors disabled:cursor-not-allowed"
        >
          <Trash2 size={10} />
          Remove mapping
        </button>
      )}
    </div>
  );
};

export default CurrentVideo;
