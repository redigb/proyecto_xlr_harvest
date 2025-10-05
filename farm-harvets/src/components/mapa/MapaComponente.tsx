import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Types
interface Resource {
  name: string;
  amount: number;
  icon: string;
  color: string;
  layerKey?: 'truecolor' | 'ndvi' | 'thermal' | 'fire' | 'night';
}

interface BuildItem {
  id: string;
  name: string;
  cost: number;
  resourceType: 'wood' | 'stone' | 'pumpkin';
  icon: React.ReactNode;
  category: 'nature' | 'structures' | 'farming' | 'decorations';
  description: string;
  produces?: { resource: string; amount: number; interval: number };
}

interface PlantedItem {
  id: string;
  type: string;
  position: { lat: number; lng: number };
  growth: number;
  readyToHarvest: boolean;
  harvestAmount: number;
}

interface FarmPlot {
  id: string;
  position: { lat: number; lng: number };
  size: 'small' | 'medium' | 'large';
  cultivated: boolean;
  cropType?: string;
}

interface GameStats {
  playTime: number;
  itemsBuilt: number;
  cropsHarvested: number;
  resourcesGathered: number;
}

interface Position {
  lat: number;
  lng: number;
}

// SVG strings for icons
const treeSvg: string = `<svg viewBox="0 0 64 64" fill="none" width="48" height="48"><path d="M32 8L36 20L44 16L40 28L48 24L32 48L16 24L24 28L20 16L28 20L32 8Z" fill="#2d5a27"/><path d="M28 48L24 56L40 56L36 48L28 48Z" fill="#8b4513"/></svg>`;
const bushSvg: string = `<svg viewBox="0 0 64 64" fill="none" width="48" height="48"><circle cx="32" cy="40" r="16" fill="#4a7c59"/><circle cx="24" cy="32" r="12" fill="#5a8c69"/><circle cx="40" cy="32" r="10" fill="#4a7c59"/><circle cx="32" cy="24" r="8" fill="#6a9c79"/></svg>`;
const houseSvg: string = `<svg viewBox="0 0 64 64" fill="none" width="48" height="48"><path d="M8 40L32 16L56 40V56H8V40Z" fill="#e74c3c"/><path d="M32 8L56 32H8L32 8Z" fill="#c0392b"/><rect x="26" y="40" width="12" height="16" fill="#3498db"/><rect x="18" y="32" width="6" height="8" fill="#95a5a6"/><rect x="40" y="32" width="6" height="8" fill="#95a5a6"/></svg>`;
const monumentSvg: string = `<svg viewBox="0 0 64 64" fill="none" width="48" height="48"><rect x="24" y="16" width="16" height="32" fill="#bdc3c7"/><rect x="20" y="48" width="24" height="4" fill="#7f8c8d"/><path d="M32 8L36 16H28L32 8Z" fill="#95a5a6"/><rect x="30" y="20" width="4" height="12" fill="#34495e"/><rect x="30" y="36" width="4" height="8" fill="#34495e"/></svg>`;
const farmPlotSvg: string = `<svg viewBox="0 0 64 64" fill="none" width="40" height="40"><rect x="8" y="8" width="48" height="48" rx="8" fill="#a67c52"/><rect x="12" y="12" width="40" height="40" rx="4" fill="#bf8c60"/><circle cx="20" cy="24" r="2" fill="#8fbc8f"/><circle cx="44" cy="32" r="2" fill="#8fbc8f"/><circle cx="32" cy="44" r="2" fill="#8fbc8f"/><path d="M28 20L36 28M36 20L28 28" stroke="#8fbc8f" stroke-width="1"/></svg>`;
const wellSvg: string = `<svg viewBox="0 0 64 64" fill="none" width="48" height="48"><circle cx="32" cy="40" r="12" fill="#95a5a6"/><circle cx="32" cy="40" r="8" fill="#bdc3c7"/><rect x="28" y="20" width="8" height="20" fill="#8b4513"/><path d="M32 16L36 20H28L32 16Z" fill="#7f8c8d"/></svg>`;

