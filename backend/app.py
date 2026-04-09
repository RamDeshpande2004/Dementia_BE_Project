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
import requests  

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
MODEL_PATH = os.path.join(ROOT_DIR, "model", "isoforest_model.pkl")
SCALER_PATH = os.path.join(ROOT_DIR, "model", "isoforest_scaler.pkl")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

try:
    iso_model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print(f"✅ Model and scaler loaded")
except Exception as e:
    print("❌ Model loading error:", e)
    iso_model, scaler = None, None

def get_thingspeak_data():
    try:
        url = "https://api.thingspeak.com/channels/3245854/feeds.json?api_key=S5ETY5FU945AUI4S&results=1"

        response = requests.get(url)
        data = response.json()

        if "feeds" not in data or len(data["feeds"]) == 0:
            print("⚠️ No data received from ThingSpeak")
            return None

        feed = data["feeds"][0]

        if not all([feed.get("field1"), feed.get("field2"), feed.get("field3"), feed.get("field4")]):
            print("⚠️ Incomplete sensor data received")
            print("Raw feed:", feed)
            return None

        sensor_data = {
            "temperature": float(feed["field3"]),
            "humidity": float(feed["field4"]),
            "noise_level": float(feed["field2"]),
            "light_intensity": float(feed["field1"])
        }

        print("\n✅ Sensor Data Received Successfully:")
        print(f"🌡️ Temperature: {sensor_data['temperature']} °C")
        print(f"💧 Humidity: {sensor_data['humidity']} %")
        print(f"🔊 Noise Level: {sensor_data['noise_level']}")
        print(f"💡 Light Intensity: {sensor_data['light_intensity']}")
        print("--------------------------------------------------")

        return sensor_data

    except Exception as e:
        print("❌ ThingSpeak fetch error:", e)
        return None

def recalculate_thresholds(patient_id):
    try:
        data = list(reaction_history.find({"patient_id": patient_id}))
        if not data or len(data) < 6:
            return None

        df = pd.DataFrame(data)
        features = [
            "temperature", "humidity",
            "noise_level", "light_intensity"
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

@app.route("/")
def home():
    return jsonify({
        "message": "🌿 Dementia Safety Backend Running ✅",
        "routes": [
            "/predict/<id>", "/feedback/<id>",
            "/recalculate_thresholds/<id>", "/tts/<lang>", "/api/status",
        ]
    })

@app.route("/predict/<patient_id>", methods=["GET"])
def predict_status(patient_id):
    try:
        data = get_thingspeak_data()

        if not data:
            print("⚠️ No valid data to predict")            
            return jsonify({"error": "Failed to fetch ThingSpeak data"}), 500

        if iso_model is None or scaler is None:
            return jsonify({"error": "Model not loaded"}), 500

        features = ["temperature", "humidity", "noise_level", "light_intensity"]

        clean_data = {k: float(data.get(k, 0)) for k in features}
        df = pd.DataFrame([clean_data]).fillna(0)

        X_scaled = scaler.transform(df)
        prediction = iso_model.predict(X_scaled)
        label = "Anomaly" if prediction[0] == -1 else "Normal"
        print("\n🧠 Prediction Result:")
        print(f"➡️ Status: {label}")
        print(f"📊 Input Data: {clean_data}")
        print("=====================================")
        thresholds_doc = patient_thresholds.find_one({"patient_id": patient_id}) or {}
        thresholds = thresholds_doc.get("thresholds", {
            "temperature": 35,
            "humidity": 60,
            "noise_level": 2.0,  
            "light_intensity": 200,
        })

        alerts = []
        if clean_data["temperature"] > thresholds["temperature"]:
            alerts.append("🌡️ Temperature high — check ventilation.")
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
        return jsonify({"error": str(e)}), 500

@app.route("/recalculate_thresholds/<patient_id>", methods=["GET"])
def manual_recalculate(patient_id):
    new_t = recalculate_thresholds(patient_id)
    return jsonify({
        "message": "✅ Thresholds updated" if new_t else "ℹ️ Not enough feedback yet",
        "thresholds": new_t
    })

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
        return jsonify({"error": str(e)}), 500

@app.route("/api/status")
def system_status():
    return jsonify({
        "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "backend_status": "Online ✅",
    })

@atexit.register
def close_mongo_connection():
    try:
        if db and hasattr(db, "client"):
            db.client.close()
    except:
        pass

if __name__ == "__main__":
    print("🚀 Backend running on http://0.0.0.0:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)