export type Language = 'es' | 'en' | 'fr' | 'de' | 'pt' | 'it' | 'ja' | 'zh';

export interface LanguageOption {
    code: Language;
    name: string;
    nativeName: string;
    flag: string;
}

// === TIPOS DE AUDIO ===
export interface AudioSettings {
    masterVolume: number;  // 0-100
    musicVolume: number;   // 0-100
    sfxVolume: number;     // 0-100
    voiceVolume: number;   // 0-100
    muted: boolean;
}

// === TIPOS DE VIDEO/BRILLO ===
export interface VideoSettings {
    brightness: number;     // 0-100
    contrast: number;       // 0-100
    gamma: number;          // 0-100
    quality: 'low' | 'medium' | 'high' | 'ultra';
    fullscreen: boolean;
    vsync: boolean;
    fps: number;
}

// === TIPOS DE VELOCIDAD/GAMEPLAY ===
export interface GameplaySettings {
    gameSpeed: number;          // 0.5 - 2.0 (multiplicador)
    textSpeed: number;          // 0-100
    autoSaveInterval: number;   // minutos
    difficulty: 'easy' | 'normal' | 'hard' | 'hardcore';
}

// === CONFIGURACIÓN COMPLETA ===
export interface Settings {
    language: Language;
    audio: AudioSettings;
    video: VideoSettings;
    gameplay: GameplaySettings;
    accessibility: AccessibilitySettings;
    lastModified: string;
}

// === ACCESIBILIDAD ===
export interface AccessibilitySettings {
    colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
    highContrast: boolean;
    largeText: boolean;
    screenShake: boolean;
    flashingEffects: boolean;
    subtitles: boolean;
}

// === CONFIGURACIÓN POR DEFECTO ===
export const DEFAULT_SETTINGS: Settings = {
    language: 'es',
    audio: {
        masterVolume: 80,
        musicVolume: 70,
        sfxVolume: 80,
        voiceVolume: 100,
        muted: false,
    },
    video: {
        brightness: 50,
        contrast: 50,
        gamma: 50,
        quality: 'high',
        fullscreen: false,
        vsync: true,
        fps: 60,
    },
    gameplay: {
        gameSpeed: 1.0,
        textSpeed: 50,
        autoSaveInterval: 5,
        difficulty: 'normal',
    },
    accessibility: {
        colorBlindMode: 'none',
        highContrast: false,
        largeText: false,
        screenShake: true,
        flashingEffects: true,
        subtitles: false,
    },
    lastModified: new Date().toISOString(),
};

// === OPCIONES DE IDIOMA ===
export const LANGUAGE_OPTIONS: LanguageOption[] = [
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
];

// === OPCIONES DE CALIDAD ===
export const QUALITY_OPTIONS = [
    { value: 'low', label: 'Baja' },
    { value: 'medium', label: 'Media' },
    { value: 'high', label: 'Alta' },
    { value: 'ultra', label: 'Ultra' },
] as const;

// === OPCIONES DE DIFICULTAD ===
export const DIFFICULTY_OPTIONS = [
    { value: 'easy', label: 'Fácil', description: 'Experiencia relajada' },
    { value: 'normal', label: 'Normal', description: 'Equilibrio perfecto' },
    { value: 'hard', label: 'Difícil', description: 'Un verdadero desafío' },
    { value: 'hardcore', label: 'Hardcore', description: 'Solo para expertos' },
] as const;