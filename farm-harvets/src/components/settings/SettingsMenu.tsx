import { useState, useEffect } from 'react';
import type { Screen, SettingsSection } from '../../App';
import { useAudio } from '../../context/AudioContext';


interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

interface AudioSettingsState {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muteAll: boolean;
}

interface DisplaySettingsState {
  brightness: number;
  contrast: number;
  vsync: boolean;
  fullscreen: boolean;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];

const GAME_SPEEDS = [
  { value: 0.5, label: '0.5x Slow' },
  { value: 1.0, label: '1.0x Normal' },
  { value: 1.5, label: '1.5x Fast' },
  { value: 2.0, label: '2.0x Very Fast' },
];


interface LanguageSettingsProps {
  onBack: () => void;
}

export const LanguageSettings: React.FC<LanguageSettingsProps> = ({ onBack }) => {
  const { playSound } = useAudio();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
    playSound('select');
    // Lógica real para cambiar idioma
    localStorage.setItem('game-language', code);
    console.log(`Language changed to: ${code}`);
  };

  // Cargar idioma guardado al iniciar
  useEffect(() => {
    const savedLang = localStorage.getItem('game-language');
    if (savedLang) {
      setSelectedLanguage(savedLang);
    }
  }, []);

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-2xl mx-auto animate-scale-in p-6 md:p-8">
      {/* Header con botón volver */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-2xl md:text-3xl text-white tracking-wide">
          Language Settings
        </h3>
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105"
        >
          ← Back
        </button>
      </div>

      {/* Lista de idiomas */}
      <div className="space-y-3 mb-8">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageSelect(lang.code)}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left group ${selectedLanguage === lang.code
                ? 'bg-green-500/20 border-green-400 shadow-lg scale-105'
                : 'bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/30'
              }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1">
                <div className="text-white text-lg font-bold">
                  {lang.name}
                </div>
                <div className="text-white/70 text-sm">
                  {lang.nativeName}
                </div>
              </div>
              {selectedLanguage === lang.code && (
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Estado actual */}
      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-white/80 text-sm text-center">
          Selected: {LANGUAGES.find(lang => lang.code === selectedLanguage)?.name}
        </p>
      </div>
    </div>
  );
};

