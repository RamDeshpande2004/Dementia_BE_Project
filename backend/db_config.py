from pymongo import MongoClient

# MongoDB connection URI
MONGO_URI = "mongodb+srv://ramdeshpande2918_db_user:9PMcv5hX4X6770EY@cluster1.5ezv0s5.mongodb.net/"

client = MongoClient(MONGO_URI)
db = client["dementia_safety"]

# Collections
patient_thresholds = db["patient_thresholds"]
reaction_history = db["reaction_history"]  # ← Add this line
