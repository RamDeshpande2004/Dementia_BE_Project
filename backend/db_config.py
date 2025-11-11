from pymongo import MongoClient

# MongoDB connection URI
MONGO_URI = "mongodb+srv://ramdeshpande2918_db_user:sairam2918@cluster0.5t466il.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGO_URI)
db = client["dementia_safety"]

# Collections
patient_thresholds = db["patient_thresholds"]
reaction_history = db["reaction_history"]  # ← Add this line
