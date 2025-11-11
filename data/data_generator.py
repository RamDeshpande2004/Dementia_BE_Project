import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
import random

# ===========================================================
# CONFIG
# ===========================================================
INPUT_PATH = "data/simulated_sensor_data.csv"
OUTPUT_PATH = "data/test_patient_feedback.csv"
PATIENT_ID = "sunita_joshi"
NUM_SAMPLES = 100

# Ensure directory
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# ===========================================================
# LOAD FULL DATA
# ===========================================================
df = pd.read_csv(INPUT_PATH)
print(f"📂 Loaded {len(df):,} total records")

# Filter for single patient
patient_df = df[df["patient_id"] == PATIENT_ID].copy()
if patient_df.empty:
    raise ValueError(f"No records found for patient_id = '{PATIENT_ID}'")

# Sample subset
if len(patient_df) > NUM_SAMPLES:
    patient_df = patient_df.sample(NUM_SAMPLES, random_state=42).sort_index()

# Reset timestamps for realistic spacing (5-second intervals)
base_time = datetime.now()
patient_df["timestamp"] = [
    (base_time + timedelta(seconds=i * 5)).strftime("%Y-%m-%d %H:%M:%S")
    for i in range(len(patient_df))
]

# Add feedback placeholders (for demo simulation)
patient_df["reacted"] = np.random.choice([True, False], size=len(patient_df), p=[0.4, 0.6])
patient_df["notes"] = np.where(
    patient_df["reacted"],
    "Patient reacted to discomfort. Threshold may adjust.",
    "No visible discomfort."
)

# ===========================================================
# SAVE TEST DATASET
# ===========================================================
patient_df.to_csv(OUTPUT_PATH, index=False)
print(f"✅ Saved {len(patient_df):,} demo rows → {OUTPUT_PATH}")

# Quick preview
print("\n📊 Data Preview:")
print(patient_df.head(8))
print("\n🧩 Reacted distribution:")
print(patient_df["reacted"].value_counts(normalize=True).round(2))
