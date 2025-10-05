    // ==============================================
    // SCREEN TRANSITION - Transiciones entre Pantallas
    // ==============================================

    import React, { ReactNode } from 'react';

    interface ScreenTransitionProps {
    children: ReactNode;
    isTransitioning: boolean;
    }

    const ScreenTransition: React.FC<ScreenTransitionProps> = ({ children, isTransitioning }) => {
    return (
        <div className="w-full h-full relative">
        <div
            className={`
            w-full h-full
            transition-all duration-300 ease-in-out
            ${isTransitioning 
                ? 'opacity-0 scale-95 blur-sm' 
                : 'opacity-100 scale-100 blur-0'
            }
            `}
        >
            {children}
        </div>
        
        {/* Overlay de transición */}
        {isTransitioning && (
            <div className="absolute inset-0 flex items-center justify-center bg-darker/50 backdrop-blur-md z-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-primary font-display text-lg animate-pulse">
                Cargando...
                </p>
            </div>
            </div>
        )}
        </div>
    );
    };

    export default ScreenTransition;