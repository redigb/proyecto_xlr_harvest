import { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { SettingsProvider } from './context/SettingsContext';
import { AudioProvider } from './context/AudioContext';
import GameContainer from './components/layout/GameContainer';
import MainMenu from './components/menu/MainMenu';
import SettingsMenu from './components/settings/SettingsMenu';
import CreditsScreen from './components/credits/CreditsScreen';
import ScreenTransition from './components/layout/ScreenTransition';

// Componentes del juego
import Mapa from './components/mapa/mapa';
import PlayerNameModal from './components/modals/PlayerNameModal';

export type Screen =
  | 'main'
  | 'start'
  | 'settings'
  | 'credits'
  | 'language'
  | 'audio'
  | 'brightness'
  | 'speed';

export type SettingsSection =
  | 'settings'
  | 'language'
  | 'audio'
  | 'brightness'
  | 'speed';

//
// 🌱 Subcomponente: pantalla de inicio del juego con detección de nombre
// --
const StartScreen: React.FC = () => {
  const { gameState, startGame } = useGame();
  const [showWelcome, setShowWelcome] = useState(false);

  const hasName =
    Boolean(gameState.playerName && gameState.playerName !== 'Jugador');

  // Si ya tiene nombre guardado, mostrar animación de bienvenida
  useEffect(() => {
    if (hasName) {
      setShowWelcome(true);
      const timer = setTimeout(() => {
        setShowWelcome(false);
        startGame(); // inicia automáticamente
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasName, startGame]);

  if (!hasName) {
    // Mostrar modal para ingresar nombre antes de iniciar
    return <PlayerNameModal />;
  }

  // Animación de bienvenida cuando ya se reconoce al jugador
  if (showWelcome) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-800 to-green-950 text-white animate-fadeIn">
        <div className="text-center">
          <h2 className="text-4xl font-display mb-3 animate-pulse">
            👩‍🌾 ¡Bienvenido de nuevo!
          </h2>
          <p className="text-lg opacity-90">
            {gameState.playerName}, tu campo te espera 🌾
          </p>
        </div>
      </div>
    );
  }

  // Si todo está listo, cargar el mapa principal
  return (
    <SettingsProvider>
      <AudioProvider>
        <Mapa />
      </AudioProvider>
    </SettingsProvider>
  );
};

//
// 🌾 Componente principal del juego
//
const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Simulación de carga inicial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Navegación entre pantallas
  const navigateTo = (screen: Screen) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen(screen);
      setIsTransitioning(false);
    }, 300);
  };

  // Renderizar pantalla actual
  const renderScreen = () => {
    switch (currentScreen) {
      case 'main':
        return <MainMenu onNavigate={navigateTo} />;
      case 'settings':
        return (
          <SettingsMenu
            currentSection="settings"
            onNavigate={navigateTo}
            onBack={() => navigateTo('main')}
          />
        );
      case 'language':
        return (
          <SettingsMenu
            currentSection="language"
            onNavigate={navigateTo}
            onBack={() => navigateTo('main')}
          />
        );
      case 'audio':
        return (
          <SettingsMenu
            currentSection="audio"
            onNavigate={navigateTo}
            onBack={() => navigateTo('main')}
          />
        );
      case 'brightness':
        return (
          <SettingsMenu
            currentSection="brightness"
            onNavigate={navigateTo}
            onBack={() => navigateTo('main')}
          />
        );
      case 'speed':
        return (
          <SettingsMenu
            currentSection="speed"
            onNavigate={navigateTo}
            onBack={() => navigateTo('main')}
          />
        );
      case 'credits':
        return <CreditsScreen onBack={() => navigateTo('main')} />;
      default:
        return <MainMenu onNavigate={navigateTo} />;
    }
  };

  // Pantalla de carga inicial
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-darker">
        <div className="text-center">
          <div
            className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-6"
            role="status"
            aria-label="Cargando"
          />
          <h1 className="text-4xl font-display text-primary mb-2">
            XLR Harvest TEAM
          </h1>
          <p className="text-secondary animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  //
  // 🔹 Pantalla de juego (Start)
  //
  if (currentScreen === 'start') {
    return (
      <GameProvider>
        <StartScreen />
      </GameProvider>
    );
  }

  //
  // 🔹 Menús generales
  //
  return (
    <GameProvider>
      <SettingsProvider>
        <AudioProvider>
          <GameContainer>
            <ScreenTransition isTransitioning={isTransitioning}>
              {renderScreen()}
            </ScreenTransition>
          </GameContainer>
        </AudioProvider>
      </SettingsProvider>
    </GameProvider>
  );
};

export default App;
