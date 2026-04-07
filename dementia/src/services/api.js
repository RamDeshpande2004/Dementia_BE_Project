// src/services/api.js

const BACKEND_URL = "http://127.0.0.1:5000";

// 🤖 Fetch real-time prediction (ThingSpeak → Backend → Model)
export async function fetchPrediction(patientId) {
  try {
    const res = await fetch(`${BACKEND_URL}/predict/${patientId}`);

    if (!res.ok) throw new Error("Prediction request failed");

    const json = await res.json();

    console.log("✅ Prediction API:", json);

    return json;

  } catch (err) {
    console.error("❌ Prediction error:", err);
    throw err;
  }
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