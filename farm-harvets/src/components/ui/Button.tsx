import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'sun' | 'soil' | 'premium' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
}) => {
  const baseClasses = "btn-game font-game uppercase tracking-wider transition-all duration-300 ease-out relative overflow-hidden select-none transform-gpu";
  
  const variantClasses = {
    primary: "bg-gradient-game text-white shadow-button hover:shadow-button-hover border-white/30",
    sun: "btn-sun bg-gradient-sun text-game-dark shadow-button hover:shadow-button-hover border-amber-200/40",
    soil: "btn-soil bg-gradient-soil text-white shadow-button hover:shadow-button-hover border-amber-100/30",
    premium: "btn-premium bg-gradient-premium text-white shadow-premium border-white/40 animate-pulse-glow hover:animate-none",
    ghost: "bg-transparent text-primary-dark border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm rounded-game",
    md: "px-6 py-3 text-base rounded-game-md",
    lg: "px-8 py-4 text-xl rounded-game-lg",
    xl: "px-10 py-5 text-2xl rounded-game-xl"
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-button" : "";
  const loadingClasses = loading ? "cursor-wait" : "";

  return (
    <button
      type={type}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabledClasses}
        ${loadingClasses}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {/* Efecto de brillo al hover */}
      <div className="shine-effect absolute inset-0 rounded-inherit" />
      
      {/* Contenido del botón */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        )}
        <span className="text-shadow-game-lg drop-shadow-lg">
          {children}
        </span>
      </div>
      
      {/* Efecto de partículas para botones premium */}
      {variant === 'premium' && (
        <>
          <div className="particle-effect absolute inset-0 pointer-events-none" />
          <div className="absolute -inset-1 bg-gradient-premium rounded-inherit blur-sm opacity-30 animate-pulse" />
        </>
      )}
    </button>
  );
};

// Botón con icono
interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: React.ReactNode;
  label: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, label, ...props }) => {
  return (
    <Button {...props}>
      <div className="flex items-center justify-center gap-3">
        <span className="text-xl drop-shadow-lg">{icon}</span>
        <span>{label}</span>
      </div>
    </Button>
  );
};