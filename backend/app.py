from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
from db_config import db, patient_thresholds, reaction_history
from gtts import gTTS
import tempfile
import atexit
import pymongo

# ======================================================
# PATH SETUP
# ======================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
MODEL_PATH = os.path.join(ROOT_DIR, "model", "isoforest_model.pkl")
SCALER_PATH = os.path.join(ROOT_DIR, "model", "isoforest_scaler.pkl")
DATA_PATH = os.path.join(ROOT_DIR, "data", "sunita_month_data.csv")

# ======================================================
# Flask setup
# ======================================================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# ======================================================
# Load model & scaler
# ======================================================
try:
    iso_model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print(f"✅ Isolation Forest model and scaler loaded from {MODEL_PATH}")
except Exception as e:
    print("❌ Model loading error:", e)
    iso_model, scaler = None, None

# ======================================================
# Load Sunita Joshi data
# ======================================================
try:
    df_sim = pd.read_csv(DATA_PATH)
    df_sim = df_sim[df_sim["patient_id"] == "sunita_joshi"]
    print(f"📊 Loaded {len(df_sim):,} records from {DATA_PATH} for Sunita Joshi.")
except Exception as e:
    print("⚠️ Data load error:", e)
    df_sim = pd.DataFrame()

# ======================================================
# Recalculate thresholds
# ======================================================
def recalculate_thresholds(patient_id):
    try:
        data = list(reaction_history.find({"patient_id": patient_id}))
        if not data or len(data) < 6:
            return None

        df = pd.DataFrame(data)
        features = [
            "temperature", "humidity", "air_quality_index",
            "co2", "noise_level", "light_intensity"
        ]
        new_thresholds = {}
        for f in features:
            reacted = df[df["reacted"] == True][f].dropna()
            calm = df[df["reacted"] == False][f].dropna()
            if len(reacted) >= 3 and len(calm) >= 3:
                new_thresholds[f] = round((reacted.mean() + calm.mean()) / 2, 2)

        if new_thresholds:
            patient_thresholds.update_one(
                {"patient_id": patient_id},
                {"$set": {"thresholds": new_thresholds, "last_updated": datetime.now()}},
                upsert=True,
            )
        return new_thresholds
    except Exception as e:
        print("⚠️ Threshold update error:", e)
        return None

# ======================================================
# Routes
# ======================================================
@app.route("/")
def home():
    return jsonify({
        "message": "🌿 Dementia Safety Backend (Sunita Joshi) Running ✅",
        "routes": [
            "/simulate", "/predict/<id>", "/feedback/<id>",
            "/recalculate_thresholds/<id>", "/tts/<lang>", "/api/status",
        ]
    })

@app.route("/simulate", methods=["GET"])
def simulate_data():
    try:
        if df_sim.empty:
            raise Exception("No dataset loaded.")
        sample = df_sim.sample(1).iloc[0].to_dict()
        response = {
            "temperature": float(sample["temperature"]),
            "humidity": float(sample["humidity"]),
            "air_quality_index": float(sample["air_quality_index"]),
            "co2": float(sample["co2"]),
            "noise_level": float(sample["noise_level"]),
            "light_intensity": float(sample["light_intensity"]),
            "location": sample["location_name"],
            "patient_id": "sunita_joshi",
            "patient_name": "Mrs. Sunita Joshi",
            "caregiver_name": "Arti Deshmukh",
            "condition": "Mild Dementia",
        }
        return jsonify(response), 200
    except Exception as e:
        print("❌ Simulate route error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/predict/<patient_id>", methods=["POST"])
def predict_status(patient_id):
    try:
        data = request.get_json(force=True)
        if iso_model is None or scaler is None:
            return jsonify({"error": "Model not loaded"}), 500

        features = ["temperature", "humidity", "air_quality_index", "co2", "noise_level", "light_intensity"]
        clean_data = {k: float(data.get(k, 0)) for k in features}
        df = pd.DataFrame([clean_data]).fillna(0)
        X_scaled = scaler.transform(df)
        prediction = iso_model.predict(X_scaled)
        label = "Anomaly" if prediction[0] == -1 else "Normal"

        thresholds_doc = patient_thresholds.find_one({"patient_id": patient_id}) or {}
        thresholds = thresholds_doc.get("thresholds", {
            "temperature": 35, "humidity": 60, "air_quality_index": 200,
            "co2": 1000, "noise_level": 85, "light_intensity": 200,
        })

        alerts = []
        if clean_data["temperature"] > thresholds["temperature"]:
            alerts.append("🌡️ Temperature high — check ventilation.")
        if clean_data["co2"] > thresholds["co2"]:
            alerts.append("🫁 CO₂ elevated — open windows.")
        if clean_data["air_quality_index"] > thresholds["air_quality_index"]:
            alerts.append("🌫️ Poor air quality — use purifier.")
        if clean_data["noise_level"] > thresholds["noise_level"]:
            alerts.append("🔊 Noise too high — quieter area advised.")
        if clean_data["light_intensity"] < thresholds["light_intensity"]:
            alerts.append("💡 Low light — improve illumination.")
        if not alerts:
            alerts.append("✅ Environment stable and safe.")

        return jsonify({
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "predicted_status": label,
            "received_data": clean_data,
            "alerts": alerts,
            "thresholds_used": thresholds,
        }), 200

    except Exception as e:
        print("❌ Predict route error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/feedback/<patient_id>", methods=["POST"])
def save_feedback(patient_id):
    try:
        data = request.get_json(force=True)
        data["patient_id"] = patient_id
        data["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        reaction_history.insert_one(data)
        return jsonify({"message": "✅ Feedback saved"}), 201
    except Exception as e:
        print("❌ Feedback route error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/recalculate_thresholds/<patient_id>", methods=["GET"])
def manual_recalculate(patient_id):
    new_t = recalculate_thresholds(patient_id)
    return jsonify({
        "message": "✅ Thresholds updated" if new_t else "ℹ️ Not enough feedback yet",
        "thresholds": new_t
    })

# ======================================================
# TTS (Hindi / Marathi / English)
# ======================================================
@app.route("/tts/<lang>", methods=["POST"])
def generate_tts(lang):
    try:
        req = request.get_json(force=True)
        text = req.get("text", "").strip()
        if not text:
            return jsonify({"error": "No text provided"}), 400

        lang_code = "en"
        if lang.lower().startswith("hi"):
            lang_code = "hi"
        elif lang.lower().startswith("mr"):
            lang_code = "mr"

        tts = gTTS(text=text, lang=lang_code)
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")
        tts.save(tmp.name)
        return send_file(tmp.name, mimetype="audio/mpeg")
    except Exception as e:
        print("❌ TTS route error:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/api/status")
def system_status():
    return jsonify({
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "backend_status": "Online ✅",
        "records_loaded": len(df_sim),
    })

# ======================================================
# Graceful MongoDB shutdown
# ======================================================
@atexit.register
def close_mongo_connection():
    try:
        if db and hasattr(db, "client"):
            db.client.close()
            print("🧹 MongoDB connection closed cleanly.")
        # explicitly stop PyMongo monitoring threads
        from pymongo import monitoring
        for listener in monitoring._listeners.get_listeners():
            try:
                listener.close()
            except Exception:
                pass
    except Exception as e:
        print("⚠️ MongoDB close error:", e)

# ======================================================
# Run server
# ======================================================
if __name__ == "__main__":
    print("🚀 Flask backend running on 0.0.0.0:5000 for Sunita Joshi data")
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
