
import React from 'react';

const MenuBackground: React.FC = () => {

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F0A] via-[#1B5E20] to-[#0A1F0A]" />
      <div className="absolute top-20 left-20 w-80 h-80 bg-primary-400/15 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-sun-400/10 rounded-full blur-3xl animate-pulse-slow delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-200/8 rounded-full blur-2xl animate-float" />
      
      {/* 🏰 PATRÓN DE CASTILLO/CORONAS SUTIL */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(249, 168, 37, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 215, 0, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
          `,
        }}
      />
      
      {/* 🛡️ PATRÓN GEOMÉTRICO ESTILO CLASH */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(30deg, transparent 49%, rgba(255, 215, 0, 0.1) 50%, transparent 51%),
            linear-gradient(-30deg, transparent 49%, rgba(255, 215, 0, 0.1) 50%, transparent 51%)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute text-accent-sun-400/20 animate-float"
          style={{
            left: `${10 + (i * 15)}%`,
            top: `${20 + (Math.random() * 60)}%`,
            fontSize: `${24 + (i * 8)}px`,
            animationDelay: `${i * 2}s`,
            animationDuration: `${8 + (i * 2)}s`,
          }}
        >
          👑
        </div>
      ))}
      
      {/* 🛡️ ESCUDOS DECORATIVOS */}
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute text-primary-400/15 animate-float-slow"
          style={{
            right: `${15 + (i * 20)}%`,
            top: `${30 + (Math.random() * 40)}%`,
            fontSize: `${32 + (i * 12)}px`,
            animationDelay: `${i * 3}s`,
            animationDuration: `${12 + (i * 3)}s`,
          }}
        >
          🛡️
        </div>
      ))}
      
      {/* ⚔️ ESPADAS DECORATIVAS */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute text-white/10 animate-float-delay-1"
          style={{
            left: `${25 + (i * 25)}%`,
            bottom: `${15 + (Math.random() * 30)}%`,
            fontSize: `${20 + (i * 6)}px`,
            animationDelay: `${i * 4}s`,
            animationDuration: `${10 + (i * 2)}s`,
          }}
        >
          ⚔️
        </div>
      ))}
      
      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 85% 85%, rgba(255, 215, 0, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 60% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 30%),
            radial-gradient(circle at 30% 70%, rgba(255, 215, 0, 0.2) 0%, transparent 30%)
          `,
        }}
      />
      
      {/* 🌫️ EFECTO DE NIEBLA MÁGICA */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/5 to-transparent" />
      
      {/* ✨ PARTÍCULAS BRILLANTES */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-accent-sun-400 rounded-full animate-pulse opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
      
      {/* 🏯 BORDES DECORATIVOS */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-accent-sun-400/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-primary-400/20 to-transparent" />
      
      {/* 🎪 ESQUINAS DECORATIVAS */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-accent-sun-400/30 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-accent-sun-400/30 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary-400/30 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary-400/30 rounded-br-lg" />
      
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10, 31, 10, 0.8) 100%)',
        }}
      />
    </div>
  );
};

export default MenuBackground;