
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';


interface Crop {
  name: string;
  region: 'Costa' | 'Sierra' | 'Selva';
  difficulty: 'Fácil' | 'Media' | 'Difícil';
  idealHumidity: number;
  idealTemp: number;
}

interface Coordinates {
  lat: number;
  lon: number;
}

interface EnvData {
  elevation: number;
  humidity: number;
  temperature: number;
}

interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  currentLevel: number;
  score: number;
  xp: number;
  playerName: string;
  region: 'Costa' | 'Sierra' | 'Selva' | null;
  selectedCrop: Crop | null;
  coords: Coordinates | null;
  crops: Crop[];
  envData: EnvData | null;
  message: string | null;
  gameOverReason?: string;
}

interface GameContextType {
  gameState: GameState;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  quitGame: () => void;
  restartGame: () => void;
  setPlayerName: (name: string) => void;
  setCoordinates: (coords: Coordinates) => Promise<void>;
  selectCrop: (cropName: string) => void;
  updateScore: (points: number) => void;
  triggerGameOver: (reason: string) => void;
}

//
// 🌾 Datos base de cultivos
//
const defaultCrops: Crop[] = [
  { name: 'Arroz', region: 'Costa', difficulty: 'Fácil', idealHumidity: 80, idealTemp: 28 },
  { name: 'Caña de azúcar', region: 'Costa', difficulty: 'Media', idealHumidity: 75, idealTemp: 30 },
  { name: 'Uva', region: 'Costa', difficulty: 'Difícil', idealHumidity: 60, idealTemp: 26 },

  { name: 'Papa', region: 'Sierra', difficulty: 'Fácil', idealHumidity: 70, idealTemp: 15 },
  { name: 'Maíz', region: 'Sierra', difficulty: 'Media', idealHumidity: 65, idealTemp: 18 },
  { name: 'Quinua', region: 'Sierra', difficulty: 'Difícil', idealHumidity: 55, idealTemp: 14 },

  { name: 'Café', region: 'Selva', difficulty: 'Media', idealHumidity: 85, idealTemp: 26 },
  { name: 'Cacao', region: 'Selva', difficulty: 'Media', idealHumidity: 90, idealTemp: 27 },
  { name: 'Plátano', region: 'Selva', difficulty: 'Fácil', idealHumidity: 85, idealTemp: 28 },
];

