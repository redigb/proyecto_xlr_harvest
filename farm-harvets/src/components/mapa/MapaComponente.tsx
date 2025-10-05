"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Types
interface Resource {
  name: string
  amount: number
  icon: string
  color: string
  layerKey?: "truecolor" | "ndvi" | "thermal" | "night"
}

interface FarmPlot {
  id: string
  position: { lat: number; lng: number }
  cultivated: boolean
  cropType?: string
  growth?: number
}

interface GameStats {
  playTime: number
  plotsCreated: number
  cropsHarvested: number
  resourcesGathered: number
}

interface UserLocation {
  lat: number
  lng: number
}

// Farm plot SVG with breathing effect
const farmPlotSvg: string = `<svg viewBox="0 0 64 64" fill="none" width="48" height="48">
  <rect x="8" y="8" width="48" height="48" rx="8" fill="#8b4513"/>
  <rect x="12" y="12" width="40" height="40" rx="4" fill="#d2691e"/>
  <path d="M16 24H48M16 40H48M24 16V56M40 16V56" stroke="#654321" strokeWidth="1" opacity="0.3"/>
  <circle cx="20" cy="20" r="1.5" fill="#228b22"/>
  <circle cx="44" cy="28" r="1.5" fill="#228b22"/>
  <circle cx="32" cy="36" r="1.5" fill="#228b22"/>
  <circle cx="28" cy="48" r="1.5" fill="#228b22"/>
</svg>`

const getCurrentLocationIcon = (): L.Icon => {
  return L.icon({
    iconUrl: "/campo.jpg",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
    className: "current-location-marker",
  })
}

// Get plot marker icon with breathing effect
const getPlotIcon = (isSelected?: boolean): L.DivIcon => {
  const breathingEffect = `
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 64px;
      height: 64px;
      border: 2px solid #4ade80;
      border-radius: 50%;
      animation: breathe 2s ease-in-out infinite;
      pointer-events: none;
    "></div>
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 72px;
      height: 72px;
      border: 1px solid #4ade80;
      border-radius: 50%;
      animation: breathe 2s ease-in-out infinite 0.5s;
      opacity: 0.5;
      pointer-events: none;
    "></div>
  `

  const iconSize: L.PointExpression = [48, 48]
  const anchor: L.PointExpression = [24, 48]

  return L.divIcon({
    html: `
      <div style="position: relative; width: 48px; height: 48px;">
        ${breathingEffect}
        ${farmPlotSvg}
      </div>
    `,
    className: "custom-div-icon",
    iconSize,
    iconAnchor: anchor,
  }) as L.DivIcon
}

// Map click handler component
const GameMapClickHandler: React.FC<{
  onMapClick: (position: [number, number]) => void
  isPlacingMode: boolean
}> = ({ onMapClick, isPlacingMode }) => {
  useMapEvents({
    click: (e) => {
      if (isPlacingMode) {
        onMapClick([e.latlng.lat, e.latlng.lng])
      }
    },
  })
  return null
}

