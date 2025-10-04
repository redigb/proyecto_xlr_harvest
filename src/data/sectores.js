export const sectoresMock = Array.from({ length: 81 }, (_, index) => ({
  id: index + 1,
  humedad: Math.floor(Math.random() * 101),  // 0-100 aleatorio
  nutrientes: Math.floor(Math.random() * 101),
  cultivo: Math.random() > 0.5 ? 'Trigo' : Math.random() > 0.7 ? 'Maíz' : 'Ninguno',
  estado: Math.random() > 0.7 ? 'Saludable' : Math.random() > 0.4 ? 'Seco' : 'Húmedo'
}));

export const getSectorData = (sectorId) => {
  return sectoresMock.find(sector => sector.id === sectorId) || 
         { humedad: 0, nutrientes: 0, cultivo: 'Desconocido', estado: 'Error' };
};