# 🏥 Admin Dashboard Documentation

## Overview

The Admin Dashboard is a comprehensive management panel for monitoring all patients, their sensor data, thresholds, and system alerts. Administrators can view real-time data, manage patient thresholds, and analyze system performance.

## Features

### 📊 1. Dashboard Overview Tab
Displays key metrics at a glance:
- **Total Patients**: Number of registered patients
- **Active Patients**: Patients with recent feedback
- **Total Feedback Items**: Cumulative feedback recorded
- **Recent Reactions (24h)**: Number of patient reactions in the last 24 hours
- **Average Feedback per Patient**: Mean feedback items across all patients

### 👥 2. Patients Tab
List all patients with their details:
- **Patient ID**: Unique identifier
- **Status**: Active/Inactive status
- **Feedback Count**: Total feedback items for the patient
- **Last Updated**: Timestamp of last threshold update
- **Thresholds Preview**: Current threshold settings
- **View Details**: Click to view comprehensive patient information

#### Patient Detail View
Click on any patient card to view:
- **Feedback Summary**: Total feedback, reactions, calm states, last 7 days data
- **Thresholds Management**: Edit and save custom thresholds
- **Feature Statistics**: Min, Max, Mean, Std Dev for each sensor
- **Historical Data**: Complete feedback history

### 🚨 3. Alerts Tab
Real-time alerts for all patients:
- **Severity Indicators**: High (🔴) and Medium (🟠) severity levels
- **Alert Messages**: Specific conditions that triggered the alert
- **Timestamp**: When the alert was generated
- **Patient Link**: Quick reference to which patient triggered the alert
- **Auto-refresh**: Updates every 30 seconds

### 📈 4. Analytics Tab
System-wide performance metrics:
- **Patient Distribution**: Percentage of active vs inactive patients
- **Feedback Analysis**: Total items and average per patient
- **Reaction Trends**: 24-hour reaction statistics

---

## How to Access Admin Panel

### From Patient Dashboard
1. Click the **"🏥 Admin Panel"** button in the top-right corner
2. The interface will switch to the admin dashboard
3. Click **"👤 Patient View"** to return to patient dashboard

### Direct URL (Alternative)
Currently, the admin panel is integrated into the main app. Use the toggle button to switch views.

---

## Managing Thresholds

### Automatic Threshold Calculation
Thresholds are automatically calculated based on patient reactions:

```
Threshold = (Mean of Reactions + Mean of Calm States) / 2
```

**Example:**
```
Temperature when anxious: 34.5°C
Temperature when calm: 28.5°C
Calculated Threshold: 31.5°C
```

### Manual Threshold Update

1. **Go to Patients Tab** → Click on patient card
2. **Click "✏️ Edit"** button in the Thresholds section
3. **Modify values** as needed:
   - Temperature (°C)
   - Humidity (%)
   - Noise Level (intensity)
   - Light Intensity (lux)
4. **Click "💾 Save Changes"** to apply

### When to Update Thresholds

- After initial 6+ feedback items are collected
- When patient behavioral patterns change
- Monthly reviews or as clinically indicated
- After significant environmental changes

---

## API Endpoints Used

The admin panel consumes these backend endpoints:

### Dashboard
```
GET /admin/dashboard
Response: Overall system statistics
```

### Patients
```
GET /admin/patients
Response: List of all patients with brief info

GET /admin/patient/<patient_id>
Response: Detailed patient information
```

### Thresholds
```
PUT /admin/patient/<patient_id>/thresholds
Body: { "thresholds": { "temperature": 31.5, ... } }
Response: Updated thresholds
```

### Alerts
```
GET /admin/alerts
Response: Recent alerts across all patients
```

### Feedback History
```
GET /admin/patient/<patient_id>/feedback?limit=100
Response: Patient feedback history
```

---

## Dashboard Data Refresh

- **Auto-refresh**: Every 30 seconds
- **Manual refresh**: Click the **"🔄 Refresh"** button in the header
- **Real-time updates**: Alert tab updates in real-time

---

## Key Metrics Explained

### Silhouette Score
- **Range**: -1 to 1
- **Target**: > 0.5 (good cluster separation)
- **What it measures**: How well anomalies are separated from normal data

### Davies-Bouldin Index
- **Range**: 0 to ∞
- **Target**: < 1.5 (lower is better)
- **What it measures**: Average similarity ratio between clusters

### Z-Score (Statistical Validation)
- **Range**: > 2 is significant
- **Interpretation**: Anomalies statistically different from normal states

---

## Best Practices

### 1. Monitor Alerts Daily
- Review 🚨 Alerts tab each morning
- Address high-severity alerts (🔴) immediately
- Track patterns in medium-severity alerts (🟠)

### 2. Update Thresholds Regularly
- Collect at least 6+ feedback items before auto-calculating
- Review monthly or after patient status changes
- Document any manual threshold changes

### 3. Analyze Trends
- Use Analytics tab to identify patterns
- Track peak reaction hours for staffing planning
- Monitor feedback quality and completeness

### 4. Patient-Specific Care
- Review individual patient statistics
- Customize thresholds based on patient profile
- Track reaction trends over time

---

## Troubleshooting

### No data displaying
- **Issue**: Dashboard shows "No data"
- **Solution**: Ensure backend is running and MongoDB connection is active

### Thresholds not updating
- **Issue**: "Insufficient data" message
- **Solution**: Collect at least 6 feedback items before calculating thresholds

### Stale data
- **Issue**: Data not updating in real-time
- **Solution**: Click 🔄 Refresh button or wait for auto-refresh (30 seconds)

### High alert count
- **Issue**: Too many alerts
- **Solution**: Review and update patient thresholds to reduce false positives

---

## System Requirements

- **Backend**: Flask server running at `http://127.0.0.1:5000`
- **Database**: MongoDB with patient_thresholds and reaction_history collections
- **Browser**: Modern browser with JavaScript enabled
- **Network**: Stable connection to backend server

---

## Data Privacy & Security

- Admin panel requires access to all patient data
- All API calls use standard HTTP (in development)
- Consider HTTPS and authentication in production
- Patient IDs should not be shared with unauthorized users

---

## Advanced Features

### Export Data
Future enhancement to export patient reports and analytics to PDF/CSV

### Custom Alerts
Future enhancement to set custom alert thresholds and notifications

### Multi-Language Support
Future enhancement for Hindi and Marathi interfaces

### Role-Based Access
Future enhancement for role-based permissions (Admin, Caregiver, Doctor)

---

## Support & Contact

For issues or enhancement requests:
1. Check troubleshooting section above
2. Review backend logs for errors
3. Verify MongoDB connection and data integrity
4. Contact development team for feature requests

---

**Last Updated**: April 10, 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
