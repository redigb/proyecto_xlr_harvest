import { useState } from "react";

// Componentes 
import MapaComponent from "./MapaComponente";
import VistaTerreno3d from "../Terrain/VistaTerreno3d";


export default function Mapa() {

    // Maneja dos vistas: El mapa y el entorno 3d y permite regresar al menu principal   permitir 
    const [modo3D, setModo3D] = useState(false);

    const setModeo3D = () => { setModo3D(!modo3D); }

    return (
        <div className="w-full h-screen relative">
            {/* Vista dinámica */}
            {modo3D ? <VistaTerreno3d /> : <MapaComponent onMode3d={setModeo3D} />}

            {/* Botón de cambio de vista
            <button
                onClick={() => setModo3D(!modo3D)}
                className="absolute top-5 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all"
            >
                {modo3D ? 'Ver mapa 2D' : 'Ver terreno 3D'}
            </button> */}
        </div>
    );

}


