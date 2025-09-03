import React from "react";
import { Music, User, Youtube } from "lucide-react";
import { MusicData } from "../../types";

interface CurrentVideoProps {
  videoData: MusicData;
}

const CurrentVideo: React.FC<CurrentVideoProps> = ({ videoData }) => {
  return (
    <div className="glass-effect rounded-xl p-4 mb-4">
      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Youtube size={16} />
        Current Video
      </h4>

      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Music size={12} className="mt-0.5 text-white/60" />
          <div>
            <span className="text-white/60">Title: </span>
            <span className="text-white">{videoData.title}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <User size={12} className="mt-0.5 text-white/60" />
          <div>
            <span className="text-white/60">Channel: </span>
            <span className="text-white">{videoData.channel}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Music size={12} className="mt-0.5 text-white/60" />
          <div>
            <span className="text-white/60">Artist: </span>
            <span className="text-white">{videoData.artist}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Music size={12} className="mt-0.5 text-white/60" />
          <div>
            <span className="text-white/60">Song: </span>
            <span className="text-white">{videoData.songTitle}</span>
          </div>
        </div>

        {videoData.confidence && (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 bg-white/20 rounded-full h-1.5">
              <div
                className="bg-green-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${videoData.confidence * 100}%` }}
              />
            </div>
            <span className="text-white/60 text-xs">
              {Math.round(videoData.confidence * 100)}% confident
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrentVideo;
