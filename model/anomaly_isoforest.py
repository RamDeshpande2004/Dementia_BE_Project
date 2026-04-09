import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib, os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))

DATA_PATH = os.path.join(ROOT_DIR, "data", "sunita_month_data.csv")
MODEL_DIR = os.path.join(ROOT_DIR, "model")
OUTPUT_PATH = os.path.join(ROOT_DIR, "data", "sunita_processed.csv")

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"❌ Dataset not found at {DATA_PATH}")

df = pd.read_csv(DATA_PATH)
print(f"📂 Loaded dataset with {len(df):,} records")

features = [
    "temperature",
    "humidity",
    "noise_level",
    "light_intensity",
]

meta_cols = [
    "timestamp",
    "location_name",
    "latitude",
    "longitude",
    "patient_id",
    "patient_name",
    "caregiver_name",
    "condition",
]

df = df.dropna(subset=features)
df[features] = df[features].fillna(df[features].mean())

scaler = StandardScaler()
X_scaled = scaler.fit_transform(df[features])

contamination = 0.04  

iso = IsolationForest(
    n_estimators=300,
    contamination=contamination,
    random_state=42,
    n_jobs=-1,
)

df["anomaly_flag"] = iso.fit_predict(X_scaled)
df["anomaly_label"] = df["anomaly_flag"].map({1: "Normal", -1: "Anomaly"})

os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(iso, os.path.join(MODEL_DIR, "isoforest_model.pkl"))
joblib.dump(scaler, os.path.join(MODEL_DIR, "isoforest_scaler.pkl"))

metadata = {
    "model_type": "IsolationForest",
    "trained_on": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "dataset_rows": len(df),
    "features": features,
}

joblib.dump(metadata, os.path.join(MODEL_DIR, "isoforest_metadata.pkl"))

df_out = df[meta_cols + features + ["anomaly_label"]]
df_out.to_csv(OUTPUT_PATH, index=False)

normal = (df["anomaly_label"] == "Normal").sum()
anomaly = (df["anomaly_label"] == "Anomaly").sum()
ratio = anomaly / max(1, (normal + anomaly))

print("\n✅ Model trained successfully")
print(f"🟢 Normal: {normal:,} | 🔴 Anomaly: {anomaly:,} ({ratio*100:.2f}%)")
print(f"💾 Model → {MODEL_DIR}/isoforest_model.pkl")
print(f"💾 Scaler → {MODEL_DIR}/isoforest_scaler.pkl")
print(f"📄 Processed data → {OUTPUT_PATH}")


test_data = {
    "temperature": 32,
    "humidity": 70,
    "noise_level": 1.5,
    "light_intensity": 150
}

print("\n🔍 Testing with dynamic input:")
print(test_data)

df_test = pd.DataFrame([test_data])

df_test = df_test.dropna(subset=features)
df_test[features] = df_test[features].fillna(df_test[features].mean())

X_test_scaled = scaler.transform(df_test[features])

df_test["anomaly_flag"] = iso.predict(X_test_scaled)
df_test["anomaly_label"] = df_test["anomaly_flag"].map({1: "Normal", -1: "Anomaly"})

print("\n📊 Prediction Result:")
print(df_test)