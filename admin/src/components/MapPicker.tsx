import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Leaflet's default icon paths break under bundlers; point them at the bundled assets.
const markerIconObj = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Fallback view when nothing is set yet (roughly central Kerala).
const DEFAULT_CENTER: [number, number] = [10.85, 76.27];

function ClickCapture({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/** Recenters the map when the coordinates change externally (e.g. "use my location"). */
function Recenter({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], Math.max(map.getZoom(), 15));
  }, [lat, lng, map]);
  return null;
}

interface Props {
  lat?: number | null;
  lng?: number | null;
  onChange: (lat: number, lng: number) => void;
}

/** OpenStreetMap location picker — click or drag the marker to set coordinates. */
export function MapPicker({ lat, lng, onChange }: Props) {
  const hasPoint = lat != null && lng != null;
  const center: [number, number] = hasPoint ? [lat!, lng!] : DEFAULT_CENTER;
  return (
    <MapContainer
      center={center}
      zoom={hasPoint ? 15 : 8}
      scrollWheelZoom
      style={{ height: 300, width: '100%', borderRadius: 10 }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickCapture onPick={onChange} />
      <Recenter lat={lat} lng={lng} />
      {hasPoint && (
        <Marker
          position={[lat!, lng!]}
          icon={markerIconObj}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const m = (e.target as L.Marker).getLatLng();
              onChange(m.lat, m.lng);
            },
          }}
        />
      )}
    </MapContainer>
  );
}
