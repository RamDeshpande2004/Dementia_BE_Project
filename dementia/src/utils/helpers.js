// src/utils/helpers.js

// import { SAFE_CENTER, SAFE_RADIUS_M } from "../constants/mapConstants";

// ✅ Check if patient is within safe zone
// export const withinSafeZone = (lat, lng) => {
//   const dLat = ((lat - SAFE_CENTER.lat) * Math.PI) / 180;
//   const dLng = ((lng - SAFE_CENTER.lng) * Math.PI) / 180;
//   const R = 6371000; // Earth radius in meters
//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos((SAFE_CENTER.lat * Math.PI) / 180) *
//       Math.cos((lat * Math.PI) / 180) *
//       Math.sin(dLng / 2) ** 2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c <= SAFE_RADIUS_M;
// };

// ✅ Select exactly ONE alert message by priority
export const selectPrimaryAlertKey = (data, thresholds) => {
  const t = thresholds || {
    temperature: 35,
    humidity: 60,
    noise_level: 2.0,        // ✅ FIXED (voltage-based)
    light_intensity: 200,
  };

  const d = data || {};

  const checks = [
    { cond: d.noise_level > t.noise_level * 1.25, key: "noise_danger" },
    { cond: d.light_intensity < Math.max(50, t.light_intensity * 0.6), key: "light_low" },
    { cond: d.temperature > t.temperature + 3, key: "temp_very_high" },
    { cond: d.temperature > t.temperature, key: "temp_high" },
    { cond: d.noise_level > t.noise_level, key: "noise_high" },
    { cond: d.humidity > t.humidity, key: "humidity_high" },
  ];

  const hit = checks.find((c) => c.cond);
  return hit ? hit.key : "stable";
};
