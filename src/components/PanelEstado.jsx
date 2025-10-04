import React, { useState, useEffect } from 'react';
import { getSectorData } from '../data/sectores.js';

const PanelEstado = ({ sectorSeleccionado }) => {
  const [datos, setDatos] = useState({ humedad: 0, nutrientes: 0, cultivo: 'Ninguno', estado: 'Desconocido' });

  useEffect(() => {
    if (sectorSeleccionado) {
      const nuevosDatos = getSectorData(sectorSeleccionado.id);
      setDatos(nuevosDatos);
    } else {
      setDatos({ humedad: 0, nutrientes: 0, cultivo: 'Ninguno', estado: 'Selecciona un sector' });
    }
  }, [sectorSeleccionado]);

  return (
    <div className="space-y-4 text-white">
      <div className="bg-gray-700 p-3 rounded-lg">
        <h3 className="font-bold mb-2">Humedad</h3>
        <div className="text-2xl">{datos.humedad}%</div>
        <span className={`inline-block ml-2 px-2 py-1 rounded text-sm ${
          datos.humedad > 50 ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {datos.humedad > 50 ? 'Óptima' : 'Baja'}
        </span>
      </div>
      <div className="bg-gray-700 p-3 rounded-lg">
        <h3 className="font-bold mb-2">Nutrientes</h3>
        <div className="text-2xl">{datos.nutrientes}%</div>
        <span className={`inline-block ml-2 px-2 py-1 rounded text-sm ${
          datos.nutrientes > 50 ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {datos.nutrientes > 50 ? 'Rica' : 'Pobre'}
        </span>
      </div>
      <div className="bg-gray-700 p-3 rounded-lg">
        <h3 className="font-bold mb-2">Cultivo Actual</h3>
        <div className="text-xl capitalize">{datos.cultivo}</div>
      </div>
      <div className="bg-gray-700 p-3 rounded-lg">
        <h3 className="font-bold mb-2">Estado General</h3>
        <span className={`block text-xl px-3 py-2 rounded w-full text-center ${
          datos.estado === 'Saludable' ? 'bg-green-500' : datos.estado === 'Seco' ? 'bg-yellow-500' : 'bg-red-500'
        }`}>
          {datos.estado}
        </span>
      </div>
      {/* Espacio para botones futuros */}
      <div className="mt-6 space-y-2">
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded">Regar</button>
        <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded">Plantar</button>
      </div>
    </div>
  );
};

export default PanelEstado;