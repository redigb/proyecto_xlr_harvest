// ==============================================
// MENU ITEM - Componente de Item del Menú Estilo Clash Royale
// ==============================================

import React from 'react';

interface MenuItemProps {
  icon: string;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  onHover: () => void;
  delay?: number;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  description,
  isSelected,
  onClick,
  onHover,
  delay = 0,
}) => {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      className={`
        relative w-full group overflow-hidden
        transition-all duration-300 ease-out
        rounded-xl border-2
        ${isSelected 
          ? 'transform scale-105 shadow-lg border-yellow-400 bg-gray-800/80' 
          : 'transform scale-100 border-gray-600 bg-gray-900/50 hover:scale-102 hover:border-green-400'
        }
      `}
      style={{ 
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Efecto de fondo seleccionado */}
      <div className={`
        absolute inset-0 bg-gradient-to-r from-green-500/10 to-yellow-500/10
        transition-opacity duration-300
        ${isSelected ? 'opacity-100' : 'opacity-0'}
      `} />

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center gap-4 w-full p-6">
        
        {/* Icono */}
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center text-2xl
          transition-all duration-300
          ${isSelected 
            ? 'bg-yellow-400 text-gray-900 shadow-md' 
            : 'bg-gray-700/50 text-white group-hover:bg-gray-600'
          }
        `}>
          {icon}
        </div>

        {/* Texto y descripción */}
        <div className="flex-1 text-left">
          <h3 className={`
            font-bold text-xl tracking-wide mb-1
            ${isSelected 
              ? 'text-white' 
              : 'text-white group-hover:text-green-300'
            }
          `}>
            {label}
          </h3>
          <p className={`
            text-sm
            ${isSelected 
              ? 'text-yellow-300' 
              : 'text-gray-400 group-hover:text-gray-300'
            }
          `}>
            {description}
          </p>
        </div>

        {/* Indicador de selección */}
        <div className={`
          flex items-center gap-2 transition-all duration-300
          ${isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
        `}>
          <svg
            className="w-6 h-6 text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </div>
      </div>

      {/* Indicador lateral de selección */}
      <div className={`
        absolute left-0 top-1/2 transform -translate-y-1/2
        w-1 h-12 bg-gradient-to-b from-green-400 to-yellow-400
        rounded-r transition-all duration-300
        ${isSelected ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}
      `} />

      {/* Efecto de brillo al hover */}
      <div className={`
        absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
        -skew-x-12 transform transition-transform duration-1000
        ${isSelected || 'group-hover:translate-x-full translate-x-[-100%]'}
      `} />
    </button>
  );
};

export default MenuItem;