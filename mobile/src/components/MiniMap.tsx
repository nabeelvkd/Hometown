import { WebView } from 'react-native-webview';

/**
 * A compact OpenStreetMap (Leaflet) map preview rendered in a WebView. Map
 * interactions are disabled and touches pass through, so the parent can handle
 * the tap (e.g. open Google Maps). Used purely for a modern map visual.
 */
export function MiniMap({ lat, lng }: { lat: number; lng: number }) {
  const html = `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>html,body,#map{height:100%;margin:0;padding:0;background:#EAF3EC}.leaflet-control-attribution{display:none}</style>
</head><body><div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var map = L.map('map', {
    zoomControl: false, attributionControl: false,
    dragging: false, scrollWheelZoom: false, doubleClickZoom: false,
    boxZoom: false, keyboard: false, tap: false, touchZoom: false,
  }).setView([${lat}, ${lng}], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
  var pin = L.divIcon({
    className: '',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    html: '<svg width="20" height="42" viewBox="0 0 24 34" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="M12 0C5.37 0 0 5.37 0 12c0 8.25 12 22 12 22s12-13.75 12-22C24 5.37 18.63 0 12 0z" fill="#EA4335"/>'
      + '<circle cx="12" cy="12" r="4.5" fill="#9f0000"/></svg>',
  });
  L.marker([${lat}, ${lng}], { icon: pin }).addTo(map);
</script></body></html>`;

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      pointerEvents="none"
      scrollEnabled={false}
      style={{ flex: 1, backgroundColor: '#EAF3EC' }}
      androidLayerType="hardware"
    />
  );
}