//
// ⚙️ Estado inicial del juego
//
const defaultGameState: GameState = {
  isPlaying: false,
  isPaused: false,
  isGameOver: false,
  currentLevel: 1,
  score: 0,
  xp: 0,
  playerName: 'Jugador',
  region: null,
  selectedCrop: null,
  coords: null,
  crops: defaultCrops,
  envData: null,
  message: null,
  gameOverReason: undefined,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

//
// 🧠 Funciones auxiliares
//
function detectRegion(elevation: number, humidity: number): 'Costa' | 'Sierra' | 'Selva' {
  if (elevation < 500 && humidity < 0.7) return 'Costa';
  if (elevation >= 500 && elevation <= 3500) return 'Sierra';
  return 'Selva';
}

async function fetchElevation(lat: number, lon: number): Promise<number> {
  try {
    const res = await fetch(`https://api.opentopodata.org/v1/srtm90m?locations=${lat},${lon}`);
    const data = await res.json();
    return data.results?.[0]?.elevation ?? 0;
  } catch {
    return 0;
  }
}

async function fetchSoilHumidity(lat: number, lon: number): Promise<number> {
  // Simulación temporal: valor entre 0.4 y 0.9
  return 0.4 + Math.random() * 0.5;
}

async function fetchTemperature(lat: number, lon: number): Promise<number> {
  // Simulación temporal: valor entre 10 y 35 °C
  return 10 + Math.random() * 25;
}

//
// 🌍 Contexto principal del juego
//
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem('farmharvest_save');
    return saved ? JSON.parse(saved) : defaultGameState;
  });

  useEffect(() => {
    localStorage.setItem('farmharvest_save', JSON.stringify(gameState));
  }, [gameState]);

  //
  // 🎮 FUNCIONES DEL JUEGO
  //
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      isGameOver: false,
      score: 0,
      xp: 0,
      message: '🌾 ¡Comienza tu aventura agrícola!',
      gameOverReason: undefined,
    }));
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: true, message: '⏸️ Juego pausado.' }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPaused: false, message: '▶️ Continuando...' }));
  }, []);

  const quitGame = useCallback(() => {
    localStorage.removeItem('farmharvest_save');
    setGameState(defaultGameState);
  }, []);

  const restartGame = useCallback(() => {
    setGameState(prev => ({
      ...defaultGameState,
      playerName: prev.playerName,
      isPlaying: true,
      message: '🔄 Nuevo intento. ¡Aprende y mejora tu campo!',
    }));
  }, []);

  const setPlayerName = useCallback((name: string) => {
    setGameState(prev => ({
      ...prev,
      playerName: name.trim() || 'Jugador',
      message: `👩‍🌾 ¡Hola ${name}!`,
    }));
  }, []);

  //
  // 📡 Detectar región + condiciones ambientales
  //
  const setCoordinates = useCallback(async (coords: Coordinates) => {
    setGameState(prev => ({ ...prev, coords, message: '📡 Analizando terreno...' }));

    const [elevation, humidity, temperature] = await Promise.all([
      fetchElevation(coords.lat, coords.lon),
      fetchSoilHumidity(coords.lat, coords.lon),
      fetchTemperature(coords.lat, coords.lon),
    ]);

    const region = detectRegion(elevation, humidity);

    setGameState(prev => ({
      ...prev,
      coords,
      region,
      envData: { elevation, humidity, temperature },
      message: `🌎 Región detectada: ${region} | Elev: ${Math.round(
        elevation
      )}m | Hum: ${(humidity * 100).toFixed(1)}% | Temp: ${temperature.toFixed(1)}°C`,
    }));
  }, []);

  //
  // 🌾 Selección de cultivo
  //
  const selectCrop = useCallback((cropName: string) => {
    setGameState(prev => {
      const crop = prev.crops.find(c => c.name === cropName);
      if (!crop) return { ...prev, message: '⚠️ Cultivo no encontrado.' };
      if (crop.region !== prev.region)
        return { ...prev, message: `❌ ${crop.name} no crece bien en la región ${prev.region}.` };
      return {
        ...prev,
        selectedCrop: crop,
        message: `🌱 Has sembrado ${crop.name} en la región ${prev.region}. ¡Cuídalo bien!`,
      };
    });
  }, []);

  //
  // 💰 Actualizar puntaje
  //
  const updateScore = useCallback((points: number) => {
    setGameState(prev => {
      const newScore = prev.score + points;
      if (newScore <= 0) {
        return {
          ...prev,
          score: 0,
          isPlaying: false,
          isGameOver: true,
          message: '💀 Se agotaron tus recursos.',
          gameOverReason: 'Pérdida total de recursos',
        };
      }
      return {
        ...prev,
        score: newScore,
        xp: prev.xp + Math.floor(points / 10),
        message: `💰 Ganaste ${points} puntos.`,
      };
    });
  }, []);

  //
  // ☠️ Game Over manual o climático
  //
  const triggerGameOver = useCallback((reason: string) => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isGameOver: true,
      message: `💀 Juego terminado: ${reason}`,
      gameOverReason: reason,
    }));
  }, []);

  //
  // 🌦️ Monitoreo climático automático
  //
  useEffect(() => {
    if (!gameState.isPlaying || !gameState.selectedCrop || !gameState.envData) return;

    const { humidity, temperature } = gameState.envData;
    const { idealHumidity, idealTemp, name } = gameState.selectedCrop;

    // Tolerancia según tipo de cultivo
    const tolerance = 10; // ±10% humedad / ±5°C temperatura

    const tooDry = humidity * 100 < idealHumidity - tolerance;
    const tooWet = humidity * 100 > idealHumidity + tolerance;
    const tooHot = temperature > idealTemp + 5;
    const tooCold = temperature < idealTemp - 5;

    if (tooDry)
      triggerGameOver(`💧 Falta de agua: el suelo está demasiado seco para ${name}.`);
    else if (tooWet)
      triggerGameOver(`🌊 Exceso de humedad: las raíces de ${name} se pudrieron.`);
    else if (tooHot)
      triggerGameOver(`🔥 Estrés térmico: ${name} no soportó ${temperature.toFixed(1)}°C.`);
    else if (tooCold)
      triggerGameOver(`❄️ Helada: ${name} sufrió daños por frío extremo.`);

  }, [gameState.envData, gameState.selectedCrop, gameState.isPlaying, triggerGameOver]);

  //
  // 🎯 Exportar valores del contexto
  //
  const value: GameContextType = {
    gameState,
    startGame,
    pauseGame,
    resumeGame,
    quitGame,
    restartGame,
    setPlayerName,
    setCoordinates,
    selectCrop,
    updateScore,
    triggerGameOver,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

//
// 🔎 Hook para usar el contexto
//
export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};

export default GameContext;
