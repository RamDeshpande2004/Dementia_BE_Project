export const selectPrimaryAlertKey = (data, thresholds) => {
  const t = thresholds || {
    temperature: 35,
    humidity: 60,
    noise_level: 2.0,       
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
