// ==============================================
// BACK BUTTON - Botón de Regreso
// ==============================================

import React from 'react';
import { useAudio } from '../../context/AudioContext';

interface BackButtonProps {
  onClick: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  const { playSound } = useAudio();

  const handleClick = () => {
    playSound('back');
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="
        mt-8 px-8 py-3
        bg-card border-2 border-muted
        rounded-lg
        font-display text-lg tracking-wider
        text-muted hover:text-primary hover:border-primary
        transition-all duration-300
        hover:scale-105 hover:shadow-glow
        flex items-center gap-3
        group
      "
    >
      <svg
        className="w-5 h-5 transition-transform group-hover:-translate-x-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      VOLVER
    </button>
  );
};

export default BackButton;