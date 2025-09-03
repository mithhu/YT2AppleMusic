import React from "react";

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon?: React.ReactNode;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  label,
  checked,
  onChange,
  icon,
}) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-white/90 flex items-center gap-1">
        {icon}
        {label}
      </span>
      <button
        onClick={() => onChange(!checked)}
        className={`toggle-switch ${checked ? "active" : ""}`}
        aria-label={`Toggle ${label}`}
      />
    </div>
  );
};

export default ToggleSwitch;