const getCornSvg = (growth: number): string => {
  const y: number = 52 - (growth / 100 * 40);
  const h: number = growth / 100 * 40;
  const op1: number = growth > 50 ? 1 : 0;
  const op2: number = growth > 70 ? 1 : 0;
  return `<svg viewBox="0 0 64 64" fill="none" width="40" height="40"><rect x="28" y="${y}" width="8" height="${h}" fill="#f1c40f"/><path d="M24 20L32 12L40 20M26 28L32 22L38 28M28 36L32 32L36 36" stroke="#f39c12" stroke-width="2"/><circle cx="32" cy="16" r="4" fill="#e67e22" opacity="${op1}"/><circle cx="26" cy="24" r="3" fill="#e67e22" opacity="${op2}"/><circle cx="38" cy="24" r="3" fill="#e67e22" opacity="${op2}"/></svg>`;
};

const getWheatSvg = (growth: number): string => {
  const y: number = 52 - (growth / 100 * 35);
  const h: number = growth / 100 * 35;
  const op1: number = growth > 60 ? 1 : 0;
  const op2: number = growth > 75 ? 1 : 0;
  return `<svg viewBox="0 0 64 64" fill="none" width="40" height="40"><rect x="30" y="${y}" width="4" height="${h}" fill="#f39c12"/><path d="M28 16L32 12L36 16M26 24L32 18L38 24M24 32L32 24L40 32" stroke="#d35400" stroke-width="1.5"/><circle cx="32" cy="14" r="2" fill="#27ae60" opacity="${op1}"/><circle cx="28" cy="22" r="1.5" fill="#27ae60" opacity="${op2}"/><circle cx="36" cy="22" r="1.5" fill="#27ae60" opacity="${op2}"/></svg>`;
};

const getLettuceSvg = (growth: number): string => {
  const y: number = 48 - (growth / 100 * 25);
  const r: number = 8 + (growth / 100 * 8);
  const h: number = growth / 100 * 25;
  const op: number = growth > 80 ? 1 : 0;
  return `<svg viewBox="0 0 64 64" fill="none" width="40" height="40"><circle cx="32" cy="${y}" r="${r}" fill="#27ae60"/><path d="M24 32Q32 24 40 32M26 36Q32 30 38 36M28 40Q32 36 36 40" stroke="#2ecc71" stroke-width="1.5"/><rect x="30" y="${y}" width="4" height="${h}" fill="#8b4513"/><circle cx="32" cy="28" r="3" fill="#34495e" opacity="${op}"/></svg>`;
};

const getPumpkinSvg = (growth: number): string => {
  const y: number = 48 - (growth / 100 * 20);
  const r: number = 10 + (growth / 100 * 6);
  const h: number = growth / 100 * 20;
  const op1: number = growth > 60 ? 1 : 0;
  const op2: number = growth > 40 ? 1 : 0;
  return `<svg viewBox="0 0 64 64" fill="none" width="40" height="40"><circle cx="32" cy="${y}" r="${r}" fill="#e67e22"/><path d="M32 28C36 32 36 38 32 42C28 38 28 32 32 28Z" fill="#d35400" opacity="${op1}"/><rect x="30" y="${y}" width="4" height="${h}" fill="#8b4513"/><path d="M28 24L32 20L36 24" stroke="#27ae60" stroke-width="1.5" opacity="${op2}"/></svg>`;
};

// Function to get crop SVG
const getCropSvg = (type: string, growth: number): string => {
  switch (type) {
    case 'corn-seed': return getCornSvg(growth);
    case 'wheat-seed': return getWheatSvg(growth);
    case 'lettuce-seed': return getLettuceSvg(growth);
    case 'pumpkin-seed': return getPumpkinSvg(growth);
    default: return farmPlotSvg;
  }
};


