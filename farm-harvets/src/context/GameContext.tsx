import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react'; 

interface GameState {
    isPlaying: boolean;
    isPaused: boolean;
    currentLevel: number;
    score: number;
    playerName: string;
}

interface GameContextType {
    gameState: GameState;
    startGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    quitGame: () => void;
    setPlayerName: (name: string) => void;
    updateScore: (points: number) => void;
}

const defaultGameState: GameState = {
    isPlaying: false,
    isPaused: false,
    currentLevel: 1,
    score: 0,
    playerName: 'Player',
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [gameState, setGameState] = useState<GameState>(defaultGameState);

    const startGame = useCallback(() => {
        setGameState(prev => ({
            ...prev,
            isPlaying: true,
            isPaused: false,
            currentLevel: 1,
            score: 0,
        }));
    }, []);

    const pauseGame = useCallback(() => {
        setGameState(prev => ({ ...prev, isPaused: true }));
    }, []);

    const resumeGame = useCallback(() => {
        setGameState(prev => ({ ...prev, isPaused: false }));
    }, []);

    const quitGame = useCallback(() => {
        setGameState(defaultGameState);
    }, []);

    const setPlayerName = useCallback((name: string) => {
        setGameState(prev => ({ ...prev, playerName: name }));
    }, []);

    const updateScore = useCallback((points: number) => {
        setGameState(prev => ({ ...prev, score: prev.score + points }));
    }, []);

    const value: GameContextType = {
        gameState,
        startGame,
        pauseGame,
        resumeGame,
        quitGame,
        setPlayerName,
        updateScore,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

export default GameContext;