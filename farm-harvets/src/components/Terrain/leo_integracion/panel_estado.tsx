import React, { useState, useEffect } from 'react';
import * as THREE from 'three';

// ------------------ Tipos base ------------------
export interface PlotUserData {
  id: number;
  isWatered?: boolean;
  crop?: string | null;
  isGrown?: boolean;
  plantTime?: number | null;
  crops?: THREE.Object3D[];
}

export interface Plot extends THREE.Object3D {
  userData: PlotUserData;
  children: THREE.Object3D[];
}

export interface SectorData {
  id: number;
  plot: Plot;
  position?: { lat: number; lng: number }; // GPS de la parcela (de MapaComponente)
}

interface WeatherData {
  temperature: number; // °C
  description: string; // Ej. "Cielo despejado"
  icon: string; // Clase de ícono FontAwesome
}

interface PanelEstadoProps {
  sectorSeleccionado: SectorData | null;
  onPlant: (plot: Plot, cropType: string) => void;
  onHarvest: (plot: Plot) => void;
  onWater: (plot: Plot) => void;
}

const PanelEstado: React.FC<PanelEstadoProps> = ({
  sectorSeleccionado,
  onPlant,
  onHarvest,
  onWater,
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // 🌤️ Fetch datos climáticos de Open-Meteo
  useEffect(() => {
    if (!sectorSeleccionado) {
      // No hacer fetch si no hay parcela seleccionada
      setWeatherData(null);
      setLoadingWeather(false);
      return;
    }

    const fetchWeather = async () => {
      // Usar coordenadas de la parcela o Huanuco como fallback
      const lat = sectorSeleccionado.position?.lat || -9.9306;
      const lon = sectorSeleccionado.position?.lng || -76.2422;
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&timezone=auto`;

      try {
        setLoadingWeather(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error en la solicitud');
        const data = await response.json();

        // Extraer datos del clima actual
        const hourly = data.hourly;
        const now = new Date();
        const currentHourIndex = Math.floor((now.getTime() - new Date(hourly.time[0]).getTime()) / (1000 * 3600));
        const currentTemperature = hourly.temperature_2m[currentHourIndex];
        const weatherCode = hourly.weathercode[currentHourIndex];

        // Determinar descripción e ícono según weathercode
        let description = 'Desconocido';
        let icon = 'fas fa-question';
        if (weatherCode === 0) {
          description = 'Cielo despejado';
          icon = 'fas fa-sun';
        } else if ([1, 2, 3].includes(weatherCode)) {
          description = 'Mayormente despejado';
          icon = 'fas fa-cloud-sun';
        } else if ([45, 48].includes(weatherCode)) {
          description = 'Niebla';
          icon = 'fas fa-smog';
        } else if ([51, 53, 55].includes(weatherCode)) {
          description = 'Lluvia ligera';
          icon = 'fas fa-cloud-rain';
        } else if ([61, 63, 65].includes(weatherCode)) {
          description = 'Lluvia moderada';
          icon = 'fas fa-cloud-showers-heavy';
        } else if ([80, 81, 82].includes(weatherCode)) {
          description = 'Lluvia fuerte';
          icon = 'fas fa-cloud-rain';
        } else if ([95, 96, 99].includes(weatherCode)) {
          description = 'Tormenta';
          icon = 'fas fa-bolt';
        }

        setWeatherData({
          temperature: Math.round(currentTemperature),
          description,
          icon,
        });
        setLoadingWeather(false);
      } catch (error) {
        console.error('Error al obtener el clima:', error);
        setWeatherData(null);
        setLoadingWeather(false);
      }
    };

    // Llamada inicial
    fetchWeather();
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchWeather, 300000); // 5 minutos = 300,000 ms
    return () => clearInterval(interval); // Limpiar intervalo al desmontar
  }, [sectorSeleccionado]); // Dependencia en sectorSeleccionado para actualizar si cambia la parcela

  // 🪴 Estado inicial sin selección
  if (!sectorSeleccionado) {
    return (
      <div className="card-game max-w-md mx-auto p-8 text-center animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-sun rounded-full flex items-center justify-center shadow-premium">
          <span className="text-3xl">🎯</span>
        </div>
        <h3 className="text-gradient-game text-2xl font-game mb-2 tracking-wide">
          Selecciona una Parcela
        </h3>
        <p className="text-game-muted text-lg">
          Elige una parcela del campo para gestionar su cultivo
        </p>
      </div>
    );
  }

  // 🔍 Datos del sector seleccionado
  const { id, plot, position } = sectorSeleccionado;
  const plotData = plot?.userData || ({} as PlotUserData);
  const isWatered = plotData.isWatered ?? false;
  const hasCrop = !!plotData.crop;
  const isGrown = plotData.isGrown ?? false;

  // 🌱 Acciones
  const handlePlantClick = (cropType: string) => {
    if (!plot) return;
    if (!isWatered) {
      alert('Debes regar la parcela antes de plantar');
      return;
    }
    onPlant(plot, cropType);
  };

  const handleWaterClick = () => {
    if (!plot) return;
    if (hasCrop) {
      alert('No puedes regar una parcela que ya tiene cultivos');
      return;
    }
    onWater(plot);
  };

  // ------------------ Renderizado ------------------
  return (
    <div className="card-premium max-w-md mx-auto animate-scale-in">
      {/* HEADER */}
      <div className="bg-gradient-game p-6 rounded-t-game-xl text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10" />
        <h2 className="text-3xl font-game text-white text-shadow-game-lg relative z-10">
          Parcela #{id}
        </h2>
        <div className="absolute top-2 right-2 badge-premium text-sm">ACTIVA</div>
      </div>

      {/* ESTADO GENERAL */}
      <div className="p-6 space-y-4">
        {/* Estado del suelo */}
        <div className="flex items-center justify-between p-4 bg-white/50 rounded-game-lg border-2 border-accent-sky/30">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isWatered
                  ? 'bg-blue-100 border-2 border-blue-300'
                  : 'bg-orange-100 border-2 border-orange-300'
              }`}
            >
              <span className="text-xl">{isWatered ? '💧' : '🏜️'}</span>
            </div>
            <div>
              <p className="text-game-deep font-semibold">Estado del Suelo</p>
              <p
                className={`text-sm font-medium ${
                  isWatered ? 'text-blue-600' : 'text-orange-600'
                }`}
              >
                {isWatered ? 'Húmedo - Listo' : 'Seco - Necesita agua'}
              </p>
            </div>
          </div>
        </div>

        {/* Coordenadas y datos climáticos */}
        <div className="bg-white/60 rounded-game-lg border-2 border-accent-soil/20 p-4">
          <h4 className="text-gradient-sun text-lg font-game mb-3 text-center">🌍 Coordenadas y Clima</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-game-muted text-sm">Coordenadas</p>
              <p className="text-game-dark text-lg font-bold mt-1">
                Lat: {(position?.lat || -9.9306).toFixed(4)}
              </p>
              <p className="text-game-dark text-lg font-bold">
                Lng: {(position?.lng || -76.2422).toFixed(4)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-game-muted text-sm">Clima Actual</p>
              {loadingWeather ? (
                <div className="text-game-muted animate-pulse">Cargando datos climáticos...</div>
              ) : weatherData ? (
                <>
                  <p className="text-2xl font-bold text-game-dark">
                    <i className={`${weatherData.icon} mr-2`}></i>
                    {weatherData.temperature}°C
                  </p>
                  <p className="text-sm text-game-muted">{weatherData.description}</p>
                </>
              ) : (
                <div className="text-game-muted">Error al cargar el clima</div>
              )}
            </div>
          </div>
        </div>

        {/* Estado del cultivo */}
        <div className="bg-white/60 rounded-game-lg border-2 border-accent-soil/20 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-game-muted text-sm font-medium">Cultivo Actual</p>
              <p className="text-game-dark text-lg font-bold mt-1">
                {plotData.crop || 'Ninguno'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-game-muted text-sm font-medium">Estado</p>
              <div
                className={`mt-1 text-sm font-semibold ${
                  hasCrop
                    ? isGrown
                      ? 'text-green-600'
                      : 'text-yellow-600'
                    : 'text-game-muted'
                }`}
              >
                {hasCrop
                  ? isGrown
                    ? 'Listo 🌟'
                    : 'Creciendo 🌱'
                  : 'Disponible'}
              </div>
            </div>
          </div>
        </div>

        {/* Progreso visual */}
        {hasCrop && (
          <div className="bg-white/50 rounded-game-lg p-4 border-2 border-primary/10">
            <div className="flex justify-between text-sm text-game-deep mb-2">
              <span>Progreso del cultivo</span>
              <span>{isGrown ? '100%' : '50%'}</span>
            </div>
            <div className="w-full bg-game-light rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  isGrown ? 'bg-gradient-game w-full' : 'bg-gradient-sun w-1/2'
                }`}
              />
            </div>
          </div>
        )}
      </div>

      {/* ACCIONES */}
      <div className="p-6 pt-0 space-y-4">
        {/* Botón de regar */}
        {!hasCrop && (
          <button
            onClick={handleWaterClick}
            className={`w-full py-4 px-6 rounded-game-lg font-bold text-lg transition-all duration-300 relative overflow-hidden group ${
              isWatered
                ? 'bg-game-light text-game-muted cursor-not-allowed border-2 border-game-light'
                : 'btn-sun shadow-button hover:shadow-button-hover'
            }`}
            disabled={isWatered}
          >
            {isWatered ? (
              <div className="flex items-center justify-center space-x-2">
                <span>✅ Ya Regada</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">💦</span>
                <span>Regar Parcela</span>
              </div>
            )}
          </button>
        )}

        {/* Selección de cultivos */}
        {!hasCrop && isWatered && (
          <div className="animate-slide-in-up">
            <h4 className="text-gradient-sun text-xl font-game text-center mb-4 tracking-wide">
              🌱 Plantar Cultivo
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {['Papa', 'Maíz', 'Quinua'].map((crop) => (
                <button
                  key={crop}
                  onClick={() => handlePlantClick(crop)}
                  className="group bg-white/80 hover:bg-white border-2 border-accent-soil/30 hover:border-accent-soil/60 rounded-game-lg p-4 transition-all duration-300 hover:scale-105 active:scale-95 shadow-game-sm hover:shadow-game"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-accent-soil-100 rounded-game flex items-center justify-center text-2xl">
                      {crop === 'Papa' ? '🥔' : crop === 'Maíz' ? '🌽' : '🌾'}
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-game-dark">{crop}</p>
                      <p className="text-sm text-game-muted">
                        {crop === 'Papa'
                          ? 'Crecimiento rápido'
                          : crop === 'Maíz'
                          ? 'Alto rendimiento'
                          : 'Premium'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cosechar */}
        {hasCrop && isGrown && plot && (
          <button
            onClick={() => onHarvest(plot)}
            className="w-full btn-premium py-4 px-6 rounded-game-lg text-lg font-bold animate-pulse-glow hover:animate-rainbow"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">🎉</span>
              <span>Cosechar {plotData.crop}</span>
            </div>
          </button>
        )}

        {/* Cultivo en crecimiento */}
        {hasCrop && !isGrown && (
          <div className="from-accent-sun-50 to-yellow-50 rounded-game-lg p-5 border-2 border-accent-sun/30 text-center animate-pulse-sun">
            <div className="w-16 h-16 mx-auto mb-3 bg-accent-sun-100 rounded-full flex items-center justify-center border-2 border-accent-sun/50">
              <span className="text-2xl">⏳</span>
            </div>
            <h4 className="text-gradient-sun text-xl font-game mb-2">Cultivo en Crecimiento</h4>
            <p className="text-game-dark font-medium">
              Tu {plotData.crop} está creciendo...
            </p>
            <p className="text-game-muted text-sm mt-1">
              Estará listo para cosechar pronto
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="bg-game-light/30 p-4 rounded-b-game-xl border-t border-white/60">
        <div className="flex justify-between text-xs text-game-muted">
          <span>Estado: {hasCrop ? 'Ocupada' : 'Disponible'}</span>
          <span>ID: #{id}</span>
        </div>
      </div>
    </div>
  );
};

export default PanelEstado;