import React from "react";

export default function SensorCards({ data, LBL }) {
  return (
    <div className="cards">
      <div className={`card ${data?.temperature > 35 ? "danger" : ""}`}>
        <div className="label">{LBL.temperature}</div>
        <div className="value">
          {data?.temperature != null
            ? `${data.temperature.toFixed(1)} ${LBL.units.celsius}`
            : "–"}
        </div>
      </div>

      <div className={`card ${data?.co2 > 1000 ? "danger" : ""}`}>
        <div className="label">{LBL.co2}</div>
        <div className="value">
          {data?.co2 != null ? `${data.co2.toFixed(0)} ${LBL.units.ppm}` : "–"}
        </div>
      </div>

      <div className={`card ${data?.air_quality_index > 200 ? "danger" : ""}`}>
        <div className="label">{LBL.aqi}</div>
        <div className="value">
          {data?.air_quality_index != null
            ? `${data.air_quality_index.toFixed(0)}`
            : "–"}
        </div>
      </div>

      <div className={`card ${data?.noise_level > 85 ? "danger" : ""}`}>
        <div className="label">{LBL.noise}</div>
        <div className="value">
          {data?.noise_level != null
            ? `${data.noise_level.toFixed(0)} ${LBL.units.db}`
            : "–"}
        </div>
      </div>

      <div className={`card ${data?.light_intensity < 200 ? "danger" : ""}`}>
        <div className="label">{LBL.light}</div>
        <div className="value">
          {data?.light_intensity != null
            ? `${data.light_intensity.toFixed(0)} ${LBL.units.lux}`
            : "–"}
        </div>
      </div>

      <div className={`card ${data?.humidity > 60 ? "danger" : ""}`}>
        <div className="label">{LBL.humidity}</div>
        <div className="value">
          {data?.humidity != null
            ? `${data.humidity.toFixed(0)} ${LBL.units.percent}`
            : "–"}
        </div>
      </div>
    </div>
  );
}
