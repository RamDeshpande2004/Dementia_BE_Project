import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

# ====================================================
# CONFIGURATION
# ====================================================
PATIENT_ID = "sunita_joshi"
PATIENT_NAME = "Mrs. Sunita Joshi"
CAREGIVER_NAME = "Arti Deshmukh"
CONDITION = "Mild Dementia"

DAYS = 30
RECORDS_PER_DAY = 1000   # about one reading every 90 sec
TOTAL_RECORDS = DAYS * RECORDS_PER_DAY
OUT_PATH = "data/sunita_month_data.csv"

os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

# ====================================================
# PUNE LOCATIONS (daily routine)
# ====================================================
LOCATIONS = [
    {"name": "Home - Kothrud", "lat": 18.5074, "lon": 73.8077},
    {"name": "Garden - Baner", "lat": 18.5597, "lon": 73.7890},
    {"name": "Market - Aundh", "lat": 18.5646, "lon": 73.8079},
]

# ====================================================
# TIME-BASED ENVIRONMENT PATTERNS
# ====================================================
def env_profile(hour):
    """Simulate realistic daily environmental cycles."""
    if 6 <= hour < 10:  # Morning
        return {"temp": (22, 27), "hum": (60, 80), "noise": (40, 55), "light": (400, 700)}
    elif 10 <= hour < 16:  # Afternoon
        return {"temp": (30, 38), "hum": (40, 60), "noise": (55, 75), "light": (700, 950)}
    elif 16 <= hour < 20:  # Evening
        return {"temp": (25, 32), "hum": (50, 70), "noise": (50, 65), "light": (300, 600)}
    else:  # Night
        return {"temp": (20, 26), "hum": (65, 85), "noise": (35, 50), "light": (100, 250)}

# ====================================================
# HELPER FUNCTIONS
# ====================================================
def clip(a, lo, hi):
    return np.clip(a, lo, hi)

def classify_status(t, h, aqi, co2, noise, light):
    """Classify environment condition."""
    if (t < 18 or t > 38) or (h < 30 or h > 85) or (aqi > 300) or (co2 > 1500) or (noise > 100) or (light < 150):
        return "CRITICAL"
    elif (36 <= t <= 38) or (75 <= h <= 85) or (150 <= aqi <= 300) or (1000 <= co2 <= 1500) or (80 <= noise <= 100):
        return "WARNING"
    return "NORMAL"

# ====================================================
# DATA GENERATION
# ====================================================
print("⏳ Generating 30 days of continuous data for Mrs. Sunita Joshi...")

records = []
start_time = datetime.now() - timedelta(days=DAYS)

for i in range(TOTAL_RECORDS):
    ts = start_time + timedelta(seconds=i * (86400 / RECORDS_PER_DAY))
    hour = ts.hour
    env = env_profile(hour)

    loc = random.choice(LOCATIONS)

    # Generate values with small randomness
    temp = round(np.random.uniform(*env["temp"]) + np.random.normal(0, 0.8), 2)
    hum = round(np.random.uniform(*env["hum"]) + np.random.normal(0, 2), 2)
    aqi = round(np.random.normal(120, 30), 2)
    co2 = round(np.random.normal(650, 120), 2)
    noise = round(np.random.uniform(*env["noise"]) + np.random.normal(0, 3), 2)
    light = round(np.random.uniform(*env["light"]) + np.random.normal(0, 20), 2)

    temp, hum, aqi, co2, noise, light = map(float, [
        clip(temp, 15, 42),
        clip(hum, 20, 95),
        clip(aqi, 10, 500),
        clip(co2, 300, 2000),
        clip(noise, 25, 120),
        clip(light, 50, 1000),
    ])

    status = classify_status(temp, hum, aqi, co2, noise, light)

    records.append({
        "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
        "location_name": loc["name"],
        "latitude": loc["lat"],
        "longitude": loc["lon"],
        "temperature": temp,
        "humidity": hum,
        "air_quality_index": aqi,
        "co2": co2,
        "noise_level": noise,
        "light_intensity": light,
        "patient_id": PATIENT_ID,
        "patient_name": PATIENT_NAME,
        "caregiver_name": CAREGIVER_NAME,
        "condition": CONDITION,
        "status_label": status
    })

# ====================================================
# SAVE CSV
# ====================================================
df = pd.DataFrame(records)
df.to_csv(OUT_PATH, index=False)

print(f"\n✅ Generated {len(df):,} records for 30 days.")
print(f"📁 File saved to: {OUT_PATH}")
print(df.head(5))
print("\n📊 Status distribution:")
print(df['status_label'].value_counts(normalize=True).round(3))
