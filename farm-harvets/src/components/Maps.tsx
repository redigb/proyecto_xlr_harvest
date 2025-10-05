import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';


function MapaFullScreen() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <MapContainer
        center={[-12.0464, -77.0428]} // Lima, Perú
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        />
        <Marker position={[-12.0464, -77.0428]}>
          <Popup>Lima, Perú 🇵🇪</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default MapaFullScreen;
