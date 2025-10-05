import React, { useState } from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  variant?: 'primary' | 'sun' | 'premium';
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  size = 'md',
  disabled = false,
  variant = 'primary',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (disabled) return;
    
    setIsAnimating(true);
    onChange(!checked);
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    sm: {
      container: "h-6 w-12",
      knob: "h-5 w-5",
      translate: "translate-x-6"
    },
    md: {
      container: "h-8 w-16", 
      knob: "h-7 w-7",
      translate: "translate-x-8"
    },
    lg: {
      container: "h-10 w-20",
      knob: "h-9 w-9",
      translate: "translate-x-10"
    }
  };

  const variantClasses = {
    primary: checked ? "bg-gradient-game" : "bg-game-light",
    sun: checked ? "bg-gradient-sun" : "bg-amber-200",
    premium: checked ? "bg-gradient-premium animate-pulse-glow" : "bg-gradient-to-r from-game-light to-game-muted"
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex items-center gap-3">
      {label && (
        <label className={`font-game text-game-dark text-shadow-game cursor-pointer select-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}>
          {label}
        </label>
      )}
      
      <button
        type="button"
        className={`
          toggle-game relative inline-flex flex-shrink-0 cursor-pointer 
          rounded-full border-2 border-transparent transition-colors duration-300 
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 
          shadow-inner-dark transform-gpu
          ${currentSize.container}
          ${variantClasses[variant]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isAnimating ? 'scale-105' : ''}
        `}
        onClick={handleToggle}
        disabled={disabled}
        aria-pressed={checked}
      >
        {/* Knob del toggle */}
        <span
          className={`
            toggle-game-knob transform transition-all duration-300 ease-out
            ${currentSize.knob}
            ${checked ? currentSize.translate : 'translate-x-0'}
            ${checked ? 'shadow-game' : 'shadow-inner-dark'}
            ${isAnimating ? 'scale-110' : ''}
          `}
        >
          {/* Efecto de brillo interior */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent rounded-full" />
          
          {/* Indicador de estado para variante premium */}
          {variant === 'premium' && checked && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent animate-pulse" />
          )}
        </span>
        
        {/* Efectos de fondo para estado activo */}
        {checked && (
          <>
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/30 to-transparent" />
          </>
        )}
      </button>
    </div>
  );
};

// Toggle con iconos
interface IconToggleProps extends Omit<ToggleProps, 'label'> {
  checkedIcon?: React.ReactNode;
  uncheckedIcon?: React.ReactNode;
}

export const IconToggle: React.FC<IconToggleProps> = ({
  checkedIcon,
  uncheckedIcon,
  checked,
  ...props
}) => {
  return (
    <div className="flex items-center gap-3">
      {uncheckedIcon && !checked && (
        <div className="text-xl text-game-muted drop-shadow-lg">
          {uncheckedIcon}
        </div>
      )}
      
      <Toggle checked={checked} {...props} />
      
      {checkedIcon && checked && (
        <div className="text-xl text-accent-sun drop-shadow-lg animate-scale-in">
          {checkedIcon}
        </div>
      )}
    </div>
  );
};