// Function to get plot marker icon
const getPlotIcon = (plot: FarmPlot, plantedItem?: PlantedItem, isSelected?: boolean): L.DivIcon => {
  let innerHtml: string;
  if (plantedItem) {
    const svg: string = getCropSvg(plantedItem.type, plantedItem.growth);
    const progress: string = `<div style="position:absolute;top:-6px;left:0;right:0;margin:0 auto;width:40px;height:3px;background:rgba(0,0,0,0.5);border-radius:2px;"><div style="width:${plantedItem.growth}%;height:100%;background:linear-gradient(to right, #facc15, #22c55e);border-radius:2px;transition:width 0.3s ease;"></div></div>`;
    const harvest: string = plantedItem.readyToHarvest ? `<div style="position:absolute;top:-25px;left:0;right:0;margin:0 auto;background:#facc15;color:#b91c1c;padding:2px 8px;border-radius:6px;font-size:9px;font-weight:bold;white-space:nowrap;box-shadow:0 2px 4px rgba(0,0,0,0.2);animation: bounce 1s infinite;text-align:center;">¡COSECHAR!</div>` : '';
    innerHtml = `<div style="position:relative;width:40px;height:40px;">${progress}${harvest}${svg}</div>`;
  } else {
    innerHtml = farmPlotSvg;
  }
  const iconSize: L.PointExpression = isSelected ? [56, 56] : [40, 40];
  const anchor: L.PointExpression = isSelected ? [28, 56] : [20, 40];
  const wrapper: string = isSelected ? `<div style="position:relative;padding:4px;border:3px solid #facc15;border-radius:50%;background:transparent;">${innerHtml}</div>` : innerHtml;
  return L.divIcon({
    html: wrapper,
    className: 'custom-div-icon',
    iconSize,
    iconAnchor: anchor
  }) as L.DivIcon;
};

// Function to get structure icon
const getStructureIcon = (type: string): L.DivIcon => {
  let svg: string;
  switch (type) {
    case 'tree': svg = treeSvg; break;
    case 'bush': svg = bushSvg; break;
    case 'house': svg = houseSvg; break;
    case 'monument': svg = monumentSvg; break;
    case 'well': svg = wellSvg; break;
    default: svg = treeSvg;
  }
  return L.divIcon({
    html: `<div style="background:transparent;border:none;">${svg}</div>`,
    className: 'custom-div-icon',
    iconSize: [48, 48],
    iconAnchor: [24, 48]
  }) as L.DivIcon;
};

// Map click handler component
interface GameMapClickHandlerProps {
  onMapClick: (position: [number, number]) => void;
}

const GameMapClickHandler: React.FC<GameMapClickHandlerProps> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
};

// Modal for manual location input
const ManualLocationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSetLocation: (lat: number, lng: number) => void;
}> = ({ isOpen, onClose, onSetLocation }) => {
  const [lat, setLat] = useState('-12.0464');
  const [lng, setLng] = useState('-77.0428');

  if (!isOpen) return null;
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (!isNaN(latNum) && !isNaN(lngNum) && latNum >= -90 && latNum <= 90 && lngNum >= -180 && lngNum <= 180) {
      onSetLocation(latNum, lngNum);
      onClose();
    } else {
      alert('Coordenadas inválidas. Lat: -90 a 90, Lng: -180 a 180');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <h2 className="text-xl font-bold mb-4">📍 Ingresar Ubicación Manual</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="-12.0464"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
            <input
              type="number"
              step="any"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="-77.0428"
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
            >
              Establecer Ubicación
            </button>
          </div>
        </form>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Ejemplo: Lima, Perú (-12.0464, -77.0428)
        </p>
      </div>
    </div>
  );
};

// SVG Components (for build menu)
const TreeIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <path d="M32 8L36 20L44 16L40 28L48 24L32 48L16 24L24 28L20 16L28 20L32 8Z" fill="#2d5a27" />
    <path d="M28 48L24 56L40 56L36 48L28 48Z" fill="#8b4513" />
  </svg>
);

const BushIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="40" r="16" fill="#4a7c59" />
    <circle cx="24" cy="32" r="12" fill="#5a8c69" />
    <circle cx="40" cy="32" r="10" fill="#4a7c59" />
    <circle cx="32" cy="24" r="8" fill="#6a9c79" />
  </svg>
);

const HouseIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <path d="M8 40L32 16L56 40V56H8V40Z" fill="#e74c3c" />
    <path d="M32 8L56 32H8L32 8Z" fill="#c0392b" />
    <rect x="26" y="40" width="12" height="16" fill="#3498db" />
    <rect x="18" y="32" width="6" height="8" fill="#95a5a6" />
    <rect x="40" y="32" width="6" height="8" fill="#95a5a6" />
  </svg>
);

const MonumentIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <rect x="24" y="16" width="16" height="32" fill="#bdc3c7" />
    <rect x="20" y="48" width="24" height="4" fill="#7f8c8d" />
    <path d="M32 8L36 16H28L32 8Z" fill="#95a5a6" />
    <rect x="30" y="20" width="4" height="12" fill="#34495e" />
    <rect x="30" y="36" width="4" height="8" fill="#34495e" />
  </svg>
);

const FarmPlotIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <rect x="8" y="8" width="48" height="48" rx="8" fill="#a67c52" />
    <rect x="12" y="12" width="40" height="40" rx="4" fill="#bf8c60" />
    <circle cx="20" cy="24" r="2" fill="#8fbc8f" />
    <circle cx="44" cy="32" r="2" fill="#8fbc8f" />
    <circle cx="32" cy="44" r="2" fill="#8fbc8f" />
    <path d="M28 20L36 28M36 20L28 28" stroke="#8fbc8f" strokeWidth="1" />
  </svg>
);

const CornIcon: React.FC<{ growth?: number; className?: string }> = ({ growth = 100, className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <rect x="28" y={52 - (growth / 100 * 40)} width="8" height={growth / 100 * 40} fill="#f1c40f" />
    <path d="M24 20L32 12L40 20M26 28L32 22L38 28M28 36L32 32L36 36" stroke="#f39c12" strokeWidth="2" fill="none" />
    <circle cx="32" cy="16" r="4" fill="#e67e22" opacity={growth > 50 ? 1 : 0} />
    <circle cx="26" cy="24" r="3" fill="#e67e22" opacity={growth > 70 ? 1 : 0} />
    <circle cx="38" cy="24" r="3" fill="#e67e22" opacity={growth > 70 ? 1 : 0} />
  </svg>
);

const WheatIcon: React.FC<{ growth?: number; className?: string }> = ({ growth = 100, className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <rect x="30" y={52 - (growth / 100 * 35)} width="4" height={growth / 100 * 35} fill="#f39c12" />
    <path d="M28 16L32 12L36 16M26 24L32 18L38 24M24 32L32 24L40 32" stroke="#d35400" strokeWidth="1.5" fill="none" />
    <circle cx="32" cy="14" r="2" fill="#27ae60" opacity={growth > 60 ? 1 : 0} />
    <circle cx="28" cy="22" r="1.5" fill="#27ae60" opacity={growth > 75 ? 1 : 0} />
    <circle cx="36" cy="22" r="1.5" fill="#27ae60" opacity={growth > 75 ? 1 : 0} />
  </svg>
);

const LettuceIcon: React.FC<{ growth?: number; className?: string }> = ({ growth = 100, className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy={48 - (growth / 100 * 25)} r={8 + (growth / 100 * 8)} fill="#27ae60" />
    <path d="M24 32Q32 24 40 32M26 36Q32 30 38 36M28 40Q32 36 36 40" stroke="#2ecc71" strokeWidth="1.5" fill="none" />
    <rect x="30" y={48 - (growth / 100 * 25)} width="4" height={growth / 100 * 25} fill="#8b4513" />
    <circle cx="32" cy="28" r="3" fill="#34495e" opacity={growth > 80 ? 1 : 0} />
  </svg>
);

const PumpkinIcon: React.FC<{ growth?: number; className?: string }> = ({ growth = 100, className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy={48 - (growth / 100 * 20)} r={10 + (growth / 100 * 6)} fill="#e67e22" />
    <path d="M32 28C36 32 36 38 32 42C28 38 28 32 32 28Z" fill="#d35400" opacity={growth > 60 ? 1 : 0} />
    <rect x="30" y={48 - (growth / 100 * 20)} width="4" height={growth / 100 * 20} fill="#8b4513" />
    <path d="M28 24L32 20L36 24" stroke="#27ae60" strokeWidth="1.5" fill="none" opacity={growth > 40 ? 1 : 0} />
  </svg>
);

const WellIcon: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="40" r="12" fill="#95a5a6" />
    <circle cx="32" cy="40" r="8" fill="#bdc3c7" />
    <rect x="28" y="20" width="8" height="20" fill="#8b4513" />
    <path d="M32 16L36 20H28L32 16Z" fill="#7f8c8d" />
  </svg>
);

interface Props {
  onMode3d: () => void;
}


const MapaComponent: React.FC<Props> = ({ onMode3d }) => {
  // All hooks called unconditionally at the top
  const [resources, setResources] = useState<Resource[]>([
    { name: 'Color real', amount: 50, icon: '🌍', color: 'bg-orange-500', layerKey: 'truecolor' },
    { name: 'Vegetacion', amount: 100, icon: '🌱', color: 'bg-amber-700', layerKey: 'ndvi' },
    { name: 'Temperatura', amount: 100, icon: '🌡️', color: 'bg-amber-700', layerKey: 'thermal' },
    { name: 'Incendios', amount: 30, icon: '🔥', color: 'bg-gray-600', layerKey: 'fire' },
    { name: 'Vista nocturna', amount: 20, icon: '🌙', color: 'bg-blue-500', layerKey: 'night' },
  ]);

  const [selectedItem, setSelectedItem] = useState<BuildItem | null>(null);
  const [plantedItems, setPlantedItems] = useState<PlantedItem[]>([]);
  const [farmPlots, setFarmPlots] = useState<FarmPlot[]>([]);
  const [builtStructures, setBuiltStructures] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<'all' | 'nature' | 'structures' | 'farming' | 'decorations'>('all');
  const [selectedPlot, setSelectedPlot] = useState<string | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    playTime: 0,
    itemsBuilt: 0,
    cropsHarvested: 0,
    resourcesGathered: 0
  });
  const [showStats, setShowStats] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [center, setCenter] = useState<[number, number]>([-12.0464, -77.0428]);
  const [capaActiva, setCapaActiva] = useState<'truecolor' | 'ndvi' | 'thermal' | 'fire' | 'night'>('truecolor');
  const [showManualModal, setShowManualModal] = useState(false);
  const mapRef = useRef<L.Map>(null);

  const capasDisponibles = {
    truecolor: {
      nombre: '🌍 Color Real',
      url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_NOAA20_CorrectedReflectance_TrueColor/default/2025-10-05/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg',
      opacity: 0.8
    },
    ndvi: {
      nombre: '🌱 Vegetación (NDVI)',
      url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_NDVI_8Day/default/2025-10-05/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png',
      opacity: 0.7
    },
    thermal: {
      nombre: '🌡️ Temperatura',
      url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/2025-10-05/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png',
      opacity: 0.6
    },
    fire: {
      nombre: '🔥 Incendios',
      url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Aqua_Thermal_Anomalies_All/default/2025-10-05/GoogleMapsCompatible_Level9/{z}/{y}/{x}.png',
      opacity: 0.8
    },
    night: {
      nombre: '🌙 Vista Nocturna',
      url: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png',
      opacity: 0.9
    }
  } as const;

  // Function to get lat/lng from percentage
  const getPositionFromPercent = (x: number, y: number): Position => {
    const deltaLat: number = (50 - y) * 0.001;
    const deltaLng: number = (x - 50) * 0.001;
    return {
      lat: center[0] + deltaLat,
      lng: center[1] + deltaLng
    };
  };

  // Initialize farm plots
  useEffect(() => {
    const initialPercentPlots = [
      // Zona Norte
      { id: 'plot-n1', position: { x: 25, y: 25 }, size: 'medium' as const, cultivated: false },
      { id: 'plot-n2', position: { x: 35, y: 25 }, size: 'medium' as const, cultivated: false },
      { id: 'plot-n3', position: { x: 45, y: 25 }, size: 'medium' as const, cultivated: false },

      // Zona Centro
      { id: 'plot-c1', position: { x: 20, y: 50 }, size: 'medium' as const, cultivated: false },
      { id: 'plot-c2', position: { x: 30, y: 50 }, size: 'medium' as const, cultivated: false },
      { id: 'plot-c3', position: { x: 40, y: 50 }, size: 'medium' as const, cultivated: false },
      { id: 'plot-c4', position: { x: 50, y: 50 }, size: 'medium' as const, cultivated: false },

      // Zona Sur
      { id: 'plot-s1', position: { x: 25, y: 75 }, size: 'medium' as const, cultivated: false },
      { id: 'plot-s2', position: { x: 35, y: 75 }, size: 'medium' as const, cultivated: false },
      { id: 'plot-s3', position: { x: 45, y: 75 }, size: 'medium' as const, cultivated: false },

      // Zona Este
      { id: 'plot-e1', position: { x: 65, y: 50 }, size: 'medium' as const, cultivated: false },
      { id: 'plot-e2', position: { x: 75, y: 50 }, size: 'medium' as const, cultivated: false },

      // Zona Oeste
      { id: 'plot-w1', position: { x: 15, y: 50 }, size: 'medium' as const, cultivated: false },
      { id: 'plot-w2', position: { x: 5, y: 50 }, size: 'medium' as const, cultivated: false },
    ];
    const initialPlots: FarmPlot[] = initialPercentPlots.map(p => ({
      ...p,
      position: getPositionFromPercent(p.position.x, p.position.y)
    }));
    setFarmPlots(initialPlots);
  }, [center]);

  // Game timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isPaused) {
        setGameStats(prev => ({
          ...prev,
          playTime: prev.playTime + 1
        }));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused]);

  // Resource production system
  useEffect(() => {
    const productionInterval = setInterval(() => {
      if (isPaused) return;

      builtStructures.forEach(structure => {
        const item = buildItems.find(bi => bi.id === structure.type);
        if (item?.produces) {
          setResources(prev => prev.map(r =>
            r.name === item.produces!.resource
              ? { ...r, amount: r.amount + item.produces!.amount }
              : r
          ));
          setGameStats(prev => ({
            ...prev,
            resourcesGathered: prev.resourcesGathered + item.produces!.amount
          }));
        }
      });
    }, 30000);

    return () => clearInterval(productionInterval);
  }, [builtStructures, isPaused]);

  // Build items configuration
  const buildItems: BuildItem[] = [
    // Farming
    {
      id: 'farm-plot',
      name: 'Terreno Cultivable',
      cost: 0,
      resourceType: 'wood',
      category: 'farming',
      description: 'Prepara tierra para cultivar',
      icon: <FarmPlotIcon className="w-8 h-8" />
    },
    {
      id: 'pumpkin-seed',
      name: 'Semilla de Calabaza',
      cost: 0,
      resourceType: 'pumpkin',
      category: 'farming',
      description: 'Planta calabazas en terreno cultivable',
      icon: <PumpkinIcon className="w-8 h-8" />
    },
  ];

  // Filter items by category
  const filteredItems = activeCategory === 'all'
    ? buildItems
    : buildItems.filter(item => item.category === activeCategory);

  // GPS function
  const obtenerUbicacionActual = (): void => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCenter: [number, number] = [position.coords.latitude, position.coords.longitude];
        setCenter(newCenter);
        if (mapRef.current) {
          mapRef.current.setView(newCenter, 12);
        }
      },
      (err) => {
        console.error('Error obteniendo ubicación:', err);
        alert('No se pudo obtener tu ubicación. Asegúrate de tener GPS activado.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Function to select and build item
  const selectAndBuildItem = (item: BuildItem): void => {
    setSelectedItem(selectedItem?.id === item.id ? null : item);
    setSelectedPlot(null);
  };

  // Function to create farm plot
  const createFarmPlot = (position: Position): void => {
    if (!selectedItem || selectedItem.id !== 'farm-plot') return;

    const newPlot: FarmPlot = {
      id: `plot-${Date.now()}`,
      position,
      size: 'medium',
      cultivated: false
    };

    setFarmPlots(prev => [...prev, newPlot]);
    setSelectedItem(null);
    setGameStats(prev => ({ ...prev, itemsBuilt: prev.itemsBuilt + 1 }));
  };

  // Handle map click for building
  const handleMapClick = (latlng: [number, number]): void => {
    if (!selectedItem || isPaused || selectedItem.id.includes('seed')) return;
    const position: Position = { lat: latlng[0], lng: latlng[1] };
    if (selectedItem.id === 'farm-plot') {
      createFarmPlot(position);
    }
  };

  // Function to cultivate plot
  const cultivatePlot = (plotId: string, cropType: string): void => {
    if (!selectedItem || !selectedItem.id.includes('seed')) return;

    setFarmPlots(prev => prev.map(plot =>
      plot.id === plotId
        ? { ...plot, cultivated: true, cropType }
        : plot
    ));

    const plot = farmPlots.find(p => p.id === plotId);
    if (plot) {
      const harvestAmount = cropType === 'pumpkin-seed' ? 8 :
        cropType === 'lettuce-seed' ? 4 : 0;

      const newPlantedItem: PlantedItem = {
        id: `${cropType}-${Date.now()}`,
        type: cropType,
        position: plot.position,
        growth: 0,
        readyToHarvest: false,
        harvestAmount,
      };

      setPlantedItems(prev => [...prev, newPlantedItem]);
      setSelectedItem(null);
      setSelectedPlot(null);
    }
  };

  // Growth system for planted items
  useEffect(() => {
    const growthInterval = setInterval(() => {
      if (isPaused) return;

      setPlantedItems(prev => prev.map(item => {
        const newGrowth = Math.min(item.growth + 2, 100);
        return {
          ...item,
          growth: newGrowth,
          readyToHarvest: newGrowth === 100,
        };
      }));
    }, 2000);

    return () => clearInterval(growthInterval);
  }, [isPaused]);

  // Harvest system
  const harvestItem = (itemId: string): void => {
    const item = plantedItems.find(i => i.id === itemId);
    if (!item || !item.readyToHarvest) return;

    setPlantedItems(prev => prev.filter(planted => planted.id !== itemId));
    setFarmPlots(prev => prev.map(plot =>
      plot.position.lat === item.position.lat && plot.position.lng === item.position.lng
        ? { ...plot, cultivated: false, cropType: undefined }
        : plot
    ));

    setGameStats(prev => ({
      ...prev,
      cropsHarvested: prev.cropsHarvested + 1,
      resourcesGathered: prev.resourcesGathered + item.harvestAmount
    }));
  };

  // Handle plot click
  const handlePlotClick = (plotId: string): void => {
    if (isPaused || (selectedItem && !selectedItem.id.includes('seed'))) return;

    const plot = farmPlots.find(p => p.id === plotId);
    if (!plot) return;

    if (selectedItem && selectedItem.id.includes('seed') && !plot.cultivated) {
      cultivatePlot(plotId, selectedItem.id);
    } else if (plot.cultivated) {
      const plantedItem = plantedItems.find(item =>
        item.position.lat === plot.position.lat && item.position.lng === plot.position.lng
      );
      if (plantedItem && plantedItem.readyToHarvest) {
        harvestItem(plantedItem.id);
      }
    } else {
      setSelectedPlot(prev => prev === plotId ? null : plotId);
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-emerald-50 to-teal-100 relative overflow-hidden flex flex-col font-sans antialiased">
      {/* Top Bar - Resources z-50 */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-4 z-50">
        {resources.map((resource, index) => {
          const isActive = resource.layerKey === capaActiva;
          return (
            <div
              key={index}
              onClick={() => resource.layerKey && setCapaActiva(resource.layerKey)}
              className={`
                flex items-center space-x-3 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-white/50 
                cursor-pointer hover:shadow-2xl transition-all duration-300 group
                ${isActive ? 'ring-2 ring-blue-500 shadow-2xl' : ''}
              `}
            >
              <span className="text-2xl transform group-hover:scale-110 transition-transform duration-200">{resource.icon}</span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{resource.name}</span>
                <span className="text-xl font-bold text-gray-800 tracking-wider">{resource.amount.toLocaleString()}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* World Map - relative z-10 */}
      <div className="flex-1 relative overflow-hidden z-10">
        <MapContainer
          ref={mapRef}
          center={center}
          zoom={10}
          className="h-full w-full"
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

          {selectedItem && !selectedItem.id.includes('seed') && !isPaused && (
            <GameMapClickHandler onMapClick={handleMapClick} />
          )}

          {/* Built Structures */}
          {builtStructures.map((structure) => (
            <Marker
              key={structure.id}
              position={[structure.position.lat, structure.position.lng]}
              icon={getStructureIcon(structure.type)}
            />
          ))}

          {/* Farm Plots */}
          {farmPlots.map((plot) => {
            const plantedItem = plantedItems.find(item =>
              item.position.lat === plot.position.lat && item.position.lng === plot.position.lng
            );
            const isSelected = selectedPlot === plot.id;
            const icon = getPlotIcon(plot, plantedItem, isSelected);
            return (
              <Marker
                key={plot.id}
                position={[plot.position.lat, plot.position.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => handlePlotClick(plot.id)
                }}
              />
            );
          })}
        </MapContainer>

        {/* Pause Overlay z-40 */}
        {isPaused && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-40">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl">
              <div className="text-3xl font-bold text-gray-800 mb-4">⏸️ JUEGO EN PAUSA</div>
              <div className="text-lg text-gray-600 mb-6">Haz clic en el botón de play para continuar</div>
              <button
                onClick={() => setIsPaused(false)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                ▶️ Continuar Juego
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Top Right Controls z-50 */}
      <div className="absolute top-6 right-6 flex flex-col space-y-3 z-50">
        <button
          onClick={obtenerUbicacionActual}
          className="w-12 h-12 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 hover:scale-105"
          title="Centrar en mi ubicación GPS"
        >
          <span className="text-xl">📍</span>
        </button>

        <button
          onClick={() => setShowStats(!showStats)}
          className="w-12 h-12 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 hover:scale-105"
          title="Estadísticas"
        >
          <span className="text-xl">📊</span>
        </button>
        <button
          onClick={() => onMode3d()}
          className="absolute top-5 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-all"
        >
          terreno 3D
        </button>

        <button
          onClick={() => setIsPaused(!isPaused)}
          className="w-12 h-12 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 hover:scale-105"
          title={isPaused ? "Reanudar" : "Pausar"}
        >
          <span className="text-xl">{isPaused ? '▶️' : '⏸️'}</span>
        </button>

        {filteredItems.map((item) => {
          const isItemSelected = selectedItem?.id === item.id;
          return (
            <button
              key={item.id}
              onClick={() => selectAndBuildItem(item)}
              disabled={isPaused}
              className={`
                w-12 h-12 bg-white/95 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50 hover:scale-105
                ${isItemSelected ? 'ring-2 ring-emerald-500' : ''}
                ${isPaused ? 'cursor-not-allowed opacity-50' : ''}
              `}
              title={item.name + '\n' + item.description}
            >
              {item.icon}
            </button>
          );
        })}
      </div>

      {/* Stats Modal z-50 */}
      {showStats && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">📊 Estadísticas del Juego</h2>
              <button
                onClick={() => setShowStats(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="font-semibold text-gray-700">⏱️ Tiempo de Juego:</span>
                <span className="font-bold text-gray-900">{formatTime(gameStats.playTime)}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                <span className="font-semibold text-gray-700">🏗️ Elementos Construidos:</span>
                <span className="font-bold text-gray-900">{gameStats.itemsBuilt}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-xl">
                <span className="font-semibold text-gray-700">🌾 Cultivos Cosechados:</span>
                <span className="font-bold text-gray-900">{gameStats.cropsHarvested}</span>
              </div>

              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                <span className="font-semibold text-gray-700">💰 Recursos Recolectados:</span>
                <span className="font-bold text-gray-900">{gameStats.resourcesGathered}</span>
              </div>
            </div>

            <button
              onClick={() => setShowStats(false)}
              className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-all duration-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Selection Indicator z-40 */}
      {selectedItem && !isPaused && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-emerald-500/95 text-white px-6 py-3 rounded-full shadow-2xl z-40 backdrop-blur-md border border-emerald-400">
          <div className="flex items-center space-x-3">
            <span className="font-semibold">Seleccionado:</span>
            <span className="font-bold">{selectedItem.name}</span>
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          </div>
          <div className="text-xs text-emerald-100 text-center mt-1">
            {selectedItem.id === 'farm-plot'
              ? 'Haz clic en el mapa para colocar terreno cultivable'
              : selectedItem.id.includes('seed')
                ? 'Haz clic en un terreno cultivable para plantar'
                : 'Haz clic en el mapa para construir'
            }
          </div>
        </div>
      )}

      {/* Game Info Bar z-30 */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-emerald-200 z-30">
        <div className="text-sm text-gray-700">
          <span className="font-semibold">⏱️ {formatTime(gameStats.playTime)}</span>
          {isPaused && <span className="ml-2 text-red-500 font-bold"> • PAUSADO</span>}
        </div>
      </div>

      {/* Navigation Instructions z-30 */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-xl text-xs backdrop-blur-sm z-30">
        <div>🖱️ Arrastra para mover • 🎡 Rueda para zoom</div>
      </div>

      {/* Manual Modal */}
      <ManualLocationModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onSetLocation={(lat, lng) => setCenter([lat, lng])}
      />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
      `}} />
    </div>
  );
};

export default MapaComponent;