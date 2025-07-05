import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AlertSection.css';
import axios from 'axios';

const API_BASE_URL = "http://localhost:5050"; // Flask backend

function AlertSection({ addAlertToHistory }) {
  const [alert, setAlert] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch latest alert from backend
  const fetchLatestAlert = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/alert-history`);
      const alertList = res.data.alerts;
      if (alertList && alertList.length > 0) {
        const latest = alertList[0];
        setAlert(`🚨 ${latest.status.toUpperCase()}: ${latest.timestamp}`);
        addAlertToHistory(`Alert at ${latest.timestamp}`, latest.timestamp);
        setAlerts(alertList);
      }
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchLatestAlert, 10000); // every 10s
    fetchLatestAlert(); // immediate first call
    return () => clearInterval(interval);
  }, []);

  const clearAlert = () => setAlert(null);

  return (
    <section className="alert-section">
      <div className="alert-header">
        <h2>Security Alerts</h2>
        <p>Real-time notifications and alert management</p>
      </div>

      <div className="alert-system">
        <h3>Alert Management</h3>
        <p>View, manage and verify security alerts from suspicious activity detection</p>

        <div className="alert-actions">
          <button onClick={() => navigate("/alert-history")} className="action-btn">View History</button>
          <button onClick={clearAlert} className="action-btn">Clear Alert</button>
          <button onClick={() => navigate("/settings")} className="action-btn">Alert Settings</button>
        </div>
      </div>

      {alert && (
        <div className="alert-notification">
          <div className="alert-indicator"></div>
          <p>{alert}</p>
        </div>
      )}
    </section>
  );
}

export default AlertSection;
