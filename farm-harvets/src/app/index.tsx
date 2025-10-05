import { useState } from 'react';
import MapaFullScreen from '../components/Maps';
import VistaTerreno3d from '../components/Terrain/VistaTerreno3d';

export default function index() {

    const [modo3D, setModo3D] = useState(false);

    return (
        <div className="w-full h-screen relative">
            {/* Vista dinámica */}
            {modo3D ? <VistaTerreno3d /> : <MapaFullScreen />}

            {/* Botón de cambio de vista */}
            <button
                onClick={() => setModo3D(!modo3D)}
                className="absolute top-5 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all"
            >
                {modo3D ? 'Ver mapa 2D' : 'Ver terreno 3D'}
            </button>
        </div>
    );
}