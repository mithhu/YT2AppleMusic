import React from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

interface StatusMessageProps {
  message: string;
  type: "success" | "error" | "info";
  onClose?: () => void;
}

const StatusMessage: React.FC<StatusMessageProps> = ({
  message,
  type,
  onClose,
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={16} className="text-green-400" />;
      case "error":
        return <XCircle size={16} className="text-red-400" />;
      case "info":
        return <Info size={16} className="text-blue-400" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500/20 border-green-500/50";
      case "error":
        return "bg-red-500/20 border-red-500/50";
      case "info":
        return "bg-blue-500/20 border-blue-500/50";
    }
  };

  return (
    <div className={`${getBgColor()} border rounded-lg p-3 mb-3 text-xs`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span>{message}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white/80 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default StatusMessage;
