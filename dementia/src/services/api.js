// src/services/api.js
const BACKEND_URL = "http://127.0.0.1:5000";

// 🌡️ Fetch simulated sensor data
export async function fetchSimulation() {
  const res = await fetch(`${BACKEND_URL}/simulate`);
  if (!res.ok) throw new Error("Simulation request failed");
  return res.json();
}

// 🤖 Send sensor data for prediction
export async function fetchPrediction(patientId, data) {
  const res = await fetch(`${BACKEND_URL}/predict/${patientId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Prediction request failed");
  return res.json();
}

// 🧭 Send feedback (caregiver reaction)
export async function sendFeedbackAPI(patientId, payload) {
  const res = await fetch(`${BACKEND_URL}/feedback/${patientId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Feedback request failed");
  return res.json();
}

// 🔄 Recalculate adaptive thresholds
export async function recalcThresholds(patientId) {
  const res = await fetch(`${BACKEND_URL}/recalculate_thresholds/${patientId}`);
  if (!res.ok) throw new Error("Recalculation request failed");
  return res.json();
}

// 🔊 Generate Text-to-Speech
export async function fetchTTS(lang, text) {
  const res = await fetch(`${BACKEND_URL}/tts/${lang}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error("TTS request failed");
  return res.blob();
}
