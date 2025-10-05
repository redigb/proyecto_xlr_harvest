// ==============================================
// GAME CONTAINER - Contenedor Principal del Juego - ESTILO CLASH ROYALE
// ==============================================

import React, { ReactNode } from 'react';

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
  backgroundImage = "/assets/images/backgrounds/imagenfondo.jpeg"
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
              
              {/* Logo con árbol SVG mejorado */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  {/* Contenedor del logo con efectos */}
                  <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-game-xl shadow-game-lg border-2 border-white/20 backdrop-blur-xl flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:border-primary-400/60 group-hover:shadow-premium cursor-pointer">
                    {/* Logo Árbol SVG Mejorado */}
                    <svg 
                      width="48" 
                      height="48" 
                      viewBox="0 0 48 48" 
                      fill="none"
                      className="transition-transform duration-500 group-hover:scale-110"
                    >
                      {/* Sombra del árbol */}
                      <ellipse cx="24" cy="38" rx="8" ry="2" fill="black" fillOpacity="0.3" />
                      
                      {/* Tronco con detalles */}
                      <path 
                        d="M22 26L24 38L26 26V20H22V26Z" 
                        fill="#C59B6D" 
                        stroke="#8B5A2B" 
                        strokeWidth="2"
                      />
                      <path 
                        d="M22 20H26L25 22H23L22 20Z" 
                        fill="#A5D6A7" 
                        opacity="0.3"
                      />
                      
                      {/* Copa del árbol principal */}
                      <path 
                        d="M12 18C12 18 18 8 24 8C30 8 36 18 36 18C36 24 30 28 24 28C18 28 12 24 12 18Z" 
                        fill="#2E7D32" 
                        stroke="#1B5E20" 
                        strokeWidth="2"
                      />
                      
                      {/* Capas de follaje para profundidad */}
                      <path 
                        d="M14 16C14 16 19 12 24 12C29 12 34 16 34 16C34 20 29 23 24 23C19 23 14 20 14 16Z" 
                        fill="#4CAF50" 
                        opacity="0.8"
                      />
                      <path 
                        d="M16 14C16 14 20 11 24 11C28 11 32 14 32 14C32 17 28 19 24 19C20 19 16 17 16 14Z" 
                        fill="#66BB6A" 
                        opacity="0.6"
                      />
                      
                      {/* Frutos dorados */}
                      <circle cx="20" cy="14" r="2" fill="#F9A825" stroke="#FFD54F" strokeWidth="1" />
                      <circle cx="28" cy="16" r="1.5" fill="#F9A825" stroke="#FFD54F" strokeWidth="1" />
                      <circle cx="24" cy="12" r="2.5" fill="#F9A825" stroke="#FFD54F" strokeWidth="1" />
                      <circle cx="17" cy="18" r="1.5" fill="#F9A825" stroke="#FFD54F" strokeWidth="1" />
                      
                      {/* Destellos en los frutos */}
                      <path 
                        d="M22 10L23 11L22 12L21 11L22 10Z" 
                        fill="white" 
                        opacity="0.8"
                      />
                    </svg>
                  </div>
                  
                  {/* Efecto de brillo externo */}
                  <div className="absolute -inset-2 rounded-game-xl bg-gradient-to-r from-primary-400/20 to-accent-sun-400/20 blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
                  
                  {/* Partículas alrededor del logo */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-sun-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200 animate-ping" />
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-300 animate-ping" />
                </div>
                
                {/* Título del juego con mejor contraste */}
                <div className="flex flex-col">
                  <h1 className="font-display text-4xl text-white tracking-wider text-shadow-game-lg drop-shadow-2xl">
                    FARM BEST
                  </h1>
                  <p className="text-accent-sun-300 font-game text-lg font-bold tracking-wide drop-shadow-lg mt-1">
                    Farm & Garden
                  </p>
                </div>
              </div>

              {/* Stats del jugador - Más sutiles */}
              <div className="flex items-center gap-4">
                <div className="bg-white/10 backdrop-blur-xl rounded-game-lg px-4 py-3 border border-white/20 shadow-game">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="font-game text-white font-bold text-lg">Nivel 15</p>
                      <p className="text-primary-300 text-sm">Granjero</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-xl rounded-game-lg px-4 py-3 border border-white/20 shadow-game">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="font-game text-white font-bold text-lg">2.5K</p>
                      <p className="text-accent-sun-300 text-sm">Oro</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* 🎯 CONTENIDO PRINCIPAL */}
        <main className="flex-1 flex items-center justify-center p-6 pt-32 pb-24">
          <div className="w-full max-w-6xl mx-auto">
            {children}
          </div>
        </main>

        {/* 🏰 FOOTER MEJORADO */}
        {showFooter && (
          <footer className="absolute bottom-0 left-0 right-0 z-20 p-6">
            <div className="flex justify-between items-center">
              
              {/* Stats del juego */}
              <div className="bg-white/5 backdrop-blur-lg rounded-game-lg px-4 py-2 border border-white/10">
                <p className="text-white font-game text-sm">
                  <span className="text-primary-300">Cosechas:</span> 128
                </p>
              </div>

              {/* Copyright con mejor contraste */}
              <div className="text-center bg-white/5 backdrop-blur-lg rounded-game-lg px-6 py-3 border border-white/10">
                <p className="text-white font-game text-sm font-bold">
                  © 2025 <span className="text-primary-300">XLR HARVEST</span>
                </p>
                <p className="text-white/80 text-xs mt-1">
                  Premium Farming Experience
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