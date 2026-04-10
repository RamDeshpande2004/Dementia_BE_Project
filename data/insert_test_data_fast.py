"""
Fast insertion of test data into MongoDB using batch operations
"""

import pandas as pd
import sys
import os
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
from db_config import db, patient_thresholds, reaction_history

def insert_data_fast():
    """Insert test data into MongoDB using fast batch operations"""
    
    print("="*70)
    print("⚡ FAST MONGODB DATA INSERTION")
    print("="*70)
    
    # Load CSV
    csv_path = "test_data_20k_100patients.csv"
    if not os.path.exists(csv_path):
        print(f"❌ File not found: {csv_path}")
        return
    
    print(f"\n📂 Loading {csv_path}...")
    df = pd.read_csv(csv_path)
    print(f"✅ Loaded {len(df):,} records")
    
    # Clear old data
    print(f"\n🗑️  Clearing old test data...")
    reaction_history.delete_many({})
    patient_thresholds.delete_many({})
    print("✅ Cleared")
    
    # Prepare records with reaction data
    print(f"\n⚙️  Preparing records for insertion...")
    import random
    records = df.to_dict('records')
    for record in records:
        record['reacted'] = random.choice([True, False])
    
    # Fast batch insert
    print(f"📤 Inserting {len(records):,} records (batch insert)...")
    batch_size = 1000
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        try:
            reaction_history.insert_many(batch, ordered=False)
            print(f"   ✓ Inserted {min(batch_size, len(records)-i):,} records ({i+len(batch):,}/{len(records)})")
        except Exception as e:
            print(f"   ⚠️  Error in batch {i//batch_size}: {e}")
    
    print(f"✅ Inserted {len(records):,} feedback records")
    
    # Insert patient thresholds
    print(f"\n⚙️  Generating patient thresholds...")
    patients = df[['patient_id', 'patient_name']].drop_duplicates()
    
    threshold_docs = []
    for _, patient in patients.iterrows():
        patient_id = patient['patient_id']
        patient_name = patient['patient_name']
        
        # Calculate thresholds from patient data
        patient_data = df[df['patient_id'] == patient_id]
        
        threshold_doc = {
            "patient_id": patient_id,
            "patient_name": patient_name,
            "thresholds": {
                "temperature": round(patient_data['temperature'].mean() + 2, 2),
                "humidity": round(patient_data['humidity'].mean() + 5, 2),
                "noise_level": round(patient_data['noise_level'].mean() + 0.5, 2),
                "light_intensity": round(patient_data['light_intensity'].mean() - 20, 2)
            },
            "last_updated": datetime.now()
        }
        threshold_docs.append(threshold_doc)
    
    # Batch insert thresholds
    print(f"📤 Inserting {len(threshold_docs)} patient thresholds...")
    try:
        patient_thresholds.insert_many(threshold_docs, ordered=False)
        print(f"✅ Inserted {len(threshold_docs)} patient thresholds")
    except Exception as e:
        print(f"❌ Error inserting thresholds: {e}")
    
    # Print summary
    print(f"\n" + "="*70)
    print("📊 INSERTION SUMMARY")
    print("="*70)
    print(f"\n✅ Feedback Records: {reaction_history.count_documents({})}")
    print(f"✅ Patient Thresholds: {patient_thresholds.count_documents({})}")
    print(f"\n🎉 Admin Panel is ready with {df['patient_id'].nunique()} Indian patients!")
    
    # Show sample patients
    print(f"\n👥 Sample Patients:")
    sample = df[['patient_name', 'condition', 'caregiver_name']].drop_duplicates().head(5)
    for _, row in sample.iterrows():
        print(f"   • {row['patient_name']:30} | {row['condition']:25}")
    
    print("="*70)

if __name__ == "__main__":
    try:
        insert_data_fast()
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
