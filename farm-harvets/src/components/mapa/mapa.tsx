import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import VistaTerreno3d from '../Terrain/VistaTerreno3d'; // Ajusta la ruta si es necesario

interface Resource {
  name: string;
  amount: number;
  icon: string;
  color: string;
  layerKey?: 'truecolor' | 'ndvi' | 'thermal' | 'fire' | 'night';
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

interface GameStats {
  playTime: number;
  plotsCreated: number;
  cropsHarvested: number;
  resourcesGathered: number;
  efficiency: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const IA_APIKEY = import.meta.env.VITE_GROQ_API_KEY;

const createFarmPlotSvg = (growth: number = 0, health: number = 100): string => `
  <svg viewBox="0 0 64 64" fill="none" width="48" height="48">
    <defs>
      <linearGradient id="plotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1B5E20" />
        <stop offset="50%" stop-color="#2E7D32" />
        <stop offset="100%" stop-color="#388E3C" />
      </linearGradient>
      <linearGradient id="cropGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4CAF50" />
        <stop offset="100%" stop-color="#66BB6A" />
      </linearGradient>
    </defs>
    <rect x="8" y="8" width="48" height="48" rx="8" fill="url(#plotGradient)"/>
    <rect x="12" y="12" width="40" height="40" rx="4" fill="#2E7D32" opacity="0.9"/>
    <path d="M16 24H48M16 40H48M24 16V56M40 16V56" stroke="#1B5E20" stroke-width="1" opacity="0.4"/>
    
    ${growth > 0 ? `
      <circle cx="20" cy="20" r="${1.5 + growth * 0.02}" fill="url(#cropGradient)" opacity="${0.6 + growth * 0.004}"/>
      <circle cx="44" cy="28" r="${1.5 + growth * 0.02}" fill="url(#cropGradient)" opacity="${0.6 + growth * 0.004}"/>
      <circle cx="32" cy="36" r="${1.5 + growth * 0.03}" fill="url(#cropGradient)" opacity="${0.6 + growth * 0.004}"/>
      <circle cx="28" cy="48" r="${1.5 + growth * 0.02}" fill="url(#cropGradient)" opacity="${0.6 + growth * 0.004}"/>
    ` : ''}
    
    <rect x="12" y="56" width="40" height="4" fill="#1B5E20" rx="2"/>
    <rect x="12" y="56" width="${40 * (health / 100)}" height="4" fill="${health > 70 ? '#4CAF50' : health > 30 ? '#FF9800' : '#F44336'}" rx="2"/>
  </svg>
`;

const getPlotIcon = (plot: FarmPlot): L.DivIcon => {
  const pulseEffect = plot.cultivated ? `
    <div class="cultivation-pulse" style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 72px;
      height: 72px;
      border: 2px solid #4CAF50;
      border-radius: 50%;
      animation: cultivatePulse 2s ease-in-out infinite;
      pointer-events: none;
    "></div>
  ` : '';

  const iconSize: L.PointExpression = [48, 48];
  const anchor: L.PointExpression = [24, 48];

  return L.divIcon({
    html: `
      <div class="farm-marker" style="position: relative; width: 48px; height: 48px;">
        ${pulseEffect}
        ${createFarmPlotSvg(plot.growth, plot.health)}
        ${plot.cultivated ? `
          <div style="
            position: absolute;
            top: -5px;
            right: -5px;
            width: 16px;
            height: 16px;
            background: #4CAF50;
            border-radius: 50%;
            border: 2px solid white;
            animation: statusPulse 1.5s ease-in-out infinite;
          "></div>
        ` : ''}
      </div>
    `,
    className: `custom-div-icon ${plot.cultivated ? 'cultivated' : 'available'}`,
    iconSize,
    iconAnchor: anchor
  }) as L.DivIcon;
};

const GameMapClickHandler: React.FC<{
  onMapClick: (position: [number, number]) => void;
  isPlacingMode: boolean;
}> = ({ onMapClick, isPlacingMode }) => {
  useMapEvents({
    click: (e) => {
      if (isPlacingMode) {
        onMapClick([e.latlng.lat, e.latlng.lng]);
      }
    }
  });
  return null;
};

const PlotModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAccess: () => void;
  onDelete: () => void;
  onCultivate: () => void;
  plot: FarmPlot | null;
}> = ({ isOpen, onClose, onAccess, onDelete, onCultivate, plot }) => {
  if (!isOpen || !plot) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="relative card-game max-w-md w-full mx-4 border-2 border-primary/30">
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-accent-gold animate-pulse"></div>
        <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-accent-gold animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-accent-gold animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-accent-gold animate-pulse" style={{animationDelay: '1.5s'}}></div>

        <div className="p-6">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-display text-gradient-primary mb-2">FARM PLOT</h2>
            <div className="flex justify-center items-center space-x-4 text-sm text-muted">
              <span>📍 Lat: {plot.position.lat.toFixed(4)}</span>
              <span>Lng: {plot.position.lng.toFixed(4)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="card-game p-3 text-center">
              <div className="text-lg font-bold text-primary">STATUS</div>
              <div className={`text-sm ${plot.cultivated ? 'text-green-400' : 'text-yellow-400'}`}>
                {plot.cultivated ? 'ACTIVE' : 'AVAILABLE'}
              </div>
            </div>
            <div className="card-game p-3 text-center">
              <div className="text-lg font-bold text-primary">HEALTH</div>
              <div className="text-sm text-green-400">{plot.health || 100}%</div>
            </div>
          </div>

          {plot.resources && (
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span>💧 Water</span>
                <span>{plot.resources.water}%</span>
              </div>
              <div className="w-full bg-card rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${plot.resources.water}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>🌱 Nutrients</span>
                <span>{plot.resources.nutrients}%</span>
              </div>
              <div className="w-full bg-card rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${plot.resources.nutrients}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={onAccess}
              className="btn-game btn-premium w-full flex items-center justify-between group transform hover:scale-105 transition-all duration-300"
            >
              <span className="text-xl">🚀</span>
              <span className="font-bold">ENTER FARM</span>
              <span className="text-xl transform group-hover:translate-x-2 transition-transform">→</span>
            </button>

            {!plot.cultivated && (
              <button
                onClick={onCultivate}
                className="btn-game bg-gradient-sun text-gray-900 w-full flex items-center justify-between group transform hover:scale-105 transition-all duration-300"
              >
                <span className="text-xl">🌱</span>
                <span className="font-bold">START CULTIVATION</span>
                <span className="text-xl transform group-hover:rotate-180 transition-transform">🔄</span>
              </button>
            )}

            <button
              onClick={onDelete}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white py-3 px-6 rounded-game-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-button flex items-center justify-between group"
            >
              <span className="text-xl">🗑️</span>
              <span>DELETE PLOT</span>
              <span className="text-xl transform group-hover:scale-110 transition-transform">⚠️</span>
            </button>

            <button
              onClick={onClose}
              className="w-full bg-card hover:bg-card-hover text-gray-300 py-2 px-6 rounded-game font-semibold transition-all duration-300 border border-gray-600 hover:border-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Chatbot: React.FC<{
  center: [number, number];
  selectedPlot: FarmPlot | null;
  onClose: () => void;
}> = ({ center, selectedPlot, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Consulta inicial a Groq cuando se monta el componente o cambia la parcela seleccionada
  useEffect(() => {
    const fetchInitialResponse = async () => {
      setIsLoading(true);
      const lat = selectedPlot?.position.lat || center[0];
      const lng = selectedPlot?.position.lng || center[1];
      const prompt = `En Huánuco, Perú (lat: ${lat.toFixed(4)}, lng: ${lng.toFixed(4)}), ¿qué produce mayormente la tierra? ¿Qué vegetales se recomiendan sembrar y cómo cuidarlos? Proporciona una respuesta breve y práctica.`;

      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization':  `Bearer ${IA_APIKEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 150,
          }),
        });

        if (!response.ok) throw new Error('Error en la solicitud a Groq');
        const data = await response.json();
        const reply = data.choices[0].message.content;

        setMessages([{ role: 'assistant', content: reply }]);
        setIsLoading(false);
      } catch (error) {
        console.error('Error al consultar Groq:', error);
        setMessages([{ role: 'assistant', content: 'Error al obtener recomendaciones. Intenta de nuevo.' }]);
        setIsLoading(false);
      }
    };

    fetchInitialResponse();
  }, [center, selectedPlot]);

