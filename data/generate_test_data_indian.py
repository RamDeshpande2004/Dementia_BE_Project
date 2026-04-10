"""
Generate 20,000 test data entries for 100 Indian patients
For admin panel testing and demonstration
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import sys
import os

# Add backend to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
from db_config import db, patient_thresholds, reaction_history

# ============ INDIAN PATIENT NAMES DATABASE ============
FIRST_NAMES = [
    "Rajesh", "Amit", "Priya", "Neha", "Vikram", "Deepak", "Ananya", "Harsh",
    "Seema", "Pooja", "Arjun", "Kavya", "Sanjay", "Ishita", "Aditya", "Ritu",
    "Nikhil", "Shreya", "Rahul", "Divya", "Manoj", "Sneha", "Abhishek", "Isha",
    "Rohan", "Anjali", "Varun", "Sayali", "Akshay", "Megha", "Siddharth", "Tanvi",
    "Ashok", "Swati", "Aryan", "Nisha", "Suresh", "Rekha", "Karan", "Anushka",
    "Patel", "Divika", "Rishabh", "Preeti", "Shaurya", "Anita", "Vikas", "Diya",
    "Prakash", "Kiya", "Ajay", "Aadhya", "Ravi", "Shruti", "Sumit", "Avni",
    "Dinesh", "Esha", "Naveen", "Gaya", "Saurav", "Heera", "Bhavesh", "Isha"
]

LAST_NAMES = [
    "Sharma", "Singh", "Kumar", "Patel", "Verma", "Gupta", "Rao", "Desai",
    "Iyer", "Nair", "Krishnan", "Menon", "Reddy", "Pillai", "Malhotra", "Chopra",
    "Bhat", "Poonia", "Sinha", "Mishra", "Saxena", "Bansal", "Arora", "Kapoor",
    "Jain", "Sett", "Bose", "Das", "Roy", "Mukherjee", "Chowdhury", "Bhattacharya",
    "Dutta", "Chatterjee", "Banerjee", "Sengupta", "Ghosh", "Biswas", "Saha", "Nath",
    "Choudhury", "Ghose", "Bhar", "Pande", "Singh", "Yadav", "Rawat", "Mahajan",
    "Joshi", "Rathod", "Thakur", "Pandey", "Tripathi", "Upadhyay", "Dixit", "Dwivedi"
]

LOCATIONS = [
    "Mumbai Central", "Delhi North", "Bangalore South", "Chennai West", "Kolkata East",
    "Pune City", "Hyderabad Central", "Ahmedabad North", "Jaipur West", "Lucknow East",
    "Chandigarh Central", "Indore South", "Nagpur West", "Bhopal East", "Surat North",
    "Patna Central", "Vadodara South", "Ghaziabad West", "Ludhiana East", "Kota Central"
]

CONDITIONS = [
    "Early Dementia", "Mid-stage Dementia", "Advanced Dementia", "Mild Cognitive Impairment",
    "Asymptomatic", "Under Observation", "Stable Condition", "Progressive Decline"
]

CAREGIVER_NAMES = [
    "Rajesh Kumar", "Priya Singh", "Amit Patel", "Neha Gupta", "Vikram Sharma",
    "Deepak Verma", "Ananya Rao", "Harsh Desai", "Seema Iyer", "Pooja Nair",
    "Arjun Krishnan", "Kavya Menon", "Sanjay Reddy", "Ishita Pillai", "Aditya Malhotra",
    "Ritu Chopra", "Nikhil Bhat", "Shreya Poonia", "Rahul Sinha", "Divya Mishra",
    "Manoj Saxena", "Sneha Bansal", "Abhishek Arora", "Isha Joshi", "Rohan Sett"
]

# ============ GENERATE INDIAN PATIENT NAMES ============
def generate_indian_names(count=100):
    """Generate unique Indian patient names"""
    names = set()
    while len(names) < count:
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        names.add(f"{first} {last}")
    return list(names)

# ============ GENERATE REALISTIC SENSOR DATA ============
def generate_sensor_data():
    """Generate realistic sensor readings with some patterns"""
    # Base values with some randomness
    temperature = np.random.normal(28, 3)  # Mean 28°C, std 3
    humidity = np.random.normal(55, 8)     # Mean 55%, std 8
    noise_level = np.random.normal(1.2, 0.5)  # Mean 1.2, std 0.5
    light_intensity = np.random.normal(180, 40)  # Mean 180 lux, std 40
    
    # Ensure realistic ranges
    temperature = max(15, min(40, temperature))  # 15-40°C
    humidity = max(20, min(90, humidity))        # 20-90%
    noise_level = max(0.1, min(5.0, noise_level))  # 0.1-5.0
    light_intensity = max(50, min(500, light_intensity))  # 50-500 lux
    
    return {
        "temperature": round(temperature, 1),
        "humidity": round(humidity, 1),
        "noise_level": round(noise_level, 2),
        "light_intensity": round(light_intensity, 1)
    }

# ============ MAIN GENERATION FUNCTION ============
def generate_test_data(num_entries=20000, num_patients=100):
    """
    Generate test data with Indian patient names
    
    Parameters:
    - num_entries: Total number of data entries (20,000)
    - num_patients: Number of unique patients (100)
    """
    
    print("="*70)
    print("🇮🇳 GENERATING TEST DATA FOR ADMIN PANEL")
    print("="*70)
    
    # Generate patient names
    print(f"\n📝 Generating {num_patients} Indian patient names...")
    patient_names = generate_indian_names(num_patients)
    print(f"✅ Generated {len(patient_names)} unique Indian names")
    
    # Calculate entries per patient
    entries_per_patient = num_entries // num_patients
    print(f"\n📊 Distribution: {entries_per_patient} entries per patient")
    
    # Generate data
    print(f"\n⏳ Generating {num_entries:,} data entries...")
    
    data_list = []
    start_date = datetime.now() - timedelta(days=90)  # Last 90 days
    
    for i, patient_name in enumerate(patient_names, 1):
        patient_id = f"patient_{i:03d}_{patient_name.replace(' ', '_').lower()}"
        location = random.choice(LOCATIONS)
        condition = random.choice(CONDITIONS)
        caregiver = random.choice(CAREGIVER_NAMES)
        
        # Random coordinates (approximate India)
        latitude = round(random.uniform(8, 35), 4)
        longitude = round(random.uniform(68, 97), 4)
        
        # Generate entries for this patient
        for j in range(entries_per_patient):
            timestamp = start_date + timedelta(
                hours=random.randint(0, 90*24),
                minutes=random.randint(0, 59)
            )
            
            sensor_data = generate_sensor_data()
            
            entry = {
                "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "location_name": location,
                "latitude": latitude,
                "longitude": longitude,
                "patient_id": patient_id,
                "patient_name": patient_name,
                "caregiver_name": caregiver,
                "condition": condition,
                "temperature": sensor_data["temperature"],
                "humidity": sensor_data["humidity"],
                "noise_level": sensor_data["noise_level"],
                "light_intensity": sensor_data["light_intensity"]
            }
            data_list.append(entry)
        
        if i % 20 == 0:
            print(f"   ✓ Generated data for {i}/{num_patients} patients...")
    
    print(f"✅ Generated {len(data_list):,} total entries")
    
    return pd.DataFrame(data_list)

# ============ SAVE TO FILES ============
def save_data(df, output_path="test_data_20k_100patients.csv"):
    """Save generated data to CSV"""
    print(f"\n💾 Saving to CSV: {output_path}")
    df.to_csv(output_path, index=False)
    print(f"✅ Saved {len(df):,} entries")
    return output_path

# ============ INSERT INTO MONGODB ============
def insert_to_mongodb(df):
    """Insert generated data into MongoDB for admin panel"""
    print(f"\n📤 Inserting into MongoDB...")
    
    # Clear old test data
    print("   Clearing old test data...")
    reaction_history.delete_many({})
    patient_thresholds.delete_many({})
    
    # Get unique patients
    patients = df[['patient_id', 'patient_name']].drop_duplicates()
    
    print(f"   Found {len(patients)} unique patients")
    
    # Insert feedback data
    print("   Inserting feedback data...")
    records = df.to_dict('records')
    
    # Add reaction status (randomly marked as reacted or calm)
    for record in records:
        record['reacted'] = random.choice([True, False])
    
    try:
        result = reaction_history.insert_many(records)
        print(f"✅ Inserted {len(result.inserted_ids):,} feedback records")
    except Exception as e:
        print(f"❌ Error inserting feedback: {e}")
    
    # Generate and insert threshold data
    print("   Generating patient thresholds...")
    for _, patient in patients.iterrows():
        patient_id = patient['patient_id']
        patient_name = patient['patient_name']
        
        # Calculate thresholds based on data
        patient_data = df[df['patient_id'] == patient_id]
        
        thresholds = {
            "temperature": round(patient_data['temperature'].mean() + 2, 2),
            "humidity": round(patient_data['humidity'].mean() + 5, 2),
            "noise_level": round(patient_data['noise_level'].mean() + 0.5, 2),
            "light_intensity": round(patient_data['light_intensity'].mean() - 20, 2)
        }
        
        try:
            patient_thresholds.update_one(
                {"patient_id": patient_id},
                {"$set": {
                    "patient_id": patient_id,
                    "patient_name": patient_name,
                    "thresholds": thresholds,
                    "last_updated": datetime.now()
                }},
                upsert=True
            )
        except Exception as e:
            print(f"❌ Error inserting threshold for {patient_id}: {e}")
    
    print(f"✅ Inserted {len(patients)} patient thresholds")

# ============ PRINT SUMMARY ============
def print_summary(df):
    """Print data summary"""
    print(f"\n" + "="*70)
    print("📋 DATA SUMMARY")
    print("="*70)
    
    print(f"\n📊 Dataset Statistics:")
    print(f"   Total Entries: {len(df):,}")
    print(f"   Date Range: {df['timestamp'].min()} to {df['timestamp'].max()}")
    print(f"   Unique Patients: {df['patient_id'].nunique()}")
    print(f"   Unique Locations: {df['location_name'].nunique()}")
    
    print(f"\n🌡️  Sensor Data Ranges:")
    print(f"   Temperature: {df['temperature'].min():.1f}°C - {df['temperature'].max():.1f}°C")
    print(f"   Humidity: {df['humidity'].min():.1f}% - {df['humidity'].max():.1f}%")
    print(f"   Noise Level: {df['noise_level'].min():.2f} - {df['noise_level'].max():.2f}")
    print(f"   Light Intensity: {df['light_intensity'].min():.1f} - {df['light_intensity'].max():.1f} lux")
    
    print(f"\n👥 Sample Patients:")
    sample_patients = df[['patient_name', 'condition', 'caregiver_name']].drop_duplicates().head(10)
    for idx, row in sample_patients.iterrows():
        print(f"   • {row['patient_name']:30} | {row['condition']:25} | Caregiver: {row['caregiver_name']}")
    
    print(f"\n📍 Locations Covered:")
    locations = df['location_name'].unique()
    for loc in sorted(locations):
        count = len(df[df['location_name'] == loc])
        print(f"   • {loc:30} ({count:5} entries)")
    
    print("="*70)

# ============ MAIN EXECUTION ============
if __name__ == "__main__":
    try:
        # Generate test data
        df = generate_test_data(num_entries=20000, num_patients=100)
        
        # Print summary
        print_summary(df)
        
        # Save to CSV
        csv_path = save_data(df, "test_data_20k_100patients.csv")
        
        # Ask user before inserting to MongoDB
        print(f"\n⚠️  Ready to insert {len(df):,} entries into MongoDB")
        response = input("Do you want to insert this data into MongoDB? (yes/no): ").strip().lower()
        
        if response in ['yes', 'y']:
            insert_to_mongodb(df)
            print(f"\n✅ TEST DATA GENERATION COMPLETE!")
            print(f"   CSV: test_data_20k_100patients.csv")
            print(f"   MongoDB: Updated with {len(df):,} entries across 100 patients")
            print(f"\n🏥 Admin Panel is ready with comprehensive test data!")
        else:
            print(f"\n✅ Data saved to CSV only")
            print(f"   To insert later, run: insert_to_mongodb(df)")
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
