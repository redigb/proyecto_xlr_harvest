import React from 'react';

// --- Tipos globales del header ---
export type SystemStatus = 'ÓPTIMO' | 'ADVERTENCIA' | 'ERROR';
export type ConnectionStatus = 'En Línea' | 'Desconectado';

export interface HeaderUIProps {
  /** Estado general del sistema (ej. ÓPTIMO, ADVERTENCIA, ERROR) */
  systemStatus?: SystemStatus;

  /** Estado de conexión de red */
  connectionStatus?: ConnectionStatus;

  /** Nombre de usuario o identificación (opcional) */
  userName?: string;

  /** Callback opcional cuando se hace clic en Configuración */
  onSettingsClick?: () => void;

  /** Callback opcional cuando se hace clic en Estadísticas */
  onStatsClick?: () => void;

  /** Callback opcional cuando se hace clic en el avatar del usuario */
  onProfileClick?: () => void;
}

/**
 * Header principal del panel de control agrícola XLR Harvest.
 * Muestra estado del sistema, conexión y accesos rápidos.
 */
const HeaderUI: React.FC<HeaderUIProps> = ({
  systemStatus = 'ÓPTIMO',
  connectionStatus = 'En Línea',
  userName = 'Usuario',
  onSettingsClick,
  onStatsClick,
  onProfileClick,
}) => (
  <header className="menu-background py-6 px-8 shadow-game-xl sticky top-0 z-50 animate-slide-in-down">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      {/* Logo y Título */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-premium rounded-game-2xl flex items-center justify-center shadow-premium animate-tilt">
            <span className="text-2xl text-white">🌾</span>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-sun rounded-full flex items-center justify-center shadow-game">
            <span className="text-xs text-white">✨</span>
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="text-gradient-premium text-3xl font-game tracking-wider text-shadow-game">
            XLR HARVEST
          </h1>
          <p className="text-game-muted text-sm font-medium tracking-wide">
            Panel de Control Agrícola Premium
          </p>
        </div>
      </div>

      {/* Información de Estado */}
      <div className="hidden md:flex items-center space-x-6">
        <div className="text-center bg-white/80 rounded-game-lg px-4 py-2 shadow-game-sm border-2 border-primary/20">
          <p className="text-game-deep text-sm font-semibold">Estado del Sistema</p>
          <p
            className={`text-lg font-bold ${
              systemStatus === 'ÓPTIMO'
                ? 'text-gradient-game'
                : systemStatus === 'ADVERTENCIA'
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            {systemStatus}
          </p>
        </div>

        <div
          className={`flex items-center space-x-2 rounded-game-lg px-4 py-2 border-2 ${
            connectionStatus === 'En Línea'
              ? 'bg-white/60 border-accent-sun/30'
              : 'bg-red-100 border-red-300'
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full ${
              connectionStatus === 'En Línea'
                ? 'bg-gradient-sun animate-pulse-sun'
                : 'bg-red-400'
            }`}
          ></div>
          <span className="text-game-dark font-medium">{connectionStatus}</span>
        </div>
      </div>

      {/* Navegación Rápida */}
      <div className="flex items-center space-x-3">
        <button
          className="menu-item group relative"
          onClick={onSettingsClick}
          aria-label="Configuración"
        >
          <span className="text-xl">⚙️</span>
          <span className="hidden lg:inline">Configuración</span>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-game transition-all duration-300 group-hover:w-4/5"></div>
        </button>

        <button
          className="menu-item group relative"
          onClick={onStatsClick}
          aria-label="Estadísticas"
        >
          <span className="text-xl">📊</span>
          <span className="hidden lg:inline">Estadísticas</span>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-game transition-all duration-300 group-hover:w-4/5"></div>
        </button>

        <div
          className="w-12 h-12 bg-gradient-card rounded-game-lg flex items-center justify-center shadow-game border-2 border-white/50 cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={onProfileClick}
          title={userName}
        >
          <span className="text-xl">👤</span>
        </div>
      </div>
    </div>

    {/* Barra de Progreso Sutil */}
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/30 via-accent-sun/30 to-primary/30 animate-pulse"></div>
  </header>
);

export default HeaderUI;
