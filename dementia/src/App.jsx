import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { fetchPrediction } from "./services/api";

import Header from "./components/Header";
import PatientSummary from "./components/PatientSummary";
import SensorCards from "./components/SensorCards";
import Notifications from "./components/Notifications";
import StatusAndFeedback from "./components/StatusAndFeedback";
import { sendFeedbackAPI } from "./services/api";
import { TEXTS, ALERT_TEXTS } from "./constants/texts";
import { selectPrimaryAlertKey } from "./utils/helpers";

export default function App() {
  const [language, setLanguage] = useState("mr");
  const [themeMode, setThemeMode] = useState("dark");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("Normal");
  const [alerts, setAlerts] = useState([]);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [speakingMsg, setSpeakingMsg] = useState("");

  const lastAlertRef = useRef("");
  const lastStatusRef = useRef("");
  const audioRef = useRef(null);

  const T = TEXTS[language];
  const sendFeedback = async (payload) => {
  try {
    await sendFeedbackAPI("neha_kanaki", payload);

    setFeedbackCount((prev) =>
      payload.reacted ? prev + 1 : prev - 1
    );

  } catch (err) {
    console.error(err);
  }
};
  // ================= THEME =================
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          ...(themeMode === "light"
            ? {
                background: { default: "#F9FAFB", paper: "#FFFFFF" },
                text: { primary: "#1E293B" },
                primary: { main: "#2563EB" },
              }
            : {
                background: { default: "#0F172A", paper: "#1E293B" },
                text: { primary: "#E2E8F0" },
                primary: { main: "#38BDF8" },
              }),
        },
        typography: { fontFamily: "'Poppins', sans-serif" },
      }),
    [themeMode]
  );

  // ================= TTS =================
  const speak = async (text) => {
    if (!text) return;

    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setSpeakingMsg(text);

      const langCode = { en: "en", hi: "hi", mr: "mr" }[language] || "en";

      const res = await fetch(`http://127.0.0.1:5000/tts/${langCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

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

  // ================= ALERT TYPE =================
  const getAlertType = (key, status) => {
    if (status === "Anomaly") return "error";
    if (key.includes("danger") || key.includes("very")) return "error";
    if (key.includes("high") || key.includes("low")) return "warning";
    if (key === "stable") return "success";
    return "info";
  };

  // ================= POLLING =================
  const poll = async () => {
    try {
      const patientId = "neha_kanaki";

      const res = await fetchPrediction(patientId);

      const sensorData = res.received_data;
      setData(sensorData);

      const newStatus = res.predicted_status || "Normal";
      setStatus(newStatus);

      // ================= ALERTS =================
      const key = selectPrimaryAlertKey(sensorData, res.thresholds_used);
      const msg = ALERT_TEXTS[language][key];
      const alertType = getAlertType(key, newStatus);

      if (msg && msg !== lastAlertRef.current) {
        lastAlertRef.current = msg;

        setAlerts((prev) => [
          {
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            msg,
            type: alertType,
          },
          ...prev.slice(0, 10),
        ]);

        speak(msg);
      }

      // ================= STATUS VOICE =================
      if (newStatus !== lastStatusRef.current) {
        lastStatusRef.current = newStatus;

        const phrases = {
          Normal: {
            en: "All conditions normal. Environment is safe.",
            hi: "सभी स्थितियाँ सामान्य हैं। वातावरण सुरक्षित है।",
            mr: "सर्व काही सामान्य आहे. वातावरण सुरक्षित आहे.",
          },
          Anomaly: {
            en: "Warning! Environment unsafe.",
            hi: "चेतावनी! वातावरण असुरक्षित है।",
            mr: "इशारा! वातावरण असुरक्षित आहे.",
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
    const interval = setInterval(poll, 8000);
    return () => clearInterval(interval);
  }, [language]);

  // ================= COMFORT =================
  const comfort = useMemo(() => {
    if (!data) return 100;
    let score = 100;
    score -= data.temperature > 35 ? 15 : 0;
    score -= data.noise_level > 2.0 ? 15 : 0;
    score -= data.light_intensity < 200 ? 10 : 0;
    return Math.max(0, Math.min(100, score));
  }, [data]);

  const comfortColor =
    comfort > 75 ? "#22c55e" : comfort > 50 ? "#eab308" : "#ef4444";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <div className="dashboard">
        <Header
          T={T}
          language={language}
          setLanguage={setLanguage}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
        />

        <PatientSummary
          T={T}
          data={data}
          comfort={comfort}
          comfortColor={comfortColor}
          themeMode={themeMode}
        />

        {/* STATUS */}
        <section className="status">
          {status === "Anomaly" ? T.unsafe : T.safe}
        </section>

        <SensorCards data={data} LBL={T.labels} themeMode={themeMode} />

        {/* FEEDBACK */}
        {/* <section className="panel feedback-section">
          <h3>{T.feedback}</h3>

          <div className="feedback-buttons">
            <button onClick={() => setFeedbackCount((p) => p + 1)}>
              ✅ {T.reacted}
            </button>

            <button onClick={() => setFeedbackCount((p) => p - 1)}>
              ❌ {T.notReacted}
            </button>
          </div>

          <p>
            {T.feedbackNote} ({feedbackCount % 10}/10)
          </p>
        </section> */}
          <StatusAndFeedback
            status={status}
            T={T}
            feedbackCount={feedbackCount}
            sendFeedback={sendFeedback}
          />
        <Notifications alerts={alerts} T={T} themeMode={themeMode} />

        {/* VOICE BUBBLE */}
        {speakingMsg && <div className="voice-bubble">🔊 {speakingMsg}</div>}
      </div>
    </ThemeProvider>
  );
}