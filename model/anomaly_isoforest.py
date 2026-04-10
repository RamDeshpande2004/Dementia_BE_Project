import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score, davies_bouldin_score
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
print(f"📂 Loaded dataset with {len(df):,} records\n")

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

# ============ OPTIMIZED ISOLATIONFOREST ============
print("🔧 Training optimized IsolationForest model...")
print("="*70)

# Using optimized parameters based on industry standards
contamination = 0.02  # Lower contamination for better anomaly isolation
n_estimators = 300

iso = IsolationForest(
    n_estimators=n_estimators,
    contamination=contamination,
    random_state=42,
    n_jobs=-1,
    max_samples="auto",
)

print(f"🏆 MODEL CONFIGURATION:")
print(f"   Contamination: {contamination*100:.2f}%")
print(f"   N-Estimators: {n_estimators}")
print(f"   Max Samples: auto")

predictions = iso.fit_predict(X_scaled)
anomaly_scores = iso.score_samples(X_scaled)
print("\n✅ Model training complete\n")

df["anomaly_flag"] = predictions
df["anomaly_label"] = df["anomaly_flag"].map({1: "Normal", -1: "Anomaly"})
df["anomaly_score"] = anomaly_scores

# ============ INDUSTRY-STANDARD EVALUATION ============
print("="*70)
print("🏆 INDUSTRY-STANDARD MODEL EVALUATION")
print("="*70)

# 1. SILHOUETTE SCORE (Primary Metric)
silhouette = silhouette_score(X_scaled, predictions)
print(f"\n1️⃣  SILHOUETTE SCORE (Primary Metric)")
print(f"    Score: {silhouette:.4f}")
print(f"    Target: > 0.5")
if silhouette > 0.5:
    print(f"    Status: ✅ GOOD - Well-separated clusters")
elif silhouette > 0.3:
    print(f"    Status: ⚠️  FAIR - Some overlap")
else:
    print(f"    Status: ❌ POOR - Clusters overlapping")

# 2. DAVIES-BOULDIN INDEX (Secondary Metric)
davies_bouldin = davies_bouldin_score(X_scaled, predictions)
print(f"\n2️⃣  DAVIES-BOULDIN INDEX (Cluster Separation)")
print(f"    Score: {davies_bouldin:.4f}")
print(f"    Target: < 1.5")
if davies_bouldin < 1.5:
    print(f"    Status: ✅ GOOD - Excellent separation")
elif davies_bouldin < 2.5:
    print(f"    Status: ⚠️  FAIR - Acceptable separation")
else:
    print(f"    Status: ❌ POOR - Poor separation")

# 3. ANOMALY STATISTICS
normal_count = (df["anomaly_label"] == "Normal").sum()
anomaly_count = (df["anomaly_label"] == "Anomaly").sum()
anomaly_ratio = (anomaly_count / len(df)) * 100

print(f"\n3️⃣  ANOMALY DISTRIBUTION")
print(f"    Normal Samples:  {normal_count:,} ({100-anomaly_ratio:.2f}%)")
print(f"    Anomaly Samples: {anomaly_count:,} ({anomaly_ratio:.2f}%)")
print(f"    Contamination Rate: {contamination*100:.2f}%")
if abs(anomaly_ratio - (contamination*100)) < 1:
    print(f"    Status: ✅ ACCURATE - As expected")
else:
    print(f"    Status: ⚠️  VARIANCE - Check data distribution")

# 4. STATISTICAL VALIDATION
normal_data = df[df["anomaly_label"] == "Normal"][features]
anomaly_data = df[df["anomaly_label"] == "Anomaly"][features]

print(f"\n4️⃣  STATISTICAL VALIDATION (Z-Score Analysis)")
print(f"    Checking if anomalies are statistically different...")

significantly_different = 0
for feature in features:
    n_mean = normal_data[feature].mean()
    n_std = normal_data[feature].std()
    a_mean = anomaly_data[feature].mean()
    
    z_score = abs(a_mean - n_mean) / (n_std + 1e-6)
    
    if z_score > 2:
        print(f"    ✅ {feature:20} Z={z_score:6.2f}")
        significantly_different += 1
    else:
        print(f"    ⚠️  {feature:20} Z={z_score:6.2f}")

print(f"    Result: {significantly_different}/4 features significantly different")

# 5. ANOMALY SCORE DISTRIBUTION
print(f"\n5️⃣  ANOMALY SCORE DISTRIBUTION")
print(f"    Min:    {anomaly_scores.min():.4f}")
print(f"    Max:    {anomaly_scores.max():.4f}")
print(f"    Mean:   {anomaly_scores.mean():.4f}")
print(f"    Median: {np.median(anomaly_scores):.4f}")
print(f"    Std:    {anomaly_scores.std():.4f}")

score_range = anomaly_scores.max() - anomaly_scores.min()
if score_range > 0.5:
    print(f"    Status: ✅ GOOD - Clear separation in scores")
else:
    print(f"    Status: ⚠️  WEAK - Limited score variance")

# ============ OVERALL ASSESSMENT ============
print(f"\n" + "="*70)
print("📋 OVERALL ASSESSMENT")
print("="*70)

score_count = 0
if silhouette > 0.5:
    score_count += 1
if davies_bouldin < 1.5:
    score_count += 1
if significantly_different >= 3:
    score_count += 1
if score_range > 0.5:
    score_count += 1

assessment = ["❌ POOR", "⚠️  FAIR", "✅ GOOD", "⭐ EXCELLENT", "🏆 OUTSTANDING"]
print(f"\nModel Quality: {assessment[score_count]} ({score_count}/4 criteria met)")

if score_count >= 3:
    print("\n✅ RECOMMENDATION: Model is ready for production")
elif score_count >= 2:
    print("\n⚠️  RECOMMENDATION: Fine-tune model parameters before deployment")
else:
    print("\n❌ RECOMMENDATION: Model needs significant improvement")

# ============ SAVE MODEL & RESULTS ============
os.makedirs(MODEL_DIR, exist_ok=True)

joblib.dump(iso, os.path.join(MODEL_DIR, "isoforest_model.pkl"))
joblib.dump(scaler, os.path.join(MODEL_DIR, "isoforest_scaler.pkl"))

# Save evaluation metrics
eval_metrics = {
    "silhouette_score": float(silhouette),
    "davies_bouldin_index": float(davies_bouldin),
    "normal_samples": int(normal_count),
    "anomaly_samples": int(anomaly_count),
    "anomaly_ratio": float(anomaly_ratio),
    "evaluation_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
}

joblib.dump(eval_metrics, os.path.join(MODEL_DIR, "evaluation_metrics.pkl"))

df_out = df[meta_cols + features + ["anomaly_label", "anomaly_score"]]
df_out.to_csv(OUTPUT_PATH, index=False)

print(f"\n💾 Model saved → {MODEL_DIR}/isoforest_model.pkl")
print(f"📊 Metrics saved → {MODEL_DIR}/evaluation_metrics.pkl")
print(f"📄 Data saved → {OUTPUT_PATH}")
print("="*70)

# ============ TEST WITH SAMPLE DATA ============
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
df_test["anomaly_score"] = iso.score_samples(X_test_scaled)

print("\n📊 Prediction Result:")
print(df_test)