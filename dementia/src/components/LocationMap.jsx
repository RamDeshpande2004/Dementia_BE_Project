// src/components/LocationMap.jsx
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Safe home center (Pune)
const SAFE_CENTER = { lat: 18.5204, lng: 73.8567 };
const SAFE_RADIUS_M = 300;

// Marker icon
const patientIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [35, 35],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

// Component to smoothly change map center when coordinates change
function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15, { duration: 1.0 });
  }, [center, map]);
  return null;
}

export default function LocationMap({
  location,
  locationName,
  language = "en",
  isOutOfZone,
}) {
  const [translatedLabel, setTranslatedLabel] = useState("");

  // ✅ Language support for title
  useEffect(() => {
    if (language === "hi") setTranslatedLabel("रोगी का स्थान");
    else if (language === "mr") setTranslatedLabel("रुग्णाचे स्थान");
    else setTranslatedLabel("Patient Location");
  }, [language]);

  return (
    <section className="panel map-panel" style={{ textAlign: "center" }}>
      <h3
        style={{ marginBottom: "10px", fontSize: "1.25rem", color: "#60a5fa" }}
      >
        {translatedLabel}
      </h3>

      <div
        className="map-wrapper"
        style={{ height: "400px", borderRadius: "12px", overflow: "hidden" }}
      >
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={15}
          className="patient-map"
          style={{ height: "100%", width: "100%" }}
        >
          <ChangeView center={[location.lat, location.lng]} />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Circle
            center={[SAFE_CENTER.lat, SAFE_CENTER.lng]}
            radius={SAFE_RADIUS_M}
            color={isOutOfZone ? "#ef4444" : "#22c55e"} // 🔴 red if outside, 🟢 green if inside
            fillOpacity={0.15}
          />
          <Marker position={[location.lat, location.lng]} icon={patientIcon}>
            <Popup>
              <strong>{locationName}</strong>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* ✅ Display current location text below map */}
      <div style={{ marginTop: "10px", color: "#cbd5e1", fontSize: "1.1rem" }}>
        🧭{" "}
        {language === "hi"
          ? `वर्तमान स्थान: ${locationName}`
          : language === "mr"
          ? `सध्याचे स्थान: ${locationName}`
          : `Current Location: ${locationName}`}{" "}
        ({isOutOfZone ? "🚨 Outside Safe Zone" : "✅ Within Safe Zone"})
      </div>
    </section>
  );
}
