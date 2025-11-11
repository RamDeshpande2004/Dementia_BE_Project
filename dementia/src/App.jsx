import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import {
  fetchSimulation,
  fetchPrediction,
  sendFeedbackAPI,
  recalcThresholds,
  fetchTTS,
} from "./services/api";

import L from "leaflet";
import Header from "./components/Header";
import PatientSummary from "./components/PatientSummary";
import SensorCards from "./components/SensorCards";
import Notifications from "./components/Notifications";
import { TEXTS, ALERT_TEXTS } from "./constants/texts";
import {
  SAFE_CENTER,
  SAFE_RADIUS_M,
  LOCATION_COORDS,
} from "./constants/mapConstants";
import { withinSafeZone, selectPrimaryAlertKey } from "./utils/helpers";

import LocationMap from "./components/LocationMap";

const BACKEND_URL = "http://127.0.0.1:5000";

const patientIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [35, 35],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

export default function App() {
  const [language, setLanguage] = useState("mr"); // default to Marathi since you switched
  const T = TEXTS[language];

  const [data, setData] = useState(null);
  const [status, setStatus] = useState("Normal");
  const [alerts, setAlerts] = useState([]);
  const [location, setLocation] = useState(SAFE_CENTER);
  const [locationName, setLocationName] = useState("Home - Kothrud");
  const [isOutOfZone, setIsOutOfZone] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [speakingMsg, setSpeakingMsg] = useState("");
  const [toast, setToast] = useState(null);

  const lastAlertRef = useRef("");
  const lastStatusRef = useRef("");
  const lastLocNameRef = useRef("");
  const audioRef = useRef(null);

  // TTS using backend with safe English fallback and no overlaps
  const speak = async (text) => {
    if (!text) return;
    try {
      // Stop any previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
      setSpeakingMsg(text);

      const langCode = { en: "en", hi: "hi", mr: "mr" }[language] || "en";
      let res = await fetch(`${BACKEND_URL}/tts/${langCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      // fallback to English once if language not supported
      if (!res.ok && langCode !== "en") {
        res = await fetch(`${BACKEND_URL}/tts/en`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      }

      if (!res.ok) throw new Error("TTS request failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => {
        setSpeakingMsg("");
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
    } catch (err) {
      console.error("TTS error:", err);
      setSpeakingMsg("");
    }
  };

  // 🧠 Poll simulation + prediction every 8s — fully synced with UI + TTS
  const poll = async () => {
    try {
      const sData = await fetchSimulation();
      const patientId = sData.patient_id || "sunita_joshi";
      const pred = await fetchPrediction(patientId, sData);

      // ✅ Update environment + prediction data
      setData(sData);

      // ✅ Ensure UI updates properly
      const newStatus = pred.predicted_status || "Normal";
      if (newStatus !== status) {
        setStatus(newStatus);
      }

      // ✅ Location tracking
      const locName = sData.location || sData.location_name || "Home - Kothrud";
      if (locName !== lastLocNameRef.current) {
        lastLocNameRef.current = locName;
        setLocationName(locName);
        const coords = LOCATION_COORDS[locName] || SAFE_CENTER;
        setLocation(coords);
        setIsOutOfZone(!withinSafeZone(coords.lat, coords.lng));
      }

      // ✅ Alert messages
      const key = selectPrimaryAlertKey(sData, pred.thresholds_used);
      const msg = ALERT_TEXTS[language][key];

      if (msg && msg.trim() !== "" && msg !== lastAlertRef.current) {
        lastAlertRef.current = msg;
        setAlerts((a) => [
          { id: Date.now(), time: new Date().toLocaleTimeString(), msg },
          ...a.slice(0, 10),
        ]);
        speak(msg); // Queue safe
      }

      // ✅ Speak environment status when it flips
      if (newStatus !== lastStatusRef.current) {
        lastStatusRef.current = newStatus;
        const phrases = {
          Normal: {
            en: "All conditions normal. Environment is safe.",
            hi: "सभी स्थितियाँ सामान्य हैं। वातावरण सुरक्षित है।",
            mr: "सर्व काही सामान्य आहे. वातावरण सुरक्षित आहे.",
          },
          Anomaly: {
            en: "Warning! Environment unsafe. Please check the patient.",
            hi: "चेतावनी! वातावरण असुरक्षित है, कृपया रोगी की जाँच करें।",
            mr: "इशारा! वातावरण असुरक्षित आहे, कृपया रुग्णाची काळजी घ्या.",
          },
        };
        speak(phrases[newStatus][language]);
      }
    } catch (err) {
      console.error("poll error:", err);
    }
  };

  useEffect(() => {
    poll();
    const i = setInterval(poll, 8000);
    return () => clearInterval(i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Feedback -> DB, recalc each 10
  async function sendFeedback(reacted) {
    try {
      setToast({ type: "info", text: T.saving });
      const payload = { reacted, ...(data || {}) };
      const patientId = data?.patient_id || "sunita_joshi";
      const res = await fetch(`${BACKEND_URL}/feedback/${patientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("feedback failed");
      setFeedbackCount((f) => f + 1);
      setToast({ type: "ok", text: T.saved });
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      console.error("Feedback error:", e);
      setToast({ type: "err", text: "Feedback failed" });
      setTimeout(() => setToast(null), 3000);
    }
  }

  useEffect(() => {
    if (feedbackCount > 0 && feedbackCount % 10 === 0) autoRecalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedbackCount]);

  async function autoRecalculate() {
    try {
      const patientId = data?.patient_id || "sunita_joshi";
      const res = await fetch(
        `${BACKEND_URL}/recalculate_thresholds/${patientId}`
      );
      await res.json();
      speak(T.thresholdsUpdated);
    } catch (err) {
      console.error("Recalc error:", err);
    }
  }

  // Comfort index
  const comfort = useMemo(() => {
    if (!data) return 100;
    let score = 100;
    score -= data.temperature > 35 ? 15 : 0;
    score -= data.co2 > 1000 ? 20 : 0;
    score -= data.air_quality_index > 200 ? 15 : 0;
    return Math.max(0, Math.min(100, score));
  }, [data]);

  const comfortColor =
    comfort > 75 ? "#22c55e" : comfort > 50 ? "#eab308" : "#ef4444";

  const LBL = T.labels;

  return (
    <div className="dashboard">
      <Header T={T} language={language} setLanguage={setLanguage} />

      <PatientSummary
        T={T}
        data={data}
        comfort={comfort}
        comfortColor={comfortColor}
        locationName={locationName}
        isOutOfZone={isOutOfZone}
      />

      <section
        className={`status ${status === "Anomaly" ? "critical" : "normal"}`}
      >
        {status === "Anomaly" ? T.unsafe : T.safe}
      </section>

      <SensorCards data={data} LBL={LBL} />

      {/* 🗺️ Dynamic Location Map Section */}
      <section className="panel map-panel">
        <h3>{T.map}</h3>
        <div className="map-wrapper">
          <LocationMap
            location={location}
            locationName={locationName}
            isOutOfZone={isOutOfZone}
          />
        </div>
      </section>

      <section className="panel threshold-container">
        <h3>{T.feedback}</h3>
        <div className="feedback-buttons">
          <button className="feedback-yes" onClick={() => sendFeedback(true)}>
            {T.reacted}
          </button>
          <button className="feedback-no" onClick={() => sendFeedback(false)}>
            {T.notReacted}
          </button>
        </div>
        <p className="auto-note">
          {T.feedbackNote} ({feedbackCount % 10}/10)
        </p>
      </section>

      <Notifications alerts={alerts} T={T} />

      {speakingMsg && <div className="voice-bubble">🔊 {speakingMsg}</div>}
      {toast && (
        <div
          className={`feedback-toast ${
            toast.type === "ok" ? "ok" : toast.type === "err" ? "err" : "info"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
