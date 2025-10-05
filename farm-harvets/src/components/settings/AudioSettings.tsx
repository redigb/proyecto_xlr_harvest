import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const AudioSettings: React.FC = () => {
  const { settings, updateAudio } = useSettings();

  return (
    <div className="card max-w-2xl animate-scale-in p-8">
      <h3 className="text-2xl font-display text-primary mb-6">Ajustes de Audio</h3>
      <div className="space-y-6">
        <div>
          <label className="text-white mb-2 block">Volumen General: {settings.audio.masterVolume}%</label>
          <input
            type="range"
            className="slider w-full"
            min="0"
            max="100"
            value={settings.audio.masterVolume}
            onChange={(e) => updateAudio({ masterVolume: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-white mb-2 block">Música: {settings.audio.musicVolume}%</label>
          <input
            type="range"
            className="slider w-full"
            min="0"
            max="100"
            value={settings.audio.musicVolume}
            onChange={(e) => updateAudio({ musicVolume: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="text-white mb-2 block">Efectos: {settings.audio.sfxVolume}%</label>
          <input
            type="range"
            className="slider w-full"
            min="0"
            max="100"
            value={settings.audio.sfxVolume}
            onChange={(e) => updateAudio({ sfxVolume: parseInt(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
};

export default AudioSettings;