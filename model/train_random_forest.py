# ======================================================
# model/train_random_forest.py
# ======================================================
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import os

# ======================================================
# Load dataset
# ======================================================
DATA_PATH = "data/simulated_sensor_data.csv"
MODEL_DIR = "model"

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"❌ Data file not found at {DATA_PATH}")

df = pd.read_csv(DATA_PATH)
print(f"📂 Loaded dataset with {len(df):,} rows.")

# ======================================================
# Feature selection (match Flask + React fields)
# ======================================================
features = [
    "temperature",
    "humidity",
    "air_quality_index",
    "co2",
    "noise_level",
    "light_intensity",
]
target = "status_label"

# ======================================================
# Data cleaning
# ======================================================
df = df.dropna(subset=[target])
df[features] = df[features].fillna(df[features].mean())

# Encode target labels
le = LabelEncoder()
df[target] = le.fit_transform(df[target])

# Split into train/test
X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

# ======================================================
# Scale numeric features
# ======================================================
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# ======================================================
# Train Random Forest model
# ======================================================
rf = RandomForestClassifier(
    n_estimators=400,
    max_depth=14,
    random_state=42,
    class_weight="balanced",
    n_jobs=-1,
)
rf.fit(X_train_scaled, y_train)

# ======================================================
# Evaluate model
# ======================================================
y_pred = rf.predict(X_test_scaled)
acc = accuracy_score(y_test, y_pred)
cm = confusion_matrix(y_test, y_pred)

print("\n✅ Random Forest Model Trained Successfully!")
print(f"📈 Accuracy: {acc*100:.2f}%")
print("\nDetailed Report:\n", classification_report(y_test, y_pred, target_names=le.classes_))
print("Confusion Matrix:\n", cm)

# ======================================================
# Save model and preprocessing objects
# ======================================================
os.makedirs(MODEL_DIR, exist_ok=True)
joblib.dump(rf, f"{MODEL_DIR}/random_forest_model.pkl")
joblib.dump(scaler, f"{MODEL_DIR}/scaler.pkl")
joblib.dump(le, f"{MODEL_DIR}/label_encoder.pkl")

print(f"\n💾 Model, Scaler & Label Encoder saved to '{MODEL_DIR}/'")
print("✨ Training completed successfully.")
