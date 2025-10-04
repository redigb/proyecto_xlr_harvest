import React, { useState } from 'react';
import PanelEstado from '../components/PanelEstado.jsx';
import HeaderUI from '../components/HeaderUI.jsx';
import Scene from '../three/Scene.jsx';


const Game = () => {
  const [sectorSeleccionado, setSectorSeleccionado] = useState(null);
  const [panelAbierto, setPanelAbierto] = useState(true);  // Para responsivo: en móvil, inicia cerrado

  const handleSectorClick = (sectorData) => {
    setSectorSeleccionado(sectorData);  // Actualiza el panel con ID del sector clickeado
  };

  const togglePanel = () => {
    setPanelAbierto(!panelAbierto);
  };

  return (
    <div className="flex h-screen bg-green-900 font-luckiest overflow-hidden">  {/* Layout flex para escena + panel */}
      <div className={`flex-1 relative ${!panelAbierto ? 'md:flex-1' : 'flex-1'}`}>
        <HeaderUI />
        <Scene onSectorClick={handleSectorClick} />  {/* Pasa la función para raycaster */}
        
        {/* Botón toggle para móvil */}
        <button
          onClick={togglePanel}
          className="md:hidden fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg z-10"
        >
          {panelAbierto ? '✕' : '📊'}
        </button>
      </div>
      
      {/* Panel lateral – responsivo: full en desktop, overlay en móvil */}
      <div className={`w-80 h-full bg-gray-800 text-white fixed right-0 top-0 transform transition-transform duration-300 ease-in-out z-20 overflow-y-auto font-luckiest text-lg ${
        panelAbierto ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
      } md:static md:w-80`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl text-yellow-300">Estado del Sector</h2>
            <button onClick={togglePanel} className="md:hidden text-xl">✕</button>
          </div>
          <PanelEstado sectorSeleccionado={sectorSeleccionado} />
        </div>
      </div>
      
      {/* Overlay para cerrar panel en móvil */}
      {!panelAbierto && (
        <div 
          className="md:hidden fixed inset-0 bg-black opacity-50 z-10"
          onClick={togglePanel}
        />
      )}
    </div>
  );
};

export default Game;