interface AudioSettingsProps {
  onBack: () => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({ onBack }) => {
  const { playSound } = useAudio();
  const [audioSettings, setAudioSettings] = useState<AudioSettingsState>({
    masterVolume: 70,
    musicVolume: 50,
    sfxVolume: 80,
    muteAll: false,
  });

  // Cargar configuración guardada
  useEffect(() => {
    const savedAudio = localStorage.getItem('audio-settings');
    if (savedAudio) {
      setAudioSettings(JSON.parse(savedAudio));
    }
  }, []);

  // Guardar configuración cuando cambie
  useEffect(() => {
    localStorage.setItem('audio-settings', JSON.stringify(audioSettings));
  }, [audioSettings]);

  const handleSliderChange = (key: keyof AudioSettingsState, value: number) => {
    setAudioSettings(prev => ({ ...prev, [key]: value }));
    playSound('hover');
  };

  const handleToggleMute = () => {
    setAudioSettings(prev => ({ ...prev, muteAll: !prev.muteAll }));
    playSound('select');
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-2xl mx-auto animate-scale-in p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-2xl md:text-3xl text-white tracking-wide">
          Audio Settings
        </h3>
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-6">
        {/* Mute Toggle */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
          <div>
            <div className="text-white font-bold text-lg">Mute All</div>
            <div className="text-white/70 text-sm">Disable all game sounds</div>
          </div>
          <button
            onClick={handleToggleMute}
            className={`w-14 h-8 rounded-full transition-all duration-300 ${audioSettings.muteAll ? 'bg-green-500' : 'bg-gray-600'
              }`}
          >
            <div
              className={`w-6 h-6 bg-white rounded-full transition-all duration-300 ${audioSettings.muteAll ? 'translate-x-7' : 'translate-x-1'
                }`}
            />
          </button>
        </div>

        {/* Volume Sliders */}
        <div className="space-y-6">
          {[
            { key: 'masterVolume' as const, label: 'Master Volume' },
            { key: 'musicVolume' as const, label: 'Music Volume' },
            { key: 'sfxVolume' as const, label: 'SFX Volume' }
          ].map(({ key, label }) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-white font-bold">{label}</label>
                <span className="text-green-400 font-bold">
                  {audioSettings[key]}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={audioSettings[key]}
                onChange={(e) => handleSliderChange(key, Number(e.target.value))}
                disabled={audioSettings.muteAll}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface BrightnessSettingsProps {
  onBack: () => void;
}

export const BrightnessSettings: React.FC<BrightnessSettingsProps> = ({ onBack }) => {
  const { playSound } = useAudio();
  const [displaySettings, setDisplaySettings] = useState<DisplaySettingsState>({
    brightness: 50,
    contrast: 50,
    vsync: true,
    fullscreen: false,
  });

  // Cargar y guardar configuración
  useEffect(() => {
    const savedDisplay = localStorage.getItem('display-settings');
    if (savedDisplay) {
      setDisplaySettings(JSON.parse(savedDisplay));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('display-settings', JSON.stringify(displaySettings));

    // Aplicar brillo y contraste en tiempo real
    document.documentElement.style.filter = `brightness(${displaySettings.brightness}%) contrast(${displaySettings.contrast}%)`;
  }, [displaySettings]);

  const handleSliderChange = (key: keyof DisplaySettingsState, value: number) => {
    setDisplaySettings(prev => ({ ...prev, [key]: value }));
    playSound('hover');
  };

  const handleToggleChange = (key: keyof DisplaySettingsState) => {
    setDisplaySettings(prev => ({ ...prev, [key]: !prev[key] }));
    playSound('select');
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-2xl mx-auto animate-scale-in p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-2xl md:text-3xl text-white tracking-wide">
          Display Settings
        </h3>
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-6">
        {/* Brightness and Contrast */}
        <div className="space-y-6">
          {[
            { key: 'brightness' as const, label: 'Brightness' },
            { key: 'contrast' as const, label: 'Contrast' }
          ].map(({ key, label }) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-white font-bold">{label}</label>
                <span className="text-yellow-400 font-bold">
                  {displaySettings[key]}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={displaySettings[key]}
                onChange={(e) => handleSliderChange(key, Number(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          ))}
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          {[
            { key: 'vsync' as const, label: 'VSync', description: 'Reduce screen tearing' },
            { key: 'fullscreen' as const, label: 'Fullscreen', description: 'Immersive gaming experience' }
          ].map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <div className="text-white font-bold text-lg">{label}</div>
                <div className="text-white/70 text-sm">{description}</div>
              </div>
              <button
                onClick={() => handleToggleChange(key)}
                className={`w-14 h-8 rounded-full transition-all duration-300 ${displaySettings[key] ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full transition-all duration-300 ${displaySettings[key] ? 'translate-x-7' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface SpeedSettingsProps {
  onBack: () => void;
}

export const SpeedSettings: React.FC<SpeedSettingsProps> = ({ onBack }) => {
  const { playSound } = useAudio();
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);

  // Cargar velocidad guardada
  useEffect(() => {
    const savedSpeed = localStorage.getItem('game-speed');
    if (savedSpeed) {
      setSelectedSpeed(Number(savedSpeed));
    }
  }, []);

  const handleSpeedSelect = (speed: number) => {
    setSelectedSpeed(speed);
    playSound('select');
    // Guardar en localStorage
    localStorage.setItem('game-speed', speed.toString());
    console.log(`Game speed changed to: ${speed}x`);
  };

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-2xl mx-auto animate-scale-in p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-bold text-2xl md:text-3xl text-white tracking-wide">
          Game Speed
        </h3>
        <button
          onClick={onBack}
          className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105"
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {GAME_SPEEDS.map((speed) => (
          <button
            key={speed.value}
            onClick={() => handleSpeedSelect(speed.value)}
            className={`p-6 rounded-xl border-2 transition-all duration-300 font-bold ${selectedSpeed === speed.value
                ? 'bg-yellow-400 text-gray-900 border-yellow-500 shadow-lg scale-105'
                : 'bg-white/5 text-white border-white/20 hover:bg-white/10 hover:border-white-30'
              }`}
          >
            {speed.label}
          </button>
        ))}
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-white/80 text-sm text-center">
          Current speed: {selectedSpeed}x
        </p>
      </div>
    </div>
  );
};

// ==============================================
// COMPONENTE PRINCIPAL SETTINGS MENU
// ==============================================

interface SettingsMenuProps {
  currentSection: SettingsSection;
  onNavigate: (screen: Screen) => void;
  onBack: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ currentSection, onNavigate, onBack }) => {
  const { playSound } = useAudio();

  const settingsCategories = [
    {
      id: 'language',
      title: 'Language',
      description: 'Change game language',
      icon: '🌐',
    },
    {
      id: 'audio',
      title: 'Audio',
      description: 'Sound and music settings',
      icon: '🎵',
    },
    {
      id: 'brightness',
      title: 'Display',
      description: 'Brightness and display options',
      icon: '💡',
    },
    {
      id: 'speed',
      title: 'Game Speed',
      description: 'Adjust game speed',
      icon: '⚡',
    },
  ];

  const handleCategorySelect = (categoryId: string) => {
    playSound('select');
    onNavigate(categoryId as Screen);
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'settings':
        return (
          <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-4xl mx-auto animate-scale-in p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-3xl md:text-4xl text-white tracking-wide">
                Game Settings
              </h2>
              <button
                onClick={onBack}
                className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg text-white font-bold transition-all duration-300 hover:scale-105"
              >
                ← Main Menu
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {settingsCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="group p-6 bg-white/5 rounded-xl border-2 border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-xl font-bold mb-1">
                        {category.title}
                      </div>
                      <div className="text-white/70 text-sm">
                        {category.description}
                      </div>
                    </div>
                    <div className="text-white/50 group-hover:text-white transition-colors duration-300 text-xl">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'language':
        return <LanguageSettings onBack={() => onNavigate('settings')} />;
      case 'audio':
        return <AudioSettings onBack={() => onNavigate('settings')} />;
      case 'brightness':
        return <BrightnessSettings onBack={() => onNavigate('settings')} />;
      case 'speed':
        return <SpeedSettings onBack={() => onNavigate('settings')} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      {renderSection()}
    </div>
  );
};

export default SettingsMenu;