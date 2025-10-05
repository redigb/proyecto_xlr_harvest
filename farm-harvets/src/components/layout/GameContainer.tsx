import type { ReactNode } from 'react';

interface GameContainerProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  backgroundImage?: string;
}

const GameContainer: React.FC<GameContainerProps> = ({
  children,
  showHeader = true,
  showFooter = true,
  backgroundImage = "/assets/images/backgrounds/imagenfondo.png"
}) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* 🎨 FONDO CON IMAGEN Y OVERLAYS */}
      <div className="absolute inset-0 z-0">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${backgroundImage}')`,
          }}
        />

        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* Overlay de color temático */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-primary-800/15 to-accent-sun-900/10" />

        {/* Patrón sutil de textura */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(46, 125, 50, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(249, 168, 37, 0.2) 0%, transparent 50%)
            `,
          }}
        />
      </div>

      {/* 🎪 CONTENEDOR DE CONTENIDO */}
      <div className="relative z-10 min-h-screen flex flex-col">

        {/* 🏰 HEADER ESTILO CLASH ROYALE */}
        {showHeader && (
          <header className="absolute top-0 left-0 right-0 z-20 p-6">
            <div className="flex justify-between items-center">
              {/* Logo con imagen PNG - MEJORADO */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  {/* Logo directo más grande sin contenedor */}
                  <img
                    src="/assets/images/backgrounds/logoharv.png"
                    alt="Harvest Logo"
                    className="w-24 h-24 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:brightness-125 drop-shadow-game-lg cursor-pointer"
                  />

                  {/* Partículas alrededor del logo mejoradas */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-accent-sun-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200 animate-ping" />
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300 animate-ping" />
                  <div className="absolute top-1/2 -right-2 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-400 animate-ping" />
                </div>
              </div>
            </div>
          </header>
        )}



        {/* 🎯 CONTENIDO PRINCIPAL */}
        <main className="flex-1 w-full py-3 md:py-4 px-3 md:px-4">
          <div className="w-full max-w-lg mx-auto transform scale-80 md:scale-90 lg:scale-95 xl:scale-100">
            {children}
          </div>
        </main>

        {/* 🏰 FOOTER MEJORADO */}
        {showFooter && (
          <footer className="absolute bottom-0 left-0 right-0 z-20 p-6">
            <div className="flex justify-between items-center">



              {/* Copyright con mejor contraste */}
              <div className="text-center bg-white/5 backdrop-blur-lg rounded-game-lg px-6 py-3 border border-white/10">
                <p className="text-white font-game text-sm font-bold">
                  © 2025 <span className="text-primary-300">FARM HARVEST</span>
                </p>
                <p className="text-white/80 text-xs mt-1">
                  Developed by the Harvest team
                </p>
              </div>

              {/* Información de versión */}
              <div className="bg-white/5 backdrop-blur-lg rounded-game-lg px-4 py-2 border border-white/10">
                <p className="text-white font-game text-sm">
                  v1.0.0
                </p>
              </div>
            </div>
          </footer>
        )}
      </div>

      {/* ✨ EFECTOS DE BORDE MEJORADOS */}
      <div className="absolute inset-0 pointer-events-none z-5 overflow-hidden">
        {/* Bordes luminosos sutiles */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-400/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent-sun-400/20 to-transparent" />

        {/* Esquinas decorativas transparentes */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary-400/30 rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary-400/30 rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-accent-sun-400/30 rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-accent-sun-400/30 rounded-br-lg" />
      </div>

      {/* 🌟 EFECTO VIGNETTE MEJORADO */}
      <div
        className="absolute inset-0 pointer-events-none z-1"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.5) 100%)',
        }}
      />
    </div>
  );
};

export default GameContainer;