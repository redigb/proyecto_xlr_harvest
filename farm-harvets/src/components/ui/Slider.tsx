import React, { useState } from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  valueSuffix?: string;
  disabled?: boolean;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = true,
  valueSuffix = '',
  disabled = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label y valor */}
      {(label || showValue) && (
        <div className="flex justify-between items-center">
          {label && (
            <label className="font-game text-game-dark text-shadow-game text-lg">
              {label}
            </label>
          )}
          {showValue && (
            <span className="font-bold text-primary-dark bg-white/80 px-3 py-1 rounded-game border-2 border-primary/20">
              {value}{valueSuffix}
            </span>
          )}
        </div>
      )}

      {/* Contenedor del slider */}
      <div className="relative">
        {/* Track de fondo */}
        <div className="slider-game h-3 rounded-full bg-game-light shadow-inner-dark overflow-hidden">
          {/* Track lleno con gradiente */}
          <div 
            className="h-full bg-gradient-game rounded-full transition-all duration-300 ease-out shadow-inner-game"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Thumb personalizado */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          disabled={disabled}
          className={`
            absolute top-1/2 left-0 w-full h-3 -translate-y-1/2
            appearance-none bg-transparent cursor-pointer
            transition-all duration-200
            ${disabled ? 'cursor-not-allowed opacity-60' : ''}
            ${isDragging ? 'scale-110' : ''}
          `}
        />

        {/* Indicador de posición (opcional) */}
        <div 
          className={`
            absolute top-1/2 w-7 h-7 bg-gradient-sun rounded-full
            border-3 border-white shadow-game transition-all duration-200
            flex items-center justify-center -translate-y-1/2 -translate-x-1/2
            ${isDragging ? 'scale-125 shadow-premium' : ''}
            ${disabled ? 'opacity-60' : 'hover:scale-110'}
          `}
          style={{ left: `${percentage}%` }}
        >
          {isDragging && (
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          )}
        </div>
      </div>

      {/* Marcas de min/max */}
      <div className="flex justify-between text-xs text-game-muted font-medium px-1">
        <span>{min}{valueSuffix}</span>
        <span>{max}{valueSuffix}</span>
      </div>
    </div>
  );
};

// Slider con iconos
interface IconSliderProps extends Omit<SliderProps, 'label'> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const IconSlider: React.FC<IconSliderProps> = ({ 
  leftIcon, 
  rightIcon, 
  ...props 
}) => {
  return (
    <div className="flex items-center gap-4">
      {leftIcon && (
        <div className="text-2xl text-game-muted drop-shadow-lg">
          {leftIcon}
        </div>
      )}
      
      <div className="flex-1">
        <Slider {...props} />
      </div>
      
      {rightIcon && (
        <div className="text-2xl text-game-muted drop-shadow-lg">
          {rightIcon}
        </div>
      )}
    </div>
  );
};