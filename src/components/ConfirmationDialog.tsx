import React, { useState } from "react";
import { Check, X, Music } from "lucide-react";

interface ConfirmationDialogProps {
  youtubeTitle: string;
  appleMusicArtist: string;
  appleMusicSong: string;
  onConfirm: () => void;
  onReject: () => void;
  onClose: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  youtubeTitle,
  appleMusicArtist,
  appleMusicSong,
  onConfirm,
  onReject,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleConfirm = () => {
    setIsVisible(false);
    onConfirm();
    setTimeout(onClose, 300);
  };

  const handleReject = () => {
    setIsVisible(false);
    onReject();
    setTimeout(onClose, 300);
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-apple-red rounded-full flex items-center justify-center mr-3">
            <Music className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Confirm Apple Music Match
          </h3>
        </div>

        <div className="mb-6">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
              YouTube Video:
            </p>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              {youtubeTitle}
            </p>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">
              Found on Apple Music:
            </p>
            <p className="text-sm text-gray-900 bg-apple-pink bg-opacity-10 p-2 rounded">
              <span className="font-medium">{appleMusicArtist}</span> -{" "}
              {appleMusicSong}
            </p>
          </div>

          <p className="text-xs text-gray-500">
            Is this the correct match? We'll remember your choice for faster
            access next time.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleConfirm}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            <Check className="w-4 h-4 mr-2" />
            Yes, Correct
          </button>

          <button
            onClick={handleReject}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
          >
            <X className="w-4 h-4 mr-2" />
            No, Wrong
          </button>

          <button
            onClick={handleSkip}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium transition-colors duration-200"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};
