import React, { useState, useEffect, useCallback } from 'react';
import PanelEstado from './leo_integracion/panel_estado';
import HeaderUI from './leo_integracion/header_ui';
import Scene from './leo_integracion/three/Scene';
import ErrorBoundary from './leo_integracion/three/ErrorBoundary';
import { createCropsForPlot, createRainEffect } from './leo_integracion/three/Terreno';
import * as THREE from 'three';
import { useGame } from '../../context/GameContext';

// Tipos
interface PlotUserData {
  id: number;
  isWatered?: boolean;
  crop?: string | null;
  isGrown?: boolean;
  plantTime?: number | null;
  crops?: THREE.Object3D[];
}

interface Plot extends THREE.Object3D {
  isGroup?: boolean;
  userData: PlotUserData;
  children: THREE.Object3D[];
}

interface SectorData {
  id: number;
  plot: Plot;
  position?: { lat: number; lng: number };
}

interface FarmPlot {
  id: string;
  position: { lat: number; lng: number };
  cultivated: boolean;
  cropType?: string;
  growth?: number;
  health?: number;
  resources?: { water: number; nutrients: number };
}

interface VistaTerreno3dProps {
  selectedPlot: FarmPlot | null;
}

const VistaTerreno3d: React.FC<VistaTerreno3dProps> = ({ selectedPlot }) => {
  
  const { gameState, startGame, updateScore, selectCrop } = useGame();
  const [sectorSeleccionado, setSectorSeleccionado] = useState<SectorData | null>(null);
  const [panelAbierto, setPanelAbierto] = useState<boolean>(true);

  // Iniciar juego demo con región Sierra
  useEffect(() => {
    if (!gameState.isPlaying) {
      console.log('🎮 Iniciando demo Sierra...');
      startGame();
      gameState.region = 'Sierra';
      gameState.message = '🌄 Modo demo Sierra activado';
    }
  }, [gameState.isPlaying, startGame, gameState]);

  // Manejar selección de parcela desde Scene
  const handleSectorClick = useCallback((sectorData: SectorData | null) => {
    console.log('Sector seleccionado en 3D:', sectorData);
    if (sectorData) {
      setSectorSeleccionado({
        ...sectorData,
        position: selectedPlot?.position, // Mantener GPS
      });
    } else {
      setSectorSeleccionado(null);
    }
  }, [selectedPlot]);

  // Regar parcela
  const handleWater = useCallback(
    (plot: Plot | null) => {
      if (!plot || !plot.userData) {
        console.error('Error: plot no válido para regar', { plot });
        return;
      }

      if (plot.userData.crop) {
        console.warn('No se puede regar una parcela con cultivos');
        return;
      }

      console.log(`Regando parcela ${plot.userData.id}`);
      try {
        plot.userData.isWatered = true;

        const base = plot.children[0] as THREE.Mesh;
        const material = base?.material as THREE.MeshStandardMaterial;
        if (material) {
          const wetSoilColor = 0x654321;
          material.color.set(wetSoilColor);
          console.log('Color cambiado a marrón oscuro (húmedo)');
        }

        createRainEffect(plot as any);
        setSectorSeleccionado(prev =>
          prev ? { ...prev, plot } : { id: plot.userData.id, plot, position: selectedPlot?.position }
        );
        console.log('Riego exitoso:', { id: plot.userData.id });
      } catch (error) {
        console.error('Error al regar:', error);
      }
    },
    [selectedPlot]
  );

  // Plantar cultivo
  const handlePlant = useCallback(
    (plot: Plot | null, cropType: string) => {
      if (!plot || !plot.userData) {
        console.error('Error: plot no válido para plantar', { plot, cropType });
        return;
      }

      if (!plot.userData.isWatered) {
        console.warn('No se puede plantar en tierra seca');
        return;
      }

      console.log(`Plantando ${cropType} en parcela ${plot.userData.id}`);
      try {
        plot.userData.crop = cropType;
        plot.userData.plantTime = Date.now();
        plot.userData.isGrown = false;

        createCropsForPlot(plot as any, 3.0, cropType);
        setSectorSeleccionado(prev =>
          prev ? { ...prev, plot } : { id: plot.userData.id, plot, position: selectedPlot?.position }
        );
        selectCrop(cropType);
        console.log('Plantación exitosa:', { id: plot.userData.id, crop: cropType });
      } catch (error) {
        console.error('Error al plantar:', error);
      }
    },
    [selectedPlot, selectCrop]
  );

  // Cosechar cultivo
  const handleHarvest = useCallback((plot: Plot | null) => {
    if (!plot || !plot.userData || !plot.userData.isGrown) {
      console.error('Error: plot no válido o no listo para cosechar', { plot });
      return;
    }

    console.log(`Cosechando parcela ${plot.userData.id}`);
    try {
      if (plot.userData.crops) {
        plot.userData.crops.forEach(crop => {
          const mesh = crop as THREE.Mesh;
          if (mesh.material) (mesh.material as THREE.Material).dispose();
          if (mesh.geometry) mesh.geometry.dispose();
          plot.remove(mesh);
        });
      }

      plot.userData.crops = [];
      plot.userData.crop = null;
      plot.userData.plantTime = null;
      plot.userData.isGrown = false;
      plot.userData.isWatered = false;

      const base = plot.children[0] as THREE.Mesh;
      const material = base?.material as THREE.MeshStandardMaterial;
      if (material) {
        material.color.set(0xd2b48c);
        console.log('Color restaurado a marrón claro (seco)');
      }

      setSectorSeleccionado(null);
      updateScore(100);
      console.log('Cosecha exitosa:', { id: plot.userData.id });
    } catch (error) {
      console.error('Error al cosechar:', error);
    }
  }, [updateScore]);

  const togglePanel = useCallback(() => setPanelAbierto(prev => !prev), []);

  return (
    <div className="flex h-screen bg-green-900 font-luckiest overflow-hidden">
      <div className="flex-1 relative">
        <HeaderUI />
        <ErrorBoundary>
          <Scene onSectorClick={handleSectorClick} selectedPlot={selectedPlot} />
        </ErrorBoundary>

        <button
          onClick={togglePanel}
          className="md:hidden fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg z-10"
        >
          {panelAbierto ? '✕' : '📊'}
        </button>
      </div>

      <div
        className={`w-80 h-full bg-gray-800 text-white fixed right-0 top-0 transform transition-transform duration-300 ease-in-out z-20 overflow-y-auto font-luckiest text-lg ${
          panelAbierto ? 'translate-x-0' : 'translate-x-full'
        } md:static md:w-80 md:translate-x-0`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl text-yellow-300">Estado del Sector</h2>
            <button onClick={togglePanel} className="md:hidden text-xl">
              ✕
            </button>
          </div>
          <PanelEstado
            sectorSeleccionado={sectorSeleccionado}
            onPlant={handlePlant}
            onHarvest={handleHarvest}
            onWater={handleWater}
          />
        </div>
      </div>

      {panelAbierto && (
        <div
          className="md:hidden fixed inset-0 bg-black opacity-50 z-10"
          onClick={togglePanel}
        />
      )}
    </div>
  );
};

export default VistaTerreno3d;