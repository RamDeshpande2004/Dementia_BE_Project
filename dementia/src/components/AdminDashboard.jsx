import React, { useState, useEffect } from 'react';
import './AdminStyles.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [sensorData, setSensorData] = useState({
    temperature: [],
    humidityNoise: [],
    lightIntensity: null,
    statistics: null
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const BACKEND_URL = 'http://127.0.0.1:5000';

  // Fetch dashboard data - OPTIMIZED for speed
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch patients when tab changes or page changes
  useEffect(() => {
    if (activeTab === 'patients') {
      fetchPatients(currentPage);
    }
  }, [activeTab, currentPage]);

  // Fetch analytics when analytics tab is opened
  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, alertsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/dashboard`),
        fetch(`${BACKEND_URL}/admin/alerts?limit=50`)
      ]);

      if (!dashRes.ok || !alertsRes.ok) {
        throw new Error('Failed to fetch from backend');
      }

      const dashData = await dashRes.json();
      const alertsData = await alertsRes.json();

      setDashboard(dashData);
      setAlerts(alertsData.alerts || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async (page) => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/patients?page=${page}&limit=20`);
      if (!res.ok) throw new Error('Failed to fetch patients');
      const data = await res.json();
      setPatients(data.patients || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to fetch patients');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const [analyticsRes, tempRes, humidityRes, lightRes, statsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/analytics`),
        fetch(`${BACKEND_URL}/admin/sensor-analysis/temperature`),
        fetch(`${BACKEND_URL}/admin/sensor-analysis/humidity-noise`),
        fetch(`${BACKEND_URL}/admin/sensor-analysis/light-intensity`),
        fetch(`${BACKEND_URL}/admin/sensor-analysis/statistics`)
      ]);

      if (!analyticsRes.ok) throw new Error('Failed to fetch analytics');

      const analyticsData = await analyticsRes.json();
      setAnalytics(analyticsData);

      // Fetch sensor data
      if (tempRes.ok) {
        const tempData = await tempRes.json();
        setSensorData(prev => ({ ...prev, temperature: tempData.data || [] }));
      }

      if (humidityRes.ok) {
        const humidityData = await humidityRes.json();
        setSensorData(prev => ({ ...prev, humidityNoise: humidityData.data || [] }));
      }

      if (lightRes.ok) {
        const lightData = await lightRes.json();
        setSensorData(prev => ({ ...prev, lightIntensity: lightData }));
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setSensorData(prev => ({ ...prev, statistics: statsData }));
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch analytics');
    }
  };

  const handlePatientClick = async (patientId) => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/admin/patient/${patientId}`);
      if (!res.ok) throw new Error('Failed to fetch patient details');
      const data = await res.json();
      setPatientDetails(data);
      setSelectedPatient(patientId);
      setActiveTab('patient-detail');
    } catch (err) {
      console.error('Error fetching patient details:', err);
      setError('Failed to fetch patient details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveThresholds = async (patientId, newThresholds) => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/patient/${patientId}/thresholds`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thresholds: newThresholds })
      });
      if (!res.ok) throw new Error('Failed to update thresholds');
      alert('✅ Thresholds updated successfully!');
      fetchDashboardData();
    } catch (err) {
      console.error('Error updating thresholds:', err);
      alert('❌ Failed to update thresholds');
    }
  };

  if (loading && !dashboard) {
    return <div className="admin-loading">⏳ Loading dashboard...</div>;
  }

  if (error && !dashboard) {
    return (
      <div className="admin-error">
        <p>❌ {error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">Retry</button>
      </div>
    );
  }

  // OVERVIEW TAB
  if (activeTab === 'overview') {
    return (
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <div className="header-content">
            <h1>🏥 Dementia Safety Admin Dashboard</h1>
            <p className="header-subtitle">Monitor all patients and system alerts in real-time</p>
          </div>
          <button className="refresh-btn" onClick={fetchDashboardData} disabled={loading}>
            🔄 Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {['overview', 'patients', 'alerts', 'analytics'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'patients' && '👥 Patients'}
              {tab === 'alerts' && `🚨 Alerts (${alerts.length})`}
              {tab === 'analytics' && '📈 Analytics'}
            </button>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Overview Stats */}
        {dashboard && (
          <div className="overview-section">
            <div className="stat-cards">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-label">Total Patients</div>
                  <div className="stat-value">{dashboard.overview?.total_patients || 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-label">Total Feedback</div>
                  <div className="stat-value">{dashboard.overview?.total_feedback || 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚠️</div>
                <div className="stat-content">
                  <div className="stat-label">Reactions</div>
                  <div className="stat-value">{dashboard.overview?.total_reactions || 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <div className="stat-label">Reaction Rate</div>
                  <div className="stat-value">{dashboard.overview?.reaction_rate || 0}%</div>
                </div>
              </div>
            </div>

            {/* Recent Patients */}
            <div className="recent-patients-section">
              <h3>👥 Recent Patients</h3>
              <div className="recent-patients-list">
                {dashboard.recent_patients?.map(patient => (
                  <div key={patient.patient_id} className="recent-patient-item" onClick={() => handlePatientClick(patient.patient_id)}>
                    <span className="patient-item-name">{patient.patient_name}</span>
                    <span className="patient-item-status">{patient.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="recent-section">
              <h3>🚨 Recent Alerts</h3>
              <div className="alert-list">
                {dashboard.recent_alerts?.slice(0, 5).map((alert, idx) => (
                  <div key={idx} className="alert-item">
                    <span>{alert.patient}</span>
                    <span className={`severity severity-${alert.severity.toLowerCase()}`}>{alert.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // PATIENTS TAB
  if (activeTab === 'patients') {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1>👥 Patients</h1>
          <button className="refresh-btn" onClick={() => fetchPatients(currentPage)} disabled={loading}>
            🔄 Refresh
          </button>
        </div>

        <div className="admin-tabs">
          {['overview', 'patients', 'alerts', 'analytics'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'patients' && '👥 Patients'}
              {tab === 'alerts' && `🚨 Alerts (${alerts.length})`}
              {tab === 'analytics' && '📈 Analytics'}
            </button>
          ))}
        </div>

        <div className="patients-grid">
          {patients.map(patient => (
            <div
              key={patient.patient_id}
              className="patient-card"
              onClick={() => handlePatientClick(patient.patient_id)}
            >
              <h3>{patient.patient_name}</h3>
              <p className="patient-id">{patient.patient_id}</p>
              <div className="patient-info">
                <span className={`status ${patient.status.toLowerCase()}`}>{patient.status}</span>
                <span className="feedback-count">📊 {patient.feedback_count} records</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(curr => Math.max(1, curr - 1))}
            disabled={currentPage === 1}
            className="pag-btn"
          >
            ← Previous
          </button>
          <span className="pag-info">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage(curr => curr + 1)}
            disabled={patients.length < 20}
            className="pag-btn"
          >
            Next →
          </button>
        </div>
      </div>
    );
  }

  // ALERTS TAB
  if (activeTab === 'alerts') {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1>🚨 Alerts ({alerts.length})</h1>
          <button className="refresh-btn" onClick={fetchDashboardData} disabled={loading}>
            🔄 Refresh
          </button>
        </div>

        <div className="admin-tabs">
          {['overview', 'patients', 'alerts', 'analytics'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'patients' && '👥 Patients'}
              {tab === 'alerts' && `🚨 Alerts (${alerts.length})`}
              {tab === 'analytics' && '📈 Analytics'}
            </button>
          ))}
        </div>

        <div className="alerts-section">
          <h3>🚨 Recent Alerts</h3>
          {alerts.length === 0 ? (
            <p className="no-data">✅ No critical alerts at this time</p>
          ) : (
            <div className="alert-list">
              {alerts.map((alert, idx) => (
                <div key={idx} className={`alert-card ${alert.severity.toLowerCase()}`}>
                  <h4 className="alert-title">{alert.patient_name}</h4>
                  <p className="alert-message"><strong>Severity:</strong> {alert.severity}</p>
                  {alert.alerts && alert.alerts.length > 0 && (
                    <div className="alert-details">
                      {alert.alerts.map((msg, i) => (
                        <p key={i} style={{margin: '4px 0', fontSize: '12px'}}>{msg}</p>
                      ))}
                    </div>
                  )}
                  <div className="alert-time">🕐 {alert.timestamp}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ANALYTICS TAB
  if (activeTab === 'analytics') {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1>📈 Analytics</h1>
          <button className="refresh-btn" onClick={fetchAnalytics} disabled={loading}>
            🔄 Refresh
          </button>
        </div>

        <div className="admin-tabs">
          {['overview', 'patients', 'alerts', 'analytics'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'patients' && '👥 Patients'}
              {tab === 'alerts' && `🚨 Alerts (${alerts.length})`}
              {tab === 'analytics' && '📈 Analytics'}
            </button>
          ))}
        </div>

        {analytics && (
          <div className="analytics-section">
            <div className="summary-card">
              <h3>📊 System Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Total Patients</span>
                  <span className="summary-value">{analytics.summary?.total_patients}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Total Feedback</span>
                  <span className="summary-value">{analytics.summary?.total_feedback_items}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Reaction Rate</span>
                  <span className="summary-value">{analytics.summary?.reaction_rate}%</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Alerts (24h)</span>
                  <span className="summary-value">{analytics.summary?.alerts_24h}</span>
                </div>
              </div>
            </div>

            {analytics.distributions?.by_condition?.length > 0 && (
              <div className="analytics-card">
                <h4>🌡️ Average Temperature Analysis</h4>
                <div className="chart-container">
                  <Line
                    data={{
                      labels: sensorData.temperature.map(d => d._id || 'N/A'),
                      datasets: [{
                        label: 'Avg Temperature (°C)',
                        data: sensorData.temperature.map(d => d.avg_temp || 0),
                        borderColor: '#dc2626',
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointBackgroundColor: '#dc2626',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                      }],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          min: 20,
                          max: 40,
                          beginAtZero: false,
                          grid: { color: '#e5e7eb' },
                          ticks: { font: { family: "'Poppins', sans-serif", size: 11 }, callback: v => v + '°C' },
                        },
                        x: {
                          grid: { display: false },
                          ticks: { font: { family: "'Poppins', sans-serif", size: 10 } },
                        },
                      },
                      plugins: {
                        legend: {
                          labels: { font: { family: "'Poppins', sans-serif", size: 12, weight: 600 } },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            {analytics.distributions?.by_location?.length > 0 && (
              <div className="analytics-card">
                <h4>💧 Average Humidity & 🔊 Noise Analysis</h4>
                <div className="chart-container">
                  <Line
                    data={{
                      labels: sensorData.humidityNoise.map(d => d._id || 'N/A'),
                      datasets: [
                        {
                          label: 'Humidity (%)',
                          data: sensorData.humidityNoise.map(d => d.avg_humidity || 0),
                          borderColor: '#0066cc',
                          backgroundColor: 'rgba(0, 102, 204, 0.1)',
                          borderWidth: 2.5,
                          tension: 0.4,
                          fill: true,
                          pointRadius: 3,
                          pointBackgroundColor: '#0066cc',
                          yAxisID: 'y',
                        },
                        {
                          label: 'Noise Level',
                          data: sensorData.humidityNoise.map(d => d.avg_noise || 0),
                          borderColor: '#f59e0b',
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          borderWidth: 2.5,
                          tension: 0.4,
                          fill: true,
                          pointRadius: 3,
                          pointBackgroundColor: '#f59e0b',
                          yAxisID: 'y1',
                        }
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: { mode: 'index', intersect: false },
                      scales: {
                        y: {
                          type: 'linear',
                          display: true,
                          position: 'left',
                          min: 30,
                          max: 80,
                          grid: { color: '#e5e7eb' },
                          ticks: { font: { family: "'Poppins', sans-serif", size: 11 }, callback: v => v + '%' },
                        },
                        y1: {
                          type: 'linear',
                          display: true,
                          position: 'right',
                          min: 0,
                          max: 4,
                          grid: { drawOnChartArea: false },
                          ticks: { font: { family: "'Poppins', sans-serif", size: 11 } },
                        },
                        x: {
                          grid: { display: false },
                          ticks: { font: { family: "'Poppins', sans-serif", size: 10 } },
                        },
                      },
                      plugins: {
                        legend: {
                          labels: { font: { family: "'Poppins', sans-serif", size: 12, weight: 600 } },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            )}

            <div className="analytics-card">
              <h4>☀️ Light Intensity Threshold Analysis</h4>
              <div className="chart-container">
                <Bar
                  data={{
                    labels: ['Very Low\n(<100)', 'Low\n(100-200)', 'Normal\n(200-350)', 'High\n(>350)'],
                    datasets: [{
                      label: 'Patient Count',
                      data: [
                        sensorData.lightIntensity?.very_low || 0,
                        sensorData.lightIntensity?.low || 0,
                        sensorData.lightIntensity?.normal || 0,
                        sensorData.lightIntensity?.high || 0
                      ],
                      backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#06b6d4'],
                      borderColor: '#fff',
                      borderWidth: 2,
                      borderRadius: 8,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: Math.max(
                          sensorData.lightIntensity?.very_low || 50,
                          sensorData.lightIntensity?.low || 50,
                          sensorData.lightIntensity?.normal || 50,
                          sensorData.lightIntensity?.high || 50
                        ) + 10,
                        grid: { color: '#e5e7eb' },
                        ticks: { font: { family: "'Poppins', sans-serif", size: 11 } },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { font: { family: "'Poppins', sans-serif", size: 11, weight: 600 } },
                      },
                    },
                    plugins: {
                      legend: {
                        labels: { font: { family: "'Poppins', sans-serif", size: 12, weight: 600 } },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="insights-section">
              <h3>📈 Dementia Analysis Insights</h3>
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-icon">🌡️</div>
                  <div className="insight-content">
                    <h4>Temperature Thresholds</h4>
                    <p><strong>Avg:</strong> {sensorData.statistics?.temperature?.avg?.toFixed(1) || '28.5'}°C | <strong>Range:</strong> {sensorData.statistics?.temperature?.min?.toFixed(1) || '25'}-{sensorData.statistics?.temperature?.max?.toFixed(1) || '32'}°C</p>
                    <p className="insight-text">Elevated temperatures may indicate fever or agitation</p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">💧</div>
                  <div className="insight-content">
                    <h4>Humidity Levels</h4>
                    <p><strong>Avg:</strong> {sensorData.statistics?.humidity?.avg?.toFixed(1) || '58'}% | <strong>Range:</strong> {sensorData.statistics?.humidity?.min?.toFixed(1) || '45'}-{sensorData.statistics?.humidity?.max?.toFixed(1) || '70'}%</p>
                    <p className="insight-text">Normal humidity supports comfortable living conditions</p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">🔊</div>
                  <div className="insight-content">
                    <h4>Noise Levels</h4>
                    <p><strong>Avg:</strong> {sensorData.statistics?.noise?.avg?.toFixed(2) || '1.2'} | <strong>High:</strong> >2.5 (concerning)</p>
                    <p className="insight-text">High noise may indicate agitation or behavioral changes</p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon">☀️</div>
                  <div className="insight-content">
                    <h4>Light Exposure</h4>
                    <p><strong>Avg:</strong> {sensorData.statistics?.light?.avg?.toFixed(1) || '220'} lux | <strong>Target:</strong> 200-350 lux</p>
                    <p className="insight-text">Adequate light supports circadian rhythm and mood</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // PATIENT DETAIL TAB
  if (activeTab === 'patient-detail' && patientDetails) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1>👤 {patientDetails.patient_name}</h1>
          <button className="refresh-btn" onClick={() => setActiveTab('patients')}>
            ← Back to Patients
          </button>
        </div>

        <div className="patient-detail-section">
          <div className="detail-card">
            <h3>📊 Feedback Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Total Feedback</span>
                <span className="summary-value">{patientDetails.feedback_summary?.total_feedback}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Reactions</span>
                <span className="summary-value">{patientDetails.feedback_summary?.reacted_count}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Calm States</span>
                <span className="summary-value">{patientDetails.feedback_summary?.calm_count}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Reaction Rate</span>
                <span className="summary-value">{patientDetails.feedback_summary?.reaction_rate}%</span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3>⚙️ Current Thresholds</h3>
            <div className="thresholds-grid">
              {Object.entries(patientDetails.thresholds || {}).map(([key, value]) => (
                <div key={key} className="threshold-item">
                  <span className="threshold-label">{key.replace(/_/g, ' ')}</span>
                  <span className="threshold-value">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="detail-card">
            <h3>🌡️ Sensor Statistics</h3>
            <div className="stats-grid">
              {Object.entries(patientDetails.feature_statistics || {}).map(([feature, stats]) => (
                <div key={feature} className="stat-box">
                  <h4>{feature.replace(/_/g, ' ')}</h4>
                  <p>Min: {stats.min?.toFixed(2)}</p>
                  <p>Max: {stats.max?.toFixed(2)}</p>
                  <p>Mean: {stats.mean?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AdminDashboard;
