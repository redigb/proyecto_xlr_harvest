import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_SETTINGS } from '../types/settings';
import type { Settings, Language, AudioSettings, VideoSettings, GameplaySettings } from '../types/settings';
import type { ReactNode } from 'react';

interface SettingsContextType {
    settings: Settings;
    updateLanguage: (language: Language) => void;
    updateAudio: (audio: Partial<AudioSettings>) => void;
    updateVideo: (video: Partial<VideoSettings>) => void;
    updateGameplay: (gameplay: Partial<GameplaySettings>) => void;
    resetSettings: () => void;
    saveSettings: () => void;
}

const STORAGE_KEY = 'xlr_harvest_settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<Settings>(() => {
        // Cargar configuración guardada o usar valores por defecto
        const savedSettings = localStorage.getItem(STORAGE_KEY);
        if (savedSettings) {
            try {
                return JSON.parse(savedSettings);
            } catch (error) {
                console.error('Error loading settings:', error);
                return DEFAULT_SETTINGS;
            }
        }
        return DEFAULT_SETTINGS;
    });

    // Auto-guardar configuración cuando cambie
    useEffect(() => {
        const timer = setTimeout(() => {
            saveSettings();
        }, 500);

        return () => clearTimeout(timer);
    }, [settings]);

    const updateLanguage = useCallback((language: Language) => {
        setSettings(prev => ({
            ...prev,
            language,
            lastModified: new Date().toISOString(),
        }));
    }, []);

    const updateAudio = useCallback((audio: Partial<AudioSettings>) => {
        setSettings(prev => ({
            ...prev,
            audio: { ...prev.audio, ...audio },
            lastModified: new Date().toISOString(),
        }));
    }, []);

    const updateVideo = useCallback((video: Partial<VideoSettings>) => {
        setSettings(prev => ({
            ...prev,
            video: { ...prev.video, ...video },
            lastModified: new Date().toISOString(),
        }));

        // Aplicar brillo en tiempo real
        if (video.brightness !== undefined) {
            document.documentElement.style.filter = `brightness(${50 + video.brightness / 2}%)`;
        }
    }, []);

    const updateGameplay = useCallback((gameplay: Partial<GameplaySettings>) => {
        setSettings(prev => ({
            ...prev,
            gameplay: { ...prev.gameplay, ...gameplay },
            lastModified: new Date().toISOString(),
        }));
    }, []);

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS);
        document.documentElement.style.filter = 'brightness(100%)';
    }, []);

    const saveSettings = useCallback(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }, [settings]);

    const value: SettingsContextType = {
        settings,
        updateLanguage,
        updateAudio,
        updateVideo,
        updateGameplay,
        resetSettings,
        saveSettings,
    };

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export default SettingsContext; 