// ==============================================
// APP PRINCIPAL - XLR HARVEST GAME
// ==============================================

import React, { useState, useEffect } from 'react';
import { GameProvider } from './context/GameContext';
import { SettingsProvider } from './context/SettingsContext';
import { AudioProvider } from './context/AudioContext';
import GameContainer from './components/layout/GameContainer';
import MainMenu from './components/menu/MainMenu';
import SettingsMenu from './components/settings/SettingsMenu';
import CreditsScreen from './components/credits/CreditsScreen';
import ScreenTransition from './components/layout/ScreenTransition';

// Tipos de pantallas del juego
export type Screen = 'main' | 'start' | 'settings' | 'credits' | 'language' | 'audio' | 'brightness' | 'speed';
export type SettingsSection = 'settings' | 'language' | 'audio' | 'brightness' | 'speed';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Navegación con transición
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
      case 'start':
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-6xl font-display text-primary mb-4">
                INICIANDO JUEGO...
              </h1>
              <div className="animate-pulse text-secondary text-xl">
                Cargando recursos...
              </div>
            </div>
          </div>
        );
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
            XLR HARVEST
          </h1>
          <p className="text-secondary animate-pulse">Cargando...</p>
        </div>
      </div>
    );
  }

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