  // Enviar mensaje del usuario
  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const lat = selectedPlot?.position.lat || center[0];
    const lng = selectedPlot?.position.lng || center[1];
    const prompt = `${input} (Contexto: Huánuco, Perú, lat: ${lat.toFixed(4)}, lng: ${lng.toFixed(4)}). Proporciona una respuesta breve y práctica.`;

    try {
      const response = await fetch('https://api.groq.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${IA_APIKEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'llama-3.1-8b-instant',
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      if (!response.ok) throw new Error('Error en la solicitud a Groq');
      const data = await response.json();
      const reply = data.choices[0].message.content;

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al consultar Groq:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error al obtener respuesta. Intenta de nuevo.' }]);
      setIsLoading(false);
    }
  };

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="absolute top-4 right-4 w-80 bg-black/90 backdrop-blur-lg rounded-game-lg p-4 z-50 border-2 border-primary/30 animate-fade-in">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-display text-gradient-primary">🌾 AgroBot</h3>
        <button onClick={onClose} className="text-muted hover:text-white text-xl transition-colors">
          ✕
        </button>
      </div>
      <div className="h-64 overflow-y-auto mb-3 bg-card/50 rounded-game p-3 text-sm text-white">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-game ${msg.role === 'user' ? 'bg-primary/20 text-white' : 'bg-gray-700/50 text-gray-200'}`}>
              {msg.role === 'user' ? 'Tú: ' : 'AgroBot: '}{msg.content}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="text-center text-muted animate-pulse">Cargando...</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 bg-card text-white rounded-game p-2 text-sm border border-gray-600 focus:border-primary outline-none"
          placeholder="Pregunta sobre cultivos..."
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          className="bg-gradient-primary text-white px-4 py-2 rounded-game hover:bg-primary/80 transition-all disabled:opacity-50"
          disabled={isLoading}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

const Mapa: React.FC = () => {
  const [modo3D, setModo3D] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<FarmPlot | null>(null);
  const [resources, setResources] = useState<Resource[]>([
    { name: 'TRUE COLOR', amount: 50, icon: '🌍', color: 'bg-blue-500', layerKey: 'truecolor' },
    { name: 'VEGETATION', amount: 100, icon: '🌱', color: 'bg-green-500', layerKey: 'ndvi' },
    { name: 'TEMPERATURE', amount: 100, icon: '🌡️', color: 'bg-red-500', layerKey: 'thermal' },
    { name: 'FIRE DETECTION', amount: 30, icon: '🔥', color: 'bg-orange-500', layerKey: 'fire' },
    { name: 'NIGHT VIEW', amount: 20, icon: '🌙', color: 'bg-indigo-500', layerKey: 'night' },
  ]);
  const [farmPlots, setFarmPlots] = useState<FarmPlot[]>([]);
  const [isPlacingMode, setIsPlacingMode] = useState(false);
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    playTime: 0,
    plotsCreated: 0,
    cropsHarvested: 0,
    resourcesGathered: 0,
    efficiency: 95
  });
  const [showStats, setShowStats] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [center, setCenter] = useState<[number, number]>([-9.9306, -76.2422]);
  const [activeLayer, setActiveLayer] = useState<'truecolor' | 'ndvi' | 'thermal' | 'fire' | 'night'>('truecolor');
  const [mapStyle, setMapStyle] = useState<'satellite' | 'streets' | 'topographic'>('satellite');
  const mapRef = useRef<L.Map>(null);

  // Fecha dinámica para NASA GIBS
  const currentDate = new Date().toISOString().split('T')[0]; // Ej. "2025-10-05"

  const availableLayers = {
    truecolor: {
      name: '🌍 True Color',
      url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_NOAA20_CorrectedReflectance_TrueColor/default/${currentDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`,
      opacity: 0.8
    },
    ndvi: {
      name: '🌱 Vegetation Index',
      url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/${currentDate}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png`,
      opacity: 0.7
    },
    thermal: {
      name: '🌡️ Thermal',
      url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/${currentDate}/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png`,
      opacity: 0.6
    },
    fire: {
      name: '🔥 Fire Detection',
      url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_Thermal_Anomalies_All/default/${currentDate}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png`,
      opacity: 0.8
    },
    night: {
      name: '🌙 Night View',
      url: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png`, // Fecha fija para night
      opacity: 0.9
    }
  } as const;

  const mapStyles = {
    satellite: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    streets: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    topographic: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  };

  useEffect(() => {
    console.log('Inicializando Mapa.tsx, modo3D:', modo3D);
    const timer = setInterval(() => {
      if (!isPaused) {
        setGameStats(prev => ({
          ...prev,
          playTime: prev.playTime + 1
        }));

        setResources(prev => prev.map(resource => ({
          ...resource,
          amount: Math.min(100, resource.amount + Math.random())
        })));

        setFarmPlots(prev => prev.map(plot => 
          plot.cultivated ? {
            ...plot,
            growth: Math.min(100, (plot.growth || 0) + 0.1),
            health: Math.max(0, (plot.health || 100) - 0.05),
            resources: {
              water: Math.max(0, (plot.resources?.water || 100) - 0.1),
              nutrients: Math.max(0, (plot.resources?.nutrients || 100) - 0.05)
            }
          } : plot
        ));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const getCurrentLocation = (): void => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setResources(prev => prev.map(res => 
      res.name === 'TRUE COLOR' ? { ...res, icon: '⏳' } : res
    ));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCenter: [number, number] = [position.coords.latitude, position.coords.longitude];
        setCenter(newCenter);
        if (mapRef.current) {
          mapRef.current.setView(newCenter, 15);
        }
        
        setResources(prev => prev.map(res => 
          res.name === 'TRUE COLOR' ? { ...res, icon: '🌍' } : res
        ));
      },
      (err) => {
        console.error('Error getting location:', err);
        alert('Could not get your location. Please ensure GPS is enabled.');
        
        setResources(prev => prev.map(res => 
          res.name === 'TRUE COLOR' ? { ...res, icon: '🌍' } : res
        ));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleMapClick = (latlng: [number, number]): void => {
    if (!isPlacingMode || isPaused) return;

    const newPlot: FarmPlot = {
      id: `plot-${Date.now()}`,
      position: { lat: latlng[0], lng: latlng[1] },
      cultivated: false,
      growth: 0,
      health: 100,
      resources: { water: 100, nutrients: 100 }
    };

    setFarmPlots(prev => [...prev, newPlot]);
    setIsPlacingMode(false);
    setGameStats(prev => ({ 
      ...prev, 
      plotsCreated: prev.plotsCreated + 1,
      efficiency: Math.max(80, prev.efficiency - 1)
    }));
  };

  const handlePlotClick = (plot: FarmPlot): void => {
    setSelectedPlot(plot);
    setShowPlotModal(true);
  };

  const handleAccessPlot = (): void => {
    if (!selectedPlot) {
      console.error('Error: No hay parcela seleccionada para acceder');
      return;
    }
    console.log('Accediendo al terreno con parcela:', selectedPlot);
    setModo3D(true);
    setShowPlotModal(false);
  };

  const handleCultivatePlot = (): void => {
    if (selectedPlot) {
      setFarmPlots(prev => prev.map(plot =>
        plot.id === selectedPlot.id ? { ...plot, cultivated: true } : plot
      ));
      setSelectedPlot(prev => prev ? { ...prev, cultivated: true } : null);
    }
    setShowPlotModal(false);
  };

  const handleDeletePlot = (): void => {
    if (selectedPlot) {
      setFarmPlots(prev => prev.filter(plot => plot.id !== selectedPlot.id));
      setSelectedPlot(null);
    }
    setShowPlotModal(false);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` 
                    : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateFarmHealth = (): number => {
    if (farmPlots.length === 0) return 100;
    const totalHealth = farmPlots.reduce((sum, plot) => sum + (plot.health || 100), 0);
    return Math.round(totalHealth / farmPlots.length);
  };

  return (
    <div className="w-full h-screen relative">
      {modo3D ? (
        <>
          <VistaTerreno3d selectedPlot={selectedPlot} />
          <button
            onClick={() => {
              console.log('Regresando a mapa 2D');
              setModo3D(false);
              setSelectedPlot(null);
            }}
            className="absolute top-5 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all z-50"
          >
            Ver Mapa 2D
          </button>
        </>
      ) : (
        <div className="w-full h-screen bg-darker relative overflow-hidden flex flex-col font-sans">
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-50">
            {resources.map((resource, index) => {
              const isActive = resource.layerKey === activeLayer;
              return (
                <div
                  key={index}
                  onClick={() => resource.layerKey && setActiveLayer(resource.layerKey)}
                  className={`
                    flex items-center space-x-3 card-game px-4 py-3 cursor-pointer transition-all duration-300 min-w-[140px]
                    ${isActive ? 'shadow-glow border-2 border-primary/50 bg-primary/20 transform scale-105' : 'hover:scale-105'}
                  `}
                >
                  <div className={`w-3 h-3 rounded-full ${resource.color} animate-pulse`}></div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-muted">{resource.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-white">{Math.floor(resource.amount)}</span>
                      <div className="w-16 bg-card rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${resource.amount}%`,
                            background: resource.color.replace('bg-', '')
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute top-4 left-4 z-50">
            <div className="card-game p-2 flex space-x-1">
              {Object.entries(mapStyles).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setMapStyle(key as any)}
                  className={`px-3 py-2 rounded-game text-xs font-semibold transition-all ${
                    mapStyle === key 
                      ? 'bg-primary text-white shadow-button' 
                      : 'bg-card text-muted hover:bg-card-hover'
                  }`}
                >
                  {key.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {isPlacingMode && !isPaused && (
            <div className="absolute top-24 left-4 bg-gradient-primary text-white px-4 py-3 rounded-game-lg shadow-button z-40 animate-pulse-slow max-w-xs border-2 border-accent-gold">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xl">🎯</span>
                <span className="font-display">PLACEMENT MODE</span>
              </div>
              <div className="text-sm text-primary-100">
                Click on the map to place a farm plot
              </div>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={() => setIsPlacingMode(false)}
                  className="text-xs bg-primary-700/50 px-3 py-1 rounded-game hover:bg-primary-700/70 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 relative overflow-hidden z-10">
            <MapContainer
              ref={mapRef}
              center={center}
              zoom={12}
              className="h-full w-full"
            >
              <TileLayer
                url={mapStyles[mapStyle]}
                attribution='&copy; OpenStreetMap contributors'
              />
              <TileLayer
                key={activeLayer}
                url={availableLayers[activeLayer].url}
                attribution="NASA GIBS"
                opacity={availableLayers[activeLayer].opacity}
                eventHandlers={{
                  add: () => console.log(`TileLayer ${activeLayer} añadido`),
                  error: (e) => console.error(`Error cargando TileLayer ${activeLayer}:`, e)
                }}
              />

              <GameMapClickHandler
                onMapClick={handleMapClick}
                isPlacingMode={isPlacingMode}
              />

              {farmPlots.map((plot) => (
                <Marker
                  key={plot.id}
                  position={[plot.position.lat, plot.position.lng]}
                  icon={getPlotIcon(plot)}
                  eventHandlers={{
                    click: () => handlePlotClick(plot)
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-bold text-primary">Farm Plot</div>
                      <div>Status: {plot.cultivated ? 'Active' : 'Available'}</div>
                      {plot.cultivated && (
                        <>
                          <div>Growth: {Math.round(plot.growth || 0)}%</div>
                          <div>Health: {plot.health}%</div>
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {isPaused && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-40 animate-fade-in">
                <div className="card-game p-8 text-center max-w-md border-2 border-primary/30">
                  <div className="text-4xl font-display text-gradient-primary mb-4">⏸️ GAME PAUSED</div>
                  <div className="text-lg text-muted mb-6">Strategic farming simulation paused</div>
                  <button
                    onClick={() => setIsPaused(false)}
                    className="btn-game btn-premium px-8 py-4 text-lg transform hover:scale-110 transition-all duration-300"
                  >
                    ▶️ RESUME MISSION
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="absolute top-24 right-4 flex flex-col space-y-3 z-50">
            <button
              onClick={getCurrentLocation}
              className="w-14 h-14 card-game flex items-center justify-center hover:shadow-game-lg transition-all duration-300 hover:scale-110 hover:border-primary/50 group"
              title="GPS Location"
            >
              <span className="text-2xl group-hover:animate-spin">📍</span>
            </button>

            <button
              onClick={() => setShowStats(!showStats)}
              className="w-14 h-14 card-game flex items-center justify-center hover:shadow-game-lg transition-all duration-300 hover:scale-110 hover:border-accent-sun/50 group"
              title="Mission Statistics"
            >
              <span className="text-2xl group-hover:animate-bounce">📊</span>
            </button>

            <button
              onClick={() => setShowChatbot(!showChatbot)}
              className="w-14 h-14 card-game flex items-center justify-center hover:shadow-game-lg transition-all duration-300 hover:scale-110 hover:border-accent-soil/50 group"
              title="AgroBot Chat"
            >
              <span className="text-2xl group-hover:animate-bounce">🤖</span>
            </button>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-14 h-14 card-game flex items-center justify-center hover:shadow-game-lg transition-all duration-300 hover:scale-110 hover:border-accent-soil/50 group"
              title={isPaused ? "Resume Mission" : "Pause Mission"}
            >
              <span className="text-2xl">{isPaused ? '▶️' : '⏸️'}</span>
            </button>

            <div className="h-px bg-gray-600 my-1"></div>

            <button
              onClick={() => setIsPlacingMode(!isPlacingMode)}
              disabled={isPaused}
              className={`
                w-14 h-14 bg-gradient-primary rounded-game-lg flex items-center justify-center shadow-button transition-all duration-300 border-2 hover:scale-110
                ${isPlacingMode ? 'border-accent-gold shadow-glow animate-pulse' : 'border-primary/30'}
                ${isPaused ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-button-hover'}
              `}
              title={isPlacingMode ? "Cancel Placement" : "Create Farm Plot"}
            >
              <span className="text-2xl text-white">{isPlacingMode ? '✕' : '🌾'}</span>
            </button>

            {farmPlots.length > 0 && (
              <div className="card-game p-2 text-center">
                <div className="text-xs text-muted">FARM HEALTH</div>
                <div className="text-lg font-bold text-green-400">{calculateFarmHealth()}%</div>
              </div>
            )}
          </div>

          {showStats && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in">
              <div className="card-game p-6 max-w-md w-full mx-4 border-2 border-primary/30">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-display text-gradient-primary">📊 MISSION STATS</h2>
                  <button
                    onClick={() => setShowStats(false)}
                    className="text-muted hover:text-white text-xl transition-colors hover:scale-110"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: '⏱️', label: 'Mission Time', value: formatTime(gameStats.playTime) },
                    { icon: '🏗️', label: 'Plots Created', value: gameStats.plotsCreated },
                    { icon: '🌾', label: 'Crops Harvested', value: gameStats.cropsHarvested },
                    { icon: '💰', label: 'Resources Gathered', value: gameStats.resourcesGathered },
                    { icon: '⚡', label: 'Efficiency', value: `${gameStats.efficiency}%` }
                  ].map((stat, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-card/50 rounded-game border border-gray-600 hover:border-primary/30 transition-colors">
                      <span className="text-muted flex items-center space-x-3">
                        <span className="text-xl">{stat.icon}</span>
                        <span>{stat.label}</span>
                      </span>
                      <span className="font-bold text-white text-lg">{stat.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowStats(false)}
                    className="btn-game"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setGameStats({
                        playTime: 0,
                        plotsCreated: 0,
                        cropsHarvested: 0,
                        resourcesGathered: 0,
                        efficiency: 100
                      });
                      setFarmPlots([]);
                    }}
                    className="btn-game bg-gradient-sun text-gray-900"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {showChatbot && (
            <Chatbot
              center={center}
              selectedPlot={selectedPlot}
              onClose={() => setShowChatbot(false)}
            />
          )}

          <PlotModal
            isOpen={showPlotModal}
            onClose={() => setShowPlotModal(false)}
            onAccess={handleAccessPlot}
            onDelete={handleDeletePlot}
            onCultivate={handleCultivatePlot}
            plot={selectedPlot}
          />

          <div className="absolute bottom-4 left-4 card-game px-4 py-3 z-30">
            <div className="flex items-center space-x-4 text-sm text-white">
              <div className="flex items-center space-x-2">
                <span>⏱️</span>
                <span>{formatTime(gameStats.playTime)}</span>
              </div>
              {isPaused && (
                <div className="flex items-center space-x-2 text-accent-sun">
                  <span>•</span>
                  <span className="font-bold">PAUSED</span>
                </div>
              )}
              {farmPlots.length > 0 && (
                <div className="flex items-center space-x-2 text-primary-400">
                  <span>•</span>
                  <span>🌾 {farmPlots.length} Active Plots</span>
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-4 right-4 card-game px-4 py-2 text-xs text-muted z-30">
            <div className="flex items-center space-x-4">
              <span>🖱️ Drag to Move</span>
              <span>🎡 Scroll to Zoom</span>
              <span>🎯 Click to Interact</span>
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-muted z-20 font-mono bg-black/50 px-3 py-1 rounded-game">
            XLR HARVEST v2.0 | STRATEGIC FARMING PLATFORM
          </div>

          <style dangerouslySetInnerHTML={{
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
            @keyframes cultivatePulse {
              0%, 100% { 
                transform: translate(-50%, -50%) scale(1);
                opacity: 0.8;
              }
              50% { 
                transform: translate(-50%, -50%) scale(1.3);
                opacity: 0.4;
              }
            }
            @keyframes statusPulse {
              0%, 100% { 
                transform: scale(1);
                opacity: 1;
              }
              50% { 
                transform: scale(1.2);
                opacity: 0.7;
              }
            }
            .custom-div-icon {
              background: transparent !important;
              border: none !important;
            }
            .cultivated {
              filter: drop-shadow(0 0 8px rgba(76, 175, 80, 0.6));
            }
            .available {
              filter: drop-shadow(0 0 8px rgba(255, 193, 7, 0.6));
            }
            .leaflet-container {
              background: #1a1a1a !important;
            }
          `}} />
        </div>
      )}
    </div>
  );
};

export default Mapa;