import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const SpeedSettings: React.FC = () => {
  const { settings, updateGameplay } = useSettings();

  const speeds = [
    { value: 0.5, label: '0.5x Lento' },
    { value: 1.0, label: '1x Normal' },
    { value: 1.5, label: '1.5x Rápido' },
    { value: 2.0, label: '2x Muy Rápido' },
  ];

  return (
    <div className="card max-w-2xl animate-scale-in p-8">
      <h3 className="text-2xl font-display text-primary mb-6">Velocidad del Juego</h3>
      <div className="grid grid-cols-2 gap-4">
        {speeds.map((speed) => (
          <button
            key={speed.value}
            onClick={() => updateGameplay({ gameSpeed: speed.value })}
            className={`
              py-4 text-lg rounded-lg border-2 transition-all
              ${settings.gameplay.gameSpeed === speed.value
                ? 'bg-primary text-white border-primary'
                : 'bg-card border-muted text-white hover:border-primary'
              }
            `}
          >
            {speed.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpeedSettings;