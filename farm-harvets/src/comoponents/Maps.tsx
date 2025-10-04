import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

// Componente para manejar clics en el mapa
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

// Componente para el marcador draggable
function DraggableMarker({ position, setPosition }) {
  const markerRef = useRef(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const newPos = marker.getLatLng();
        setPosition([newPos.lat, newPos.lng]);
      }
    },
  };

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup>
        <div style={{ textAlign: 'center' }}>
          <strong>📍 Tu ubicación</strong>
          <br />
          <small>
            Lat: {position[0].toFixed(6)}<br />
            Lng: {position[1].toFixed(6)}
          </small>
          <br />
          <em style={{ fontSize: '11px', color: '#666' }}>
            Arrastra el marcador o haz clic en el mapa
          </em>
        </div>
      </Popup>
    </Marker>
  );
}

// Pantalla de solicitud de permisos
function PantallaPermisos({ onUbicacionObtenida, onSaltarUbicacion }) {
  const [estado, setEstado] = useState('inicial'); // inicial, solicitando, error
  const [mensajeError, setMensajeError] = useState('');
  const [intentos, setIntentos] = useState(0);

  const solicitarUbicacion = () => {
    setEstado('solicitando');
    setMensajeError('');

    if (!navigator.geolocation) {
      setEstado('error');
      setMensajeError('Tu navegador no soporta geolocalización. Deberás usar la ubicación manual.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onUbicacionObtenida([latitude, longitude]);
      },
      (err) => {
        console.error('Error obteniendo ubicación:', err);
        setEstado('error');
        setIntentos(prev => prev + 1);
        
        let mensaje = '';
        let solucion = '';
        
        switch(err.code) {
          case err.PERMISSION_DENIED:
            mensaje = 'Permiso denegado';
            solucion = 'Debes permitir el acceso a tu ubicación en la configuración del navegador para continuar.';
            break;
          case err.POSITION_UNAVAILABLE:
            mensaje = 'Ubicación no disponible';
            solucion = 'Verifica que tu GPS esté activado y que tengas buena señal. Si estás en interiores, intenta acercarte a una ventana.';
            break;
          case err.TIMEOUT:
            mensaje = 'Tiempo de espera agotado';
            solucion = 'La ubicación está tardando demasiado. Verifica tu conexión GPS e intenta nuevamente.';
            break;
          default:
            mensaje = 'Error desconocido';
            solucion = 'No se pudo obtener tu ubicación. Intenta nuevamente o usa la ubicación manual.';
            break;
        }
        
        setMensajeError(`${mensaje}: ${solucion}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        padding: '40px',
        textAlign: 'center'
      }}>
        {/* Icono */}
        <div style={{
          fontSize: '64px',
          marginBottom: '20px'
        }}>
          {estado === 'solicitando' ? '⏳' : estado === 'error' ? '⚠️' : '📍'}
        </div>

        {/* Título */}
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#1e293b',
          marginBottom: '12px'
        }}>
          {estado === 'solicitando' ? 'Obteniendo ubicación...' : 
           estado === 'error' ? 'No se pudo obtener tu ubicación' :
           'Necesitamos tu ubicación'}
        </h2>

        {/* Descripción */}
        <p style={{
          fontSize: '16px',
          color: '#64748b',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          {estado === 'inicial' && 'Para mostrarte el mapa con tu ubicación actual, necesitamos acceso a tu GPS.'}
          {estado === 'solicitando' && 'Esperando respuesta del GPS... Esto puede tomar unos segundos.'}
          {estado === 'error' && mensajeError}
        </p>

        {/* Loader */}
        {estado === 'solicitando' && (
          <div style={{
            width: '50px',
            height: '50px',
            border: '5px solid #e0e7ff',
            borderTop: '5px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
        )}

        {/* Botones */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {estado === 'inicial' && (
            <>
              <button
                onClick={solicitarUbicacion}
                style={{
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
              >
                📍 Permitir Acceso a Ubicación
              </button>
              <button
                onClick={() => onSaltarUbicacion([-12.0464, -77.0428])}
                style={{
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  border: '2px solid #e2e8f0',
                  padding: '14px 28px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.backgroundColor = '#f8fafc';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Usar ubicación manual
              </button>
            </>
          )}

          {estado === 'error' && (
            <>
              <button
                onClick={solicitarUbicacion}
                style={{
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
              >
                🔄 Intentar Nuevamente {intentos > 0 && `(${intentos})`}
              </button>
              <button
                onClick={() => onSaltarUbicacion([-12.0464, -77.0428])}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
              >
                ✏️ Continuar con Ubicación Manual
              </button>
            </>
          )}
        </div>

        {/* Ayuda adicional */}
        {estado === 'error' && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#92400e',
            textAlign: 'left'
          }}>
            <strong>💡 Consejos:</strong>
            <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
              <li>Verifica que el GPS esté activado en tu dispositivo</li>
              <li>Permite el acceso en la configuración del navegador</li>
              <li>Si estás en interiores, acércate a una ventana</li>
              <li>Desactiva VPN si está activa</li>
            </ul>
          </div>
        )}

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

function MapaFullScreen() {
  const [ubicacion, setUbicacion] = useState(null);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [capaActiva, setCapaActiva] = useState('truecolor');

  const capasDisponibles = {
    truecolor: {
      nombre: '🌍 Color Real',
      url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_NOAA20_CorrectedReflectance_TrueColor/default/2024-10-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
      opacity: 0.8
    },
    ndvi: {
      nombre: '🌱 Vegetación (NDVI)',
      url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/2024-09-30/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png',
      opacity: 0.7
    },
    thermal: {
      nombre: '🌡️ Temperatura',
      url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/2024-10-01/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png',
      opacity: 0.6
    },
    fire: {
      nombre: '🔥 Incendios',
      url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_Thermal_Anomalies_All/default/2024-10-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png',
      opacity: 0.8
    },
    night: {
      nombre: '🌙 Vista Nocturna',
      url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png',
      opacity: 0.9
    }
  };

  useEffect(() => {
    console.log('🗺️ Capa activa cambiada a:', capaActiva);
    console.log('📍 URL de capa:', capasDisponibles[capaActiva].url);
  }, [capaActiva]);

  const handleUbicacionObtenida = (coords) => {
    setUbicacion(coords);
    setMostrarMapa(true);
  };

  const handleSaltarUbicacion = (coordsDefault) => {
    setUbicacion(coordsDefault);
    setMostrarMapa(true);
    setModoEdicion(true); // Activar modo edición automáticamente
  };

  const handleMapClick = (newPosition) => {
    if (modoEdicion) {
      setUbicacion(newPosition);
    }
  };

  const obtenerUbicacionActual = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUbicacion([latitude, longitude]);
      },
      (err) => {
        console.error('Error obteniendo ubicación:', err);
        alert('No se pudo obtener tu ubicación actual. Asegúrate de tener GPS activado.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Si no se ha mostrado el mapa, mostrar pantalla de permisos
  if (!mostrarMapa) {
    return (
      <PantallaPermisos
        onUbicacionObtenida={handleUbicacionObtenida}
        onSaltarUbicacion={handleSaltarUbicacion}
      />
    );
  }

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Panel de controles */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* Selector de capas */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          minWidth: '200px'
        }}>
          <label style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: '#64748b',
            display: 'block',
            marginBottom: '8px'
          }}>
            CAPAS SATELITALES
          </label>
          <select
            value={capaActiva}
            onChange={(e) => setCapaActiva(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '2px solid #e2e8f0',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: 'white'
            }}
          >
            {Object.entries(capasDisponibles).map(([key, capa]) => (
              <option key={key} value={key}>{capa.nombre}</option>
            ))}
          </select>
        </div>

        {/* Botón modo edición */}
        <button
          onClick={() => setModoEdicion(!modoEdicion)}
          style={{
            backgroundColor: modoEdicion ? '#10b981' : '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.2s',
            fontSize: '14px'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          {modoEdicion ? '✓ Modo Edición ON' : '✏️ Activar Edición'}
        </button>

        {/* Botón ubicación actual */}
        <button
          onClick={obtenerUbicacionActual}
          style={{
            backgroundColor: '#6366f1',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.2s',
            fontSize: '14px'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          📍 Mi Ubicación GPS
        </button>

        {/* Información de coordenadas */}
        {ubicacion && (
          <div style={{
            backgroundColor: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <div><strong>Lat:</strong> {ubicacion[0].toFixed(6)}</div>
            <div><strong>Lng:</strong> {ubicacion[1].toFixed(6)}</div>
          </div>
        )}
      </div>

      {/* Instrucciones */}
      {modoEdicion && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#10b981',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          🖱️ Haz clic en el mapa o arrastra el marcador para cambiar la ubicación
        </div>
      )}
      
      <MapContainer
        center={ubicacion || [-12.0464, -77.0428]}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />
        <TileLayer
          key={capaActiva}
          url={capasDisponibles[capaActiva].url}
          attribution="NASA GIBS"
          opacity={capasDisponibles[capaActiva].opacity}
        />
        
        {modoEdicion && <MapClickHandler onMapClick={handleMapClick} />}
        
        {ubicacion && (
          <DraggableMarker position={ubicacion} setPosition={setUbicacion} />
        )}
      </MapContainer>
    </div>
  );
}

export default MapaFullScreen;