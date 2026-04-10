"""
Verify test data in MongoDB
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from db_config import reaction_history, patient_thresholds

print("="*70)
print("✅ MONGODB TEST DATA VERIFICATION")
print("="*70)

# Count feedback records
feedback_count = reaction_history.count_documents({})
print(f"\n📊 Feedback Records: {feedback_count:,}")

# Count patient thresholds
threshold_count = patient_thresholds.count_documents({})
print(f"👥 Patient Thresholds: {threshold_count:,}")

if feedback_count > 0:
    # Show sample feedback
    print("\n📋 Sample Feedback Records:")
    samples = list(reaction_history.find().limit(3))
    for i, doc in enumerate(samples, 1):
        print(f"\n   Record {i}:")
        print(f"      Patient: {doc.get('patient_name')}")
        print(f"      Temperature: {doc.get('temperature')}°C")
        print(f"      Humidity: {doc.get('humidity')}%")
        print(f"      Condition: {doc.get('condition')}")
        print(f"      Caregiver: {doc.get('caregiver_name')}")

if threshold_count > 0:
    # Show sample thresholds
    print("\n\n📌 Sample Patient Thresholds:")
    samples = list(patient_thresholds.find().limit(3))
    for i, doc in enumerate(samples, 1):
        print(f"\n   Patient {i}: {doc.get('patient_name')}")
        thresholds = doc.get('thresholds', {})
        print(f"      Temperature: {thresholds.get('temperature')}°C")
        print(f"      Humidity: {thresholds.get('humidity')}%")
        print(f"      Noise: {thresholds.get('noise_level')}")
        print(f"      Light: {thresholds.get('light_intensity')} lux")

# Count unique patients
unique_patients = reaction_history.distinct('patient_name')
print(f"\n\n🏥 Total Unique Patients: {len(unique_patients)}")

print(f"\n{'='*70}")

if feedback_count >= 20000 and threshold_count >= 100:
    print("✅ ALL DATA SUCCESSFULLY INSERTED!")
    print(f"   • {feedback_count:,} feedback records")
    print(f"   • {threshold_count} patient profiles")
    print(f"   • {len(unique_patients)} unique Indian patients")
    print("\n🎉 Admin Panel is ready to display all patient data!")
else:
    print(f"⏳ Data insertion in progress...")
    print(f"   Current: {feedback_count:,}/{20000} feedback records")
    print(f"   Current: {threshold_count}/{100} patient profiles")

print("="*70)
