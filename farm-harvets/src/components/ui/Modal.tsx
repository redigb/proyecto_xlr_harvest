import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  preventClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  preventClose = false,
}) => {
  // Efecto para manejar el escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !preventClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, preventClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl", 
    lg: "max-w-4xl",
    xl: "max-w-6xl"
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !preventClose) {
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div className={`modal-content ${sizeClasses[size]} animate-scale-in`}>
        {/* Header del modal */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            {title && (
              <h2 className="font-game text-2xl text-game-dark text-shadow-game">
                {title}
              </h2>
            )}
            
            {showCloseButton && !preventClose && (
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-game-lg bg-white/80 hover:bg-red-50 border-2 border-red-200 text-red-500 hover:text-red-600 transition-all duration-200 hover:scale-110 hover:shadow-game"
                aria-label="Cerrar modal"
              >
                <span className="text-xl font-bold">×</span>
              </button>
            )}
            
            {preventClose && showCloseButton && (
              <div className="w-10 h-10 flex items-center justify-center">
                <div className="w-2 h-2 bg-game-muted rounded-full animate-pulse" />
              </div>
            )}
          </div>
        )}
        
        {/* Contenido del modal */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
        
        {/* Efectos decorativos */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-sun to-transparent opacity-60" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-40" />
      </div>
    </div>
  );
};

// Componente para footers de modal
interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex justify-end gap-4 pt-6 mt-6 border-t-2 border-primary/10 ${className}`}>
      {children}
    </div>
  );
};