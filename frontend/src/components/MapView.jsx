import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

// Default Leaflet marker icons don't load correctly with Vite's bundler,
// so we rebuild the icon URLs manually here.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Black marker for the logged-in user's own position
const userIcon = new L.Icon({
  iconUrl:
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
        <circle cx="14" cy="14" r="8" fill="black" stroke="white" stroke-width="3"/>
      </svg>`
    ),
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function Recenter({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center]);
  return null;
}

export default function MapView({ center, tradespeople = [], onSelect, selectedId }) {
  if (!center) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#111",
          color: "#8a8a8a",
        }}
      >
        Getting your location...
      </div>
    );
  }

  return (
    <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter center={center} />
      <Marker position={center} icon={userIcon}>
        <Popup>You are here</Popup>
      </Marker>
      {tradespeople.map((t) => {
        if (!t.location?.coordinates || t.location.coordinates[0] === 0) return null;
        const [lng, lat] = t.location.coordinates;
        return (
          <Marker
            key={t._id}
            position={[lat, lng]}
            eventHandlers={{ click: () => onSelect && onSelect(t._id) }}
          >
            <Popup>
              <strong>{t.name}</strong>
              <br />
              {t.trade}
              <br />
              KSh {t.hourlyRate}/hr
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
