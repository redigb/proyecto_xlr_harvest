import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react'; 

type SoundEffect = 'click' | 'hover' | 'select' | 'back' | 'error' | 'success';

interface AudioContextType {
    isMusicPlaying: boolean;
    volume: number;
    playSound: (sound: SoundEffect) => void;
    playMusic: () => void;
    pauseMusic: () => void;
    stopMusic: () => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    isMuted: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isMusicPlaying, setIsMusicPlaying] = useState(false);
    const [volume, setVolumeState] = useState(0.7);
    const [isMuted, setIsMuted] = useState(false);

    const musicRef = useRef<HTMLAudioElement | null>(null);
    const soundsRef = useRef<Map<SoundEffect, HTMLAudioElement>>(new Map());

    // Inicializar audio (lazy loading)
    const initializeAudio = useCallback(() => {
        if (!musicRef.current) {
            // Aquí cargarías tu música de fondo
            // musicRef.current = new Audio('/assets/sounds/music/menu-theme.mp3');
            // musicRef.current.loop = true;
        }

        // Cargar efectos de sonido
        const soundEffects: SoundEffect[] = ['click', 'hover', 'select', 'back', 'error', 'success'];
        soundEffects.forEach(sound => {
            if (!soundsRef.current.has(sound)) {
                // Aquí cargarías tus efectos de sonido
                // const audio = new Audio(`/assets/sounds/effects/${sound}.mp3`);
                // soundsRef.current.set(sound, audio);
            }
        });
    }, []);

    const playSound = useCallback((sound: SoundEffect) => {
        if (isMuted) return;

        initializeAudio();
        const audio = soundsRef.current.get(sound);

        if (audio) {
            audio.volume = volume * 0.5; // Los efectos suenan más bajo que la música
            audio.currentTime = 0;
            audio.play().catch(err => console.log('Audio play prevented:', err));
        } else {
            // Sonido de respaldo usando Web Audio API
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Diferentes frecuencias para diferentes sonidos
            const frequencies: Record<SoundEffect, number> = {
                click: 800,
                hover: 600,
                select: 1000,
                back: 500,
                error: 300,
                success: 1200,
            };

            oscillator.frequency.value = frequencies[sound];
            gainNode.gain.value = volume * 0.1;

            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
        }
    }, [isMuted, volume, initializeAudio]);

    const playMusic = useCallback(() => {
        initializeAudio();
        if (musicRef.current && !isMuted) {
            musicRef.current.volume = volume;
            musicRef.current.play().catch(err => console.log('Music play prevented:', err));
            setIsMusicPlaying(true);
        }
    }, [volume, isMuted, initializeAudio]);

    const pauseMusic = useCallback(() => {
        if (musicRef.current) {
            musicRef.current.pause();
            setIsMusicPlaying(false);
        }
    }, []);

    const stopMusic = useCallback(() => {
        if (musicRef.current) {
            musicRef.current.pause();
            musicRef.current.currentTime = 0;
            setIsMusicPlaying(false);
        }
    }, []);

    const setVolume = useCallback((newVolume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        setVolumeState(clampedVolume);

        if (musicRef.current) {
            musicRef.current.volume = clampedVolume;
        }
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => {
            const newMuted = !prev;
            if (musicRef.current) {
                musicRef.current.muted = newMuted;
            }
            return newMuted;
        });
    }, []);

    const value: AudioContextType = {
        isMusicPlaying,
        volume,
        playSound,
        playMusic,
        pauseMusic,
        stopMusic,
        setVolume,
        toggleMute,
        isMuted,
    };

    return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = (): AudioContextType => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};

export default AudioContext;