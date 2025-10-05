// ==============================================
// SETTINGS MENU - Menú de Ajustes
// ==============================================

import React from 'react';
import { Screen, SettingsSection } from '../../App';

// Componentes de subsecciones
export const LanguageSettings = () => (
  <div className="card max-w-2xl animate-scale-in">
    <h3 className="text-2xl font-display text-primary mb-6">Seleccionar Idioma</h3>
    <div className="grid grid-cols-2 gap-4">
      {['🇪🇸 Español', '🇺🇸 English', '🇫🇷 Français', '🇩🇪 Deutsch'].map((lang) => (
        <button key={lang} className="btn-secondary py-4 text-lg">
          {lang}
        </button>
      ))}
    </div>
  </div>
);

export const AudioSettings = () => (
  <div className="card max-w-2xl animate-scale-in">
    <h3 className="text-2xl font-display text-primary mb-6">Ajustes de Audio</h3>
    <div className="space-y-6">
      <div>
        <label className="text-white mb-2 block">Volumen General</label>
        <input type="range" className="slider w-full" min="0" max="100" defaultValue="70" />
      </div>
      <div>
        <label className="text-white mb-2 block">Música</label>
        <input type="range" className="slider w-full" min="0" max="100" defaultValue="50" />
      </div>
      <div>
        <label className="text-white mb-2 block">Efectos de Sonido</label>
        <input type="range" className="slider w-full" min="0" max="100" defaultValue="80" />
      </div>
    </div>
  </div>
);

export const BrightnessSettings = () => (
  <div className="card max-w-2xl animate-scale-in">
    <h3 className="text-2xl font-display text-primary mb-6">Ajustar Brillo</h3>
    <div className="space-y-6">
      <div>
        <label className="text-white mb-2 block">Brillo de Pantalla</label>
        <input type="range" className="slider w-full" min="0" max="100" defaultValue="50" />
      </div>
      <div className="flex justify-between text-muted text-sm">
        <span>Oscuro</span>
        <span>Claro</span>
      </div>
    </div>
  </div>
);

export const SpeedSettings = () => (
  <div className="card max-w-2xl animate-scale-in">
    <h3 className="text-2xl font-display text-primary mb-6">Velocidad del Juego</h3>
    <div className="grid grid-cols-2 gap-4">
      {['0.5x Lento', '1x Normal', '1.5x Rápido', '2x Muy Rápido'].map((speed) => (
        <button key={speed} className="btn-secondary py-4 text-lg">
          {speed}
        </button>
      ))}
    </div>
  </div>
);

// Interfaz para las props del componente principal SettingsMenu
interface SettingsMenuProps {
  currentSection: SettingsSection;
  onNavigate: (screen: Screen) => void;
  onBack: () => void;
}

// Componente principal SettingsMenu
const SettingsMenu: React.FC<SettingsMenuProps> = ({ currentSection, onNavigate, onBack }) => {
  // Renderizar la subsección correspondiente según currentSection
  const renderSection = () => {
    switch (currentSection) {
      case 'settings':
        return (
          <div className="card max-w-2xl animate-scale-in">
            <h3 className="text-2xl font-display text-primary mb-6">Ajustes</h3>
            <div className="grid grid-cols-2 gap-4">
              {['language', 'audio', 'brightness', 'speed'].map((section) => (
                <button
                  key={section}
                  className="btn-secondary py-4 text-lg"
                  onClick={() => onNavigate(section as Screen)}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>
          </div>
        );
      case 'language':
        return <LanguageSettings />;
      case 'audio':
        return <AudioSettings />;
      case 'brightness':
        return <BrightnessSettings />;
      case 'speed':
        return <SpeedSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {renderSection()}
        <button
          className="btn-secondary mt-6 px-6 py-3 text-lg"
          onClick={onBack}
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default SettingsMenu;