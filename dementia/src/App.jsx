import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { fetchSimulation, fetchPrediction } from "./services/api";

import Header from "./components/Header";
import PatientSummary from "./components/PatientSummary";
import SensorCards from "./components/SensorCards";
import Notifications from "./components/Notifications";
import LocationMap from "./components/LocationMap";

import { TEXTS, ALERT_TEXTS } from "./constants/texts";
import { SAFE_CENTER, LOCATION_COORDS } from "./constants/mapConstants";
import { withinSafeZone, selectPrimaryAlertKey } from "./utils/helpers";

export default function App() {
  const [language, setLanguage] = useState("mr");
  const [themeMode, setThemeMode] = useState("dark");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("Normal");
  const [alerts, setAlerts] = useState([]);
  const [location, setLocation] = useState(SAFE_CENTER);
  const [locationName, setLocationName] = useState("Home - Kothrud");
  const [isOutOfZone, setIsOutOfZone] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [speakingMsg, setSpeakingMsg] = useState("");

  const lastAlertRef = useRef("");
  const lastStatusRef = useRef("");
  const lastLocNameRef = useRef("");
  const audioRef = useRef(null);

  const T = TEXTS[language];

  // Theme setup
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

  // TTS function
 const speak = async (text) => {
  if (!text) return;

  try {
    // Stop any currently playing audio immediately
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    setSpeakingMsg(text);

    const langCode = { en: "en", hi: "hi", mr: "mr" }[language] || "en";

    const res = await fetch(`http://127.0.0.1:5000/tts/${langCode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok && langCode !== "en") {
      // fallback to English
      const fallback = await fetch(`http://127.0.0.1:5000/tts/en`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!fallback.ok) throw new Error("TTS failed");
      const blobFallback = await fallback.blob();
      const urlFallback = URL.createObjectURL(blobFallback);

      // Stop any new audio again before playing fallback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }

      const audioFallback = new Audio(urlFallback);
      audioRef.current = audioFallback;
      audioFallback.play();
      audioFallback.onended = () => {
        setSpeakingMsg("");
        URL.revokeObjectURL(urlFallback);
        audioRef.current = null;
      };
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    // Stop previous audio one last time before playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

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
  // Polling function
  const poll = async () => {
    try {
      const sData = await fetchSimulation();
      const patientId = sData.patient_id || "sunita_joshi";
      const pred = await fetchPrediction(patientId, sData);
      setData(sData);

      const newStatus = pred.predicted_status || "Normal";
      setStatus(newStatus);

      // Location handling
      const locName = sData.location || sData.location_name || "Home - Kothrud";
      if (locName !== lastLocNameRef.current) {
        lastLocNameRef.current = locName;
        setLocationName(locName);
        const coords = LOCATION_COORDS[locName] || SAFE_CENTER;
        setLocation(coords);
        setIsOutOfZone(!withinSafeZone(coords.lat, coords.lng));
      }

      // Alerts
      const key = selectPrimaryAlertKey(sData, pred.thresholds_used);
      const msg = ALERT_TEXTS[language][key];
      if (msg && msg !== lastAlertRef.current) {
        lastAlertRef.current = msg;
        setAlerts((prev) => [
          { id: Date.now(), time: new Date().toLocaleTimeString(), msg },
          ...prev.slice(0, 10),
        ]);
        speak(msg); // speak alert
      }

      // Status change announcement
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
    const interval = setInterval(poll, 8000);
    return () => clearInterval(interval);
  }, [language]);

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        className="dashboard"
        style={{
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          minHeight: "100vh",
          transition: "background-color 0.5s ease, color 0.5s ease",
        }}
      >
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
          locationName={locationName}
          isOutOfZone={isOutOfZone}
          themeMode={themeMode}
        />

        <section
          className="status"
          style={{
            backgroundColor:
              status === "Anomaly"
                ? themeMode === "light"
                  ? "#fee2e2"
                  : "#7f1d1d"
                : themeMode === "light"
                ? "#dcfce7"
                : "#064e3b",
            color:
              status === "Anomaly"
                ? themeMode === "light"
                  ? "#991b1b"
                  : "#fecaca"
                : themeMode === "light"
                ? "#166534"
                : "#bbf7d0",
            borderRadius: "12px",
            margin: "1rem auto",
            width: "90%",
            padding: "0.8rem",
            textAlign: "center",
            fontWeight: 600,
            transition: "all 0.4s ease",
          }}
        >
          {status === "Anomaly" ? T.unsafe : T.safe}
        </section>

        <SensorCards data={data} LBL={T.labels} themeMode={themeMode} />

     {/* Map Panel */} <section className="panel map-panel" style={{ backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, margin: "1.5rem auto", width: "90%", maxWidth: "1200px", borderRadius: "14px", padding: "1rem", boxShadow: themeMode === "dark" ? "0 4px 15px rgba(0,0,0,0.5)" : "0 4px 15px rgba(0,0,0,0.1)", transition: "all 0.4s ease", display: "flex", flexDirection: "column", alignItems: "center", }} > <h3 style={{ marginBottom: "0.8rem", textAlign: "center" }}>{T.map}</h3> <div className="map-wrapper" style={{ width: "100%", height: "450px", borderRadius: "12px", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", }} > <LocationMap location={location} locationName={locationName} isOutOfZone={isOutOfZone} themeMode={themeMode} language={language} /> </div> </section>

        {/* Feedback Section */}
        <section
          className="panel feedback-section"
          style={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            margin: "1.5rem auto",
            width: "90%",
            maxWidth: "1200px",
            borderRadius: "14px",
            padding: "1.5rem 2rem",
            transition: "all 0.4s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h3 style={{ marginBottom: "1rem", textAlign: "center" }}>{T.feedback}</h3>

          <div
            className="feedback-buttons"
            style={{
              display: "flex",
              gap: "1.5rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              className="feedback-yes"
              style={{
                padding: "0.8rem 2rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "1rem",
                backgroundColor: "#22c55e",
                color: "#fff",
                transition: "all 0.3s ease",
              }}
              onClick={() => setFeedbackCount((prev) => prev + 1)}
            >
              ✅ {T.reacted}
            </button>

            <button
              className="feedback-no"
              style={{
                padding: "0.8rem 2rem",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "1rem",
                backgroundColor: "#ef4444",
                color: "#fff",
                transition: "all 0.3s ease",
              }}
              onClick={() => setFeedbackCount((prev) => prev - 1)}
            >
              ❌ {T.notReacted}
            </button>
          </div>

          <p
            className="feedback-counter"
            style={{
              marginTop: "1rem",
              color: theme.palette.text.secondary,
              fontSize: "1rem",
              transition: "color 0.3s ease",
            }}
          >
            {T.feedbackNote} ({feedbackCount % 10}/10)
          </p>
        </section>

        <Notifications alerts={alerts} T={T} themeMode={themeMode} />

        {/* Voice bubble */}
        {speakingMsg && (
          <div
            className="voice-bubble"
            style={{
              position: "fixed",
              bottom: "2rem",
              right: "2rem",
              background: "#2563eb",
              color: "#fff",
              padding: "0.8rem 1rem",
              borderRadius: "10px",
              fontWeight: 500,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
            }}
          >
            🔊 {speakingMsg}
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
