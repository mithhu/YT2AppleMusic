import React from "react";

interface ActionButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = "",
  icon,
}) => {
  const baseClasses = `
    w-full px-3 py-2.5 rounded-lg text-xs font-medium
    transition-all duration-200 flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed
    hover:transform hover:-translate-y-0.5 hover:shadow-lg
  `;

  const defaultClasses = `
    bg-white/20 border border-white/30 text-white
    hover:bg-white/30
  `;

  const finalClasses = className
    ? `${baseClasses} ${className}`
    : `${baseClasses} ${defaultClasses}`;

  return (
    <button onClick={onClick} disabled={disabled} className={finalClasses}>
      {icon}
      {children}
    </button>
  );
};

export default ActionButton;
