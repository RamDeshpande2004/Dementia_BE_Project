# ============================================================
# model/anomaly_isoforest.py
# Train Isolation Forest on single-patient month-long data (Sunita Joshi)
# ============================================================
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib, os
from datetime import datetime

# ============================================================
# 1. Load Data
# ============================================================
DATA_PATH = "data/sunita_month_data.csv"
MODEL_DIR = "model"
OUTPUT_PATH = "data/sunita_processed.csv"

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"❌ Dataset not found at {DATA_PATH}")

df = pd.read_csv(DATA_PATH)
print(f"📂 Loaded dataset with {len(df):,} records for Mrs. Sunita Joshi")

# ============================================================
# 2. Feature Selection
# ============================================================
features = [
    "temperature",
    "humidity",
    "air_quality_index",
    "co2",
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

# ============================================================
# 3. Train Isolation Forest
# ============================================================
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df[features])

# Adaptive contamination
contamination = np.clip(df["air_quality_index"].std() / 1000, 0.02, 0.06)
print(f"⚙️ Adaptive contamination = {contamination:.3f}")

iso = IsolationForest(
    n_estimators=300,
    contamination=contamination,
    random_state=42,
    n_jobs=-1,
)
df["anomaly_flag"] = iso.fit_predict(X_scaled)
df["anomaly_label"] = df["anomaly_flag"].map({1: "Normal", -1: "Anomaly"})

# ============================================================
# 4. Save Artifacts
# ============================================================
os.makedirs(MODEL_DIR, exist_ok=True)
joblib.dump(iso, f"{MODEL_DIR}/isoforest_model.pkl")
joblib.dump(scaler, f"{MODEL_DIR}/isoforest_scaler.pkl")

metadata = {
    "model_type": "IsolationForest",
    "trained_on": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    "dataset_rows": len(df),
    "patient": "Mrs. Sunita Joshi",
    "caregiver": "Arti Deshmukh",
    "adaptive_contamination": round(contamination, 4),
    "features": features,
}
joblib.dump(metadata, f"{MODEL_DIR}/isoforest_metadata.pkl")

df_out = df[meta_cols + features + ["anomaly_label"]]
df_out.to_csv(OUTPUT_PATH, index=False)

# ============================================================
# 5. Summary
# ============================================================
normal = (df["anomaly_label"] == "Normal").sum()
anomaly = (df["anomaly_label"] == "Anomaly").sum()
ratio = anomaly / max(1, (normal + anomaly))

print("\n✅ Model trained successfully for Sunita Joshi")
print(f"🟢 Normal: {normal:,} | 🔴 Anomaly: {anomaly:,} ({ratio*100:.2f}%)")
print(f"💾 Model → {MODEL_DIR}/isoforest_model.pkl")
print(f"💾 Scaler → {MODEL_DIR}/isoforest_scaler.pkl")
print(f"📄 Processed data → {OUTPUT_PATH}")
print("\n🔍 Sample preview:")
print(df_out.head(8))
