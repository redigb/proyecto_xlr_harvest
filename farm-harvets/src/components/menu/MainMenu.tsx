import { useState, useEffect } from 'react';
import { useAudio } from '../../context/AudioContext';
import MenuItem from './MenuItem';
import type { Screen } from '../../App';

interface MainMenuProps {
  onNavigate: (screen: Screen) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onNavigate }) => {
  const { playSound } = useAudio();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const menuItems = [
    {
      id: 'start',
      label: 'START GAME',
      icon: '⚔️',
      description: 'Begin a new adventure',
      screen: 'start' as Screen,
    },
    {
      id: 'settings',
      label: 'SETTINGS',
      icon: '🎛️',
      description: 'Adjust audio and controls',
      screen: 'settings' as Screen,
    },
    {
      id: 'credits',
      label: 'CREDITS',
      icon: '👑',
      description: 'Meet the development team',
      screen: 'credits' as Screen,
    },
  ];

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Navegación con teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : menuItems.length - 1));
          playSound('hover');
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev < menuItems.length - 1 ? prev + 1 : 0));
          playSound('hover');
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          playSound('select');
          setTimeout(() => onNavigate(menuItems[selectedIndex].screen), 200);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, menuItems, playSound, onNavigate]);

  const handleItemClick = (screen: Screen, index: number) => {
    setSelectedIndex(index);
    playSound('select');
    setTimeout(() => onNavigate(screen), 200);
  };

  const handleItemHover = (index: number) => {
    if (index !== selectedIndex) {
      setSelectedIndex(index);
      playSound('hover');
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen w-full px-4 transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>

      {/* 🏰 LOGO Y TÍTULO PRINCIPAL */}
      <div className="mb-16 text-center animate-fade-in">
        <div className="relative inline-block">
          {/* Efecto de brillo detrás del título */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary-400/20 to-accent-sun-400/20 blur-xl rounded-full opacity-60 animate-pulse-slow" />

          <h1 className="relative font-display text-4xl md:text-5xl text-white tracking-wider text-shadow-game-lg mb-4">
            FARM HARVEST
          </h1>

          {/* Línea decorativa */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="w-12 h-1 bg-gradient-to-r from-transparent to-primary-400 rounded-full" />
            <div className="w-3 h-3 bg-accent-sun-400 rounded-full animate-pulse" />
            <div className="w-12 h-1 bg-gradient-to-l from-transparent to-accent-sun-400 rounded-full" />
          </div>

          <p className="text-xl md:text-2xl text-accent-sun-300 font-game tracking-widest mt-6 text-shadow-game">
            Get ready to harvest!
          </p>
        </div>
      </div>

      {/* 🎯 MENÚ DE OPCIONES */}
      <div className="w-full max-w-2xl space-y-6 mb-20">
        {menuItems.map((item, index) => (
          <div
            key={item.id}
            className={`transition-all duration-500 transform ${isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
              }`}
            style={{ transitionDelay: `${index * 100 + 300}ms` }}
          >
            <MenuItem
              icon={item.icon}
              label={item.label}
              description={item.description}
              isSelected={selectedIndex === index}
              onClick={() => handleItemClick(item.screen, index)}
              onHover={() => handleItemHover(index)}
              delay={index * 100}
            />
          </div>
        ))}
      </div>


      {/* 🌟 DECORACIONES ADICIONALES */}


      {/* Esquina decorativa izquierda */}
      <div className="absolute top-8 left-8 opacity-40">
        <div className="w-6 h-6 border-t-2 border-l-2 border-primary-400 rounded-tl-lg" />
      </div>

      {/* Esquina decorativa derecha */}
      <div className="absolute top-8 right-8 opacity-40">
        <div className="w-6 h-6 border-t-2 border-r-2 border-accent-sun-400 rounded-tr-lg" />
      </div>

      {/* Indicador de selección actual */}
      <div className="absolute bottom-6 left-6 bg-white/5 backdrop-blur-sm rounded-game px-3 py-2 border border-white/10">
        <p className="text-white/70 font-game text-sm">
          {menuItems[selectedIndex]?.label}
        </p>
      </div>
    </div>
  );
};

export default MainMenu;