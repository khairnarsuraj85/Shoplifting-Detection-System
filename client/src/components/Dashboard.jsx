import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css';
import {
  FaExclamationCircle,
  FaBroadcastTower,
  FaChartLine,
  FaShieldAlt
} from 'react-icons/fa';

function Dashboard() {
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axios.get('http://localhost:5050/dashboard-stats');
        const data = res.data;
        setActiveAlerts(data.active_alerts ?? 0);
        setIsCameraActive(data.is_camera_active ?? false);
        setSystemStatus({
          detectionAccuracy: data.detection_accuracy,
          responseTime: data.response_time,
          camerasOnline: data.cameras_online,
          threatLevel: data.threat_level
        });
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      }
    };

    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'High': return '#e74c3c';
      case 'Moderate': return '#f39c12';
      default: return '#2ecc71';
    }
  };

  return (
    <section className="dashboard">
      <div className="dashboard-header">
        <h2>Real-Time Security Dashboard</h2>
        <p>Comprehensive overview of your store&apos;s security status</p>
      </div>

      <div className="dashboard-grid">
        {/* Live Feed Status */}
        <div className="dashboard-card">
          <div className="card-icon">
            <FaBroadcastTower />
          </div>
          <div className="card-content">
            <div className="card-title">Live Feed Status</div>
            <div className={`status-indicator ${isCameraActive ? 'active' : 'inactive'}`}>
              {isCameraActive ? 'Active' : 'Offline'}
            </div>
            <div className="card-description">
              {isCameraActive
                ? 'Monitoring laptop camera in real-time'
                : 'Camera feed disconnected'}
            </div>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="dashboard-card">
          <div className="card-icon alerts">
            <FaExclamationCircle />
          </div>
          <div className="card-content">
            <div className="card-title">Active Alerts</div>
            <div className="alert-count">{activeAlerts}</div>
            <div className="card-description">
              {activeAlerts === 0 ? 'No current alerts' : 'Suspicious activities detected'}
            </div>
          </div>
        </div>

        {/* Detection Accuracy */}
        <div className="dashboard-card">
          <div className="card-icon">
            <FaChartLine />
          </div>
          <div className="card-content">
            <div className="card-title">Detection Accuracy</div>
            <div className="accuracy-value">
              {systemStatus?.detectionAccuracy ? `${systemStatus.detectionAccuracy.toFixed(1)}%` : 'N/A'}
            </div>
            <div className="card-description">AI confidence level</div>
          </div>
        </div>

        {/* System Threat Level */}
        <div className="dashboard-card">
          <div className="card-icon">
            <FaShieldAlt />
          </div>
          <div className="card-content">
            <div className="card-title">System Status</div>
            <div
              className="status-tag"
              style={{ backgroundColor: getStatusColor(systemStatus?.threatLevel ?? 'Low') }}
            >
              {systemStatus?.threatLevel ?? 'N/A'} Threat
            </div>
            <div className="card-description">
              {systemStatus?.camerasOnline ?? 0}/8 cameras online
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
