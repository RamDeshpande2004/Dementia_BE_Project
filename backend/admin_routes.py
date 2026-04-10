"""
Optimized Admin Panel API Routes (FAST VERSION)
Uses pagination, limits, and aggregation pipelines
"""

from flask import Blueprint, jsonify, request
from db_config import db, patient_thresholds, reaction_history
from datetime import datetime, timedelta
import pandas as pd

admin_bp = Blueprint('admin', __name__, url_prefix='/admin')

# ============ GET ALL PATIENTS (PAGINATED) ============
@admin_bp.route('/patients', methods=['GET'])
def get_all_patients():
    """Get paginated list of patients - OPTIMIZED for speed"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)  # Show 20 per page instead of all
        
        skip = (page - 1) * limit
        
        # Get total count
        total_patients = patient_thresholds.count_documents({})
        
        # Get paginated patients
        threshold_docs = list(
            patient_thresholds.find()
            .skip(skip)
            .limit(limit)
        )
        
        patients = []
        for doc in threshold_docs:
            patient_id = doc.get('patient_id')
            patient_name = doc.get('patient_name', 'Unknown')
            
            # Fast count without looping
            try:
                feedback_count = reaction_history.count_documents({"patient_id": patient_id})
            except:
                feedback_count = 0
            
            patients.append({
                "patient_id": patient_id,
                "patient_name": patient_name,
                "thresholds": doc.get('thresholds', {}),
                "feedback_count": feedback_count,
                "status": "Active" if feedback_count > 0 else "Inactive"
            })
        
        return jsonify({
            "total_patients": total_patients,
            "page": page,
            "limit": limit,
            "total_pages": (total_patients + limit - 1) // limit,
            "patients": patients,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ GET PATIENT DETAILS (OPTIMIZED) ============
@admin_bp.route('/patient/<patient_id>', methods=['GET'])
def get_patient_details(patient_id):
    """Get patient details - OPTIMIZED with limited feedback"""
    try:
        # Get thresholds
        thresholds_doc = patient_thresholds.find_one({"patient_id": patient_id})
        if not thresholds_doc:
            return jsonify({"error": "Patient not found"}), 404
        
        thresholds = thresholds_doc.get('thresholds', {})
        patient_name = thresholds_doc.get('patient_name', 'Unknown')
        
        # Get latest feedback only (limit to 20 instead of all)
        feedback_data = list(
            reaction_history.find({"patient_id": patient_id})
            .sort("timestamp", -1)
            .limit(20)
        )
        
        # Fast count operations
        reacted_count = reaction_history.count_documents(
            {"patient_id": patient_id, "reacted": True}
        )
        calm_count = reaction_history.count_documents(
            {"patient_id": patient_id, "reacted": False}
        )
        total_count = reacted_count + calm_count
        
        # Calculate feature statistics from limited feedback
        feature_stats = {}
        if feedback_data:
            df_feedback = pd.DataFrame(feedback_data)
            features = ["temperature", "humidity", "noise_level", "light_intensity"]
            for feature in features:
                if feature in df_feedback.columns:
                    try:
                        feature_stats[feature] = {
                            "min": float(df_feedback[feature].min()),
                            "max": float(df_feedback[feature].max()),
                            "mean": float(df_feedback[feature].mean()),
                            "std": float(df_feedback[feature].std())
                        }
                    except:
                        pass
        
        return jsonify({
            "patient_id": patient_id,
            "patient_name": patient_name,
            "thresholds": thresholds,
            "feedback_summary": {
                "total_feedback": total_count,
                "reacted_count": reacted_count,
                "calm_count": calm_count,
                "reaction_rate": round((reacted_count / total_count * 100), 2) if total_count > 0 else 0
            },
            "feature_statistics": feature_stats,
            "last_feedback": feedback_data[0] if feedback_data else None,
            "latest_20_feedback": feedback_data[:5],  # Show only 5 for preview
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ GET ANALYTICS (AGGREGATION PIPELINE - FAST) ============
@admin_bp.route('/analytics', methods=['GET'])
def get_analytics():
    """Get system analytics using efficient aggregation - NO LOADING ALL DATA"""
    try:
        total_patients = patient_thresholds.count_documents({})
        total_feedback = reaction_history.count_documents({})
        total_reactions = reaction_history.count_documents({"reacted": True})
        
        # Fast reaction rate
        reaction_rate = round((total_reactions / total_feedback * 100), 2) if total_feedback > 0 else 0
        
        # Get recent alerts (last 24 hours)
        today = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S")
        recent_alerts = reaction_history.count_documents({
            "timestamp": {"$gte": today},
            "reacted": True
        })
        
        # Patient distribution by condition (using aggregation)
        try:
            condition_pipeline = [
                {"$group": {
                    "_id": "$condition",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"count": -1}}
            ]
            conditions = list(reaction_history.aggregate(condition_pipeline))
        except:
            conditions = []
        
        # Location distribution
        try:
            location_pipeline = [
                {"$group": {
                    "_id": "$location_name",
                    "count": {"$sum": 1}
                }},
                {"$sort": {"count": -1}},
                {"$limit": 10}  # Top 10 locations
            ]
            locations = list(reaction_history.aggregate(location_pipeline))
        except:
            locations = []
        
        return jsonify({
            "summary": {
                "total_patients": total_patients,
                "total_feedback_items": total_feedback,
                "total_reactions": total_reactions,
                "reaction_rate": reaction_rate,
                "alerts_24h": recent_alerts
            },
            "distributions": {
                "by_condition": conditions,
                "by_location": locations
            },
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ GET ALERTS (OPTIMIZED) ============
@admin_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """Get recent alerts - OPTIMIZED to show critical ones only"""
    try:
        limit = request.args.get('limit', 50, type=int)  # Limit to 50 alerts
        
        # Find reactions with thresholds exceeded
        alerts = []
        
        # Get recent reactions across all patients (limit to last 200 for performance)
        recent_feedback = list(
            reaction_history.find({"reacted": True})
            .sort("timestamp", -1)
            .limit(200)
        )
        
        # Match with thresholds
        for feedback in recent_feedback[:limit]:  # Only process first 'limit' items
            patient_id = feedback.get("patient_id")
            patient_name = feedback.get("patient_name", "Unknown")
            
            thresholds_doc = patient_thresholds.find_one({"patient_id": patient_id})
            if not thresholds_doc:
                continue
            
            thresholds = thresholds_doc.get("thresholds", {})
            triggered_alerts = []
            severity = "Low"
            
            # Check temperature
            if "temperature" in feedback and "temperature" in thresholds:
                if feedback["temperature"] > thresholds["temperature"]:
                    triggered_alerts.append(f"🌡️ High Temp: {feedback['temperature']}°C vs {thresholds['temperature']}°C")
                    severity = "High"
            
            # Check humidity
            if "humidity" in feedback and "humidity" in thresholds:
                if feedback["humidity"] > thresholds["humidity"]:
                    triggered_alerts.append(f"💧 High Humidity: {feedback['humidity']}% vs {thresholds['humidity']}%")
                    severity = "Medium"
            
            # Check light
            if "light_intensity" in feedback and "light_intensity" in thresholds:
                if feedback["light_intensity"] < thresholds["light_intensity"]:
                    triggered_alerts.append(f"💡 Low Light: {feedback['light_intensity']} vs {thresholds['light_intensity']}")
                    severity = "Medium"
            
            if triggered_alerts:
                alerts.append({
                    "patient_name": patient_name,
                    "patient_id": patient_id,
                    "timestamp": feedback.get("timestamp", "N/A"),
                    "alerts": triggered_alerts,
                    "severity": severity
                })
        
        return jsonify({
            "total_alerts": len(alerts),
            "alerts": alerts,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ GET DASHBOARD (COMBINED - FAST) ============
@admin_bp.route('/dashboard', methods=['GET'])
def get_dashboard():
    """Get complete dashboard data - uses pagination for speed"""
    try:
        # Quick stats only
        total_patients = patient_thresholds.count_documents({})
        total_feedback = reaction_history.count_documents({})
        total_reactions = reaction_history.count_documents({"reacted": True})
        
        # Get first 20 patients
        patients_page = list(
            patient_thresholds.find()
            .limit(20)
        )
        
        patients = [{
            "patient_id": doc.get('patient_id'),
            "patient_name": doc.get('patient_name', 'Unknown'),
            "status": "Active"
        } for doc in patients_page]
        
        # Get last 10 alerts only
        recent_reactions = list(
            reaction_history.find({"reacted": True})
            .sort("timestamp", -1)
            .limit(10)
        )
        
        alerts = []
        for reaction in recent_reactions:
            alerts.append({
                "patient": reaction.get('patient_name', 'Unknown'),
                "timestamp": reaction.get('timestamp', 'N/A'),
                "severity": "Medium" if reaction.get('reacted') else "Low"
            })
        
        return jsonify({
            "overview": {
                "total_patients": total_patients,
                "total_feedback": total_feedback,
                "total_reactions": total_reactions,
                "reaction_rate": round((total_reactions / total_feedback * 100), 2) if total_feedback > 0 else 0
            },
            "recent_patients": patients,
            "recent_alerts": alerts,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ UPDATE PATIENT THRESHOLDS ============
@admin_bp.route('/patient/<patient_id>/thresholds', methods=['PUT'])
def update_thresholds(patient_id):
    """Update patient thresholds"""
    try:
        data = request.get_json()
        new_thresholds = data.get('thresholds')
        
        if not new_thresholds:
            return jsonify({"error": "No thresholds provided"}), 400
        
        result = patient_thresholds.update_one(
            {"patient_id": patient_id},
            {"$set": {
                "thresholds": new_thresholds,
                "last_updated": datetime.now()
            }}
        )
        
        if result.matched_count == 0:
            return jsonify({"error": "Patient not found"}), 404
        
        return jsonify({
            "status": "success",
            "message": "Thresholds updated",
            "patient_id": patient_id,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ GET PATIENT FEEDBACK (PAGINATED) ============
@admin_bp.route('/patient/<patient_id>/feedback', methods=['GET'])
def get_patient_feedback(patient_id):
    """Get paginated feedback for a patient"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 50, type=int)
        
        skip = (page - 1) * limit
        
        # Get total
        total = reaction_history.count_documents({"patient_id": patient_id})
        
        # Get paginated feedback
        feedback = list(
            reaction_history.find({"patient_id": patient_id})
            .sort("timestamp", -1)
            .skip(skip)
            .limit(limit)
        )
        
        return jsonify({
            "patient_id": patient_id,
            "total_feedback": total,
            "page": page,
            "limit": limit,
            "feedback": feedback,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ GET SENSOR AVERAGES (30-DAY TRENDS) ============
@admin_bp.route('/sensor-analysis/temperature', methods=['GET'])
def get_temperature_analysis():
    """Get daily average temperature for last 30 days"""
    try:
        # Pipeline to calculate daily averages (handling string timestamps)
        pipeline = [
            {
                "$group": {
                    "_id": {
                        "$substr": ["$timestamp", 0, 10]  # Extract YYYY-MM-DD from string
                    },
                    "avg_temp": {"$avg": "$temperature"},
                    "max_temp": {"$max": "$temperature"},
                    "min_temp": {"$min": "$temperature"}
                }
            },
            {"$sort": {"_id": 1}},
            {"$limit": 30}
        ]
        
        results = list(reaction_history.aggregate(pipeline))
        
        return jsonify({
            "data": results,
            "count": len(results)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ GET HUMIDITY & NOISE ANALYSIS ============
@admin_bp.route('/sensor-analysis/humidity-noise', methods=['GET'])
def get_humidity_noise_analysis():
    """Get daily average humidity and noise levels"""
    try:
        pipeline = [
            {
                "$group": {
                    "_id": {
                        "$substr": ["$timestamp", 0, 10]  # Extract YYYY-MM-DD from string
                    },
                    "avg_humidity": {"$avg": "$humidity"},
                    "avg_noise": {"$avg": "$noise_level"},
                    "max_humidity": {"$max": "$humidity"},
                    "max_noise": {"$max": "$noise_level"}
                }
            },
            {"$sort": {"_id": 1}},
            {"$limit": 30}
        ]
        
        results = list(reaction_history.aggregate(pipeline))
        
        return jsonify({
            "data": results,
            "count": len(results)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ GET LIGHT INTENSITY DISTRIBUTION ============
@admin_bp.route('/sensor-analysis/light-intensity', methods=['GET'])
def get_light_intensity_analysis():
    """Get patient distribution by light intensity thresholds"""
    try:
        # Define light intensity ranges
        very_low = reaction_history.count_documents({"light_intensity": {"$lt": 100}})
        low = reaction_history.count_documents({"light_intensity": {"$gte": 100, "$lt": 200}})
        normal = reaction_history.count_documents({"light_intensity": {"$gte": 200, "$lt": 350}})
        high = reaction_history.count_documents({"light_intensity": {"$gte": 350}})
        
        return jsonify({
            "very_low": very_low,
            "low": low,
            "normal": normal,
            "high": high,
            "total": very_low + low + normal + high
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ GET OVERALL SENSOR STATISTICS ============
@admin_bp.route('/sensor-analysis/statistics', methods=['GET'])
def get_sensor_statistics():
    """Get overall statistics for all sensors"""
    try:
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "avg_temperature": {"$avg": "$temperature"},
                    "avg_humidity": {"$avg": "$humidity"},
                    "avg_noise": {"$avg": "$noise_level"},
                    "avg_light": {"$avg": "$light_intensity"},
                    "max_temperature": {"$max": "$temperature"},
                    "max_humidity": {"$max": "$humidity"},
                    "max_noise": {"$max": "$noise_level"},
                    "max_light": {"$max": "$light_intensity"},
                    "min_temperature": {"$min": "$temperature"},
                    "min_humidity": {"$min": "$humidity"},
                    "min_noise": {"$min": "$noise_level"},
                    "min_light": {"$min": "$light_intensity"}
                }
            }
        ]
        
        result = list(reaction_history.aggregate(pipeline))
        
        if result:
            stats = result[0]
            return jsonify({
                "temperature": {
                    "avg": round(stats.get("avg_temperature", 0), 2),
                    "max": round(stats.get("max_temperature", 0), 2),
                    "min": round(stats.get("min_temperature", 0), 2)
                },
                "humidity": {
                    "avg": round(stats.get("avg_humidity", 0), 2),
                    "max": round(stats.get("max_humidity", 0), 2),
                    "min": round(stats.get("min_humidity", 0), 2)
                },
                "noise": {
                    "avg": round(stats.get("avg_noise", 0), 2),
                    "max": round(stats.get("max_noise", 0), 2),
                    "min": round(stats.get("min_noise", 0), 2)
                },
                "light": {
                    "avg": round(stats.get("avg_light", 0), 2),
                    "max": round(stats.get("max_light", 0), 2),
                    "min": round(stats.get("min_light", 0), 2)
                }
            }), 200
        else:
            return jsonify({"error": "No data available"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
