// // src/components/LocationMap.jsx
// import React, { useEffect, useRef } from "react";
// import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from "react-leaflet";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// const SAFE_CENTER = { lat: 18.5204, lng: 73.8567 };
// const SAFE_RADIUS_M = 300;

// const patientIcon = new L.Icon({
//   iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
//   iconSize: [35, 35],
//   iconAnchor: [17, 34],
//   popupAnchor: [0, -30],
// });

// function ChangeView({ center }) {
//   const map = useMap();
//   useEffect(() => {
//     if (center) map.flyTo(center, 15, { duration: 1.0 });
//   }, [JSON.stringify(center), map]);
//   return null;
// }

// function LocationMap({ location, locationName, language = "en", isOutOfZone, themeMode = "dark" }) {
//   const mapRef = useRef();
//   const safeColor = themeMode === "light" ? "#16a34a" : "#22c55e";
//   const alertColor = themeMode === "light" ? "#dc2626" : "#ef4444";

//   return (
//     <div style={{ width: "100%", textAlign: "center" }}>
//       {/* Map */}
//       <div style={{ height: "400px", borderRadius: "12px", overflow: "hidden", width: "100%" }}>
//         <MapContainer
//           center={[location.lat, location.lng]}
//           zoom={15}
//           style={{ height: "100%", width: "100%" }}
//           ref={mapRef}
//         >
//           <ChangeView center={location} />
//           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//           <Circle
//             center={[SAFE_CENTER.lat, SAFE_CENTER.lng]}
//             radius={SAFE_RADIUS_M}
//             color={isOutOfZone ? alertColor : safeColor}
//             fillOpacity={0.15}
//           />
//           <Marker position={[location.lat, location.lng]} icon={patientIcon}>
//             <Popup>
//               <div style={{ fontWeight: 600, color: "#2563eb" }}>{locationName}</div>
//               <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
//                 {isOutOfZone ? "Outside Safe Zone 🚨" : "Within Safe Zone ✅"}
//               </div>
//             </Popup>
//           </Marker>
//         </MapContainer>
//       </div>

//       {/* Legend */}
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           gap: "2rem",
//           marginTop: "12px",
//           flexWrap: "wrap",
//           width: "100%",
//         }}
//       >
//         <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: "140px" }}>
//           <div style={{ width: "15px", height: "15px", backgroundColor: safeColor, borderRadius: "50%" }} />
//           <span style={{ whiteSpace: "nowrap", overflow: "visible" }}>Within Safe Zone</span>
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: "140px" }}>
//           <div style={{ width: "15px", height: "15px", backgroundColor: alertColor, borderRadius: "50%" }} />
//           <span style={{ whiteSpace: "nowrap", overflow: "visible" }}>Outside Safe Zone</span>
//         </div>
//       </div>

//       {/* Current Location */}
//       <div style={{ marginTop: "10px", color: "#cbd5e1", fontSize: "1.1rem" }}>
//         🧭{" "}
//         {language === "hi"
//           ? `वर्तमान स्थान: ${locationName}`
//           : language === "mr"
//           ? `सध्याचे स्थान: ${locationName}`
//           : `Current Location: ${locationName}`}{" "}
//         ({isOutOfZone ? "🚨 Outside Safe Zone" : "✅ Within Safe Zone"})
//       </div>
//     </div>
//   );
// }

// export default React.memo(LocationMap);
