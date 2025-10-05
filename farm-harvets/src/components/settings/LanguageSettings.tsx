import React from 'react';
import { useSettings } from '../../context/SettingsContext';

const LanguageSettings: React.FC = () => {
  const { settings, updateLanguage } = useSettings();

  const languages = [
    { code: 'es' as const, label: '🇪🇸 Español' },
    { code: 'en' as const, label: '🇺🇸 English' },
    { code: 'fr' as const, label: '🇫🇷 Français' },
    { code: 'de' as const, label: '🇩🇪 Deutsch' },
  ];

  return (
    <div className="card max-w-2xl animate-scale-in p-8">
      <h3 className="text-2xl font-display text-primary mb-6">Seleccionar Idioma</h3>
      <div className="grid grid-cols-2 gap-4">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => updateLanguage(lang.code)}
            className={`
              py-4 text-lg rounded-lg border-2 transition-all
              ${settings.language === lang.code 
                ? 'bg-primary text-white border-primary' 
                : 'bg-card border-muted text-white hover:border-primary'
              }
            `}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSettings;