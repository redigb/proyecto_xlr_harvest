import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const BrightnessSettings: React.FC = () => {
  const { settings, updateVideo } = useSettings();

  return (
    <div className="card max-w-2xl animate-scale-in p-8">
      <h3 className="text-2xl font-display text-primary mb-6">Ajustar Brillo</h3>
      <div className="space-y-6">
        <div>
          <label className="text-white mb-2 block">
            Brillo de Pantalla: {settings.video.brightness}%
          </label>
          <input
            type="range"
            className="slider w-full"
            min="0"
            max="100"
            value={settings.video.brightness}
            onChange={(e) => updateVideo({ brightness: parseInt(e.target.value) })}
          />
        </div>
        <div className="flex justify-between text-muted text-sm">
          <span>Oscuro</span>
          <span>Claro</span>
        </div>
      </div>
    </div>
  );
};

export default BrightnessSettings;