import React from "react";
import {
  WbSunny as LightIcon,
  WaterDrop as HumidityIcon,
  Thermostat as TempIcon,
  VolumeUp as NoiseIcon,
  Co2 as Co2Icon,
  Air as AQIIcon,
} from "@mui/icons-material";

export default function SensorCards({ data, LBL, themeMode = "dark" }) {
  const isDark = themeMode === "dark";

  const getCardStyle = (condition) => ({
    backgroundColor: condition
      ? isDark
        ? "rgba(239,68,68,0.15)" // red tint for danger (dark mode)
        : "rgba(239,68,68,0.1)" // red tint (light mode)
      : isDark
      ? "rgba(30,41,59,0.9)" // dark background
      : "rgba(255,255,255,0.9)", // light background
    border: condition
      ? "2px solid #ef4444"
      : isDark
      ? "1px solid rgba(255,255,255,0.1)"
      : "1px solid rgba(0,0,0,0.1)",
    color: isDark ? "#E2E8F0" : "#1E293B",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: isDark
      ? "0 4px 12px rgba(0,0,0,0.4)"
      : "0 4px 12px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    transform: condition ? "scale(1.05)" : "scale(1)",
  });

  const getIconStyle = (condition) => ({
    fontSize: 40,
    color: condition ? "#ef4444" : isDark ? "#60A5FA" : "#2563EB",
  });

  return (
    <div
      className="cards"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: "20px",
        padding: "20px",
      }}
    >
      {/* 🌡 Temperature */}
      <div style={getCardStyle(data?.temperature > 35)}>
        <TempIcon style={getIconStyle(data?.temperature > 35)} />
        <div style={{ fontSize: "1rem", fontWeight: 600 }}>{LBL.temperature}</div>
        <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>
          {data?.temperature != null
            ? `${data.temperature.toFixed(1)} ${LBL.units.celsius}`
            : "–"}
        </div>
      </div>

      {/* 🧪 CO₂ */}
      <div style={getCardStyle(data?.co2 > 1000)}>
        <Co2Icon style={getIconStyle(data?.co2 > 1000)} />
        <div style={{ fontSize: "1rem", fontWeight: 600 }}>{LBL.co2}</div>
        <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>
          {data?.co2 != null ? `${data.co2.toFixed(0)} ${LBL.units.ppm}` : "–"}
        </div>
      </div>

      {/* 🌬 Air Quality */}
      <div style={getCardStyle(data?.air_quality_index > 200)}>
        <AQIIcon style={getIconStyle(data?.air_quality_index > 200)} />
        <div style={{ fontSize: "1rem", fontWeight: 600 }}>{LBL.aqi}</div>
        <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>
          {data?.air_quality_index != null
            ? `${data.air_quality_index.toFixed(0)}`
            : "–"}
        </div>
      </div>

      {/* 🔊 Noise */}
      <div style={getCardStyle(data?.noise_level > 85)}>
        <NoiseIcon style={getIconStyle(data?.noise_level > 85)} />
        <div style={{ fontSize: "1rem", fontWeight: 600 }}>{LBL.noise}</div>
        <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>
          {data?.noise_level != null
            ? `${data.noise_level.toFixed(0)} ${LBL.units.db}`
            : "–"}
        </div>
      </div>

      {/* 💡 Light */}
      <div style={getCardStyle(data?.light_intensity < 200)}>
        <LightIcon style={getIconStyle(data?.light_intensity < 200)} />
        <div style={{ fontSize: "1rem", fontWeight: 600 }}>{LBL.light}</div>
        <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>
          {data?.light_intensity != null
            ? `${data.light_intensity.toFixed(0)} ${LBL.units.lux}`
            : "–"}
        </div>
      </div>

      {/* 💧 Humidity */}
      <div style={getCardStyle(data?.humidity > 60)}>
        <HumidityIcon style={getIconStyle(data?.humidity > 60)} />
        <div style={{ fontSize: "1rem", fontWeight: 600 }}>{LBL.humidity}</div>
        <div style={{ fontSize: "1.3rem", fontWeight: 700 }}>
          {data?.humidity != null
            ? `${data.humidity.toFixed(0)} ${LBL.units.percent}`
            : "–"}
        </div>
      </div>
    </div>
  );
}
