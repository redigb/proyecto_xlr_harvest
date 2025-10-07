import { useEffect, useRef } from 'react';

interface CreditsScreenProps {
  onBack: () => void;
}

const CreditsScreen: React.FC<CreditsScreenProps> = ({ onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const credits = [
    {
      role: 'FULLSTACK DEVELOPER',
      people: ['Renzo  - Systems Engineer'],
    },
    {
      role: 'FULLSTACK DEVELOPER',
      people: ['Leo Lucas - Systems Engineer'],
    },
    {
      role: 'FULLSTACK DEVELOPER',
      people: ['Xander - Systems Engineer'],
    },
    {
      role: 'FULLSTACK DEVELOPER',
      people: ['Luis Flores - Systems Engineer'],
    },
    {
      role: 'FRONTEND DEVELOPER',
      people: ['Jhonn Clemente - frontend developer'],
    },
    {
      role: 'TECHNOLOGIES USED',
      people: ['React 18 + TypeScript', 'Vite + Tailwind CSS', 'Three.js Integration', 'Web Audio API', 'Leaflet Maps'],
    },
    {
      role: 'SCIENTIFIC DATA',
      people: ['NASA SMAP Soil Moisture', 'NASA GPM Precipitation', 'NASA MODIS Vegetation', 'Earth Observing System'],
    },
    {
      role: 'SPECIAL THANKS',
      people: ['NASA - For providing us with space tools', 'Open Source Community', 'Anthropic Claude AI', 'XLR Development Team'],
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const maxBlur = 12;
        const blurValue = Math.min(scrollTop / 30, maxBlur);
        const scaleValue = 1 - Math.min(scrollTop / 2000, 0.1);
        
        containerRef.current.style.backdropFilter = `blur(${blurValue}px)`;
        containerRef.current.style.transform = `scale(${scaleValue})`;
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-darker/95">
      {/* Fondo con efecto de espacio/NASA */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-darker/90 to-accent-sun/3 animate-pulse-slow"></div>
      
      {/* Estrellas animadas */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-primary/15 to-accent-sun/8 animate-float"
            style={{
              width: Math.random() * 60 + 30,
              height: Math.random() * 60 + 30,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 8 + 8}s`,
              filter: 'blur(8px)',
            }}
          />
        ))}
      </div>

      {/* Contenido principal con zoom reducido */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen w-full px-4 py-6 transform scale-95">
        
        {/* Encabezado NASA-style */}
        <div className="mb-6 md:mb-8 text-center animate-fade-in">
          <div className="relative inline-block mb-2">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-transparent bg-gradient-to-r from-primary via-accent-sun to-accent-gold bg-clip-text mb-2 tracking-widest drop-shadow-2xl">
              CRÉDITOS
            </h2>
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-accent-sun/20 blur-xl -z-10 rounded-full opacity-60"></div>
          </div>
          
          <div className="space-y-1">
            <p className="text-lg md:text-xl text-muted font-mono tracking-widest">
              🌾 XLR HARVEST 3D
            </p>
            <p className="text-sm md:text-base text-primary/80 font-sans max-w-2xl leading-tight">
              Sustainable Farming Simulator using NASA Earth Data
            </p>
          </div>
        </div>

        {/* Descripción del proyecto */}
        <div className="w-full max-w-3xl mb-6 text-center animate-fade-in">
          <div className="bg-card/40 backdrop-blur-md rounded-game-lg p-4 border border-white/5 shadow-game">
            <p className="text-white/90 text-sm md:text-base leading-relaxed italic">
              "XLR Harvest 3D is an interactive educational game developed with Three.js and Leaflet, 
              using real NASA data (SMAP, GPM, MODIS) to simulate sustainable farming practices."
            </p>
          </div>
        </div>

        {/* Contenedor de créditos transparente */}
        <div 
          ref={containerRef}
          className="w-full max-w-2xl max-h-[50vh] md:max-h-[60vh] overflow-y-auto rounded-game-xl backdrop-blur-md bg-black/30 border border-white/10 shadow-2xl custom-scrollbar transition-all duration-700 transform-gpu"
          style={{ transform: 'scale(0.92)' }}
        >
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {credits.map((section, index) => (
              <div
                key={section.role}
                className="group animate-fadeInGlass"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                {/* Tarjeta ultra transparente */}
                <div className="bg-gradient-to-r from-black/20 to-black/40 rounded-game-lg p-4 md:p-5 border border-white/5 shadow-game hover:shadow-game-lg hover:border-primary/20 transition-all duration-500 hover:scale-[1.01] backdrop-blur-sm">
                  
                  {/* Header de sección minimalista */}
                  <div className="flex items-center mb-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-primary to-accent-sun rounded-full mr-3 group-hover:animate-pulse"></div>
                    <h3 className="font-mono text-sm md:text-base font-bold text-transparent bg-gradient-to-r from-white to-accent-sun-100 bg-clip-text tracking-widest uppercase">
                      {section.role}
                    </h3>
                  </div>

                  {/* Lista compacta */}
                  <div className="space-y-2 pl-4">
                    {section.people.map((person, personIndex) => (
                      <div 
                        key={person} 
                        className="flex items-center space-x-2 animate-slide-in-left"
                        style={{ animationDelay: `${(index * 120) + (personIndex * 80)}ms` }}
                      >
                        <div className="w-1.5 h-1.5 bg-accent-sun rounded-full flex-shrink-0 opacity-70"></div>
                        <p className="text-white/90 text-xs md:text-sm font-sans font-medium leading-relaxed">
                          {person}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Mensaje final NASA-focused */}
            <div className="text-center py-6 md:py-8 animate-fade-in" style={{ animationDelay: '1000ms' }}>
              <div className="relative inline-block mb-4">
                <div className="text-2xl md:text-3xl mb-3">🛰️🌱</div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/15 to-accent-sun/15 blur-lg rounded-full"></div>
              </div>
              
                <p className="text-lg md:text-xl text-transparent bg-gradient-to-r from-accent-sun to-accent-gold bg-clip-text font-display mb-3 italic">
                "Agricultural innovation with space technology"
                </p>
              
              <div className="bg-black/30 rounded-game p-3 mb-4">
                <p className="text-white/80 text-xs md:text-sm leading-relaxed">
                  Thanks to NASA for providing satellite data that makes it possible 
                  to simulate sustainable agriculture with scientific accuracy.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-4 text-muted text-xs md:text-sm font-mono">
                <span>v1.0.0</span>
                <span>•</span>
                <span>NASA Data Integration</span>
                <span>•</span>
                <span>Educational Edition</span>
              </div>
              
              <p className="text-muted text-xs mt-4 tracking-widest uppercase">
                © 2025 XLR Harvest Studios × NASA Earth Data
              </p>
            </div>
          </div>
        </div>

        {/* Botón de regreso */}
        {/* Botón de regreso premium con animaciones mejoradas */}
        <div 
          className="mt-6 md:mt-8 animate-fade-in flex justify-center"
          style={{ animationDelay: '1300ms', marginTop: '-25px' }}
        >
          <button
            onClick={onBack}
            className="group relative flex items-center gap-3 px-6 py-3 rounded-game-lg bg-gradient-to-r from-card/80 to-card-hover/80 border border-white/10 hover:border-primary/40 shadow-game hover:shadow-game-lg transition-all duration-500 hover:scale-105 active:scale-95 overflow-hidden"
          >
            {/* Efecto de fondo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 transform -skew-x-12 transition-all duration-700 group-hover:translate-x-full"></div>
            
            {/* Icono con animación mejorada */}
            <div className="relative z-10 flex items-center gap-3">
              <svg
                className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300 text-primary group-hover:text-accent-sun"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              
              {/* Texto con gradiente */}
              <span className="font-display font-semibold text-transparent bg-gradient-to-r from-white to-accent-sun-200 bg-clip-text tracking-wider text-sm md:text-base">
                VOLVER AL MENÚ
              </span>
            </div>

            {/* Efecto de brillo al hover */}
            <div className="absolute inset-0 rounded-game-lg bg-gradient-to-r from-primary/20 to-accent-sun/20 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500 -z-10"></div>
          </button>
        </div>
      </div>

      {/* Efectos de borde sutil */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-accent-sun/40 to-transparent animate-pulse"></div>
    </div>
  );
};

export default CreditsScreen;