// Plot Management Modal
const PlotModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  onAccess: () => void
  onDelete: () => void
  plot: FarmPlot | null
}> = ({ isOpen, onClose, onAccess, onDelete, plot }) => {
  if (!isOpen || !plot) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative">
        {/* Decorative corner brackets */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-yellow-400"></div>
        <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-yellow-400"></div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-yellow-400"></div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-yellow-400"></div>

        <div className="bg-gradient-to-b from-green-900/95 to-green-800/95 rounded-lg p-8 max-w-md w-full shadow-2xl border border-green-600/30">
          <h2 className="text-2xl font-bold text-white text-center mb-2">TERRENO CULTIVABLE</h2>
          <p className="text-green-200 text-center mb-6">Administra tu parcela de tierra</p>

          <div className="space-y-4">
            <button
              onClick={onAccess}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-between group"
            >
              <span className="text-2xl">🌱</span>
              <span>ACCEDER AL TERRENO</span>
              <span className="text-2xl transform group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              onClick={onDelete}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-between group"
            >
              <span className="text-2xl">🗑️</span>
              <span>ELIMINAR TERRENO</span>
              <span className="text-2xl transform group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-700/80 hover:bg-gray-600/80 text-gray-300 py-3 px-6 rounded-lg font-semibold transition-all duration-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MapaComponentProps {
  onMode3d: () => void
}

const MapaComponente: React.FC<MapaComponentProps> = ({ onMode3d }) => {
  const [resources, setResources] = useState<Resource[]>([
    { name: "COLOR REAL", amount: 50, icon: "🌍", color: "bg-blue-500", layerKey: "truecolor" },
    { name: "VEGETACION", amount: 100, icon: "🌱", color: "bg-green-500", layerKey: "ndvi" },
    { name: "TEMPERATURA", amount: 100, icon: "🌡️", color: "bg-red-500", layerKey: "thermal" },
    { name: "VISTA NOCTURNA", amount: 20, icon: "🌙", color: "bg-indigo-500", layerKey: "night" },
  ])

  const [farmPlot, setFarmPlot] = useState<FarmPlot | null>(null)
  const [isPlacingMode, setIsPlacingMode] = useState(false)
  const [selectedPlot, setSelectedPlot] = useState<FarmPlot | null>(null)
  const [showPlotModal, setShowPlotModal] = useState(false)
  const [gameStats, setGameStats] = useState<GameStats>({
    playTime: 0,
    plotsCreated: 0,
    cropsHarvested: 0,
    resourcesGathered: 0,
  })
  const [showStats, setShowStats] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [center, setCenter] = useState<[number, number]>([-9.9306, -76.2422])
  const [capaActiva, setCapaActiva] = useState<"truecolor" | "ndvi" | "thermal" | "night">("truecolor")
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const mapRef = useRef<L.Map>(null)

  const capasDisponibles = {
    truecolor: {
      nombre: "🌍 Color Real",
      url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_NOAA20_CorrectedReflectance_TrueColor/default/2025-10-05/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg",
      opacity: 0.8,
    },
    ndvi: {
      nombre: "🌱 Vegetación",
      url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/2025-10-05/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png",
      opacity: 0.7,
    },
    thermal: {
      nombre: "🌡️ Temperatura",
      url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/2025-10-05/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png",
      opacity: 0.6,
    },
    night: {
      nombre: "🌙 Vista Nocturna",
      url: "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png",
      opacity: 0.9,
    },
  } as const

  // Game timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setGameStats((prev) => ({
          ...prev,
          playTime: prev.playTime + 1,
        }))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [isPaused])

  const obtenerUbicacionActual = (): void => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCenter: [number, number] = [position.coords.latitude, position.coords.longitude]
        const newLocation: UserLocation = { lat: position.coords.latitude, lng: position.coords.longitude }

        setCenter(newCenter)
        setUserLocation(newLocation)

        if (mapRef.current) {
          mapRef.current.setView(newCenter, 15)
        }
      },
      (err) => {
        console.error("Error obteniendo ubicación:", err)
        alert("No se pudo obtener tu ubicación. Asegúrate de tener GPS activado.")
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  // Handle map click for placing plot
  const handleMapClick = (latlng: [number, number]): void => {
    if (!isPlacingMode || isPaused || farmPlot) return

    const newPlot: FarmPlot = {
      id: `plot-${Date.now()}`,
      position: { lat: latlng[0], lng: latlng[1] },
      cultivated: false,
    }

    setFarmPlot(newPlot)
    setIsPlacingMode(false)
    setGameStats((prev) => ({ ...prev, plotsCreated: prev.plotsCreated + 1 }))
  }

  // Handle plot click
  const handlePlotClick = (plot: FarmPlot): void => {
    setSelectedPlot(plot)
    setShowPlotModal(true)
  }

  // Access plot
  const handleAccessPlot = (): void => {
    onMode3d()
    //console.log('Accediendo al terreno...');
    setShowPlotModal(false)
    // Aquí puedes agregar lógica para acceder al terreno
  }

  // Delete plot
  const handleDeletePlot = (): void => {
    setFarmPlot(null)
    setSelectedPlot(null)
    setShowPlotModal(false)
  }

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-emerald-50 to-teal-100 relative overflow-hidden flex flex-col font-sans antialiased">
      {/* Top Bar - Resources */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-50">
        {resources.map((resource, index) => {
          const isActive = resource.layerKey === capaActiva
          return (
            <div
              key={index}
              onClick={() => resource.layerKey && setCapaActiva(resource.layerKey)}
              className={`
                flex items-center space-x-2 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-xl shadow-lg border-2
                cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105
                ${isActive ? "border-blue-500 shadow-xl bg-blue-50/95" : "border-white/50"}
              `}
            >
              <span className="text-xl">{resource.icon}</span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-gray-600">{resource.name}</span>
                <span className="text-lg font-bold text-gray-800">{resource.amount}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selection Indicator - Moved to left side */}
      {isPlacingMode && !isPaused && (
        <div className="absolute top-32 left-4 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-3 rounded-lg shadow-2xl z-40 backdrop-blur-md border border-emerald-400 max-w-xs">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xl">🌾</span>
            <span className="font-bold">MODO CONSTRUCCIÓN</span>
          </div>
          <div className="text-sm text-emerald-100">Haz clic en el mapa para colocar un terreno cultivable</div>
          <div className="mt-2">
            <button
              onClick={() => setIsPlacingMode(false)}
              className="text-xs bg-emerald-700/50 px-2 py-1 rounded hover:bg-emerald-700/70 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* World Map */}
      <div className="flex-1 relative overflow-hidden z-10">
        <MapContainer ref={mapRef} center={center} zoom={12} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <TileLayer
            key={capaActiva}
            url={capasDisponibles[capaActiva].url}
            attribution="NASA GIBS"
            opacity={capasDisponibles[capaActiva].opacity}
          />

          <GameMapClickHandler onMapClick={handleMapClick} isPlacingMode={isPlacingMode} />

          {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={getCurrentLocationIcon()} />}
          {/* Farm Plot Marker */}
          {farmPlot && (
            <Marker
              position={[farmPlot.position.lat, farmPlot.position.lng]}
              icon={getPlotIcon()}
              eventHandlers={{
                click: () => handlePlotClick(farmPlot),
              }}
            />
          )}
        </MapContainer>

        {/* Pause Overlay */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="bg-gradient-to-b from-green-900/95 to-green-800/95 rounded-2xl p-8 text-center shadow-2xl border border-green-600/30">
              <div className="text-4xl font-bold text-white mb-4">⏸️ JUEGO EN PAUSA</div>
              <div className="text-lg text-green-200 mb-6">Presiona continuar para reanudar</div>
              <button
                onClick={() => setIsPaused(false)}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                ▶️ Continuar Juego
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Side Controls */}
      <div className="absolute top-24 right-4 flex flex-col space-y-3 z-50">
        <button
          onClick={obtenerUbicacionActual}
          className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white/50 hover:scale-110 hover:border-blue-400"
          title="Mi ubicación GPS"
        >
          <span className="text-2xl">📍</span>
        </button>

        <button
          onClick={() => setShowStats(!showStats)}
          className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white/50 hover:scale-110 hover:border-yellow-400"
          title="Estadísticas"
        >
          <span className="text-2xl">📊</span>
        </button>

        <button
          onClick={() => setIsPaused(!isPaused)}
          className="w-14 h-14 bg-white/95 backdrop-blur-md rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-white/50 hover:scale-110 hover:border-orange-400"
          title={isPaused ? "Reanudar" : "Pausar"}
        >
          <span className="text-2xl">{isPaused ? "▶️" : "⏸️"}</span>
        </button>

        <div className="h-px bg-gray-300 my-1"></div>

        <button
          onClick={() => !farmPlot && setIsPlacingMode(!isPlacingMode)}
          disabled={isPaused || farmPlot !== null}
          className={`
            w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border-2 hover:scale-110
            ${isPlacingMode ? "border-yellow-400 ring-2 ring-yellow-300" : "border-emerald-400"}
            ${isPaused || farmPlot ? "opacity-50 cursor-not-allowed" : ""}
          `}
          title={farmPlot ? "Ya tienes un terreno" : "Construir terreno"}
        >
          <span className="text-2xl text-white">🌾</span>
        </button>
      </div>

      {/* Stats Modal */}
      {showStats && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-b from-green-900/95 to-green-800/95 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-green-600/30">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">📊 ESTADÍSTICAS</h2>
              <button
                onClick={() => setShowStats(false)}
                className="text-green-300 hover:text-white text-2xl transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-800/50 rounded-lg border border-green-600/30">
                <span className="text-green-200">⏱️ Tiempo de Juego</span>
                <span className="font-bold text-white text-lg">{formatTime(gameStats.playTime)}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-800/50 rounded-lg border border-green-600/30">
                <span className="text-green-200">🏗️ Terrenos Creados</span>
                <span className="font-bold text-white text-lg">{gameStats.plotsCreated}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-800/50 rounded-lg border border-green-600/30">
                <span className="text-green-200">🌾 Cultivos Cosechados</span>
                <span className="font-bold text-white text-lg">{gameStats.cropsHarvested}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-800/50 rounded-lg border border-green-600/30">
                <span className="text-green-200">💰 Recursos Recolectados</span>
                <span className="font-bold text-white text-lg">{gameStats.resourcesGathered}</span>
              </div>
            </div>

            <button
              onClick={() => setShowStats(false)}
              className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-3 rounded-xl font-bold transition-all duration-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Plot Modal */}
      <PlotModal
        isOpen={showPlotModal}
        onClose={() => setShowPlotModal(false)}
        onAccess={handleAccessPlot}
        onDelete={handleDeletePlot}
        plot={selectedPlot}
      />

      {/* Game Info Bar */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg text-white z-30">
        <div className="text-sm flex items-center space-x-2">
          <span>⏱️ {formatTime(gameStats.playTime)}</span>
          {isPaused && <span className="text-yellow-400 font-bold">• PAUSADO</span>}
          {farmPlot && <span className="text-green-400">• 🌾 Terreno activo</span>}
          {userLocation && <span className="text-blue-400">• 📍 GPS activo</span>}
        </div>
      </div>

      {/* Navigation Instructions */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-xl text-xs backdrop-blur-sm z-30">
        <div>🖱️ Arrastra para mover • 🎡 Rueda para zoom</div>
      </div>

      {/* Version info */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 z-20">v1.0.0</div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes breathe {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.3;
          }
        }
        @keyframes pulse {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0.3;
          }
        }
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .current-location-marker {
          position: relative;
        }
        .current-location-marker::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border: 3px solid #3b82f6;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
          pointer-events: none;
        }
        .current-location-marker::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 75px;
          height: 75px;
          border: 2px solid #3b82f6;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite 0.5s;
          opacity: 0.5;
          pointer-events: none;
        }
      `,
        }}
      />
    </div>
  )
}

export default MapaComponente
